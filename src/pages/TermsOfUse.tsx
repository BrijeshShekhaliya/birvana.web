import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';

export const TermsOfUse: React.FC = () => {

  return (
    <div className="w-full min-h-screen bg-brand-bg text-brand-textPrimary flex flex-col selection:bg-brand-primary/30">
      <Navigation />
      
      <main className="flex-1 pt-32 pb-16 px-6 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-black font-sans mb-8 tracking-tight">Terms of Use</h1>
        
        <div className="space-y-8 font-sans text-brand-textSecondary leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using the Birvana application or website (the "Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p>
              Birvana is a media player and audio discovery client. The Service operates strictly as an aggregator and player for public royalty-free music, allowing users to browse, search, and stream from a curated index of free-to-use audio tracks.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
            <p>
              You agree to use the Service only for personal, non-commercial purposes. You are solely responsible for ensuring that you have the legal right to access any local media files you play through the Service. You agree not to use the Service to infringe upon the intellectual property rights of others.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Account Registration & Data Ownership</h2>
            <p>
              To use personalization features (such as saving favorite tracks to your library), you may create an account using your email address. We do not collect any personal data other than your email address. We do not share, sell, or monetize your email address or user-generated preferences. You have the right to permanently delete your account and clear all stored data at any time via your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Disclaimer of Warranties</h2>
            <p>
              The Service is provided on an "AS IS" and "AS AVAILABLE" basis. We make no warranties, expressed or implied, regarding the continuous availability, accuracy, or reliability of the Service or any content accessed through it.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Birvana or its developers be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the Service, including but not limited to data loss or copyright infringement claims directed at the user.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms of Use at any time. Continued use of the Service following any changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
            <p>
              If you have any questions or feedback regarding these Terms of Use, please reach out to us at: <a href="mailto:birvana.official.in@gmail.com" style={{ color: '#4A90E2', textDecoration: 'none' }}><strong>birvana.official.in@gmail.com</strong></a>.
            </p>
          </section>
          
          <p className="pt-8 text-xs text-brand-textMuted uppercase tracking-wider">
            Last Updated: July 2026
          </p>
        </div>
      </motion.div>
      </main>

      <Footer />
    </div>
  );
};
