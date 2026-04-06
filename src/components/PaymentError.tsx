import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, Home, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

export default function PaymentError() {
  const { state } = useApp();
  const isDark = state.profile.theme === 'dark';

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-500",
      isDark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-900"
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "max-w-md w-full p-12 rounded-[3rem] shadow-2xl text-center space-y-8 border",
          isDark ? "bg-neutral-900/60 border-neutral-800/50" : "bg-white border-neutral-200/50"
        )}
      >
        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl relative", isDark ? "bg-rose-500/20 text-rose-400" : "bg-rose-50 text-rose-500")}>
          <XCircle size={48} />
          <div className="absolute inset-0 rounded-full border-4 border-rose-500/30 animate-ping" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-black tracking-tight">Xəta Baş Verdi!</h1>
          <p className="text-neutral-500 font-medium leading-relaxed">
            Təəssüf ki, ödəniş zamanı bir xəta baş verdi. Zəhmət olmasa yenidən cəhd edin və ya dəstək xidməti ilə əlaqə saxlayın.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <Link 
            to="/"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Ana Səhifəyə Qayıt
          </Link>
          <button 
            onClick={() => window.history.back()}
            className={cn(
              "w-full py-4 rounded-2xl font-black text-base transition-all active:scale-95 flex items-center justify-center gap-2 border",
              isDark ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700" : "bg-neutral-100 border-neutral-200 hover:bg-neutral-200"
            )}
          >
            <RefreshCw size={20} />
            Yenidən Cəhd Et
          </button>
        </div>
      </motion.div>
    </div>
  );
}
