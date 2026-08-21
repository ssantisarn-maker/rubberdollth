import React, { useState, useMemo, useRef } from 'react';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import ProductModal from './ProductModal';
import { useLiveProducts } from '../../hooks/useLiveProducts';
import { Sparkles, PackageCheck, Flame, CheckCircle2, ArrowDown } from 'lucide-react';
import { translations } from '../../data/translations';

export default function ProductCatalog({ activeTab, setActiveTab, isAdultMode, onToggleAdultMode, lang = 'th' }) {
  const { products } = useLiveProducts();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [visibleCount, setVisibleCount] = useState(12);
  const productsGridRef = useRef(null);
  const t = translations[lang] || translations.th;

  // Bilingual Categories from User's Screenshot + Ready to Ship
  const categories = useMemo(() => [
    {
      id: 'all',
      label: t.catalog.categories.all,
      count: products.length
    },
    {
      id: 'ready',
      label: t.catalog.categories.ready,
      count: products.filter(p => p.isReadyToShip || p.is_ready_to_ship || (p.categories && p.categories.includes('ready'))).length
    },
    {
      id: 'toys',
      label: t.catalog.categories.toys,
      count: products.filter(p => p.categories && p.categories.includes('toys')).length
    },
    {
      id: 'anime',
      label: t.catalog.categories.anime,
      count: products.filter(p => p.categories && p.categories.includes('anime')).length
    },
    {
      id: 'western',
      label: t.catalog.categories.western,
      count: products.filter(p => p.categories && p.categories.includes('western')).length
    },
    {
      id: 'asian',
      label: t.catalog.categories.asian,
      count: products.filter(p => p.categories && p.categories.includes('asian')).length
    },
    {
      id: 'torso',
      label: t.catalog.categories.torso,
      count: products.filter(p => p.categories && p.categories.includes('torso')).length
    },
    {
      id: 'reviews',
      label: t.catalog.categories.reviews,
      count: 24
    }
  ], [lang, t, products]);

  // Filter Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'ready') {
          if (!item.isReadyToShip && !item.is_ready_to_ship && (!item.categories || !item.categories.includes('ready'))) {
            return false;
          }
        } else if (!item.categories || !item.categories.includes(selectedCategory)) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const codeMatch = (item.code || '').toLowerCase().includes(query);
        const nameMatch = (item.name || '').toLowerCase().includes(query);
        const descMatch = (item.description || '').toLowerCase().includes(query);
        if (!codeMatch && !nameMatch && !descMatch) return false;
      }

      return true;
    });
  }, [selectedCategory, searchQuery, products]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  // Active Category Name
  const activeCategoryObj = categories.find(c => c.id === selectedCategory);
  const activeCategoryLabel = activeCategoryObj ? activeCategoryObj.label : t.catalog.categories.all;

  // Auto-scroll instantly down to products grid when a category is clicked
  const handleSelectCategory = (catId) => {
    if (catId === 'reviews') {
      const revEl = document.getElementById('reviews');
      if (revEl) revEl.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    setSelectedCategory(catId);
    setVisibleCount(12);

    // Smooth scroll down to products grid
    setTimeout(() => {
      if (productsGridRef.current) {
        const headerOffset = 90;
        const elementPosition = productsGridRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 60);
  };

  return (
    <section id="catalog" className="py-16 sm:py-24 bg-sand-50 border-b border-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 18+ Active Status Banner if ON */}
        {isAdultMode && (
          <div className="bg-rose-600 text-white px-5 py-3 rounded-2xl shadow-md flex items-center justify-between animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <Flame className="w-4 h-4 fill-white shrink-0" />
              <span>{t.catalog.adultModeBanner}</span>
            </div>
            <button
              onClick={onToggleAdultMode}
              className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full font-medium transition-colors shrink-0"
            >
              {t.catalog.adultModeSwitchBack}
            </button>
          </div>
        )}

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-bronze">{t.catalog.sectionTag}</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-ink">
            {activeCategoryLabel} ({filteredProducts.length} {t.catalog.itemsUnit})
          </h2>
          <p className="text-sm text-ink-muted font-light">
            {lang === 'th' 
              ? 'ตุ๊กตายางซิลิโคนแท้ระดับ Hi-End 100% สัมผัสเสมือนจริง เลื่อนเมาส์ชี้บนรูปภาพเพื่อดูมุมมองสรีระจริง' 
              : '100% Hi-End hyper-realistic authentic silicone dolls. Hover over photos to view alternate factory spec angles.'}
          </p>
        </div>

        {/* "เลือกชมตามหมวดหมู่" Category & Search Box */}
        <ProductFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            setVisibleCount(12);
          }}
          totalResults={filteredProducts.length}
          isAdultMode={isAdultMode}
          onToggleAdultMode={onToggleAdultMode}
          lang={lang}
        />

        {/* Anchor and Active Category Badge above products */}
        <div ref={productsGridRef} className="pt-2 flex items-center justify-between flex-wrap gap-3 scroll-mt-28">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink bg-white px-3.5 py-1.5 rounded-full border border-sand-300 shadow-2xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-bronze" />
              <span>{lang === 'th' ? 'กำลังแสดงหมวดหมู่:' : 'Showing Category:'} <strong>{activeCategoryLabel}</strong></span>
            </span>
            <span className="text-xs text-ink-muted">
              ({filteredProducts.length} {t.catalog.itemsUnit})
            </span>
          </div>

          {selectedCategory !== 'all' && (
            <button
              onClick={() => handleSelectCategory('all')}
              className="text-xs font-semibold text-bronze hover:text-bronze-dark underline decoration-dotted"
            >
              {t.catalog.resetBtn}
            </button>
          )}
        </div>

        {/* Products Grid */}
        {displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
            {displayedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onQuickView={(prod) => setSelectedProduct(prod)}
                isAdultMode={isAdultMode}
                lang={lang}
              />
            ))}
          </div>
        ) : selectedCategory === 'toys' ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-sand-200 p-8 sm:p-12 space-y-4 max-w-2xl mx-auto shadow-soft">
            <div className="w-16 h-16 bg-sand-100 rounded-full flex items-center justify-center mx-auto text-2xl">
              🎁
            </div>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-ink">
              {lang === 'th' 
                ? 'หมวดหมู่ของเล่นสำหรับผู้ใหญ่ (เตรียมลงสินค้าใหม่เร็วๆ นี้)' 
                : 'Adult Toys & Accessories (Coming Soon)'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {lang === 'th'
                ? 'ทางร้านกำลังอยู่ระหว่างการคัดสรรอุปกรณ์และของเล่นเกรดพรีเมียมตัวใหม่ล่าสุดเพื่อนำมาเปิดตัวเร็วๆ นี้ ท่านสามารถทักสอบถามรายการสินค้าพิเศษล่วงหน้าได้ทาง LINE ครับ'
                : 'We are currently preparing an exclusive collection of luxury accessories. Please contact our concierge via LINE for early access.'}
            </p>
            <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
              <a
                href="https://line.me/ti/p/~@rubberdoll.th"
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-sm transition-all"
              >
                {lang === 'th' ? 'สอบถามสินค้าทาง LINE' : 'Inquire via LINE'}
              </a>
              <button
                onClick={() => {
                  handleSelectCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-ink-soft hover:text-ink px-4 py-2.5 rounded-full border border-sand-300 bg-sand-50 transition-all"
              >
                {t.catalog.resetBtn}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-sand-200 p-8 space-y-3">
            <p className="text-base font-semibold text-ink">{t.catalog.noResultTitle}</p>
            <p className="text-xs text-ink-muted">{t.catalog.noResultDesc}</p>
            <button
              onClick={() => {
                handleSelectCategory('all');
                setSearchQuery('');
              }}
              className="mt-2 text-xs font-semibold text-bronze underline hover:text-bronze-dark"
            >
              {t.catalog.resetBtn}
            </button>
          </div>
        )}

        {/* Load More Button */}
        {visibleCount < filteredProducts.length && (
          <div className="text-center pt-6">
            <button
              onClick={() => setVisibleCount((prev) => prev + 12)}
              className="inline-flex items-center gap-2 bg-white hover:bg-sand-100 border border-sand-300 px-8 py-3.5 rounded-full text-xs font-semibold text-ink shadow-soft hover:shadow-soft-hover transition-all duration-200 active:scale-98"
            >
              <span>{t.catalog.loadMore} ({filteredProducts.length - visibleCount} {t.catalog.itemsUnit})</span>
              <ArrowDown className="w-3.5 h-3.5 text-bronze" />
            </button>
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isAdultMode={isAdultMode}
          lang={lang}
        />
      )}
    </section>
  );
}
