// lib/engines/calc-engine.ts
// Social media dimensions, aspect ratios, and lookup tables

export interface PlatformSpec {
  name: string;
  category: string;
  width: number;
  height: number;
  aspectRatio: string;
  description: string;
  maxFileSize: string;
  recommendedFormat: string;
  safeArea?: string;
  tips: string[];
}

export const SOCIAL_SPECS: Record<string, PlatformSpec> = {
  // Instagram
  'instagram-post-square': {
    name: 'Instagram Square Post',
    category: 'Instagram',
    width: 1080,
    height: 1080,
    aspectRatio: '1:1',
    description: 'The classic Instagram square feed photo.',
    maxFileSize: '8 MB',
    recommendedFormat: 'JPG / PNG',
    tips: [
      'Displays at 1080×1080 px for sharpest rendering on mobile screens.',
      'Always use sRGB color profile to prevent color shifts.',
      'Keep text centered for balanced mobile view.',
    ],
  },
  'instagram-post-portrait': {
    name: 'Instagram Portrait Post',
    category: 'Instagram',
    width: 1080,
    height: 1350,
    aspectRatio: '4:5',
    description: 'Takes up the most vertical real estate in the feed.',
    maxFileSize: '8 MB',
    recommendedFormat: 'JPG / PNG',
    tips: [
      'Occupies the most screen space of any feed format, increasing engagement.',
      '4:5 ratio is the maximum vertical feed ratio without letterboxing.',
      'Crop carefully to ensure the 1:1 center thumbnail looks great on your profile grid.',
    ],
  },
  'instagram-post-landscape': {
    name: 'Instagram Landscape Post',
    category: 'Instagram',
    width: 1080,
    height: 566,
    aspectRatio: '1.91:1',
    description: 'Horizontal wide image for panoramic and landscape photography.',
    maxFileSize: '8 MB',
    recommendedFormat: 'JPG',
    tips: [
      'Great for scenic photos and cinematic shots.',
      'Takes up less vertical feed space than portrait or square.',
    ],
  },
  'instagram-story': {
    name: 'Instagram Story',
    category: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Full-screen vertical story image or video.',
    maxFileSize: '30 MB (image) / 4 GB (video)',
    recommendedFormat: 'JPG / MP4',
    safeArea: 'Keep crucial elements 250px away from top and bottom to avoid UI overlay',
    tips: [
      'Top 250px is covered by your username and progress bars.',
      'Bottom 250px is covered by the reply bar and send buttons.',
      'Center key text and stickers within the safe zone.',
    ],
  },
  'instagram-reel': {
    name: 'Instagram Reel',
    category: 'Instagram',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Full-screen vertical short-form video.',
    maxFileSize: '4 GB',
    recommendedFormat: 'MP4 / MOV',
    safeArea: 'Feed preview crops to 4:5; profile grid crops to 1:1',
    tips: [
      'Design cover art with key text inside the 1080×1080 central square.',
      'Keep captions and buttons in mind on the bottom and right edges.',
    ],
  },
  'instagram-profile': {
    name: 'Instagram Profile Picture',
    category: 'Instagram',
    width: 320,
    height: 320,
    aspectRatio: '1:1',
    description: 'Circular profile photo on user profile and feed stories.',
    maxFileSize: '5 MB',
    recommendedFormat: 'PNG / JPG',
    safeArea: 'Displayed in a circle — ensure no text/faces in the 4 corners',
    tips: [
      'Displayed at 110×110 px on mobile, but upload at 320×320 for Retina clarity.',
      'Corners are clipped into a circular mask automatically.',
    ],
  },

  // YouTube
  'youtube-thumbnail': {
    name: 'YouTube Thumbnail',
    category: 'YouTube',
    width: 1280,
    height: 720,
    aspectRatio: '16:9',
    description: 'Custom video thumbnail displayed in search, home feed, and playlists.',
    maxFileSize: '2 MB',
    recommendedFormat: 'JPG / PNG',
    tips: [
      'Minimum width is 640 pixels; 1280×720 is the official recommended spec.',
      'Strict 2MB file size limit — compress if necessary.',
      'Bottom-right corner is covered by the video timestamp badge; keep it clear.',
    ],
  },
  'youtube-banner': {
    name: 'YouTube Channel Banner',
    category: 'YouTube',
    width: 2560,
    height: 1440,
    aspectRatio: '16:9',
    description: 'Header banner shown across TV, desktop, tablet, and mobile devices.',
    maxFileSize: '6 MB',
    recommendedFormat: 'JPG / PNG',
    safeArea: 'Central 1546×423 px safe area visible on all devices including mobile',
    tips: [
      'TV screens show the entire 2560×1440 area.',
      'Desktop screens show 2560×423 px.',
      'Mobile screens only display the central 1546×423 px safe area.',
    ],
  },
  'youtube-profile': {
    name: 'YouTube Profile Picture',
    category: 'YouTube',
    width: 800,
    height: 800,
    aspectRatio: '1:1',
    description: 'Channel avatar displayed beside video titles and in comments.',
    maxFileSize: '4 MB',
    recommendedFormat: 'PNG / JPG',
    tips: [
      'Renders as a circular avatar across YouTube.',
      'Ensure subject is centered with sufficient margin around edges.',
    ],
  },

  // TikTok
  'tiktok-video': {
    name: 'TikTok Video',
    category: 'TikTok',
    width: 1080,
    height: 1920,
    aspectRatio: '9:16',
    description: 'Full-screen vertical short-form video on TikTok.',
    maxFileSize: '287.6 MB (iOS/Android) / 500 MB (Desktop)',
    recommendedFormat: 'MP4 / MOV',
    safeArea: 'Right edge is covered by icons (like, comment, share); bottom is covered by caption',
    tips: [
      'Vertical 9:16 is mandatory for the best full-screen experience.',
      'Keep text away from the bottom 300px and the right 150px.',
    ],
  },
  'tiktok-profile': {
    name: 'TikTok Profile Picture',
    category: 'TikTok',
    width: 200,
    height: 200,
    aspectRatio: '1:1',
    description: 'Avatar shown on profile and next to videos in the For You feed.',
    maxFileSize: '20 MB',
    recommendedFormat: 'JPG / PNG',
    tips: [
      'Minimum dimension is 20×20 px, recommended is 200×200 px or higher.',
      'Cropped into a circle automatically.',
    ],
  },
};

export function calculateCustomDimensions(
  origW: number,
  origH: number,
  targetW?: number,
  targetH?: number,
  maintainRatio: boolean = true
): { width: number; height: number; ratio: number } {
  const ratio = origW / origH;
  if (!maintainRatio) {
    return {
      width: targetW || origW,
      height: targetH || origH,
      ratio: (targetW || origW) / (targetH || origH),
    };
  }

  if (targetW && !targetH) {
    return { width: targetW, height: Math.round(targetW / ratio), ratio };
  }
  if (targetH && !targetW) {
    return { width: Math.round(targetH * ratio), height: targetH, ratio };
  }
  if (targetW && targetH) {
    // fit inside bounding box
    const boxRatio = targetW / targetH;
    if (ratio > boxRatio) {
      return { width: targetW, height: Math.round(targetW / ratio), ratio };
    } else {
      return { width: Math.round(targetH * ratio), height: targetH, ratio };
    }
  }

  return { width: origW, height: origH, ratio };
}
