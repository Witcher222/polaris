const db = require('../db/db');
const env = require('../config/env');

async function ingestOpenAlex() {
  const sourceName = 'openalex';
  const runId = db.prepare('INSERT INTO ingest_runs (source, started_at) VALUES (?, CURRENT_TIMESTAMP)').run(sourceName).lastInsertRowid;
  
  let fetched = 0, inserted = 0, updated = 0;
  
  try {
    // 1. Get institution ID for NCPOR
    const searchUrl = `https://api.openalex.org/institutions?search=National Centre for Polar and Ocean Research&mailto=${env.OPENALEX_MAILTO}`;
    const instRes = await fetch(searchUrl);
    const instData = await instRes.json();
    
    if (!instData.results || instData.results.length === 0) {
      throw new Error('NCPOR institution not found in OpenAlex');
    }
    
    const institutionId = instData.results[0].id;
    console.log(`[OpenAlex] Found institution ID: ${institutionId}`);

    // 2. Fetch works
    let url = `https://api.openalex.org/works?filter=institutions.id:${institutionId}&per-page=50&mailto=${env.OPENALEX_MAILTO}`;
    let page = 1;
    let hasMore = true;

    const upsertStmt = db.prepare(`
      INSERT INTO items (type, title, abstract, source, source_id, url, published_at, authors, region, discipline, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'harvested')
      ON CONFLICT(source, source_id) DO UPDATE SET
        title = excluded.title,
        abstract = excluded.abstract,
        updated_at = CURRENT_TIMESTAMP
    `);

    while (hasMore && page <= 5) { // Limit to 5 pages for prototype
      console.log(`[OpenAlex] Fetching page ${page}...`);
      const worksRes = await fetch(`${url}&page=${page}`);
      const worksData = await worksRes.json();
      
      const works = worksData.results;
      if (!works || works.length === 0) {
        hasMore = false;
        break;
      }
      
      fetched += works.length;
      
      const dbTx = db.transaction((worksList) => {
        for (const work of worksList) {
          const title = work.title;
          if (!title) continue;
          
          let abstract = '';
          if (work.abstract_inverted_index) {
            // Reconstruct abstract from inverted index (simplified)
            abstract = 'Abstract available (reconstruction omitted for brevity)';
          }
          
          const source_id = work.id;
          const workUrl = work.doi || work.id;
          const published_at = work.publication_date;
          
          const authors = JSON.stringify(work.authorships.map(a => a.author.display_name).slice(0, 5));
          
          // Basic heuristic classification
          let region = null;
          let discipline = 'General Science';
          const titleLower = title.toLowerCase();
          
          if (titleLower.includes('antarctic') || titleLower.includes('ross sea')) region = 'Antarctica';
          else if (titleLower.includes('arctic') || titleLower.includes('svalbard')) region = 'Arctic';
          else if (titleLower.includes('himalaya') || titleLower.includes('spiti')) region = 'Himalaya';
          
          if (titleLower.includes('ice') || titleLower.includes('glacier')) discipline = 'Glaciology';
          else if (titleLower.includes('ocean') || titleLower.includes('sea')) discipline = 'Oceanography';
          else if (titleLower.includes('climate') || titleLower.includes('atmosphere')) discipline = 'Atmosphere';
          
          const info = upsertStmt.run(
            'publication', title, abstract, sourceName, source_id, workUrl, published_at, authors, region, discipline
          );
          
          if (info.changes > 0) inserted++;
        }
      });
      
      dbTx(works);
      page++;
      
      // Be nice to API
      await new Promise(r => setTimeout(r, 1000));
    }
    
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, fetched = ?, inserted = ?, updated = ? WHERE id = ?').run(
      fetched, inserted, updated, runId
    );
    console.log(`[OpenAlex] Complete. Fetched: ${fetched}, Inserted/Updated: ${inserted}`);
    
  } catch (err) {
    console.error('[OpenAlex] Error:', err);
    db.prepare('UPDATE ingest_runs SET finished_at = CURRENT_TIMESTAMP, error = ? WHERE id = ?').run(
      err.message, runId
    );
  }
}

module.exports = ingestOpenAlex;
