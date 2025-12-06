import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Star, Calendar, Clock, Info, ExternalLink } from 'lucide-react';
import { AnimeRelease, Category } from '../types';

interface HeroSectionProps {
  release: AnimeRelease;
  safeMode: boolean;
  onAiClick: (release: AnimeRelease) => void;
  onTrailerClick?: (url: string) => void;
  onClick: (release: AnimeRelease) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ 
  release, 
  safeMode,
  onAiClick, 
  onTrailerClick,
  onClick 
}) => {
  const [timeString, setTimeString] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [release.imageUrl]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime();
      const target = new Date(release.releaseDate).getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsLive(true);
        setTimeString("Streaming Now");
        return;
      }
      
      setIsLive(false);
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeString(`Drops in ${hours}h ${minutes}m`);
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [release.releaseDate]);

  const getBackgroundClass = () => {
    let base = "w-full h-full object-cover transition-all duration-1000 ";
    if (!imageLoaded) return base + "opacity-0 blur-xl scale-110";
    // If safe mode, blur heavily. If not, use standard atmospheric blur.
    if (safeMode) return base + "opacity-30 blur-2xl scale-110"; 
    return base + "opacity-40 blur-sm scale-105";
  };

  return (
    <div 
      onClick={() => onClick(release)}
      className="relative w-full aspect-[4/3] md:aspect-[21/9] lg:aspect-[3/1] max-h-[500px] rounded-3xl overflow-hidden group cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all duration-500 shadow-2xl mb-8 animate-in fade-in slide-in-from-top-4"
    >
      {/* Background Layer */}
      <div className="absolute inset-0 bg-slate-900">
        <img 
          src={release.imageUrl} 
          alt={release.title}
          className={getBackgroundClass()}
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
      </div>

      {/* Content Layer */}
      <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end md:justify-center items-start">
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.5)] animate-pulse">
            #1 SPOTLIGHT
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/10 backdrop-blur-md">
            {release.category}
          </span>
          {isLive ? (
             <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white animate-pulse">
               <span className="w-2 h-2 bg-white rounded-full" /> LIVE
             </span>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-black/40 text-purple-300 border border-purple-500/20 backdrop-blur-md">
               <Clock size={12} /> {timeString}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className={`text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl drop-shadow-2xl animate-in fade-in slide-in-from-left-4 duration-700 delay-200 ${safeMode ? 'blur-sm group-hover:blur-0 transition-all duration-300' : ''}`}>
          {release.title}
        </h1>

        {/* Description (Desktop only) */}
        <p className={`hidden md:block text-slate-300 text-sm md:text-base max-w-xl mb-8 line-clamp-2 leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-300 ${safeMode ? 'blur-sm group-hover:blur-0 transition-all duration-300' : ''}`}>
          {release.description}
        </p>

        {/* Metadata Row */}
        <div className="flex items-center gap-6 text-sm text-slate-400 mb-8 animate-in fade-in slide-in-from-left-4 duration-700 delay-400">
           <div className="flex items-center gap-2">
             <ExternalLink size={16} className="text-purple-400" />
             <span className="font-medium text-slate-200">{release.source}</span>
           </div>
           {release.rating > 0 && (
             <div className="flex items-center gap-2">
               <Star size={16} className="text-amber-400 fill-amber-400" />
               <span className="font-medium text-slate-200">{release.rating} / 10</span>
             </div>
           )}
           <div className="flex items-center gap-2">
             <Calendar size={16} className="text-purple-400" />
             <span>
               {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(release.releaseDate))}
             </span>
           </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          {onTrailerClick && release.trailerUrl && (
            <button 
              onClick={(e) => { e.stopPropagation(); onTrailerClick(release.trailerUrl!); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-950 font-bold hover:bg-purple-50 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] group/btn"
            >
              <Play size={18} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
              Watch Trailer
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onAiClick(release); }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600/20 text-purple-300 font-bold border border-purple-500/30 hover:bg-purple-600/30 transition-all hover:shadow-[0_0_20px_rgba(147,51,234,0.2)]"
          >
            <Sparkles size={18} />
            Pulse AI
          </button>

          <button 
             onClick={(e) => { e.stopPropagation(); onClick(release); }}
             className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 text-white font-bold hover:bg-white/10 transition-colors backdrop-blur-sm border border-white/5"
          >
            <Info size={18} />
            View Details
          </button>
        </div>

      </div>

      {/* Decorative Gradient Overlay (Right Side) */}
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-slate-950 to-transparent pointer-events-none" />
    </div>
  );
};

export default HeroSection;