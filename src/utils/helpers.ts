import { PromptItem } from '../types';

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text).then(() => true).catch(() => false);
  }
  // Fallback
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    textArea.remove();
    return Promise.resolve(successful);
  } catch {
    return Promise.resolve(false);
  }
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface ExtractedSection {
  title: string;
  line: number;
  type: 'xml' | 'header' | 'rule';
}

export function extractSections(content: string): ExtractedSection[] {
  const sections: ExtractedSection[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    // Match XML tags like <system_instructions>, <rules>, <guidelines>, etc.
    const xmlMatch = trimmed.match(/^<([a-zA-Z0-9_\-]+)(?:\s+[^>]*)?>$/);
    if (xmlMatch && !xmlMatch[1].startsWith('/')) {
      const tag = xmlMatch[1];
      if (['rules', 'instructions', 'system_instructions', 'guidelines', 'tools', 'context', 'examples', 'environment_constraints', 'communication_style', 'scratchpad'].includes(tag.toLowerCase())) {
        sections.push({
          title: `<${tag}>`,
          line: index + 1,
          type: 'xml'
        });
      }
    }
    // Match Markdown headers
    const headerMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headerMatch) {
      sections.push({
        title: headerMatch[2],
        line: index + 1,
        type: 'header'
      });
    }
  });

  return sections.slice(0, 30);
}

export interface ParsedToolDefinition {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

export function parseToolSchemas(item: PromptItem): ParsedToolDefinition[] {
  if (!item.parsedJson) return [];

  try {
    const raw = JSON.parse(item.parsedJson);
    const tools: ParsedToolDefinition[] = [];

    // Format 1: Array of tools [{ name, description, parameters }]
    let rawList: any[] = [];
    if (Array.isArray(raw)) {
      rawList = raw;
    } else if (raw.tools && Array.isArray(raw.tools)) {
      rawList = raw.tools;
    } else if (typeof raw === 'object' && raw !== null) {
      // Object keyed by tool name
      rawList = Object.entries(raw).map(([key, val]: [string, any]) => {
        if (typeof val === 'object' && val !== null) {
          return { name: key, ...val };
        }
        return { name: key, description: String(val) };
      });
    }

    for (const t of rawList) {
      if (!t || typeof t !== 'object') continue;
      
      const toolName = t.name || t.function?.name || t.title || 'unnamed_tool';
      const description = t.description || t.function?.description || '';
      
      const paramsObj = t.parameters || t.function?.parameters || t.input_schema || {};
      const properties = paramsObj.properties || {};
      const requiredList: string[] = Array.isArray(paramsObj.required) ? paramsObj.required : [];

      const params = Object.entries(properties).map(([pName, pVal]: [string, any]) => ({
        name: pName,
        type: pVal?.type || typeof pVal,
        required: requiredList.includes(pName),
        description: pVal?.description || ''
      }));

      tools.push({
        name: toolName,
        description,
        parameters: params
      });
    }

    return tools;
  } catch {
    return [];
  }
}
