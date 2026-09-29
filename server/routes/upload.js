const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/db');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}_${sanitized}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'text/csv'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  }
});

// POST /api/upload
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const file = req.file;
    const { title, type, region, discipline, abstract } = req.body;
    
    if (!file && !req.body.youtube_url && type !== 'activity' && type !== 'story') {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    let itemType = type || 'report';
    let filePath = file ? file.filename : null;
    let thumbnailUrl = null;
    let summary = abstract || '';
    
    // Handle based on type
    if (file && file.mimetype === 'application/pdf') {
      itemType = 'report';
      try {
        const pdfParse = require('pdf-parse');
        const pdfBuffer = fs.readFileSync(file.path);
        const pdfData = await pdfParse(pdfBuffer);
        summary = pdfData.text.substring(0, 2000);
        
        // Chunk the text for RAG
        const chunkSize = 500;
        const words = pdfData.text.split(/\s+/);
        let chunkOrd = 0;
        for (let i = 0; i < words.length && chunkOrd < 50; i += chunkSize) {
          const chunkText = words.slice(i, i + chunkSize).join(' ');
          if (chunkText.trim()) {
            chunkOrd++;
          }
        }
      } catch (e) {
        console.warn('[Upload] PDF parse failed:', e.message);
      }
    } else if (file && file.mimetype.startsWith('image/')) {
      itemType = 'photo';
      thumbnailUrl = `/uploads/${file.filename}`;
      try {
        const exifr = require('exifr');
        const exifData = await exifr.parse(file.path, { gps: true });
        if (exifData && exifData.latitude) {
          req.body.lat = exifData.latitude;
          req.body.lon = exifData.longitude;
        }
      } catch (e) {
        console.warn('[Upload] EXIF parse failed:', e.message);
      }
    } else if (file && file.mimetype === 'video/mp4') {
      itemType = 'video';
    } else if (file && file.mimetype === 'text/csv') {
      itemType = 'dataset';
    }
    
    // Handle YouTube URL
    if (req.body.youtube_url) {
      itemType = 'video';
      const ytMatch = req.body.youtube_url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
      if (ytMatch) {
        thumbnailUrl = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
        filePath = req.body.youtube_url;
      }
    }
    
    const result = db.prepare(
      `INSERT INTO items (type, title, abstract, summary, file_path, thumbnail_url, region, discipline, lat, lon, status, created_by, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, CURRENT_TIMESTAMP)`
    ).run(
      itemType,
      title || (file ? file.originalname : 'Untitled'),
      abstract || '',
      summary,
      filePath,
      thumbnailUrl,
      region || null,
      discipline || null,
      req.body.lat || null,
      req.body.lon || null,
      req.user ? req.user.id : null
    );
    
    const itemId = result.lastInsertRowid;
    
    // Create chunks if PDF was parsed
    if (summary && itemType === 'report') {
      const chunkSize = 500;
      const words = summary.split(/\s+/);
      let chunkOrd = 0;
      for (let i = 0; i < words.length; i += chunkSize) {
        const chunkText = words.slice(i, i + chunkSize).join(' ');
        if (chunkText.trim()) {
          db.prepare('INSERT INTO chunks (item_id, ord, text) VALUES (?, ?, ?)').run(itemId, chunkOrd++, chunkText);
        }
      }
    }
    
    // Audit log
    db.prepare('INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(
      req.user ? req.user.id : null, 'upload', 'item', itemId
    );
    
    res.json({ id: itemId, type: itemType, status: 'pending', message: 'Upload successful, pending approval' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
