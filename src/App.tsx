import React, { useState, useMemo, useEffect } from 'react';
import { PROMPTS_DATA } from './data/promptsData';
import { PromptItem, ActiveTab } from './types';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PromptViewer } from './components/PromptViewer';
import { ToolSchemaViewer } from './components/ToolSchemaViewer';
import { CompareView } from './components/CompareView';
import { ToolsCatalog } from './components/ToolsCatalog';
import { InsightsView } from './components/InsightsView';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explorer');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTool, setSelectedTool] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Pick default selected item: Anthropic Claude Code 2.0 or Cursor
  const defaultItem = useMemo(() => {
    return PROMPTS_DATA.find(i => i.title.toLowerCase().includes('claude code 2.0')) 
      || PROMPTS_DATA.find(i => i.title.toLowerCase().includes('cursor'))
      || PROMPTS_DATA[0];
  }, []);

  const [selectedItem, setSelectedItem] = useState<PromptItem>(defaultItem);

  // Compare state
  const [compareLeftId, setCompareLeftId] = useState<string>('');
  const [compareRightId, setCompareRightId] = useState<string>('');

  // Total corpus stats
  const totalTokens = useMemo(() => {
    return PROMPTS_DATA.reduce((acc, i) => acc + i.estimatedTokens, 0);
  }, []);

  const totalTools = useMemo(() => {
    return PROMPTS_DATA.filter(i => i.fileType === 'Tool Schema' || i.toolCount > 0).length;
  }, []);

  // Handle "Compare with" click from PromptViewer or ToolSchemaViewer
  const handleCompareWith = (item: PromptItem) => {
    setCompareLeftId(item.id);
    // Find an interesting counterpart
    const other = PROMPTS_DATA.find(i => 
      i.id !== item.id && 
      (i.fileType === item.fileType || i.category === item.category)
    ) || PROMPTS_DATA[0];
    setCompareRightId(other.id);
    setActiveTab('compare');
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) input.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        totalPrompts={PROMPTS_DATA.length}
        totalTools={totalTools}
        totalTokens={totalTokens}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {activeTab === 'explorer' && (
          <>
            <Sidebar
              items={PROMPTS_DATA}
              selectedItem={selectedItem}
              onSelectItem={setSelectedItem}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              selectedTool={selectedTool}
              setSelectedTool={setSelectedTool}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />

            {selectedItem.fileType === 'Tool Schema' ? (
              <ToolSchemaViewer
                item={selectedItem}
                onCompareWith={handleCompareWith}
              />
            ) : (
              <PromptViewer
                item={selectedItem}
                onCompareWith={handleCompareWith}
              />
            )}
          </>
        )}

        {activeTab === 'compare' && (
          <CompareView
            items={PROMPTS_DATA}
            defaultLeftId={compareLeftId || selectedItem.id}
            defaultRightId={compareRightId}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsCatalog
            items={PROMPTS_DATA}
            onSelectPrompt={(item) => {
              setSelectedItem(item);
              setActiveTab('explorer');
            }}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsView
            items={PROMPTS_DATA}
            onSelectPrompt={(item) => {
              setSelectedItem(item);
              setActiveTab('explorer');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
