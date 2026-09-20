/**
 * Processador de Arquivos Multimodais (PDF, CSV, Imagens)
 * - PDF: Extrai texto puro página a página via pdfjs-dist
 * - CSV: Converte linhas e colunas em tabela Markdown
 * - Imagens: Converte para Base64 com tipo MIME para passar ao Gemini Vision
 */

import * as pdfjsLib from 'pdfjs-dist';

// Configura o worker do pdfjs para carregar via CDN oficial da mesma versão
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export interface ParsedFileResult {
  name: string;
  type: 'pdf' | 'csv' | 'image' | 'video' | 'text' | 'unknown';
  textContent?: string;
  imageBase64?: string;
  mimeType?: string;
  sizeBytes: number;
}

/**
 * Converte um arquivo do usuário (File) no formato adequado para o Agente
 */
export async function parseUploadedFile(file: File): Promise<ParsedFileResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Arquivos de Vídeo (MP4, WEBM, MOV, AVI, MKV)
  if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension)) {
    const base64 = await fileToBase64(file);
    return {
      name: file.name,
      type: 'video',
      imageBase64: base64,
      mimeType: file.type || `video/${extension === 'mov' ? 'quicktime' : extension}`,
      sizeBytes: file.size,
    };
  }

  // 2. Arquivos de Imagem (JPEG, PNG, WEBP, GIF)
  if (file.type.startsWith('image/')) {
    const base64 = await fileToBase64(file);
    return {
      name: file.name,
      type: 'image',
      imageBase64: base64,
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size,
    };
  }

  // 2. Arquivos PDF (.pdf)
  if (extension === 'pdf' || file.type === 'application/pdf') {
    const text = await extractTextFromPdf(file);
    return {
      name: file.name,
      type: 'pdf',
      textContent: text,
      sizeBytes: file.size,
    };
  }

  // 3. Planilhas CSV / TSV (.csv, .tsv)
  if (extension === 'csv' || extension === 'tsv' || file.type.includes('csv')) {
    const rawText = await file.text();
    const markdownTable = convertCsvToMarkdown(rawText, extension === 'tsv' ? '\t' : ',');
    return {
      name: file.name,
      type: 'csv',
      textContent: markdownTable,
      sizeBytes: file.size,
    };
  }

  // 4. Arquivos de Texto Puro / Código (.txt, .md, .py, .js, .json)
  const textContent = await file.text();
  return {
    name: file.name,
    type: 'text',
    textContent: textContent.slice(0, 50000), // limite de segurança
    sizeBytes: file.size,
  };
}

/**
 * Extração de texto de PDF com pdfjs-dist
 */
async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const extractedPages: string[] = [];

    const pagesToRead = Math.min(numPages, 20); // Lê até as primeiras 20 páginas
    for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      if (pageText.trim()) {
        extractedPages.push(`[Página ${pageNum}]\n${pageText.trim()}`);
      }
    }

    if (extractedPages.length === 0) {
      return `[PDF: ${file.name} - Não foi possível extrair texto ou o PDF contém apenas imagens digitalizadas]`;
    }

    return `[Documento PDF Extraído: ${file.name} (${numPages} páginas)]\n\n${extractedPages.join('\n\n')}`;
  } catch (err: any) {
    console.warn('Erro ao processar PDF via pdfjs:', err);
    return `[Erro ao extrair conteúdo do PDF ${file.name}: ${err.message}]`;
  }
}

/**
 * Conversor de CSV para Tabela Markdown limpa
 */
export function convertCsvToMarkdown(csvText: string, delimiter = ','): string {
  const lines = csvText.trim().split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '';

  const parseLine = (line: string): string[] => {
    // Parser simples que lida com delimitador
    const tokens: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === delimiter && !inQuotes) {
        tokens.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    tokens.push(current.trim());
    return tokens;
  };

  const headers = parseLine(lines[0]);
  const separator = headers.map(() => '---');

  const formattedRows: string[] = [];
  formattedRows.push(`| ${headers.join(' | ')} |`);
  formattedRows.push(`| ${separator.join(' | ')} |`);

  const maxRows = Math.min(lines.length, 50); // Até 50 linhas para não estourar contexto
  for (let i = 1; i < maxRows; i++) {
    const row = parseLine(lines[i]);
    // Preenche colunas faltantes se houver
    while (row.length < headers.length) row.push('');
    formattedRows.push(`| ${row.slice(0, headers.length).join(' | ')} |`);
  }

  const extraNotice = lines.length > maxRows ? `\n*(Mostrando primeiras ${maxRows} linhas de ${lines.length})*` : '';
  return `### Dados da Planilha (${headers.length} colunas, ${lines.length - 1} linhas)\n\n` + formattedRows.join('\n') + extraNotice;
}

/**
 * Converte File para Base64 Data URL
 */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
