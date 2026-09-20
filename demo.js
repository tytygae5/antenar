/**
 * Script de Demonstração do Agente Multi-Provedor de IA
 * Modelos Auditados e Verificados (Setembro de 2026):
 * - OpenRouter: openrouter/free, deepseek/deepseek-v4-flash-0731:free
 * - Groq LPU: openai/gpt-oss-120b, openai/gpt-oss-20b, whisper-large-v3
 * - Google: gemini-3.6-flash, gemini-3.1-flash-lite
 * - Alibaba Cloud: qwen-plus
 * - Zhipu AI: glm-4-flash
 * - Puter.js: openai/gpt-5, anthropic/claude-sonnet-4.5, x-ai/grok-4, openai/gpt-4o-mini
 */

import { askAgent, healthCheck, TaskTypes } from './agent.js';

function printDivider(title) {
  console.log('\n' + '='.repeat(70));
  console.log(`  ${title}`);
  console.log('='.repeat(70));
}

async function runDemo() {
  console.log('🚀 Iniciando Teste do Agente de IA Multi-Provedor ($0.00 Tier Priority)');
  console.log('ℹ️  Modo: Resiliência Ativa com Fallback Automático, Dry-Run e Health Check');

  // 0. Teste Modo Dry-Run
  printDivider('TESTE 0: MODO DRY-RUN (Validação de Roteamento sem Gastar Cota)');
  const dryRes = await askAgent('Analise passo a passo se P=NP', { dryRun: true });
  console.log(`📌 Tarefa Detectada: ${dryRes.taskType}`);
  console.log(`⚙️ Modelo Planejado: ${dryRes.model} (${dryRes.provider})`);
  console.log(`💬 Resposta Simulada: ${dryRes.response}`);
  console.log('\n--- Rastro de Roteamento Simulado (Dry-Run Trace) ---');
  console.table(dryRes.fallbackTrace);

  // 1. Texto Geral
  printDivider('TESTE 1: GERAÇÃO DE TEXTO GERAL');
  const prompt1 = 'Explique em três tópicos curtos o conceito de computação quântica para iniciantes.';
  console.log(`💬 Consulta: "${prompt1}"`);
  
  const res1 = await askAgent(prompt1);
  console.log(`\n📌 Tarefa: ${res1.taskType}`);
  console.log(`⚡ Provedor Vencedor: ${res1.provider.toUpperCase()} (${res1.model})`);
  console.log(`⏱️ Latência Total: ${res1.latencyMs}ms | Custo: ${res1.cost}`);
  console.log('\n--- Resposta ---');
  console.log(res1.response.trim());
  console.log('\n--- Rastro de Execução / Fallback Trace ---');
  console.table(res1.fallbackTrace);

  // 2. Raciocínio Complexo / Teoria da Complexidade
  printDivider('TESTE 2: RACIOCÍNIO COMPLEXO (P=NP)');
  const prompt2 = 'Analise passo a passo se P=NP é decidível em tempo polinomial pela perspectiva da teoria da complexidade.';
  console.log(`💬 Consulta: "${prompt2}"`);

  const res2 = await askAgent(prompt2, { taskType: TaskTypes.COMPLEX_REASONING });
  console.log(`\n📌 Tarefa: ${res2.taskType}`);
  console.log(`⚡ Provedor Vencedor: ${res2.provider.toUpperCase()} (${res2.model})`);
  console.log(`⏱️ Latência Total: ${res2.latencyMs}ms | Custo: ${res2.cost}`);
  console.log('\n--- Resposta ---');
  console.log(res2.response.slice(0, 300) + '... [truncado]');
  console.log('\n--- Rastro de Execução / Fallback Trace ---');
  console.table(res2.fallbackTrace);

  // 3. Health Check Global dos Provedores
  printDivider('TESTE 3: HEALTH CHECK DOS PROVEDORES (Promise.allSettled)');
  console.log('Testando conectividade de todos os provedores em paralelo...');
  const healthResults = await healthCheck();
  console.table(healthResults);

  printDivider('DEMO CONCLUÍDA COM SUCESSO');
}

runDemo().catch((err) => {
  console.error('❌ Erro na demonstração:', err);
});
