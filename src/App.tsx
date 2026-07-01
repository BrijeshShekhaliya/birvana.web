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
    <div className="bg-brand-bg text-brand-textPrimary overflow-x-hidden min-h-screen">
      <Navigation />
      <main>
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
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/privacy"   element={<PrivacyPolicy />} />
      </Routes>
      <PrivacyBanner />
    </>
  );
}

export default App;
