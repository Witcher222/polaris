const db = require('../db/db');

async function ingestWikimediaCommons() {
  const sourceName = 'wikimedia_commons';
  const runId = db.prepare('INSERT INTO ingest_runs (source, started_at) VALUES (?, CURRENT_TIMESTAMP)').run(sourceName).lastInsertRowid;
  
  let fetched = 0, inserted = 0;
  
  try {
    const queries = ['Antarctica landscape', 'Arctic glacier', 'Antarctic research station', 'Polar wildlife penguin', 'Sea ice formation'];
    
    const upsertStmt = db.prepare(`
      INSERT INTO items (type, title, abstract, source, source_id, url, thumbnail_url, published_at, licence, credit, region, discipline, status)
      VALUES ('photo', ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?, 'harvested')
      ON CONFLICT(source, source_id) DO UPDATE SET
        title = excluded.title,
        thumbnail_url = excluded.thumbnail_url,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    for (const q of queries) {
      console.log(`[Wikimedia] Searching: "${q}"...`);
      const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=${encodeURIComponent(q)}&gsrlimit=10&prop=imageinfo&iiprop=url|extmetadata|mime&iiurlwidth=800&format=json&origin=*`;
      
      const res = await fetch(url);
      if (!res.ok) {
        console.warn(`[Wikimedia] API returned ${res.status} for query "${q}", skipping`);
        continue;
      }
      const data = await res.json();
      
      if (!data.query || !data.query.pages) continue;
      
      const pages = Object.values(data.query.pages);
      fetched += pages.length;
      
      const dbTx = db.transaction((pagesList) => {
        for (const page of pagesList) {
          if (!page.imageinfo || !page.imageinfo[0]) continue;
          const info = page.imageinfo[0];
          
          // Only accept images with clear open licence
          const extmeta = info.extmetadata || {};
          const licenceShort = extmeta.LicenseShortName ? extmeta.LicenseShortName.value : null;
          if (!licenceShort || (!licenceShort.includes('CC') && !licenceShort.includes('Public domain'))) continue;
          
          const title = page.title.replace('File:', '').replace(/\.[^.]+$/, '');
          const credit = extmeta.Artist ? extmeta.Artist.value.replace(/<[^>]+>/g, '').trim().substring(0, 200) : 'Wikimedia Commons';
          const abstract = extmeta.ImageDescription ? extmeta.ImageDescription.value.replace(/<[^>]+>/g, '').trim().substring(0, 500) : '';
          const source_id = page.pageid.toString();
          const itemUrl = info.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(page.title)}`;
          const thumbnail_url = info.thumburl || info.url;
          
          // Classify
          const titleLower = title.toLowerCase();
          let region = null;
          if (titleLower.includes('antarctic') || titleLower.includes('south pole')) region = 'Antarctica';
          else if (titleLower.includes('arctic') || titleLower.includes('svalbard')) region = 'Arctic';
          
          let discipline = 'General Science';
          if (titleLower.includes('glacier') || titleLower.includes('ice')) discipline = 'Glaciology';
          else if (titleLower.includes('penguin') || titleLower.includes('seal') || titleLower.includes('wildlife')) discipline = 'Biology';
          
          const r = upsertStmt.run(
            title, abstract, sourceName, source_id, itemUrl, thumbnail_url, licenceShort, credit, region, discipline
          );
          
          if (r.changes > 0) inserted++;
        }
      });
      
      dbTx(pages);
      await new Promise(r => setTimeout(r, 500));
    }
    
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, fetched = ?, inserted = ? WHERE id = ?').run(
      fetched, inserted, runId
    );
    console.log(`[Wikimedia] Complete. Fetched: ${fetched}, Inserted: ${inserted}`);
    
  } catch (err) {
    console.error('[Wikimedia] Error:', err.message);
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?').run(
      err.message, runId
    );
  }
}

module.exports = ingestWikimediaCommons;
