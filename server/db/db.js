const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'polaris.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new Database(dbPath, { verbose: console.log });

// Enable foreign keys and WAL mode for performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema migration on startup
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;
