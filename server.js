import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { askAgent, TaskTypes, ROUTING_TABLE, healthCheck } from './agent.js';

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '15mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Multi-Provider AI Agent API',
      timestamp: new Date().toISOString(),
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
    } catch (err) {
      res.status(500).json({ error: err.message || 'Falha no health-check' });
    }
  });

  // Prova de Funcionamento dos Secrets no Backend
  app.get('/api/debug', (req, res) => {
    res.json({
      envLoaded: {
        OPENROUTER_API_KEY: Boolean(process.env.OPENROUTER_API_KEY),
        GROQ_API_KEY: Boolean(process.env.GROQ_API_KEY),
        GEMINI_API_KEY: Boolean(process.env.GEMINI_API_KEY),
        DASHSCOPE_API_KEY: Boolean(process.env.DASHSCOPE_API_KEY),
        ZHIPU_API_KEY: Boolean(process.env.ZHIPU_API_KEY),
        HUGGINGFACE_TOKEN: Boolean(process.env.HUGGINGFACE_TOKEN),
      },
      dryRunDefault: false,
      providers: ['openrouter', 'groq', 'gemini'],
    });
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
        nexa: Boolean(process.env.NEXA_API_KEY),
        cometapi: Boolean(process.env.COMETAPI_KEY),
      },
    });
  });

  // Endpoint Principal de IA no Backend (/api/chat)
  app.post('/api/chat', async (req, res) => {
    try {
      const { prompt, taskType, imageBase64, audioFile, dryRun = false } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({
          response: 'O campo "prompt" é obrigatório.',
          success: false,
          provider: 'none',
          model: 'none',
          fallbackTrace: [],
        });
      }

      const options = {
        dryRun: Boolean(dryRun),
        taskType: taskType || undefined,
        imageBase64: imageBase64 || undefined,
        audioFile: audioFile || undefined,
        geminiApiKey: process.env.GEMINI_API_KEY,
        openrouterApiKey: process.env.OPENROUTER_API_KEY,
        groqApiKey: process.env.GROQ_API_KEY,
        dashscopeApiKey: process.env.DASHSCOPE_API_KEY,
        zhipuApiKey: process.env.ZHIPU_API_KEY,
        siliconflowApiKey: process.env.SILICONFLOW_API_KEY,
        huggingfaceToken: process.env.HUGGINGFACE_TOKEN,
        nexaApiKey: process.env.NEXA_API_KEY,
        cometApiKey: process.env.COMETAPI_KEY,
      };

      const result = await askAgent(prompt, options);
      res.json(result);
    } catch (err) {
      console.error('[API /api/chat error]', err);
      res.status(500).json({
        response: `Erro interno no servidor: ${err.message || err}`,
        success: false,
        provider: 'none',
        model: 'none',
        fallbackTrace: [],
      });
    }
  });

  // Execução do Agente com Fallback Inteligente (Compatibilidade legada)
  app.post('/api/ask-agent', async (req, res) => {
    try {
      const { prompt, options = {} } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'O campo "prompt" é obrigatório.' });
      }

      const mergedOptions = {
        ...options,
        geminiApiKey: options.geminiApiKey || process.env.GEMINI_API_KEY,
        openrouterApiKey: options.openrouterApiKey || process.env.OPENROUTER_API_KEY,
        groqApiKey: options.groqApiKey || process.env.GROQ_API_KEY,
        dashscopeApiKey: options.dashscopeApiKey || process.env.DASHSCOPE_API_KEY,
        zhipuApiKey: options.zhipuApiKey || process.env.ZHIPU_API_KEY,
        siliconflowApiKey: options.siliconflowApiKey || process.env.SILICONFLOW_API_KEY,
        huggingfaceToken: options.huggingfaceToken || process.env.HUGGINGFACE_TOKEN,
        nexaApiKey: options.nexaApiKey || process.env.NEXA_API_KEY,
        cometApiKey: options.cometApiKey || process.env.COMETAPI_KEY,
      };

      const result = await askAgent(prompt, mergedOptions);
      res.json(result);
    } catch (err) {
      console.error('[API ask-agent error]', err);
      res.status(500).json({
        error: err.message || 'Erro interno ao processar a requisição',
        success: false,
      });
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
