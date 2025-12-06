import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LayoutGrid, List as ListIcon, Loader2, RefreshCw, Filter, Bookmark } from 'lucide-react';
import Header from './components/Header';
import ReleaseCard from './components/ReleaseCard';
import PulseAIModal from './components/PulseAIModal';
import ReleaseDetailModal from './components/ReleaseDetailModal';
import SettingsModal from './components/SettingsModal';
import TrailerModal from './components/TrailerModal';
import EmptyState, { EmptyStateType } from './components/EmptyState';
import { AnimeRelease, ViewMode, Category } from './types';
import { fetchSchedule } from './services/mockData';
import { getSafeMode, setSafeModeStorage, clearWatchlist, getWatchlist } from './services/storage';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [releases, setReleases] = useState<AnimeRelease[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlistVersion, setWatchlistVersion] = useState(0); // Forces re-render of watchlist filter
  
  // Modals
  const [selectedReleaseForAi, setSelectedReleaseForAi] = useState<AnimeRelease | null>(null);
  const [selectedReleaseDetail, setSelectedReleaseDetail] = useState<AnimeRelease | null>(null);
  const [trailerVideoId, setTrailerVideoId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings & State
  const [safeMode, setSafeMode] = useState<boolean>(getSafeMode());
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const notifiedIds = useRef<Set<string>>(new Set());

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

  // Debounce Search Query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Check for notifications permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
  }, []);

  // Notification Monitor
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReleases = () => {
      const now = Date.now();
      releases.forEach(release => {
        const releaseTime = new Date(release.releaseDate).getTime();
        const diff = releaseTime - now;
        
        // Keys to track specific notification types per release
        const keyUpcoming = `${release.id}-upcoming`;
        const keyLive = `${release.id}-live`;
        
        // 1. Upcoming Notification (15m before)
        if (diff > 0 && diff <= 15 * 60 * 1000 && !notifiedIds.current.has(keyUpcoming)) {
          new Notification(`Releasing Soon: ${release.title}`, {
            body: `Starts in ${Math.ceil(diff / 60000)} minutes!`,
            icon: release.imageUrl,
            tag: keyUpcoming
          });
          notifiedIds.current.add(keyUpcoming);
        }

        // 2. Live Notification (Just released)
        if (diff <= 0 && diff >= -2 * 60 * 1000 && !notifiedIds.current.has(keyLive)) {
          new Notification(`IT'S LIVE: ${release.title}`, {
            body: `The release has just dropped on ${release.source}. Watch now!`,
            icon: release.imageUrl,
            tag: keyLive
          });
          notifiedIds.current.add(keyLive);
        }
      });
    };

    const interval = setInterval(checkReleases, 10000);
    return () => clearInterval(interval);
  }, [releases, notificationsEnabled]);

  const toggleNotifications = async () => {
    if (!('Notification' in window)) return;
    
    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificationsEnabled(true);
      new Notification("HentaiPulse", { body: "Notifications enabled! We'll alert you 15m before and right when releases drop." });
    }
  };

  const handleToggleSafeMode = () => {
    const newState = !safeMode;
    setSafeMode(newState);
    setSafeModeStorage(newState);
  };

  const handleClearWatchlist = () => {
    clearWatchlist();
    handleWatchlistUpdate(); // Update UI
    setIsSettingsOpen(false);
  };

  const handleWatchlistUpdate = () => {
    setWatchlistVersion(v => v + 1);
  };

  const handleTrailerClick = (url: string) => {
    // Extract video ID from standard YouTube URLs
    // Supports: youtube.com/watch?v=ID and youtu.be/ID
    const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    if (match && match[1]) {
      setTrailerVideoId(match[1]);
    } else {
      // Fallback for non-standard or other sites
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filtering Logic
  const filteredReleases = useMemo(() => {
    const watchlist = getWatchlist();
    const query = debouncedSearchQuery.toLowerCase();
    
    return releases.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(query) || 
                            item.description.toLowerCase().includes(query) ||
                            item.tags.some(t => t.toLowerCase().includes(query));
                            
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
      const matchesWatchlist = !showWatchlist || watchlist.includes(item.id);
      
      return matchesSearch && matchesCategory && matchesWatchlist;
    });
  }, [releases, debouncedSearchQuery, activeCategory, showWatchlist, watchlistVersion]);

  // Determine Empty State Type
  const getEmptyStateType = (): EmptyStateType => {
    if (showWatchlist) return 'watchlist';
    if (debouncedSearchQuery || activeCategory !== 'All') return 'search';
    return 'no-data';
  };

  const handleEmptyStateAction = () => {
    if (showWatchlist) {
      setShowWatchlist(false);
    } else if (debouncedSearchQuery || activeCategory !== 'All') {
      setSearchQuery('');
      setDebouncedSearchQuery(''); // Immediate clear
      setActiveCategory('All');
    } else {
      setCurrentDate(new Date());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-purple-500/30">
      
      <Header 
        currentDate={currentDate} 
        onDateChange={setCurrentDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          
          {/* Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
             <div className="flex items-center text-slate-500 mr-2 shrink-0">
               <Filter size={14} className="mr-1" />
               <span className="text-xs uppercase font-medium tracking-wide">Filter</span>
             </div>
             
             {/* Watchlist Toggle */}
             <button
               onClick={() => setShowWatchlist(!showWatchlist)}
               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                 showWatchlist 
                 ? 'bg-pink-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(236,72,153,0.2)]' 
                 : 'bg-slate-900/50 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-white'
               }`}
             >
               <Bookmark size={12} fill={showWatchlist ? "currentColor" : "none"} />
               My Watchlist
             </button>

             <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />

             {['All', ...Object.values(Category)].map((cat) => (
               <button
                 key={cat}
                 onClick={() => setActiveCategory(cat as any)}
                 className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
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
          <EmptyState 
            type={getEmptyStateType()} 
            onAction={handleEmptyStateAction} 
          />
        ) : (
          <div className={`grid gap-6 ${viewMode === ViewMode.Grid ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-2'}`}>
            {filteredReleases.map((release, index) => (
              <div 
                key={`${release.id}-${viewMode}-${activeCategory}-${showWatchlist}-${debouncedSearchQuery}`}
                className="animate-card-entry h-full"
                style={{ animationDelay: `${Math.min(index * 50, 1000)}ms` }}
              >
                <ReleaseCard 
                  release={release} 
                  viewMode={viewMode}
                  safeMode={safeMode}
                  onAiClick={setSelectedReleaseForAi}
                  onTrailerClick={handleTrailerClick}
                  onClick={setSelectedReleaseDetail}
                  onToggleWatchlist={handleWatchlistUpdate}
                />
              </div>
            ))}
          </div>
        )}

      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        safeMode={safeMode}
        toggleSafeMode={handleToggleSafeMode}
        notificationsEnabled={notificationsEnabled}
        toggleNotifications={toggleNotifications}
        onClearWatchlist={handleClearWatchlist}
      />

      {/* AI Modal */}
      <PulseAIModal 
        release={selectedReleaseForAi} 
        onClose={() => setSelectedReleaseForAi(null)} 
      />

      {/* Detail Modal */}
      <ReleaseDetailModal
        release={selectedReleaseDetail}
        allReleases={releases}
        onClose={() => setSelectedReleaseDetail(null)}
        onAiClick={setSelectedReleaseForAi}
        onSelectRelease={setSelectedReleaseDetail}
        onTrailerClick={handleTrailerClick}
        onToggleWatchlist={handleWatchlistUpdate}
      />

      {/* Trailer Modal */}
      <TrailerModal
        videoId={trailerVideoId}
        onClose={() => setTrailerVideoId(null)}
      />

    </div>
  );
};

export default App;