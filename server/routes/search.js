const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/search?q=&mode=keyword|semantic|hybrid&page=&limit=
router.get('/', (req, res, next) => {
  try {
    const { q, mode = 'keyword', page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.json({ items: [], total: 0 });
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    // Keyword search using FTS5
    // First try to populate FTS if needed
    try {
      db.prepare(`INSERT INTO items_fts(rowid, title, abstract, summary, authors, tags)
        SELECT id, title, COALESCE(abstract,''), COALESCE(summary,''), COALESCE(authors,''), ''
        FROM items WHERE id NOT IN (SELECT rowid FROM items_fts)`).run();
    } catch (e) {
      // FTS may already be populated, ignore errors
    }
    
    let items, total;
    
    if (mode === 'keyword' || mode === 'hybrid') {
      // FTS5 search
      const ftsQuery = q.split(/\s+/).map(w => `"${w}"`).join(' OR ');
      
      try {
        const countSql = `SELECT COUNT(*) as total FROM items_fts WHERE items_fts MATCH ?`;
        total = db.prepare(countSql).get(ftsQuery).total;
        
        if (total > 0) {
          const dataSql = `SELECT i.*, rank FROM items_fts fts 
            JOIN items i ON i.id = fts.rowid 
            WHERE items_fts MATCH ? 
            ORDER BY rank 
            LIMIT ? OFFSET ?`;
          items = db.prepare(dataSql).all(ftsQuery, parseInt(limit), offset);
        } else {
          // Fallback to LIKE query checking region and discipline as well
          const likeSql = `SELECT * FROM items WHERE title LIKE ? OR abstract LIKE ? OR region LIKE ? OR discipline LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?`;
          items = db.prepare(likeSql).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit), offset);
          total = db.prepare(`SELECT COUNT(*) as total FROM items WHERE title LIKE ? OR abstract LIKE ? OR region LIKE ? OR discipline LIKE ?`).get(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`).total;
        }
      } catch (e) {
        // FTS query failed, fall back to LIKE
        const likeSql = `SELECT * FROM items WHERE title LIKE ? OR abstract LIKE ? OR region LIKE ? OR discipline LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?`;
        items = db.prepare(likeSql).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`, parseInt(limit), offset);
        total = db.prepare(`SELECT COUNT(*) as total FROM items WHERE title LIKE ? OR abstract LIKE ? OR region LIKE ? OR discipline LIKE ?`).get(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`).total;
      }
    } else {
      // Semantic search placeholder (would need embeddings)
      const likeSql = `SELECT * FROM items WHERE title LIKE ? OR abstract LIKE ? ORDER BY published_at DESC LIMIT ? OFFSET ?`;
      items = db.prepare(likeSql).all(`%${q}%`, `%${q}%`, parseInt(limit), offset);
      total = db.prepare(`SELECT COUNT(*) as total FROM items WHERE title LIKE ? OR abstract LIKE ?`).get(`%${q}%`, `%${q}%`).total;
    }
    
    const parsed = items.map(item => ({
      ...item,
      authors: item.authors ? JSON.parse(item.authors) : []
    }));
    
    res.json({ items: parsed, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
