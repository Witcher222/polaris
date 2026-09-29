const db = require('../db/db');

async function ingestZenodo() {
  const sourceName = 'zenodo';
  const runId = db.prepare('INSERT INTO ingest_runs (source, started_at) VALUES (?, CURRENT_TIMESTAMP)').run(sourceName).lastInsertRowid;
  
  let fetched = 0, inserted = 0;
  
  try {
    const query = encodeURIComponent('(Antarctica OR Arctic OR "Southern Ocean" OR "Himalaya cryosphere" OR NCPOR)');
    const url = `https://zenodo.org/api/records?q=${query}&size=50`;
    console.log(`[Zenodo] Fetching from ${url}`);
    
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Zenodo API returned ${res.status}`);
    }
    const data = await res.json();
    
    if (data.hits && data.hits.hits) {
      const records = data.hits.hits;
      fetched = records.length;
      
      const upsertStmt = db.prepare(`
        INSERT INTO items (type, title, abstract, source, source_id, url, published_at, authors, region, discipline, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'harvested')
        ON CONFLICT(source, source_id) DO UPDATE SET
          title = excluded.title,
          abstract = excluded.abstract,
          updated_at = CURRENT_TIMESTAMP
      `);
      
      const dbTx = db.transaction((recs) => {
        for (const rec of recs) {
          if (rec.metadata.resource_type && rec.metadata.resource_type.type !== 'dataset') {
            continue; // only keep datasets if possible
          }
          
          const title = rec.metadata.title;
          const abstract = (rec.metadata.description || '').replace(/(<([^>]+)>)/gi, "").substring(0, 500); // Strip basic HTML
          const source_id = rec.id.toString();
          const itemUrl = rec.doi_url || rec.links.html;
          const published_at = rec.metadata.publication_date;
          
          let authors = [];
          if (rec.metadata.creators) {
            authors = rec.metadata.creators.map(c => c.name);
          }
          
          let region = 'Polar';
          let discipline = 'Earth Science';
          
          const titleLower = title.toLowerCase();
          if (titleLower.includes('antarctic')) region = 'Antarctica';
          else if (titleLower.includes('arctic')) region = 'Arctic';
          
          const info = upsertStmt.run(
            'dataset', title, abstract, sourceName, source_id, itemUrl, published_at, JSON.stringify(authors), region, discipline
          );
          
          if (info.changes > 0) inserted++;
        }
      });
      
      dbTx(records);
    }
    
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, fetched = ?, inserted = ? WHERE id = ?').run(
      fetched, inserted, runId
    );
    console.log(`[Zenodo] Complete. Fetched: ${fetched}, Inserted: ${inserted}`);
    
  } catch (err) {
    console.error('[Zenodo] Error:', err);
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?').run(
      err.message, runId
    );
  }
}

module.exports = ingestZenodo;
