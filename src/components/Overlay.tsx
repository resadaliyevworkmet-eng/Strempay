import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Donation, Subscription, StreamerProfile } from '../types';
import { useApp } from '../AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Star } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, limit, orderBy } from 'firebase/firestore';

type AlertType = { type: 'donation'; data: Donation } | { type: 'subscription'; data: Subscription & { tierName: string } };

export default function Overlay() {
  const { username } = useParams<{ username: string }>();
  const [overlayProfile, setOverlayProfile] = useState<StreamerProfile | null>(null);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!username) return;

    // Listen to profile changes in Firestore
    const unsubProfile = onSnapshot(doc(db, 'profiles', username), (docSnap) => {
      if (docSnap.exists()) {
        setOverlayProfile(docSnap.data() as StreamerProfile);
        setIsReady(true);
      }
    }, (err) => console.error('Firestore profile listen failed', err));

    const triggerAlert = (newAlert: AlertType, currentProfile: StreamerProfile) => {
      setAlert(newAlert);

      // Sound support
      if (currentProfile.alertSettings.soundUrl) {
        const audio = new Audio(currentProfile.alertSettings.soundUrl);
        audio.volume = currentProfile.alertSettings.soundVolume;
        audio.play().catch(err => console.error('Audio play failed', err));
      }

      // TTS support
      if (currentProfile.alertSettings.ttsEnabled) {
        const text = newAlert.type === 'donation' 
          ? `${newAlert.data.sender} ${newAlert.data.amount} AZN dəstək oldu. Mesaj: ${newAlert.data.message}`
          : `${newAlert.data.subscriberName} ${newAlert.data.tierName} abunəliyi ilə dəstək oldu!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'az-AZ';
        window.speechSynthesis.speak(utterance);
      }

      // Hide alert after duration
      setTimeout(() => {
        setAlert(null);
      }, currentProfile.alertSettings.duration * 1000);
    };

    // Listen for new alerts in Firestore
    // Simplified query to avoid composite index requirement
    const q = query(
      collection(db, 'alerts'),
      where('receiver', '==', username)
    );

    const startTime = Date.now() - 5000; // 5 second buffer
    const unsubAlerts = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        // Only process NEW documents added after the listener started
        if (change.type === 'added') {
          const data = change.doc.data();
          
          // Double check receiver and timestamp to be safe
          if (data.receiver !== username) return;
          if (data.timestamp < startTime) return;
          
          setOverlayProfile(prev => {
            if (!prev) return prev;
            
            // Moderation check for donations
            if (data.type === 'donation') {
              const isModerated = prev.moderationWords?.some(word => 
                data.message?.toLowerCase().includes(word.toLowerCase())
              );
              if (isModerated) return prev;
              
              triggerAlert({ type: 'donation', data: data as Donation }, prev);
            } else if (data.type === 'subscription') {
              triggerAlert({ type: 'subscription', data: data as any }, prev);
            }
            
            return prev;
          });
        }
      });
    }, (err) => console.error('Firestore alerts listen failed', err));

    return () => {
      unsubProfile();
      unsubAlerts();
    };
  }, [username]);

  if (!isReady) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black/50 text-white font-bold">
        Yüklənir...
      </div>
    );
  }

  if (!overlayProfile) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-red-500/20 text-red-500 font-bold p-10 text-center">
        Profil tapılmadı. Zəhmət olmasa istifadəçi adını yoxlayın.
      </div>
    );
  }

  const { alertSettings } = overlayProfile;

  return (
    <div className="w-screen h-screen overflow-hidden pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50, rotate: 5 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="bg-white/95 backdrop-blur-xl border-4 border-indigo-500 rounded-[3.5rem] p-12 shadow-[0_0_50px_rgba(99,102,241,0.3)] flex flex-col items-center text-center max-w-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            
            <motion.div
              animate={{ 
                scale: [1, 1.15, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="mb-8 relative z-10 flex items-center justify-center"
            >
              {alertSettings.imageUrl ? (
                <img 
                  src={alertSettings.imageUrl} 
                  alt="Alert" 
                  className="object-contain drop-shadow-2xl"
                  style={{ width: alertSettings.imageSize, height: alertSettings.imageSize }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div 
                  className="bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40"
                  style={{ width: alertSettings.imageSize, height: alertSettings.imageSize }}
                >
                  {alert.type === 'donation' ? (
                    <Heart size={alertSettings.imageSize * 0.5} fill="currentColor" className="drop-shadow-lg" />
                  ) : (
                    <Star size={alertSettings.imageSize * 0.5} fill="currentColor" className="drop-shadow-lg" />
                  )}
                </div>
              )}
            </motion.div>

            <div className="space-y-2 relative z-10">
              <h2 
                className="tracking-tight font-display"
                style={{ 
                  fontSize: alertSettings.senderFont.size, 
                  color: alertSettings.senderFont.color, 
                  fontWeight: alertSettings.senderFont.style === 'bold' ? '900' : 'normal',
                  fontStyle: alertSettings.senderFont.style === 'italic' ? 'italic' : 'normal',
                  fontFamily: alertSettings.senderFont.family
                }}
              >
                {alert.type === 'donation' ? alert.data.sender : alert.data.subscriberName}
              </h2>
              
              <p 
                className="font-display"
                style={{ 
                  fontSize: alertSettings.amountFont.size, 
                  color: alertSettings.amountFont.color, 
                  fontWeight: alertSettings.amountFont.style === 'bold' ? '900' : 'normal',
                  fontStyle: alertSettings.amountFont.style === 'italic' ? 'italic' : 'normal',
                  fontFamily: alertSettings.amountFont.family
                }}
              >
                {alert.type === 'donation' 
                  ? `${alert.data.amount} AZN dəstək oldu!` 
                  : `${alert.data.tierName} abunəliyi ilə dəstək oldu!`}
              </p>
            </div>

            {alert.type === 'donation' && alert.data.message && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="bg-neutral-900/5 backdrop-blur-sm p-8 rounded-[2.5rem] mt-8 w-full border border-neutral-900/5 relative z-10"
              >
                <p 
                  className="italic leading-relaxed"
                  style={{ 
                    fontSize: alertSettings.messageFont.size, 
                    color: alertSettings.messageFont.color, 
                    fontWeight: alertSettings.messageFont.style === 'bold' ? '900' : 'normal',
                    fontStyle: alertSettings.messageFont.style === 'italic' ? 'italic' : 'normal',
                    fontFamily: alertSettings.messageFont.family
                  }}
                >
                  "{alert.data.message}"
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
