const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

let counter = 1;

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all instances of unsplash images (which we replaced earlier)
  // We'll just replace all of them with unique picsum seeds
  const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9-]+\?q=80&w=\d+&auto=format&fit=crop/g;
  
  let modified = false;
  content = content.replace(regex, (match) => {
    modified = true;
    const isPortrait = match.includes('w=200'); // for publications cover
    const w = isPortrait ? 400 : 800;
    const h = isPortrait ? 600 : 600;
    const url = `https://picsum.photos/seed/polar${counter}/${w}/${h}`;
    counter++;
    return url;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
