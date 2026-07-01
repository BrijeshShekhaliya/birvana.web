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
              Welcome to Birvana. This Privacy Policy explains how we handle data when you use the Birvana application (the "App") and our website. We are committed to protecting your privacy. The core philosophy of Birvana is that your data belongs to you. We built our media player and discovery tool to function with maximum privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Data We Do Not Collect</h2>
            <p>
              Birvana is designed as a standalone media player and audio discovery client. Because of this architecture, we <strong>do not</strong>:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Require you to create a user account.</li>
              <li>Collect, store, or sell your personal identifiable information (PII).</li>
              <li>Track your exact location.</li>
              <li>Monitor your local file system beyond what is strictly necessary to play your selected local media files.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Application Permissions</h2>
            <p>
              To provide you with a high-fidelity audio experience, the Birvana App requires certain permissions on your Android device:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li><strong>Storage/Media Access:</strong> Required to scan, organize, and play the local audio files stored on your device. This data never leaves your device.</li>
              <li><strong>Internet Access:</strong> Required to fetch album artwork, retrieve metadata, and stream public media catalogs in real-time.</li>
              <li><strong>Foreground Service:</strong> Required to keep the audio engine running smoothly in the background while you use other apps or turn off your screen.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Third-Party Services</h2>
            <p>
              The App may interface with third-party APIs strictly to retrieve public media streams, lyrics, and metadata. When the App requests this data, your device communicates directly with these third-party servers. We do not intermediate or log these requests. Please note that these third-party services may log IP addresses as part of their standard server operations, governed by their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Website Cookies</h2>
            <p>
              Our website uses strictly necessary local storage to save your basic preferences (such as dismissing the privacy banner). We do not use cross-site tracking cookies or invasive analytics scripts.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Changes to this Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our App's functionality or app store requirements. We encourage you to review this page periodically. Continued use of the App after changes are posted constitutes your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Contact Us</h2>
            <p>
              If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact the developer via our official GitHub repository.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};
