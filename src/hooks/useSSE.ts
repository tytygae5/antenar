import { useState, useCallback } from 'react';
import { VideoPackage, VideoAnalysisReport } from '../types';

export interface StepItem {
  index: number;
  total: number;
  label: string;
  status: 'done' | 'running' | 'pending';
}

export interface StreamEventPayload {
  type: 'step' | 'chunk' | 'artifact' | 'done' | 'error';
  index?: number;
  total?: number;
  label?: string;
  status?: 'done' | 'running' | 'pending';
  delta?: string;
  kind?: 'video_package' | 'video_review';
  package?: VideoPackage;
  report?: VideoAnalysisReport;
  result?: any;
  error?: string;
}

export function useSSE() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [steps, setSteps] = useState<StepItem[]>([]);
  const [artifact, setArtifact] = useState<{ kind: 'video_package' | 'video_review'; package?: VideoPackage; report?: VideoAnalysisReport } | null>(null);

  const processStream = useCallback(async (
    url: string,
    body: any,
    onChunk: (text: string) => void,
    onEvent?: (data: StreamEventPayload) => void
  ) => {
    setIsStreaming(true);
    setSteps([]);
    setArtifact(null);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({ ...body, stream: true }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.response || errJson.error || `HTTP ${res.status}`);
      }

      if (!res.body) {
        throw new Error('Servidor não retornou fluxo de dados.');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;

          if (trimmed.startsWith('data: ')) {
            try {
              const data: StreamEventPayload = JSON.parse(trimmed.slice(6));

              if (onEvent) onEvent(data);

              if (data.type === 'step' && data.index && data.total && data.label) {
                setSteps((prev) => {
                  const existingIdx = prev.findIndex((s) => s.index === data.index);
                  const newItem: StepItem = {
                    index: data.index!,
                    total: data.total!,
                    label: data.label!,
                    status: data.status || 'running',
                  };
                  if (existingIdx >= 0) {
                    const copy = [...prev];
                    copy[existingIdx] = newItem;
                    return copy;
                  }
                  return [...prev, newItem];
                });
              } else if (data.type === 'chunk' && data.delta) {
                onChunk(data.delta);
              } else if (data.type === 'artifact' && data.kind) {
                setArtifact({
                  kind: data.kind,
                  package: data.package,
                  report: data.report,
                });
              } else if (data.type === 'done' && data.result) {
                if (data.result.package) {
                  setArtifact({ kind: 'video_package', package: data.result.package });
                }
                if (data.result.report) {
                  setArtifact({ kind: 'video_review', report: data.result.report });
                }
              }
            } catch (e) {
              // Ignore single line parse error
            }
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return {
    isStreaming,
    steps,
    artifact,
    processStream,
    setSteps,
    setArtifact,
  };
}
