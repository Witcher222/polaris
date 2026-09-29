const express = require('express');
const router = express.Router();
const db = require('../db/db');

// GET /api/analytics
router.get('/', (req, res, next) => {
  try {
    // Items by type over time
    const itemsByType = db.prepare(
      `SELECT type, strftime('%Y-%m', published_at) as month, COUNT(*) as count 
       FROM items WHERE published_at IS NOT NULL 
       GROUP BY type, month ORDER BY month`
    ).all();
    
    // Top viewed items
    const topViewed = db.prepare(
      `SELECT i.id, i.title, i.type, COUNT(v.item_id) as view_count 
       FROM views v JOIN items i ON v.item_id = i.id 
       GROUP BY v.item_id ORDER BY view_count DESC LIMIT 10`
    ).all();
    
    // Ingestion health
    const ingestHealth = db.prepare(
      `SELECT source, MAX(finished_at) as last_run, SUM(fetched) as total_fetched, SUM(inserted) as total_inserted, 
       SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) as error_count
       FROM ingest_runs GROUP BY source`
    ).all();
    
    // Metadata gaps
    const missingRegion = db.prepare("SELECT COUNT(*) as count FROM items WHERE region IS NULL").get().count;
    const missingLicence = db.prepare("SELECT COUNT(*) as count FROM items WHERE licence IS NULL").get().count;
    
    // Draft funnel
    const draftCounts = db.prepare(
      `SELECT status, COUNT(*) as count FROM content_drafts GROUP BY status`
    ).all();
    
    // Items by region
    const byRegion = db.prepare(
      `SELECT region, COUNT(*) as count FROM items WHERE region IS NOT NULL GROUP BY region ORDER BY count DESC`
    ).all();
    
    // Items by discipline
    const byDiscipline = db.prepare(
      `SELECT discipline, COUNT(*) as count FROM items WHERE discipline IS NOT NULL GROUP BY discipline ORDER BY count DESC`
    ).all();
    
    // Monthly growth
    const monthlyGrowth = db.prepare(
      `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count 
       FROM items GROUP BY month ORDER BY month DESC LIMIT 12`
    ).all().reverse();
    
    res.json({
      itemsByType,
      topViewed,
      ingestHealth,
      metadataGaps: { missingRegion, missingLicence },
      draftFunnel: draftCounts,
      byRegion,
      byDiscipline,
      monthlyGrowth
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
