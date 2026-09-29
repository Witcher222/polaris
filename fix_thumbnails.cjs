const db = require('./server/db/db');
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/icesat2/800/600' WHERE title LIKE '%ATLAS/ICESat-2%'").run();
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/antarchitecture/800/600' WHERE title LIKE '%AntArchitecture%'").run();
db.prepare("UPDATE items SET thumbnail_url = 'https://picsum.photos/seed/oceanturbulence/800/600' WHERE title LIKE '%Ocean Turbulence%'").run();
console.log('Done updating items');
