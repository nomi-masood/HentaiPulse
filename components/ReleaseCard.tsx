import React, { useState, useEffect } from 'react';
import { Play, Star, Bookmark, Share2, Sparkles, Image as ImageIcon, Check, Video } from 'lucide-react';
import { AnimeRelease, ViewMode, Category } from '../types';
import { toggleWatchlist, isInWatchlist } from '../services/storage';

interface ReleaseCardProps {
  release: AnimeRelease;
  viewMode: ViewMode;
  safeMode: boolean;
  onAiClick: (release: AnimeRelease) => void;
  onTrailerClick?: (url: string) => void;
  onClick: (release: AnimeRelease) => void;
  onToggleWatchlist?: () => void;
}

interface TimeState {
  days: number;
  hours: number;
  minutes: number;
}

const ReleaseCard: React.FC<ReleaseCardProps> = ({ 
  release, 
  viewMode, 
  safeMode, 
  onAiClick, 
  onTrailerClick,
  onClick,
  onToggleWatchlist
}) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeState | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [displayImage, setDisplayImage] = useState(release.imageUrl);

  useEffect(() => {
    setDisplayImage(release.imageUrl);
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
    if (added) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
    onToggleWatchlist?.();
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: release.title,
      text: `Check out ${release.title} on HentaiPulse!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2000);
      } catch (err) {
        // Fail silently
      }
    }
  };

  const handleImageError = () => {
    const encodedTitle = encodeURIComponent(release.title).replace(/%20/g, '+');
    const fallbackUrl = `https://placehold.co/450x600/1e1b4b/e2e8f0/png?text=${encodedTitle}`;
    setDisplayImage(fallbackUrl);
  };

  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.Uncensored: return 'bg-pink-500/20 text-pink-300 border-pink-500/30';
      case Category.OVA: return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
  };

  const renderTimer = () => {
    if (isLive) {
      return (
        <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse border border-white/20 backdrop-blur-md">
           <span className="relative flex h-2.5 w-2.5">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
           </span>
           <span className="text-[10px] font-black tracking-widest uppercase drop-shadow-sm">Live Now</span>
        </div>
      );
    }

    if (!timeRemaining) return null;

    const { days, hours, minutes } = timeRemaining;

    // Enhanced Segmented Digit Component
    const Digit = ({ val, label }: { val: number | string, label: string }) => (
      <div className="flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-md rounded-lg border border-white/10 px-2 min-w-[42px] h-[48px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] relative overflow-hidden group/digit">
        {/* Value */}
        <span key={val} className="font-mono text-lg font-bold text-white leading-none drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]">
            {val.toString().padStart(2, '0')}
        </span>
        {/* Label */}
        <span className="text-[8px] text-slate-500 font-semibold uppercase tracking-widest mt-0.5">{label}</span>
      </div>
    );

    const Separator = () => (
      <div className="flex flex-col gap-1 justify-center h-full opacity-40 px-0.5">
        <div className="w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
        <div className="w-0.5 h-0.5 bg-white rounded-full shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
      </div>
    );

    return (
      <div className="flex items-center gap-0.5 p-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg hover:border-purple-500/40 transition-colors duration-300">
        {days > 0 && (
          <>
             <Digit val={days} label="DAY" />
             <Separator />
          </>
        )}
        <Digit val={hours} label="HRS" />
        <Separator />
        <Digit val={minutes} label="MIN" />
      </div>
    );
  };

  const getImageClass = () => {
    let base = "w-full h-full object-cover transition-all duration-700 ease-out ";
    if (!imageLoaded) return base + "opacity-0 blur-xl scale-110";
    
    if (safeMode) {
      return base + "opacity-100 blur-md group-hover:blur-0 scale-100";
    }
    
    return base + "opacity-100 blur-0 group-hover:scale-105 scale-100";
  };

  const textBlurClass = safeMode ? 'blur-sm group-hover:blur-0 select-none transition-all duration-300' : '';

  if (viewMode === ViewMode.List) {
    return (
      <div 
        onClick={() => onClick(release)}
        className="group relative overflow-hidden rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-800/60 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 flex items-center p-3 gap-4 cursor-pointer"
      >
         <div className="relative w-24 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-slate-800/50">
            <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse flex items-center justify-center transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
              <ImageIcon className="text-slate-700/50" size={24} />
            </div>
            
            <img 
               src={displayImage} 
               alt={release.title} 
               loading="lazy"
               onLoad={() => setImageLoaded(true)}
               onError={handleImageError}
               className={getImageClass()} 
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
                {release.episodeNumber && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300 font-medium">
                    EP {release.episodeNumber}
                  </span>
                )}
                <span className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                  <Star size={10} fill="currentColor" /> {release.rating}
                </span>
              </div>
              <div className="scale-90 origin-right">
                {renderTimer()}
              </div>
            </div>
            
            <h3 className={`text-white font-medium truncate mb-1 group-hover:text-purple-300 transition-colors text-base ${textBlurClass}`}>{release.title}</h3>
            
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
               <span className="text-purple-400 font-medium">{release.source}</span>
               <span className="text-slate-600">•</span>
               <span className={`truncate max-w-[200px] ${textBlurClass}`}>{release.tags.slice(0, 3).join(', ')}</span>
            </div>
            
            <div className="flex gap-2">
               <button 
                onClick={(e) => { e.stopPropagation(); onAiClick(release); }} 
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 text-xs transition-colors border border-purple-500/20"
               >
                  <Sparkles size={12} /> Pulse AI
               </button>
               {onTrailerClick && release.trailerUrl && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onTrailerClick(release.trailerUrl!); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-white text-xs transition-colors border border-white/10"
                  >
                      <Video size={12} /> Trailer
                  </button>
               )}
               <button 
                onClick={handleShare}
                className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
               >
                 {isShared ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
               </button>
               <button 
                  onClick={handleWatchlist} 
                  className={`p-1.5 rounded-md transition-all duration-300 ${inWatchlist ? 'text-pink-400 bg-pink-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'} ${justAdded ? 'scale-125 rotate-12 text-emerald-400' : ''}`}
               >
                  {justAdded ? <Check size={14} /> : <Bookmark size={14} fill={inWatchlist ? "currentColor" : "none"} />}
               </button>
            </div>
         </div>
      </div>
    );
  }

  // Grid View
  return (
    <div 
      onClick={() => onClick(release)}
      className="group relative rounded-2xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 overflow-hidden hover:shadow-xl hover:shadow-purple-900/20 transition-all duration-300 flex flex-col h-full cursor-pointer"
    >
      
      {/* Image Section */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-800/50">
        <div className={`absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 animate-pulse flex items-center justify-center transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`}>
           <ImageIcon className="text-slate-700/50" size={32} />
        </div>

        <img 
          src={displayImage} 
          alt={release.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          className={getImageClass()} 
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-90" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          <div className="flex flex-col gap-2 items-start">
             <span className={`text-[10px] px-2 py-1 rounded-md border font-medium backdrop-blur-md shadow-sm ${getCategoryColor(release.category)}`}>
               {release.category}
             </span>
             {release.episodeNumber && (
               <span className="text-[10px] px-2 py-1 rounded-md border border-white/10 bg-black/60 text-white font-medium backdrop-blur-md shadow-sm">
                 EP {release.episodeNumber}
               </span>
             )}
          </div>
          <div>
            {renderTimer()}
          </div>
        </div>

        {/* Hover Actions Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-950/40 backdrop-blur-[2px] z-10 pointer-events-none">
           {release.trailerUrl ? (
             <button 
                onClick={(e) => { e.stopPropagation(); onTrailerClick && onTrailerClick(release.trailerUrl!); }}
                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition-all transform scale-90 group-hover:scale-110 shadow-lg pointer-events-auto hover:bg-purple-500 hover:border-purple-400"
              >
                <Play size={20} fill="currentColor" className="ml-0.5" />
             </button>
           ) : (
            <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium text-white pointer-events-auto">
              No Trailer
            </div>
           )}
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
        
        <h3 className={`text-white font-medium leading-tight mb-2 line-clamp-2 group-hover:text-purple-300 transition-colors ${textBlurClass}`}>
          {release.title}
        </h3>
        
        <div className={`flex flex-wrap gap-1.5 mb-4 ${textBlurClass}`}>
          {release.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded border border-slate-700/50 bg-slate-800/30">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
           <button 
              onClick={(e) => { e.stopPropagation(); onAiClick(release); }} 
              className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400 hover:text-purple-400 transition-colors group/ai"
            >
              <Sparkles size={12} className="group-hover/ai:text-purple-400" />
              ASK AI
           </button>

           <div className="flex gap-2">
             <button 
              onClick={handleShare}
              className="text-slate-400 hover:text-white transition-colors"
             >
                {isShared ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
             </button>
             <button 
                onClick={handleWatchlist}
                className={`transition-all duration-300 ${inWatchlist ? 'text-pink-500' : 'text-slate-400 hover:text-white'} ${justAdded ? 'scale-125 rotate-12 text-emerald-400' : ''}`}
              >
                {justAdded ? <Check size={16} /> : <Bookmark size={16} fill={inWatchlist ? "currentColor" : "none"} />}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseCard;