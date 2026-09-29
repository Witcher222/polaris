const db = require('./server/db/db');

const newExpeditions = [
  {
    name: 'MOSAiC Expedition',
    region: 'Arctic',
    status: 'Completed',
    start_date: '2019-09-20T00:00:00Z',
    end_date: '2020-10-12T00:00:00Z',
    vessel_or_station: 'RV Polarstern',
    summary: 'The Multidisciplinary drifting Observatory for the Study of Arctic Climate. The RV Polarstern was deliberately frozen into the Arctic sea ice for a full year to study the complex climate system.',
    lat: 85.0,
    lon: 136.0
  },
  {
    name: 'Endurance22',
    region: 'Antarctica',
    status: 'Completed',
    start_date: '2022-02-05T00:00:00Z',
    end_date: '2022-03-20T00:00:00Z',
    vessel_or_station: 'SA Agulhas II',
    summary: 'An expedition that successfully located the wreck of Sir Ernest Shackleton’s ship Endurance, which sank in the Weddell Sea in 1915.',
    lat: -68.95,
    lon: -52.44
  },
  {
    name: 'THOR - Thwaites Glacier Research',
    region: 'Antarctica',
    status: 'Completed',
    start_date: '2019-01-29T00:00:00Z',
    end_date: '2020-03-24T00:00:00Z',
    vessel_or_station: 'RV Nathaniel B. Palmer',
    summary: 'Part of the International Thwaites Glacier Collaboration (ITGC) to study the rapidly retreating Thwaites Glacier and its potential impact on global sea-level rise.',
    lat: -75.0,
    lon: -106.0
  },
  {
    name: 'Tara Polar Station',
    region: 'Arctic',
    status: 'Planning',
    start_date: '2025-08-01T00:00:00Z',
    end_date: '2026-12-31T00:00:00Z',
    vessel_or_station: 'Tara',
    summary: 'An upcoming drift expedition in the Arctic Ocean to study marine ecosystems and climate change using the new Tara Polar Station, designed to withstand extreme ice pressure.',
    lat: 80.0,
    lon: 0.0
  }
];

const insert = db.prepare(`
  INSERT INTO expeditions (name, region, status, start_date, end_date, vessel_or_station, summary, lat, lon)
  VALUES (@name, @region, @status, @start_date, @end_date, @vessel_or_station, @summary, @lat, @lon)
`);

const insertMany = db.transaction((exps) => {
  for (const exp of exps) insert.run(exp);
});

insertMany(newExpeditions);
console.log('Added ' + newExpeditions.length + ' expeditions');
