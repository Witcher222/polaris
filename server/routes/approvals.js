const express = require('express');
const router = express.Router();
const db = require('../db/db');
const requireAuth = require('../middleware/auth');
const requireRole = require('../middleware/rbac');

// GET /api/approvals - pending items and drafts
router.get('/', requireAuth, (req, res, next) => {
  try {
    const pendingItems = db.prepare(
      `SELECT id, type, title, source, status, created_at, created_by FROM items WHERE status = 'pending' ORDER BY created_at DESC`
    ).all();
    
    const pendingDrafts = db.prepare(
      `SELECT cd.*, i.title as item_title FROM content_drafts cd LEFT JOIN items i ON cd.item_id = i.id WHERE cd.status = 'pending' ORDER BY cd.created_at DESC`
    ).all();
    
    res.json({ items: pendingItems, drafts: pendingDrafts });
  } catch (err) {
    next(err);
  }
});

// POST /api/approvals/:type/:id/approve
router.post('/:type/:id/approve', requireAuth, requireRole(['admin', 'editor']), (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body || {};
    
    if (type === 'item') {
      db.prepare("UPDATE items SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    } else if (type === 'draft') {
      db.prepare("UPDATE content_drafts SET status = 'approved', reviewed_by = ?, reason = ? WHERE id = ?").run(req.user.id, reason || null, id);
    } else {
      return res.status(400).json({ error: 'Invalid type. Use "item" or "draft"' });
    }
    
    // Audit log
    db.prepare('INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(
      req.user.id, 'approve', type, id
    );
    
    res.json({ success: true, message: `${type} ${id} approved` });
  } catch (err) {
    next(err);
  }
});

// POST /api/approvals/:type/:id/reject
router.post('/:type/:id/reject', requireAuth, requireRole(['admin', 'editor']), (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body || {};
    
    if (type === 'item') {
      db.prepare("UPDATE items SET status = 'rejected', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);
    } else if (type === 'draft') {
      db.prepare("UPDATE content_drafts SET status = 'rejected', reviewed_by = ?, reason = ? WHERE id = ?").run(req.user.id, reason || null, id);
    } else {
      return res.status(400).json({ error: 'Invalid type' });
    }
    
    db.prepare('INSERT INTO audit_log (user_id, action, entity, entity_id) VALUES (?, ?, ?, ?)').run(
      req.user.id, 'reject', type, id
    );
    
    res.json({ success: true, message: `${type} ${id} rejected` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
