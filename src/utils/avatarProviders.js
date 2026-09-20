import Replicate from 'replicate';
import fs from 'fs/promises';
import { client } from '@gradio/client';

export async function callSkyReelsV3(imagePath, audioPath) {
  const img = imagePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const aud = audioPath || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  console.log(`[SkyReels-V3] Iniciando chamada à API apifree.ai...`);
  
  const response = await fetch('https://api.apifree.ai/v1/skyreels-v3/standard/single-avatar', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.APIFREE_API_KEY || ''}`
    },
    body: JSON.stringify({
      image_url: img,
      audio_url: aud
    })
  });

  if (!response.ok) {
    throw new Error(`SkyReels-V3 respondeu com erro HTTP ${response.status}`);
  }

  const data = await response.json();
  const videoUrl = data?.video_url || data?.url;
  if (!videoUrl) {
    throw new Error('SkyReels-V3 não retornou uma URL válida de vídeo.');
  }

  return videoUrl;
}

export async function callSadTalkerHF(imagePath, audioPath) {
  const img = imagePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const aud = audioPath || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  console.log(`[SadTalker] Conectando ao Hugging Face Space vinthony/SadTalker...`);
  
  const app = await client("vinthony/SadTalker");
  const result = await app.predict("/predict", [
    img,          // portrait
    aud,          // audio
    "crop",       // preprocess
    true,         // still mode
    false,        // use enhancement
    0             // batch size
  ]);

  if (!result || !result.data) {
    throw new Error("Resposta inválida do SadTalker HF Space.");
  }

  const videoUrl = result.data[0]?.url || result.data[0];
  if (!videoUrl) {
    throw new Error("Nenhum vídeo retornado pelo SadTalker.");
  }

  return videoUrl;
}

export async function callVlogMeReplicate(imagePath, audioPath) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error('REPLICATE_API_TOKEN não configurado');

  const replicate = new Replicate({ auth: token });

  const getAsBase64 = async (filePathOrUrl, mimeType) => {
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
      const response = await fetch(filePathOrUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    } else {
      const buffer = await fs.readFile(filePathOrUrl);
      return `data:${mimeType};base64,${buffer.toString('base64')}`;
    }
  };

  const img = imagePath || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
  const aud = audioPath || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  console.log(`[VlogMe] Codificando arquivos em Base64...`);
  const imageBase64 = await getAsBase64(img, 'image/jpeg');
  const audioBase64 = await getAsBase64(aud, 'audio/mpeg');

  console.log(`[VlogMe] Criando predição no Replicate (lex2029/vlogme-avatar-bridge)...`);
  const output = await replicate.run(
    'lex2029/vlogme-avatar-bridge:latest',
    {
      input: {
        image: imageBase64,
        audio: audioBase64
      }
    }
  );

  const videoUrl = typeof output === 'string' ? output : output?.url;
  if (!videoUrl) {
    throw new Error("Não foi possível extrair a URL do vídeo de saída do Replicate.");
  }
  return videoUrl;
}
