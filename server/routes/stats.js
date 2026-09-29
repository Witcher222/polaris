const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/stats - Real counts from DB
router.get('/', (req, res, next) => {
  try {
    const total = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
    const publications = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'publication'").get().count;
    const datasets = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'dataset'").get().count;
    const photos = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'photo'").get().count;
    const videos = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'video'").get().count;
    const reports = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'report'").get().count;
    const expeditions = db.prepare('SELECT COUNT(*) as count FROM expeditions').get().count;
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    
    const regionCounts = db.prepare(
      `SELECT region, COUNT(*) as count FROM items WHERE region IS NOT NULL GROUP BY region ORDER BY count DESC`
    ).all();
    
    const disciplineCounts = db.prepare(
      `SELECT discipline, COUNT(*) as count FROM items WHERE discipline IS NOT NULL GROUP BY discipline ORDER BY count DESC`
    ).all();
    
    const recentItems = db.prepare(
      `SELECT id, type, title, published_at, region FROM items ORDER BY created_at DESC LIMIT 10`
    ).all();
    
    const ingestRuns = db.prepare(
      `SELECT * FROM ingest_runs ORDER BY started_at DESC LIMIT 10`
    ).all();
    
    res.json({
      total,
      publications,
      datasets,
      photos,
      videos,
      reports,
      expeditions,
      users,
      regionCounts,
      disciplineCounts,
      recentItems,
      ingestRuns
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/facets - Faceted counts for filter UI
router.get('/facets', (req, res, next) => {
  try {
    const types = db.prepare(
      `SELECT type, COUNT(*) as count FROM items GROUP BY type ORDER BY count DESC`
    ).all();
    
    const regions = db.prepare(
      `SELECT region, COUNT(*) as count FROM items WHERE region IS NOT NULL GROUP BY region ORDER BY count DESC`
    ).all();
    
    const disciplines = db.prepare(
      `SELECT discipline, COUNT(*) as count FROM items WHERE discipline IS NOT NULL GROUP BY discipline ORDER BY count DESC`
    ).all();
    
    const years = db.prepare(
      `SELECT strftime('%Y', published_at) as year, COUNT(*) as count 
       FROM items WHERE published_at IS NOT NULL 
       GROUP BY year ORDER BY year DESC`
    ).all();
    
    res.json({ types, regions, disciplines, years });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
