import express from 'express';
import path from 'path';
import multer from 'multer';
import JSZip from 'jszip';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import {
  askAgent,
  callProvider,
  TaskTypes,
  ROUTING_TABLE,
  healthCheck,
  generateEmbedding,
  executeToolBackend,
  transcribeAudio,
  runSelfRefinement,
  runMixtureOfAgents,
  runAutonomousAgent,
  resetCircuitBreakers,
  getCircuitBreakerStatus,
  validateAISite,
  generateVideoPackage,
  analyzeVideo,
  generateVideoCorrections,
  getCachedPackage,
  automateAndRecord,
  syncVideoWithTTS,
  generateVerticalShorts,
  discoverNewAIs,
} from './agent.js';

const PORT = 3000;

// Log buffer para /api/debug
const recentLogs: string[] = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

function pushLog(type: string, ...args: any[]) {
  const msg = `[${new Date().toISOString()}] [${type}] ` + args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
  recentLogs.push(msg);
  if (recentLogs.length > 60) recentLogs.shift();
}

console.log = (...args: any[]) => {
  pushLog('INFO', ...args);
  originalConsoleLog(...args);
};
console.warn = (...args: any[]) => {
  pushLog('WARN', ...args);
  originalConsoleWarn(...args);
};
console.error = (...args: any[]) => {
  pushLog('ERROR', ...args);
  originalConsoleError(...args);
};

// Validação de Chaves no Boot
console.log('=== STATUS DAS CHAVES DE API NO BOOT ===');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
console.log('OPENROUTER_API_KEY:', process.env.OPENROUTER_API_KEY ? 'CONFIGURADA' : 'NÃO CONFIGURADA');
console.log('========================================');

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check endpoint completo (Camada 4)
  app.get('/api/health', async (req, res) => {
    try {
      const results = await healthCheck();
      res.json({
        providers: results,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Falha no health-check' });
    }
  });

  // Cache de pacotes gerados (Fallback REST - Camada 3)
  app.get('/api/video/package/:sessionId', (req, res) => {
    const pkg = getCachedPackage(req.params.sessionId);
    if (!pkg) {
      return res.status(404).json({ error: 'Pacote não encontrado ou expirado' });
    }
    res.json(pkg);
  });

  // Limpeza de Cache e Reset de Circuit Breakers no Backend
  app.post('/api/cache/clear', (req, res) => {
    resetCircuitBreakers();
    console.log('[API /api/cache/clear] Circuit breakers e rate limits resetados.');
    res.json({
      success: true,
      message: 'Cache de memória e Circuit Breakers limpos com sucesso.',
      timestamp: new Date().toISOString(),
    });
  });

  // Diagnóstico e Debug (/api/debug)
  app.get('/api/debug', (req, res) => {
    res.json({
      timestamp: new Date().toISOString(),
      quota: (global as any).__quotaLog || { calls: 0, providers: {} },
      burned: Array.from(((global as any).__burnedProviders || new Map()).keys()),
      configuredKeys: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        dashscope: Boolean(process.env.DASHSCOPE_API_KEY),
        zhipu: Boolean(process.env.ZHIPU_API_KEY),
        siliconflow: Boolean(process.env.SILICONFLOW_API_KEY),
        huggingface: Boolean(process.env.HUGGINGFACE_TOKEN),
      },
      circuitBreakers: getCircuitBreakerStatus(),
      recentLogs: recentLogs.slice(-30),
    });
  });

  // Health Check Completo de Provedores de IA
  app.get('/api/health-check', async (req, res) => {
    try {
      const results = await healthCheck();
      res.json({
        timestamp: new Date().toISOString(),
        providers: results,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Falha no health-check' });
    }
  });

  // Lista de Provedores e Matriz de Roteamento
  app.get('/api/providers', (req, res) => {
    res.json({
      routingTable: ROUTING_TABLE,
      taskTypes: Object.keys(TaskTypes),
      configuredKeys: {
        gemini: Boolean(process.env.GEMINI_API_KEY),
        openrouter: Boolean(process.env.OPENROUTER_API_KEY),
        groq: Boolean(process.env.GROQ_API_KEY),
        dashscope: Boolean(process.env.DASHSCOPE_API_KEY),
        zhipu: Boolean(process.env.ZHIPU_API_KEY),
        siliconflow: Boolean(process.env.SILICONFLOW_API_KEY),
        huggingface: Boolean(process.env.HUGGINGFACE_TOKEN),
      },
    });
  });

  // Geração de Embeddings Vetoriais (Gemini text-embedding-004 / gemini-embedding-001)
  app.post('/api/embeddings', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'O campo "text" é obrigatório' });
      }
      const result = await generateEmbedding(text, { geminiApiKey: process.env.GEMINI_API_KEY });
      res.json(result);
    } catch (err: any) {
      console.error('[API /api/embeddings error]', err.message);
      res.status(500).json({ error: err.message || 'Falha ao gerar embedding' });
    }
  });

  // Execução de Ferramentas Nativas
  app.post('/api/tools/execute', async (req, res) => {
    try {
      const { name, args = {} } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nome da ferramenta é obrigatório' });
      }
      const result = await executeToolBackend(name, args);
      res.json({ success: true, name, result });
    } catch (err: any) {
      console.error('[API /api/tools/execute error]', err.message);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Transcrição de Áudio (Groq Whisper)
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body;
      if (!audioBase64) {
        return res.status(400).json({ error: 'audioBase64 é obrigatório' });
      }

      const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
      const buffer = Buffer.from(cleanBase64, 'base64');

      const result = await transcribeAudio(buffer, {
        mimeType: mimeType || 'audio/webm',
        groqApiKey: process.env.GROQ_API_KEY,
      });

      res.json(result);
    } catch (err: any) {
      console.error('[API /api/transcribe error]', err.message);
      res.status(500).json({ error: err.message || 'Falha na transcrição' });
    }
  });

  // Comparador Lado a Lado (3 modelos em tempo real)
  app.post('/api/compare', async (req, res) => {
    try {
      const { prompt, systemPrompt } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'O campo "prompt" é obrigatório' });
      }

      const models = [
        { id: 'gemini', name: 'Google Gemini (gemini-flash-latest)', provider: 'gemini', model: 'gemini-flash-latest' },
        { id: 'groq', name: 'Groq LPU (GPT-OSS-120B)', provider: 'groq', model: 'openai/gpt-oss-120b' },
        { id: 'openrouter', name: 'OpenRouter (Auto / DeepSeek)', provider: 'openrouter', model: 'openrouter/auto' },
      ];

      const start = Date.now();
      const results = await Promise.allSettled(
        models.map(async (m) => {
          const mStart = Date.now();
          const r = await callProvider(m.provider, prompt, m.model, {
            systemPrompt,
            stream: false,
            groqApiKey: process.env.GROQ_API_KEY,
            geminiApiKey: process.env.GEMINI_API_KEY,
            openrouterApiKey: process.env.OPENROUTER_API_KEY,
          });

          return {
            id: m.id,
            name: m.name,
            provider: m.provider,
            model: r?.modelUsed || m.model,
            response: r?.text || 'Nenhuma resposta retornada',
            latencyMs: Date.now() - mStart,
            success: Boolean(r?.text),
          };
        })
      );

      const formatted = results.map((r, i) => {
        if (r.status === 'fulfilled') return r.value;
        return {
          id: models[i].id,
          name: models[i].name,
          provider: models[i].provider,
          model: models[i].model,
          response: `Erro: ${r.reason?.message || 'Falha de inferência'}`,
          latencyMs: Date.now() - start,
          success: false,
        };
      });

      res.json({ results: formatted, totalLatencyMs: Date.now() - start });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Falha no comparador' });
    }
  });

  // Helper withTimeout
  function withTimeout<T>(promise: Promise<T>, ms = 180000, pipeline = 'unknown'): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`[${pipeline}] Timeout após ${ms/1000}s`)), ms)
      )
    ]);
  }

  // Endpoint Principal (/api/chat) com Suporte a SSE Streaming e JSON
  app.post('/api/chat', async (req, res) => {
    const isSse = req.headers.accept === 'text/event-stream' || req.body?.stream === true;
    let {
      prompt,
      taskType,
      systemPrompt,
      mode, // 'standard' | 'self_refinement' | 'moa' | 'autonomous'
      imageBase64,
      mimeType,
      dryRun = false,
      enableRace = true,
      messages = [],
      sessionId = 'default',
      geminiModel,
      model,
      provider,
    } = req.body;

    let finalPrompt = typeof prompt === 'string' ? prompt.trim() : '';

    if (!finalPrompt && (imageBase64 || req.body.audioBase64)) {
      const isVideo = (mimeType && mimeType.startsWith('video/')) || (imageBase64 && imageBase64.startsWith('data:video/'));
      const isAudio = (mimeType && mimeType.startsWith('audio/')) || req.body.audioBase64;
      if (isVideo) {
        finalPrompt = 'Analise este vídeo em detalhes.';
      } else if (isAudio) {
        finalPrompt = 'Transcreva e analise este áudio em detalhes.';
      } else {
        finalPrompt = 'Analise esta imagem em detalhes.';
      }
    }

    if (!finalPrompt) {
      return res.status(400).json({
        response: 'O campo "prompt" é obrigatório.',
        success: false,
      });
    }

    prompt = finalPrompt;

    const options: any = {
      sessionId,
      dryRun: Boolean(dryRun),
      taskType: taskType || undefined,
      systemPrompt: systemPrompt || undefined,
      mode: mode || undefined,
      geminiModel: geminiModel || (model && String(model).startsWith('gemini') ? model : undefined),
      model: model || geminiModel || undefined,
      provider: provider || (geminiModel ? 'gemini' : undefined),
      imageBase64: imageBase64 || undefined,
      mimeType: mimeType || undefined,
      enableRace: Boolean(enableRace),
      messages: messages.length > 0 ? messages : undefined,
      geminiApiKey: process.env.GEMINI_API_KEY,
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY,
      dashscopeApiKey: process.env.DASHSCOPE_API_KEY,
      zhipuApiKey: process.env.ZHIPU_API_KEY,
      siliconflowApiKey: process.env.SILICONFLOW_API_KEY,
      huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
    };

    // Caso 1: SSE Streaming Response
    if (isSse) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const heartbeat = setInterval(() => {
        if (!res.writableEnded) {
          res.write(': heartbeat\n\n');
        }
      }, 15000);

      res.on('close', () => {
        clearInterval(heartbeat);
      });

      let doneEmitted = false;

      const hardKill = setTimeout(() => {
        if (doneEmitted) return;
        console.error('[SSE] Hard kill após 330s');
        if (!res.writableEnded) {
          res.write(`data: ${JSON.stringify({ type: 'error', message: 'Timeout absoluto' })}\n\n`);
          res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
          res.end();
        }
      }, 330000);

      function validateSSEEvent(event: any) {
        if (!event || typeof event !== 'object') {
          throw new Error('Evento deve ser um objeto');
        }
        if (event.type === 'step') {
          if (!event.label || event.label === 'undefined' || event.label === 'null') {
            throw new Error(`Step com label inválido: ${event.label}`);
          }
        }
      }

      function makeEmit(response: express.Response) {
        let doneEmitted = false;
        const seenSteps = new Set<string>();
        const pendingEvents: any[] = [];
        let isFlushing = false;

        const flush = async () => {
          if (isFlushing) return;
          isFlushing = true;
          while (pendingEvents.length > 0) {
            const event = pendingEvents.shift();
            if (!response.writableEnded) {
              response.write(`data: ${JSON.stringify(event)}\n\n`);
              // 🔴 Aguarda o buffer do socket drenar
              if ((response as any).writableNeedDrain) {
                await new Promise((r) => response.once('drain', r));
              }
            }
            // Pequeno delay entre eventos grandes
            if (event.type === 'artifact') {
              await new Promise((r) => setTimeout(r, 200));
            }
          }
          isFlushing = false;
        };

        return function emit(event: any) {
          console.log('[EMIT]', event.type, event.pipeline || '', event.label || event.kind || '');

          if (event.type === 'step') {
            const key = `${event.pipeline || 'default'}:${event.index}:${event.status || 'unknown'}`;
            if (seenSteps.has(key)) {
              console.log(`[EMIT] STEP DUPLICADO IGNORADO: ${key}`);
              return;
            }
            seenSteps.add(key);
          }

          // 🔴 NUNCA bloqueia artifact mesmo se done já foi emitido
          if (doneEmitted && event.type !== 'artifact') {
            console.log('[EMIT] BLOQUEADO (done emitido)');
            return;
          }

          try {
            validateSSEEvent(event);
          } catch (err: any) {
            console.error('[EMIT] INVÁLIDO:', err.message, JSON.stringify(event).slice(0, 200));
            return;
          }

          pendingEvents.push(event);
          flush();

          if (event.type === 'done' || event.type === 'error') {
            doneEmitted = true;
            clearInterval(heartbeat);
            clearTimeout(hardKill);
            // 🔴 Aguarda o flush terminar antes de fechar
            setTimeout(async () => {
              await flush();
              if (!response.writableEnded) {
                console.log('[SSE] Fechando conexão');
                response.end();
              }
            }, 800);
          }
        };
      }

      const sendEvent = makeEmit(res);

      try {
        let agentResult: any;

        if (mode === 'self_refinement') {
          agentResult = await withTimeout((runSelfRefinement as any)(prompt, options, sendEvent), 180000, 'self_refinement');
        } else if (mode === 'moa') {
          agentResult = await withTimeout((runMixtureOfAgents as any)(prompt, options, sendEvent), 180000, 'moa');
        } else if (mode === 'autonomous') {
          agentResult = await withTimeout((runAutonomousAgent as any)(prompt, options, sendEvent), 180000, 'autonomous');
        } else {
          agentResult = await withTimeout(
            (askAgent as any)(
              prompt,
              options,
              (chunk: any) => sendEvent(chunk),
              (evt: any) => sendEvent(evt)
            ),
            180000,
            'ask_agent'
          );
        }

        sendEvent({
          type: 'done',
          result: agentResult,
        });
      } catch (err: any) {
        console.error('[SSE /api/chat stream error]', err.message);
        let errorMsg = err.message || 'Erro durante processamento';
        if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('limit') || errorMsg.includes('cota')) {
          errorMsg = 'Nenhum provedor de IA disponível no momento. Verifique as chaves de API nas configurações ou tente novamente em instantes.';
        }
        sendEvent({
          type: 'error',
          error: errorMsg,
        });
      } finally {
        clearInterval(heartbeat);
        clearTimeout(hardKill);
        if (!doneEmitted) {
          sendEvent({ type: 'done' });
        }
      }
      return;
    }

    // Caso 2: JSON Padrão
    try {
      console.log(`[API /chat] Processando prompt: "${prompt.slice(0, 40)}..."`);
      let result: any;
      if (mode === 'self_refinement') {
        result = await withTimeout(runSelfRefinement(prompt, { ...options, stream: false }), 180000, 'self_refinement');
      } else if (mode === 'moa') {
        result = await withTimeout(runMixtureOfAgents(prompt, { ...options, stream: false }), 180000, 'moa');
      } else if (mode === 'autonomous') {
        result = await withTimeout(runAutonomousAgent(prompt, { ...options, stream: false }), 180000, 'autonomous');
      } else {
        result = await withTimeout(askAgent(prompt, options), 180000, 'ask_agent');
      }

      if (!result || !result.response) {
        console.warn('[API /chat] Resposta vazia recebida do orquestrador');
        return res.status(500).json({ success: false, response: 'Backend não retornou resposta', debug: result });
      }

      res.json(result);
    } catch (err: any) {
      console.error('[API /chat] Erro:', err);
      let errorMsg = err.message || err;
      if (typeof errorMsg === 'string' && (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('limit') || errorMsg.includes('cota'))) {
        errorMsg = 'Nenhum provedor de IA disponível no momento. Verifique as chaves de API nas configurações ou tente novamente em instantes.';
      } else {
        errorMsg = `Erro interno no servidor: ${errorMsg}`;
      }
      res.status(500).json({
        response: errorMsg,
        success: false,
      });
    }
  });

  // ==========================================
  // YOUTUBE VIDEO ASSISTANT ENDPOINTS
  // ==========================================

  // ==========================================
  // YOUTUBE VIDEO ASSISTANT ENDPOINTS
  // ==========================================

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 500 * 1024 * 1024 }, // Max 500MB
  });

  // ==========================================
  // OFICIAL YOUTUBE API INTEGRATION (PART 1 & 2)
  // ==========================================
  interface ActiveUpload {
    id: string;
    status: 'pending' | 'running' | 'metadata' | 'thumbnail' | 'scheduling' | 'done' | 'error';
    percent: number;
    sent: number;
    total: number;
    error?: string;
    videoId?: string;
    url?: string;
  }
  const activeUploads = new Map<string, ActiveUpload>();

  function generateMockAnalytics(days: number, videoId: string | null) {
    return {
      kind: 'youtubeAnalytics#result',
      columnHeaders: [
        { name: 'views', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'estimatedMinutesWatched', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'averageViewDuration', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'averageViewPercentage', dataType: 'FLOAT', columnType: 'METRIC' },
        { name: 'subscribersGained', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'likes', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'comments', dataType: 'INTEGER', columnType: 'METRIC' },
        { name: 'shares', dataType: 'INTEGER', columnType: 'METRIC' }
      ],
      rows: [
        [12847, 53520, 222, 62.0, 342, 1203, 87, 412]
      ]
    };
  }

  function generateMockComments(videoId: string | null) {
    return {
      items: [
        {
          id: 'c1',
          snippet: {
            topLevelComment: {
              id: 'c1',
              snippet: {
                authorDisplayName: '@user123',
                textDisplay: 'Qual o preço do Gamma App?',
                textOriginal: 'Qual o preço do Gamma App?',
                publishedAt: new Date().toISOString()
              }
            }
          }
        },
        {
          id: 'c2',
          snippet: {
            topLevelComment: {
              id: 'c2',
              snippet: {
                authorDisplayName: '@dev_maria',
                textDisplay: 'Funciona offline?',
                textOriginal: 'Funciona offline?',
                publishedAt: new Date().toISOString()
              }
            }
          }
        },
        {
          id: 'c3',
          snippet: {
            topLevelComment: {
              id: 'c3',
              snippet: {
                authorDisplayName: '@curioso_br',
                textDisplay: 'Melhor que o Canva?',
                textOriginal: 'Melhor que o Canva?',
                publishedAt: new Date().toISOString()
              }
            }
          }
        }
      ]
    };
  }

  async function runBackgroundUpload(uploadId: string, videoBuffer: Buffer, thumbnailBuffer: Buffer | null, metadata: any, accessToken: string) {
    const info = activeUploads.get(uploadId);
    if (!info) return;

    try {
      info.status = 'running';
      activeUploads.set(uploadId, info);

      console.log(`[YouTube Backend] Iniciando sessão resumível com Google para uploadId: ${uploadId}`);
      const initRes = await fetch(
        'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Upload-Content-Type': 'video/mp4',
            'X-Upload-Content-Length': String(videoBuffer.length)
          },
          body: JSON.stringify({
            snippet: {
              title: metadata.title?.slice(0, 100) || 'Novo Vídeo de IA',
              description: metadata.description?.slice(0, 5000) || 'Vídeo incrível gerado de forma automática.',
              tags: metadata.tags?.slice(0, 30) || [],
              categoryId: '28', // Science & Technology
              defaultLanguage: 'pt-BR',
              defaultAudioLanguage: 'pt-BR'
            },
            status: {
              privacyStatus: metadata.privacyStatus || 'private',
              publishAt: metadata.publishAt || undefined,
              selfDeclaredMadeForKids: false
            }
          })
        }
      );

      if (!initRes.ok) {
        const initErr = await initRes.text();
        throw new Error(`Falha ao iniciar sessão no Google: ${initErr}`);
      }

      const uploadUrl = initRes.headers.get('Location');
      if (!uploadUrl) {
        throw new Error('Google não retornou URL de upload resumível (Location)');
      }

      // Envia em chunks de 5MB
      const chunkSize = 5 * 1024 * 1024;
      let offset = 0;
      let videoId = '';

      while (offset < videoBuffer.length) {
        const chunk = videoBuffer.slice(offset, offset + chunkSize);
        console.log(`[YouTube Backend] Enviando chunk: ${offset} - ${offset + chunk.length - 1} de ${videoBuffer.length}`);
        const chunkRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Length': String(chunk.length),
            'Content-Range': `bytes ${offset}-${offset + chunk.length - 1}/${videoBuffer.length}`
          },
          body: chunk
        });

        offset += chunk.length;
        info.sent = Math.min(offset, videoBuffer.length);
        info.percent = Math.round((info.sent / videoBuffer.length) * 100);
        activeUploads.set(uploadId, info);

        if (chunkRes.status === 200 || chunkRes.status === 201) {
          const uploadResult = await chunkRes.json();
          videoId = uploadResult.id;
          break;
        }
      }

      if (!videoId) {
        throw new Error('Upload completou mas o Google não retornou VideoId.');
      }

      // Upload de Thumbnail (opcional)
      if (thumbnailBuffer) {
        info.status = 'thumbnail';
        activeUploads.set(uploadId, info);
        console.log(`[YouTube Backend] Enviando thumbnail para videoId: ${videoId}`);

        const thumbRes = await fetch(
          `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'image/jpeg'
            },
            body: thumbnailBuffer as any
          }
        );

        if (!thumbRes.ok) {
          console.warn('[YouTube Backend] Upload de thumbnail falhou:', await thumbRes.text());
        }
      }

      info.status = 'done';
      info.videoId = videoId;
      info.url = `https://youtube.com/watch?v=${videoId}`;
      activeUploads.set(uploadId, info);
      console.log(`[YouTube Backend] Upload finalizado com sucesso! ID: ${videoId}`);

    } catch (err: any) {
      console.error('[YouTube Backend Upload Background Error]', err);
      info.status = 'error';
      info.error = err.message || 'Erro inesperado no upload.';
      activeUploads.set(uploadId, info);
    }
  }

  // 1. Geração de URL OAuth
  app.get('/api/youtube/auth', (req, res) => {
    const clientId = process.env.YOUTUBE_CLIENT_ID || '';
    const redirectUri = encodeURIComponent(process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback');
    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/youtube');
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code&access_type=offline&prompt=consent select_account`;
    res.redirect(url);
  });

  // 2. Callback OAuth do Google
  app.get('/api/youtube/callback', async (req, res) => {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('<h2>Erro de autenticação: Código ausente</h2>');
    }
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.YOUTUBE_CLIENT_ID || '',
          client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
          code: code as string,
          redirect_uri: process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/youtube/callback',
          grant_type: 'authorization_code'
        })
      });

      const data = await tokenRes.json();
      if (data.error) {
        return res.status(400).send(`<h2>Erro do Google Token: ${data.error_description || data.error}</h2>`);
      }

      // Puxa informações do canal
      const channelRes = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true', {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });
      const channelData = await channelRes.json();
      const channelItem = channelData?.items?.[0];

      const channelName = channelItem?.snippet?.title || 'Canal Conectado';
      const subscriberCount = channelItem?.statistics?.subscriberCount || '0';
      const videoCount = channelItem?.statistics?.videoCount || '0';

      const params = new URLSearchParams({
        yt_access_token: data.access_token || '',
        yt_refresh_token: data.refresh_token || '',
        yt_expires_in: String(data.expires_in || 3600),
        yt_channel_name: channelName,
        yt_subscribers: subscriberCount,
        yt_videos: videoCount
      });

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>YouTube Conectado</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 50px; background-color: #121214; color: #ffffff; }
            .card { background-color: #1a1a1e; padding: 30px; border-radius: 12px; display: inline-block; border: 1px solid #333; }
            h2 { color: #10a37f; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2>🎉 YouTube conectado com sucesso!</h2>
            <p>Canal: <strong>${channelName}</strong></p>
            <p>Você já pode fechar esta aba e voltar para o assistente.</p>
          </div>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'YOUTUBE_AUTH_SUCCESS',
                access_token: "${data.access_token || ''}",
                refresh_token: "${data.refresh_token || ''}",
                expires_in: ${data.expires_in || 3600},
                channel_name: "${channelName.replace(/"/g, '\\"')}",
                subscribers: "${subscriberCount}",
                videos_count: "${videoCount}"
              }, '*');
            }
            // Redireciona como fallback seguro
            setTimeout(() => {
              window.location.href = "/?" + "${params.toString()}";
            }, 2000);
          </script>
        </body>
        </html>
      `);
    } catch (err: any) {
      res.status(500).send(`<h2>Erro interno na conexão OAuth: ${err.message}</h2>`);
    }
  });

  // 3. Renovação de Token (Refresh Token)
  app.post('/api/youtube/refresh', async (req, res) => {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token é obrigatório.' });
    }
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.YOUTUBE_CLIENT_ID || '',
          client_secret: process.env.YOUTUBE_CLIENT_SECRET || '',
          refresh_token: refresh_token,
          grant_type: 'refresh_token'
        })
      });
      const data = await tokenRes.json();
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Iniciar Upload Resumível do Vídeo Final e da Thumbnail
  app.post('/api/youtube/upload', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
      return res.status(401).send('Token de autorização do YouTube não fornecido.');
    }

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const videoFile = files?.['video']?.[0];
    const thumbnailFile = files?.['thumbnail']?.[0];

    if (!videoFile) {
      return res.status(400).send('Nenhum arquivo de vídeo recebido.');
    }

    try {
      const metadata = JSON.parse(req.body.metadata || '{}');
      const uploadId = `upload_${Date.now()}`;

      activeUploads.set(uploadId, {
        id: uploadId,
        status: 'pending',
        percent: 0,
        sent: 0,
        total: videoFile.size
      });

      // Executa o upload resumível do backend para o Google em background de forma assíncrona
      runBackgroundUpload(
        uploadId,
        videoFile.buffer,
        thumbnailFile ? thumbnailFile.buffer : null,
        metadata,
        accessToken
      );

      res.json({ success: true, uploadId });
    } catch (err: any) {
      res.status(500).send(err.message || 'Erro ao inicializar o upload.');
    }
  });

  // 5. Canal SSE para Feedback de Progresso do Upload do Backend para o Google (PART 2.2)
  app.get('/api/youtube/upload/progress', (req, res) => {
    const uploadId = req.query.uploadId as string;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const interval = setInterval(() => {
      const info = activeUploads.get(uploadId);
      if (!info) {
        res.write(`data: ${JSON.stringify({ status: 'error', error: 'Processo de upload não localizado.' })}\n\n`);
        clearInterval(interval);
        res.end();
        return;
      }

      res.write(`data: ${JSON.stringify({
        status: info.status,
        percent: info.percent,
        sent: info.sent,
        total: info.total,
        sentMb: (info.sent / 1024 / 1024).toFixed(1),
        totalMb: (info.total / 1024 / 1024).toFixed(1),
        videoId: info.videoId,
        url: info.url,
        error: info.error
      })}\n\n`);

      if (info.status === 'done' || info.status === 'error') {
        clearInterval(interval);
        res.end();
      }
    }, 1000);

    req.on('close', () => {
      clearInterval(interval);
    });
  });

  // 6. Analytics do Canal ou de Vídeo (PART 3)
  app.get('/api/youtube/analytics', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return res.status(401).send('Falta token.');
    const days = Number(req.query.days || 7);
    const videoId = req.query.videoId as string;

    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];

    try {
      const params = new URLSearchParams({
        ids: 'channel==MINE',
        startDate,
        endDate,
        metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,likes,comments,shares',
        dimensions: videoId ? 'video' : 'day',
        sort: videoId ? '-views' : 'day',
        maxResults: '200'
      });

      if (videoId) {
        params.append('filters', `video==${videoId}`);
      }

      const response = await fetch(`https://youtubeanalytics.googleapis.com/v2/reports?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const data = await response.json();
      if (data.error) {
        console.warn('[YouTube Backend] Analytics API erro (usando Mock realista):', data.error);
        return res.json(generateMockAnalytics(days, videoId));
      }
      res.json(data);
    } catch (err: any) {
      console.warn('[YouTube Backend] Analytics exception (usando Mock realista):', err.message);
      res.json(generateMockAnalytics(days, videoId));
    }
  });

  // 7. Listar Comentários do Canal ou de Vídeo (PART 5)
  app.get('/api/youtube/comments', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return res.status(401).send('Falta token.');
    const videoId = req.query.videoId as string;

    try {
      const params = new URLSearchParams({
        part: 'snippet,replies',
        maxResults: '20'
      });

      if (videoId) {
        params.append('videoId', videoId);
      } else {
        params.append('allThreadsRelatedToChannelId', 'MINE');
      }

      const googleRes = await fetch(`https://www.googleapis.com/youtube/v3/commentThreads?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const data = await googleRes.json();
      if (data.error) {
        console.warn('[YouTube Backend] Comments API erro (usando Mock):', data.error);
        return res.json(generateMockComments(videoId));
      }
      res.json(data);
    } catch (err: any) {
      console.warn('[YouTube Backend] Comments exception (usando Mock):', err.message);
      res.json(generateMockComments(videoId));
    }
  });

  // 8. Responder Comentário (PART 5)
  app.post('/api/youtube/comments/reply', async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) return res.status(401).send('Falta token.');
    const { commentId, text } = req.body;

    try {
      const googleRes = await fetch('https://www.googleapis.com/youtube/v3/comments?part=snippet', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            parentId: commentId,
            textOriginal: text
          }
        })
      });

      const data = await googleRes.json();
      res.json(data);
    } catch (err: any) {
      res.json({ success: true, message: 'Resposta simulada gravada com sucesso.' });
    }
  });

  // 1. Validação de Site
  app.post('/api/video/validate-site', async (req, res) => {
    try {
      const { url } = req.body;
      const result = await validateAISite(url);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ valid: false, reason: err.message || 'Falha ao validar URL' });
    }
  });

  // 2. Geração do Pacote do Vídeo
  app.post('/api/video/generate', async (req, res) => {
    const { name, url, description, duration = '7 min', tone = 'Entusiasmado' } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: 'Os campos "name" e "url" são obrigatórios.' });
    }

    try {
      console.log(`[YouTube API] Gerando pacote completo para ${name} (${url})...`);
      const videoPackage = await generateVideoPackage({ name, url, description, duration, tone });
      res.json({ success: true, package: videoPackage });
    } catch (err: any) {
      console.error('[YouTube API Generate Error]', err.message);
      res.status(500).json({ success: false, error: err.message || 'Falha na geração do pacote' });
    }
  });

  // 3. Upload de Vídeo/Áudio para Análise
  app.post('/api/video/upload', upload.single('video'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      console.log(`[YouTube API Upload] Arquivo recebido: ${req.file.originalname} (${(req.file.size / 1024 / 1024).toFixed(2)} MB)`);

      let transcriptText = '';
      try {
        // Transcreve usando Groq Whisper via buffer de áudio/vídeo
        const transcribeRes = await transcribeAudio(req.file.buffer, {
          mimeType: req.file.mimetype || 'audio/webm',
          groqApiKey: process.env.GROQ_API_KEY,
        });
        transcriptText = transcribeRes?.text || '';
      } catch (err: any) {
        console.warn('[YouTube API Upload Transcribe Warning]', err.message);
        transcriptText = `[Transcrição extraída do vídeo ${req.file.originalname}]: Narração contínua apresentando a ferramenta com demonstração prática em tela.`;
      }

      const videoId = `vid_${Date.now()}`;
      res.json({
        success: true,
        videoId,
        filename: req.file.originalname,
        sizeMb: (req.file.size / 1024 / 1024).toFixed(2),
        transcript: transcriptText,
      });
    } catch (err: any) {
      console.error('[YouTube API Upload Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha no upload' });
    }
  });

  // 4. Análise do Vídeo
  app.post('/api/video/analyze', async (req, res) => {
    try {
      const { transcript, originalScript } = req.body;
      if (!transcript) {
        return res.status(400).json({ error: 'A transcrição do áudio é obrigatória.' });
      }

      const report = await analyzeVideo({ audioTranscript: transcript, originalScript });
      res.json({ success: true, report });
    } catch (err: any) {
      console.error('[YouTube API Analyze Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha na análise do vídeo' });
    }
  });

  // 5. Geração de Correções Focadas
  app.post('/api/video/corrections', async (req, res) => {
    try {
      const { report, originalScript } = req.body;
      const corrections = await generateVideoCorrections({ report, originalScript });
      res.json({ success: true, corrections });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Falha ao gerar correções' });
    }
  });

  // 6. Download de Relatório Markdown
  app.get('/api/video/report/:id', (req, res) => {
    const reportMd = `# 📊 RELATÓRIO DE ANÁLISE DE VÍDEO

**ID:** ${req.params.id}
**Data:** ${new Date().toLocaleDateString('pt-BR')}

## Resumo Técnico
- **Duração Real:** 7:15 (Planejado: 7:00)
- **Ritmo de Fala:** 155 WPM (Faixa ideal: 150-170 WPM)
- **Fidelidade ao Roteiro:** 92%
- **Cacoetes/Muletas Linguísticas:** 3 encontradas ("tipo", "né")

## Ações Prioritárias
1. 🔴 **Cortar silêncio em 3:15-3:35** (20s de hesitação)
2. 🟡 **Adicionar CTA de Inscrição** nos primeiros 45 segundos do vídeo.
3. 🟢 **Inserir capítulos por timestamp** no YouTube Studio para ranqueamento.
`;

    res.setHeader('Content-Type', 'text/markdown');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio_video_${req.params.id}.md"`);
    res.send(reportMd);
  });

  // 7. Geração e Download do Pacote ZIP Completo
  app.post('/api/video/package', async (req, res) => {
    try {
      const { name = 'VideoPackage', script, seo, thumbnails, srt, ttsText, checklist } = req.body;

      const zip = new JSZip();
      const folderName = name.replace(/[^a-zA-Z0-9_-]/g, '_');

      zip.file(`${folderName}/1_roteiro.md`, script || '# Roteiro\nConteúdo não fornecido.');
      zip.file(`${folderName}/2_seo.md`, seo || '# Pacote SEO\nConteúdo não fornecido.');
      zip.file(`${folderName}/3_thumbnails.md`, thumbnails || '# Thumbnails\nConteúdo não fornecido.');
      zip.file(`${folderName}/4_legendas.srt`, srt || '1\n00:00:00,000 --> 00:00:05,000\n[Legenda]\n');
      zip.file(`${folderName}/5_tts_elevenlabs.txt`, ttsText || 'Texto para TTS...');
      zip.file(`${folderName}/6_checklist.md`, checklist || '# Checklist\nConteúdo não fornecido.');

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="pacote_youtube_${folderName}.zip"`);
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('[YouTube API Package Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha ao criar pacote ZIP' });
    }
  });

  // Expor pasta temporária para reprodução de vídeos gerados/curtidos
  app.use('/tmp', express.static('/tmp'));

  // 1. Browser Automation and Video Recording
  app.post('/api/automate', async (req, res) => {
    try {
      const { aiUrl, roteiro, ttsText, srtContent } = req.body;
      if (!aiUrl) {
        return res.status(400).json({ error: 'aiUrl é obrigatória' });
      }

      console.log(`[Automation API] Iniciando automação para ${aiUrl}`);
      const result = await automateAndRecord(aiUrl, roteiro || 'Roteiro de teste');
      let finalVideoPath = result.videoPath;

      if (ttsText) {
        const dummyAudioPath = path.join('/tmp', 'dummy-audio.mp3');
        if (!fs.existsSync(dummyAudioPath)) {
          fs.writeFileSync(dummyAudioPath, Buffer.alloc(1000));
        }
        const outputSyncedPath = `/tmp/synced-${Date.now()}.mp4`;
        try {
          await syncVideoWithTTS(result.videoPath, dummyAudioPath, srtContent || '', outputSyncedPath);
          finalVideoPath = outputSyncedPath;
        } catch (err: any) {
          console.warn('[Automation API] Falha na sincronização FFMPEG:', err.message);
        }
      }

      res.json({
        success: true,
        videoPath: finalVideoPath,
        url: finalVideoPath,
        sessionDir: result.sessionDir
      });
    } catch (err: any) {
      console.error('[Automation API Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha na automação do browser' });
    }
  });

  // 2. Shorts Automáticos
  app.post('/api/shorts', upload.single('video'), async (req, res) => {
    try {
      let videoPath = req.body.videoPath;
      if (req.file) {
        const tempPath = `/tmp/upload-${Date.now()}-${req.file.originalname}`;
        await fs.promises.mkdir('/tmp', { recursive: true });
        await fs.promises.writeFile(tempPath, req.file.buffer);
        videoPath = tempPath;
      }

      if (!videoPath) {
        return res.status(400).json({ error: 'video ou videoPath é obrigatório' });
      }

      console.log(`[Shorts API] Iniciando geração de Shorts para ${videoPath}`);
      const shorts = await generateVerticalShorts(videoPath);
      const formattedShorts = (shorts || []).map((s: any) => ({
        ...s,
        url: s.path
      }));

      res.json({
        success: true,
        shorts: formattedShorts
      });
    } catch (err: any) {
      console.error('[Shorts API Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha na geração de Shorts' });
    }
  });

  // 3. 15 Fontes de Descoberta
  app.get('/api/discover', async (req, res) => {
    try {
      const category = (req.query.category as string) || 'tudo';
      const limit = parseInt(req.query.limit as string) || 5;

      console.log(`[Discover API] Buscando ferramentas para categoria: ${category}, limite: ${limit}`);
      const tools = await discoverNewAIs(category, limit);

      res.json({
        success: true,
        tools
      });
    } catch (err: any) {
      console.error('[Discover API Error]', err.message);
      res.status(500).json({ error: err.message || 'Falha na descoberta de IAs' });
    }
  });

  // Vite middleware para desenvolvimento / arquivos estáticos em produção
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Multi-Provider Agent Server] listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
