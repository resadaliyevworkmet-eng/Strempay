import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc,
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { Donation, StreamerProfile, PlatformSettings, PlatformStats } from '../types';
import { useApp } from '../AppContext';
import FileUpload from './FileUpload';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings as SettingsIcon, 
  ShieldCheck,
  Search,
  ArrowUpRight,
  User,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { PLATFORM_NAME, PLATFORM_LOGO, PLATFORM_EMAIL } from '../constants';

const ADMIN_EMAIL = PLATFORM_EMAIL;

export default function AdminPanel() {
  const { user, isLoaded } = useUser();
  const { state, updatePlatformSettings: updateGlobalSettings } = useApp();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streamers' | 'donations' | 'settings'>('dashboard');
  const [stats, setStats] = useState<PlatformStats>({
    totalDonations: 0,
    totalPlatformProfit: 0,
    totalStreamers: 0,
    activeUsers24h: 0
  });
  const [streamers, setStreamers] = useState<StreamerProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>(state.platformSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSettings(state.platformSettings);
  }, [state.platformSettings]);

  useEffect(() => {
    if (!isLoaded || !user || user.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) return;

    // Fetch Streamers
    const unsubStreamers = onSnapshot(collection(db, 'profiles'), (snapshot) => {
      const streamerList = snapshot.docs.map(doc => doc.data() as StreamerProfile);
      setStreamers(streamerList);
      
      setStats(prev => ({
        ...prev,
        totalStreamers: streamerList.length
      }));
    });

    // Fetch Global Donations
    const q = query(collection(db, 'all_donations'), orderBy('timestamp', 'desc'), limit(50));
    const unsubDonations = onSnapshot(q, (snapshot) => {
      const donationList = snapshot.docs.map(doc => doc.data() as Donation & { platformFee?: number });
      setDonations(donationList as any);
      
      // Calculate total profit and total donations from all donations
      let totalProfit = 0;
      let totalDonated = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalProfit += (data.platformFee || 0);
        totalDonated += (data.amount || 0);
      });

      setStats(prev => ({
        ...prev,
        totalPlatformProfit: totalProfit,
        totalDonations: totalDonated
      }));
    });

    // Fetch Settings
    const fetchSettings = async () => {
      const docRef = doc(db, 'platform_settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as PlatformSettings);
      } else {
        // Initialize settings if not exists
        await setDoc(docRef, {
          feePercentage: 10,
          minWithdrawal: 20,
          maintenanceMode: false
        });
      }
      setLoading(false);
    };

    fetchSettings();

    return () => {
      unsubStreamers();
      unsubDonations();
    };
  }, [isLoaded, user, settings.feePercentage]);

  if (!isLoaded) return null;
  if (user?.primaryEmailAddress?.emailAddress !== ADMIN_EMAIL) {
    return <Navigate to="/dashboard" replace />;
  }

  const updatePlatformSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      await updateGlobalSettings(newSettings);
      toast.success('Ayarlar yeniləndi');
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex text-white font-sans">
      {/* Sidebar */}
      <div className="w-72 border-r border-neutral-800 bg-neutral-900/50 backdrop-blur-xl p-8 flex flex-col gap-10">
        <div className="flex items-center gap-4 px-2">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={state.platformSettings.logoUrl || PLATFORM_LOGO} alt={PLATFORM_NAME} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
          <div>
            <h1 className="font-display font-black text-xl leading-none text-white tracking-tight">Admin</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mt-1.5">Platforma</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'dashboard', label: 'Panel', icon: TrendingUp },
            { id: 'streamers', label: 'Strimenlər', icon: Users },
            { id: 'donations', label: 'İanələr', icon: History },
            { id: 'settings', label: 'Ayarlar', icon: SettingsIcon },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group",
                activeTab === item.id 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20" 
                  : "text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
              )}
            >
              <item.icon size={22} className={cn("transition-colors", activeTab === item.id ? "text-white" : "group-hover:text-emerald-400")} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-12 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent">
        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                  Xoş gəldiniz, Admin
                </h2>
                <p className="text-neutral-500 mt-2 font-medium">Platformanın ümumi vəziyyəti və analitikası.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Ümumi İanə', value: `${stats.totalDonations.toFixed(2)} AZN`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Platforma Qazancı', value: `${stats.totalPlatformProfit.toFixed(2)} AZN`, icon: TrendingUp, color: 'text-teal-400', bg: 'bg-teal-500/10', sub: `${settings.feePercentage}% komissiya` },
                { label: 'Strimerlərin Qazancı', value: `${streamers.reduce((acc, s) => acc + (s.totalEarnings || 0), 0).toFixed(2)} AZN`, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Ümumi Strimer', value: stats.totalStreamers, icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              ].map((stat, i) => (
                <div key={i} className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl group hover:border-emerald-500/30 transition-all">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                    <stat.icon size={28} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-neutral-500">{stat.label}</p>
                  <h3 className="text-2xl font-black mt-2 text-white">{stat.value}</h3>
                  {stat.sub && <p className="text-[10px] font-bold text-neutral-600 mt-1">{stat.sub}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 border-b border-neutral-800/50 flex items-center justify-between bg-neutral-800/20">
                  <h3 className="font-display font-black text-xl text-white">Son İanələr</h3>
                  <button onClick={() => setActiveTab('donations')} className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">Hamısı</button>
                </div>
                <div className="divide-y divide-neutral-800/50">
                  {donations.slice(0, 5).map((donation, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-700/50">
                          <User size={22} className="text-neutral-500" />
                        </div>
                        <div>
                          <p className="font-black text-sm text-white">{donation.sender}</p>
                          <p className="text-xs font-medium text-neutral-500">Alıcı: <span className="text-emerald-500/70">@{donation.receiver}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-400 text-lg">{donation.amount} ₼</p>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">{new Date(donation.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl">
                <div className="p-8 border-b border-neutral-800/50 flex items-center justify-between bg-neutral-800/20">
                  <h3 className="font-display font-black text-xl text-white">Top Strimenlər</h3>
                  <button onClick={() => setActiveTab('streamers')} className="text-xs font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors">Hamısı</button>
                </div>
                <div className="divide-y divide-neutral-800/50">
                  {streamers.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5).map((streamer, idx) => (
                    <div key={idx} className="p-6 flex items-center justify-between hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                        {streamer.avatarUrl ? (
                          <img src={streamer.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-neutral-700/50" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-12 h-12 flex items-center justify-center">
                            <img src={state.platformSettings.logoUrl || PLATFORM_LOGO} alt={PLATFORM_NAME} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          </div>
                        )}
                        <div>
                          <p className="font-black text-sm text-white">{streamer.displayName || streamer.username}</p>
                          <p className="text-xs font-medium text-neutral-500">@{streamer.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white text-lg">{streamer.totalEarnings.toFixed(2)} ₼</p>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Balans: {streamer.balance.toFixed(2)} ₼</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streamers' && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-4xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">Strimenlər</h2>
                <p className="text-neutral-500 mt-2 font-medium">Platformada qeydiyyatdan keçmiş bütün yaradıcılar.</p>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Axtar..." 
                  className="pl-12 pr-6 py-4 bg-neutral-900/50 border border-neutral-800 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none text-white font-bold transition-all w-80"
                />
              </div>
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-800/40 text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="p-8">Strimer</th>
                    <th className="p-8">Ümumi Qazanc</th>
                    <th className="p-8">Balans</th>
                    <th className="p-8">Status</th>
                    <th className="p-8 text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {streamers.map((streamer, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/30 transition-colors group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          {streamer.avatarUrl ? (
                            <img src={streamer.avatarUrl} className="w-12 h-12 rounded-2xl object-cover border border-neutral-700/50" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <img src={state.platformSettings.logoUrl || PLATFORM_LOGO} alt={PLATFORM_NAME} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                          )}
                          <div>
                            <p className="font-black text-white group-hover:text-emerald-400 transition-colors">{streamer.displayName || streamer.username}</p>
                            <p className="text-xs font-medium text-neutral-500">@{streamer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8 font-black text-emerald-400 text-lg">{streamer.totalEarnings.toFixed(2)} ₼</td>
                      <td className="p-8 font-black text-white text-lg">{streamer.balance.toFixed(2)} ₼</td>
                      <td className="p-8">
                        <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Aktiv</span>
                      </td>
                      <td className="p-8 text-right">
                        <button className="p-3 hover:bg-emerald-500/10 rounded-xl transition-all text-neutral-500 hover:text-emerald-400 active:scale-95">
                          <ArrowUpRight size={22} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="space-y-10">
            <div>
              <h2 className="text-4xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">Qlobal İanələr</h2>
              <p className="text-neutral-500 mt-2 font-medium">Platformada baş verən bütün maliyyə əməliyyatları.</p>
            </div>
            <div className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden shadow-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-800/40 text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em]">
                    <th className="p-8">Göndərən</th>
                    <th className="p-8">Alıcı</th>
                    <th className="p-8">Məbləğ</th>
                    <th className="p-8">Komissiya</th>
                    <th className="p-8">Mesaj</th>
                    <th className="p-8">Tarix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {donations.map((donation: any, idx) => (
                    <tr key={idx} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="p-8 font-black text-white">{donation.sender}</td>
                      <td className="p-8 text-neutral-500 font-bold">@{donation.receiver}</td>
                      <td className="p-8 font-black text-emerald-400 text-lg">{donation.amount} ₼</td>
                      <td className="p-8 text-emerald-500/70 font-black text-sm">{donation.platformFee?.toFixed(2) || '0.00'} ₼</td>
                      <td className="p-8 text-sm font-medium text-neutral-400 italic truncate max-w-xs">"{donation.message}"</td>
                      <td className="p-8 text-neutral-500 text-xs font-bold uppercase tracking-wider">{new Date(donation.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-3xl space-y-10">
            <div>
              <h2 className="text-4xl font-display font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">Platforma Ayarları</h2>
              <p className="text-neutral-500 mt-2 font-medium">Qlobal komissiya və platforma tənzimləmələri.</p>
            </div>
            
            <div className="bg-neutral-900/40 border border-neutral-800/50 backdrop-blur-xl p-10 rounded-[3rem] space-y-10 shadow-xl">
              <div className="space-y-4">
                <FileUpload 
                  label="Platforma Loqosu"
                  type="image"
                  accept=".png,.jpg,.jpeg,.svg,.webp"
                  currentUrl={settings.logoUrl}
                  onUploadSuccess={(url) => setSettings(prev => ({ ...prev, logoUrl: url }))}
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Platforma Komissiyası (%)</label>
                <div className="flex items-center gap-8">
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={settings.feePercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, feePercentage: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="w-24 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/20">
                    <span className="font-black text-2xl text-emerald-400">{settings.feePercentage}%</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-500 font-medium italic">Hər ianədən platformanın götürəcəyi faiz dərəcəsi.</p>
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Minimum Çıxarış Məbləği (AZN)</label>
                <div className="relative">
                  <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
                  <input 
                    type="number" 
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings(prev => ({ ...prev, minWithdrawal: parseInt(e.target.value) }))}
                    className="w-full pl-14 pr-6 py-5 bg-neutral-800/50 border border-neutral-700 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-xl text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-8 rounded-[2rem] bg-neutral-800/30 border border-neutral-700/50">
                <div>
                  <p className="font-black text-lg text-white">Texniki Xidmət Rejimi</p>
                  <p className="text-xs text-neutral-500 font-medium mt-1">Platformanı müvəqqəti olaraq bütün istifadəçilər üçün bağlayır.</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={cn(
                    "w-16 h-9 rounded-full transition-all relative shadow-inner",
                    settings.maintenanceMode ? 'bg-emerald-600' : 'bg-neutral-700'
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-7 h-7 bg-white rounded-full transition-all shadow-lg",
                    settings.maintenanceMode ? 'left-8' : 'left-1'
                  )} />
                </button>
              </div>

              <button 
                onClick={() => updatePlatformSettings(settings)}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-[2rem] shadow-2xl shadow-emerald-500/40 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
              >
                <SettingsIcon size={24} />
                Ayarları Saxla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
