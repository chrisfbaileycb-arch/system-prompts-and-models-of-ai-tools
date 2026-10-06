import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PromptItem } from '../types';
import { 
  Copy, 
  Check, 
  Download, 
  Columns, 
  Search, 
  Hash, 
  WrapText, 
  Tag, 
  Bookmark, 
  FileCode,
  Info,
  Maximize2
} from 'lucide-react';
import { 
  formatNumber, 
  formatBytes, 
  copyToClipboard, 
  downloadFile, 
  extractSections 
} from '../utils/helpers';

interface PromptViewerProps {
  item: PromptItem;
  onCompareWith: (item: PromptItem) => void;
}

export const PromptViewer: React.FC<PromptViewerProps> = ({ item, onCompareWith }) => {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [wrapText, setWrapText] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [showSections, setShowSections] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const sections = useMemo(() => extractSections(item.content), [item.content]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(item.content);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadFile(item.filename, item.content);
  };

  const lines = useMemo(() => item.content.split('\n'), [item.content]);

  // Jump to specific line
  const jumpToLine = (lineNumber: number) => {
    const el = document.getElementById(`line-${lineNumber}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('bg-indigo-500/30');
      setTimeout(() => el.classList.remove('bg-indigo-500/30'), 1500);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* Top Details & Action Toolbar */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {item.category}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                {item.toolName}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {item.path}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              {item.title}
            </h2>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCompareWith(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Compare with another prompt"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/20'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Prompt Metrics Bar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Tokens:</span>
            <span className="font-mono font-semibold text-cyan-400">
              ~{formatNumber(item.estimatedTokens)}
            </span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Words:</span>
            <span className="font-mono text-slate-200">
              {formatNumber(item.words)}
            </span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Characters:</span>
            <span className="font-mono text-slate-200">
              {formatNumber(item.chars)}
            </span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">File Size:</span>
            <span className="font-mono text-slate-200">
              {formatBytes(item.size)}
            </span>
          </div>

          {/* Tags */}
          {item.tags.length > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              {item.tags.map(t => (
                <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-medium">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Editor Controls Bar */}
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs gap-3">
        
        {/* Local search within this prompt */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Find in prompt..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 pl-8 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
          {localSearch && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
              {lines.filter(l => l.toLowerCase().includes(localSearch.toLowerCase())).length} matches
            </span>
          )}
        </div>

        {/* View toggles */}
        <div className="flex items-center gap-2">
          {sections.length > 0 && (
            <button
              onClick={() => setShowSections(!showSections)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
                showSections ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Sections ({sections.length})</span>
            </button>
          )}

          <button
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              showLineNumbers ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-slate-400'
            }`}
            title="Toggle line numbers"
          >
            <Hash className="w-3.5 h-3.5" />
            <span>Line Numbers</span>
          </button>

          <button
            onClick={() => setWrapText(!wrapText)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs transition-colors ${
              wrapText ? 'bg-slate-800 text-slate-200' : 'bg-slate-900 text-slate-400'
            }`}
            title="Toggle text wrap"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span>Wrap</span>
          </button>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Collapsible Sections Sidebar */}
        {showSections && sections.length > 0 && (
          <div className="w-64 border-r border-slate-800 bg-slate-900/40 p-3 overflow-y-auto flex-shrink-0 text-xs">
            <div className="font-semibold text-slate-300 mb-2 uppercase text-[10px] tracking-wider">
              Prompt Structure
            </div>
            <div className="space-y-1">
              {sections.map((sec, i) => (
                <button
                  key={i}
                  onClick={() => jumpToLine(sec.line)}
                  className="w-full text-left p-1.5 rounded hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 flex items-center justify-between group transition-colors"
                >
                  <span className="truncate font-mono text-[11px] text-indigo-300">
                    {sec.title}
                  </span>
                  <span className="text-[10px] text-slate-600 group-hover:text-slate-400 font-mono">
                    L{sec.line}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Text Area */}
        <div 
          ref={contentRef}
          className={`flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed ${
            wrapText ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
          }`}
        >
          {lines.map((line, idx) => {
            const lineNum = idx + 1;
            const isMatch = localSearch && line.toLowerCase().includes(localSearch.toLowerCase());
            const isXmlTag = line.trim().match(/^<\/?([a-zA-Z0-9_\-]+)(?:\s+[^>]*)?>$/);
            const isHeader = line.trim().startsWith('#');

            return (
              <div
                key={idx}
                id={`line-${lineNum}`}
                className={`flex transition-colors rounded px-1 ${
                  isMatch ? 'bg-amber-500/20 text-amber-100 font-semibold' : 'hover:bg-slate-900/60'
                }`}
              >
                {showLineNumbers && (
                  <span className="w-12 flex-shrink-0 select-none text-slate-600 text-right pr-4 text-[11px] font-mono">
                    {lineNum}
                  </span>
                )}
                <span className={`flex-1 ${
                  isXmlTag 
                    ? 'text-cyan-400 font-semibold' 
                    : isHeader 
                    ? 'text-indigo-300 font-bold' 
                    : 'text-slate-300'
                }`}>
                  {line || ' '}
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
