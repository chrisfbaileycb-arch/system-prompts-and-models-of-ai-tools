import React, { useMemo } from 'react';
import { PromptItem } from '../types';
import { 
  Folder, 
  FileText, 
  Wrench, 
  Settings, 
  Terminal, 
  CheckCircle,
  Filter,
  Bot
} from 'lucide-react';
import { formatNumber } from '../utils/helpers';

interface SidebarProps {
  items: PromptItem[];
  selectedItem: PromptItem;
  onSelectItem: (item: PromptItem) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedTool: string;
  setSelectedTool: (tool: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  selectedItem,
  onSelectItem,
  selectedCategory,
  setSelectedCategory,
  selectedType,
  setSelectedType,
  selectedTool,
  setSelectedTool,
  searchQuery,
  setSearchQuery
}) => {
  // Compute categories with counts
  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.category, (map.get(item.category) || 0) + 1);
    }
    return map;
  }, [items]);

  // Compute tool providers with counts
  const toolCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      map.set(item.toolName, (map.get(item.toolName) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [items]);

  // Filtered files list
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
      if (selectedType !== 'All' && item.fileType !== selectedType) return false;
      if (selectedTool !== 'All' && item.toolName !== selectedTool) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesFolder = item.folder.toLowerCase().includes(q);
        const matchesTag = item.tags.some(t => t.toLowerCase().includes(q));
        const matchesContent = item.content.toLowerCase().includes(q);
        return matchesTitle || matchesFolder || matchesTag || matchesContent;
      }
      return true;
    });
  }, [items, selectedCategory, selectedType, selectedTool, searchQuery]);

  return (
    <aside className="w-80 flex-shrink-0 border-r border-slate-800 bg-slate-900/40 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Top Filter Bar */}
      <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900/60">
        
        {/* Category Selector */}
        <div>
          <label className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase flex items-center justify-between">
            <span>Category</span>
            {selectedCategory !== 'All' && (
              <button 
                onClick={() => setSelectedCategory('All')}
                className="text-indigo-400 hover:text-indigo-300 text-[10px] lowercase"
              >
                reset
              </button>
            )}
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="mt-1 w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-md px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Categories ({items.length})</option>
            {Array.from(categoryCounts.entries()).map(([cat, count]) => (
              <option key={cat} value={cat}>
                {cat} ({count})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Type Pills */}
        <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
          {['All', 'System Prompt', 'Tool Schema', 'Model Config'].map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-2 py-1 rounded whitespace-nowrap transition-colors ${
                selectedType === t
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {t === 'All' ? 'All Types' : t}
            </button>
          ))}
        </div>

        {/* Tool Provider Quick Filter */}
        <div className="flex items-center gap-1.5">
          <label className="text-[10px] text-slate-400 flex items-center gap-1">
            <Bot className="w-3 h-3 text-indigo-400" />
            <span>AI Tool:</span>
          </label>
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded px-2 py-1 focus:outline-none"
          >
            <option value="All">All Tools ({toolCounts.length})</option>
            {toolCounts.map(([tool, count]) => (
              <option key={tool} value={tool}>
                {tool} ({count})
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Item count status */}
      <div className="px-3 py-1.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Showing <strong className="text-slate-200">{filteredItems.length}</strong> of {items.length}</span>
        {(selectedCategory !== 'All' || selectedType !== 'All' || selectedTool !== 'All' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSelectedType('All');
              setSelectedTool('All');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-400 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-1.5 space-y-0.5">
        {filteredItems.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            <Filter className="w-6 h-6 mx-auto mb-2 text-slate-600" />
            <p>No prompts match current filters</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedItem.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`w-full text-left p-2.5 rounded-lg transition-all group flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-indigo-600/15 border border-indigo-500/40 text-slate-100 shadow-sm'
                    : 'hover:bg-slate-800/50 text-slate-300 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {item.fileType === 'Tool Schema' ? (
                      <Wrench className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    ) : item.fileType === 'Model Config' ? (
                      <Settings className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    ) : (
                      <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    )}
                    <span className="text-xs font-semibold tracking-tight truncate text-slate-200 group-hover:text-white">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">
                    ~{formatNumber(Math.round(item.estimatedTokens / 1000))}k tok
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-medium truncate max-w-[120px]">
                    {item.toolName}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate text-slate-400">
                    {item.folder}
                  </span>
                </div>

                {item.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                    {item.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] px-1 py-0.2 rounded bg-slate-950/60 text-slate-400 border border-slate-800/80">
                        #{t}
                      </span>
                    ))}
                    {item.toolCount > 0 && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                        {item.toolCount} tools
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

    </aside>
  );
};
