# Atena AI Studio — Assistente de Canal YouTube de IAs 🎬

Assistente Profissional para Criadores de Conteúdo de canais no YouTube focados no nicho: **"IAs novas que tenham site oficial público e gratuito"**.

---

## 🚀 Como Usar as 2 Abas Principais

### Aba 1 — 🎬 Criar Vídeo
1. Digite o **Nome da IA** (ex: `Gamma App`) e o **Site Oficial** (ex: `gamma.app`).
2. Opcionalmente informe o que ela faz (se deixado em branco, o agente pesquisa automaticamente no site).
3. Escolha a **Duração** (7 min, 10 min ou 15 min) e o **Tom de Voz** (Entusiasmado, Analítico ou Didático).
4. Clique em **🎬 Gerar Pacote do Vídeo**.
5. Receba em menos de 60 segundos:
   - 📝 **Roteiro estruturado** (1050-1200 palavras com marcações TTS e [B-ROLL])
   - 📋 **Pacote SEO** (5 títulos de alto CTR, descrição com timestamps, 30 tags e redes sociais)
   - 🖼️ **5 Thumbnails** (texto, descrição visual e prompts Midjourney/DALL-E)
   - 📄 **Arquivo .SRT** de legendas sincronizadas
   - 🎙️ **Texto para TTS** formatado para ElevenLabs / Fish Audio
   - ✅ **Checklist de Produção**
   - 📥 **Download de Pacote Completo (.ZIP)**

---

### Aba 2 — 🔍 Revisar Vídeo (Post-Production)
1. Faça upload do vídeo pronto em MP4/WEBM ou do áudio em MP3/M4A (até 500MB).
2. Opcionalmente cole o Roteiro Original Planejado.
3. Clique em **▶️ Analisar Vídeo**.
4. O agente transcreve via **Groq Whisper Large V3** e entrega:
   - ⏱️ Duração real vs planejada
   - 🗣️ Ritmo de fala em WPM (palavras/minuto)
   - 📖 Fidelidade ao roteiro original (%)
   - 🔁 Identificação e contagem de muletas linguísticas ("tipo", "né", "sabe")
   - 🔇 Linha do tempo de silêncios longos (>3s)
   - 🎯 Avaliação do gancho (primeiros 15s) e verificação de CTA
   - 🔴 Card de Ações Prioritárias
5. Clique em **🎬 Gerar Correções** para obter a reescrita focada dos trechos problemáticos prontos para regravar.

---

## 🛠️ Configuração de Ambiente

Crie um arquivo `.env` na raiz:

```env
GEMINI_API_KEY="sua_chave_gemini"
GROQ_API_KEY="sua_chave_groq"
OPENROUTER_API_KEY="sua_chave_openrouter"
ELEVENLABS_API_KEY="sua_chave_elevenlabs_opcional"
```

Inicie o servidor:

```bash
npm run dev
```

Acesse em: `http://localhost:3000`
