const db = require('./server/db/db');
db.prepare('DELETE FROM items_fts').run();
db.prepare(`INSERT INTO items_fts(rowid, title, abstract, summary, authors, tags)
  SELECT id, title, COALESCE(abstract,''), COALESCE(summary,''), COALESCE(authors,''), COALESCE(region,'') || ' ' || COALESCE(discipline,'')
  FROM items`).run();
console.log('Rebuilt FTS table');
