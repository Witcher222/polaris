const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const db = require('./db/db');
const errorHandler = require('./middleware/error');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later.'
});
app.use('/api', apiLimiter);

// Seed admin user on startup
const bcrypt = require('bcryptjs');
const adminCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (adminCount.count === 0 && env.ADMIN_EMAIL && env.ADMIN_PASSWORD) {
  const hash = bcrypt.hashSync(env.ADMIN_PASSWORD, 10);
  db.prepare('INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    env.ADMIN_EMAIL, hash, 'Admin', 'admin'
  );
  console.log('Seeded default admin user');
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/items', require('./routes/items'));
app.use('/api/search', require('./routes/search'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/studio', require('./routes/studio'));
app.use('/api/pulse', require('./routes/pulse'));
app.use('/api/map', require('./routes/map'));
app.use('/api/approvals', require('./routes/approvals'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/expeditions', require('./routes/expeditions'));
app.use('/api/ask', require('./routes/ask'));
app.use('/api/analytics', require('./routes/analytics'));

// Admin ingestion endpoints
const requireAuth = require('./middleware/auth');
const requireRole = require('./middleware/rbac');
const { runAll, runSingle } = require('./ingest/run');

app.post('/api/admin/ingest/all', requireAuth, requireRole(['admin']), async (req, res) => {
  res.json({ message: 'Ingestion started in background' });
  runAll().catch(console.error);
});

app.post('/api/admin/ingest/:source', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    await runSingle(req.params.source);
    res.json({ message: `Ingestion for ${req.params.source} completed` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RSS Feed endpoint
app.get('/feed/rss.xml', (req, res) => {
  const items = db.prepare(
    `SELECT id, title, abstract, url, published_at, type FROM items WHERE status = 'published' OR status = 'approved' OR status = 'harvested' ORDER BY published_at DESC LIMIT 50`
  ).all();
  
  const rssItems = items.map(i => `
    <item>
      <title><![CDATA[${i.title}]]></title>
      <link>${i.url || `http://localhost:5173/item/${i.id}`}</link>
      <description><![CDATA[${(i.abstract || '').substring(0, 500)}]]></description>
      <pubDate>${i.published_at ? new Date(i.published_at).toUTCString() : ''}</pubDate>
      <category>${i.type}</category>
    </item>`).join('');
  
  res.type('application/rss+xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>POLARIS - Polar Science Knowledge Repository</title>
    <link>http://localhost:5173</link>
    <description>Latest polar science content from NCPOR</description>
    ${rssItems}
  </channel>
</rss>`);
});

// JSON Feed
app.get('/feed/items.json', (req, res) => {
  const items = db.prepare(
    `SELECT id, type, title, abstract, url, published_at, region, discipline, thumbnail_url 
     FROM items WHERE status IN ('published','approved','harvested') ORDER BY published_at DESC LIMIT 50`
  ).all();
  res.json({ items });
});

// Run initial ingestion if DB is empty
const itemCount = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
if (itemCount === 0) {
  console.log('Database is empty, starting initial ingestion...');
  runAll().catch(console.error);
}

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`POLARIS Server running on http://localhost:${env.PORT}`);
});
