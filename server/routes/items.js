const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/items?type=&region=&discipline=&year=&q=&page=&limit=&sort=
router.get('/', (req, res, next) => {
  try {
    const { type, region, discipline, year, q, page = 1, limit = 20, sort = 'published_at' } = req.query;
    
    let where = ['1=1'];
    let params = [];
    
    if (type) { where.push('i.type = ?'); params.push(type); }
    if (region) { where.push('i.region = ?'); params.push(region); }
    if (discipline) { where.push('i.discipline = ?'); params.push(discipline); }
    if (year) { where.push("strftime('%Y', i.published_at) = ?"); params.push(year); }
    if (q) { where.push("(i.title LIKE ? OR i.abstract LIKE ?)"); params.push(`%${q}%`, `%${q}%`); }
    
    const allowedSort = ['published_at', 'created_at', 'title'];
    const sortCol = allowedSort.includes(sort) ? sort : 'published_at';
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const countSql = `SELECT COUNT(*) as total FROM items i WHERE ${where.join(' AND ')}`;
    const total = db.prepare(countSql).get(...params).total;
    
    const dataSql = `SELECT i.* FROM items i WHERE ${where.join(' AND ')} ORDER BY i.${sortCol} DESC LIMIT ? OFFSET ?`;
    const items = db.prepare(dataSql).all(...params, parseInt(limit), offset);
    
    // Parse JSON fields
    const parsed = items.map(item => ({
      ...item,
      authors: item.authors ? JSON.parse(item.authors) : []
    }));
    
    res.json({ items: parsed, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', (req, res, next) => {
  try {
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    
    // Record view
    db.prepare('INSERT INTO views (item_id) VALUES (?)').run(req.params.id);
    
    item.authors = item.authors ? JSON.parse(item.authors) : [];
    
    // Get related items (same region or discipline)
    const related = db.prepare(
      `SELECT id, type, title, thumbnail_url, region, discipline FROM items 
       WHERE id != ? AND (region = ? OR discipline = ?)
       ORDER BY RANDOM() LIMIT 5`
    ).all(item.id, item.region, item.discipline);
    
    // Get tags
    const tags = db.prepare(
      `SELECT t.name FROM tags t JOIN item_tags it ON t.id = it.tag_id WHERE it.item_id = ?`
    ).all(item.id);
    
    res.json({ ...item, tags: tags.map(t => t.name), related });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
