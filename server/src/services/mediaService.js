import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

export const PRESET_MEDIA = [
  // Interactive Experiences
  {
    id: 'exp-cake-1',
    name: 'Virtual Birthday Cake Party (Interactive)',
    type: 'interactive',
    category: 'Interactive',
    subType: 'cake',
    thumbnail: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    title: 'Multi-Screen Cake Cutting Experience',
    description: 'Place 4 or 6 phones together to form one giant birthday cake. Swipe across any screen with a virtual knife to cut the cake with synchronized slice animation, candles, music and confetti!',
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

  // Images - Nature
  {
    id: 'img-nature-1',
    name: 'Majestic Mountain & Alpine Lake',
    type: 'image',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'img-nature-2',
    name: 'Lush Pine Forest Mist',
    type: 'image',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&auto=format&fit=crop&q=80'
  },

  // Images - Cakes
  {
    id: 'img-cake-1',
    name: 'Celebration Berry Cake',
    type: 'image',
    category: 'Cakes',
    url: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'img-cake-2',
    name: 'Pastel Unicorn Strawberry Cake',
    type: 'image',
    category: 'Cakes',
    url: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&auto=format&fit=crop&q=80'
  },

  // Images - Space
  {
    id: 'img-space-1',
    name: 'Deep Space Nebula & Galaxies',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'img-space-2',
    name: 'Earth Horizon From Orbit',
    type: 'image',
    category: 'Space',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&auto=format&fit=crop&q=80'
  },

  // Images - Cities
  {
    id: 'img-cities-1',
    name: 'Tokyo Neon Cyber Skyline',
    type: 'image',
    category: 'Cities',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&auto=format&fit=crop&q=80'
  },
  {
    id: 'img-cities-2',
    name: 'Manhattan Skyline Sunset',
    type: 'image',
    category: 'Cities',
    url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&auto=format&fit=crop&q=80'
  },

  // Images - Abstract
  {
    id: 'img-abstract-1',
    name: 'Fluid Holographic Aurora',
    type: 'image',
    category: 'Abstract',
    url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1920&auto=format&fit=crop&q=85',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&auto=format&fit=crop&q=80'
  },

  // Videos - Nature & Animation
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
    category: 'Animation',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=400&auto=format&fit=crop&q=80',
    duration: 60
  },
  {
    id: 'vid-bg-1',
    name: 'Cosmic Starfield Motion',
    type: 'video',
    category: 'Backgrounds',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80',
    duration: 120
  }
];

let userUploadedMedia = [];

export const getMediaList = () => {
  return [...PRESET_MEDIA, ...userUploadedMedia];
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
