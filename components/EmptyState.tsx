import React from 'react';
import { Ghost, BookmarkX, Radio, SearchX, RefreshCcw, Sparkles, Star } from 'lucide-react';
import { AnimeRelease } from '../types';

export type EmptyStateType = 'watchlist' | 'search' | 'no-data';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction: () => void;
  suggestions?: AnimeRelease[];
  onSelectRelease?: (release: AnimeRelease) => void;
  safeMode?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type, 
  onAction,
  suggestions = [],
  onSelectRelease,
  safeMode = false
}) => {
  const config = {
    watchlist: {
      icon: BookmarkX,
      title: "Collection Offline",
      description: "You haven't added any releases to your watchlist yet. Bookmark your favorites to track them here.",
      buttonText: "Browse All Releases",
      color: "text-pink-400",
      bg: "bg-pink-500/10",
      border: "border-pink-500/20"
    },
    search: {
      icon: SearchX,
      title: "Signal Lost",
      description: "No releases match your current search filters. Try adjusting your keywords or category.",
      buttonText: "Clear Filters",
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/20"
    },
    'no-data': {
      icon: Radio,
      title: "No Broadcasts",
      description: "There are no scheduled releases for this specific day. But don't worry, we found some gems for you.",
      buttonText: "Reset to Today",
      color: "text-slate-400",
      bg: "bg-slate-800",
      border: "border-slate-700"
    }
  };

  const current = config[type];
  const Icon = current.icon;
  const showSuggestions = type === 'no-data' && suggestions.length > 0;

  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 animate-in fade-in zoom-in-95 duration-300 w-full">
      <div className="flex flex-col items-center justify-center mb-12 max-w-lg mx-auto text-center">
        <div className="relative mb-6 group">
          <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${current.bg.replace('/10', '/40')}`} />
          <div className={`relative p-6 rounded-2xl ${current.bg} border ${current.border} shadow-xl backdrop-blur-sm`}>
            <Icon size={48} className={`${current.color} drop-shadow-md`} />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
          {current.title}
        </h3>
        
        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed text-sm">
          {current.description}
        </p>

        <button
          onClick={onAction}
          className="group relative inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl border border-white/10 transition-all hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
        >
          {type === 'no-data' ? <RefreshCcw size={16} /> : <Ghost size={16} />}
          <span>{current.buttonText}</span>
        </button>
      </div>

      {showSuggestions && (
        <div className="w-full max-w-5xl border-t border-white/5 pt-10 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <div className="flex items-center gap-2 mb-6 text-purple-400 justify-center md:justify-start">
            <Sparkles size={18} />
            <span className="font-semibold tracking-wider text-sm uppercase">Recommended for you</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.id}
                onClick={() => onSelectRelease?.(suggestion)}
                className="group relative bg-slate-900/40 border border-white/5 hover:border-purple-500/30 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg hover:shadow-purple-900/20 transition-all duration-300"
              >
                <div className="aspect-[3/4] overflow-hidden bg-slate-800 relative">
                  <img 
                    src={suggestion.imageUrl} 
                    alt={suggestion.title}
                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${safeMode ? 'blur-sm group-hover:blur-0' : ''}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
                  
                  <div className="absolute top-2 left-2">
                     {suggestion.rating > 0 && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded border border-white/10">
                        <Star size={10} fill="currentColor" /> {suggestion.rating}
                      </span>
                     )}
                  </div>
                </div>
                
                <div className="p-3">
                  <h4 className={`text-sm font-medium text-white line-clamp-1 mb-1 group-hover:text-purple-300 transition-colors ${safeMode ? 'blur-[2px] group-hover:blur-0 select-none' : ''}`}>
                    {suggestion.title}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {suggestion.tags.slice(0, 2).map(tag => (
                      <span key={tag} className={`text-[9px] text-slate-400 px-1 py-0.5 rounded bg-white/5 ${safeMode ? 'blur-[1px] group-hover:blur-0' : ''}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;