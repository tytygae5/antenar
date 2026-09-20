import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { ChatView } from './components/ChatView';
import { SettingsModal, SettingsState } from './components/SettingsModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { clearAllSemanticCache } from './lib/indexedDb';
import { sanitizeCache } from './utils/cache';

const DEFAULT_SETTINGS: SettingsState = {
  systemPrompt: '',
  geminiModel: 'gemini-flash-latest',
  enableCache: true,
  enableRag: true,
  selfRefinement: false,
  mixtureOfAgents: false,
  autonomousAgent: false,
  showDebugLogs: false,
};

async function hardReset() {
  if (typeof window === 'undefined') return;
  if (!sessionStorage.getItem('hardResetDone')) {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('hardResetDone', '1');
    if (window.indexedDB && window.indexedDB.databases) {
      try {
        const dbs = await window.indexedDB.databases();
        for (const db of dbs) {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        }
      } catch (e) {
        console.warn('Erro ao resetar IndexedDB:', e);
      }
    }
    location.reload();
  }
}

export function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);

  // Hard reset no primeiro boot + sanitização de cache
  useEffect(() => {
    hardReset();
    sanitizeCache();
  }, []);

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('agent_settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed.systemPrompt &&
          /bots|e-?mail|contas|automa[çc][ãa]o|detec[çc][ãa]o|CAPTCHA|contornar|bypass|n[ãa]o posso|recuso/i.test(
            parsed.systemPrompt
          )
        ) {
          parsed.systemPrompt = '';
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Keyboard shortcut: Esc to close settings modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    localStorage.setItem('agent_settings', JSON.stringify(newSettings));
  };

  const handleClearCache = async () => {
    await clearAllSemanticCache();
    await sanitizeCache();
    try {
      await fetch('/api/cache/clear', { method: 'POST' });
    } catch (e) {
      console.warn('Erro ao limpar cache no backend:', e);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans selection:bg-[#10a37f]/30">
        {/* HEADER MÍNIMO: LOGO + CONFIGURAÇÕES ⚙️ */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between shadow-md">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#10a37f]/10 border border-[#10a37f]/30 flex items-center justify-center text-[#10a37f] shadow-inner">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-100 tracking-tight leading-none">💬 Agente IA</h1>
              <span className="text-[10px] text-[#10a37f] font-medium">Interface Única • YouTube & Conteúdo</span>
            </div>
          </div>

          {/* BOTÃO CONFIGURAÇÕES ⚙️ */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all border border-transparent hover:border-slate-700 cursor-pointer"
            title="Configurações e System Prompt (Esc para fechar)"
            id="btn-open-settings"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </header>

        {/* CONTEÚDO PRINCIPAL: CHAT ÚNICO */}
        <main className="flex-1 p-2 md:p-4 max-w-7xl mx-auto w-full">
          <ChatView
            systemPrompt={settings.systemPrompt}
            geminiModel={settings.geminiModel}
            onClearCacheGlobal={handleClearCache}
            showDebugLogs={settings.showDebugLogs}
          />
        </main>

        {/* MODAL DE CONFIGURAÇÕES ⚙️ */}
        <SettingsModal
          isOpen={isSettingsOpen}
          settings={settings}
          onSave={handleSaveSettings}
          onClearCache={handleClearCache}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
