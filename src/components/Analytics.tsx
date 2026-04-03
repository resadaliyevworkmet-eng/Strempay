import React, { useMemo } from 'react';
import { Wallet, TrendingUp, Users, BarChart3, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../AppContext';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { az } from 'date-fns/locale';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

export default function Analytics() {
  const { state, updateProfile } = useApp();
  const isDark = state.profile.theme === 'dark';

  const stats = [
    { label: 'Balans', value: state.profile.statsVisible ? `${state.profile.balance} AZN` : '•••••', icon: Wallet, color: isDark ? 'text-emerald-400' : 'text-emerald-600', bg: isDark ? 'bg-emerald-500/10' : 'bg-emerald-50' },
    { label: 'Ümumi Qazanc', value: state.profile.statsVisible ? `${state.profile.totalEarnings} AZN` : '•••••', icon: TrendingUp, color: isDark ? 'text-indigo-400' : 'text-indigo-600', bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50' },
    { label: 'Dəstəkçilər', value: state.donations.length, icon: Users, color: isDark ? 'text-amber-400' : 'text-amber-600', bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50' },
  ];

  const toggleStats = () => {
    updateProfile({ statsVisible: !state.profile.statsVisible });
  };

  const chartData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date(),
    });

    return last7Days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayTotal = state.donations
        .filter(d => format(new Date(d.timestamp), 'yyyy-MM-dd') === dateStr)
        .reduce((sum, d) => sum + d.amount, 0);
      
      return {
        name: format(day, 'dd MMM', { locale: az }),
        amount: dayTotal
      };
    });
  }, [state.donations]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Analitika
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">Qazanc və statistikalarınızı izləyin.</p>
        </div>
        <button 
          onClick={toggleStats}
          className={cn(
            "flex items-center justify-center p-3 border rounded-2xl transition-all shadow-sm active:scale-95",
            isDark ? "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-800 text-white backdrop-blur-md" : "bg-white border-neutral-200 hover:bg-neutral-50 text-neutral-900"
          )}
        >
          {state.profile.statsVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            key={stat.label}
            className={cn(
              "p-8 rounded-[2rem] border shadow-sm transition-all duration-500 group hover:shadow-xl hover:-translate-y-1",
              isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div className={cn(stat.bg, "p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.color)}>
                <stat.icon size={28} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Live</span>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mt-1" />
              </div>
            </div>
            <p className={cn("text-sm font-bold tracking-wide uppercase opacity-60", isDark ? "text-neutral-400" : "text-neutral-500")}>{stat.label}</p>
            <h3 className="text-3xl font-display font-bold mt-2 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className={cn(
        "p-8 rounded-[2rem] border shadow-sm space-y-8 transition-all duration-500",
        isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
      )}>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-2xl flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BarChart3 className="text-indigo-500" size={24} />
            </div>
            Gəlir Qrafiki
          </h3>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1f2937" : "#f3f4f6"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#6b7280' }}
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fontWeight: 700, fill: '#6b7280' }}
                dx={-10}
              />
              <Tooltip 
                cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '5 5' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: '1px solid rgba(99, 102, 241, 0.1)', 
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                  fontSize: '13px',
                  fontWeight: '800',
                  backgroundColor: isDark ? 'rgba(23, 23, 23, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(12px)',
                  color: isDark ? '#ffffff' : '#000000',
                  padding: '12px 16px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
                animationDuration={2000}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
