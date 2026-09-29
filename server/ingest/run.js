const ingestOpenAlex = require('./openalex');
const ingestZenodo = require('./zenodo');
const ingestNasaImages = require('./nasaImages');
const ingestWikimediaCommons = require('./commons');
const ingestNasaCmr = require('./nasaCmr');

const connectors = {
  openalex: ingestOpenAlex,
  zenodo: ingestZenodo,
  nasa_images: ingestNasaImages,
  wikimedia_commons: ingestWikimediaCommons,
  nasa_cmr: ingestNasaCmr,
};

async function runAll() {
  console.log('Starting full ingestion pipeline...');
  for (const [name, fn] of Object.entries(connectors)) {
    try {
      console.log(`\n--- Running ${name} ---`);
      await fn();
    } catch (err) {
      console.error(`[${name}] Fatal error:`, err.message);
    }
  }
  console.log('\nIngestion pipeline completed.');
}

async function runSingle(source) {
  const fn = connectors[source];
  if (!fn) throw new Error(`Unknown source: ${source}`);
  await fn();
}

if (require.main === module) {
  runAll().catch(console.error).finally(() => process.exit(0));
}

module.exports = { runAll, runSingle, connectors };
