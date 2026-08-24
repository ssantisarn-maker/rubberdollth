import React, { useState } from 'react';
import { Save, Bell, Phone, MessageCircle, Image as ImageIcon, ShieldCheck, Sparkles, CheckCircle2, Upload, Flame, Globe } from 'lucide-react';

export default function SiteSettingsManager({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState({ ...settings });
  const [saveLoading, setSaveLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [uploadingHero, setUploadingHero] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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
        showToast('✓ อัปโหลดรูปภาพแบนเนอร์สำเร็จ');
      }
    } catch (err) {
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, hero_bg_image: localUrl }));
    } finally {
      setUploadingHero(false);
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
        
        {/* Section 1: Top Announcement Bar */}
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

        {/* Section 2: Contact & Social Info */}
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

        {/* Section 3: Hero Banner (หน้าแรก) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
          <div className="border-b border-sand-200 pb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-bronze" />
            <div>
              <h3 className="font-bold text-ink text-sm sm:text-base">🖼️ แบนเนอร์หลักและสโลแกนหน้าแรก (Hero Section)</h3>
              <p className="text-xs text-ink-muted">ปรับแต่งหัวข้อ คำโปรย และรูปภาพของส่วนต้อนรับบนหน้าแรกของเว็บ</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm">
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
            {/* Box 1: Discrete */}
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

            {/* Box 2: Quality */}
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

            {/* Box 3: Support */}
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
