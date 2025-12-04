import React, { useState, useEffect } from 'react';
import { LayoutGrid, List as ListIcon, Loader2, RefreshCw, Filter } from 'lucide-react';
import Header from './components/Header';
import ReleaseCard from './components/ReleaseCard';
import PulseAIModal from './components/PulseAIModal';
import { AnimeRelease, ViewMode, Category } from './types';
import { fetchSchedule } from './services/mockData';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [releases, setReleases] = useState<AnimeRelease[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [selectedReleaseForAi, setSelectedReleaseForAi] = useState<AnimeRelease | null>(null);

  // Data Fetching
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchSchedule(currentDate);
      setReleases(data);
    } catch (err) {
      console.error("Failed to load releases", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  // Filtering Logic
  const filteredReleases = releases.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-purple-500/30">
      
      <Header 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="flex items-center text-slate-500 mr-2">
               <Filter size={14} className="mr-1" />
               <span className="text-xs uppercase font-medium tracking-wide">Filter</span>
             </div>
             {['All', ...Object.values(Category)].map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat as any)}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                   activeCategory === cat 
                   ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                   : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white'
                 }`}
               >
                 {cat}
               </button>
             ))}
          </div>

          {/* View Toggle & Refresh */}
          <div className="flex items-center gap-3">
            <button 
              onClick={loadData}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex bg-slate-900/80 p-1 rounded-lg border border-white/5">
              <button 
                onClick={() => setViewMode(ViewMode.Grid)}
                className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.Grid ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode(ViewMode.List)}
                className={`p-1.5 rounded-md transition-all ${viewMode === ViewMode.List ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
             <div className="relative">
               <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 animate-pulse" />
               <Loader2 size={40} className="text-purple-500 animate-spin relative z-10" />
             </div>
             <p className="text-slate-500 font-light tracking-wide animate-pulse">Syncing Schedules...</p>
          </div>
        ) : filteredReleases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500">
             <p>No releases found for this filter/date.</p>
             <button onClick={() => { setSearchQuery(''); setActiveCategory('All'); }} className="mt-2 text-purple-400 hover:underline text-sm">
               Clear Filters
             </button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === ViewMode.Grid ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
            {filteredReleases.map(release => (
              <ReleaseCard 
                key={release.id} 
                release={release} 
                viewMode={viewMode} 
                onAiClick={setSelectedReleaseForAi}
              />
            ))}
          </div>
        )}

      </main>

      {/* AI Modal */}
      <PulseAIModal 
        release={selectedReleaseForAi} 
        onClose={() => setSelectedReleaseForAi(null)} 
      />

    </div>
  );
};

export default App;