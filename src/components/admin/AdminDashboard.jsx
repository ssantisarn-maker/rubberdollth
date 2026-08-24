import React, { useState, useEffect } from 'react';
import { Package, Tag, Settings, Globe, LogOut, ShieldCheck, Database, RefreshCw, Star, HelpCircle, Sliders } from 'lucide-react';
import ProductManager from './ProductManager';
import CategoryManager from './CategoryManager';
import ReviewManager from './ReviewManager';
import SiteSettingsManager from './SiteSettingsManager';
import FaqManager from './FaqManager';
import AdminLogin from './AdminLogin';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { useLiveReviews } from '../../hooks/useLiveReviews';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSiteFaqs } from '../../hooks/useSiteFaqs';

export default function AdminDashboard({ onBackToShop }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'reviews' | 'settings' | 'faqs' | 'categories'
  
  const { products, setProducts, reload: reloadProducts, loading: prodLoading } = useLiveProducts();
  const { reviews, setReviews, reload: reloadReviews, loading: revLoading } = useLiveReviews();
  const { settings, setSettings, reload: reloadSettings, loading: setLoading } = useSiteSettings();
  const { faqs, setFaqs, reload: reloadFaqs, loading: faqLoading } = useSiteFaqs();

  const [categories, setCategories] = useState([
    { id: 'all', label_th: 'สินค้าทั้งหมด', label_en: 'All Masterpieces' },
    { id: 'ready', label_th: 'สินค้าพร้อมส่ง (ไทย)', label_en: 'Ready to Ship (TH)' },
    { id: 'toys', label_th: 'ของเล่นสำหรับผู้ใหญ่', label_en: 'Adult Toys' },
    { id: 'anime', label_th: 'ตุ๊กตาซิลิโคน สาวสวยและอนิเมะ การ์ตูน', label_en: 'Anime & Fantasy' },
    { id: 'western', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวฝรั่ง / ยุโรป', label_en: 'Western / European' },
    { id: 'asian', label_th: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย', label_en: 'Asian Aesthetics' },
    { id: 'torso', label_th: 'ตุ๊กตายางครึ่งตัว TORSO', label_en: 'Torso & Half Body' },
    { id: 'reviews', label_th: 'รีวิวตุ๊กตายางจากลูกค้า', label_en: 'Customer Reviews' },
  ]);

  useEffect(() => {
    const token = localStorage.getItem('rbd_admin_token');
    if (token) {
      setAuthenticated(true);
    }

    fetch('/api/categories.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('rbd_admin_token');
    localStorage.removeItem('rbd_admin_user');
    fetch('/api/auth.php?action=logout').catch(() => {});
    setAuthenticated(false);
  };

  const handleRefreshAll = () => {
    reloadProducts();
    reloadReviews();
    reloadSettings();
    reloadFaqs();
  };

  if (!authenticated) {
    return <AdminLogin onLoginSuccess={() => setAuthenticated(true)} onBackToShop={onBackToShop} />;
  }

  const isLoading = prodLoading || revLoading || setLoading || faqLoading;

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col selection:bg-bronze selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-white border-b border-sand-300 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-ink text-white rounded-xl flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
              RBD
            </div>
            <div>
              <h1 className="text-sm font-bold text-ink leading-tight">RUBBER DOLL THAILAND</h1>
              <span className="text-[10px] text-bronze font-semibold">ระบบจัดการหลังบ้าน (Full-Site Admin CMS)</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleRefreshAll}
              disabled={isLoading}
              className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-sand-100 transition-colors"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onBackToShop}
              className="px-3.5 py-1.5 rounded-xl border border-sand-300 text-ink-soft hover:text-ink hover:bg-sand-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-bronze" />
              <span className="hidden sm:inline">ดูหน้าร้านค้าจริง</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          </div>

        </div>
      </header>

      {/* Subheader Navigation Tabs */}
      <div className="bg-white border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 sm:gap-4 overflow-x-auto scrollbar-none py-2">
          
          {/* Tab 1: Products */}
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'products'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            }`}
          >
            <Package className="w-4 h-4 text-bronze" />
            <span>จัดการสินค้า ({products.length})</span>
          </button>

          {/* Tab 2: Reviews */}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>จัดการรีวิวลูกค้า ({reviews.length})</span>
          </button>

          {/* Tab 3: Site Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            }`}
          >
            <Sliders className="w-4 h-4 text-bronze" />
            <span>ตั้งค่าเว็บไซต์ & ข้อมูลติดต่อ</span>
          </button>

          {/* Tab 4: FAQs */}
          <button
            onClick={() => setActiveTab('faqs')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'faqs'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-600" />
            <span>คำถามที่พบบ่อย ({faqs.length})</span>
          </button>

          {/* Tab 5: Categories */}
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'categories'
                ? 'bg-ink text-white shadow-sm'
                : 'text-ink-soft hover:bg-sand-100 hover:text-ink'
            }`}
          >
            <Tag className="w-4 h-4 text-bronze" />
            <span>จัดการหมวดหมู่ ({categories.length})</span>
          </button>

          {/* Database installer link */}
          <a
            href="/api/init_db.php"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-ink-muted hover:text-ink hover:bg-sand-100 flex items-center gap-2 transition-all whitespace-nowrap"
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>ตัวติดตั้ง MySQL (Init DB) ↗</span>
          </a>

        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'products' && (
          <ProductManager
            products={products}
            categories={categories}
            onUpdateProducts={setProducts}
          />
        )}

        {activeTab === 'reviews' && (
          <ReviewManager
            reviews={reviews}
            onUpdateReviews={setReviews}
          />
        )}

        {activeTab === 'settings' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
          />
        )}

        {activeTab === 'faqs' && (
          <FaqManager
            faqs={faqs}
            onUpdateFaqs={setFaqs}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            products={products}
            onUpdateCategories={setCategories}
          />
        )}
      </main>

    </div>
  );
}
