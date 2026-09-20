// Job running 1x/day to scan monitored competitors
import { getCompetitors, scanCompetitorVideos } from '../utils/competitorMonitor.js';

export async function runMonitorCompetitorsJob() {
  console.log('[Job] Iniciando varredura diária de concorrentes...');
  const competitors = getCompetitors();
  
  const scanResults = [];
  for (const comp of competitors) {
    const videos = await scanCompetitorVideos(comp.id);
    console.log(`[Job] ${comp.name} escaneado. ${videos.length} vídeos recentes encontrados.`);
    scanResults.push({ competitor: comp.name, recentVideo: videos[0] });
  }
  
  return {
    success: true,
    timestamp: Date.now(),
    scanned: competitors.length,
    results: scanResults
  };
}

// Auto execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMonitorCompetitorsJob().then(res => console.log('Job completo:', res));
}
