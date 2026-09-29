const express = require('express');
const router = express.Router();
const db = require('../db/db');
const env = require('../config/env');
const requireAuth = require('../middleware/auth');

// POST /api/studio/generate
router.post('/generate', async (req, res, next) => {
  try {
    const { itemId, channels = ['website'], language = 'en', readingLevel = 'public' } = req.body;
    
    if (!itemId) return res.status(400).json({ error: 'itemId is required' });
    
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    const results = {};
    
    if (!env.GEMINI_API_KEY) {
      // Fallback without Gemini - generate template content
      for (const channel of channels) {
        const body = generateTemplate(item, channel, language, readingLevel);
        const draftId = db.prepare(
          `INSERT INTO content_drafts (item_id, channel, language, reading_level, body, status, created_by) VALUES (?, ?, ?, ?, ?, 'draft', ?)`
        ).run(item.id, channel, language, readingLevel, body, req.user ? req.user.id : null).lastInsertRowid;
        
        results[channel] = { draftId, body };
      }
      return res.json({ results, source: 'template' });
    }
    
    // Use Gemini for generation
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      
      for (const channel of channels) {
        const prompt = buildPrompt(item, channel, language, readingLevel);
        
        const response = await ai.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: prompt,
        });
        
        const body = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || '';
        
        const draftId = db.prepare(
          `INSERT INTO content_drafts (item_id, channel, language, reading_level, body, status, created_by) VALUES (?, ?, ?, ?, ?, 'draft', ?)`
        ).run(item.id, channel, language, readingLevel, body, req.user ? req.user.id : null).lastInsertRowid;
        
        results[channel] = { draftId, body };
        
        // Rate limit
        await new Promise(r => setTimeout(r, 1000));
      }
      
      res.json({ results, source: 'gemini' });
    } catch (aiErr) {
      console.error('[Studio] Gemini error:', aiErr.message);
      // Fallback to templates
      for (const channel of channels) {
        const body = generateTemplate(item, channel, language, readingLevel);
        const draftId = db.prepare(
          `INSERT INTO content_drafts (item_id, channel, language, reading_level, body, status, created_by) VALUES (?, ?, ?, ?, ?, 'draft', ?)`
        ).run(item.id, channel, language, readingLevel, body, req.user ? req.user.id : null).lastInsertRowid;
        results[channel] = { draftId, body };
      }
      res.json({ results, source: 'template', warning: 'AI unavailable, used template' });
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/studio/drafts
router.get('/drafts', requireAuth, (req, res, next) => {
  try {
    const { status } = req.query;
    let sql = `SELECT cd.*, i.title as item_title FROM content_drafts cd LEFT JOIN items i ON cd.item_id = i.id`;
    const params = [];
    if (status) {
      sql += ` WHERE cd.status = ?`;
      params.push(status);
    }
    sql += ` ORDER BY cd.created_at DESC`;
    const drafts = db.prepare(sql).all(...params);
    res.json({ drafts });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/studio/drafts/:id
router.patch('/drafts/:id', requireAuth, (req, res, next) => {
  try {
    const { body, hashtags } = req.body;
    db.prepare('UPDATE content_drafts SET body = ?, hashtags = ? WHERE id = ?').run(body, hashtags || null, req.params.id);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/studio/drafts/:id/submit
router.post('/drafts/:id/submit', requireAuth, (req, res, next) => {
  try {
    db.prepare("UPDATE content_drafts SET status = 'pending' WHERE id = ?").run(req.params.id);
    db.prepare('INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(
      req.user.id, 'submit_for_review', 'draft', req.params.id
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

function buildPrompt(item, channel, language, readingLevel) {
  const authors = item.authors ? JSON.parse(item.authors) : [];
  const langInstruction = language === 'hi' ? 'Write the response in Hindi (Devanagari script).' : 'Write the response in English.';
  let levelInstruction = '';
  if (readingLevel === 'expert') levelInstruction = 'Use academic/scientific language suitable for researchers.';
  else if (readingLevel === 'class8') levelInstruction = 'Use simple language suitable for a Class 8 student (age 13-14). Explain technical terms.';
  else levelInstruction = 'Use clear language accessible to the general public.';
  
  let channelInstruction = '';
  switch (channel) {
    case 'twitter': channelInstruction = 'Write a Twitter/X thread (3-5 tweets, each max 280 chars). Use relevant hashtags.'; break;
    case 'instagram': channelInstruction = 'Write an Instagram caption (engaging, with emojis and hashtags).'; break;
    case 'linkedin': channelInstruction = 'Write a professional LinkedIn post.'; break;
    case 'press': channelInstruction = 'Write a press-release draft (headline, dateline, body, quote).'; break;
    case 'school': channelInstruction = 'Write a school-level explainer article (3-4 paragraphs, with "Did you know?" facts).'; break;
    default: channelInstruction = 'Write a website article blurb (2-3 paragraphs).'; break;
  }
  
  return `You are a science communicator for NCPOR (National Centre for Polar and Ocean Research), India.

Based ONLY on the following source material, ${channelInstruction}

${langInstruction}
${levelInstruction}

RULES:
- Use ONLY facts from the source material below. Do NOT invent any numbers, quotes, or names.
- Include the source citation: "${item.url || item.title}"
- If the source mentions a licence or credit, include it.

SOURCE MATERIAL:
Title: ${item.title}
Authors: ${authors.join(', ')}
Abstract: ${item.abstract || 'N/A'}
Summary: ${item.summary || 'N/A'}
Region: ${item.region || 'N/A'}
Discipline: ${item.discipline || 'N/A'}
Published: ${item.published_at || 'N/A'}`;
}

function generateTemplate(item, channel, language, readingLevel) {
  const authors = item.authors ? JSON.parse(item.authors) : [];
  const authorStr = authors.length > 0 ? authors.join(', ') : 'NCPOR Research Team';
  
  switch (channel) {
    case 'twitter':
      return `🧊 New Research: ${item.title}\n\nBy ${authorStr}\n\n${item.abstract ? item.abstract.substring(0, 200) + '...' : ''}\n\nRead more: ${item.url || ''}\n\n#PolarScience #NCPOR #Research`;
    case 'instagram':
      return `🌊❄️ ${item.title}\n\n${item.abstract ? item.abstract.substring(0, 300) : 'Exciting new findings from polar research!'}\n\nResearch by: ${authorStr}\n\n#PolarScience #NCPOR #Antarctica #Arctic #ClimateResearch #Science`;
    case 'linkedin':
      return `Sharing an important contribution to polar science:\n\n"${item.title}"\nby ${authorStr}\n\n${item.abstract ? item.abstract.substring(0, 400) : ''}\n\nSource: ${item.url || ''}\n\n#PolarResearch #NCPOR #Science`;
    case 'press':
      return `PRESS RELEASE\n\nNCPOR Research Update: ${item.title}\n\nGoa, India - The National Centre for Polar and Ocean Research (NCPOR) highlights research by ${authorStr}.\n\n${item.abstract || ''}\n\nFor more information, visit: ${item.url || 'ncpor.res.in'}`;
    default:
      return `${item.title}\n\n${item.abstract || 'Research from NCPOR contributing to polar science understanding.'}\n\nAuthors: ${authorStr}\nSource: ${item.url || ''}`;
  }
}

module.exports = router;
