import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Donation, StreamerProfile, Subscription, SubscriptionTier, PlatformSettings } from './types';
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { PLATFORM_LOGO } from './constants';

interface AppContextType {
  state: AppState & { platformSettings: PlatformSettings };
  addDonation: (donation: Omit<Donation, 'id' | 'timestamp'>) => void;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'startDate' | 'status'>) => void;
  updateProfile: (profile: Partial<StreamerProfile>) => void;
  updateSubscriptionTiers: (tiers: SubscriptionTier[]) => void;
  updatePlatformSettings: (settings: Partial<PlatformSettings>) => void;
  resetData: () => void;
}

const DEFAULT_PROFILE: StreamerProfile = {
  username: 'streamer123',
  displayName: 'Super Streamer',
  bio: 'Xoş gəlmisiniz! Məni dəstəklədiyiniz üçün təşəkkürlər.',
  avatarUrl: 'https://picsum.photos/seed/streamer/200/200',
  balance: 0,
  totalEarnings: 0,
  obsToken: Math.random().toString(36).substring(7),
  statsVisible: true,
  minDonation: 1,
  maxDonation: 1000,
  discordWebhook: '',
  moderationWords: ['təhqir', 'söyüş'],
  theme: 'dark',
  socials: { instagram: '', youtube: '', tiktok: '' },
  subscriptionsEnabled: false,
  goal: {
    enabled: false,
    title: 'Yeni Mikrofon',
    targetAmount: 500,
    currentAmount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    barThickness: 40,
    barColor: '#22c55e',
    barBgColor: '#171717',
    fontFamily: 'Inter',
    fontColor: '#ffffff',
  },
  alertSettings: {
    duration: 5,
    imageSize: 150,
    ttsEnabled: true,
    soundUrl: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    soundVolume: 0.5,
    senderFont: { family: 'Inter', size: 42, color: '#22c55e', style: 'bold' },
    messageFont: { family: 'Inter', size: 27, color: '#a3a3a3', style: 'normal' },
    amountFont: { family: 'Inter', size: 42, color: '#22c55e', style: 'bold' },
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_TIERS: SubscriptionTier[] = [
  { id: '1', name: 'Extra', price: 5, benefits: ['Özəl nişan', 'Reklamsız baxış'], color: '#cd7f32', enabled: true },
  { id: '2', name: 'Premium', price: 15, benefits: ['Özəl nişan', 'Reklamsız baxış', 'Özəl emojilər'], color: '#c0c0c0', enabled: true },
  { id: '3', name: 'Premium Plus', price: 50, benefits: ['Özəl nişan', 'Reklamsız baxış', 'Özəl emojilər', 'Discord rolu'], color: '#ffd700', enabled: true },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<(AppState & { platformSettings: PlatformSettings })>(() => {
    const saved = localStorage.getItem('donait_state');
    const defaultPlatformSettings: PlatformSettings = {
      feePercentage: 10,
      minWithdrawal: 20,
      maintenanceMode: false,
      logoUrl: PLATFORM_LOGO
    };

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Ensure subscriptionTiers is an array and has the standard tiers
        let subscriptionTiers = parsed.subscriptionTiers;
        if (!Array.isArray(subscriptionTiers) || subscriptionTiers.length === 0) {
          subscriptionTiers = DEFAULT_TIERS;
        } else {
          // Ensure all default tiers exist in the array
          DEFAULT_TIERS.forEach(defaultTier => {
            if (!subscriptionTiers.find((t: any) => t.id === defaultTier.id)) {
              subscriptionTiers.push(defaultTier);
            }
          });
        }

        return {
          ...parsed,
          platformSettings: parsed.platformSettings || defaultPlatformSettings,
          subscriptions: parsed.subscriptions || [],
          subscriptionTiers,
          profile: {
            ...DEFAULT_PROFILE,
            ...parsed.profile,
            theme: 'dark', // Force dark mode
            socials: { ...DEFAULT_PROFILE.socials, ...parsed.profile?.socials },
            goal: { ...DEFAULT_PROFILE.goal, ...parsed.profile?.goal },
            alertSettings: { ...DEFAULT_PROFILE.alertSettings, ...parsed.profile?.alertSettings },
          }
        };
      } catch (e) {
        console.error('Failed to parse state', e);
      }
    }
    return {
      profile: DEFAULT_PROFILE,
      donations: [],
      subscriptions: [],
      subscriptionTiers: DEFAULT_TIERS,
      platformSettings: defaultPlatformSettings
    };
  });

  // Fetch platform settings from Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform_settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as PlatformSettings;
        setState(prev => ({
          ...prev,
          platformSettings: {
            ...prev.platformSettings,
            ...data
          }
        }));
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    localStorage.setItem('donait_state', JSON.stringify(state));
    
    // Sync profile to server for OBS and Firestore
    if (state.profile.username) {
      // Server sync (legacy)
      fetch(`/api/state/${state.profile.username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.profile)
      }).catch(console.error);

      // Firestore sync (new)
      setDoc(doc(db, 'profiles', state.profile.username), state.profile, { merge: true })
        .catch(err => console.error('Firestore profile sync failed', err));
    }
  }, [state]);

  const addDonation = (donationData: Omit<Donation, 'id' | 'timestamp'>) => {
    const receiver = donationData.receiver || state.profile.username;
    
    // Fetch fee from Firestore
    getDoc(doc(db, 'platform_settings', 'global')).then(settingsSnap => {
      const feePercentage = settingsSnap.exists() ? settingsSnap.data().feePercentage : 10;
      const netAmount = donationData.amount * (1 - feePercentage / 100);

      fetch('/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...donationData, receiver })
      })
      .then(res => res.json())
      .then(newDonation => {
        setState(prev => ({
          ...prev,
          donations: [newDonation, ...prev.donations],
          profile: {
            ...prev.profile,
            balance: prev.profile.balance + netAmount,
            totalEarnings: prev.profile.totalEarnings + netAmount,
            goal: {
              ...prev.profile.goal,
              currentAmount: prev.profile.goal.currentAmount + newDonation.amount // Goal usually shows gross
            }
          }
        }));

        // Sync to global donations for Admin (Server handles alerts)
        addDoc(collection(db, 'all_donations'), {
          ...newDonation,
          receiver,
          platformFee: donationData.amount * (feePercentage / 100),
          netAmount: netAmount,
          timestamp: Date.now()
        }).catch(err => console.error('Firestore global donation sync failed', err));
      })
      .catch(console.error);
    });
  };

  const addSubscription = (subData: Omit<Subscription, 'id' | 'startDate' | 'status'>) => {
    const tier = state.subscriptionTiers.find(t => t.id === subData.tierId);
    if (!tier) return;

    const newSub: Subscription = {
      ...subData,
      id: Math.random().toString(36).substring(7),
      startDate: Date.now(),
      status: 'active',
    };

    // Fetch fee from Firestore
    getDoc(doc(db, 'platform_settings', 'global')).then(settingsSnap => {
      const feePercentage = settingsSnap.exists() ? settingsSnap.data().feePercentage : 10;
      const netAmount = tier.price * (1 - feePercentage / 100);

      setState(prev => ({
        ...prev,
        subscriptions: [newSub, ...prev.subscriptions],
        profile: {
          ...prev.profile,
          balance: prev.profile.balance + netAmount,
          totalEarnings: prev.profile.totalEarnings + netAmount,
        }
      }));

      // Notify server for real-time alerts (Server handles Firestore alerts)
      fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: state.profile.username, 
          subscription: { ...newSub, tierName: tier.name, price: tier.price } 
        })
      }).catch(console.error);
    });
  };

  const updateProfile = (profileData: Partial<StreamerProfile>) => {
    const newProfile = { ...state.profile, ...profileData, theme: 'dark' };
    setState(prev => ({
      ...prev,
      profile: newProfile
    }));

    // Sync to Firestore using username as ID
    if (newProfile.username) {
      setDoc(doc(db, 'profiles', newProfile.username), newProfile, { merge: true })
        .catch(err => console.error('Firestore profile sync failed', err));
    }
  };

  const updateSubscriptionTiers = (tiers: SubscriptionTier[]) => {
    setState(prev => ({
      ...prev,
      subscriptionTiers: tiers
    }));
  };

  const updatePlatformSettings = (settings: Partial<PlatformSettings>) => {
    setState(prev => ({
      ...prev,
      platformSettings: { ...prev.platformSettings, ...settings }
    }));
    // Sync to Firestore
    setDoc(doc(db, 'platform_settings', 'global'), settings, { merge: true })
      .catch(err => console.error('Firestore platform settings sync failed', err));
  };

  const resetData = () => {
    setState({
      profile: DEFAULT_PROFILE,
      donations: [],
      subscriptions: [],
      subscriptionTiers: DEFAULT_TIERS,
      platformSettings: {
        feePercentage: 10,
        minWithdrawal: 20,
        maintenanceMode: false,
        logoUrl: PLATFORM_LOGO
      }
    });
  };

  return (
    <AppContext.Provider value={{ state, addDonation, addSubscription, updateProfile, updateSubscriptionTiers, updatePlatformSettings, resetData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
