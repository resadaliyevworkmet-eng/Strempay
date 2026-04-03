import React, { useState } from 'react';
import { useApp, DEFAULT_TIERS } from '../AppContext';
import { Plus, Trash2, CheckCircle2, XCircle, DollarSign, List, Palette, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { SubscriptionTier } from '../types';

export default function SubscriptionSettings() {
  const { state, updateSubscriptionTiers, updateProfile } = useApp();
  const isDark = state.profile.theme === 'dark';
  
  // Enforce only the 3 standard tiers
  const standardTierIds = ['1', '2', '3'];
  const [tiers, setTiers] = useState<SubscriptionTier[]>(() => {
    const currentTiers = state.subscriptionTiers;
    // Filter to keep only standard tiers and ensure they exist
    const filtered = currentTiers.filter(t => standardTierIds.includes(t.id));
    return filtered.length > 0 ? filtered : DEFAULT_TIERS;
  });

  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(state.profile.subscriptionsEnabled);

  const handleToggleGlobal = () => {
    const newValue = !subscriptionsEnabled;
    setSubscriptionsEnabled(newValue);
    updateProfile({ subscriptionsEnabled: newValue });
    if (newValue) {
      toast.success('Dəstək sistemi aktiv edildi');
    } else {
      toast.error('Dəstək sistemi deaktiv edildi');
    }
  };

  const handleUpdateTier = (id: string, updates: Partial<SubscriptionTier>) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const handleToggleTier = (id: string) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const handleAddBenefit = (tierId: string) => {
    setTiers(tiers.map(t => {
      if (t.id === tierId) {
        return { ...t, benefits: [...t.benefits, 'Yeni üstünlük'] };
      }
      return t;
    }));
  };

  const handleRemoveBenefit = (tierId: string, index: number) => {
    setTiers(tiers.map(t => {
      if (t.id === tierId) {
        const newBenefits = [...t.benefits];
        newBenefits.splice(index, 1);
        return { ...t, benefits: newBenefits };
      }
      return t;
    }));
  };

  const handleUpdateBenefit = (tierId: string, index: number, value: string) => {
    setTiers(tiers.map(t => {
      if (t.id === tierId) {
        const newBenefits = [...t.benefits];
        newBenefits[index] = value;
        return { ...t, benefits: newBenefits };
      }
      return t;
    }));
  };

  const handleSave = () => {
    updateSubscriptionTiers(tiers);
    toast.success('Dəstək səviyyələri yadda saxlanıldı');
  };

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-500">
            Dəstək Səviyyələri
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">İzləyiciləriniz üçün müxtəlif dəstək paketləri yaradın.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className={cn(
            "flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all",
            isDark ? "bg-neutral-900/40 border-neutral-800/50" : "bg-white border-neutral-200/50 shadow-sm"
          )}>
            <span className="text-xs font-black uppercase tracking-widest text-neutral-500">Sistemi Aktiv Et</span>
            <button
              onClick={handleToggleGlobal}
              className={cn(
                "relative w-14 h-8 rounded-full transition-all duration-300",
                subscriptionsEnabled ? "bg-emerald-500 shadow-lg shadow-emerald-500/20" : "bg-neutral-300 dark:bg-neutral-700"
              )}
            >
              <div className={cn(
                "absolute top-1 w-6 h-6 bg-white rounded-full transition-all duration-300 shadow-md",
                subscriptionsEnabled ? "left-7" : "left-1"
              )} />
            </button>
          </div>
          <button
            onClick={handleSave}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-xl shadow-indigo-500/20 active:scale-95"
          >
            <Save size={20} />
            Yadda Saxla
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!subscriptionsEnabled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "p-20 rounded-[3rem] border border-dashed text-center space-y-6",
              isDark ? "bg-neutral-900/20 border-neutral-800" : "bg-neutral-50 border-neutral-200"
            )}
          >
            <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-8">
              <XCircle className="text-neutral-300 dark:text-neutral-600" size={48} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold">Dəstək Sistemi Deaktivdir</h2>
              <p className="text-neutral-500 font-medium max-w-md mx-auto">
                Dəstək səviyyələrini idarə etmək və izləyicilərinizə göstərmək üçün yuxarıdakı düymə ilə sistemi aktiv edin.
              </p>
            </div>
            <button
              onClick={handleToggleGlobal}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
            >
              İndi Aktiv Et
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 xl:grid-cols-2 gap-8"
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={cn(
                  "p-8 rounded-[2.5rem] border shadow-sm transition-all duration-500 relative overflow-hidden group",
                  isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50",
                  !tier.enabled && "opacity-60 grayscale-[0.5]"
                )}
              >
                <div className="absolute top-0 right-0 p-6 flex gap-2">
                  <button
                    onClick={() => handleToggleTier(tier.id)}
                    className={cn(
                      "p-3 rounded-xl transition-all hover:scale-110 active:scale-95",
                      tier.enabled 
                        ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white" 
                        : "bg-neutral-500/10 text-neutral-500 hover:bg-neutral-500 hover:text-white"
                    )}
                    title={tier.enabled ? "Deaktiv et" : "Aktiv et"}
                  >
                    {tier.enabled ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Səviyyə Adı</label>
                      <input
                        type="text"
                        readOnly
                        value={tier.name}
                        className={cn(
                          "w-full px-6 py-4 border rounded-2xl outline-none transition-all font-bold opacity-70 cursor-not-allowed",
                          isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Qiymət (AZN)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={tier.price}
                          onChange={(e) => handleUpdateTier(tier.id, { price: parseFloat(e.target.value) || 0 })}
                          className={cn(
                            "w-full px-6 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black pl-12",
                            isDark ? "bg-neutral-800/50 border-neutral-700 text-white" : "bg-neutral-50 border-neutral-200 text-neutral-900"
                          )}
                        />
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" size={20} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Rəng (Sabit)</label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full border-4 border-white dark:border-neutral-700 shadow-lg"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="text-xs font-bold text-neutral-500 uppercase">{tier.color === '#cd7f32' ? 'Bürünc' : tier.color === '#c0c0c0' ? 'Gümüşü' : 'Qızılı'}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Üstünlüklər</label>
                      <button
                        onClick={() => handleAddBenefit(tier.id)}
                        className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                      >
                        + Əlavə Et
                      </button>
                    </div>
                    <div className="space-y-3">
                      {tier.benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-3">
                          <div className={cn(
                            "flex-1 flex items-center gap-3 px-6 py-3 border rounded-xl",
                            isDark ? "bg-neutral-800/30 border-neutral-700" : "bg-neutral-50 border-neutral-100"
                          )}>
                            <List size={16} className="text-neutral-500" />
                            <input
                              type="text"
                              value={benefit}
                              onChange={(e) => handleUpdateBenefit(tier.id, index, e.target.value)}
                              className="bg-transparent border-none outline-none w-full font-medium text-sm"
                            />
                          </div>
                          <button
                            onClick={() => handleRemoveBenefit(tier.id, index)}
                            className="p-3 text-neutral-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
