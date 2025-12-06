import React from 'react';
import { Ghost, BookmarkX, Radio, SearchX, RefreshCcw } from 'lucide-react';

export type EmptyStateType = 'watchlist' | 'search' | 'no-data';

interface EmptyStateProps {
  type: EmptyStateType;
  onAction: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ type, onAction }) => {
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
      description: "There are no scheduled releases for this specific day. Try checking a different date.",
      buttonText: "Reset to Today",
      color: "text-slate-400",
      bg: "bg-slate-800",
      border: "border-slate-700"
    }
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative mb-6 group">
        <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${current.bg.replace('/10', '/40')}`} />
        <div className={`relative p-6 rounded-2xl ${current.bg} border ${current.border} shadow-xl backdrop-blur-sm`}>
          <Icon size={48} className={`${current.color} drop-shadow-md`} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">
        {current.title}
      </h3>
      
      <p className="text-slate-400 text-center max-w-sm mb-8 leading-relaxed text-sm">
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
  );
};

export default EmptyState;