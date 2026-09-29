const express = require('express');
const router = express.Router();
const db = require('../db/db');
const stations = require('../config/stations');

// GET /api/map - stations, expedition points, geolocated items, with live weather
router.get('/', async (req, res, next) => {
  try {
    // Get station weather from cache or fetch live
    const stationData = [];
    for (const station of stations) {
      const cacheKey = `weather_${station.id}`;
      const cached = db.prepare('SELECT payload, fetched_at FROM live_cache WHERE key = ?').get(cacheKey);
      
      let weather = null;
      let stale = false;
      
      if (cached) {
        const age = Date.now() - new Date(cached.fetched_at).getTime();
        if (age < 30 * 60 * 1000) { // 30 min TTL
          weather = JSON.parse(cached.payload);
        } else {
          weather = JSON.parse(cached.payload);
          stale = true;
        }
      }
      
      // Fetch fresh weather if needed
      if (!weather || stale) {
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
          console.warn(`[Map] Failed to fetch weather for ${station.name}:`, e.message);
        }
      }
      
      stationData.push({
        ...station,
        type: 'station',
        weather,
        stale
      });
    }
    
    // Get geolocated items
    const geoItems = db.prepare(
      `SELECT id, type, title, lat, lon, region, thumbnail_url FROM items WHERE lat IS NOT NULL AND lon IS NOT NULL LIMIT 100`
    ).all();
    
    // Get expedition points
    const expeditionPoints = db.prepare(
      `SELECT id, name, lat, lon, region, status FROM expeditions WHERE lat IS NOT NULL AND lon IS NOT NULL`
    ).all();
    
    const expeditionData = [];
    for (const exp of expeditionPoints) {
      if (exp.status !== 'Active' && exp.status !== 'Completed') {
        expeditionData.push({ ...exp, type: 'expedition' });
        continue;
      }
      
      const cacheKey = `weather_exp_${exp.id}`;
      const cached = db.prepare('SELECT payload, fetched_at FROM live_cache WHERE key = ?').get(cacheKey);
      
      let weather = null;
      let stale = false;
      
      if (cached) {
        const age = Date.now() - new Date(cached.fetched_at).getTime();
        if (age < 30 * 60 * 1000) {
          weather = JSON.parse(cached.payload);
        } else {
          weather = JSON.parse(cached.payload);
          stale = true;
        }
      }
      
      if (!weather || stale) {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${exp.lat}&longitude=${exp.lon}&current=temperature_2m,wind_speed_10m,surface_pressure,snowfall&timezone=auto`;
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
          console.warn(`[Map] Failed to fetch weather for ${exp.name}:`, e.message);
        }
      }
      
      expeditionData.push({
        ...exp,
        type: 'expedition',
        weather,
        stale
      });
    }
    
    res.json({
      stations: stationData,
      items: geoItems.map(i => ({ ...i, type: 'item', itemType: i.type })),
      expeditions: expeditionData
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
