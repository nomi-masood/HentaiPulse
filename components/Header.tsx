import React from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

interface HeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentDate, onDateChange, searchQuery, onSearchChange }) => {
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(date);
  };

  const shiftDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    onDateChange(newDate);
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/80 border-b border-white/10 shadow-lg shadow-purple-900/10">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Mobile Menu Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                <span className="text-white font-bold text-xs">HP</span>
              </div>
              <h1 className="text-xl font-light tracking-wide text-white">
                Hentai<span className="font-semibold text-purple-400">Pulse</span>
              </h1>
            </div>
            <button className="md:hidden text-slate-400 hover:text-white">
              <Menu size={24} />
            </button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center justify-center gap-4 bg-slate-900/50 rounded-full px-4 py-1.5 border border-white/5">
            <button onClick={() => shiftDate(-1)} className="text-slate-400 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200 min-w-[120px] justify-center">
              <Calendar size={14} className="text-purple-400" />
              {formatDate(currentDate)}
            </div>
            <button onClick={() => shiftDate(1)} className="text-slate-400 hover:text-white transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative group w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-500 group-focus-within:text-purple-400 transition-colors" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search releases..."
              className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-xl leading-5 bg-slate-900/50 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-all duration-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;