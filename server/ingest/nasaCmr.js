const db = require('../db/db');

async function ingestNasaCmr() {
  const sourceName = 'nasa_cmr';
  const runId = db.prepare('INSERT INTO ingest_runs (source, started_at) VALUES (?, CURRENT_TIMESTAMP)').run(sourceName).lastInsertRowid;
  
  let fetched = 0, inserted = 0;
  
  try {
    const keywords = ['Antarctica', 'Arctic', 'Sea Ice', 'Polar'];
    
    const upsertStmt = db.prepare(`
      INSERT INTO items (type, title, abstract, source, source_id, url, published_at, region, discipline, status)
      VALUES ('dataset', ?, ?, ?, ?, ?, ?, ?, ?, 'harvested')
      ON CONFLICT(source, source_id) DO UPDATE SET
        title = excluded.title,
        abstract = excluded.abstract,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    for (const kw of keywords) {
      console.log(`[NASA CMR] Searching: "${kw}"...`);
      const url = `https://cmr.earthdata.nasa.gov/search/collections.json?keyword=${encodeURIComponent(kw)}&page_size=15`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[NASA CMR] API returned ${res.status} for "${kw}", skipping`);
        continue;
      }
      const data = await res.json();
      
      if (!data.feed || !data.feed.entry) continue;
      
      const entries = data.feed.entry;
      fetched += entries.length;
      
      const dbTx = db.transaction((entryList) => {
        for (const entry of entryList) {
          const title = entry.title;
          if (!title) continue;
          
          const abstract = (entry.summary || '').substring(0, 1000);
          const source_id = entry.id;
          const itemUrl = entry.links && entry.links[0] ? entry.links[0].href : `https://cmr.earthdata.nasa.gov/search/concepts/${entry.id}`;
          
          const titleLower = title.toLowerCase();
          let region = null;
          if (titleLower.includes('antarctic')) region = 'Antarctica';
          else if (titleLower.includes('arctic')) region = 'Arctic';
          else if (titleLower.includes('polar')) region = 'Polar';
          
          let discipline = 'Remote Sensing';
          if (titleLower.includes('ice')) discipline = 'Glaciology';
          else if (titleLower.includes('ocean')) discipline = 'Oceanography';
          else if (titleLower.includes('atmosphere') || titleLower.includes('ozone')) discipline = 'Atmosphere';
          
          const r = upsertStmt.run(
            title, abstract, sourceName, source_id, itemUrl, entry.time_start || null, region, discipline
          );
          
          if (r.changes > 0) inserted++;
        }
      });
      
      dbTx(entries);
      await new Promise(r => setTimeout(r, 300));
    }
    
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, fetched = ?, inserted = ? WHERE id = ?').run(
      fetched, inserted, runId
    );
    console.log(`[NASA CMR] Complete. Fetched: ${fetched}, Inserted: ${inserted}`);
    
  } catch (err) {
    console.error('[NASA CMR] Error:', err.message);
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?').run(
      err.message, runId
    );
  }
}

module.exports = ingestNasaCmr;
