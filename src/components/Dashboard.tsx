import React, { useState, useMemo } from 'react';
import { TrendingUp, Wallet, Users, ArrowUpRight, Clock, Eye, EyeOff, Trophy, BarChart3, Settings, Star } from 'lucide-react';
import { useApp } from '../AppContext';
import { formatDistanceToNow, format, startOfDay, subDays, eachDayOfInterval } from 'date-fns';
import { az } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import FileUpload from './FileUpload';
import SubscriptionManager from './SubscriptionManager';

export default function Dashboard() {
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

  // Analytics Data
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

  // Leaderboard Data
  const leaderboard = useMemo(() => {
    const totals: Record<string, number> = {};
    state.donations.forEach(d => {
      totals[d.sender] = (totals[d.sender] || 0) + d.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [state.donations]);

  const [copiedObs, setCopiedObs] = useState(false);
  const [copiedPublic, setCopiedPublic] = useState(false);

  const copyObsLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/overlay/${state.profile.username}?token=${state.profile.obsToken}`);
    setCopiedObs(true);
    setTimeout(() => setCopiedObs(false), 2000);
  };

  const copyPublicLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/donate/${state.profile.username}`);
    setCopiedPublic(true);
    setTimeout(() => setCopiedPublic(false), 2000);
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative group">
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white dark:border-neutral-800 shadow-2xl relative z-10">
              <img 
                src={state.profile.avatarUrl || `https://ui-avatars.com/api/?name=${state.profile.displayName}&background=6366f1&color=fff`} 
                alt={state.profile.displayName} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
              Xoş gəlmisiniz, {state.profile.displayName}!
            </h1>
            <p className="text-neutral-500 mt-2 font-medium">İdarəetmə panelinə xoş gəldiniz.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Public Support Link Card */}
        <div className="relative group overflow-hidden bg-emerald-600 p-10 rounded-[3rem] shadow-2xl shadow-emerald-500/20 space-y-8 lg:col-span-1">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8">
              <Star size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Dəstək Linki</h3>
            <p className="text-emerald-100/80 font-medium mb-6">Bu linki YouTube, Instagram və ya digər platformalarda paylaşın.</p>
          </div>
          <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 font-mono text-xs break-all text-emerald-100 leading-relaxed">
            {window.location.origin}/donate/{state.profile.username}
          </div>
          <button
            onClick={copyPublicLink}
            className="w-full py-5 bg-white text-emerald-600 rounded-2xl font-black text-base hover:bg-emerald-50 transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center justify-center gap-3"
          >
            {copiedPublic ? 'Kopyalandı!' : 'Linki Kopyala'}
            <ArrowUpRight size={20} />
          </button>
        </div>

        {/* OBS Link Card */}
        <div className="relative group overflow-hidden bg-indigo-600 p-10 rounded-[3rem] shadow-2xl shadow-indigo-500/20 space-y-8 lg:col-span-1">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8">
              <ArrowUpRight size={32} />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">OBS Alert Link</h3>
            <p className="text-indigo-100/80 font-medium mb-6">Bu linki OBS-də "Browser Source" olaraq əlavə edin.</p>
          </div>
          <div className="bg-black/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 font-mono text-xs break-all text-indigo-100 leading-relaxed">
            {window.location.origin}/overlay/{state.profile.username}?token={state.profile.obsToken}
          </div>
          <button
            onClick={copyObsLink}
            className="w-full py-5 bg-white text-indigo-600 rounded-2xl font-black text-base hover:bg-indigo-50 transition-all active:scale-95 shadow-lg shadow-black/10 flex items-center justify-center gap-3"
          >
            {copiedObs ? 'Kopyalandı!' : 'Linki Kopyala'}
            <ArrowUpRight size={20} />
          </button>
        </div>

        {/* Quick Tips or Info */}
        <div className={cn(
          "p-10 rounded-[3rem] border shadow-sm space-y-8 transition-all duration-500 lg:col-span-1",
          isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50"
        )}>
          <h3 className="text-2xl font-display font-bold">Tez-tez verilən suallar</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-500">Dəstəkləri necə qəbul edim?</h4>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">Profil linkinizi YouTube videonuzun təsvirinə, Instagram profilinizə və ya yayım söhbətinə əlavə edin.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-500">Overlay-i necə qurum?</h4>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">Soldakı OBS Alert linkini kopyalayın və OBS-də yeni Browser Source yaradın.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-500">Abunəlikləri necə aktiv edim?</h4>
              <p className="text-sm text-neutral-500 font-medium leading-relaxed">Parametrlər bölməsindən abunəlik səviyyələrini tənzimləyə bilərsiniz.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
