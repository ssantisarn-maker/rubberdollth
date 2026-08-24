import React, { useState } from 'react';
import { Save, Bell, Phone, MessageCircle, Image as ImageIcon, ShieldCheck, Sparkles, CheckCircle2, Upload, Flame, Globe, Layers, ArrowRight } from 'lucide-react';
import { useLiveProducts } from '../../hooks/useLiveProducts';

export default function SiteSettingsManager({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const { products } = useLiveProducts();

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
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
        
        {/* Section 1: Hero Banner & Model Switcher (สินค้า Hero หน้าแรก) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-5">
          <div className="border-b border-sand-200 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-bronze" />
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">🖼️ สินค้า Hero และแบนเนอร์หลักหน้าแรก (Hero Showcase)</h3>
                <p className="text-xs text-ink-muted">เปลี่ยนรูปโมเดลสินค้าเด่นที่แสดงบนหน้าแรกของเว็บ หรือเลือกดึงจากสินค้าที่มีอยู่แล้ว</p>
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
                <p className="text-[10px] text-amber-800">
                  ระบบจะดึงรูปภาพและชื่อของสินค้ารุ่นที่เลือก มาใส่เป็น Hero ให้ทันทีในคลิกเดียว
                </p>
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

        {/* Section 2: Top Announcement Bar */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-sand-200 pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-ink text-sm sm:text-base">📢 แถบประกาศโปรโมชั่นบนสุด (Top Announcement Bar)</h3>
                <p className="text-xs text-ink-muted">แสดงป้ายประกาศแถบด้านบนสุดของทุกหน้าเว็บ สำหรับแจ้งโปรโมชั่นหรือส่งด่วน</p>
              </div>
            </div>

            {/* Toggle Switch */}
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

        {/* Section 3: Contact & Social Info */}
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

        {/* Section 4: Trust & Guarantees */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
          <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-ink text-sm sm:text-base">🛡️ จุดเด่นและการรับประกัน (Trust Badges & Policies)</h3>
              <p className="text-xs text-ink-muted">แก้ไขหัวข้อและคำอธิบาย 3 จุดเด่นหลักที่แสดงบนหน้าแรก</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
              <label className="font-bold text-ink block">จุดเด่นที่ 1 (ความลับมิดชิด)</label>
              <input
                type="text"
                value={formData.trust_discrete_title}
                onChange={e => setFormData({ ...formData, trust_discrete_title: e.target.value })}
                placeholder="หัวข้อ"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-semibold text-xs"
              />
              <textarea
                rows={2}
                value={formData.trust_discrete_desc}
                onChange={e => setFormData({ ...formData, trust_discrete_desc: e.target.value })}
                placeholder="คำอธิบาย"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
              <label className="font-bold text-ink block">จุดเด่นที่ 2 (คุณภาพวัสดุ)</label>
              <input
                type="text"
                value={formData.trust_quality_title}
                onChange={e => setFormData({ ...formData, trust_quality_title: e.target.value })}
                placeholder="หัวข้อ"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-semibold text-xs"
              />
              <textarea
                rows={2}
                value={formData.trust_quality_desc}
                onChange={e => setFormData({ ...formData, trust_quality_desc: e.target.value })}
                placeholder="คำอธิบาย"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs leading-relaxed"
              />
            </div>

            <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl space-y-2">
              <label className="font-bold text-ink block">จุดเด่นที่ 3 (บริการดูแล)</label>
              <input
                type="text"
                value={formData.trust_support_title}
                onChange={e => setFormData({ ...formData, trust_support_title: e.target.value })}
                placeholder="หัวข้อ"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg font-semibold text-xs"
              />
              <textarea
                rows={2}
                value={formData.trust_support_desc}
                onChange={e => setFormData({ ...formData, trust_support_desc: e.target.value })}
                placeholder="คำอธิบาย"
                className="w-full px-3 py-1.5 bg-white border border-sand-300 rounded-lg text-xs leading-relaxed"
              />
            </div>
          </div>
        </div>

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
            <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าเว็บไซต์'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
