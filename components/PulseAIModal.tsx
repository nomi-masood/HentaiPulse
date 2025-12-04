import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { AnimeRelease } from '../types';
import { getReleaseInsight } from '../services/geminiService';

interface PulseAIModalProps {
  release: AnimeRelease | null;
  onClose: () => void;
}

const PulseAIModal: React.FC<PulseAIModalProps> = ({ release, onClose }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (release) {
      setLoading(true);
      getReleaseInsight(release.title, release.description)
        .then((text) => {
          setInsight(text);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [release]);

  if (!release) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-purple-400">
              <Sparkles size={20} />
              <span className="font-semibold tracking-wider text-sm uppercase">Pulse AI Insight</span>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-white mb-2">{release.title}</h2>
          
          <div className="min-h-[100px] bg-slate-950/50 rounded-lg p-4 border border-white/5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 py-4">
                <Loader2 size={24} className="animate-spin text-purple-500" />
                <span className="text-xs text-slate-500">Consulting Gemini...</span>
              </div>
            ) : (
              <p className="text-slate-300 leading-relaxed text-sm">
                {insight}
              </p>
            )}
          </div>
          
          <div className="mt-4 flex justify-end">
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseAIModal;