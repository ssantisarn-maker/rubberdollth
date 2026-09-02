import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import PromoBanner from './components/home/PromoBanner';
import HeroSection from './components/home/HeroSection';
import SpotlightShowcase from './components/home/SpotlightShowcase';
import ValuePillars from './components/home/ValuePillars';
import ProductCatalog from './components/catalog/ProductCatalog';
import DiscreetGuide from './components/home/DiscreetGuide';
import CareGuide from './components/home/CareGuide';
import ReviewSection from './components/reviews/ReviewSection';
import FaqSection from './components/faq/FaqSection';
import ContactSection from './components/contact/ContactSection';
import Footer from './components/layout/Footer';
import StickyMobileBar from './components/layout/StickyMobileBar';
import AdminDashboard from './components/admin/AdminDashboard';
import { Flame, Check, ArrowUp } from 'lucide-react';
import { translations } from './data/translations';
import { useSiteSettings } from './hooks/useSiteSettings';

export default function App() {
  const { settings } = useSiteSettings();
  const [route, setRoute] = useState(() => {
    return window.location.pathname.startsWith('/admin') || window.location.hash === '#admin' ? 'admin' : 'shop';
  });

  const [activeTab, setActiveTab] = useState('catalog');
  const [isAdultMode, setIsAdultMode] = useState(false);
  const [showAgeModal, setShowAgeModal] = useState(false);
  const [lang, setLang] = useState('th'); // 'th' | 'en'
  const [showBackToTop, setShowBackToTop] = useState(false);

  const t = translations[lang] || translations.th;

  const fontScaleClass = settings?.font_size_scale === 'xlarge'
    ? 'font-scale-xl'
    : settings?.font_size_scale === 'normal'
      ? 'font-scale-normal'
      : 'font-scale-large';

  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith('/admin') || window.location.hash === '#admin') {
        setRoute('admin');
      } else {
        setRoute('shop');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (route === 'shop') {
      document.documentElement.lang = lang;
    }
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lang]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleAdultMode = () => {
    if (!isAdultMode) {
      setShowAgeModal(true);
    } else {
      setIsAdultMode(false);
    }
  };

  const handleConfirmAge = () => {
    setIsAdultMode(true);
    setShowAgeModal(false);
  };

  const handleSetLang = (newLang) => {
    setLang(newLang);
  };

  if (route === 'admin') {
    return (
      <AdminDashboard
        onBackToShop={() => {
          window.history.pushState({}, '', '/');
          setRoute('shop');
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-sand-50 text-ink overflow-x-hidden w-full ${fontScaleClass}`}>
      {/* Top Promotional Bar */}
      <PromoBanner lang={lang} />

      {/* Main Navigation Bar */}
      <Navbar
        onSearchClick={scrollToCatalog}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdultMode={isAdultMode}
        onToggleAdultMode={handleToggleAdultMode}
        lang={lang}
        onSetLang={handleSetLang}
      />

      {/* Main Content Sections */}
      <main className="flex-1 pb-20 sm:pb-0">
        <HeroSection onExploreClick={scrollToCatalog} lang={lang} />
        <SpotlightShowcase lang={lang} />
        <ProductCatalog
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isAdultMode={isAdultMode}
          onToggleAdultMode={handleToggleAdultMode}
          lang={lang}
        />
        <ValuePillars lang={lang} />
        <DiscreetGuide lang={lang} />
        <CareGuide lang={lang} />
        <ReviewSection lang={lang} />
        <FaqSection lang={lang} />
        <ContactSection lang={lang} />
      </main>

      {/* Footer */}
      <Footer lang={lang} onSetLang={handleSetLang} />

      {/* Mobile Sticky Quick Action Bar */}
      <StickyMobileBar
        onSearchClick={scrollToCatalog}
        isAdultMode={isAdultMode}
        onToggleAdultMode={handleToggleAdultMode}
        lang={lang}
        onSetLang={handleSetLang}
      />

      {/* Desktop Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 hidden sm:flex p-3 rounded-full bg-sand-900/90 text-white hover:bg-sand-800 shadow-soft hover:shadow-soft-hover transition-all duration-200 active:scale-95 items-center justify-center border border-sand-700"
          title="กลับขึ้นด้านบน / Back to Top"
        >
          <ArrowUp className="w-5 h-5 text-bronze" />
        </button>
      )}

      {/* Age Verification Modal for 18+ Mode */}
      {showAgeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-modal border border-sand-200 text-center space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <Flame className="w-7 h-7 fill-rose-600" />
            </div>

            <div className="space-y-2">
              <h3 className="font-sans text-xl font-bold text-ink">{t.ageModal.title}</h3>
              <p className="text-xs text-ink-muted leading-relaxed font-light">
                {t.ageModal.desc}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowAgeModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-sand-300 text-xs font-semibold text-ink-soft hover:bg-sand-100 transition-colors"
              >
                {t.ageModal.cancelBtn}
              </button>
              <button
                onClick={handleConfirmAge}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t.ageModal.confirmBtn}</span>
              </button>
            </div>

            <p className="text-[10px] text-ink-muted">
              {t.ageModal.privacyNote}
            </p>

          </div>
        </div>
      )}

    </div>
  );
}
