import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../AppContext';
import { Heart, Send, CheckCircle2, Instagram, Youtube, Music2, Trophy, Star, ShieldCheck, Zap, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

export default function DonationPage() {
  const { username } = useParams<{ username: string }>();
  const { state, addDonation, addSubscription } = useApp();
  const [profile, setProfile] = useState(state.profile);
  const [donations, setDonations] = useState(state.donations);
  const isDark = profile.theme === 'dark';
  const [sender, setSender] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [successType, setSuccessType] = useState<'donation' | 'subscription'>('donation');

  useEffect(() => {
    if (username) {
      fetch(`/api/state/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) setProfile(data.profile);
          if (data.donations) setDonations(data.donations);
        })
        .catch(console.error);
    }
  }, [username]);

  const leaderboard = useMemo(() => {
    const totals: Record<string, number> = {};
    donations.forEach(d => {
      totals[d.sender] = (totals[d.sender] || 0) + d.amount;
    });

    return Object.entries(totals)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
  }, [donations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donationAmount = parseFloat(amount);
    if (!sender || !amount || !message) return;
    if (donationAmount < profile.minDonation || donationAmount > profile.maxDonation) {
      alert(`Məbləğ ${profile.minDonation} və ${profile.maxDonation} AZN arasında olmalıdır.`);
      return;
    }

    addDonation({
      sender,
      amount: donationAmount,
      message,
      receiver: username || ''
    });

    setSuccessType('donation');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);

    setSender('');
    setAmount('');
    setMessage('');
  };

  const handleSubscribe = (tierId: string) => {
    if (!sender) {
      toast.error('Zəhmət olmasa adınızı daxil edin');
      return;
    }

    addSubscription({
      subscriberName: sender,
      tierId,
    });

    setSuccessType('subscription');
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
    setSender('');
  };

  const mockStreamers = [
    { name: "SuperStreamer", viewers: "1.2k", avatar: "https://picsum.photos/seed/s1/100/100", color: "from-indigo-500 to-purple-500" },
    { name: "GameMaster", viewers: "850", avatar: "https://picsum.photos/seed/s2/100/100", color: "from-emerald-500 to-teal-500" },
    { name: "TechGuru", viewers: "2.4k", avatar: "https://picsum.photos/seed/s3/100/100", color: "from-rose-500 to-orange-500" }
  ];

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-6 font-sans transition-colors duration-500 relative overflow-hidden",
      isDark ? "bg-neutral-950 text-white" : "bg-neutral-50 text-neutral-900"
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, -90, 0],
            x: [0, -100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] bg-purple-500/10 rounded-full blur-[120px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Popular Streamers */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-display font-black tracking-tight text-neutral-900 dark:text-white">Populyar Strimerlər</h2>
                <p className={cn("text-sm font-medium", isDark ? "text-neutral-600" : "text-neutral-500")}>
                  Ən çox izlənilən və dəstəklənən yayınçılarımız.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {mockStreamers.map((s, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ x: 10 }}
                    className={cn(
                      "p-5 rounded-3xl border flex items-center gap-4 transition-all",
                      isDark ? "bg-neutral-900/50 border-neutral-800" : "bg-white border-neutral-100 shadow-sm"
                    )}
                  >
                    <div className={cn("w-14 h-14 rounded-full bg-gradient-to-br p-0.5", s.color)}>
                      <img src={s.avatar || null} alt={s.name} className="w-full h-full rounded-full border-4 border-white dark:border-neutral-900 object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black">{s.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-indigo-500">{s.viewers} izləyici</span>
                      </div>
                    </div>
                    <Link 
                      to={`/donate/${s.name.toLowerCase()}`}
                      className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all"
                    >
                      <Send size={18} />
                    </Link>
                  </motion.div>
                ))}
              </div>

              {leaderboard.length > 0 && (
                <div className={cn(
                  "p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group",
                  isDark ? "bg-amber-500/5 border-amber-500/10" : "bg-amber-50/50 border-amber-100"
                )}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-700" />
                  <h3 className={cn("text-xs font-black uppercase tracking-[0.2em] mb-6 flex items-center gap-3", isDark ? "text-amber-400" : "text-amber-600")}>
                    <Trophy size={18} className="animate-bounce" />
                    Top Dəstəkçilər
                  </h3>
                  <div className="space-y-5">
                    {leaderboard.map((entry, i) => (
                      <div key={entry.name} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black",
                            i === 0 ? "bg-amber-400 text-amber-900" : 
                            i === 1 ? "bg-neutral-300 text-neutral-700" : 
                            "bg-orange-400 text-orange-900"
                          )}>
                            {i + 1}
                          </span>
                          <span className={cn("font-bold", isDark ? "text-neutral-300" : "text-neutral-700")}>{entry.name}</span>
                        </div>
                        <span className={cn("font-black", isDark ? "text-amber-400" : "text-amber-700")}>{entry.amount} ₼</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column: Donation Form */}
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className={cn(
                "w-full rounded-[3.5rem] shadow-2xl overflow-hidden border backdrop-blur-2xl relative",
                isDark ? "bg-neutral-900/60 border-neutral-800/50 shadow-black/40" : "bg-white/80 border-neutral-200/50 shadow-indigo-200/30"
              )}
            >
              <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse" />
                
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 inline-block"
                >
                  <img
                    src={profile.avatarUrl || null}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-white/30 mx-auto mb-4 shadow-2xl relative z-10 object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute bottom-4 right-0 w-8 h-8 bg-emerald-500 border-4 border-indigo-700 rounded-full z-20" />
                </motion.div>
                
                <h1 className="text-3xl font-display font-black tracking-tight relative z-10 text-white">{profile.displayName}</h1>
                <p className="text-indigo-100/90 text-base mt-2 relative z-10 font-medium max-w-md mx-auto leading-relaxed">{profile.bio}</p>
                
                <div className="flex items-center justify-center gap-4 mt-6 relative z-10">
                  {[
                    { icon: Instagram, url: profile.socials.instagram },
                    { icon: Youtube, url: profile.socials.youtube },
                    { icon: Music2, url: profile.socials.tiktok }
                  ].map((social, i) => social.url && (
                    <motion.a 
                      key={i}
                      whileHover={{ y: -5, scale: 1.1 }}
                      href={social.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="p-4 bg-white/15 rounded-2xl hover:bg-white/25 transition-all border border-white/10 backdrop-blur-md"
                    >
                      <social.icon size={24} />
                    </motion.a>
                  ))}
                </div>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="py-20 text-center space-y-8"
                    >
                      <div className={cn("w-32 h-32 rounded-full flex items-center justify-center mx-auto shadow-2xl relative", isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-500")}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", damping: 12 }}
                        >
                          <CheckCircle2 size={72} />
                        </motion.div>
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/30 animate-ping" />
                      </div>
                      <div className="space-y-3">
                        <h2 className={cn("text-4xl font-display font-black", isDark ? "text-white" : "text-neutral-900")}>
                          {successType === 'donation' ? 'Təşəkkürlər!' : 'Təbriklər!'}
                        </h2>
                        <p className="text-xl text-neutral-500 font-medium">
                          {successType === 'donation' 
                            ? 'Dəstəyiniz uğurla göndərildi və ekranda görünəcək.' 
                            : 'Uğurla abunə oldunuz! Dəstəyiniz üçün təşəkkürlər.'}
                        </p>
                      </div>
                      <button 
                        onClick={() => setIsSuccess(false)}
                        className="px-12 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20"
                      >
                        Yeni Dəstək Ol
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onSubmit={handleSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Adınız</label>
                          <input
                            type="text"
                            required
                            value={sender}
                            onChange={(e) => setSender(e.target.value)}
                            placeholder="Məs: Anonim"
                            className={cn(
                              "w-full px-8 py-4 border rounded-[2rem] outline-none transition-all placeholder:text-neutral-500 font-bold text-base",
                              isDark ? "bg-neutral-800/50 border-neutral-700 text-white focus:ring-2 focus:ring-indigo-500" : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Məbləğ (AZN)</label>
                          <div className="relative group">
                            <input
                              type="number"
                              required
                              min={profile.minDonation}
                              max={profile.maxDonation}
                              step="0.1"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder={`${profile.minDonation} - ${profile.maxDonation}`}
                              className={cn(
                                "w-full px-8 py-4 border rounded-[2rem] outline-none transition-all placeholder:text-neutral-500 pl-16 font-black text-2xl",
                                isDark ? "bg-neutral-800/50 border-neutral-700 text-white focus:ring-2 focus:ring-indigo-500" : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                              )}
                            />
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 font-black text-indigo-500 text-2xl">₼</span>
                          </div>
                          <div className="flex justify-between px-2">
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Min: {profile.minDonation} ₼</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter">Max: {profile.maxDonation} ₼</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Mesajınız</label>
                          <textarea
                            required
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Yaradıcıya bir sözünüz var?"
                            rows={5}
                            className={cn(
                              "w-full px-8 py-4 border rounded-[2rem] outline-none transition-all placeholder:text-neutral-500 resize-none font-medium text-base leading-relaxed h-[140px]",
                              isDark ? "bg-neutral-800/50 border-neutral-700 text-white focus:ring-2 focus:ring-indigo-500" : "bg-neutral-50 border-neutral-200 text-neutral-900 focus:ring-2 focus:ring-indigo-500"
                            )}
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <button
                          type="submit"
                          className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-indigo-500/40 group"
                        >
                          Dəstək Ol
                          <Heart size={28} className="group-hover:scale-125 transition-transform" fill="currentColor" />
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              <div className={cn("p-10 border-t text-center relative overflow-hidden", isDark ? "border-neutral-800/50" : "border-neutral-100")}>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500 flex items-center justify-center gap-2">
                  Powered by <span className="text-indigo-500">Birstream</span>
                </p>
              </div>
            </motion.div>

            {/* Subscription Tiers Section */}
            {profile.subscriptionsEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mt-8 space-y-10"
              >
                <div className="text-center space-y-3">
                  <h2 className="text-4xl font-display font-black tracking-tight">Abunə Ol</h2>
                  <p className={cn("text-base font-medium", isDark ? "text-neutral-400" : "text-neutral-500")}>
                    Xüsusi üstünlüklər əldə etmək üçün abunəlik səviyyələrindən birini seçin.
                  </p>
                </div>

                {state.subscriptionTiers.filter(t => t.enabled !== false).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {state.subscriptionTiers.filter(t => t.enabled !== false).map((tier) => (
                      <motion.div
                        key={tier.id}
                        whileHover={{ y: -12, scale: 1.02 }}
                        className={cn(
                          "p-10 rounded-[3rem] border shadow-2xl transition-all relative overflow-hidden flex flex-col h-full",
                          isDark ? "bg-neutral-900/60 border-neutral-800/50" : "bg-white border-neutral-200/50"
                        )}
                      >
                        <div 
                          className="absolute top-0 left-0 w-full h-3" 
                          style={{ backgroundColor: tier.color }}
                        />
                        
                        <div className="mb-8">
                          <h3 className="text-2xl font-display font-black mb-2">{tier.name}</h3>
                          <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-indigo-500">{tier.price} ₼</span>
                            <span className="text-sm font-bold text-neutral-500 uppercase tracking-wider">/ ay</span>
                          </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                          {tier.benefits.map((benefit, i) => (
                            <li key={i} className="flex items-start gap-4 text-base font-medium">
                              <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0" />
                              <span className={isDark ? "text-neutral-200" : "text-neutral-700"}>{benefit}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleSubscribe(tier.id)}
                          className="w-full py-5 rounded-[1.5rem] font-black text-base transition-all active:scale-95 shadow-xl flex items-center justify-center gap-3 group"
                          style={{ 
                            backgroundColor: tier.color + '20', 
                            color: tier.color,
                            border: `2px solid ${tier.color}40`
                          }}
                        >
                          Abunə Ol
                          <Zap size={20} fill="currentColor" className="group-hover:scale-125 transition-transform" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className={cn(
                    "p-12 rounded-[2.5rem] border-2 border-dashed text-center space-y-4",
                    isDark ? "border-neutral-800 bg-neutral-900/30" : "border-neutral-100 bg-neutral-50"
                  )}>
                    <div className="w-16 h-16 rounded-full bg-neutral-500/10 flex items-center justify-center mx-auto">
                      <XCircle className="w-8 h-8 text-neutral-500" />
                    </div>
                    <div className="space-y-1">
                      <h3 className={cn("font-bold", isDark ? "text-neutral-300" : "text-neutral-700")}>Hələ heç bir abunəlik səviyyəsi yoxdur</h3>
                      <p className="text-sm text-neutral-500">Yaxın zamanda yeni abunəlik səviyyələri əlavə olunacaq.</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
