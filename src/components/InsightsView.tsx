import React from 'react';
import { PromptItem } from '../types';
import { 
  Sparkles, 
  Terminal, 
  FileCode2, 
  ShieldAlert, 
  Cpu, 
  Layers, 
  BarChart3, 
  BookOpen, 
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { formatNumber, formatBytes } from '../utils/helpers';

interface InsightsViewProps {
  items: PromptItem[];
  onSelectPrompt: (item: PromptItem) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ items, onSelectPrompt }) => {
  // Find top largest prompts
  const topPrompts = [...items]
    .filter(i => i.fileType === 'System Prompt')
    .sort((a, b) => b.estimatedTokens - a.estimatedTokens)
    .slice(0, 8);

  // Group by category counts
  const categoryStats = React.useMemo(() => {
    const map = new Map<string, { count: number; tokens: number }>();
    for (const item of items) {
      const curr = map.get(item.category) || { count: 0, tokens: 0 };
      curr.count += 1;
      curr.tokens += item.estimatedTokens;
      map.set(item.category, curr);
    }
    return Array.from(map.entries());
  }, [items]);

  const totalTokens = items.reduce((acc, i) => acc + i.estimatedTokens, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-indigo-950/60 via-slate-900/80 to-slate-950 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2.5 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Prompt Engineering Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How Frontier AI Coding Agents are Instructed
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
            By analyzing over 100 system prompts and tool schemas from Anthropic, Cursor, Devin, Google, Manus, Windsurf, and v0, clear architectural conventions emerge for building autonomous software engineering agents.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Prompt Files</div>
              <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">{items.length}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Estimated Corpus Tokens</div>
              <div className="text-xl sm:text-2xl font-bold text-cyan-400 mt-0.5">~{formatNumber(Math.round(totalTokens / 1000))}k</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">AI Frameworks</div>
              <div className="text-xl sm:text-2xl font-bold text-indigo-400 mt-0.5">35+</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Tool Schemas</div>
              <div className="text-xl sm:text-2xl font-bold text-amber-400 mt-0.5">
                {items.filter(i => i.fileType === 'Tool Schema').length} files
              </div>
            </div>
          </div>
        </div>

        {/* 4 Architectural Pillars of Agent System Prompts */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <span>Core Architectural Patterns Across Frontier Agents</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Pattern 1 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
                <FileCode2 className="w-4 h-4" />
                <span>1. The "Read-Before-Write" Mandate</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Strict context verification before modifications
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Almost every agent (Claude Code, Cursor, Windsurf, Devin) explicitly instructs models to inspect files via <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">view_file</code> or <code className="text-indigo-300 bg-slate-950 px-1 py-0.5 rounded font-mono">read_file</code> before proposing changes. Blind edits are strictly forbidden to prevent hallucinated imports, outdated APIs, and silent syntax corruption.
              </p>
            </div>

            {/* Pattern 2 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
                <Layers className="w-4 h-4" />
                <span>2. Targeted Diffs vs Full File Rewrites</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                String replacement chunks for large codebases
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                To conserve token output and avoid truncation, production agents use precise string-replacement tools (<code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">edit_file</code>, <code className="text-cyan-300 bg-slate-950 px-1 py-0.5 rounded font-mono">str_replace</code>, or multi-chunk diffs). Full rewrites are reserved strictly for new file creation.
              </p>
            </div>

            {/* Pattern 3 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                <Terminal className="w-4 h-4" />
                <span>3. Sandboxed Terminal & Async Execution</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Non-blocking commands and process supervision
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Agents are prohibited from running blocking interactive commands (<code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">vim</code>, <code className="text-amber-300 bg-slate-950 px-1 py-0.5 rounded font-mono">nano</code>, interactive REPLs). Long-running servers (Vite, Next.js, Express) are delegated to background task runners with explicit polling prevention.
              </p>
            </div>

            {/* Pattern 4 */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>4. Anti-Slop & Zero-Mock Enforcement</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Action over conversational fluff & real integrations
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Modern prompts explicitly command: "Action Over Talk - call tools instead of giving pleasantries", and forbid synthetic mock placeholders when real OAuth, APIs, or database integrations can be wired directly.
              </p>
            </div>

          </div>
        </div>

        {/* Largest System Prompts in Archive */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <span>Largest System Prompts by Token Count</span>
          </h3>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
            <div className="divide-y divide-slate-800/80">
              {topPrompts.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPrompt(item)}
                  className="p-3.5 hover:bg-slate-800/50 cursor-pointer flex items-center justify-between gap-4 transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-500">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {item.toolName} • {item.folder}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0 text-right">
                    <div>
                      <div className="text-xs font-mono font-bold text-cyan-400">
                        ~{formatNumber(item.estimatedTokens)} tokens
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {formatNumber(item.words)} words
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Corpus Breakdown by Agent Category</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryStats.map(([cat, stat]) => (
              <div key={cat} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-1.5">
                <div className="text-xs font-bold text-slate-200">{cat}</div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{stat.count} files</span>
                  <span className="font-mono text-cyan-400">~{formatNumber(Math.round(stat.tokens / 1000))}k tokens</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mt-2">
                  <div 
                    className="bg-indigo-500 h-full rounded-full" 
                    style={{ width: `${Math.min(100, Math.round((stat.tokens / totalTokens) * 100))}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
