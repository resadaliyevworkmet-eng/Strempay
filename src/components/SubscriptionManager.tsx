import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Plus, X, Star, ShieldCheck, Zap, Palette, Save } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

export default function SubscriptionManager() {
  const { state, updateSubscriptionTiers } = useApp();
  const [tiers, setTiers] = useState(state.subscriptionTiers);
  const isDark = state.profile.theme === 'dark';

  const handleSave = () => {
    updateSubscriptionTiers(tiers);
    toast.success('Abunəlik səviyyələri yadda saxlanıldı');
  };

  const addTier = () => {
    const newTier = {
      id: Math.random().toString(36).substring(7),
      name: 'Yeni Səviyyə',
      price: 10,
      benefits: ['Yeni üstünlük'],
      color: '#6366f1',
    };
    setTiers([...tiers, newTier]);
  };

  const removeTier = (id: string) => {
    setTiers(tiers.filter(t => t.id !== id));
  };

  const updateTier = (id: string, updates: any) => {
    setTiers(tiers.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const addBenefit = (tierId: string) => {
    setTiers(tiers.map(t => t.id === tierId ? { ...t, benefits: [...t.benefits, ''] } : t));
  };

  const updateBenefit = (tierId: string, index: number, value: string) => {
    setTiers(tiers.map(t => t.id === tierId ? { 
      ...t, 
      benefits: t.benefits.map((b, i) => i === index ? value : b) 
    } : t));
  };

  const removeBenefit = (tierId: string, index: number) => {
    setTiers(tiers.map(t => t.id === tierId ? { 
      ...t, 
      benefits: t.benefits.filter((_, i) => i !== index) 
    } : t));
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold">Abunəlik Səviyyələri</h2>
          <p className="text-neutral-500 text-sm mt-1">İzləyiciləriniz üçün özəl dəstək paketləri yaradın.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addTier}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500/10 text-indigo-500 rounded-2xl text-sm font-black hover:bg-indigo-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Səviyyə Əlavə Et
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
          >
            <Save size={18} />
            Yadda Saxla
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence>
          {tiers.map((tier) => (
            <motion.div
              key={tier.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "p-8 rounded-[2.5rem] border relative group transition-all duration-500",
                isDark ? "bg-neutral-900/40 border-neutral-800/50 backdrop-blur-xl" : "bg-white border-neutral-200/50 shadow-sm"
              )}
            >
              <button 
                onClick={() => removeTier(tier.id)}
                className="absolute top-6 right-6 p-2 hover:bg-red-500/10 text-neutral-400 hover:text-red-500 rounded-xl transition-all opacity-0 group-hover:opacity-100"
              >
                <X size={18} />
              </button>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: tier.color }}
                  >
                    <Star size={24} fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(tier.id, { name: e.target.value })}
                      className="bg-transparent border-none p-0 text-xl font-display font-bold focus:ring-0 w-full"
                    />
                    <div className="flex items-center gap-1 text-indigo-500 font-black text-sm">
                      <input
                        type="number"
                        value={tier.price}
                        onChange={(e) => updateTier(tier.id, { price: Number(e.target.value) })}
                        className="bg-transparent border-none p-0 w-12 focus:ring-0 text-indigo-500 font-black"
                      />
                      <span>AZN / ay</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Rəng</label>
                  <div className="flex gap-2">
                    {['#cd7f32', '#c0c0c0', '#ffd700', '#6366f1', '#ec4899', '#22c55e'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateTier(tier.id, { color: c })}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 transition-all",
                          tier.color === c ? "border-indigo-500 scale-110" : "border-transparent hover:scale-105"
                        )}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    <input 
                      type="color" 
                      value={tier.color}
                      onChange={(e) => updateTier(tier.id, { color: e.target.value })}
                      className="w-8 h-8 rounded-full border-none p-0 bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400">Üstünlüklər</label>
                    <button 
                      onClick={() => addBenefit(tier.id)}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-indigo-500"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {tier.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2 group/item">
                        <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => updateBenefit(tier.id, idx, e.target.value)}
                          className="bg-transparent border-none p-0 text-xs font-medium focus:ring-0 flex-1"
                          placeholder="Üstünlük yazın..."
                        />
                        <button 
                          onClick={() => removeBenefit(tier.id, idx)}
                          className="opacity-0 group-item-hover:opacity-100 p-1 hover:text-red-500 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
