import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const PRESET_MEDIA = [
  // ── Interactive Experiences ────────────────────────────────────────────────
  {
    id: 'exp-cake-1',
    name: 'Virtual Birthday Cake Party (Interactive)',
    type: 'interactive',
    category: 'Interactive',
    subType: 'cake',
    thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    title: 'Multi-Screen Cake Cutting Experience',
    description: 'Place phones together to form one giant birthday cake. Swipe across any screen with a virtual knife to cut the cake with synchronized slice animation, candles, music and confetti!',
    candles: 4,
    flavor: 'Chocolate Strawberry Truffle'
  },
  {
    id: 'exp-cyber-1',
    name: 'Cyber Wave Matrix (Interactive)',
    type: 'interactive',
    category: 'Interactive',
    subType: 'cyber',
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    title: 'Neon Cyber Pulse Wave',
    description: 'Continuous neon pulse wave flowing across all connected devices in real time with interactive touch ripple.'
  },

  // ── SUPERHEROES ────────────────────────────────────────────────────────────
  {
    id: 'hero-ironman-1',
    name: 'Iron Man Arc Reactor Armor',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1635863138275-d9b33299680b?w=400&auto=format&fit=crop&q=80',
    tags: ['iron man', 'marvel', 'avengers', 'armor']
  },
  {
    id: 'hero-spiderman-1',
    name: 'Spider-Man Cyber Skyline Leap',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1604200213928-ba3cf4fc8436?w=400&auto=format&fit=crop&q=80',
    tags: ['spiderman', 'spider-man', 'marvel', 'city']
  },
  {
    id: 'hero-batman-1',
    name: 'Batman Dark Knight Gotham Watch',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=80',
    tags: ['batman', 'dc', 'dark knight', 'gotham']
  },
  {
    id: 'hero-avengers-1',
    name: 'Avengers Shield & Cosmic Power',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=400&auto=format&fit=crop&q=80',
    tags: ['captain america', 'shield', 'avengers', 'marvel']
  },
  {
    id: 'hero-hulk-1',
    name: 'Gamma Green Energy Surge',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&auto=format&fit=crop&q=80',
    tags: ['hulk', 'gamma', 'green', 'marvel']
  },
  {
    id: 'hero-thor-1',
    name: 'Thor Lightning Storm Thunder',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&auto=format&fit=crop&q=80',
    tags: ['thor', 'lightning', 'thunder', 'marvel']
  },
  {
    id: 'hero-flash-1',
    name: 'The Flash Speed Force Streaks',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&auto=format&fit=crop&q=80',
    tags: ['flash', 'speed force', 'dc', 'neon']
  },
  {
    id: 'hero-blackpanther-1',
    name: 'Black Panther Vibranium Glow',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    tags: ['black panther', 'wakanda', 'marvel', 'purple']
  },
  {
    id: 'hero-deadpool-1',
    name: 'Merc Crimson Swords & Smoke',
    type: 'image',
    category: 'Superheroes',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=400&auto=format&fit=crop&q=80',
    tags: ['deadpool', 'wolverine', 'marvel', 'crimson']
  },

  // ── CUTE / POP CULTURE ─────────────────────────────────────────────────────
  {
    id: 'cute-unicorn-1',
    name: 'Pastel Dream Unicorn Fantasy',
    type: 'image',
    category: 'Cute / Pop Culture',
    url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&auto=format&fit=crop&q=80',
    tags: ['unicorn', 'pastel', 'cute', 'pink']
  },
  {
    id: 'cute-barbie-1',
    name: 'Barbie Vibrant Magenta Glam',
    type: 'image',
    category: 'Cute / Pop Culture',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&auto=format&fit=crop&q=80',
    tags: ['barbie', 'magenta', 'glam', 'pop culture']
  },
  {
    id: 'cute-princess-1',
    name: 'Princess Sparkling Tiara & Roses',
    type: 'image',
    category: 'Cute / Pop Culture',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&auto=format&fit=crop&q=80',
    tags: ['princess', 'sparkle', 'tiara', 'gold']
  },
  {
    id: 'cute-cottoncandy-1',
    name: 'Pastel Cotton Candy Clouds',
    type: 'image',
    category: 'Cute / Pop Culture',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    tags: ['pastel', 'clouds', 'dreamy', 'sky']
  },
  {
    id: 'cute-cherry-1',
    name: 'Blossom Cherry Petals Shower',
    type: 'image',
    category: 'Cute / Pop Culture',
    url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=400&auto=format&fit=crop&q=80',
    tags: ['sakura', 'cherry blossom', 'flowers', 'spring']
  },

  // ── CELEBRATION ────────────────────────────────────────────────────────────
  {
    id: 'cel-cake-berry',
    name: 'Celebration Triple Berry Cake',
    type: 'image',
    category: 'Celebration',
    url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=400&auto=format&fit=crop&q=80',
    tags: ['cake', 'birthday', 'berries', 'celebration']
  },
  {
    id: 'cel-confetti-1',
    name: 'Golden Confetti Blast & Sparklers',
    type: 'image',
    category: 'Celebration',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80',
    tags: ['confetti', 'party', 'fireworks', 'celebration']
  },
  {
    id: 'cel-champagne-1',
    name: 'Golden Champagne Toast Celebration',
    type: 'image',
    category: 'Celebration',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&auto=format&fit=crop&q=80',
    tags: ['anniversary', 'wedding', 'champagne', 'party']
  },
  {
    id: 'cel-balloons-1',
    name: 'Rainbow Birthday Balloon Cloud',
    type: 'image',
    category: 'Celebration',
    url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80',
    tags: ['balloons', 'birthday', 'party', 'colorful']
  },
  {
    id: 'cel-fireworks-1',
    name: 'Mega Midnight Fireworks Finale',
    type: 'image',
    category: 'Celebration',
    url: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1531306728370-e2ebd9d7bb99?w=400&auto=format&fit=crop&q=80',
    tags: ['fireworks', 'night', 'new year', 'sky']
  },

  // ── SPACE ──────────────────────────────────────────────────────────────────
  {
    id: 'spc-nebula-1',
    name: 'Deep Space Cosmic Nebula & Stars',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80',
    tags: ['galaxy', 'nebula', 'space', 'stars']
  },
  {
    id: 'spc-earth-1',
    name: 'Earth Horizon From Orbit',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&auto=format&fit=crop&q=80',
    tags: ['earth', 'orbit', 'blue planet', 'horizon']
  },
  {
    id: 'spc-stars-1',
    name: 'Milky Way Spiral Core Panorama',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    tags: ['milky way', 'galaxy', 'astrophotography']
  },
  {
    id: 'spc-aurora-1',
    name: 'Cosmic Solar Aurora Borealis',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&auto=format&fit=crop&q=80',
    tags: ['aurora', 'green', 'northern lights', 'sky']
  },

  // ── NATURE & CITIES ────────────────────────────────────────────────────────
  {
    id: 'nat-lake-1',
    name: 'Alpine Lake & Mountain Reflections',
    type: 'image',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'nat-forest-1',
    name: 'Lush Pine Forest Morning Mist',
    type: 'image',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'cit-tokyo-1',
    name: 'Tokyo Neon Cyber Skyline',
    type: 'image',
    category: 'Cities',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'cit-ny-1',
    name: 'Manhattan Sunset Skyline',
    type: 'image',
    category: 'Cities',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=80'
  },

  // ── VIDEOS (CDN streams) ───────────────────────────────────────────────────
  {
    id: 'vid-nature-1',
    name: 'Ocean Coast Waves Aerial',
    type: 'video',
    category: 'Nature',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
    duration: 15
  },
  {
    id: 'vid-anim-1',
    name: 'Big Buck Bunny Open Studio Film',
    type: 'video',
    category: 'Cute / Pop Culture',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    duration: 60
  },
  {
    id: 'vid-bg-1',
    name: 'Cosmic Starfield Motion Flow',
    type: 'video',
    category: 'Space',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    duration: 120
  }
];

import { galleryDB } from './galleryService.js';

let userUploadedMedia = [];

export const getMediaList = () => {
  let adminMedia = [];
  try {
    adminMedia = galleryDB.getImages({ isPublic: true }).map(img => ({
      id: img.id,
      name: img.title,
      type: 'image',
      category: img.categoryName || 'Admin Gallery',
      url: img.imageUrl,
      thumbnail: img.thumbnailUrl || img.imageUrl,
      description: img.description
    }));
  } catch (e) {
    console.warn('Could not load gallery images for media library', e);
  }
  return [...PRESET_MEDIA, ...adminMedia, ...userUploadedMedia];
};

export const addUploadedMedia = (mediaItem) => {
  userUploadedMedia.unshift(mediaItem);
  return mediaItem;
};

export const deleteUploadedMedia = (id) => {
  const index = userUploadedMedia.findIndex(m => m.id === id);
  if (index !== -1) {
    const item = userUploadedMedia[index];
    if (item.filePath && fs.existsSync(item.filePath)) {
      try {
        fs.unlinkSync(item.filePath);
      } catch (err) {
        console.error('Error deleting file:', err);
      }
    }
    userUploadedMedia.splice(index, 1);
    return true;
  }
  return false;
};
