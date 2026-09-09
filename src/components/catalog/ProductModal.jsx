import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, MessageCircle, ShieldCheck, Sparkles, Box, Check, Star, Lock, 
  HeartHandshake, ChevronLeft, ChevronRight, Flame, Layers, DollarSign, 
  Gift, CheckCircle2, FileText, ZoomIn, ZoomOut, Maximize2, Share2, Copy,
  Play, Video, Image as ImageIcon, ChevronDown, ChevronUp, Eye
} from 'lucide-react';
import { siteConfig } from '../../data/siteConfig';
import { translations } from '../../data/translations';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { useLiveOptions } from '../../hooks/useLiveOptions';
import { useLiveCategories } from '../../hooks/useLiveCategories';
import { useLiveCustomSpecs } from '../../hooks/useLiveCustomSpecs';
import LineOrderModal from './LineOrderModal';

function getVideoEmbedInfo(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // YouTube Shorts: https://www.youtube.com/shorts/VIDEO_ID
  const ytShorts = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (ytShorts) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytShorts[1]}?autoplay=1&rel=0` };
  }

  // YouTube youtu.be: https://youtu.be/VIDEO_ID
  const youtuBe = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/i);
  if (youtuBe) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${youtuBe[1]}?autoplay=1&rel=0` };
  }

  // YouTube watch: https://www.youtube.com/watch?v=VIDEO_ID
  const ytWatch = url.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/i);
  if (ytWatch) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytWatch[1]}?autoplay=1&rel=0` };
  }

  // YouTube embed: https://www.youtube.com/embed/VIDEO_ID
  const ytEmbed = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (ytEmbed) {
    return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${ytEmbed[1]}?autoplay=1&rel=0` };
  }

  // Google Drive: https://drive.google.com/file/d/FILE_ID/view...
  const gDrive = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gDrive) {
    return { type: 'iframe', src: `https://drive.google.com/file/d/${gDrive[1]}/preview` };
  }

  // Vimeo: https://vimeo.com/VIDEO_ID
  const vimeo = url.match(/vimeo\.com\/(\d+)/i);
  if (vimeo) {
    return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1` };
  }

  // Direct MP4 / WebM / Cloud file URL
  return { type: 'video', src: url };
}

export default function ProductModal({ product, onClose, isAdultMode, lang = 'th' }) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [activeVideoIdx, setActiveVideoIdx] = useState(0);
  const [videoError, setVideoError] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [copied, setCopied] = useState(false);
  const [copiedLineOrder, setCopiedLineOrder] = useState(false);
  const { settings } = useSiteSettings();
  const { options } = useLiveOptions();
  const { categories: allCategories } = useLiveCategories();
  const { activeGroups: specGroups, itemsByGroup: specItemsByGroup, defaultSelection: defaultSpecSelection } = useLiveCustomSpecs();
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedSpecs, setSelectedSpecs] = useState({});
  const [isSpecsExpanded, setIsSpecsExpanded] = useState(true);
  const [previewOptionMedia, setPreviewOptionMedia] = useState(null);
  const [isOptionsExpanded, setIsOptionsExpanded] = useState(true);
  const [showLineOrderModal, setShowLineOrderModal] = useState(false);
  const t = translations[lang] || translations.th;

  // Determine if this specific product and its categories allow custom options
  const allowsCustomOptions = useMemo(() => {
    // 1. Explicit product-level setting overrides everything
    if (product?.allowCustomOptions === false || product?.allow_custom_options === 0) {
      return false;
    }
    if (product?.allowCustomOptions === true || product?.allow_custom_options === 1) {
      return true;
    }

    // 2. Category checks
    const pCats = Array.isArray(product?.categories) ? product.categories : [];
    const pCatStr = String(product?.category || '');

    // Check if any matching category in database explicitly disables options
    if (Array.isArray(allCategories) && allCategories.length > 0) {
      const matchedCats = allCategories.filter(c => 
        pCats.includes(c.id) || pCats.includes(c.label_th) || pCatStr.includes(c.id) || (c.label_th && pCatStr.includes(c.label_th))
      );
      const hasExplicitDisable = matchedCats.some(c => c.id !== 'all' && (c.allow_custom_options === 0 || c.allowCustomOptions === false));
      const hasExplicitEnable = matchedCats.some(c => c.id !== 'all' && (c.allow_custom_options === 1 || c.allowCustomOptions === true));
      if (hasExplicitDisable && !hasExplicitEnable) {
        return false;
      }
    }

    // Default safety heuristics for adult toys and torso
    if (pCats.includes('toys') || pCatStr.includes('ของเล่น') || pCats.includes('torso') || pCatStr.includes('ครึ่งตัว')) {
      return false;
    }

    return true;
  }, [product, allCategories]);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?p=${encodeURIComponent(product?.code || '')}`
    : `https://rubberdollth.com/?p=${encodeURIComponent(product?.code || '')}`;

  const handleCopyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Base numerical price
  const basePriceNum = useMemo(() => {
    if (!product?.price) return 0;
    const clean = String(product.price).replace(/[^0-9]/g, '');
    return clean ? parseInt(clean, 10) : 0;
  }, [product?.price]);

  // Selected options objects
  const selectedOptionList = useMemo(() => {
    if (!allowsCustomOptions) return [];
    if (!options || !Array.isArray(options)) return [];
    return options.filter(opt => selectedOptions.includes(opt.id));
  }, [allowsCustomOptions, options, selectedOptions]);

  // Selected custom specifications (wig, eyes, breast, nails, skin, etc.)
  const selectedSpecList = useMemo(() => {
    if (!allowsCustomOptions) return [];
    if (!specGroups || !Array.isArray(specGroups)) return [];
    const list = [];
    specGroups.forEach(g => {
      const gItems = specItemsByGroup[g.id] || [];
      if (gItems.length === 0) return;
      const selectedId = selectedSpecs[g.id] || defaultSpecSelection[g.id] || gItems[0]?.id;
      const item = gItems.find(i => i.id === selectedId) || gItems[0];
      if (item) {
        list.push({ group: g, item });
      }
    });
    return list;
  }, [allowsCustomOptions, specGroups, specItemsByGroup, selectedSpecs, defaultSpecSelection]);

  // Total specs price
  const specsTotal = useMemo(() => {
    return selectedSpecList.reduce((sum, entry) => sum + (Number(entry.item.price) || 0), 0);
  }, [selectedSpecList]);

  // Total add-on price
  const addOnsTotal = useMemo(() => {
    return selectedOptionList.reduce((sum, opt) => sum + (Number(opt.price) || 0), 0);
  }, [selectedOptionList]);

  // Grand total
  const grandTotal = basePriceNum > 0 ? (basePriceNum + addOnsTotal + specsTotal) : 0;

  // Active sorted options
  const activeOptions = useMemo(() => {
    if (!allowsCustomOptions) return [];
    if (!options || !Array.isArray(options)) return [];
    return options
      .filter(o => o.is_active !== 0)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [allowsCustomOptions, options]);

  const handleToggleOption = (optId) => {
    setSelectedOptions(prev => 
      prev.includes(optId) ? prev.filter(id => id !== optId) : [...prev, optId]
    );
  };

  // Line order prefilled message
  const lineMessage = useMemo(() => {
    let msg = `สวัสดีครับ สนใจสอบถาม/สั่งซื้อตุ๊กตายาง รุ่น: ${product?.code || ''} ${product?.name || ''}`;
    if (basePriceNum > 0) {
      msg += `\nราคาตัวตุ๊กตา: ฿${basePriceNum.toLocaleString()}.-`;
    } else if (product?.price) {
      msg += `\nราคาตัวตุ๊กตา: ${product.price}`;
    }

    if (selectedSpecList.length > 0) {
      msg += `\n\n🎨 สเปกสั่งทำที่เลือก:`;
      selectedSpecList.forEach(({ group, item }) => {
        const priceStr = Number(item.price) > 0 ? ` (+฿${Number(item.price).toLocaleString()}.-)` : ` (ฟรี)`;
        msg += `\n• ${group.name}: ${item.name}${priceStr}`;
      });
    }

    if (selectedOptionList.length > 0) {
      msg += `\n\n✨ ออฟชั่นเสริมพิเศษ (${selectedOptionList.length} รายการ):`;
      selectedOptionList.forEach(opt => {
        msg += `\n• ${opt.name} (+฿${Number(opt.price).toLocaleString()}.-)`;
      });
    }

    if (grandTotal > 0) {
      msg += `\n\n💰 ราคารวมทั้งสิ้น: ฿${grandTotal.toLocaleString()}.-`;
    }

    msg += `\n\nดูข้อมูลรุ่นนี้: ${shareUrl}`;
    return msg;
  }, [product, basePriceNum, selectedSpecList, selectedOptionList, grandTotal, shareUrl]);

  // Extract list of all videos
  const videoList = useMemo(() => {
    let list = [];
    if (Array.isArray(product?.videoUrls) && product.videoUrls.length > 0) {
      list = product.videoUrls;
    } else if (Array.isArray(product?.video_urls) && product.video_urls.length > 0) {
      list = product.video_urls;
    } else if (product?.videoUrl || product?.video_url) {
      list = [{ url: product.videoUrl || product.video_url, title: 'วิดีโอตัวอย่างสินค้า' }];
    }
    return list.map((v, i) => typeof v === 'string' ? { url: v, title: `วิดีโอที่ ${i + 1}` } : v);
  }, [product]);

  const currentVideo = videoList[activeVideoIdx] || videoList[0];

  // Reset states ONLY when a different product is opened
  useEffect(() => {
    setActiveImageIdx(0);
    setShowVideo(false);
    setActiveVideoIdx(0);
    setVideoError(false);
    setIsZoomOpen(false);
    setZoomScale(1);
    setSelectedOptions([]);
    setSelectedSpecs({});
    setPreviewOptionMedia(null);
  }, [product?.id, product?.code]);

  // Handle keyboard events (ESC, Arrow Left, Arrow Right) and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isZoomOpen) {
          setIsZoomOpen(false);
          setZoomScale(1);
        } else {
          onClose();
        }
      } else if (e.key === 'ArrowLeft') {
        const total = (product?.gallery && product.gallery.length > 0)
          ? product.gallery.length
          : [product?.image, product?.secondaryImage].filter(Boolean).length;
        if (total > 1) {
          setActiveImageIdx(prev => (prev > 0 ? prev - 1 : total - 1));
        }
      } else if (e.key === 'ArrowRight') {
        const total = (product?.gallery && product.gallery.length > 0)
          ? product.gallery.length
          : [product?.image, product?.secondaryImage].filter(Boolean).length;
        if (total > 1) {
          setActiveImageIdx(prev => (prev < total - 1 ? prev + 1 : 0));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isZoomOpen, onClose, product]);

  if (!product) return null;

  const galleryImages = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [product.image, product.secondaryImage].filter(Boolean);

  const currentImage = galleryImages[activeImageIdx] || product.image;

  const lineProductUrl = settings.line_url || siteConfig.lineUrl || 'https://line.me/R/ti/p/~RUBBERDOLL.TH';
  const lineShareUrl = useMemo(() => {
    return `https://line.me/R/share?text=${encodeURIComponent(lineMessage)}`;
  }, [lineMessage]);
  const lineDirectUrl = settings.line_url || siteConfig.lineUrl || 'https://line.me/R/ti/p/~RUBBERDOLL.TH';

  const seoImageAlt = `ตุ๊กตายาง ซิลิโคนแท้ระดับ Hi-End รุ่น ${product.code} ${product.name} ${product.series} สเปก ${product.height} RUBBER DOLL THAILAND`;

  const skinTone = product.skinTone || product.skin_tone || 'ผิวขาว/สีขาวเหลือง';
  const material = product.material || 'Pure Silicone + ปลูกผมและคิ้วเสมือนจริงเส้นต่อเส้น';
  const skeleton = product.skeleton || 'EVO Stainless-Steel 360° Articulated Frame';
  const specialOption = product.specialOption || product.special_option || '';
  const originalPrice = product.originalPrice || product.original_price || '';
  const gifts = product.gifts || settings.modal_gifts_default || 'ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร';

  const giftsList = gifts.split(',').map(g => g.trim()).filter(Boolean);

  const specsTitle = settings.modal_specs_title || '📐 ข้อมูลสเปกความพรีเมียม (SPECIFICATIONS)';
  const giftsTitle = settings.modal_gifts_title || '🎁 THE LUXURY COLLECTOR BOX (เซ็ตของขวัญระดับพรีเมียม)';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 bg-ink/70 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card / Mobile Bottom Sheet */}
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-4xl w-full max-h-[92vh] sm:max-h-[90vh] overflow-y-auto shadow-modal border border-sand-200 z-10 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200 pb-20 sm:pb-0">
        
        {/* Mobile Pull Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-sand-300 rounded-full mx-auto my-3" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 sm:top-4 right-3 sm:right-4 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 backdrop-blur-md text-ink-muted hover:text-ink hover:bg-sand-100 transition-colors shadow-2xs border border-sand-200 cursor-pointer"
          aria-label="ปิดหน้าต่าง / Close"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 p-4 sm:p-6 lg:p-8">
          
          {/* Left: Product Image & Gallery Thumbnails */}
          <div className="md:col-span-6 space-y-3">
            
            {/* Main Featured Image or Video Player */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-sand-100 border border-sand-200 shadow-sm group">
              {showVideo && currentVideo?.url ? (
                <div className="w-full h-full bg-black flex items-center justify-center relative">
                  {videoError ? (
                    <div className="w-full h-full bg-sand-950 text-white flex flex-col items-center justify-center p-6 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl font-bold">
                        ⚠️
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs sm:text-sm font-bold text-white">ไม่สามารถเปิดเล่นวิดีโอนี้ได้</p>
                        <p className="text-[11px] text-sand-400 max-w-xs leading-relaxed">
                          รูปแบบไฟล์อาจไม่รองรับ หรือลิงก์ปลายทางติดสิทธิ์การเข้าถึง (แนะนำอัปโหลดเป็นไฟล์ .mp4 หรือวางลิงก์ YouTube)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={currentVideo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                        >
                          เปิดดูลิงก์วิดีโอตรง ↗
                        </a>
                        <button
                          type="button"
                          onClick={() => { setVideoError(false); setShowVideo(false); }}
                          className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-semibold rounded-xl transition-colors"
                        >
                          กลับไปดูรูปภาพ
                        </button>
                      </div>
                    </div>
                  ) : (() => {
                    const embedInfo = getVideoEmbedInfo(currentVideo.url);
                    if (!embedInfo) return null;

                    if (embedInfo.type === 'iframe') {
                      return (
                        <iframe
                          src={embedInfo.src}
                          title={currentVideo.title || "วิดีโอตัวอย่างสินค้า"}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      );
                    }

                    return (
                      <video
                        key={currentVideo.url}
                        src={embedInfo.src}
                        controls
                        autoPlay
                        playsInline
                        onError={() => setVideoError(true)}
                        className="w-full h-full object-contain"
                      >
                        <source src={embedInfo.src} type="video/mp4" />
                        <source src={embedInfo.src} type="video/webm" />
                        เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอนี้
                      </video>
                    );
                  })()}
                </div>
              ) : (
                <div
                  className="w-full h-full cursor-zoom-in relative"
                  onClick={() => setIsZoomOpen(true)}
                  title="คลิกเพื่อซูมดูรูปภาพขนาดใหญ่ความละเอียดสูง (HD Zoom)"
                >
                  <img
                    src={currentImage}
                    alt={seoImageAlt}
                    title={seoImageAlt}
                    width="600"
                    height="800"
                    className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = product.image || '/favicon.png';
                    }}
                  />
                  
                  {/* Floating Zoom Button */}
                  <div className="absolute bottom-12 right-3 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-medium flex items-center gap-1 shadow-md transition-all group-hover:scale-105">
                    <ZoomIn className="w-3.5 h-3.5 text-amber-300" />
                    <span>กดเพื่อซูมภาพ HD</span>
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 bg-white/95 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-sans font-extrabold text-ink shadow-2xs border border-sand-200">
                {product.code}
              </div>

              {isAdultMode && (
                <div className="absolute top-3 right-3 bg-rose-600 text-white px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold shadow-2xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-white" /> {t.modal.adultBadge}
                </div>
              )}

              {/* Angle Switcher arrows */}
              {galleryImages.length > 1 && !showVideo && (
                <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-white/85 backdrop-blur-md text-ink hover:bg-white pointer-events-auto shadow-sm transition-transform active:scale-95"
                    title="รูปก่อนหน้า / Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
                    }}
                    className="p-1.5 sm:p-2 rounded-full bg-white/85 backdrop-blur-md text-ink hover:bg-white pointer-events-auto shadow-sm transition-transform active:scale-95"
                    title="รูปถัดไป / Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="absolute bottom-3 left-3 right-3 bg-ink/80 backdrop-blur-md text-white text-[10px] sm:text-[11px] p-1.5 sm:p-2 rounded-xl text-center pointer-events-none">
                ภาพถ่ายสเปกจริงจากโรงงาน {activeImageIdx + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Photo / Video Mode Switcher */}
            {videoList.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowVideo(false)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      !showVideo ? 'bg-ink text-white shadow-xs' : 'bg-sand-100 text-ink hover:bg-sand-200'
                    }`}
                  >
                    <span>📸 ดูรูปภาพ ({galleryImages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowVideo(true); setVideoError(false); }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      showVideo ? 'bg-purple-700 text-white shadow-xs' : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                    }`}
                  >
                    <span>▶ เล่นวิดีโอ {videoList.length > 1 ? `(${videoList.length} คลิป)` : ''}</span>
                  </button>
                </div>

                {/* Multiple Videos Playlist Tabs */}
                {videoList.length > 1 && showVideo && (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
                    {videoList.map((vid, vIdx) => (
                      <button
                        key={vIdx}
                        type="button"
                        onClick={() => { setActiveVideoIdx(vIdx); setVideoError(false); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                          activeVideoIdx === vIdx
                            ? 'bg-purple-800 text-white shadow-xs scale-[1.02]'
                            : 'bg-sand-100 text-ink-muted hover:bg-sand-200 hover:text-ink border border-sand-300'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                          {vIdx + 1}
                        </span>
                        <span>{vid.title || `คลิปที่ ${vIdx + 1}`}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Gallery Thumbnails Carousel */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => { setActiveImageIdx(idx); setShowVideo(false); }}
                    className={`relative w-12 sm:w-14 h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx && !showVideo
                        ? 'border-bronze shadow-sm scale-105'
                        : 'border-sand-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Angle ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = product.image || '/favicon.png';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Right: Technical Specs & Details */}
          <div className="md:col-span-6 flex flex-col justify-between space-y-4 sm:space-y-6">
            
            <div className="space-y-4">
              
              {/* Header: Series & Category */}
              <div>
                <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-bronze uppercase tracking-wider">
                  <span>{product.series || 'ตุ๊กตายางพรีเมียม'}</span>
                  <span>•</span>
                  <span>{product.category || 'ตุ๊กตาซิลิโคนแท้'}</span>
                </div>
                <h2 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold text-ink mt-0.5 leading-snug">
                  {product.code} {product.name}
                </h2>
              </div>

              {/* Price & Special Option Banner */}
              <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 space-y-1.5">
                <div className="flex items-baseline justify-between gap-2 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xs text-ink-muted">
                      {(selectedOptions.length > 0 || specsTotal > 0) ? 'ราคารวมทั้งสิ้น:' : 'ราคาพิเศษ:'}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-800 font-sans">
                      {(selectedOptions.length > 0 || specsTotal > 0) && grandTotal > 0
                        ? `฿${grandTotal.toLocaleString()}.-`
                        : (product.price || 'ติดต่อสอบถามทาง LINE')}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {specsTotal > 0 && (
                        <span className="text-[10px] bg-purple-500/20 text-purple-900 font-bold px-2 py-0.5 rounded-md">
                          + สเปก ฿{specsTotal.toLocaleString()}.-
                        </span>
                      )}
                      {selectedOptions.length > 0 && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-800 font-bold px-2 py-0.5 rounded-md">
                          + ออฟชั่น {selectedOptions.length} รายการ
                        </span>
                      )}
                    </div>
                  </div>
                  {originalPrice && (
                    <span className="text-xs text-ink-muted line-through font-sans">
                      {originalPrice}
                    </span>
                  )}
                </div>

                {(selectedOptions.length > 0 || specsTotal > 0) && (
                  <div className="text-[11px] text-ink-muted flex items-center gap-2 pt-0.5 border-t border-sand-200/60 flex-wrap">
                    <span>(ราคาตัว: {product.price || '-'}</span>
                    {specsTotal > 0 && <span>+ สเปก: ฿{specsTotal.toLocaleString()}.-</span>}
                    {addOnsTotal > 0 && <span>+ ออฟชั่นเสริม: ฿{addOnsTotal.toLocaleString()}.-</span>}
                    <span>)</span>
                  </div>
                )}

                {specialOption && (
                  <div className="pt-1 text-xs text-amber-900 bg-amber-100/70 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1.5 border border-amber-300/60">
                    <span>📋</span>
                    <span>{specialOption}</span>
                  </div>
                )}
              </div>

              {/* Custom Doll Specifications Section (Dropdowns: วิกผม, สีตา, ขนาดหน้าอก, สีเล็บ, สีผิว ฯลฯ) */}
              {allowsCustomOptions && specGroups.length > 0 && (
                <div className="rounded-2xl border border-purple-200/80 bg-gradient-to-b from-purple-50/40 via-sand-50/30 to-white overflow-hidden shadow-2xs">
                  
                  {/* Specifications Header Accordion */}
                  <div 
                    onClick={() => setIsSpecsExpanded(!isSpecsExpanded)}
                    className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-purple-100/40 transition-colors border-b border-purple-200/60 select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-purple-600/15 text-purple-700 flex items-center justify-center text-xs shrink-0 font-bold">
                        🎨
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-ink">
                            เลือกสเปกสั่งทำ (Custom Specifications)
                          </h4>
                          <span className="text-[10px] bg-purple-500/20 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                            {specGroups.length} หัวข้อ
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-ink-muted truncate">
                          ปรับแต่งวิกผม, สีตา, หน้าอก, สีเล็บ, สีผิว ฯลฯ พร้อมดูภาพตัวอย่าง
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {specsTotal > 0 ? (
                        <span className="text-[11px] font-bold text-purple-700 bg-purple-100/90 px-2 py-0.5 rounded-md">
                          +฿{specsTotal.toLocaleString()}.-
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          รวมในราคาแล้ว
                        </span>
                      )}
                      <div className="text-ink-muted hover:text-ink p-1 rounded-md">
                        {isSpecsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Specifications Dropdown Grid */}
                  {isSpecsExpanded && (
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {specGroups.map(group => {
                          const items = specItemsByGroup[group.id] || [];
                          if (items.length === 0) return null;

                          const currentSelectedId = selectedSpecs[group.id] || defaultSpecSelection[group.id] || items[0]?.id;
                          const currentItem = items.find(it => it.id === currentSelectedId) || items[0];

                          return (
                            <div 
                              key={group.id} 
                              className="bg-white p-2.5 sm:p-3 rounded-xl border border-sand-200/90 shadow-2xs hover:border-purple-300 transition-colors flex flex-col justify-between gap-1.5"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <label className="text-xs font-bold text-ink flex items-center gap-1.5 truncate">
                                    <span>{group.icon || '✨'}</span>
                                    <span className="truncate">{group.name}</span>
                                  </label>
                                  {currentItem && Number(currentItem.price) > 0 ? (
                                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full shrink-0 border border-purple-200/60">
                                      +฿{Number(currentItem.price).toLocaleString()}.-
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0 border border-emerald-200/60">
                                      ฟรี
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <select
                                    value={currentSelectedId}
                                    onChange={(e) => {
                                      const newId = e.target.value;
                                      setSelectedSpecs(prev => ({
                                        ...prev,
                                        [group.id]: newId
                                      }));
                                    }}
                                    className="flex-1 min-w-0 bg-sand-50/70 hover:bg-white text-xs font-medium text-ink border border-sand-300 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 cursor-pointer transition-all truncate"
                                  >
                                    {items.map(it => {
                                      const p = Number(it.price) || 0;
                                      const pLabel = p > 0 ? ` (+฿${p.toLocaleString()}.-)` : ' (ฟรี)';
                                      return (
                                        <option key={it.id} value={it.id}>
                                          {it.name}{pLabel}
                                        </option>
                                      );
                                    })}
                                  </select>

                                  {currentItem?.image && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewOptionMedia({
                                        type: 'image',
                                        url: currentItem.image,
                                        title: `${group.name}: ${currentItem.name}`,
                                        tag: 'ตัวอย่างสเปก'
                                      })}
                                      className="p-1 rounded-xl border border-sand-200 hover:border-purple-400 bg-sand-50 hover:bg-purple-50 text-ink-muted hover:text-purple-700 transition-all flex items-center justify-center shrink-0 group"
                                      title="คลิกเพื่อดูรูปภาพตัวอย่างสเปกนี้"
                                    >
                                      <img 
                                        src={currentItem.image} 
                                        alt="" 
                                        className="w-7 h-7 object-cover rounded-lg border border-sand-200 group-hover:scale-105 transition-transform" 
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {currentItem?.description && (
                                <p className="text-[10px] text-ink-muted leading-tight truncate">
                                  {currentItem.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Custom Doll Options Section */}
              {activeOptions.length > 0 && (
                <div className="rounded-2xl border border-sand-200 bg-gradient-to-b from-sand-50/70 to-white overflow-hidden shadow-2xs">
                  
                  {/* Section Header Accordion */}
                  <div 
                    onClick={() => setIsOptionsExpanded(!isOptionsExpanded)}
                    className="p-3 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-sand-100/60 transition-colors border-b border-sand-200/60 select-none"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center text-xs shrink-0 font-bold">
                        ✨
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-xs sm:text-sm font-bold text-ink">
                            ปรับแต่งออฟชั่นเสริมพิเศษ (Custom Options)
                          </h4>
                          <span className="text-[10px] bg-amber-500/20 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                            {activeOptions.length} รายการ
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-ink-muted truncate">
                          เลือกเพิ่มออฟชั่นเสริมเพื่อคำนวณราคารวมทันที (ดูรูป/คลิปตัวอย่างได้)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedOptions.length > 0 && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                          เลือกแล้ว {selectedOptions.length}
                        </span>
                      )}
                      <div className="text-ink-muted hover:text-ink p-1 rounded-md">
                        {isOptionsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Options List */}
                  {isOptionsExpanded && (
                    <div className="p-3 sm:p-3.5 space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-sand-300">
                      {activeOptions.map((opt) => {
                        const isSelected = selectedOptions.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            onClick={() => handleToggleOption(opt.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                              isSelected
                                ? 'bg-amber-50/90 border-amber-400 shadow-xs'
                                : 'bg-white hover:bg-sand-50 border-sand-200'
                            }`}
                          >
                            {/* Checkbox */}
                            <div className="pt-0.5 shrink-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // Handled by parent container click
                                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-sand-300 pointer-events-none accent-amber-600"
                              />
                            </div>

                            {/* Option Details */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-xs font-bold leading-snug ${isSelected ? 'text-amber-950 font-extrabold' : 'text-ink'}`}>
                                  {opt.name}
                                </span>
                                <span className="font-mono font-bold text-xs text-amber-700 whitespace-nowrap shrink-0">
                                  {opt.price > 0 ? `+฿${Number(opt.price).toLocaleString()}.-` : 'ฟรี'}
                                </span>
                              </div>

                              {/* Condition / Material Tag */}
                              {opt.condition && (
                                <div className="text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md inline-block">
                                  {opt.condition}
                                </div>
                              )}

                              {/* Details note */}
                              {opt.details && (
                                <p className="text-[10px] text-ink-muted leading-relaxed line-clamp-2">
                                  {opt.details}
                                </p>
                              )}

                              {/* Media Preview Action Buttons */}
                              {(opt.image || opt.video_url) && (
                                <div className="flex items-center gap-1.5 pt-0.5" onClick={e => e.stopPropagation()}>
                                  {opt.image && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewOptionMedia({ type: 'image', url: opt.image, title: opt.name })}
                                      className="text-[10px] text-ink-muted hover:text-amber-800 bg-sand-100 hover:bg-sand-200 px-2 py-0.5 rounded-md flex items-center gap-1 border border-sand-200 transition-colors cursor-pointer"
                                    >
                                      <Eye className="w-3 h-3 text-bronze" />
                                      <span>ดูรูปตัวอย่าง</span>
                                    </button>
                                  )}

                                  {opt.video_url && (
                                    <button
                                      type="button"
                                      onClick={() => setPreviewOptionMedia({ type: 'video', url: opt.video_url, title: opt.name })}
                                      className="text-[10px] text-amber-900 bg-amber-100/80 hover:bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300/60 font-semibold transition-colors cursor-pointer"
                                    >
                                      <Play className="w-3 h-3 fill-amber-700 text-amber-700" />
                                      <span>ดูคลิปตัวอย่าง</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Summary Bar inside Section */}
                  {selectedOptions.length > 0 && (
                    <div className="p-3 bg-amber-500/10 border-t border-amber-500/20 flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <span className="text-ink-muted">รวมออฟชั่น ({selectedOptions.length} รายการ): </span>
                        <span className="font-bold font-mono text-amber-700">+฿{addOnsTotal.toLocaleString()}.-</span>
                      </div>

                      {grandTotal > 0 && (
                        <div className="text-right">
                          <span className="text-[10px] text-ink-muted block">ยอดรวมทั้งสิ้น</span>
                          <span className="text-sm sm:text-base font-black font-mono text-emerald-800">
                            ฿{grandTotal.toLocaleString()}.-
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="p-3.5 sm:p-4 bg-sand-50/80 rounded-2xl border border-sand-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-ink border-b border-sand-200/80 pb-1.5">
                    <FileText className="w-3.5 h-3.5 text-bronze" />
                    <span>รายละเอียดสินค้าเพิ่มเติม</span>
                  </div>
                  <div className="text-xs sm:text-sm text-ink-soft leading-relaxed whitespace-pre-line font-normal">
                    {product.description}
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="space-y-2">
                <h3 className="text-xs sm:text-sm font-bold text-ink flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-bronze" />
                  <span>{specsTitle}</span>
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2.5 sm:p-3 rounded-xl bg-sand-50/80 border border-sand-200 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] text-ink-muted block">ส่วนสูง (Height)</span>
                    <span className="font-bold font-sans text-xs sm:text-sm text-ink pt-0.5">{product.height || '-'}</span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-sand-50/80 border border-sand-200 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] text-ink-muted block">น้ำหนัก (Weight)</span>
                    <span className="font-bold font-sans text-xs sm:text-sm text-ink pt-0.5">{product.weight || '-'}</span>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl bg-sand-50/80 border border-sand-200 flex flex-col justify-between">
                    <span className="text-[10px] sm:text-[11px] text-ink-muted block">สีผิว (Skin Tone)</span>
                    <span className="font-bold text-xs sm:text-sm text-ink pt-0.5">{skinTone}</span>
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-sand-50/80 border border-sand-200 space-y-0.5">
                  <span className="text-[10px] sm:text-[11px] text-ink-muted block">วัสดุเนื้อผิวตุ๊กตา</span>
                  <span className="font-bold text-xs sm:text-sm text-ink">{material}</span>
                </div>
              </div>

              {/* Free Gifts & Collector Box */}
              {giftsList.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-sand-50 border border-sand-200 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-ink">
                    <Gift className="w-4 h-4 text-bronze" />
                    <span>{giftsTitle}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-ink-soft">
                    {giftsList.map((gift, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{gift}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* Sticky Action Button */}
            <div className="space-y-2 pt-3 border-t border-sand-200">
              {copiedLineOrder && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-2 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>✓ คัดลอกรายละเอียดคำสั่งซื้อพร้อมออฟชั่นแล้ว! หากเข้าแชทตรงสามารถกด "วาง" (Paste) ใน LINE ได้ทันที</span>
                </div>
              )}

              {/* 1. PRIMARY CTA: Opens the Smart LINE Order Assistant */}
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(lineMessage);
                    setCopiedLineOrder(true);
                    setTimeout(() => setCopiedLineOrder(false), 4000);
                  } catch (e) {}
                  setShowLineOrderModal(true);
                }}
                className="w-full py-3 sm:py-3.5 px-6 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm sm:text-base shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-0.5 transition-all active:scale-98 cursor-pointer group"
                title="คลิกเพื่อสั่งซื้อและส่งรายการนี้เข้า LINE"
              >
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 fill-white shrink-0" />
                  <span>{settings.modal_cta_btn_text || 'สั่งซื้อ / ส่งรายการนี้เข้า LINE ทันที'}</span>
                </div>
                <span className="text-[11px] font-normal text-emerald-100 group-hover:text-white transition-colors">
                  ✨ คลิกเพื่อส่งรายการเข้า LINE (รองรับทั้งลูกค้าใหม่และลูกค้าเดิม)
                </span>
              </button>

              {/* 2. SECONDARY ACTIONS: Direct Chat with Shop & Copy Link */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={lineDirectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(lineMessage);
                      setCopiedLineOrder(true);
                      setTimeout(() => setCopiedLineOrder(false), 4000);
                    } catch (e) {}
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-sand-300 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-ink hover:text-emerald-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="เปิดหน้าแชทกับร้านค้าโดยตรง (ระบบจะคัดลอกข้อความคำสั่งซื้อให้ เพื่อนำไปกดวางในแชท)"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#06C755]" />
                  <span>แชทตรงกับร้าน (ID: {settings.line_id || siteConfig.lineId || 'RUBBERDOLL.TH'})</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopyShareLink}
                  className={`py-2 px-3.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    copied
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                      : 'bg-white hover:bg-sand-50 border-sand-300 text-ink shadow-sm'
                  }`}
                  title="คัดลอกลิงก์สินค้ารุ่นนี้เพื่อส่งต่อ"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>✓ คัดลอกแล้ว</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-bronze" />
                      <span>คัดลอกลิงก์</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-3 sm:gap-4 text-[11px] text-ink-muted flex-wrap pt-1">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{(settings.modal_trust_1 || 'กล่องทึบ 2 ชั้น ไม่ระบุชื่อสินค้า').replace(/^[🔒\s]+/, '')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{(settings.modal_trust_2 || 'ส่งด่วน 1-2 วันรับของทั่วประเทศ').replace(/^[🚚\s]+/, '')}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{(settings.modal_trust_3 || 'ดูแลส่วนตัว 24 ชม.').replace(/^[🤝\s]+/, '')}</span>
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* OPTION MEDIA LIGHTBOX MODAL */}
      {previewOptionMedia && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-4">
                <span className="text-xs bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded-full">
                  {previewOptionMedia.tag || 'ตัวอย่างออฟชั่น'}
                </span>
                <h4 className="text-white font-bold text-xs sm:text-sm truncate">{previewOptionMedia.title}</h4>
              </div>
              <button
                onClick={() => setPreviewOptionMedia(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-black flex items-center justify-center min-h-[280px] max-h-[70vh]">
              {previewOptionMedia.type === 'image' ? (
                <img src={previewOptionMedia.url} alt={previewOptionMedia.title} className="max-h-[65vh] w-auto object-contain rounded-xl" />
              ) : (
                (() => {
                  const info = getVideoEmbedInfo(previewOptionMedia.url);
                  if (info?.type === 'video' || info?.type === 'direct') {
                    return (
                      <video 
                        src={info.src} 
                        controls 
                        autoPlay 
                        className="max-h-[65vh] w-full rounded-xl bg-black"
                      />
                    );
                  }
                  return (
                    <iframe
                      src={info?.src || previewOptionMedia.url}
                      title={previewOptionMedia.title}
                      className="w-full aspect-video rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN HD ZOOM LIGHTBOX MODAL */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col justify-between p-4 animate-in fade-in duration-200 select-none">
          
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between text-white px-2 py-2 border-b border-white/10 z-20">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500 text-gray-950 text-xs font-black px-3 py-1 rounded-full">
                HD ZOOM
              </span>
              <span className="text-xs sm:text-sm text-gray-300 font-bold">
                {product.code} - {product.name} ({activeImageIdx + 1}/{galleryImages.length})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoomScale(prev => Math.min(prev + 0.5, 3))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="ซูมเข้า / Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomScale(prev => Math.max(prev - 0.5, 1))}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="ซูมออก / Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white font-bold"
                title="รีเซ็ตขนาด / Reset"
              >
                100%
              </button>
              <button
                onClick={() => setIsZoomOpen(false)}
                className="p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors ml-2"
                title="ปิด / Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Zoomed Image Stage */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden my-2">
            <img
              src={currentImage}
              alt="Zoomed Product View"
              style={{ transform: `scale(${zoomScale})` }}
              className="max-h-[82vh] max-w-[92vw] object-contain transition-transform duration-200 cursor-grab active:cursor-grabbing"
              onClick={() => setZoomScale(prev => prev > 1 ? 1 : 2)}
            />

            {/* Navigation Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev > 0 ? prev - 1 : galleryImages.length - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-transform active:scale-95"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setActiveImageIdx(prev => (prev < galleryImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-transform active:scale-95"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-20">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`relative w-12 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  activeImageIdx === idx ? 'border-amber-400 scale-110' : 'border-white/30 opacity-50 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>

        </div>
      )}

      {/* SMART LINE ORDER ASSISTANT MODAL */}
      <LineOrderModal
        isOpen={showLineOrderModal}
        onClose={() => setShowLineOrderModal(false)}
        product={product}
        selectedSpecs={selectedSpecList}
        selectedOptions={selectedOptionList}
        grandTotal={grandTotal}
        basePriceNum={basePriceNum}
        lineMessage={lineMessage}
        settings={settings}
        siteConfig={siteConfig}
      />

    </div>
  );
}
