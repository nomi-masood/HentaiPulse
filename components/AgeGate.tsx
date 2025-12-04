import React, { useState, useEffect } from 'react';
import { ShieldAlert, Check } from 'lucide-react';

const AGE_VERIFIED_KEY = 'hentaipulse_age_verified';

const AgeGate: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const verified = localStorage.getItem(AGE_VERIFIED_KEY);
    if (!verified) {
      setIsVisible(true);
      // Prevent scrolling when locked
      document.body.style.overflow = 'hidden';
    }
  }, []);

  const handleVerify = () => {
    localStorage.setItem(AGE_VERIFIED_KEY, 'true');
    setIsVisible(false);
    document.body.style.overflow = 'unset';
  };

  const handleExit = () => {
    window.location.href = 'https://www.google.com';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl">
      <div className="w-full max-w-md bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
          <ShieldAlert size={32} className="text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-2">Age Verification Required</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          This website contains adult content intended for mature audiences only. 
          You must be <strong>18 years of age</strong> or older to enter.
        </p>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleVerify}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 flex items-center justify-center gap-2"
          >
            <Check size={18} />
            I am 18 or older - Enter
          </button>
          
          <button 
            onClick={handleExit}
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl transition-colors"
          >
            Exit Website
          </button>
        </div>
        
        <p className="mt-6 text-xs text-slate-600">
          By entering, you agree to our Terms of Service and confirm that you are of legal age in your jurisdiction.
        </p>
      </div>
    </div>
  );
};

export default AgeGate;