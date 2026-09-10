import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, DollarSign, Sparkles, Check, CheckCircle2 } from 'lucide-react';

export default function CustomSpecModalForm({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  groups = [],
  activeGroupId = 'wig'
}) {
  const [formData, setFormData] = useState({
    name: '',
    group_id: activeGroupId,
    price: 0,
    isFree: true,
    image: '',
    description: '',
    is_default: 0,
    is_active: 1,
    order_index: 0
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        group_id: initialData.group_id || activeGroupId,
        price: Number(initialData.price) || 0,
        isFree: !initialData.price || Number(initialData.price) === 0,
        image: initialData.image || '',
        description: initialData.description || '',
        is_default: initialData.is_default ? 1 : 0,
        is_active: initialData.is_active !== undefined ? initialData.is_active : 1,
        order_index: initialData.order_index || 0
      });
    } else {
      setFormData({
        name: '',
        group_id: activeGroupId,
        price: 0,
        isFree: true,
        image: '',
        description: '',
        is_default: 0,
        is_active: 1,
        order_index: 0
      });
    }
    setError(null);
  }, [initialData, activeGroupId, isOpen]);

  if (!isOpen) return null;

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);

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
        setFormData(prev => ({ ...prev, image: data.url }));
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      // Local fallback blob
      const localUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: localUrl }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('กรุณากรอกชื่อตัวเลือก');
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      price: formData.isFree ? 0 : (Number(formData.price) || 0)
    };
    delete payload.isFree;

    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sand-300 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-sand-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                {initialData ? 'แก้ไขตัวเลือกสเปก' : 'เพิ่มตัวเลือกสเปกใหม่'}
              </h3>
              <p className="text-xs text-neutral-400">
                กำหนดชื่อตัวเลือก, ราคาฟรี/คิดเงินเพิ่ม และภาพตัวอย่าง
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs sm:text-sm">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Group Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink flex items-center gap-1.5">
              <span>หัวข้อสเปก (Category)</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.group_id}
              onChange={e => setFormData({ ...formData, group_id: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze focus:bg-white"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>
                  {g.icon} {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Option Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink flex items-center gap-1.5">
              <span>ชื่อตัวเลือก (Choice Name)</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น ผมยาวลอน สีดำธรรมชาติ หรือ คัพ D นุ่มพิเศษ"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          {/* Pricing Mode: Free vs Paid */}
          <div className="p-3.5 bg-sand-50 rounded-2xl border border-sand-200 space-y-3">
            <label className="font-bold text-ink block">
              💰 รูปแบบการคิดราคา (Pricing)
            </label>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFree: true, price: 0 })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  formData.isFree
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-ink border-sand-300 hover:bg-sand-100'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>🟢 ฟรี (รวมในค่าตัว)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, isFree: false })}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  !formData.isFree
                    ? 'bg-amber-500 text-neutral-950 border-amber-500 shadow-sm'
                    : 'bg-white text-ink border-sand-300 hover:bg-sand-100'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>🟠 คิดเงินเพิ่ม (+฿)</span>
              </button>
            </div>

            {!formData.isFree && (
              <div className="pt-2 space-y-1.5 animate-in fade-in">
                <label className="font-semibold text-xs text-ink">
                  จำนวนเงินที่ต้องเพิ่ม (บาท)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-bronze">฿</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="เช่น 1200"
                    className="w-full pl-8 pr-3.5 py-2.5 bg-white border border-sand-300 rounded-xl font-bold text-ink focus:outline-none focus:border-bronze"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-ink-muted">.- บาท</span>
                </div>
              </div>
            )}
          </div>

          {/* Example Image Upload / URL */}
          <div className="space-y-2">
            <label className="font-bold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-bronze" />
                <span>รูปภาพตัวอย่าง (Example Image Preview)</span>
              </span>
              <span className="text-[11px] font-normal text-ink-muted">(ไม่บังคับ)</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={formData.image}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                placeholder="วางลิงก์รูปภาพ /images/... หรือ https://... หรือกดอัปโหลดด้านขวา"
                className="flex-1 px-3.5 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white truncate"
              />
              <label className="py-2 px-3 rounded-xl bg-sand-100 hover:bg-sand-200 border border-sand-300 text-ink text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                <Upload className="w-3.5 h-3.5 text-bronze" />
                <span>{uploadingImage ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {/* Preview Box */}
            {formData.image && (
              <div className="relative w-full h-32 bg-sand-100 rounded-2xl border border-sand-200 overflow-hidden flex items-center justify-center group">
                <img
                  src={formData.image}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-rose-600 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="ลบรูปภาพ"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink">
              คำอธิบายสั้นๆ (Description)
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="เช่น สไตล์ญี่ปุ่น สัมผัสนุ่มลื่นเป็นธรรมชาติ"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          {/* Order Index */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink flex items-center justify-between">
              <span>ลำดับการแสดงผล (Order Index)</span>
              <span className="text-[11px] font-normal text-ink-muted">(เลขน้อยจะขึ้นก่อนในดรอปดาวน์)</span>
            </label>
            <input
              type="number"
              min="0"
              value={formData.order_index}
              onChange={e => setFormData({ ...formData, order_index: Number(e.target.value) || 0 })}
              placeholder="0"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          {/* Default Option & Active Toggle */}
          <div className="pt-2 border-t border-sand-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-xl border border-sand-200 cursor-pointer hover:bg-sand-100/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_default === 1}
                onChange={e => setFormData({ ...formData, is_default: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 text-emerald-600 rounded border-sand-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-ink block">ตั้งเป็นค่าเริ่มต้น</span>
                <span className="text-[10px] text-ink-muted block">ถูกเลือกทันทีที่เปิดดูสินค้า</span>
              </div>
            </label>

            <label className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-xl border border-sand-200 cursor-pointer hover:bg-sand-100/70 transition-colors">
              <input
                type="checkbox"
                checked={formData.is_active === 1}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 text-emerald-600 rounded border-sand-300 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="min-w-0">
                <span className="text-xs font-bold text-ink block">เปิดใช้งาน (Active)</span>
                <span className="text-[10px] text-ink-muted block">แสดงให้ลูกค้าเลือกบนเว็บ</span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-sand-200 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-sand-300 text-ink-muted hover:text-ink hover:bg-sand-100 font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow transition-all active:scale-98 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{initialData ? 'บันทึกการแก้ไข' : 'บันทึกตัวเลือกใหม่'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
