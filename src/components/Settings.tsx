import React from 'react';
import { useApp } from '../AppContext';
import { Shield, FileText, Info, Users, TrendingUp, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Settings() {
  const { state } = useApp();
  const isDark = state.profile.theme === 'dark';

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
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
              <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Shield className="text-indigo-500" size={24} />
                </div>
                Hesab Təhlükəsizliyi
              </h3>
              <p className={cn("text-sm leading-relaxed font-medium", isDark ? "text-neutral-400" : "text-neutral-600")}>
                Hesabınızın təhlükəsizliyini təmin etmək üçün güclü şifrədən istifadə edin və OBS linkinizi heç kimlə paylaşmayın. OBS linki sizin yayım açarınızdır və ona sahib olan hər kəs sizin adınızdan yayım edə bilər.
              </p>
            </section>

          </div>

          {/* Detailed Donors Table */}
          <div className={cn(
            "rounded-[2.5rem] border shadow-sm overflow-hidden transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <div className={cn("p-8 border-b flex items-center justify-between", isDark ? "border-neutral-800" : "border-neutral-100")}>
              <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg">
                  <Users className="text-indigo-500" size={24} />
                </div>
                Bütün Dəstəkçilər
              </h3>
              <span className={cn("text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest", isDark ? "bg-indigo-500/10 text-indigo-400" : "bg-indigo-50 text-indigo-600")}>
                {state.donations.length} nəfər
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isDark ? "bg-neutral-800/30 text-neutral-500" : "bg-neutral-50 text-neutral-400")}>
                    <th className="px-8 py-5">Göndərən</th>
                    <th className="px-8 py-5">Məbləğ</th>
                    <th className="px-8 py-5">Mesaj</th>
                    <th className="px-8 py-5">Tarix</th>
                  </tr>
                </thead>
                <tbody className={cn("divide-y", isDark ? "divide-neutral-800" : "divide-neutral-100")}>
                  {state.donations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-16 text-center text-neutral-400 font-bold italic">Hələ heç bir dəstək yoxdur.</td>
                    </tr>
                  ) : (
                    state.donations.map((donation) => (
                      <tr key={donation.id} className={cn("transition-all group", isDark ? "hover:bg-neutral-800/40" : "hover:bg-neutral-50")}>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black", isDark ? "bg-neutral-800" : "bg-neutral-100")}>
                              {donation.sender[0]}
                            </div>
                            <span className="font-bold text-sm">{donation.sender}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-black text-emerald-500 text-sm">{donation.amount} ₼</span>
                        </td>
                        <td className={cn("px-8 py-5 text-sm font-medium italic truncate max-w-[200px]", isDark ? "text-neutral-400" : "text-neutral-500")}>
                          "{donation.message}"
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-neutral-400 text-[10px] font-bold uppercase tracking-tighter">
                            <Clock size={12} />
                            {formatDistanceToNow(donation.timestamp, { addSuffix: true, locale: az })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Earnings Summary */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 text-white p-10 rounded-[2.5rem] shadow-2xl shadow-indigo-500/20 space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md border border-white/10">
                <TrendingUp size={28} />
              </div>
              <h3 className="font-display font-black text-2xl tracking-tight">Maliyyə</h3>
            </div>
            
            <div className="space-y-6 relative z-10">
              <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Cari Balans</p>
                <p className="text-4xl font-black tracking-tighter">{state.profile.balance} <span className="text-xl">₼</span></p>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-md">
                <p className="text-indigo-200 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Ümumi Qazanc</p>
                <p className="text-4xl font-black tracking-tighter opacity-80">{state.profile.totalEarnings} <span className="text-xl">₼</span></p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <button className="w-full py-5 bg-white text-indigo-900 rounded-[1.5rem] font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-xl shadow-black/10">
                Vəsaiti Çıxar
              </button>
              <p className="text-[10px] text-center text-indigo-300 font-bold uppercase tracking-widest">Minimum çıxarış: 10.00 ₼</p>
            </div>
          </div>

          <div className={cn(
            "p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <h4 className="font-display font-bold text-lg mb-6 flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Clock className="text-indigo-500" size={18} />
              </div>
              Son Aktivlik
            </h4>
            <div className="space-y-6">
              {state.donations.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-4 group">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all group-hover:scale-110", isDark ? "bg-neutral-800 text-indigo-400" : "bg-neutral-100 text-indigo-600")}>
                    {d.sender[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{d.sender}</p>
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
