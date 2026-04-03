import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './AppContext';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
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
import About from './components/About';
import Privacy from './components/Privacy';
import Terms from './components/Terms';
import Home from './components/Home';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AppProvider>
      <Router>
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

          {/* İdarəetmə paneli Routes - Protected */}
          <Route 
            path="/dashboard" 
            element={
              <>
                <SignedIn>
                  <Layout><Dashboard /></Layout>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
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
                  <RedirectToSignIn />
                </SignedOut>
              </>
            } 
          />

          {/* Public Routes */}
          <Route path="/donate/:username" element={<DonationPage />} />
          <Route path="/overlay/:username" element={<Overlay />} />
          <Route path="/goal/:username" element={<GoalOverlay />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
