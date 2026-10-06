import React, { useState, useMemo } from 'react';
import { PromptItem } from '../types';
import { 
  Columns, 
  Copy, 
  Check, 
  ArrowLeftRight, 
  Zap, 
  FileText, 
  Wrench, 
  Hash, 
  Download 
} from 'lucide-react';
import { 
  formatNumber, 
  formatBytes, 
  copyToClipboard, 
  downloadFile 
} from '../utils/helpers';

interface CompareViewProps {
  items: PromptItem[];
  defaultLeftId?: string;
  defaultRightId?: string;
}

export const CompareView: React.FC<CompareViewProps> = ({
  items,
  defaultLeftId,
  defaultRightId
}) => {
  const [leftId, setLeftId] = useState<string>(
    defaultLeftId || items.find(i => i.title.toLowerCase().includes('claude code'))?.id || items[0]?.id || ''
  );
  const [rightId, setRightId] = useState<string>(
    defaultRightId || items.find(i => i.title.toLowerCase().includes('cursor') || i.title.toLowerCase().includes('agent prompt 2.0'))?.id || items[1]?.id || ''
  );

  const [leftCopied, setLeftCopied] = useState(false);
  const [rightCopied, setRightCopied] = useState(false);

  const leftItem = useMemo(() => items.find(i => i.id === leftId) || items[0], [items, leftId]);
  const rightItem = useMemo(() => items.find(i => i.id === rightId) || items[1], [items, rightId]);

  const swapItems = () => {
    const temp = leftId;
    setLeftId(rightId);
    setRightId(temp);
  };

  const handleCopyLeft = async () => {
    if (!leftItem) return;
    const ok = await copyToClipboard(leftItem.content);
    if (ok) {
      setLeftCopied(true);
      setTimeout(() => setLeftCopied(false), 2000);
    }
  };

  const handleCopyRight = async () => {
    if (!rightItem) return;
    const ok = await copyToClipboard(rightItem.content);
    if (ok) {
      setRightCopied(true);
      setTimeout(() => setRightCopied(false), 2000);
    }
  };

  const presets = [
    { label: 'Claude Code vs Cursor Agent 2.0', leftQuery: 'claude code 2.0', rightQuery: 'agent prompt 2.0' },
    { label: 'Devin AI vs Manus Agent', leftQuery: 'devin ai/prompt', rightQuery: 'manus agent tools & prompt/prompt' },
    { label: 'Windsurf vs Trae Builder', leftQuery: 'windsurf', rightQuery: 'trae/builder' },
    { label: 'Lovable vs v0', leftQuery: 'lovable', rightQuery: 'v0' },
    { label: 'Claude Code Tools vs Cursor Tools', leftQuery: 'claude code/tools', rightQuery: 'cursor prompts/agent tools' }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    const l = items.find(i => i.path.toLowerCase().includes(preset.leftQuery));
    const r = items.find(i => i.path.toLowerCase().includes(preset.rightQuery));
    if (l) setLeftId(l.id);
    if (r) setRightId(r.id);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* Top Presets & Controls */}
      <div className="p-3 bg-slate-900/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Preset Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Quick Comparisons:</span>
          </span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Swap button */}
        <button
          onClick={swapItems}
          className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700"
          title="Swap Left and Right"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Swap Sides</span>
        </button>

      </div>

      {/* Comparison Metrics Header Table */}
      <div className="bg-slate-900/40 border-b border-slate-800 p-3 grid grid-cols-2 gap-4 divide-x divide-slate-800 text-xs">
        {/* Left Stats */}
        <div className="pr-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <select
              value={leftId}
              onChange={(e) => setLeftId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 font-semibold rounded px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.toolName}] {i.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleCopyLeft}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              title="Copy Left Prompt"
            >
              {leftCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => downloadFile(leftItem.filename, leftItem.content)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              title="Download Left File"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Tokens: <strong className="text-cyan-400 font-mono">~{formatNumber(leftItem.estimatedTokens)}</strong></span>
            <span>•</span>
            <span>Words: <strong className="text-slate-200 font-mono">{formatNumber(leftItem.words)}</strong></span>
            <span>•</span>
            <span>Size: <strong className="text-slate-200 font-mono">{formatBytes(leftItem.size)}</strong></span>
          </div>
        </div>

        {/* Right Stats */}
        <div className="pl-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <select
              value={rightId}
              onChange={(e) => setRightId(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 font-semibold rounded px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.toolName}] {i.title}
                </option>
              ))}
            </select>
            <button
              onClick={handleCopyRight}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              title="Copy Right Prompt"
            >
              {rightCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => downloadFile(rightItem.filename, rightItem.content)}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded"
              title="Download Right File"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Tokens: <strong className="text-cyan-400 font-mono">~{formatNumber(rightItem.estimatedTokens)}</strong></span>
            <span>•</span>
            <span>Words: <strong className="text-slate-200 font-mono">{formatNumber(rightItem.words)}</strong></span>
            <span>•</span>
            <span>Size: <strong className="text-slate-200 font-mono">{formatBytes(rightItem.size)}</strong></span>
          </div>
        </div>
      </div>

      {/* Side-by-Side Dual Content Viewer */}
      <div className="flex-1 grid grid-cols-2 divide-x divide-slate-800 overflow-hidden">
        {/* Left Column */}
        <div className="overflow-y-auto p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/80">
          <div className="mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-indigo-400 font-semibold font-sans flex items-center justify-between">
            <span>{leftItem.title}</span>
            <span className="font-mono text-slate-500">{leftItem.path}</span>
          </div>
          {leftItem.content}
        </div>

        {/* Right Column */}
        <div className="overflow-y-auto p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed bg-slate-950/80">
          <div className="mb-2 pb-2 border-b border-slate-800/80 text-[11px] text-cyan-400 font-semibold font-sans flex items-center justify-between">
            <span>{rightItem.title}</span>
            <span className="font-mono text-slate-500">{rightItem.path}</span>
          </div>
          {rightItem.content}
        </div>
      </div>

    </div>
  );
};
