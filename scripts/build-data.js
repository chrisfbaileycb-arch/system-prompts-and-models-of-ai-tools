import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Directories to skip
const IGNORED_DIRS = new Set([
  'node_modules',
  '.git',
  '.github',
  'dist',
  'src',
  'scripts',
  'public',
  'assets'
]);

const IGNORED_FILES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'vite.config.ts',
  'metadata.json',
  '.env',
  '.env.example'
]);

function getCategory(folderName, subpath) {
  const lower = (folderName + ' ' + subpath).toLowerCase();
  if (lower.includes('devin') || lower.includes('manus') || lower.includes('claude code') || lower.includes('augment') || lower.includes('poke') || lower.includes('traycer')) {
    return 'Autonomous Coding Agents';
  }
  if (lower.includes('cursor') || lower.includes('windsurf') || lower.includes('vscode') || lower.includes('xcode') || lower.includes('trae') || lower.includes('qoder') || lower.includes('codebuddy') || lower.includes('kiro')) {
    return 'IDE & Editor Assistants';
  }
  if (lower.includes('lovable') || lower.includes('v0') || lower.includes('bolt') || lower.includes('same.dev') || lower.includes('replit') || lower.includes('orchids')) {
    return 'Web & App Builders';
  }
  if (lower.includes('open source') || lower.includes('cline') || lower.includes('roocode') || lower.includes('codex') || lower.includes('gemini cli') || lower.includes('lumo')) {
    return 'Open Source & CLI Agents';
  }
  if (lower.includes('google') || lower.includes('antigravity') || lower.includes('gemini') || lower.includes('warp') || lower.includes('amp')) {
    return 'AI Workstations & Terminals';
  }
  return 'Productivity & Specialized Assistants';
}

function getFileType(fileName, content) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.json') || lower.includes('tool')) {
    return 'Tool Schema';
  }
  if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
    return 'Model Config';
  }
  if (lower.endsWith('.md')) {
    return 'Documentation';
  }
  if (lower.includes('loop') || lower.includes('module') || lower.includes('spec') || lower.includes('planning')) {
    return 'Agent Workflow';
  }
  return 'System Prompt';
}

function getTags(folderName, fileName, content) {
  const tags = new Set();
  const lower = (folderName + ' ' + fileName + ' ' + content.slice(0, 3000)).toLowerCase();

  if (lower.includes('bash') || lower.includes('terminal') || lower.includes('command line') || lower.includes('cli')) tags.add('Terminal/CLI');
  if (lower.includes('edit_file') || lower.includes('write_to_file') || lower.includes('str_replace') || lower.includes('patch')) tags.add('File Editing');
  if (lower.includes('view_file') || lower.includes('read_file') || lower.includes('list_dir')) tags.add('File Navigation');
  if (lower.includes('planning') || lower.includes('think') || lower.includes('scratchpad') || lower.includes('step')) tags.add('Planning/Reasoning');
  if (lower.includes('anthropic') || lower.includes('claude')) tags.add('Anthropic');
  if (lower.includes('openai') || lower.includes('gpt')) tags.add('OpenAI');
  if (lower.includes('google') || lower.includes('gemini')) tags.add('Google');
  if (lower.includes('web search') || lower.includes('search_web') || lower.includes('browser')) tags.add('Web Search');
  if (lower.includes('security') || lower.includes('safety') || lower.includes('guidelines')) tags.add('Safety Rules');
  if (lower.includes('git') || lower.includes('commit') || lower.includes('diff')) tags.add('Git Tools');

  return Array.from(tags).slice(0, 5);
}

const items = [];

function scanDir(dir, relativeToRoot = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    
    const relPath = relativeToRoot ? path.join(relativeToRoot, entry.name) : entry.name;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!relativeToRoot && IGNORED_DIRS.has(entry.name)) continue;
      scanDir(fullPath, relPath);
    } else if (entry.isFile()) {
      if (!relativeToRoot && IGNORED_FILES.has(entry.name)) continue;
      if (entry.name.endsWith('.png') || entry.name.endsWith('.jpg')) continue; // Skip images for text index

      try {
        const stats = fs.statSync(fullPath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parts = relPath.split(path.sep);
        const folder = parts[0];
        const subfolder = parts.length > 2 ? parts.slice(1, -1).join(' / ') : '';
        const filename = parts[parts.length - 1];

        let parsedJson = null;
        let toolCount = 0;
        if (filename.toLowerCase().endsWith('.json')) {
          try {
            parsedJson = JSON.parse(content);
            if (Array.isArray(parsedJson)) {
              toolCount = parsedJson.length;
            } else if (parsedJson.tools && Array.isArray(parsedJson.tools)) {
              toolCount = parsedJson.tools.length;
            } else if (typeof parsedJson === 'object' && parsedJson !== null) {
              toolCount = Object.keys(parsedJson).length;
            }
          } catch {
            // Not strict JSON or invalid
          }
        }

        const words = content.trim().split(/\s+/).filter(Boolean).length;
        const chars = content.length;
        const estimatedTokens = Math.round(chars / 3.8);

        let cleanTitle = filename.replace(/\.(txt|json|yaml|yml|md)$/i, '');
        if (subfolder) {
          cleanTitle = `${subfolder} - ${cleanTitle}`;
        }

        const toolName = folder.replace(/ Prompts.*$/i, '').replace(/ Agent Tools.*$/i, '');
        const category = getCategory(folder, relPath);
        const fileType = getFileType(filename, content);
        const tags = getTags(folder, filename, content);

        items.push({
          id: relPath.replace(/[^\w-]/g, '_'),
          path: relPath,
          folder,
          subfolder,
          filename,
          title: cleanTitle,
          toolName,
          category,
          fileType,
          size: stats.size,
          chars,
          words,
          estimatedTokens,
          toolCount,
          tags,
          content,
          parsedJson: parsedJson ? JSON.stringify(parsedJson) : null
        });
      } catch (err) {
        console.error(`Failed to process ${fullPath}:`, err.message);
      }
    }
  }
}

scanDir(rootDir);

// Sort items by Category, ToolName, Title
items.sort((a, b) => {
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  if (a.toolName !== b.toolName) return a.toolName.localeCompare(b.toolName);
  return a.title.localeCompare(b.title);
});

console.log(`Indexed ${items.length} files across ${new Set(items.map(i => i.folder)).size} folders.`);

// Write to src/data/promptsData.ts
const outputDir = path.join(rootDir, 'src', 'data');
fs.mkdirSync(outputDir, { recursive: true });

const tsContent = `// Auto-generated by scripts/build-data.js
export interface PromptItem {
  id: string;
  path: string;
  folder: string;
  subfolder: string;
  filename: string;
  title: string;
  toolName: string;
  category: string;
  fileType: 'System Prompt' | 'Tool Schema' | 'Model Config' | 'Agent Workflow' | 'Documentation';
  size: number;
  chars: number;
  words: number;
  estimatedTokens: number;
  toolCount: number;
  tags: string[];
  content: string;
  parsedJson: string | null;
}

export const PROMPTS_DATA: PromptItem[] = ${JSON.stringify(items, null, 2)};

export const ALL_CATEGORIES = ${JSON.stringify(Array.from(new Set(items.map(i => i.category))).sort())};
export const ALL_TOOLS = ${JSON.stringify(Array.from(new Set(items.map(i => i.toolName))).sort())};
export const ALL_TYPES = ${JSON.stringify(Array.from(new Set(items.map(i => i.fileType))).sort())};
`;

fs.writeFileSync(path.join(outputDir, 'promptsData.ts'), tsContent, 'utf-8');
console.log(`Wrote src/data/promptsData.ts successfully.`);
