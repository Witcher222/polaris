const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/expeditions
router.get('/', (req, res, next) => {
  try {
    const expeditions = db.prepare('SELECT * FROM expeditions ORDER BY start_date DESC').all();
    res.json({ expeditions });
  } catch (err) {
    next(err);
  }
});

// GET /api/expeditions/:id
router.get('/:id', (req, res, next) => {
  try {
    const exp = db.prepare('SELECT * FROM expeditions WHERE id = ?').get(req.params.id);
    if (!exp) return res.status(404).json({ error: 'Expedition not found' });
    
    const items = db.prepare(
      `SELECT i.* FROM items i JOIN expedition_items ei ON i.id = ei.item_id WHERE ei.expedition_id = ?`
    ).all(req.params.id);
    
    res.json({ ...exp, items });
  } catch (err) {
    next(err);
  }
});

// POST /api/expeditions (admin)
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

router.post('/', requireAuth, requireRole(['admin']), (req, res, next) => {
  try {
    const { name, region, status, start_date, end_date, vessel_or_station, summary, lat, lon } = req.body;
    const result = db.prepare(
      `INSERT INTO expeditions (name, region, status, start_date, end_date, vessel_or_station, summary, lat, lon) VALUES (?,?,?,?,?,?,?,?,?)`
    ).run(name, region, status, start_date, end_date, vessel_or_station, summary, lat, lon);
    res.json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
