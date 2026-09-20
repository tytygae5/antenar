// Competitor channels scrapper and trend matcher
import fs from 'fs';
import path from 'path';

// Memory DB of competitors
let competitorsList = [
  { id: 'canal-1', name: '@LucasAIEngenharia', url: 'https://youtube.com/@lucasai', checkedAt: Date.now(), videosCount: 34, viewsAvg: 42000 },
  { id: 'canal-2', name: '@TechReviewsBr', url: 'https://youtube.com/@techreviews', checkedAt: Date.now(), videosCount: 112, viewsAvg: 89000 }
];

export async function addCompetitor(channelName) {
  const cleanName = channelName.startsWith('@') ? channelName : `@${channelName}`;
  const duplicate = competitorsList.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
  
  if (duplicate) {
    return { success: true, alreadyExists: true, competitor: duplicate };
  }

  const newCompetitor = {
    id: `competitor-${Date.now()}`,
    name: cleanName,
    url: `https://youtube.com/${cleanName.substring(1)}`,
    checkedAt: Date.now(),
    videosCount: Math.floor(Math.random() * 80) + 10,
    viewsAvg: Math.floor(Math.random() * 150000) + 5000
  };

  competitorsList.push(newCompetitor);
  return { success: true, competitor: newCompetitor };
}

export function getCompetitors() {
  return competitorsList;
}

export async function scanCompetitorVideos(competitorId) {
  const comp = competitorsList.find(c => c.id === competitorId);
  if (!comp) return [];

  // Mock list of recent videos
  return [
    {
      title: "Testei o Cursor por 30 dias (Meu novo editor)",
      views: 124000,
      publishedAt: '2 horas atrás',
      duration: '8:42',
      engagement: 'Alta',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=225'
    },
    {
      title: "A nova IA de vídeo que superou o Sora!",
      views: 89000,
      publishedAt: '2 dias atrás',
      duration: '11:15',
      engagement: 'Normal',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&h=225'
    }
  ];
}
