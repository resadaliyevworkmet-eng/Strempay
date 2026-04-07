import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { StreamerProfile } from '../types';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function GoalOverlay() {
  const { username } = useParams<{ username: string }>();
  const [goalProfile, setGoalProfile] = useState<StreamerProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Listen to profile changes in Firestore
    const unsub = onSnapshot(doc(db, 'profiles', username), (docSnap) => {
      if (docSnap.exists()) {
        setGoalProfile(docSnap.data() as StreamerProfile);
        setIsReady(true);
      }
    }, (err) => console.error('Firestore goal listen failed', err));

    return () => unsub();
  }, [username]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black/50 text-white font-bold">
        Yüklənir...
      </div>
    );
  }

  if (!goalProfile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-500/20 text-red-500 font-bold p-10 text-center">
        Profil tapılmadı. Zəhmət olmasa istifadəçi adını yoxlayın.
      </div>
    );
  }

  const { goal } = goalProfile;

  if (!goal.enabled) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-amber-500/10 text-amber-500 font-bold p-10 text-center">
        Hədəf barı aktiv deyil. Ayarlardan aktivləşdirin.
      </div>
    );
  }

  const percentage = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

  return (
    <div className="w-screen h-screen flex items-center justify-center p-10 bg-transparent overflow-hidden pointer-events-none">
      <div className="w-full max-w-3xl space-y-6">
        <div 
          className="w-full rounded-full overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.3)] border-4 border-white/20 backdrop-blur-sm"
          style={{ height: goal.barThickness, backgroundColor: goal.barBgColor }}
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-full flex items-center justify-center relative"
            style={{ backgroundColor: goal.barColor }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10" />
            <motion.div 
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
            />
            <span 
              className="text-2xl font-black whitespace-nowrap px-8 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10"
              style={{ color: goal.fontColor, fontFamily: goal.fontFamily }}
            >
              {goal.currentAmount} ₼ ({Math.round(percentage)}%)
            </span>
          </motion.div>
          
          <div className="absolute inset-0 flex items-center justify-between px-8 pointer-events-none">
            <span className="text-xs font-black text-white/40 tracking-widest uppercase">0 ₼</span>
            <span className="text-xs font-black text-white/40 tracking-widest uppercase">{goal.targetAmount} ₼</span>
          </div>
        </div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-4xl font-black drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] tracking-tight uppercase"
          style={{ color: goal.fontColor, fontFamily: goal.fontFamily }}
        >
          {goal.title}
        </motion.h2>
      </div>
    </div>
  );
}
