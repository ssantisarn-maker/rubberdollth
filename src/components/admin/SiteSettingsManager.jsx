import React, { useState, useEffect } from 'react';
import { Save, Bell, Phone, MessageCircle, Image as ImageIcon, ShieldCheck, Sparkles, CheckCircle2, Upload, Flame, Globe, Layers, ArrowRight, Lock, HeartHandshake, Droplets, MessageSquareQuote, Share2 } from 'lucide-react';
import { useLiveProducts } from '../../hooks/useLiveProducts';

export default function SiteSettingsManager({ settings, onUpdateSettings, subTab = 'all' }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingPillar, setUploadingPillar] = useState(null);
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [uploadingSpotlight, setUploadingSpotlight] = useState(false);
  const [uploadingSpotlightVideo, setUploadingSpotlightVideo] = useState(false);
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

  // Upload Spotlight Image
  const handleSpotlightImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSpotlight(true);
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
        setFormData(prev => ({ ...prev, spotlight_image: data.url }));
        showToast('✓ อัปโหลดรูปภาพไฮไลท์สำเร็จ');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, spotlight_image: localUrl }));
    } finally {
      setUploadingSpotlight(false);
    }
  };

  // Upload Spotlight Video
  const handleSpotlightVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingSpotlightVideo(true);
    const form = new FormData();
    form.append('video', file);
    form.append('code', 'SPOTLIGHT');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, spotlight_video_url: data.url }));
        showToast('✓ อัปโหลดวิดีโอไฮไลท์สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
    } finally {
      setUploadingSpotlightVideo(false);
    }
  };

  // 1-Click Select Model for Spotlight
  const handleSelectProductAsSpotlight = (prodCode) => {
    const selected = products.find(p => p.code === prodCode);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        spotlight_enabled: true,
        spotlight_title: `MODEL SPOTLIGHT: ${selected.code} ${selected.name}`,
        spotlight_subtitle: selected.description || `${selected.name} ${selected.series || ''} สัมผัสนุ่มละมุนเสมือนผิวจริง 100% Medical Silicone พร้อมส่งทันทีในไทย`,
        spotlight_price: selected.price || 'ติดต่อสอบถามทาง LINE',
        spotlight_original_price: selected.originalPrice || selected.original_price || '',
        spotlight_image: selected.image || (selected.gallery && selected.gallery[0]) || '',
        spotlight_video_url: selected.videoUrl || selected.video_url || '',
        spotlight_specs_height: selected.height || '160 cm',
        spotlight_specs_weight: selected.weight || '35 kg',
        spotlight_specs_bust: selected.bust || 'คัพ C สมจริง',
        spotlight_specs_skin: selected.skinTone || selected.skin_tone || 'ผิวขาวอมชมพู นุ่มเสมือนคนจริง'
      }));
      showToast(`✓ ดึงข้อมูล [${selected.code}] ${selected.name} เข้ากล่องไฮไลท์สำเร็จ!`);
    }
  };

  // Upload Social Share / OG Preview Image
  const handleOgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOgImage(true);
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
        setFormData(prev => ({ ...prev, seo_og_image: data.url }));
        showToast('✓ อัปโหลดรูปภาพตัวอย่างแชร์ลิงก์ (LINE/Social Preview) สำเร็จ');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, seo_og_image: localUrl }));
    } finally {
      setUploadingOgImage(false);
    }
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
        
        {/* SECTION: Typography & Font Sizing */}
        {(subTab === 'all' || subTab === 'typography') && (
          <div id="section-typography" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-6">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔤</span>
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">ปรับแต่งขนาดตัวอักษรทั้งเว็บไซต์ (Website Typography & Font Scale)</h3>
                  <p className="text-xs text-ink-muted">ปรับขนาดตัวหนังสือทั่วทั้งเว็บให้อ่านง่าย ชัดเจน และลดพื้นที่ว่างที่โล่งเกินไป</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                formData.font_size_scale === 'normal' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-sand-200 hover:border-sand-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-ink">1. ขนาดมาตรฐาน (Normal)</span>
                  <input
                    type="radio"
                    name="font_size_scale"
                    value="normal"
                    checked={formData.font_size_scale === 'normal'}
                    onChange={() => setFormData({ ...formData, font_size_scale: 'normal' })}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  ขนาดตัวอักษร 14.5px เหมาะสำหรับจอขนาดเล็ก หรือชอบความกะทัดรัด
                </p>
                <div className="text-xs p-2.5 rounded-lg bg-white border border-sand-200 font-sans">
                  ตัวอย่าง: ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวจริง
                </div>
              </label>

              <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                (formData.font_size_scale === 'large' || !formData.font_size_scale) ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-sand-200 hover:border-sand-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-ink">2. ขนาดใหญ่ ชัดเจน (Large - แนะนำ) 🌟</span>
                  <input
                    type="radio"
                    name="font_size_scale"
                    value="large"
                    checked={formData.font_size_scale === 'large' || !formData.font_size_scale}
                    onChange={() => setFormData({ ...formData, font_size_scale: 'large' })}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  ขนาดตัวอักษร 16px อ่านสบายตา คมชัดทุกรายละเอียด กระชับพื้นที่
                </p>
                <div className="text-sm p-2.5 rounded-lg bg-white border border-sand-200 font-sans font-medium">
                  ตัวอย่าง: ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวจริง
                </div>
              </label>

              <label className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                formData.font_size_scale === 'xlarge' ? 'border-amber-500 bg-amber-50/50 shadow-sm' : 'border-sand-200 hover:border-sand-300'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-sm text-ink">3. ขนาดใหญ่พิเศษ (Extra Large)</span>
                  <input
                    type="radio"
                    name="font_size_scale"
                    value="xlarge"
                    checked={formData.font_size_scale === 'xlarge'}
                    onChange={() => setFormData({ ...formData, font_size_scale: 'xlarge' })}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-xs text-ink-muted leading-relaxed">
                  ขนาดตัวอักษร 17.5px ตัวหนังสือใหญ่เต็มตา ชัดเจนทุกมุมมอง
                </p>
                <div className="text-base p-2.5 rounded-lg bg-white border border-sand-200 font-sans font-semibold">
                  ตัวอย่าง: ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวจริง
                </div>
              </label>
            </div>
          </div>
        )}

        {/* SECTION: Spotlight Ready-to-Ship Showcase */}
        {(subTab === 'all' || subTab === 'spotlight') && (
          <div id="section-spotlight" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-6">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚡</span>
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">⚡ กล่องไฮไลท์สินค้าพร้อมส่งพิเศษ (Spotlight Ready-to-Ship Showcase)</h3>
                  <p className="text-xs text-ink-muted">กล่องไฮไลท์ขนาดใหญ่ที่จะแสดงต่อจากหน้า Hero สามารถเปิด-ปิด และใส่รูป/วิดีโอ/สเปก/ราคาพิเศษได้ตามต้องการ</p>
                </div>
              </div>

              {/* Master Toggle ON/OFF */}
              <div className="flex items-center gap-3 bg-sand-50 px-3.5 py-1.5 rounded-2xl border border-sand-200">
                <span className="text-xs font-bold text-ink">
                  {formData.spotlight_enabled ? '🟢 เปิดแสดงไฮไลท์' : '⚪ ปิดไฮไลท์'}
                </span>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, spotlight_enabled: !prev.spotlight_enabled }))}
                  className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                    formData.spotlight_enabled ? 'bg-emerald-600' : 'bg-sand-300'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.spotlight_enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>

            {/* 1-Click Select Model from 70 products */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <span>⚡ เลือกดึงข้อมูลสินค้าจาก 70 รุ่นมาลงกล่องไฮไลท์ 1-Click:</span>
                </span>
                <span className="text-[11px] text-amber-700">ระบบจะใส่รูป, สเปก, ราคา, และคำบรรยายให้อัตโนมัติ</span>
              </div>
              <select
                onChange={e => handleSelectProductAsSpotlight(e.target.value)}
                defaultValue=""
                className="w-full px-3.5 py-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-ink focus:outline-none cursor-pointer shadow-xs"
              >
                <option value="" disabled>-- คลิกเลือกโมเดลที่ต้องการนำมาทำเป็น Spotlight --</option>
                {products.map(p => (
                  <option key={p.code} value={p.code}>
                    [{p.code}] {p.name} {p.isReadyToShip ? '⚡ (พร้อมส่งในไทย)' : ''} - {p.price || 'ติดต่อสอบถาม'}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-xs sm:text-sm">
              
              {/* Media Settings (Left 5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-ink">รูปภาพเด่น (Spotlight Image)</label>
                  <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-sand-200 border border-sand-300 relative group">
                    <img
                      src={formData.spotlight_image || formData.hero_bg_image || '/favicon.png'}
                      alt="Spotlight Preview"
                      className="w-full h-full object-cover object-top"
                      onError={e => { e.target.src = '/favicon.png'; }}
                    />
                    <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-bold">
                      <Upload className="w-4 h-4 mr-1.5" />
                      <span>{uploadingSpotlight ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปไฮไลท์'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSpotlightImageUpload}
                        disabled={uploadingSpotlight}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <input
                    type="text"
                    value={formData.spotlight_image || ''}
                    onChange={e => setFormData({ ...formData, spotlight_image: e.target.value })}
                    placeholder="หรือใส่ URL รูปภาพ https://..."
                    className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">ลิงก์วิดีโอตัวอย่างสินค้า (YouTube / MP4 / Drive)</label>
                  <input
                    type="text"
                    value={formData.spotlight_video_url || ''}
                    onChange={e => setFormData({ ...formData, spotlight_video_url: e.target.value })}
                    placeholder="เช่น https://youtu.be/... หรือ https://www.youtube.com/shorts/..."
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                  />
                  <p className="text-[10px] text-ink-muted">💡 รองรับทั้งลิงก์คลิปสั้น YouTube Shorts, YouTube ปกติ และไฟล์วิดีโอตรง</p>
                </div>
              </div>

              {/* Text & Specs Settings (Right 7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">ข้อความป้าย Badge บนสุด</label>
                  <input
                    type="text"
                    value={formData.spotlight_badge || ''}
                    onChange={e => setFormData({ ...formData, spotlight_badge: e.target.value })}
                    placeholder="เช่น ⚡ สินค้าไฮไลท์พร้อมส่งด่วนในไทย (1-2 วันรับของทันที)"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">หัวข้อสินค้าไฮไลท์ (Spotlight Title) *</label>
                  <input
                    type="text"
                    value={formData.spotlight_title || ''}
                    onChange={e => setFormData({ ...formData, spotlight_title: e.target.value })}
                    placeholder="เช่น MODEL SPOTLIGHT: SLC-108 น้องมิยู สไตล์ญี่ปุ่น อกคัพ C"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">รายละเอียดและจุดเด่น (Subtitle / Description)</label>
                  <textarea
                    rows={3}
                    value={formData.spotlight_subtitle || ''}
                    onChange={e => setFormData({ ...formData, spotlight_subtitle: e.target.value })}
                    placeholder="สัมผัสนุ่มละมุนเสมือนผิวจริง 100% Medical Silicone..."
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-ink">ราคาพิเศษ (Price)</label>
                    <input
                      type="text"
                      value={formData.spotlight_price || ''}
                      onChange={e => setFormData({ ...formData, spotlight_price: e.target.value })}
                      placeholder="เช่น 18,900 บาท หรือ ติดต่อสอบถาม"
                      className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl font-bold text-emerald-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-ink">ราคาเดิม (Original Price)</label>
                    <input
                      type="text"
                      value={formData.spotlight_original_price || ''}
                      onChange={e => setFormData({ ...formData, spotlight_original_price: e.target.value })}
                      placeholder="เช่น 25,000 บาท"
                      className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-ink-muted line-through"
                    />
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-muted">ส่วนสูง</label>
                    <input
                      type="text"
                      value={formData.spotlight_specs_height || ''}
                      onChange={e => setFormData({ ...formData, spotlight_specs_height: e.target.value })}
                      placeholder="160 cm"
                      className="w-full px-2.5 py-1.5 bg-sand-50 border border-sand-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-muted">น้ำหนัก</label>
                    <input
                      type="text"
                      value={formData.spotlight_specs_weight || ''}
                      onChange={e => setFormData({ ...formData, spotlight_specs_weight: e.target.value })}
                      placeholder="35 kg"
                      className="w-full px-2.5 py-1.5 bg-sand-50 border border-sand-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-muted">หน้าอก</label>
                    <input
                      type="text"
                      value={formData.spotlight_specs_bust || ''}
                      onChange={e => setFormData({ ...formData, spotlight_specs_bust: e.target.value })}
                      placeholder="คัพ C"
                      className="w-full px-2.5 py-1.5 bg-sand-50 border border-sand-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-ink-muted">สีผิว</label>
                    <input
                      type="text"
                      value={formData.spotlight_specs_skin || ''}
                      onChange={e => setFormData({ ...formData, spotlight_specs_skin: e.target.value })}
                      placeholder="ผิวขาวอมชมพู"
                      className="w-full px-2.5 py-1.5 bg-sand-50 border border-sand-300 rounded-lg text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="font-semibold text-ink">ข้อความบนปุ่มสั่งซื้อ LINE</label>
                  <input
                    type="text"
                    value={formData.spotlight_cta_text || ''}
                    onChange={e => setFormData({ ...formData, spotlight_cta_text: e.target.value })}
                    placeholder="เช่น 💬 สั่งซื้อรุ่นนี้ทันทีทาง LINE"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-emerald-800"
                  />
                </div>

              </div>

            </div>
          </div>
        )}

        {/* SECTION: Modal Headings & Gifts Customization */}
        {(subTab === 'all' || subTab === 'modal_content') && (
          <div id="section-modal-content" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-6">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">ปรับแต่งหัวข้อสเปก & กล่องของขวัญ (Product Modal Customization)</h3>
                  <p className="text-xs text-ink-muted">แก้ไขข้อความหัวข้อสเปก, ของแถม, และการจัดส่งที่แสดงในหน้าต่างรายละเอียดสินค้า</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">1. หัวข้อข้อมูลสเปกสินค้า</label>
                <input
                  type="text"
                  value={formData.modal_specs_title || ''}
                  onChange={e => setFormData({ ...formData, modal_specs_title: e.target.value })}
                  placeholder="เช่น 📐 ข้อมูลสเปกความพรีเมียม (SPECIFICATIONS)"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">2. หัวข้อกล่องของขวัญและของแถม</label>
                <input
                  type="text"
                  value={formData.modal_gifts_title || ''}
                  onChange={e => setFormData({ ...formData, modal_gifts_title: e.target.value })}
                  placeholder="เช่น 🎁 THE LUXURY COLLECTOR BOX (เซ็ตของขวัญระดับพรีเมียม)"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink">3. รายการของแถมเริ่มต้น (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
                <textarea
                  rows={2}
                  value={formData.modal_gifts_default || ''}
                  onChange={e => setFormData({ ...formData, modal_gifts_default: e.target.value })}
                  placeholder="ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink">4. หัวข้อมาตรฐานการจัดส่งลับเฉพาะ</label>
                <input
                  type="text"
                  value={formData.modal_delivery_title || ''}
                  onChange={e => setFormData({ ...formData, modal_delivery_title: e.target.value })}
                  placeholder="เช่น 🔒 มาตรฐานการจัดส่งลับเฉพาะ 100% (100% Confidential Delivery)"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              {/* Product Card Button Text Customization */}
              <div className="sm:col-span-2 pt-3 border-t border-sand-200 space-y-3">
                <span className="font-bold text-ink text-xs sm:text-sm block">🔘 ปรับแต่งคำพูดบนปุ่มกดที่การ์ดสินค้าและหน้าต่างป๊อปอัป</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">คำพูดบนปุ่มเปิดดูสเปก (ที่การ์ดสินค้า) *</label>
                    <input
                      type="text"
                      value={formData.card_specs_btn_text || ''}
                      onChange={e => setFormData({ ...formData, card_specs_btn_text: e.target.value })}
                      placeholder="เช่น สเปก & กล่องของขวัญ หรือ รายละเอียดสินค้า"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">คำพูดบนปุ่มสั่งซื้อ LINE (ที่การ์ดสินค้า) *</label>
                    <input
                      type="text"
                      value={formData.card_order_btn_text || ''}
                      onChange={e => setFormData({ ...formData, card_order_btn_text: e.target.value })}
                      placeholder="เช่น สั่งซื้อ หรือ สั่งด่วน LINE"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-emerald-800 focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">คำพูดบนปุ่มดูรูปด่วนเมื่อชี้เมาส์ (Quick View)</label>
                    <input
                      type="text"
                      value={formData.card_quickview_btn_text || ''}
                      onChange={e => setFormData({ ...formData, card_quickview_btn_text: e.target.value })}
                      placeholder="เช่น ดูสเปก & แกลเลอรีเต็ม"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-ink">คำพูดบนปุ่มสั่งซื้อใหญ่ในหน้าต่างสินค้า (Modal CTA)</label>
                    <input
                      type="text"
                      value={formData.modal_cta_btn_text || ''}
                      onChange={e => setFormData({ ...formData, modal_cta_btn_text: e.target.value })}
                      placeholder="เช่น 💬 สั่งซื้อ / สอบถามรุ่นนี้แบบ Private LINE"
                      className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-emerald-800 focus:outline-none focus:border-bronze focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Social Share & LINE Link Preview (Open Graph / SEO) */}
        {(subTab === 'all' || subTab === 'social_share') && (
          <div id="section-social-share" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-6">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">🌐 ตั้งค่าการแชร์ลิงก์ & LINE Preview (Social Share / Open Graph)</h3>
                  <p className="text-xs text-ink-muted">กำหนดข้อความหัวข้อ, คำบรรยาย, และรูปภาพที่จะแสดงในกล่องพรีวิวเวลาส่งลิงก์เว็บให้ลูกค้าใน LINE, Facebook หรือ Messenger</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Col: Live LINE Chat Bubble Preview */}
              <div className="lg:col-span-5 space-y-3">
                <label className="font-bold text-ink text-xs flex items-center gap-1.5">
                  <span>📱 ตัวอย่างกล่องข้อความเวลาส่งใน LINE (Live Preview)</span>
                </label>

                {/* LINE Preview Bubble Mockup */}
                <div className="bg-[#849EB8] p-4 rounded-2xl shadow-inner flex flex-col items-end space-y-2">
                  <div className="bg-[#A7E26B] text-ink text-xs px-3 py-1.5 rounded-2xl rounded-tr-none font-medium shadow-2xs">
                    https://rubberdollth.com
                  </div>

                  {/* Open Graph Card Bubble */}
                  <div className="w-full max-w-[280px] bg-white rounded-2xl overflow-hidden shadow-md border border-black/10">
                    <div className="aspect-[16/9] w-full bg-sand-200 relative overflow-hidden group">
                      <img
                        src={formData.seo_og_image || formData.hero_bg_image || "/logo.png"}
                        alt="OG Preview"
                        className="w-full h-full object-cover"
                        onError={e => { e.target.src = '/logo.png'; }}
                      />
                      <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[11px] font-bold">
                        <span>เปลี่ยนรูปพรีวิว</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleOgImageUpload}
                          disabled={uploadingOgImage}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="p-3 bg-[#FFF3F5] space-y-1">
                      <h4 className="font-bold text-xs text-ink line-clamp-2 leading-snug">
                        {formData.seo_og_title || 'RUBBER DOLL THAILAND | ผู้นำเข้าตุ๊กตายางซิลิโคนแท้เกรดพรีเมียมอันดับ 1'}
                      </h4>
                      <p className="text-[11px] text-ink-muted line-clamp-2 leading-tight font-light">
                        {formData.seo_og_desc || 'ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวคนจริง การันตีจัดส่งมิดชิด 100% ไร้ชื่อสินค้าหน้ากล่อง'}
                      </p>
                      <span className="text-[9px] text-gray-400 block pt-0.5">rubberdollth.com</span>
                    </div>
                  </div>
                </div>

                <label className="w-full px-4 py-2.5 bg-sand-100 hover:bg-sand-200 text-ink text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 border border-sand-300">
                  <Upload className="w-4 h-4 text-bronze" />
                  <span>{uploadingOgImage ? 'กำลังอัปโหลดรูปพรีวิว...' : '📸 อัปโหลดรูปภาพตัวอย่างแชร์ลิงก์'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOgImageUpload}
                    disabled={uploadingOgImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Right Col: Fields */}
              <div className="lg:col-span-7 space-y-4 text-xs sm:text-sm">
                <div className="space-y-1.5">
                  <label className="font-semibold text-ink flex items-center justify-between">
                    <span>1. หัวข้อตอนส่งลิงก์ (Social Title)</span>
                    <span className="text-[10px] text-ink-muted">แนะนำไม่เกิน 60-70 ตัวอักษร</span>
                  </label>
                  <input
                    type="text"
                    value={formData.seo_og_title || ''}
                    onChange={e => setFormData({ ...formData, seo_og_title: e.target.value })}
                    placeholder="เช่น RUBBER DOLL THAILAND | ผู้นำเข้าตุ๊กตายางซิลิโคนแท้เกรดพรีเมียมอันดับ 1"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-bold text-ink"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink flex items-center justify-between">
                    <span>2. คำบรรยายใต้ลิงก์ (Social Description)</span>
                    <span className="text-[10px] text-ink-muted">แสดง 1-2 บรรทัดใน LINE</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formData.seo_og_desc || ''}
                    onChange={e => setFormData({ ...formData, seo_og_desc: e.target.value })}
                    placeholder="เช่น ตุ๊กตายางซิลิโคนเกรดการแพทย์ 100% สัมผัสนุ่มเสมือนผิวคนจริง โครงสร้างสแตนเลส 360° การันตีจัดส่งมิดชิด 100% ไร้ชื่อสินค้าหน้ากล่อง"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-ink">3. หรือวางลิงก์รูปภาพปกโดยตรง (Image URL)</label>
                  <input
                    type="text"
                    value={formData.seo_og_image || ''}
                    onChange={e => setFormData({ ...formData, seo_og_image: e.target.value })}
                    placeholder="เช่น https://rubberdollth.com/images/... หรือ /images/..."
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION: Reviews Header */}
        {(subTab === 'all' || subTab === 'reviews_header') && (
          <div id="section-reviews-header" className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
            <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquareQuote className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="font-bold text-ink text-sm sm:text-base">⭐ ปรับแต่งหัวข้อหมวดรีวิวลูกค้า (Customer Reviews Header)</h3>
                  <p className="text-xs text-ink-muted">แก้ไขป้ายแท็กบนสุด, หัวข้อหลัก และข้อความการันตีเรตติ้ง 5.0 ในส่วนแสดงรีวิวของหน้าแรก</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">1. ป้ายข้อความเล็กบนสุด (Review Tag)</label>
                <input
                  type="text"
                  value={formData.reviews_tag || ''}
                  onChange={e => setFormData({ ...formData, reviews_tag: e.target.value })}
                  placeholder="เช่น VERIFIED CUSTOMER STORIES"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-bold text-bronze uppercase"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink">2. หัวข้อหลักของหมวดรีวิว (Review Main Title)</label>
                <input
                  type="text"
                  value={formData.reviews_title || ''}
                  onChange={e => setFormData({ ...formData, reviews_title: e.target.value })}
                  placeholder="เช่น เสียงตอบรับและความประทับใจจากลูกค้าตัวจริง"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-bold text-ink"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="font-semibold text-ink">3. ข้อความเรตติ้งใต้ดาว (Rating Badge Text)</label>
                <input
                  type="text"
                  value={formData.reviews_rating_text || ''}
                  onChange={e => setFormData({ ...formData, reviews_rating_text: e.target.value })}
                  placeholder="เช่น 5.0 / 5.0 (รีวิวลูกค้าจริง 100%)"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs font-semibold text-ink"
                />
              </div>
            </div>
          </div>
        )}

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
                  <label className="font-semibold text-ink">อีเมลสำหรับติดต่อ (Contact Email)</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="เช่น contact@rubberdollth.com"
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

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-ink">เวลาทำการและรอบจัดส่ง</label>
                  <input
                    type="text"
                    value={formData.business_hours}
                    onChange={e => setFormData({ ...formData, business_hours: e.target.value })}
                    placeholder="เช่น เปิดบริการทุกวัน 24 ชม. (จัดส่งด่วนทุกวัน)"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="font-semibold text-ink">ข้อความการันตีจัดส่งมิดชิดบนแถบประกาศบนสุด (Shipping Guarantee Text)</label>
                  <input
                    type="text"
                    value={formData.shipping_announcement_text || ''}
                    onChange={e => setFormData({ ...formData, shipping_announcement_text: e.target.value })}
                    placeholder="เช่น การันตีจัดส่งมิดชิด 100% กล่องทึบ 2 ชั้น ไร้ชื่อร้าน/ชื่อสินค้าหน้ากล่องเด็ดขาด"
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
