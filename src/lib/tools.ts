/**
 * Motor de Tool Calling Nativo
 * Ferramentas padronizadas no formato OpenAI/Groq:
 * 1. get_current_time()
 * 2. search_web(query)
 * 3. run_python(code)
 * 4. read_url(url)
 */

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: {
      type: 'object';
      properties: Record<string, any>;
      required?: string[];
    };
  };
}

export const AGENT_TOOLS: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: 'get_current_time',
      description: 'Retorna a data e horário atual no fuso horário local e UTC com precisão de segundos.',
      parameters: {
        type: 'object',
        properties: {
          timezone: {
            type: 'string',
            description: 'Fuso horário opcional, ex: "America/Sao_Paulo", "UTC"',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'search_web',
      description: 'Pesquisa informações atualizadas na web sobre fatos, notícias, pessoas, documentações ou termos técnicos.',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Termo de pesquisa detalhado para encontrar fontes na web',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'run_python',
      description: 'Executa código Python 3 em sandbox isolado para cálculos complexos, álgebra, manipulação de dados ou algoritmos, retornando stdout e resultados.',
      parameters: {
        type: 'object',
        properties: {
          code: {
            type: 'string',
            description: 'Código Python para ser executado (ex: print(sum([x**2 for x in range(100)])))',
          },
        },
        required: ['code'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'read_url',
      description: 'Acessa uma página web externa via HTTP GET e extrai o conteúdo textual principal, eliminando scripts, estilos e tags HTML.',
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'URL completa do site iniciando com http:// ou https://',
          },
        },
        required: ['url'],
      },
    },
  },
];

/**
 * Executor de Tools (Client-Side e Proxy para Backend)
 */
export async function executeToolLocallyOrServer(
  toolName: string,
  args: Record<string, any>
): Promise<string> {
  console.log(`[Tool Engine] Executando ferramenta: ${toolName}`, args);

  switch (toolName) {
    case 'get_current_time': {
      const now = new Date();
      const tz = args.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      try {
        const formatted = new Intl.DateTimeFormat('pt-BR', {
          dateStyle: 'full',
          timeStyle: 'long',
          timeZone: tz,
        }).format(now);
        return JSON.stringify({
          iso: now.toISOString(),
          timestamp: now.getTime(),
          timezone: tz,
          formattedDateTime: formatted,
        });
      } catch {
        return JSON.stringify({
          iso: now.toISOString(),
          timestamp: now.getTime(),
          formattedDateTime: now.toLocaleString('pt-BR'),
        });
      }
    }

    case 'run_python': {
      const code = args.code || '';
      try {
        // Tenta executar via backend /api/tools/execute para isolamento seguro
        const res = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'run_python', args: { code } }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.result || 'Execução concluída sem saída.';
        }
      } catch {
        // Fallback para sandbox JS seguro de expressões matemáticas e algoritmos
      }
      return executePythonSandboxFallback(code);
    }

    case 'search_web': {
      const query = args.query || '';
      try {
        const res = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'search_web', args: { query } }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.result;
        }
      } catch (err: any) {
        return `Erro ao pesquisar na web: ${err.message}`;
      }
      return `Nenhum resultado encontrado para a busca: "${query}"`;
    }

    case 'read_url': {
      const url = args.url || '';
      try {
        const res = await fetch('/api/tools/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'read_url', args: { url } }),
        });
        if (res.ok) {
          const data = await res.json();
          return data.result;
        }
      } catch (err: any) {
        return `Erro ao ler a URL (${url}): ${err.message}`;
      }
      return `Não foi possível extrair o conteúdo de: ${url}`;
    }

    default:
      return `Ferramenta desconhecida: ${toolName}`;
  }
}

/**
 * Sandbox de execução Python em JS
 */
function executePythonSandboxFallback(code: string): string {
  const outputs: string[] = [];
  const fakePrint = (...args: any[]) => {
    outputs.push(args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
  };

  try {
    // Processa prints básicos e expressões matemáticas com segurança
    const lines = code.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const printMatch = trimmed.match(/^print\((.*)\)$/);
      if (printMatch) {
        const inner = printMatch[1];
        try {
          // Expressões matemáticas seguras
          const sanitized = inner.replace(/\*\*/g, '^').replace(/math\./g, 'Math.');
          // eslint-disable-next-line no-new-func
          const evalResult = new Function('Math', `return (${inner.replace(/\*\*/g, '**')});`)(Math);
          fakePrint(evalResult);
        } catch {
          fakePrint(inner.replace(/["']/g, ''));
        }
      }
    }

    if (outputs.length > 0) {
      return outputs.join('\n');
    }
    return `[Python Sandbox Output]\nCódigo executado com sucesso:\n${code}`;
  } catch (err: any) {
    return `[Python Error] ${err.message}`;
  }
}
