import React, { useState } from 'react';
import { 
  Package, Tag, MessageSquareQuote, Sliders, Bell, Phone, 
  Sparkles, HelpCircle, Layers, Globe, Lock, Droplets, 
  LogOut, RefreshCw, ChevronRight, Menu, X, Compass, ExternalLink
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

export default function AdminDashboard({ onLogout, onBackToShop }) {
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
  const navMenuItems = [
    {
      group: '🛍️ คลังสินค้าและรีวิว',
      items: [
        { id: 'products', label: `จัดการสินค้า (${products.length} รายการ)`, icon: Package, badge: products.length, desc: 'สเปก, ราคา, รูปภาพ, วิดีโอ, จัดเรียง' },
        { id: 'reviews', label: 'จัดการรีวิวจากลูกค้า', icon: MessageSquareQuote, badge: reviews.length, desc: 'รีวิว, ให้ดาว, รูปถ่ายจริง' },
        { id: 'categories', label: 'จัดการหมวดหมู่สินค้า', icon: Tag, desc: 'แถบกรองและหมวดหมู่' },
      ]
    },
    {
      group: '🎨 ปรับแต่งเนื้อหาหน้าเว็บ (MASTER CMS)',
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
      <header className="lg:hidden bg-neutral-900 text-white p-4 flex items-center justify-between shadow-md sticky top-0 z-40">
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

        <button
          type="button"
          onClick={() => {
            if (onBackToShop) onBackToShop();
            else window.location.href = '/';
          }}
          className="text-xs bg-amber-500 hover:bg-amber-600 text-neutral-950 px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>ดูหน้าเว็บหลัก</span>
        </button>
      </header>

      {/* LEFT SIDEBAR NAVIGATION (Original Dark Luxury Styling) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 w-72 sm:w-80 h-screen bg-[#141416] text-white flex flex-col justify-between border-r border-white/10 shadow-2xl transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Top: Branding */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-black tracking-widest text-amber-400 text-base sm:text-lg">
                RUBBER DOLL
              </span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                MASTER CMS
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-light mt-0.5">ระบบควบคุมและปรับแต่งเว็บไซต์</p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Middle: Scrollable Menu Groups */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-neutral-800">
          {navMenuItems.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block">
                {grp.group}
              </span>

              <div className="space-y-1">
                {grp.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? 'bg-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-500/20 scale-[1.02]'
                          : 'text-neutral-300 hover:bg-white/5 hover:text-white font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-black/20 text-neutral-950' : 'bg-white/5 text-neutral-400 group-hover:text-amber-400 group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm block truncate leading-snug">{item.label}</span>
                          <span className={`text-[10px] block truncate font-normal ${isActive ? 'text-neutral-900/80' : 'text-neutral-500'}`}>
                            {item.desc}
                          </span>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                          isActive ? 'bg-black/20 text-neutral-950' : 'bg-neutral-800 text-neutral-300'
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

        {/* Sidebar Bottom: Status & Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-black/40">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (onBackToShop) onBackToShop();
                else window.location.href = '/';
              }}
              className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-neutral-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>เปิดดูหน้าเว็บหลัก</span>
            </button>

            <button
              onClick={handleRefreshAll}
              className="p-2 bg-white/10 hover:bg-white/20 text-amber-400 rounded-xl transition-colors cursor-pointer"
              title="รีเฟรชข้อมูลล่าสุด"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="w-full py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ออกจากระบบ</span>
            </button>
          )}
        </div>
      </aside>

      {/* Backdrop overlay on mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
        
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
            <button
              type="button"
              onClick={() => {
                if (onBackToShop) onBackToShop();
                else window.location.href = '/';
              }}
              className="text-xs bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ดูหน้าเว็บหลัก</span>
            </button>
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
            onBackToShop={onBackToShop}
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
