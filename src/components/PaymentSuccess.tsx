import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { cn } from '../lib/utils';

export default function PaymentSuccess() {
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
        <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl relative", isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-500")}>
          <CheckCircle2 size={48} />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-black tracking-tight">Ödəniş Uğurludur!</h1>
          <p className="text-neutral-500 font-medium leading-relaxed">
            Dəstəyiniz üçün təşəkkür edirik. Ödənişiniz uğurla tamamlandı və yaradıcıya çatdırıldı.
          </p>
        </div>

        <Link 
          to="/"
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-base hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
        >
          <Home size={20} />
          Ana Səhifəyə Qayıt
        </Link>
      </motion.div>
    </div>
  );
}
