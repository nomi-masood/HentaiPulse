import React from 'react';
import { X, Shield, Bell, Trash2, Eye, EyeOff, Settings } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  safeMode: boolean;
  toggleSafeMode: () => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  onClearWatchlist: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  safeMode,
  toggleSafeMode,
  notificationsEnabled,
  toggleNotifications,
  onClearWatchlist,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Window */}
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Settings</h2>
              <p className="text-xs text-slate-400">Preferences & Privacy</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Safe Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg transition-colors ${safeMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                <Shield size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Safe Mode</h3>
                <p className="text-xs text-slate-400 mt-0.5">Blur explicit images by default.</p>
              </div>
            </div>
            <button 
              onClick={toggleSafeMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${safeMode ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${safeMode ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg transition-colors ${notificationsEnabled ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white">Notifications</h3>
                <p className="text-xs text-slate-400 mt-0.5">Alerts for drops & countdowns.</p>
              </div>
            </div>
            <button 
              onClick={toggleNotifications}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${notificationsEnabled ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <span 
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
          </div>

          <div className="h-px bg-white/5" />

          {/* Data Management */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Data Management</h4>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-3">
                <Trash2 size={18} className="text-red-400" />
                <span className="text-sm text-slate-300">Clear My Watchlist</span>
              </div>
              <button 
                onClick={onClearWatchlist}
                className="px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-md transition-colors"
              >
                Clear Data
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/50 text-center border-t border-white/5">
          <p className="text-[10px] text-slate-600">
            HentaiPulse v1.1.0 • Client-side Storage Only
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;