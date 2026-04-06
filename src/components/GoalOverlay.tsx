import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { StreamerProfile } from '../types';

export default function GoalOverlay() {
  const { username } = useParams<{ username: string }>();
  const [goalProfile, setGoalProfile] = useState<StreamerProfile | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Initial fetch
    const fetchProfile = async () => {
      try {
        const res = await fetch(`/api/state/${username}`);
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            setGoalProfile(data.profile);
            setIsReady(true);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };

    fetchProfile();

    // Listen for real-time events
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      if (eventSource) eventSource.close();
      
      eventSource = new EventSource('/api/events');
      
      eventSource.onmessage = (event) => {
        if (event.data === ': heartbeat') return;
        
        try {
          const data = JSON.parse(event.data);
          if (data.username === username) {
            if (data.type === 'new-donation') {
              setGoalProfile(prev => {
                if (!prev) return prev;
                return {
                  ...prev,
                  goal: {
                    ...prev.goal,
                    currentAmount: prev.goal.currentAmount + data.donation.amount
                  }
                };
              });
            } else if (data.type === 'new-subscription') {
              // Re-fetch to get accurate balance
              fetchProfile();
            } else if (data.type === 'profile-update') {
              setGoalProfile(data.profile);
            }
          }
        } catch (e) {
          console.error("Error parsing SSE data", e);
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error, retrying...", err);
        if (eventSource) eventSource.close();
        setTimeout(connectSSE, 3000);
      };
    };

    connectSSE();

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [username]);

  if (!isReady || !goalProfile) return null;

  const { goal } = goalProfile;

  if (!goal.enabled) return null;

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
