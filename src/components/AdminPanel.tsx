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
import { motion } from 'motion/react';
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
import toast from 'react-hot-toast';

const ADMIN_EMAIL = "resadaliyevworkmet@gmail.com";

export default function AdminPanel() {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'streamers' | 'donations' | 'settings'>('dashboard');
  const [stats, setStats] = useState<PlatformStats>({
    totalDonations: 0,
    totalPlatformProfit: 0,
    totalStreamers: 0,
    activeUsers24h: 0
  });
  const [streamers, setStreamers] = useState<StreamerProfile[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    feePercentage: 5,
    minWithdrawal: 20,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);

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
          feePercentage: 5,
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
      const docRef = doc(db, 'platform_settings', 'global');
      await updateDoc(docRef, newSettings);
      setSettings(prev => ({ ...prev, ...newSettings }));
      toast.success('Ayarlar yeniləndi');
    } catch (err) {
      toast.error('Xəta baş verdi');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex">
      {/* Sidebar */}
      <div className="w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">Admin</h1>
            <p className="text-xs text-neutral-500 mt-1">Platform İdarəetmə</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <TrendingUp size={20} />
            Panel
          </button>
          <button
            onClick={() => setActiveTab('streamers')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'streamers' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <Users size={20} />
            Strimenlər
          </button>
          <button
            onClick={() => setActiveTab('donations')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'donations' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <History size={20} />
            İanələr
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'settings' 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' 
                : 'text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            <SettingsIcon size={20} />
            Ayarlar
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-display font-bold">Xoş gəldiniz, Admin</h2>
                <p className="text-neutral-500 mt-1">Platformanın ümumi vəziyyəti</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                  <DollarSign size={24} />
                </div>
                <p className="text-sm font-medium text-neutral-500">Ümumi İanə</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalDonations.toFixed(2)} AZN</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                  <TrendingUp size={24} />
                </div>
                <p className="text-sm font-medium text-neutral-500">Platforma Qazancı ({settings.feePercentage}%)</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalPlatformProfit.toFixed(2)} AZN</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                  <Users size={24} />
                </div>
                <p className="text-sm font-medium text-neutral-500">Ümumi Strimer</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalStreamers}</h3>
              </div>
              <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
                  <User size={24} />
                </div>
                <p className="text-sm font-medium text-neutral-500">Aktiv İstifadəçi (24s)</p>
                <h3 className="text-2xl font-bold mt-1">{streamers.filter(s => s.balance > 0).length}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Son İanələr</h3>
                  <button onClick={() => setActiveTab('donations')} className="text-sm text-indigo-600 font-medium">Hamısı</button>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {donations.slice(0, 5).map((donation, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                          <User size={18} className="text-neutral-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">{donation.sender}</p>
                          <p className="text-xs text-neutral-500">Alıcı: {donation.receiver}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">{donation.amount} AZN</p>
                        <p className="text-[10px] text-neutral-400">{new Date(donation.timestamp).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
                  <h3 className="font-bold text-lg">Top Strimenlər</h3>
                  <button onClick={() => setActiveTab('streamers')} className="text-sm text-indigo-600 font-medium">Hamısı</button>
                </div>
                <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {streamers.sort((a, b) => b.totalEarnings - a.totalEarnings).slice(0, 5).map((streamer, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {streamer.avatarUrl ? (
                          <img src={streamer.avatarUrl} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600">
                            <User size={18} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-sm">{streamer.displayName || streamer.username}</p>
                          <p className="text-xs text-neutral-500">@{streamer.username}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{streamer.totalEarnings.toFixed(2)} AZN</p>
                        <p className="text-[10px] text-neutral-400">Balans: {streamer.balance.toFixed(2)} AZN</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'streamers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-display font-bold">Strimenlər</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Axtar..." 
                  className="pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-sm">
                    <th className="p-6 font-medium">Strimer</th>
                    <th className="p-6 font-medium">Ümumi Qazanc</th>
                    <th className="p-6 font-medium">Balans</th>
                    <th className="p-6 font-medium">Status</th>
                    <th className="p-6 font-medium text-right">Əməliyyat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {streamers.map((streamer, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          {streamer.avatarUrl ? (
                            <img src={streamer.avatarUrl} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-600">
                              <User size={18} />
                            </div>
                          )}
                          <div>
                            <p className="font-bold">{streamer.displayName || streamer.username}</p>
                            <p className="text-xs text-neutral-500">@{streamer.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 font-bold text-emerald-600">{streamer.totalEarnings.toFixed(2)} AZN</td>
                      <td className="p-6 font-bold">{streamer.balance.toFixed(2)} AZN</td>
                      <td className="p-6">
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full">Aktiv</span>
                      </td>
                      <td className="p-6 text-right">
                        <button className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                          <ArrowUpRight size={18} />
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
          <div className="space-y-6">
            <h2 className="text-3xl font-display font-bold">Qlobal İanələr</h2>
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 text-sm">
                    <th className="p-6 font-medium">Göndərən</th>
                    <th className="p-6 font-medium">Alıcı</th>
                    <th className="p-6 font-medium">Məbləğ</th>
                    <th className="p-6 font-medium">Komissiya</th>
                    <th className="p-6 font-medium">Mesaj</th>
                    <th className="p-6 font-medium">Tarix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {donations.map((donation: any, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                      <td className="p-6 font-bold">{donation.sender}</td>
                      <td className="p-6 text-neutral-500">@{donation.receiver}</td>
                      <td className="p-6 font-bold text-emerald-600">{donation.amount} AZN</td>
                      <td className="p-6 text-indigo-500 font-medium">{donation.platformFee?.toFixed(2) || '0.00'} AZN</td>
                      <td className="p-6 text-sm italic text-neutral-500 truncate max-w-xs">"{donation.message}"</td>
                      <td className="p-6 text-neutral-400 text-sm">{new Date(donation.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl space-y-8">
            <h2 className="text-3xl font-display font-bold">Platforma Ayarları</h2>
            
            <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Platforma Komissiyası (%)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" 
                    min="0" 
                    max="50" 
                    value={settings.feePercentage}
                    onChange={(e) => setSettings(prev => ({ ...prev, feePercentage: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="w-16 text-center font-bold text-xl">{settings.feePercentage}%</span>
                </div>
                <p className="text-xs text-neutral-400 italic">Hər ianədən platformanın götürəcəyi faiz dərəcəsi.</p>
              </div>

              <div className="space-y-2 pt-4">
                <label className="text-sm font-bold text-neutral-500 uppercase tracking-wider">Minimum Çıxarış Məbləği (AZN)</label>
                <input 
                  type="number" 
                  value={settings.minWithdrawal}
                  onChange={(e) => setSettings(prev => ({ ...prev, minWithdrawal: parseInt(e.target.value) }))}
                  className="w-full p-4 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div>
                  <p className="font-bold">Texniki Xidmət Rejimi</p>
                  <p className="text-xs text-neutral-500">Platformanı müvəqqəti bağlayır</p>
                </div>
                <button 
                  onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-indigo-600' : 'bg-neutral-200 dark:bg-neutral-800'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <button 
                onClick={() => updatePlatformSettings(settings)}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
              >
                <SettingsIcon size={20} />
                Ayarları Saxla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
