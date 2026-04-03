import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, Donation, StreamerProfile, Subscription, SubscriptionTier } from './types';

interface AppContextType {
  state: AppState;
  addDonation: (donation: Omit<Donation, 'id' | 'timestamp'>) => void;
  addSubscription: (subscription: Omit<Subscription, 'id' | 'startDate' | 'status'>) => void;
  updateProfile: (profile: Partial<StreamerProfile>) => void;
  updateSubscriptionTiers: (tiers: SubscriptionTier[]) => void;
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
  theme: 'light',
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
    senderFont: { family: 'Inter', size: 42, color: '#ef4444', style: 'bold' },
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
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('donait_state');
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
          subscriptions: parsed.subscriptions || [],
          subscriptionTiers,
          profile: {
            ...DEFAULT_PROFILE,
            ...parsed.profile,
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
    };
  });

  useEffect(() => {
    localStorage.setItem('donait_state', JSON.stringify(state));
  }, [state]);

  const addDonation = (donationData: Omit<Donation, 'id' | 'timestamp'>) => {
    const newDonation: Donation = {
      ...donationData,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      donations: [newDonation, ...prev.donations],
      profile: {
        ...prev.profile,
        balance: prev.profile.balance + newDonation.amount,
        totalEarnings: prev.profile.totalEarnings + newDonation.amount,
        goal: {
          ...prev.profile.goal,
          currentAmount: prev.profile.goal.currentAmount + newDonation.amount
        }
      }
    }));

    // Trigger a custom event for the OBS overlay
    window.dispatchEvent(new CustomEvent('new-donation', { detail: newDonation }));
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

    setState(prev => ({
      ...prev,
      subscriptions: [newSub, ...prev.subscriptions],
      profile: {
        ...prev.profile,
        balance: prev.profile.balance + tier.price,
        totalEarnings: prev.profile.totalEarnings + tier.price,
      }
    }));

    window.dispatchEvent(new CustomEvent('new-subscription', { detail: { ...newSub, tierName: tier.name } }));
  };

  const updateProfile = (profileData: Partial<StreamerProfile>) => {
    setState(prev => ({
      ...prev,
      profile: { ...prev.profile, ...profileData }
    }));
  };

  const updateSubscriptionTiers = (tiers: SubscriptionTier[]) => {
    setState(prev => ({
      ...prev,
      subscriptionTiers: tiers
    }));
  };

  const resetData = () => {
    setState({
      profile: DEFAULT_PROFILE,
      donations: [],
      subscriptions: [],
      subscriptionTiers: DEFAULT_TIERS,
    });
  };

  return (
    <AppContext.Provider value={{ state, addDonation, addSubscription, updateProfile, updateSubscriptionTiers, resetData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
