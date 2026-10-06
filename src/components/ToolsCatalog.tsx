import React, { useState, useMemo } from 'react';
import { PromptItem } from '../types';
import { 
  Wrench, 
  Search, 
  Code2, 
  ExternalLink, 
  Check, 
  Copy, 
  Terminal, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  parseToolSchemas, 
  ParsedToolDefinition, 
  copyToClipboard 
} from '../utils/helpers';

interface ToolsCatalogProps {
  items: PromptItem[];
  onSelectPrompt: (item: PromptItem) => void;
}

export const ToolsCatalog: React.FC<ToolsCatalogProps> = ({ items, onSelectPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('All');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Extract all tools across all schema files
  const toolFiles = useMemo(() => {
    return items.filter(i => i.fileType === 'Tool Schema' || (i.parsedJson !== null && i.toolCount > 0));
  }, [items]);

  const allToolsWithContext = useMemo(() => {
    const list: {
      parentItem: PromptItem;
      tool: ParsedToolDefinition;
    }[] = [];

    for (const file of toolFiles) {
      const parsed = parseToolSchemas(file);
      for (const t of parsed) {
        list.push({
          parentItem: file,
          tool: t
        });
      }
    }

    return list;
  }, [toolFiles]);

  const agentNames = useMemo(() => {
    const set = new Set(toolFiles.map(f => f.toolName));
    return ['All', ...Array.from(set).sort()];
  }, [toolFiles]);

  const filteredTools = useMemo(() => {
    return allToolsWithContext.filter(({ parentItem, tool }) => {
      if (selectedAgent !== 'All' && parentItem.toolName !== selectedAgent) return false;
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchesName = tool.name.toLowerCase().includes(q);
      const matchesDesc = tool.description.toLowerCase().includes(q);
      const matchesAgent = parentItem.toolName.toLowerCase().includes(q);
      const matchesParams = tool.parameters.some(p => 
        p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );

      return matchesName || matchesDesc || matchesAgent || matchesParams;
    });
  }, [allToolsWithContext, selectedAgent, searchQuery]);

  const handleCopyTool = async (key: string, tool: ParsedToolDefinition) => {
    const ok = await copyToClipboard(JSON.stringify(tool, null, 2));
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-950">
      
      {/* Top Filter and Search Bar */}
      <div className="p-4 bg-slate-900/60 border-b border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Wrench className="w-5 h-5 text-amber-400" />
              <span>Agent Tool Schemas Directory</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore and search {allToolsWithContext.length} distinct tool specifications from frontier AI systems
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tools, params, bash, edit, grep..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>

            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
            >
              {agentNames.map((agent) => (
                <option key={agent} value={agent}>
                  {agent === 'All' ? 'All AI Agents' : agent}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick common tool filters */}
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs text-slate-400">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Frequent capabilities:</span>
          {['bash', 'terminal', 'edit', 'read', 'grep', 'search', 'file', 'command'].map((word) => (
            <button
              key={word}
              onClick={() => setSearchQuery(word)}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-[11px] font-mono"
            >
              #{word}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-indigo-400 hover:underline ml-1"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* Main Grid List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing <strong className="text-white">{filteredTools.length}</strong> tools</span>
            <span>{selectedAgent !== 'All' ? `Filtered by ${selectedAgent}` : 'Across all systems'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map(({ parentItem, tool }, index) => {
              const uniqueKey = `${parentItem.id}-${tool.name}-${index}`;
              const isCopied = copiedKey === uniqueKey;

              return (
                <div
                  key={uniqueKey}
                  className="bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 rounded-xl p-4 flex flex-col justify-between transition-all group shadow-sm"
                >
                  <div>
                    {/* Tool Agent & Name */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {parentItem.toolName}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {tool.parameters.length} params
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyTool(uniqueKey, tool)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                          title="Copy Tool Definition"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => onSelectPrompt(parentItem)}
                          className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-indigo-400"
                          title="Open in Prompt Explorer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-mono font-bold text-amber-300 tracking-tight group-hover:text-amber-200">
                      {tool.name}()
                    </h3>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-3">
                      {tool.description || 'No description provided.'}
                    </p>

                    {/* Parameters Preview */}
                    {tool.parameters.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80">
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Parameters:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {tool.parameters.map((p) => (
                            <span
                              key={p.name}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                p.required
                                  ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                  : 'bg-slate-800/80 text-slate-400'
                              }`}
                              title={`${p.name} (${p.type}): ${p.description || 'No description'}`}
                            >
                              {p.name}{p.required ? '*' : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Source: {parentItem.filename}</span>
                    <button
                      onClick={() => onSelectPrompt(parentItem)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans"
                    >
                      <span>View File</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="p-12 text-center text-slate-500 bg-slate-900/30 rounded-xl border border-slate-800">
              <Wrench className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p className="text-sm">No tool definitions match the current search query.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
