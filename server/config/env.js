require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 5000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  GEMINI_EMBED_MODEL: process.env.GEMINI_EMBED_MODEL || 'text-embedding-004',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-polaris-key',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@ncpor.res.in',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123',
  OPENALEX_MAILTO: process.env.OPENALEX_MAILTO || 'research@ncpor.res.in',
  NCPOR_YT_CHANNEL_ID: process.env.NCPOR_YT_CHANNEL_ID || 'UCXwYlFm-p-l5c48RjP9Xk1Q', // Placeholder
  RSS_FEEDS: (process.env.RSS_FEEDS || '').split(',').filter(Boolean),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
