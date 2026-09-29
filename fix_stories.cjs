const db = require('./server/db/db');
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/story1/800/600' WHERE type = 'story' AND source_id = 'story1'").run();
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/story2/800/600' WHERE type = 'story' AND source_id = 'story2'").run();
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/story3/800/600' WHERE type = 'story' AND source_id = 'story3'").run();
console.log('Stories updated with reliable images');
