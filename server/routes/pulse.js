const express = require('express');
const router = express.Router();
const db = require('../db/db');
const stations = require('../config/stations');

// GET /api/pulse - Live sea-ice, station weather, latest items
router.get('/', async (req, res, next) => {
  try {
    // Station weather
    const stationWeather = [];
    for (const station of stations) {
      const cacheKey = `weather_${station.id}`;
      const cached = db.prepare('SELECT payload, fetched_at FROM live_cache WHERE key = ?').get(cacheKey);
      
      let weather = null;
      let stale = false;
      
      if (cached) {
        const age = Date.now() - new Date(cached.fetched_at).getTime();
        weather = JSON.parse(cached.payload);
        stale = age > 30 * 60 * 1000;
      }
      
      if (!weather) {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,wind_speed_10m,surface_pressure,snowfall&timezone=auto`;
          const r = await fetch(url);
          if (r.ok) {
            const data = await r.json();
            weather = data.current;
            db.prepare(
              `INSERT INTO live_cache (key, payload, fetched_at) VALUES (?, ?, CURRENT_TIMESTAMP)
               ON CONFLICT(key) DO UPDATE SET payload = excluded.payload, fetched_at = excluded.fetched_at`
            ).run(cacheKey, JSON.stringify(weather));
            stale = false;
          }
        } catch (e) {
          console.warn(`[Pulse] Weather fetch failed for ${station.name}`);
        }
      }
      
      stationWeather.push({ ...station, weather, stale });
    }
    
    // Sea ice data from cache
    const seaIceCache = db.prepare("SELECT payload, fetched_at FROM live_cache WHERE key = 'sea_ice'").get();
    let seaIce = null;
    if (seaIceCache) {
      seaIce = JSON.parse(seaIceCache.payload);
    }
    
    // Latest items across types
    const latestItems = db.prepare(
      `SELECT id, type, title, published_at, region, discipline, thumbnail_url
       FROM items ORDER BY created_at DESC LIMIT 10`
    ).all();
    
    // Counts
    const totalItems = db.prepare('SELECT COUNT(*) as count FROM items').get().count;
    const totalPublications = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'publication'").get().count;
    const totalDatasets = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'dataset'").get().count;
    const totalPhotos = db.prepare("SELECT COUNT(*) as count FROM items WHERE type = 'photo'").get().count;
    
    res.json({
      stations: stationWeather,
      seaIce,
      latestItems,
      stats: { totalItems, totalPublications, totalDatasets, totalPhotos }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
