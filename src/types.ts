export interface Donation {
  id: string;
  sender: string;
  amount: number;
  message: string;
  timestamp: number;
  receiver?: string;
}

export interface Goal {
  enabled: boolean;
  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: string;
  endDate: string;
  barThickness: number;
  barColor: string;
  barBgColor: string;
  fontFamily: string;
  fontColor: string;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  benefits: string[];
  color: string;
  enabled: boolean;
}

export interface Subscription {
  id: string;
  subscriberName: string;
  tierId: string;
  startDate: number;
  status: 'active' | 'cancelled' | 'expired';
}

export interface AlertSettings {
  duration: number;
  imageSize: number;
  ttsEnabled: boolean;
  soundUrl: string;
  imageUrl?: string; // Added custom image support
  soundVolume: number;
  senderFont: {
    family: string;
    size: number;
    color: string;
    style: string;
  };
  messageFont: {
    family: string;
    size: number;
    color: string;
    style: string;
  };
  amountFont: {
    family: string;
    size: number;
    color: string;
    style: string;
  };
}

export interface StreamerProfile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  balance: number;
  totalEarnings: number;
  obsToken: string;
  statsVisible: boolean;
  minDonation: number;
  maxDonation: number;
  discordWebhook: string;
  moderationWords: string[];
  theme: 'light' | 'dark';
  socials: {
    instagram: string;
    youtube: string;
    tiktok: string;
  };
  subscriptionsEnabled: boolean;
  goal: Goal;
  alertSettings: AlertSettings;
}

export interface DailyStats {
  date: string;
  amount: number;
}

export interface AppState {
  profile: StreamerProfile;
  donations: Donation[];
  subscriptions: Subscription[];
  subscriptionTiers: SubscriptionTier[];
}

export interface PlatformSettings {
  feePercentage: number;
  minWithdrawal: number;
  maintenanceMode: boolean;
}

export interface PlatformStats {
  totalDonations: number;
  totalPlatformProfit: number;
  totalStreamers: number;
  activeUsers24h: number;
}
