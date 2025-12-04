import React from 'react';
import { X, Film } from 'lucide-react';

interface TrailerModalProps {
  trailerUrl: string | null;
  title: string | null;
  onClose: () => void;
}

const TrailerModal: React.FC<TrailerModalProps> = ({ trailerUrl, title, onClose }) => {
  if (!trailerUrl) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-300">
        
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-start pointer-events-none">
          <div className="flex items-center gap-2 text-white/90">
             <Film size={16} className="text-purple-500" />
             <span className="font-medium text-sm tracking-wide shadow-black drop-shadow-md">{title}</span>
          </div>
          <button 
            onClick={onClose}
            className="pointer-events-auto p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>

        {/* Iframe */}
        <iframe
          src={`${trailerUrl}?autoplay=1`}
          title="Trailer"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default TrailerModal;