const express = require('express');
const router = express.Router();
const db = require('../db/db');
const env = require('../config/env');

// POST /api/ask
router.post('/', async (req, res, next) => {
  try {
    const { query, language = 'en' } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });
    
    // Retrieve relevant chunks from DB (keyword-based for now)
    const words = query.split(/\s+/).filter(w => w.length > 3);
    let chunks = [];
    
    if (words.length > 0) {
      const likeConditions = words.map(() => `c.text LIKE ?`).join(' OR ');
      const likeParams = words.map(w => `%${w}%`);
      
      chunks = db.prepare(
        `SELECT c.id, c.text, c.item_id, i.title, i.url FROM chunks c 
         JOIN items i ON c.item_id = i.id 
         WHERE ${likeConditions} 
         LIMIT 5`
      ).all(...likeParams);
    }
    
    // Also search items directly for context
    const relevantItems = db.prepare(
      `SELECT id, title, abstract, url, type FROM items 
       WHERE title LIKE ? OR abstract LIKE ? 
       ORDER BY published_at DESC LIMIT 5`
    ).all(`%${query}%`, `%${query}%`);
    
    if (chunks.length === 0 && relevantItems.length === 0) {
      return res.json({
        answer: language === 'hi' 
          ? 'यह विषय अभी हमारे संग्रह में शामिल नहीं है। कृपया अन्य प्रश्न पूछें।'
          : "This topic isn't covered in the archive yet. Try searching for Antarctic research, sea ice, glaciology, or other polar science topics.",
        citations: [],
        grounded: false,
        suggestions: relevantItems.slice(0, 3).map(i => ({ id: i.id, title: i.title, type: i.type }))
      });
    }
    
    // Build context from chunks and items
    const contextParts = [];
    const citations = [];
    
    for (const chunk of chunks) {
      contextParts.push(`[Source: ${chunk.title}]\n${chunk.text}`);
      if (!citations.find(c => c.itemId === chunk.item_id)) {
        citations.push({ itemId: chunk.item_id, title: chunk.title, url: chunk.url, snippet: chunk.text.substring(0, 200) });
      }
    }
    for (const item of relevantItems) {
      if (!citations.find(c => c.itemId === item.id)) {
        contextParts.push(`[Source: ${item.title}]\n${item.abstract || ''}`);
        citations.push({ itemId: item.id, title: item.title, url: item.url, snippet: (item.abstract || '').substring(0, 200) });
      }
    }
    
    if (!env.GEMINI_API_KEY) {
      // No Gemini key - return context directly
      return res.json({
        answer: `Based on the archive, here are the most relevant sources for your query "${query}":\n\n` +
          citations.map((c, i) => `${i+1}. **${c.title}**\n${c.snippet}...`).join('\n\n'),
        citations,
        grounded: true
      });
    }
    
    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      
      const langInstruction = language === 'hi' ? 'Respond in Hindi (Devanagari script).' : 'Respond in English.';
      
      const prompt = `You are a research assistant for NCPOR's polar science archive. Answer the user's question based ONLY on the context provided below. ${langInstruction}

RULES:
- Use ONLY the information from the provided context
- Cite sources by their title
- If the context doesn't contain enough information, say so
- Never invent facts, numbers, or references

USER QUESTION: ${query}

CONTEXT:
${contextParts.join('\n\n---\n\n')}`;
      
      const response = await ai.models.generateContent({
        model: env.GEMINI_MODEL,
        contents: prompt,
      });
      
      const answer = response.text || response.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response.';
      
      res.json({ answer, citations, grounded: true });
    } catch (aiErr) {
      console.error('[Ask] Gemini error:', aiErr.message);
      res.json({
        answer: `Based on the archive, here are the most relevant sources:\n\n` +
          citations.map((c, i) => `${i+1}. **${c.title}**\n${c.snippet}...`).join('\n\n'),
        citations,
        grounded: true,
        warning: 'AI unavailable, showing raw citations'
      });
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
