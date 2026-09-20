import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('[ErrorBoundary]', error, info);
    if (error?.message?.includes('Quota') || error?.message?.includes('quota') || error?.name === 'QuotaExceededError') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('chat_session_msgs_')) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch (e) {
        console.warn('[ErrorBoundary] Erro ao limpar localStorage:', e);
      }
    }
  }

  handleRetry = () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('chat_session_msgs_')) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 16, color: '#ff6b6b', background: '#1a1d24', borderRadius: 8, margin: 16 }}>
          ❌ Algo quebrou: {(this.state.error as any)?.message}
          <button 
            onClick={this.handleRetry}
            style={{ marginLeft: 12, padding: '4px 12px', background: '#10a37f', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          >
            Tentar de novo
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
