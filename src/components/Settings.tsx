import React from 'react';
import { useApp } from '../AppContext';
import { Shield, FileText, Info, Users, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Settings() {
  const { state } = useApp();
  const isDark = true; // Force dark mode

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
          Parametrlər
        </h1>
        <p className="text-neutral-500 mt-2 font-medium">Qaydalar, şərtlər və maliyyə hesabatları.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Rules, Terms, About */}
        <div className="lg:col-span-2 space-y-8">
          <div className={cn(
            "p-10 rounded-[2.5rem] border shadow-sm space-y-10 transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <section className="space-y-6">
              <h3 className="font-display font-bold text-2xl flex items-center gap-3 text-white">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Shield className="text-emerald-500" size={24} />
                </div>
                Hesab Təhlükəsizliyi
              </h3>
              <p className="text-sm leading-relaxed font-medium text-neutral-400">
                Hesabınızın təhlükəsizliyini təmin etmək üçün güclü şifrədən istifadə edin və OBS linkinizi heç kimlə paylaşmayın. OBS linki sizin yayım açarınızdır və ona sahib olan hər kəs sizin adınızdan yayım edə bilər.
              </p>
            </section>

          </div>
        </div>

        {/* Right Column: Earnings Summary */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/10">
                <TrendingUp size={28} />
              </div>
              <h3 className="font-display font-black text-2xl tracking-tight">Maliyyə</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cari Balans</p>
                <p className="text-4xl font-black tracking-tighter">{state.profile.balance} <span className="text-xl">₼</span></p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
                <p className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Ümumi Qazanc</p>
                <p className="text-4xl font-black tracking-tighter opacity-80">{state.profile.totalEarnings} <span className="text-xl">₼</span></p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <button className="w-full py-5 bg-white text-emerald-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition-all active:scale-95 shadow-xl shadow-black/10">
                Vəsaiti Çıxar
              </button>
              <p className="text-[10px] text-center text-emerald-300 font-bold uppercase tracking-widest">Minimum çıxarış: 10.00 ₼</p>
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl">
            <h4 className="font-display font-bold text-lg mb-6 flex items-center gap-3 text-white">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Clock className="text-emerald-500" size={18} />
              </div>
              Son Aktivlik
            </h4>
            <div className="space-y-6">
              {state.donations.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all group-hover:scale-110 bg-neutral-800 text-emerald-400">
                    {d.sender[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate text-white">{d.sender}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] text-neutral-400 font-medium">{formatDistanceToNow(d.timestamp, { locale: az })}</p>
                      <p className="text-xs font-black text-emerald-500">+{d.amount} ₼</p>
                    </div>
                  </div>
                </div>
              ))}
              {state.donations.length === 0 && (
                <p className="text-xs text-neutral-500 italic text-center py-4">Hələ aktivlik yoxdur.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
