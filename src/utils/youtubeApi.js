import { getFromMemory, saveToMemory } from './channelMemory';

/**
 * Retorna o access token do YouTube ativo. Se expirado ou quase expirando,
 * renova-o de forma transparente chamando o backend.
 */
export async function getYouTubeAccessToken() {
  const stored = await getFromMemory('youtube');
  if (!stored?.refresh_token) {
    throw new Error('YouTube não conectado. Use o comando /conectar-youtube primeiro.');
  }

  // Se o token ainda for válido (margem de 1 minuto de segurança), retorna
  if (stored.access_token && stored.expires_at && stored.expires_at > Date.now()) {
    return stored.access_token;
  }

  console.log('[YouTube API] Renovando access token expirado...');
  const res = await fetch('/api/youtube/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: stored.refresh_token })
  });

  if (!res.ok) {
    throw new Error('Falha ao renovar credenciais do YouTube. Conecte novamente.');
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error('Erro na renovação do token do YouTube.');
  }

  const updated = {
    ...stored,
    access_token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000
  };

  await saveToMemory('youtube', updated);
  return data.access_token;
}

/**
 * Conecta ao canal do YouTube abrindo o link do OAuth no backend.
 */
export function conectarCanal() {
  window.open('/api/youtube/auth', '_blank');
}

/**
 * Envia o vídeo e opcionalmente a thumbnail para o servidor Express,
 * e escuta as atualizações de progresso do upload do Express para o Google via SSE.
 */
export async function uploadToYouTube({ videoFile, thumbnailFile, metadata, onProgress }) {
  const accessToken = await getYouTubeAccessToken();

  if (onProgress) onProgress({ step: '1/5', percent: 0, message: 'Autenticando e preparando envio...' });

  const formData = new FormData();
  formData.append('video', videoFile);
  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }
  formData.append('metadata', JSON.stringify(metadata));

  // Envia o arquivo do navegador para o servidor local Express
  if (onProgress) onProgress({ step: '2/5', percent: 10, message: 'Enviando arquivo ao servidor local...' });
  
  const uploadRes = await fetch('/api/youtube/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Upload falhou no servidor: ${errText}`);
  }

  const { uploadId } = await uploadRes.json();

  // Escuta progresso do servidor Express para o Google via SSE
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`/api/youtube/upload/progress?uploadId=${uploadId}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'running') {
          if (onProgress) {
            onProgress({
              step: '2/5',
              percent: data.percent,
              message: `Enviando arquivo ao YouTube... (${data.percent}% | ${data.sentMb}MB de ${data.totalMb}MB)`,
              sent: data.sent,
              total: data.total
            });
          }
        } else if (data.status === 'metadata') {
          if (onProgress) onProgress({ step: '3/5', percent: 100, message: 'Definindo título, descrição e tags...' });
        } else if (data.status === 'thumbnail') {
          if (onProgress) onProgress({ step: '4/5', percent: 100, message: 'Enviando e aplicando Thumbnail personalizada...' });
        } else if (data.status === 'scheduling') {
          if (onProgress) onProgress({ step: '5/5', percent: 100, message: 'Finalizando publicação e agendamento...' });
        } else if (data.status === 'done') {
          eventSource.close();
          resolve({ videoId: data.videoId, url: data.url });
        } else if (data.status === 'error') {
          eventSource.close();
          reject(new Error(data.error || 'Erro no processamento do upload.'));
        }
      } catch (err) {
        eventSource.close();
        reject(err);
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      reject(new Error('Conexão com monitor de progresso perdida.'));
    };
  });
}

/**
 * Puxa dados consolidados ou de um vídeo específico da YouTube Analytics API.
 */
export async function fetchYouTubeAnalytics({ days = 7, videoId = null } = {}) {
  const accessToken = await getYouTubeAccessToken();
  const query = new URLSearchParams({ days: String(days) });
  if (videoId) query.append('videoId', videoId);

  const res = await fetch(`/api/youtube/analytics?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar Analytics: ${await res.text()}`);
  }
  return await res.json();
}

/**
 * Puxa comentários recentes do canal/vídeo.
 */
export async function fetchYouTubeComments({ videoId = null } = {}) {
  const accessToken = await getYouTubeAccessToken();
  const query = new URLSearchParams();
  if (videoId) query.append('videoId', videoId);

  const res = await fetch(`/api/youtube/comments?${query.toString()}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!res.ok) {
    throw new Error(`Erro ao buscar comentários: ${await res.text()}`);
  }
  return await res.json();
}

/**
 * Envia uma resposta oficial para um comentário.
 */
export async function postYouTubeCommentReply(commentId, text) {
  const accessToken = await getYouTubeAccessToken();

  const res = await fetch('/api/youtube/comments/reply', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ commentId, text })
  });

  if (!res.ok) {
    throw new Error(`Erro ao responder comentário: ${await res.text()}`);
  }
  return await res.json();
}
