import React, { useState, useMemo } from 'react';
import { PromptItem } from '../types';
import { 
  Wrench, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Search, 
  Table, 
  ChevronDown, 
  ChevronRight,
  ShieldCheck,
  Columns
} from 'lucide-react';
import { 
  formatNumber, 
  formatBytes, 
  copyToClipboard, 
  downloadFile, 
  parseToolSchemas, 
  ParsedToolDefinition 
} from '../utils/helpers';

interface ToolSchemaViewerProps {
  item: PromptItem;
  onCompareWith: (item: PromptItem) => void;
}

export const ToolSchemaViewer: React.FC<ToolSchemaViewerProps> = ({ item, onCompareWith }) => {
  const [viewMode, setViewMode] = useState<'visual' | 'raw'>('visual');
  const [copied, setCopied] = useState(false);
  const [searchTool, setSearchTool] = useState('');
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});

  const parsedTools = useMemo(() => parseToolSchemas(item), [item]);

  const toggleTool = (name: string) => {
    setExpandedTools(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const expandAll = () => {
    const next: Record<string, boolean> = {};
    parsedTools.forEach(t => { next[t.name] = true; });
    setExpandedTools(next);
  };

  const collapseAll = () => {
    setExpandedTools({});
  };

  const filteredTools = useMemo(() => {
    if (!searchTool.trim()) return parsedTools;
    const q = searchTool.toLowerCase();
    return parsedTools.filter(t => 
      t.name.toLowerCase().includes(q) || 
      t.description.toLowerCase().includes(q) ||
      t.parameters.some(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    );
  }, [parsedTools, searchTool]);

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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* Header bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Tool Specification
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
                {item.toolName}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {item.path}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>{item.title}</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onCompareWith(item)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Columns className="w-3.5 h-3.5 text-indigo-400" />
              <span>Compare</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Download</span>
            </button>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                copied
                  ? 'bg-emerald-600 text-white shadow-sm'
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
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Metrics bar */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Defined Tools:</span>
            <span className="font-mono font-bold text-amber-400">
              {parsedTools.length || item.toolCount || 1}
            </span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Schema Size:</span>
            <span className="font-mono text-slate-200">
              {formatBytes(item.size)}
            </span>
          </div>
          <div className="text-slate-700">•</div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">Estimated Tokens:</span>
            <span className="font-mono text-cyan-400">
              ~{formatNumber(item.estimatedTokens)}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar / Mode Switcher */}
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('visual')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'visual'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Interactive Schema</span>
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${
              viewMode === 'raw'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Raw JSON</span>
          </button>
        </div>

        {viewMode === 'visual' && parsedTools.length > 0 && (
          <div className="flex items-center gap-2 flex-1 max-w-sm justify-end">
            <div className="relative w-full max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tools or parameters..."
                value={searchTool}
                onChange={(e) => setSearchTool(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 pl-8 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              onClick={expandAll}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
            >
              Expand
            </button>
            <button
              onClick={collapseAll}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px]"
            >
              Collapse
            </button>
          </div>
        )}
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === 'raw' ? (
          <pre className="font-mono text-xs text-slate-300 p-4 bg-slate-900/50 rounded-lg border border-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto">
            {item.content}
          </pre>
        ) : parsedTools.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/30 rounded-lg border border-slate-800">
            <p className="text-sm text-slate-400 mb-2">Could not parse standard tool schema structure.</p>
            <button
              onClick={() => setViewMode('raw')}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium"
            >
              View Raw JSON Content
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-w-5xl mx-auto">
            {filteredTools.map((tool) => {
              const isExpanded = expandedTools[tool.name] !== false; // Default expanded
              return (
                <div 
                  key={tool.name}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden shadow-sm"
                >
                  {/* Tool Header */}
                  <div 
                    onClick={() => toggleTool(tool.name)}
                    className="p-3.5 bg-slate-900/90 hover:bg-slate-800/80 cursor-pointer flex items-center justify-between gap-3 border-b border-slate-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-amber-300">
                          {tool.name}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                          {tool.parameters.length} params
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 truncate max-w-md hidden sm:block">
                      {tool.description}
                    </div>
                  </div>

                  {/* Tool Body */}
                  {isExpanded && (
                    <div className="p-4 space-y-3 bg-slate-950/40">
                      {tool.description && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1">
                            Description
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                            {tool.description}
                          </p>
                        </div>
                      )}

                      {/* Parameters Table */}
                      <div>
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                          Parameters & Arguments
                        </div>
                        {tool.parameters.length === 0 ? (
                          <div className="text-xs text-slate-500 italic p-2">
                            No parameters required for this tool.
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded border border-slate-800">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                                <tr>
                                  <th className="py-2 px-3">Parameter</th>
                                  <th className="py-2 px-3">Type</th>
                                  <th className="py-2 px-3">Status</th>
                                  <th className="py-2 px-3">Description</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60">
                                {tool.parameters.map((p) => (
                                  <tr key={p.name} className="hover:bg-slate-900/40 transition-colors">
                                    <td className="py-2.5 px-3 font-mono font-semibold text-indigo-300">
                                      {p.name}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-cyan-400 text-[11px]">
                                      {p.type}
                                    </td>
                                    <td className="py-2.5 px-3">
                                      {p.required ? (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
                                          required
                                        </span>
                                      ) : (
                                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                                          optional
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-300 text-xs leading-normal">
                                      {p.description || '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
