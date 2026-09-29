const db = require('./server/db/db');

const stories = [
  {
    title: "Wintering at Maitri: The Long Dark",
    abstract: "A personal account of enduring the Antarctic winter night at India's Maitri station.",
    content: "When the sun dipped below the horizon in late May, we knew it wouldn't return for months. Life at Maitri Station during the polar winter is a psychological and physical endurance test. Outside, temperatures plummet to -40°C, and the wind howls like a freight train. Inside, our 25-member team becomes a tightly knit family. We run experiments on human physiology, atmospheric physics, and glaciology. But it's the quiet moments that stick with you: drinking hot chai while watching the Auroras paint the sky in impossible shades of green and purple. You realize just how small you are, yet how vital our work is to understanding global climate shifts.",
    image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?q=80&w=800&auto=format&fit=crop",
    author: "Dr. Sanjay Kumar",
    source: "ncpor_dispatch",
    id: "story1"
  },
  {
    title: "The Ice-Core Time Machine",
    abstract: "How drilling deep into the polar ice shelves reveals Earth's atmospheric history.",
    content: "Imagine holding a piece of ice that was formed before the Roman Empire existed. In glaciology, we don't just study frozen water; we study time. By drilling hundreds of meters into the Antarctic ice sheet, we extract ice cores—cylinders of ice that trap tiny air bubbles from the past. When we melt these cores in our sterilized labs, those bubbles pop, releasing ancient atmospheres. By analyzing the carbon dioxide and methane levels trapped within, we can perfectly reconstruct the Earth's climate hundreds of thousands of years ago. It is the undeniable, empirical proof of how rapidly our modern world is altering the atmosphere.",
    image: "https://images.unsplash.com/photo-1590124803732-c5186b1b47ee?q=80&w=800&auto=format&fit=crop",
    author: "Anika Voss",
    source: "ncpor_dispatch",
    id: "story2"
  },
  {
    title: "Emperor Penguins: Sentinels of the Sea",
    abstract: "Tracking the migration and breeding patterns of Antarctica's most resilient wildlife.",
    content: "To observe the Emperor Penguin is to witness sheer defiance of nature. In the harsh expanse of the Ross Sea, while every other creature flees the impending winter, the Emperors march inland to breed. Using high-resolution satellite telemetry, our marine biology team tracked two colonies over a punishing six-month period. We discovered that shifting sea-ice extents are forcing these majestic birds to travel up to 30% further to forage for krill and fish to feed their chicks. As the sea ice destabilizes, their very way of life is threatened. Understanding their movement isn't just about protecting a species; it's about monitoring the health of the entire Southern Ocean ecosystem.",
    image: "https://images.unsplash.com/photo-1518414922567-9388df6718d7?q=80&w=800&auto=format&fit=crop",
    author: "Marine Biology Field Team",
    source: "ncpor_dispatch",
    id: "story3"
  }
];

const insert = db.prepare('INSERT OR REPLACE INTO items (type, title, abstract, summary, thumbnail_url, credit, source, source_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');

for (const s of stories) {
  insert.run('story', s.title, s.abstract, s.content, s.image, s.author, s.source, s.id, 'published');
}
console.log('Stories inserted.');
