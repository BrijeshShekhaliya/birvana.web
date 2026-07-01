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
import { PrivacyBanner } from './components/PrivacyBanner';

// Forces scroll to top instantly on every route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
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
      </Routes>
      <PrivacyBanner />
    </>
  );
}

export default App;
