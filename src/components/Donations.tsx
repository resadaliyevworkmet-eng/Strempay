import React, { useMemo } from 'react';
import { Trophy, Clock } from 'lucide-react';
import { useApp } from '../AppContext';
import { formatDistanceToNow } from 'date-fns';
import { az } from 'date-fns/locale';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Donations() {
  const { state } = useApp();
  const isDark = state.profile.theme === 'dark';

  // Leaderboard Data
  const leaderboard = useMemo(() => {
    const totals: Record<string, number> = {};
    state.donations.forEach(d => {
      totals[d.sender] = (totals[d.sender] || 0) + d.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [state.donations]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
          Dəstəklər
        </h1>
        <p className="text-neutral-500 mt-2 font-medium">Son dəstəklər və ən çox dəstək olanlar.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Donations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-display font-bold tracking-tight">Son Dəstəklər</h2>
          </div>

          <div className={cn(
            "rounded-[2.5rem] border overflow-hidden shadow-sm transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            {state.donations.length === 0 ? (
              <div className="p-20 text-center">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="text-neutral-300 dark:text-neutral-600" size={48} />
                </div>
                <p className="text-neutral-500 dark:text-neutral-400 font-bold text-lg">Hələ heç bir dəstək yoxdur.</p>
              </div>
            ) : (
              <div className={cn("divide-y", isDark ? "divide-neutral-800/50" : "divide-neutral-100")}>
                {state.donations.map((donation, i) => (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    key={donation.id}
                    className={cn("p-6 flex items-start gap-5 transition-all group", isDark ? "hover:bg-neutral-800/40" : "hover:bg-neutral-50/50")}
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                      {donation.sender[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-lg truncate">{donation.sender}</h4>
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-sm font-black">+{donation.amount} AZN</span>
                      </div>
                      <p className={cn("text-base font-medium leading-relaxed", isDark ? "text-neutral-300" : "text-neutral-600")}>"{donation.message}"</p>
                      <div className="flex items-center gap-4 mt-4">
                        <p className="text-neutral-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider">
                          <Clock size={14} />
                          {formatDistanceToNow(donation.timestamp, { addSuffix: true, locale: az })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="space-y-6">
          <h2 className="text-2xl font-display font-bold tracking-tight px-2">Top Dəstəkçilər</h2>
          <div className={cn(
            "p-8 rounded-[2rem] border shadow-sm space-y-8 transition-all duration-500",
            isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
          )}>
            <div className="space-y-4">
              {leaderboard.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-40">
                  <Trophy size={48} className="mb-4 text-neutral-500" />
                  <p className="text-center italic text-sm font-medium">Hələ heç bir dəstək yoxdur.</p>
                </div>
              ) : (
                leaderboard.map((entry, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={entry.name} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                      isDark ? "bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800" : "bg-neutral-50 border-neutral-100 hover:bg-white"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-sm",
                        i === 0 ? "bg-gradient-to-br from-amber-300 to-amber-500 text-white" : 
                        i === 1 ? "bg-gradient-to-br from-neutral-300 to-neutral-400 text-white" :
                        i === 2 ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white" : 
                        (isDark ? "bg-neutral-700 text-neutral-400" : "bg-white text-neutral-400 border border-neutral-100")
                      )}>
                        {i + 1}
                      </div>
                      <span className="font-bold text-sm truncate max-w-[120px]">{entry.name}</span>
                    </div>
                    <span className="font-black text-indigo-500 text-base">{entry.amount} ₼</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
