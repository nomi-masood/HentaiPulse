import React, { useState, useEffect } from 'react';
import { Play, Clock, Star, Bookmark, Share2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { AnimeRelease, ViewMode, Category } from '../types';
import { toggleWatchlist, isInWatchlist } from '../services/storage';

interface ReleaseCardProps {
  release: AnimeRelease;
  viewMode: ViewMode;
  onAiClick: (release: AnimeRelease) => void;
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ release, viewMode, onAiClick }) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeState | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [release.imageUrl]);

  useEffect(() => {
    setInWatchlist(isInWatchlist(release.id));
    
    const calculateTime = () => {
      const now = new Date().getTime();
      const target = new Date(release.releaseDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsLive(true);
        setTimeRemaining(null);
        return;
      }
      
      setIsLive(false);
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining({ days, hours, minutes });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [release.id, release.releaseDate]);

  const handleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = toggleWatchlist(release.id);
    setInWatchlist(added);
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.Uncensored: return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case Category.OVA: return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  // Helper to render the timer UI consistently
  const renderTimer = () => {
    if (isLive) {
      return (
        <span className="flex items-center gap-1.5 bg-red-600/90 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse border border-red-400/50">
          <span className="w-1.5 h-1.5 rounded-full bg-white block animate-ping" /> LIVE NOW
        </span>
      );
    }

    if (!timeRemaining) return null;

    const { days, hours, minutes } = timeRemaining;

    return (
      <div className="flex items-center gap-2 bg-slate-950/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-full shadow-lg">
        <Clock size={12} className="text-purple-400" />
        <div className="flex items-baseline gap-1 font-mono text-[11px] font-medium leading-none text-slate-200">
          {days > 0 && (
            <>
              <span className="text-white font-bold text-xs">{days}</span>
              <span className="text-slate-500 text-[9px] mr-0.5">d</span>
            </>
          )}
          <span className="text-white font-bold text-xs">{hours.toString().padStart(2, '0')}</span>
          <span className="text-slate-500 text-[9px]">h</span>
          <span className="text-slate-600 font-light">:</span>
          <span className="text-white font-bold text-xs">{minutes.toString().padStart(2, '0')}</span>
          <span className="text-slate-500 text-[9px]">m</span>
        </div>
      </div>
    );
  };

  if (viewMode === ViewMode.List) {
    return (
      <div className="group relative overflow-hidden rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 flex items-center p-3 gap-4">
         <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800/50">
            {/* Skeleton Background with Icon */}
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse flex items-center justify-center transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
              <ImageIcon className="text-slate-700/50" size={24} />
            </div>
            
            <img 
               src={release.imageUrl} 
               alt={release.title} 
               loading="lazy"
               onLoad={() => setImageLoaded(true)}
               className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-700 ease-out ${imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`} 
            />
             {isLive && (
              <div className="absolute top-0 left-0 w-full bg-red-600/90 text-white text-[9px] font-bold text-center py-0.5 z-10 uppercase tracking-wider">
                Live
              </div>
            )}
         </div>
         <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(release.category)} uppercase tracking-wider`}>
                  {release.category}
                </span>
                <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                  <Star size={10} fill="currentColor" /> {release.rating}
                </span>
              </div>
              <div className="scale-90 origin-right">
                {renderTimer()}
              </div>
            </div>
            
            <h3 className="text-white font-medium truncate mb-1 group-hover:text-purple-300 transition-colors text-base">{release.title}</h3>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
               <span className="text-purple-400 font-medium">{release.source}</span>
               <span className="text-slate-600">•</span>
               <span className="truncate max-w-[200px]">{release.tags.slice(0, 3).join(', ')}</span>
            </div>
            
            <div className="flex gap-2">
               <button onClick={() => onAiClick(release)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 text-xs transition-colors border border-purple-500/20">
                  <Sparkles size={12} /> Pulse AI
               </button>
               <button onClick={handleWatchlist} className={`p-1.5 rounded-md transition-colors ${inWatchlist ? 'text-pink-400 bg-pink-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                  <Bookmark size={14} fill={inWatchlist ? "currentColor" : "none"} />
               </button>
            </div>
         </div>
      </div>
    );
  }

  // Grid View
  return (
    <div className="group relative rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 overflow-hidden hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col h-full">
      
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800/50">
        {/* Skeleton Background with Icon */}
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse flex items-center justify-center transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
           <ImageIcon className="text-slate-700/50" size={32} />
        </div>

        <img 
          src={release.imageUrl} 
          alt={release.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-110'}`} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          <span className={`text-[10px] px-2 py-1 rounded-md border font-medium backdrop-blur-md shadow-sm ${getCategoryColor(release.category)}`}>
            {release.category}
          </span>
          <div>
            {renderTimer()}
          </div>
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-[2px] z-10 pointer-events-none">
           <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all transform scale-90 group-hover:scale-110 shadow-lg pointer-events-auto hover:bg-purple-500 hover:border-purple-400">
              <Play size={20} fill="currentColor" className="ml-0.5" />
           </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1 relative">
        <div className="flex items-center justify-between mb-2">
           <span className="text-xs text-purple-400 font-medium tracking-wide">{release.source}</span>
           <div className="flex items-center gap-1 text-amber-400 text-xs">
              <Star size={12} fill="currentColor" /> 
              <span>{release.rating}</span>
           </div>
        </div>
        
        <h3 className="text-white font-medium leading-tight mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors">
          {release.title}
        </h3>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {release.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/30">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
           <button 
              onClick={() => onAiClick(release)} 
              className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-purple-400 transition-colors group/ai"
            >
              <Sparkles size={12} className="group-hover/ai:text-purple-400" />
              ASK AI
           </button>

           <div className="flex gap-2">
             <button className="text-slate-400 hover:text-white transition-colors">
                <Share2 size={16} />
             </button>
             <button 
                onClick={handleWatchlist}
                className={`transition-colors ${inWatchlist ? 'text-pink-500' : 'text-slate-400 hover:text-white'}`}
              >
                <Bookmark size={16} fill={inWatchlist ? "currentColor" : "none"} />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;