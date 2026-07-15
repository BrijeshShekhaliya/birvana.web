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
              Welcome to Birvana. This Privacy Policy explains how we collect, use, and safeguard your data when you use the Birvana mobile application (the "App") and our website. We are committed to protecting your privacy. Our core philosophy is that your personal data belongs to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data We Collect and How We Use It</h2>
            <p>
              We value your privacy and aim to collect as little data as possible. **We do not collect any personal data or user data other than your email address.**
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Email Address (Required):</strong> To create an account and access the streaming service, we collect your email address. This is used solely for secure account authentication, user session management, and syncing your saved favorite tracks.</li>
              <li><strong>Saved Favorites:</strong> If you save or unsave tracks from the royalty-free catalog, these choices are synced securely in our database so your saved track library is accessible on your profile.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Data Sharing and Protection</h2>
            <p>
              We prioritize data privacy above all else:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>No Data Selling or Sharing:</strong> We do not sell, trade, rent, or share your email address or user-generated data with third-party advertisers, companies, or analytics providers. We do not use any third-party tracking scripts.</li>
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
              <li><strong>Immediate Purge:</strong> Triggering account deletion instantly and permanently deletes your email, password, active session tokens, and all saved favorites from our live databases. This action is irreversible.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Device Permissions and Data Security</h2>
            <p>
              To provide background audio streaming, offline audio scanning, and convenient media control capabilities, the Birvana App requests the following device permissions. We strictly respect your choices, and you can revoke these permissions at any time through your device system settings:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Audio & Media Files Access (READ_MEDIA_AUDIO / READ_EXTERNAL_STORAGE):</strong> The App requests permission to scan your device's local directories. This is used solely to locate and build an offline media library of your own audio files. None of your local audio tracks, files, folder metadata, or personal media are ever uploaded, transmitted, or shared with our servers or any third parties. All offline playback processing remains strictly local.</li>
              <li><strong>Device Notifications (POST_NOTIFICATIONS):</strong> This permission is requested on Android 13+ devices. It is used exclusively to display the active media playback control panel (play, pause, skip buttons, and track title) in your notification drawer and lock screen. We do not use this permission for marketing, spam, or promotional push alerts.</li>
              <li><strong>Foreground Service (FOREGROUND_SERVICE):</strong> This permission allows our background audio player engine to run smoothly without interruption. This ensures that your audio stream continues playing when the screen is turned off or while you are multitasking in other applications.</li>
              <li><strong>Network & Internet Access (INTERNET):</strong> Required to establish connection to our web services and stream licensed, public domain, and royalty-free music from our catalog servers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Royalty-Free Music Catalog and Copyright</h2>
            <p>
              All online streaming contents, catalogues, and audio tracks indexed in our service are limited strictly to public domain assets, Creative Commons licenses, and royalty-free music directories. We comply fully with copyright guidelines and do not publish or distribute proprietary or copyright-restricted commercial music.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies and Storage</h2>
            <p>
              Our website uses secure local browser storage to save basic preferences (such as dark mode settings and active sessions). We do not use cross-site tracking cookies, behavioral tracking scripts, or invasive analytics pixels.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact Us and Data Deletion Requests</h2>
            <p>
              If you have any questions, concerns, or inquiries regarding this Privacy Policy, or if you wish to request manual deletion of your account and all stored synchronization data, please email our support team directly at: <a href="mailto:birvana.official.in@gmail.com" style={{ color: '#4A90E2', textDecoration: 'none' }}><strong>birvana.official.in@gmail.com</strong></a>. We will process all manual deletion requests within 48 hours.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
