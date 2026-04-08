import React from 'react';
import { Hammer, AlertTriangle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { PLATFORM_NAME, PLATFORM_LOGO } from '../constants';

export default function MaintenanceMode() {
  const { state } = useApp();
  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-teal-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full text-center space-y-10 relative z-10"
      >
        <div className="flex justify-center">
          <div className="relative">
            <motion.div 
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-40 h-40 flex items-center justify-center"
            >
              <img 
                src={state.platformSettings.logoUrl || PLATFORM_LOGO} 
                alt={PLATFORM_NAME} 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer" 
              />
            </motion.div>
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-2 -right-2 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black border-4 border-neutral-950"
            >
              <AlertTriangle size={20} fill="currentColor" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-white leading-tight">
            Texniki Tədbirlər Görülür
          </h1>
          <p className="text-neutral-400 text-lg font-medium leading-relaxed">
            Platformamızın daha yaxşı işləməsi üçün hal-hazırda texniki yenilənmə işləri aparılır. Tezliklə yenidən xidmətinizdə olacağıq.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6">
          <div className="flex items-center gap-3 px-6 py-3 bg-neutral-900/50 border border-neutral-800 rounded-2xl text-neutral-300 font-bold text-sm">
            <Clock size={18} className="text-emerald-500" />
            Tezliklə
          </div>
        </div>

        <div className="pt-10">
          <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-500"
            />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-600 mt-4">Yenilənmə prosesi: 75%</p>
        </div>

        <p className="text-xs text-neutral-500 font-medium">Səbriniz üçün təşəkkür edirik!</p>
      </motion.div>
    </div>
  );
}
