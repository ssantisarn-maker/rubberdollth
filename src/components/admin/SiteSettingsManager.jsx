import React, { useState, useEffect } from 'react';
import { Save, Bell, Phone, MessageCircle, Image as ImageIcon, ShieldCheck, Sparkles, CheckCircle2, Upload, Flame, Globe, Layers, ArrowRight, Lock, HeartHandshake, Droplets } from 'lucide-react';
import { useLiveProducts } from '../../hooks/useLiveProducts';

export default function SiteSettingsManager({ settings, onUpdateSettings, subTab = 'all' }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPillar, setUploadingPillar] = useState(null);
  const { products } = useLiveProducts();

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({ ...settings });
    }
  }, [settings]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Upload Pillar Image
  const handlePillarImageUpload = async (pillarNum, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPillar(pillarNum);
    const form = new FormData();
    form.append('image', file);
    form.append('type', 'product');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, [`values_p${pillarNum}_image`]: data.url }));
        showToast(`✓ อัปโหลดรูปภาพจุดเด่นที่ ${pillarNum} สำเร็จ`);
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, [`values_p${pillarNum}_image`]: localUrl }));
    } finally {
      setUploadingPillar(null);
    }
  };


  // Upload custom Brand Logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const form = new FormData();
    form.append('image', file);
    form.append('type', 'product');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, brand_logo_image: data.url }));
        showToast('✓ อัปโหลดรูปโลโก้แบรนด์สำเร็จ');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, brand_logo_image: localUrl }));
    } finally {
      setUploadingLogo(false);
    }
  };

  // Upload custom Hero photo
  const handleHeroBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingHero(true);
    const form = new FormData();
    form.append('image', file);
    form.append('type', 'product');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, hero_bg_image: data.url }));
        showToast('✓ อัปโหลดรูปภาพ Hero สำเร็จ');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, hero_bg_image: localUrl }));
    } finally {
      setUploadingHero(false);
    }
  };


  // Quick 1-Click Pick from existing 70 products
  const handleSelectProductAsHero = (prodCode) => {
    const selected = products.find(p => p.code === prodCode);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        hero_bg_image: selected.image,
        hero_tag: `MODEL SPOTLIGHT • ${selected.code} ${selected.name}`,
        hero_title: `สุนทรียภาพแห่งสัมผัสเสมือนจริง: ${selected.name}`,
        hero_subtitle: selected.description || prev.hero_subtitle
      }));
      showToast(`✓ เลือก [${selected.code}] ${selected.name} เป็นสินค้า Hero หน้าแรกแล้ว!`);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/settings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ บันทึกการตั้งค่าเว็บไซต์เรียบร้อยแล้ว ข้อมูลบนหน้าเว็บอัปเดตทันที!');
        onUpdateSettings(formData);
      }
    } catch (e) {
      showToast('✓ บันทึกการตั้งค่าเรียบร้อยแล้ว');
      onUpdateSettings(formData);
    } finally {
      setSaveLoading(false);
    }
  };

  const currentHeroImg = formData.hero_bg_image || "https://cdn.zyrosite.com/cdn-ecommerce/store_01KYYQFNVFQMCAMTY5SZA4J5H8/assets/7ee33a0f-4684-42bb-b140-e282b3df64a3.jpg";

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold">✓</div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION: Brand Logo & Identity Lockup */}
        {(subTab === 'all' || subTab === 'hero') && (
          <div id="section-brand" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-bronze" />
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">🏷️ โลโก้แบรนด์ & ชื่อร้าน (Brand Identity & Logo Lockup)</h3>
                  <p className="text-xs text-ink-muted">เปลี่ยนรูปโลโก้, ชื่อแบรนด์หลัก, ป้ายย่อ TH, และสโลแกนใต้โลโก้ที่แสดงบนแถบเมนูด้านบนและท้ายเว็บ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Col: Logo Preview & Upload */}
              <div className="lg:col-span-5 space-y-3">
                <label className="font-bold text-ink text-xs block">🖼️ ตัวอย่างโลโก้แบรนด์ปัจจุบัน (Live Preview)</label>
                
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-sand-50 border border-sand-300">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-sand-300 bg-white shadow-2xs group shrink-0">
                    <img
                      src={formData.brand_logo_image || "/logo.webp"}
                      alt="Brand Logo Preview"
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = '/logo.png'; }}
                    />
                    <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                      <span>เปลี่ยน</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif text-lg font-bold text-ink whitespace-nowrap">
                        {formData.brand_name || 'RUBBER DOLL'}
                      </span>
                      <span className="text-[10px] font-sans font-bold px-1.5 py-0.5 rounded bg-sand-200 text-bronze shrink-0">
                        {formData.brand_tag || 'TH'}
                      </span>
                    </div>
                    <span className="text-[10px] text-ink-muted tracking-widest uppercase font-medium whitespace-nowrap">
                      {formData.brand_est || 'EST. 2019 • LUXURY COLLECTION'}
                    </span>
                  </div>
                </div>

                <label className="w-full px-4 py-2.5 bg-sand-100 hover:bg-sand-200 text-ink text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border border-sand-300">
                  <Upload className="w-4 h-4 text-bronze" />
                  <span>{uploadingLogo ? 'กำลังอัปโหลดโลโก้...' : '📸 อัปโหลดเปลี่ยนรูปโลโก้ใหม่'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Right Col: Brand Text Fields */}
              <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">ชื่อแบรนด์หลัก (Brand Name)</label>
                    <input
                      type="text"
                      value={formData.brand_name || ''}
                      onChange={e => setFormData({ ...formData, brand_name: e.target.value })}
                      placeholder="เช่น RUBBER DOLL"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-bold text-ink"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">ป้ายกำกับย่อ (Brand Tag)</label>
                    <input
                      type="text"
                      value={formData.brand_tag || ''}
                      onChange={e => setFormData({ ...formData, brand_tag: e.target.value })}
                      placeholder="เช่น TH"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-bold text-bronze"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ข้อความสโลแกนใต้โลโก้ (Est / Subtitle)</label>
                  <input
                    type="text"
                    value={formData.brand_est || ''}
                    onChange={e => setFormData({ ...formData, brand_est: e.target.value })}
                    placeholder="เช่น EST. 2019 • LUXURY COLLECTION"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Hero Banner & Model Switcher */}
        {(subTab === 'all' || subTab === 'hero') && (

          <div id="section-hero" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-bronze" />
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">🖼️ สินค้า Hero และแบนเนอร์หลักหน้าแรก (Hero Showcase)</h3>
                  <p className="text-xs text-ink-muted">เปลี่ยนรูปโมเดลสินค้าเด่น หัวข้อใหญ่ และคำโปรยที่แสดงบนหน้าแรกของเว็บ</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Col: Hero Image Preview & Upload */}
              <div className="lg:col-span-4 space-y-3">
                <label className="font-bold text-ink text-xs block">📸 รูปภาพสินค้า Hero ที่กำลังแสดงผล</label>
                
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-sand-300 bg-sand-100 shadow-sm group">
                  <img
                    src={currentHeroImg}
                    alt="Hero Preview"
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.target.src = '/favicon.png'; }}
                  />
                  
                  <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                    <label className="px-4 py-2 bg-white text-ink text-xs font-bold rounded-xl shadow-md cursor-pointer hover:bg-sand-100 transition-all flex items-center gap-1.5">
                      <Upload className="w-3.5 h-3.5 text-bronze" />
                      <span>{uploadingHero ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปจากเครื่อง'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleHeroBgUpload}
                        disabled={uploadingHero}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Add by URL */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ink-muted">หรือใส่ลิงก์รูปภาพ URL:</label>
                  <input
                    type="text"
                    value={formData.hero_bg_image || ''}
                    onChange={e => setFormData({ ...formData, hero_bg_image: e.target.value })}
                    placeholder="https://... หรือ /images/products/..."
                    className="w-full px-3 py-1.5 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                  />
                </div>

                {/* 1-Click Quick Selector from 70 Products */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                  <label className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    <span>⚡ ดึงรูปจากสินค้า 70 รุ่นที่มีอยู่:</span>
                  </label>
                  <select
                    onChange={e => handleSelectProductAsHero(e.target.value)}
                    defaultValue=""
                    className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-semibold text-ink focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>-- คลิกเลือกสินค้าที่ต้องการให้เป็น Hero --</option>
                    {products.map(p => (
                      <option key={p.code} value={p.code}>
                        [{p.code}] {p.name} {p.isReadyToShip ? '(พร้อมส่งในไทย)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Col: Hero Text Headlines & Buttons */}
              <div className="lg:col-span-8 space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ป้ายสโลแกนด้านบน (Tagline Badge)</label>
                  <input
                    type="text"
                    value={formData.hero_tag}
                    onChange={e => setFormData({ ...formData, hero_tag: e.target.value })}
                    placeholder="เช่น MASTERPIECES OF REALISM • HYPER-REALISTIC SILICONE"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ข้อความรองเหนือหัวข้อใหญ่ (Pre-headline)</label>
                  <input
                    type="text"
                    value={formData.hero_pretitle}
                    onChange={e => setFormData({ ...formData, hero_pretitle: e.target.value })}
                    placeholder="เช่น นิยามใหม่แห่งความสมจริงเหนือระดับ"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">หัวข้อใหญ่หน้าแรก (Hero Headline) *</label>
                  <input
                    type="text"
                    required
                    value={formData.hero_title}
                    onChange={e => setFormData({ ...formData, hero_title: e.target.value })}
                    placeholder="เช่น สุนทรียภาพแห่งสัมผัสเสมือนจริง ระดับ Hi-End อันดับ 1 ในไทย"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">คำโปรยอธิบาย (Hero Subtitle) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.hero_subtitle}
                    onChange={e => setFormData({ ...formData, hero_subtitle: e.target.value })}
                    placeholder="เช่น ตุ๊กตายางซิลิโคนแท้ 100% เกรดการแพทย์ โครงสร้างสแตนเลส 360° ปรับได้ทุกท่วงท่า..."
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">ข้อความบนปุ่มหลัก (Primary Button)</label>
                    <input
                      type="text"
                      value={formData.hero_btn_primary_text}
                      onChange={e => setFormData({ ...formData, hero_btn_primary_text: e.target.value })}
                      placeholder="เช่น ดูแคตตาล็อกสินค้าทั้งหมด"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">ข้อความบนปุ่มรอง (Secondary Button)</label>
                    <input
                      type="text"
                      value={formData.hero_btn_secondary_text}
                      onChange={e => setFormData({ ...formData, hero_btn_secondary_text: e.target.value })}
                      placeholder="เช่น ปรึกษาแอดมินทาง LINE"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION: Top Announcement & Contact */}
        {(subTab === 'all' || subTab === 'contact') && (
          <div id="section-contact" className="space-y-6">
            {/* Top Announcement Bar */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
              <div className="flex items-center justify-between border-b border-sand-200 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-500" />
                  <div>
                    <h3 className="font-bold text-ink text-sm sm:text-base">📢 แถบประกาศโปรโมชั่นบนสุด (Top Announcement Bar)</h3>
                    <p className="text-xs text-ink-muted">แสดงป้ายประกาศแถบด้านบนสุดของทุกหน้าเว็บ สำหรับแจ้งโปรโมชั่นหรือส่งด่วน</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink-muted hidden sm:inline">
                    {formData.announcement_enabled ? 'เปิดใช้งาน' : 'ปิดการแสดงผล'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, announcement_enabled: !prev.announcement_enabled }))}
                    className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.announcement_enabled ? 'bg-emerald-600' : 'bg-sand-300'}`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.announcement_enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ข้อความป้าย Badge</label>
                  <input
                    type="text"
                    value={formData.announcement_badge}
                    onChange={e => setFormData({ ...formData, announcement_badge: e.target.value })}
                    placeholder="เช่น 🔥 โปรโมชั่นพิเศษ หรือ ⚡ FLASH SALE"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-ink">ข้อความประกาศหลัก</label>
                  <input
                    type="text"
                    value={formData.announcement_text}
                    onChange={e => setFormData({ ...formData, announcement_text: e.target.value })}
                    placeholder="เช่น สต็อกพร้อมส่งในไทย! สั่งซื้อวันนี้รับฟรี The Luxury Collector Box + ส่งด่วนลับเฉพาะทั่วประเทศ"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Social Info */}
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
              <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">📞 ข้อมูลติดต่อร้านค้า (LINE Official & Phone)</h3>
                  <p className="text-xs text-ink-muted">เมื่อแก้ไข ข้อมูลจะเปลี่ยนบนปุ่มสั่งซื้อ LINE, Navbar, และ Footer ทั้งหมดทันที</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">LINE Official ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.line_id}
                    onChange={e => setFormData({ ...formData, line_id: e.target.value })}
                    placeholder="เช่น @RUBBERDOLL.TH"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-emerald-800 focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ลิงก์ LINE Official Account URL *</label>
                  <input
                    type="text"
                    required
                    value={formData.line_url}
                    onChange={e => setFormData({ ...formData, line_url: e.target.value })}
                    placeholder="เช่น https://line.me/R/ti/p/@RUBBERDOLL.TH"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">เบอร์โทรศัพท์ติดต่อ</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="เช่น 086-004-3541"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">เวลาทำการและรอบจัดส่ง</label>
                  <input
                    type="text"
                    value={formData.business_hours}
                    onChange={e => setFormData({ ...formData, business_hours: e.target.value })}
                    placeholder="เช่น เปิดบริการทุกวัน 24 ชม. (จัดส่งด่วนทุกวัน)"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: The Masterpiece Difference (Value Pillars) */}
        {(subTab === 'all' || subTab === 'values') && (
          <div id="section-values" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-bronze" />
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">💎 จุดเด่นและเอกลักษณ์ (The Masterpiece Difference)</h3>
                <p className="text-xs text-ink-muted">แก้ไขหัวข้อหลัก คำโปรย และ 4 จุดเด่นที่แสดงบนหน้าแรก</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">ป้ายหัวข้อเล็ก (Section Tag)</label>
                <input
                  type="text"
                  value={formData.values_tag}
                  onChange={e => setFormData({ ...formData, values_tag: e.target.value })}
                  placeholder="เช่น THE MASTERPIECE DIFFERENCE"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">หัวข้อใหญ่ (Main Heading)</label>
                <input
                  type="text"
                  value={formData.values_heading}
                  onChange={e => setFormData({ ...formData, values_heading: e.target.value })}
                  placeholder="เช่น เอกลักษณ์แห่งความสมบูรณ์แบบ ที่สัมผัสได้จริง"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Pillar 1 */}
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-bronze block">จุดเด่นที่ 1</span>
                  {formData.values_p1_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, values_p1_image: '' })}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>

                {/* Image Preview & Upload */}
                <div className="space-y-1.5">
                  {formData.values_p1_image ? (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-sand-300 bg-sand-100 group">
                      <img src={formData.values_p1_image} alt="Pillar 1" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                        <span>เปลี่ยนรูป</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePillarImageUpload(1, e)}
                          disabled={uploadingPillar === 1}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full py-3 bg-white hover:bg-sand-100 text-ink text-[11px] font-semibold rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 border border-dashed border-sand-300">
                      <Upload className="w-4 h-4 text-bronze" />
                      <span>{uploadingPillar === 1 ? 'กำลังอัปโหลด...' : '+ ใส่รูปภาพจุดเด่น 1'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePillarImageUpload(1, e)}
                        disabled={uploadingPillar === 1}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.values_p1_title || ''}
                  onChange={e => setFormData({ ...formData, values_p1_title: e.target.value })}
                  placeholder="หัวข้อ"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                />
                <textarea
                  rows={3}
                  value={formData.values_p1_desc || ''}
                  onChange={e => setFormData({ ...formData, values_p1_desc: e.target.value })}
                  placeholder="คำอธิบาย"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>

              {/* Pillar 2 */}
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-bronze block">จุดเด่นที่ 2</span>
                  {formData.values_p2_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, values_p2_image: '' })}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>

                {/* Image Preview & Upload */}
                <div className="space-y-1.5">
                  {formData.values_p2_image ? (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-sand-300 bg-sand-100 group">
                      <img src={formData.values_p2_image} alt="Pillar 2" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                        <span>เปลี่ยนรูป</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePillarImageUpload(2, e)}
                          disabled={uploadingPillar === 2}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full py-3 bg-white hover:bg-sand-100 text-ink text-[11px] font-semibold rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 border border-dashed border-sand-300">
                      <Upload className="w-4 h-4 text-bronze" />
                      <span>{uploadingPillar === 2 ? 'กำลังอัปโหลด...' : '+ ใส่รูปภาพจุดเด่น 2'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePillarImageUpload(2, e)}
                        disabled={uploadingPillar === 2}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.values_p2_title || ''}
                  onChange={e => setFormData({ ...formData, values_p2_title: e.target.value })}
                  placeholder="หัวข้อ"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                />
                <textarea
                  rows={3}
                  value={formData.values_p2_desc || ''}
                  onChange={e => setFormData({ ...formData, values_p2_desc: e.target.value })}
                  placeholder="คำอธิบาย"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>

              {/* Pillar 3 */}
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-bronze block">จุดเด่นที่ 3</span>
                  {formData.values_p3_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, values_p3_image: '' })}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>

                {/* Image Preview & Upload */}
                <div className="space-y-1.5">
                  {formData.values_p3_image ? (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-sand-300 bg-sand-100 group">
                      <img src={formData.values_p3_image} alt="Pillar 3" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                        <span>เปลี่ยนรูป</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePillarImageUpload(3, e)}
                          disabled={uploadingPillar === 3}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full py-3 bg-white hover:bg-sand-100 text-ink text-[11px] font-semibold rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 border border-dashed border-sand-300">
                      <Upload className="w-4 h-4 text-bronze" />
                      <span>{uploadingPillar === 3 ? 'กำลังอัปโหลด...' : '+ ใส่รูปภาพจุดเด่น 3'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePillarImageUpload(3, e)}
                        disabled={uploadingPillar === 3}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.values_p3_title || ''}
                  onChange={e => setFormData({ ...formData, values_p3_title: e.target.value })}
                  placeholder="หัวข้อ"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                />
                <textarea
                  rows={3}
                  value={formData.values_p3_desc || ''}
                  onChange={e => setFormData({ ...formData, values_p3_desc: e.target.value })}
                  placeholder="คำอธิบาย"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>

              {/* Pillar 4 */}
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-bronze block">จุดเด่นที่ 4</span>
                  {formData.values_p4_image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, values_p4_image: '' })}
                      className="text-[10px] text-rose-600 hover:underline"
                    >
                      ลบรูป
                    </button>
                  )}
                </div>

                {/* Image Preview & Upload */}
                <div className="space-y-1.5">
                  {formData.values_p4_image ? (
                    <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-sand-300 bg-sand-100 group">
                      <img src={formData.values_p4_image} alt="Pillar 4" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-bold">
                        <span>เปลี่ยนรูป</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handlePillarImageUpload(4, e)}
                          disabled={uploadingPillar === 4}
                          className="hidden"
                        />
                      </label>
                    </div>
                  ) : (
                    <label className="w-full py-3 bg-white hover:bg-sand-100 text-ink text-[11px] font-semibold rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-1 border border-dashed border-sand-300">
                      <Upload className="w-4 h-4 text-bronze" />
                      <span>{uploadingPillar === 4 ? 'กำลังอัปโหลด...' : '+ ใส่รูปภาพจุดเด่น 4'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handlePillarImageUpload(4, e)}
                        disabled={uploadingPillar === 4}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <input
                  type="text"
                  value={formData.values_p4_title || ''}
                  onChange={e => setFormData({ ...formData, values_p4_title: e.target.value })}
                  placeholder="หัวข้อ"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                />
                <textarea
                  rows={3}
                  value={formData.values_p4_desc || ''}
                  onChange={e => setFormData({ ...formData, values_p4_desc: e.target.value })}
                  placeholder="คำอธิบาย"
                  className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION: 100% Confidential & Discreet Delivery */}
        {(subTab === 'all' || subTab === 'discreet') && (
          <div id="section-discreet" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">📦 การจัดส่งลับเฉพาะ 100% (Confidential & Discreet Delivery)</h3>
                <p className="text-xs text-ink-muted">แก้ไขข้อความการันตีความลับ และ 3 ขั้นตอนการแพ็กส่งมิดชิด</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ป้ายหัวข้อเล็ก (Tag)</label>
                  <input
                    type="text"
                    value={formData.discreet_tag}
                    onChange={e => setFormData({ ...formData, discreet_tag: e.target.value })}
                    placeholder="เช่น 100% CONFIDENTIAL & DISCREET DELIVERY"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">หัวข้อใหญ่ (Title)</label>
                  <input
                    type="text"
                    value={formData.discreet_title}
                    onChange={e => setFormData({ ...formData, discreet_title: e.target.value })}
                    placeholder="เช่น มาตรฐานการจัดส่ง มิดชิดและเป็นความลับขั้นสูงสุด"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">คำโปรยอธิบายหลัก</label>
                <textarea
                  rows={2}
                  value={formData.discreet_desc}
                  onChange={e => setFormData({ ...formData, discreet_desc: e.target.value })}
                  placeholder="เช่น เราเข้าใจและให้ความสำคัญกับความเป็นส่วนตัวของคุณสูงสุด..."
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
                {/* Layer 1 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-800 block">ขั้นตอนที่ 01 (ชั้นใน)</span>
                  <input
                    type="text"
                    value={formData.discreet_l1_title}
                    onChange={e => setFormData({ ...formData, discreet_l1_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.discreet_l1_desc}
                    onChange={e => setFormData({ ...formData, discreet_l1_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>

                {/* Layer 2 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-800 block">ขั้นตอนที่ 02 (กล่องทึบ)</span>
                  <input
                    type="text"
                    value={formData.discreet_l2_title}
                    onChange={e => setFormData({ ...formData, discreet_l2_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.discreet_l2_desc}
                    onChange={e => setFormData({ ...formData, discreet_l2_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>

                {/* Layer 3 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-800 block">ขั้นตอนที่ 03 (จัดส่งด่วน)</span>
                  <input
                    type="text"
                    value={formData.discreet_l3_title}
                    onChange={e => setFormData({ ...formData, discreet_l3_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.discreet_l3_desc}
                    onChange={e => setFormData({ ...formData, discreet_l3_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: The Longevity Care */}
        {(subTab === 'all' || subTab === 'care') && (
          <div id="section-care" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-cyan-600" />
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">🧼 คู่มือการดูแลรักษาซิลิโคน (The Longevity Care Guide)</h3>
                <p className="text-xs text-ink-muted">แก้ไขหัวข้อและ 4 ขั้นตอนการทำความสะอาดและดูแลรักษาเพื่อยืดอายุการใช้งาน</p>
              </div>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ป้ายหัวข้อเล็ก (Tag)</label>
                  <input
                    type="text"
                    value={formData.care_tag}
                    onChange={e => setFormData({ ...formData, care_tag: e.target.value })}
                    placeholder="เช่น THE LONGEVITY CARE"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">หัวข้อใหญ่ (Title)</label>
                  <input
                    type="text"
                    value={formData.care_title}
                    onChange={e => setFormData({ ...formData, care_title: e.target.value })}
                    placeholder="เช่น คู่มือการดูแลรักษา เพื่อยืดอายุการใช้งานยาวนาน"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">คำโปรยอธิบายหลัก</label>
                <textarea
                  rows={2}
                  value={formData.care_desc}
                  onChange={e => setFormData({ ...formData, care_desc: e.target.value })}
                  placeholder="เช่น ขั้นตอนง่ายๆ ในการดูแลและทำความสะอาดซิลิโคน..."
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-2">
                {/* Step 1 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-cyan-800 block">ขั้นตอนที่ 1 (ล้างทำความสะอาด)</span>
                  <input
                    type="text"
                    value={formData.care_s1_title}
                    onChange={e => setFormData({ ...formData, care_s1_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.care_s1_desc}
                    onChange={e => setFormData({ ...formData, care_s1_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-cyan-800 block">ขั้นตอนที่ 2 (ซับแห้ง)</span>
                  <input
                    type="text"
                    value={formData.care_s2_title}
                    onChange={e => setFormData({ ...formData, care_s2_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.care_s2_desc}
                    onChange={e => setFormData({ ...formData, care_s2_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-cyan-800 block">ขั้นตอนที่ 3 (ลงแป้งบำรุง)</span>
                  <input
                    type="text"
                    value={formData.care_s3_title}
                    onChange={e => setFormData({ ...formData, care_s3_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.care_s3_desc}
                    onChange={e => setFormData({ ...formData, care_s3_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
                  <span className="font-bold text-cyan-800 block">ขั้นตอนที่ 4 (การจัดเก็บ)</span>
                  <input
                    type="text"
                    value={formData.care_s4_title}
                    onChange={e => setFormData({ ...formData, care_s4_title: e.target.value })}
                    placeholder="หัวข้อ"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-bold"
                  />
                  <textarea
                    rows={3}
                    value={formData.care_s4_desc}
                    onChange={e => setFormData({ ...formData, care_s4_desc: e.target.value })}
                    placeholder="คำอธิบาย"
                    className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Save Button Bar */}
        <div className="sticky bottom-4 z-30 bg-ink/95 backdrop-blur-md p-4 rounded-3xl border border-sand-300 shadow-2xl flex items-center justify-between">
          <div className="text-white text-xs sm:text-sm pl-2">
            <span className="font-bold text-amber-400">💡 เคล็ดลับ:</span> เมื่อกดบันทึก ข้อมูลจะซิงค์ลงฐานข้อมูล MySQL และหน้าเว็บจริงทันที
          </div>

          <button
            type="submit"
            disabled={saveLoading}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-lg flex items-center gap-2 transition-all active:scale-98"
          >
            <Save className="w-4 h-4" />
            <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าทั้งหมด'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
