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

export type ActiveTab = 'explorer' | 'compare' | 'tools' | 'insights';
