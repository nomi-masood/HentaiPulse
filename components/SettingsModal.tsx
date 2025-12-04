import React from 'react';
import { X, Bell, Eye, EyeOff, Trash2, Settings, Shield } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationsEnabled: boolean;
  onToggleNotifications: () => void;
  safeMode: boolean;
  onToggleSafeMode: () => void;
  onClearData: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  notificationsEnabled,
  onToggleNotifications,
  safeMode,
  onToggleSafeMode,
  onClearData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900/50">
          <div className="flex items-center gap-2 text-white">
            <Settings size={20} className="text-purple-400" />
            <h2 className="font-semibold tracking-wide">Settings</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${notificationsEnabled ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-400'}`}>
                <Bell size={20} />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Release Notifications</h3>
                <p className="text-xs text-slate-400">Alerts 15m before & at launch</p>
              </div>
            </div>
            <button 
              onClick={onToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${notificationsEnabled ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Safe Mode */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${safeMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-400'}`}>
                {safeMode ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Safe Mode (Blur)</h3>
                <p className="text-xs text-slate-400">Blur images until hovered</p>
              </div>
            </div>
            <button 
              onClick={onToggleSafeMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${safeMode ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${safeMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {/* Data Management */}
          <div className="pt-4 border-t border-white/5">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Management</h3>
            <button 
              onClick={() => {
                if(window.confirm('Are you sure you want to clear your watchlist? This cannot be undone.')) {
                  onClearData();
                }
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-xl group transition-colors"
            >
              <div className="flex items-center gap-3 text-red-400">
                <Trash2 size={18} />
                <span className="text-sm font-medium">Clear Watchlist</span>
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 p-4 flex items-center justify-center border-t border-white/5">
           <p className="text-[10px] text-slate-600 flex items-center gap-1">
             <Shield size={10} />
             HentaiPulse v1.0.0
           </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;