import React, { useState } from 'react';
import { 
  Package, Tag, MessageSquareQuote, Sliders, Bell, Phone, 
  Sparkles, HelpCircle, Layers, Globe, Lock, Droplets, 
  LogOut, RefreshCw, ChevronRight, Menu, X, Compass, CheckCircle2
} from 'lucide-react';
import ProductManager from './ProductManager';
import ReviewManager from './ReviewManager';
import CategoryManager from './CategoryManager';
import FaqManager from './FaqManager';
import SiteSettingsManager from './SiteSettingsManager';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { useLiveReviews } from '../../hooks/useLiveReviews';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useSiteFaqs } from '../../hooks/useSiteFaqs';
import { useLiveCategories } from '../../hooks/useLiveCategories';

export default function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('products');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { products, setProducts, reload: reloadProducts } = useLiveProducts();
  const { reviews, setReviews, reload: reloadReviews } = useLiveReviews();
  const { settings, setSettings, reload: reloadSettings } = useSiteSettings();
  const { faqs, setFaqs, reload: reloadFaqs } = useSiteFaqs();
  const { categories, setCategories, reload: reloadCategories } = useLiveCategories();

  const handleRefreshAll = async () => {
    await Promise.all([reloadProducts(), reloadReviews(), reloadSettings(), reloadFaqs(), reloadCategories()]);
    alert('รีเฟรชดึงข้อมูลล่าสุดจากเซิร์ฟเวอร์เรียบร้อยแล้ว!');
  };

  // Grouped Sidebar Navigation Menu
  const menuGroups = [
    {
      group: '🛍️ คลังสินค้าและรีวิว',
      items: [
        { id: 'products', label: `จัดการสินค้า (${products.length} รายการ)`, icon: Package, badge: products.length, desc: 'สเปก, ราคา, รูปภาพ, วิดีโอ, จัดเรียง' },
        { id: 'reviews', label: 'จัดการรีวิวจากลูกค้า', icon: MessageSquareQuote, badge: reviews.length, desc: 'รีวิว, ให้ดาว, รูปถ่ายจริง' },
        { id: 'categories', label: 'จัดการหมวดหมู่สินค้า', icon: Tag, desc: 'แถบกรองและหมวดหมู่' },
      ]
    },
    {
      group: '🎨 ปรับแต่งเนื้อหาหน้าเว็บ (Master CMS)',
      items: [
        { id: 'catalog_ui', label: 'หน้าแคตตาล็อก & ป้ายสินค้า', icon: Package, desc: 'หัวข้อแคตตาล็อก, ป้ายพร้อมส่ง, ปุ่มการ์ด' },
        { id: 'nav_footer', label: 'เมนูนำทาง (Navbar) & Footer', icon: Compass, desc: 'ชื่อเมนู, ข้อความค้นหา, ลิขสิทธิ์' },
        { id: 'typography', label: 'ขนาดตัวอักษร & ฟอนต์', icon: Sliders, desc: 'ปรับขนาดตัวอักษรทั้งเว็บ' },
        { id: 'promo', label: 'แถบโปรโมชั่น & ประกาศบนสุด', icon: Bell, desc: 'ป้ายโปรโมชั่น, ส่วนลด, เปิด/ปิดแถบบนสุด' },
        { id: 'discreet', label: 'มาตรฐานการจัดส่งลับเฉพาะ (100%)', icon: Lock, desc: 'การันตีจัดส่งมิดชิด 100%, 3 ขั้นตอน' },
        { id: 'spotlight', label: 'ไฮไลท์สินค้าพร้อมส่ง (Spotlight)', icon: Sparkles, desc: 'กล่องวิดีโอ/รูป/ราคาพร้อมส่ง' },
        { id: 'modal_content', label: 'หัวข้อสเปก & กล่องของขวัญ', icon: Layers, desc: 'ปรับแต่งหัวข้อหน้าต่างสินค้า' },
        { id: 'social_share', label: 'แชร์ลิงก์ & LINE Preview', icon: Globe, desc: 'ข้อความ/รูปตอนส่งลิงก์ให้ลูกค้า' },
        { id: 'hero', label: 'แบนเนอร์หลัก & สินค้า Hero', icon: Sparkles, desc: 'รูปโมเดลเด่น, หัวข้อ, สโลแกน' },
        { id: 'contact', label: 'ข้อมูลติดต่อร้านค้า & อีเมล', icon: Phone, desc: 'Email, LINE, โทรศัพท์, เวลาทำการ' },
        { id: 'reviews_header', label: 'หัวข้อหมวดรีวิวลูกค้า', icon: MessageSquareQuote, desc: 'ปรับแต่งหัวข้อรีวิว, ดาว 5.0' },
        { id: 'values', label: 'The Masterpiece Difference', icon: Sparkles, desc: '4 จุดเด่นและเอกลักษณ์' },
        { id: 'care', label: 'The Longevity Care Guide', icon: Droplets, desc: 'คู่มือการดูแลรักษา 4 ขั้นตอน' },
        { id: 'faqs', label: 'คำถามที่พบบ่อย (FAQs)', icon: HelpCircle, badge: faqs.length, desc: 'คำถาม-คำตอบยอดฮิต' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-sand-100/60 font-sans text-ink flex flex-col lg:flex-row">
      
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-ink text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black tracking-widest text-amber-400 text-sm">RUBBER DOLL</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.5 rounded border border-amber-500/30">CMS</span>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5"
        >
          <span>ดูหน้าเว็บ</span>
          <span>↗</span>
        </a>
      </header>

      {/* Left Sidebar Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-sand-950 text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-sand-800
        lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* Top Brand Identity */}
        <div className="p-5 border-b border-sand-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-ink font-bold font-serif text-base shadow-md">
                R
              </div>
              <div>
                <h2 className="font-serif font-black text-sm tracking-wider text-white">RUBBER DOLL</h2>
                <p className="text-[10px] text-amber-400/90 tracking-widest font-mono font-semibold">ADMIN CONTROL PANEL</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-sand-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-sand-300 hover:text-amber-300 border border-white/10 transition-colors"
          >
            <span>🔗 เปิดดูหน้าเว็บร้านค้าจริง</span>
            <span>↗</span>
          </a>
        </div>

        {/* Navigation Menu List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin scrollbar-thumb-sand-800">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <span className="text-[11px] font-bold text-sand-400 uppercase tracking-wider px-3">
                {group.group}
              </span>

              <div className="space-y-0.5 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-bold transition-all text-left cursor-pointer
                        ${isActive 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-ink shadow-md font-extrabold' 
                          : 'text-sand-300 hover:bg-white/5 hover:text-white'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-ink' : 'text-amber-400/80'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? 'bg-black/20 text-ink' : 'bg-sand-800 text-sand-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Actions & Logout */}
        <div className="p-4 border-t border-sand-800 space-y-2 bg-sand-900/50">
          <button
            onClick={handleRefreshAll}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-sand-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเฟรชข้อมูลล่าสุด</span>
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          )}
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        
        {/* Top Breadcrumb Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-ink-muted">
              <span>ระบบหลังบ้าน</span>
              <ChevronRight className="w-3 h-3" />
              <span className="font-bold text-bronze uppercase">
                {activeTab}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-ink mt-0.5">
              {activeTab === 'products' && `🛍️ จัดการรายการสินค้า (${products.length} โมเดล)`}
              {activeTab === 'reviews' && '⭐ จัดการรีวิวจากลูกค้า'}
              {activeTab === 'categories' && '🏷️ จัดการหมวดหมู่สินค้า'}
              {activeTab === 'catalog_ui' && '📦 ปรับแต่งหน้าแคตตาล็อก & ป้ายการ์ดสินค้า'}
              {activeTab === 'nav_footer' && '🧭 เมนูนำทาง (Navbar) & ส่วนท้ายเว็บ (Footer)'}
              {activeTab === 'typography' && '🔤 ขนาดตัวอักษร & ฟอนต์'}
              {activeTab === 'promo' && '📢 แถบโปรโมชั่น & ประกาศบนสุด'}
              {activeTab === 'spotlight' && '⚡ ไฮไลท์สินค้าพร้อมส่ง (Spotlight)'}
              {activeTab === 'modal_content' && '🔍 หัวข้อสเปก & กล่องของขวัญ'}
              {activeTab === 'social_share' && '🌐 ตั้งค่าการแชร์ลิงก์ & LINE Preview (Social Share / SEO)'}
              {activeTab === 'hero' && '🖼️ แบนเนอร์หลัก & สินค้า Hero หน้าแรก'}
              {activeTab === 'contact' && '📞 ข้อมูลติดต่อร้านค้า & อีเมล'}
              {activeTab === 'reviews_header' && '⭐ ปรับแต่งหัวข้อหมวดรีวิวลูกค้า'}
              {activeTab === 'values' && '💎 จุดเด่น (The Masterpiece Difference)'}
              {activeTab === 'discreet' && '📦 การจัดส่งลับเฉพาะ 100% (Discreet Delivery)'}
              {activeTab === 'care' && '🧼 คู่มือการดูแลรักษาซิลิโคน (The Longevity Care)'}
              {activeTab === 'faqs' && '❓ คำถามที่พบบ่อย (FAQ Manager)'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>เชื่อมต่อฐานข้อมูล MySQL สด</span>
            </span>
          </div>
        </div>

        {/* Tab Content Panels */}
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

        {activeTab === 'categories' && (
          <CategoryManager
            categories={categories}
            products={products}
            onUpdateCategories={setCategories}
          />
        )}

        {activeTab === 'catalog_ui' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="catalog_ui"
          />
        )}

        {activeTab === 'nav_footer' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="nav_footer"
          />
        )}

        {activeTab === 'typography' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="typography"
          />
        )}

        {activeTab === 'spotlight' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="spotlight"
          />
        )}

        {activeTab === 'modal_content' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="modal_content"
          />
        )}

        {activeTab === 'social_share' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="social_share"
          />
        )}

        {activeTab === 'reviews_header' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="reviews_header"
          />
        )}

        {activeTab === 'hero' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="hero"
          />
        )}

        {activeTab === 'promo' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="promo"
          />
        )}

        {activeTab === 'contact' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="contact"
          />
        )}

        {activeTab === 'values' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="values"
          />
        )}

        {activeTab === 'discreet' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="discreet"
          />
        )}

        {activeTab === 'care' && (
          <SiteSettingsManager
            settings={settings}
            onUpdateSettings={setSettings}
            subTab="care"
          />
        )}

        {activeTab === 'faqs' && (
          <FaqManager
            faqs={faqs}
            onUpdateFaqs={setFaqs}
          />
        )}

      </main>

    </div>
  );
}
