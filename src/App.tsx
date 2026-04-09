import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Analytics from './components/Analytics';
import Donations from './components/Donations';
import DonationPage from './components/DonationPage';
import Overlay from './components/Overlay';
import GoalOverlay from './components/GoalOverlay';
import Profile from './components/Profile';
import Settings from './components/Settings';
import StreamSettings from './components/StreamSettings';
import SubscriptionSettings from './components/SubscriptionSettings';
import AdminPanel from './components/AdminPanel';
import About from './components/About';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Home from './components/Home';
import PaymentSuccess from './components/PaymentSuccess.tsx';
import PaymentErr from './components/PaymentErr.tsx';
import { Toaster } from 'react-hot-toast';
import { db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-react';
import MaintenanceMode from './components/MaintenanceMode';

import { PLATFORM_EMAIL } from './constants';

const ADMIN_EMAIL = PLATFORM_EMAIL;

function MaintenanceGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [maintenanceMode, setMaintenanceMode] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, 'platform_settings', 'global'), (doc) => {
      if (doc.exists()) {
        setMaintenanceMode(doc.data().maintenanceMode);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading || !isLoaded) return null;

  const isAdmin = user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  if (maintenanceMode && !isAdmin) {
    return <MaintenanceMode />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProvider>
      <Router>
        <MaintenanceGuard>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              className: 'font-display font-bold text-sm rounded-[1.5rem] bg-neutral-900/80 backdrop-blur-xl border border-white/10 text-white shadow-2xl',
              style: {
                padding: '16px 24px',
              }
            }}
          />
          <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Admin Route */}
          <Route 
            path="/admin" 
            element={
              <>
                <SignedIn>
                  <AdminPanel />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />

          {/* Auth Routes */}
          <Route 
            path="/login" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
                <SignIn routing="path" path="/login" signUpUrl="/signup" />
              </div>
            } 
          />
          <Route 
            path="/signup" 
            element={
              <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4">
                <SignUp routing="path" path="/signup" signInUrl="/login" />
              </div>
            } 
          />

          {/* İdarəetmə paneli Routes - Protected */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn>
                  <Layout><Dashboard /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <>
                <SignedIn>
                  <Layout><Analytics /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/donations" 
            element={
              <>
                <SignedIn>
                  <Layout><Donations /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <>
                <SignedIn>
                  <Layout><Profile /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <>
                <SignedIn>
                  <Layout><Settings /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/stream-settings" 
            element={
              <>
                <SignedIn>
                  <Layout><StreamSettings /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />
          <Route 
            path="/subscriptions" 
            element={
              <>
                <SignedIn>
                  <Layout><SubscriptionSettings /></Layout>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/login" replace />
                </SignedOut>
              </>
            } 
          />

          {/* Public Routes */}
          <Route path="/donate/:username" element={<DonationPage />} />
          <Route path="/overlay/:username" element={<Overlay />} />
          <Route path="/goal/:username" element={<GoalOverlay />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/error" element={<PaymentErr />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </MaintenanceGuard>
      </Router>
    </AppProvider>
  );
}
