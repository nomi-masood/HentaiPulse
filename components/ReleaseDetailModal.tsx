import React, { useState, useEffect } from 'react';
import { X, Calendar, Star, Tag, Play, Sparkles, Share2, Bookmark, Check, ExternalLink, Clock } from 'lucide-react';
import { AnimeRelease } from '../types';
import { toggleWatchlist, isInWatchlist } from '../services/storage';

interface ReleaseDetailModalProps {
  release: AnimeRelease | null;
  allReleases: AnimeRelease[];
  onClose: () => void;
  onAiClick: (release: AnimeRelease) => void;
  onSelectRelease: (release: AnimeRelease) => void;
  onTrailerClick?: (url: string) => void;
  onToggleWatchlist?: () => void;
}

const ReleaseDetailModal: React.FC<ReleaseDetailModalProps> = ({ 
  release, 
  allReleases, 
  onClose, 
  onAiClick,
  onSelectRelease,
  onTrailerClick,
  onToggleWatchlist
}) => {
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [relatedReleases, setRelatedReleases] = useState<AnimeRelease[]>([]);

  useEffect(() => {
    if (release) {
      setInWatchlist(isInWatchlist(release.id));
      
      // Calculate related releases with weighted scoring
      // Algorithm:
      // 1. Tags match = 2 points each
      // 2. Same Source = 3 points (often indicates same publisher/studio style)
      // 3. Same Category = 1 point
      const related = allReleases
        .filter(r => r.id !== release.id)
        .map(r => {
          let score = 0;
          
          // Overlapping tags
          const sharedTags = r.tags.filter(tag => release.tags.includes(tag)).length;
          score += sharedTags * 2;

          // Same Source
          if (r.source === release.source) score += 3;

          // Same Category
          if (r.category === release.category) score += 1;

          return { release: r, score };
        })
        .filter(item => item.score > 0) // Must have at least some relevance
        .sort((a, b) => b.score - a.score) // Descending score
        .slice(0, 4) // Limit to 4
        .map(item => item.release);

      setRelatedReleases(related);
    }
  }, [release, allReleases]);

  if (!release) return null;

  const handleWatchlist = () => {
    const added = toggleWatchlist(release.id);
    setInWatchlist(added);
    onToggleWatchlist?.();
  };

  const handleShare = async () => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900/50 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
        >
          <X size={24} />
        </button>

        {/* Hero Section */}
        <div className="relative h-64 md:h-80 shrink-0">
            {/* Blurred Background Image */}
            <div className="absolute inset-0 overflow-hidden">
                <img 
                    src={release.imageUrl} 
                    alt="" 
                    className="w-full h-full object-cover blur-xl scale-110 opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            </div>

            <div className="absolute inset-0 flex items-end p-6 md:p-8 gap-6">
                {/* Poster Image */}
                <div className="hidden md:block w-40 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border border-white/10 shrink-0 bg-slate-800">
                    <img 
                        src={release.imageUrl} 
                        alt={release.title} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Title & Key Meta */}
                <div className="flex-1 min-w-0 mb-2">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-600/90 text-white shadow-lg shadow-purple-900/50">
                            {release.category}
                        </span>
                        {release.rating > 0 && (
                            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm bg-black/30 px-2 py-1 rounded-full backdrop-blur-sm">
                                <Star size={14} fill="currentColor" />
                                {release.rating}
                            </div>
                        )}
                    </div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-white leading-tight mb-2 drop-shadow-lg">
                        {release.title}
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <Clock size={16} className="text-purple-400" />
                            {formatDate(release.releaseDate)}
                        </div>
                        <div className="flex items-center gap-2">
                            <ExternalLink size={16} className="text-purple-400" />
                            {release.source}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-6 md:p-8 grid md:grid-cols-[1fr_300px] gap-8">
                
                {/* Main Info */}
                <div className="space-y-8">
                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-3">
                        {release.trailerUrl && (
                            <button 
                                onClick={() => onTrailerClick && onTrailerClick(release.trailerUrl!)}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-200 transition-colors"
                            >
                                <Play size={18} fill="currentColor" />
                                Watch Trailer
                            </button>
                        )}
                        <button 
                            onClick={() => onAiClick(release)}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600/20 text-purple-300 font-bold hover:bg-purple-600/30 border border-purple-500/30 transition-colors"
                        >
                            <Sparkles size={18} />
                            Pulse AI Insight
                        </button>
                        <button 
                            onClick={handleWatchlist}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors border ${
                                inWatchlist 
                                ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' 
                                : 'bg-slate-800/50 text-slate-300 border-white/10 hover:bg-slate-800'
                            }`}
                        >
                            {inWatchlist ? <Check size={18} /> : <Bookmark size={18} />}
                            {inWatchlist ? 'Saved' : 'Watchlist'}
                        </button>
                        <button 
                            onClick={handleShare}
                            className="p-2.5 rounded-xl bg-slate-800/50 text-slate-300 border border-white/10 hover:bg-slate-800 transition-colors"
                        >
                            {isShared ? <Check size={20} className="text-emerald-400" /> : <Share2 size={20} />}
                        </button>
                    </div>

                    {/* Description */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-white">Synopsis</h3>
                        <p className="text-slate-300 leading-relaxed text-base">
                            {release.description}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {release.tags.map(tag => (
                                <span key={tag} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-white/5 text-slate-300 text-sm hover:text-purple-300 transition-colors cursor-default">
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar / Related */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-white sticky top-0 bg-slate-900/95 py-2 z-10">
                        Related Releases
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4">
                        {relatedReleases.length > 0 ? (
                            relatedReleases.map(item => (
                                <div 
                                    key={item.id} 
                                    onClick={() => onSelectRelease(item)}
                                    className="group flex gap-3 p-2 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/60 hover:border-purple-500/30 transition-all cursor-pointer"
                                >
                                    <img 
                                        src={item.imageUrl} 
                                        alt={item.title} 
                                        className="w-16 h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0 py-1">
                                        <h4 className="text-sm font-medium text-slate-200 line-clamp-2 group-hover:text-purple-300 transition-colors">
                                            {item.title}
                                        </h4>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-slate-400">
                                                {item.category}
                                            </span>
                                            {item.rating > 0 && (
                                                <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                                    <Star size={10} fill="currentColor" /> {item.rating}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-sm text-slate-500 italic">
                                No related releases found.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseDetailModal;