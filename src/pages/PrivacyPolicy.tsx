import React, { useEffect } from 'react';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

export const PrivacyPolicy: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-brand-bg text-brand-textPrimary min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 py-32 px-6 md:px-12 max-w-4xl mx-auto w-full">
        <h1 className="font-sans font-black text-4xl md:text-5xl text-white mb-4">Privacy Policy</h1>
        <p className="font-mono text-xs text-brand-textMuted uppercase tracking-widest mb-12">Last Updated: July 2026</p>
        
        <div className="space-y-8 font-sans text-brand-textSecondary leading-relaxed text-sm md:text-base">
          
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Introduction</h2>
            <p>
              Welcome to Birvana. This Privacy Policy explains how we collect, use, and safeguard your data when you use the Birvana mobile application (the "App") and our website. We are committed to protecting your privacy. Our core philosophy is that your personal data belongs to you, and we design our media features with maximum privacy and security in mind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data We Collect and How We Use It</h2>
            <p>
              Birvana operates primarily as a local media player. However, to enable personalized features, we collect the following limited information:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Account Credentials (Optional):</strong> If you choose to sign up or create an account, we collect your email address and authentication credentials. This is used solely to authenticate your session, save your custom playlists, and sync your app preferences.</li>
              <li><strong>User Content:</strong> Any playlists, favorites, or settings you create within the App are stored securely in our database to sync across your devices.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing and Protection</h2>
            <p>
              We prioritize data privacy above all else:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>No Data Selling or Sharing:</strong> We do not sell, trade, rent, or share your email address, personal information, or user content with third-party advertisers, companies, or analytics providers.</li>
              <li><strong>Secure Transmission:</strong> All communications between the App, the website, and our database are encrypted in transit using industry-standard Secure Socket Layer (SSL/HTTPS) technology.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. User Rights and Data Deletion</h2>
            <p>
              You maintain complete ownership of your account and personal data. You have the right to request deletion of your account and all associated data at any time:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Account Deletion:</strong> You can permanently delete your account and clear all stored data by navigating to the "Danger Zone" in your Profile settings on either the mobile app or the website.</li>
              <li><strong>Immediate Purge:</strong> Triggering account deletion instantly and permanently deletes your email, password, active session tokens, and all user content (playlists, favorites, history) from our live databases. This action is irreversible.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Application Permissions</h2>
            <p>
              To provide a premium audio experience, the Birvana App requires certain runtime permissions on your mobile device:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Media Access:</strong> Required to scan, display, and play local audio files stored on your device. This content remains completely local and is never uploaded.</li>
              <li><strong>Internet Access:</strong> Required to fetch album artwork, stream metadata, and connect to public royalty-free audio catalogs.</li>
              <li><strong>Foreground Service & Notifications:</strong> Required to support background audio playback and control widgets while using other apps or when the screen is locked.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Cookies and Storage</h2>
            <p>
              Our website uses secure local browser storage to save basic preferences (such as dark mode settings and active sessions). We do not use cross-site tracking cookies, behavioral tracking scripts, or invasive analytics pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>
              If you have any questions, concerns, or inquiries regarding this Privacy Policy or our data deletion processes, please contact the developer via our official email: <strong>brijeshpatel48562@gmail.com</strong>.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
