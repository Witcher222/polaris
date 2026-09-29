const db = require('../db/db');

async function ingestNasaImages() {
  const sourceName = 'nasa_images';
  const runId = db.prepare('INSERT INTO ingest_runs (source, started_at) VALUES (?, CURRENT_TIMESTAMP)').run(sourceName).lastInsertRowid;
  
  let fetched = 0, inserted = 0;
  
  try {
    const queries = ['antarctica', 'arctic ice', 'polar glacier', 'south pole station', 'sea ice extent'];
    
    const upsertStmt = db.prepare(`
      INSERT INTO items (type, title, abstract, source, source_id, url, thumbnail_url, published_at, authors, region, discipline, licence, credit, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'harvested')
      ON CONFLICT(source, source_id) DO UPDATE SET
        title = excluded.title,
        thumbnail_url = excluded.thumbnail_url,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    for (const q of queries) {
      console.log(`[NASA Images] Searching: "${q}"...`);
      const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=20`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[NASA Images] API returned ${res.status} for query "${q}", skipping`);
        continue;
      }
      const data = await res.json();
      
      if (!data.collection || !data.collection.items) continue;
      
      const items = data.collection.items;
      fetched += items.length;
      
      const dbTx = db.transaction((itemsList) => {
        for (const item of itemsList) {
          if (!item.data || !item.data[0]) continue;
          const meta = item.data[0];
          
          const title = meta.title;
          if (!title) continue;
          
          const abstract = (meta.description || '').substring(0, 1000);
          const source_id = meta.nasa_id;
          const itemUrl = `https://images.nasa.gov/details/${meta.nasa_id}`;
          
          // Get thumbnail from links
          let thumbnail_url = null;
          if (item.links && item.links[0]) {
            thumbnail_url = item.links[0].href;
          }
          
          const published_at = meta.date_created;
          const authors = JSON.stringify(meta.photographer ? [meta.photographer] : (meta.center ? [meta.center] : ['NASA']));
          
          // Classify
          const titleLower = title.toLowerCase();
          let region = null;
          if (titleLower.includes('antarctic') || titleLower.includes('south pole')) region = 'Antarctica';
          else if (titleLower.includes('arctic') || titleLower.includes('north pole') || titleLower.includes('svalbard')) region = 'Arctic';
          
          let discipline = 'Remote Sensing';
          if (titleLower.includes('ice') || titleLower.includes('glacier')) discipline = 'Glaciology';
          else if (titleLower.includes('ocean') || titleLower.includes('sea')) discipline = 'Oceanography';
          
          const mediaType = meta.media_type === 'video' ? 'video' : 'photo';
          
          const info = upsertStmt.run(
            mediaType, title, abstract, sourceName, source_id, itemUrl, thumbnail_url, published_at, authors, region, discipline,
            'Public Domain', 'NASA'
          );
          
          if (info.changes > 0) inserted++;
        }
      });
      
      dbTx(items);
      await new Promise(r => setTimeout(r, 500));
    }
    
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, fetched = ?, inserted = ? WHERE id = ?').run(
      fetched, inserted, runId
    );
    console.log(`[NASA Images] Complete. Fetched: ${fetched}, Inserted: ${inserted}`);
    
  } catch (err) {
    console.error('[NASA Images] Error:', err.message);
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?').run(
      err.message, runId
    );
  }
}

module.exports = ingestNasaImages;
