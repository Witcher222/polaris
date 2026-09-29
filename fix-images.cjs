const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'routes');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = {
  '1498661705887-3778d9ecb4fb': '1518509562904-e7ef99cdcc86', // Arctic -> Antarctica
  '1549480017-d76466a4b8e8': '1582967788606-a171c1080cb0', // Climate -> Oceanography
  '1520638575082-9a3b9ebbe546': '1583083527882-4bee9aba2eea', // Glaciology -> Marine Biology
  '1536697246787-1f2761cb0ea6': '1464822759023-fed622ff2c3b', // Atmosphere -> Geology
  '1478147424177-3e813f383e74': '1451187580459-43490279c0fa', // Ecosystems -> Remote Sensing
};

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let modified = false;
  for (const [broken, working] of Object.entries(replacements)) {
    if (content.includes(broken)) {
      content = content.split(broken).join(working);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
