import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { HeroSection } from './sections/HeroSection';
import { ManifestoSection } from './sections/ManifestoSection';
import { FeatureSections } from './sections/FeatureSections';
import { ScreensGallerySection } from './sections/ScreensGallerySection';
import { DownloadSection } from './sections/DownloadSection';
import { Footer } from './components/Footer';
import { DeveloperPage } from './pages/DeveloperPage';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfUse } from './pages/TermsOfUse';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { DeleteAccount } from './pages/DeleteAccount';
import { Admin } from './pages/Admin';
import { AdminUserDetail } from './pages/AdminUserDetail';
import { SupportModal } from './components/SupportModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { updateSEO } from './lib/seo';

// Forces scroll to top instantly on every route change & updates page-specific SEO metadata
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    // Dynamic SEO updating based on current route path
    switch (pathname) {
      case '/':
        updateSEO({
          title: 'Birvana — The Ultimate Premium Free Music App for Android',
          description: 'Download Birvana, the ultimate free music app and premium music streaming application for Android. Enjoy a gorgeous UI, lossless audio, smart discovery, offline library, and unified search completely free.',
          canonicalUrl: 'https://birvana.indevs.in/',
        });
        break;
      case '/login':
        updateSEO({
          title: 'Log In to Birvana — Access Premium Music Streaming',
          description: 'Log in to your Birvana account to access your personalized library, synced favorites, and preferences on the ultimate Android music application.',
          canonicalUrl: 'https://birvana.indevs.in/login',
        });
        break;
      case '/profile':
        updateSEO({
          title: 'My Profile — Birvana Music',
          description: 'Manage your Birvana account settings, check your synchronized favorites, and configure your personalized music preferences.',
          canonicalUrl: 'https://birvana.indevs.in/profile',
        });
        break;
      case '/delete':
        updateSEO({
          title: 'Delete Account | Birvana Music',
          description: 'We are sorry to see you go. Safely delete your Birvana account and erase your synced favorites from our database.',
          canonicalUrl: 'https://birvana.indevs.in/delete',
        });
        break;
      case '/developer':
        updateSEO({
          title: 'Developer Portal | Birvana Music Open Source & Architecture',
          description: 'Explore the high-performance system architecture, streaming pipelines, caching strategies, and technical ecosystem behind Birvana App.',
          canonicalUrl: 'https://birvana.indevs.in/developer',
        });
        break;
      case '/privacy':
        updateSEO({
          title: 'Privacy Policy | Birvana Music App',
          description: 'Read the Birvana Privacy Policy to learn how we protect your information. We do not collect or share personal data other than your email address.',
          canonicalUrl: 'https://birvana.indevs.in/privacy',
        });
        break;
      case '/terms':
        updateSEO({
          title: 'Terms of Use | Birvana Music App',
          description: 'Read the terms of use and service agreements for accessing Birvana music streaming catalog, offline libraries, and platform services.',
          canonicalUrl: 'https://birvana.indevs.in/terms',
        });
        break;
      default:
        break;
    }
  }, [pathname]);
  return null;
}

function LandingPage() {
  return (
    <div className="bg-brand-bg text-brand-textPrimary overflow-x-hidden min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <HeroSection />
        <ManifestoSection />
        <FeatureSections />
        <ScreensGallerySection />
        <DownloadSection />
      </main>
      <Footer />
      <SupportModal />
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/delete"    element={<DeleteAccount />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/privacy"   element={<PrivacyPolicy />} />
        <Route path="/terms"     element={<TermsOfUse />} />
        <Route path="/admin"     element={<Admin />} />
        <Route path="/admin/user/:userId" element={<AdminUserDetail />} />
      </Routes>
      <PrivacyBanner />
    </>
  );
}

export default App;
