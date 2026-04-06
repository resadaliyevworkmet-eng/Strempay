import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../AppContext';
import { motion } from 'motion/react';
import { StreamerProfile } from '../types';

export default function GoalOverlay() {
  const { username } = useParams<{ username: string }>();
  const { state } = useApp();
  const [goalProfile, setGoalProfile] = useState<StreamerProfile>(state.profile);

  useEffect(() => {
    // Initial fetch
    if (username) {
      fetch(`/api/state/${username}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile) setGoalProfile(data.profile);
        })
        .catch(console.error);
    }

    // Listen for real-time events
    const connectSSE = () => {
      const eventSource = new EventSource('/api/events');
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.username === username) {
          if (data.type === 'new-donation') {
            setGoalProfile(prev => ({
              ...prev,
              goal: {
                ...prev.goal,
                currentAmount: prev.goal.currentAmount + data.donation.amount
              }
            }));
          } else if (data.type === 'profile-update') {
            setGoalProfile(data.profile);
          }
        }
      };

      eventSource.onerror = (err) => {
        console.error("SSE connection error, retrying...", err);
        eventSource.close();
        setTimeout(connectSSE, 3000); // Retry after 3 seconds
      };

      return eventSource;
    };

    const es = connectSSE();

    return () => es.close();
  }, [username]);

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
