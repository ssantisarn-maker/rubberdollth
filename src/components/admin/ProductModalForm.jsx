import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function ProductModalForm({ product, categories, onClose, onSave }) {
  const isEdit = !!product;
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    series: 'ตุ๊กตายาง RBD Luxury',
    description: '',
    category: 'ตุ๊กตาซิลิโคน สาวสวยหน้าตาแนวเอเชีย',
    categories: ['all', 'asian'],
    height: '160 cm',
    weight: '35 kg',
    bust: 'คัพ C สรีระสมจริง',
    price: 'ติดต่อสอบถามทาง LINE',
    isReadyToShip: false,
    image: '',
    secondaryImage: '',
    gallery: []
  });

  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        ...product,
        categories: product.categories || ['all'],
        gallery: product.gallery || [product.image]
      });
    }
  }, [product]);

  const handleCategoryToggle = (catId) => {
    setFormData(prev => {
      const current = prev.categories || [];
      if (current.includes(catId)) {
        return { ...prev, categories: current.filter(c => c !== catId) };
      } else {
        return { ...prev, categories: [...current, catId] };
      }
    });
  };

  const handleImageUpload = async (e, targetField = 'image') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append('image', file);
    form.append('code', formData.code || 'PRODUCT');
    form.append('type', targetField);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (targetField === 'image') {
          setFormData(prev => ({ ...prev, image: data.url, secondaryImage: prev.secondaryImage || data.url }));
        } else if (targetField === 'gallery') {
          setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), data.url] }));
        }
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }
    } catch (err) {
      // Offline fallback: create local object URL
      const localUrl = URL.createObjectURL(file);
      if (targetField === 'image') {
        setFormData(prev => ({ ...prev, image: localUrl }));
      } else {
        setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), localUrl] }));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    await onSave(formData);
    setSaveLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-sand-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between bg-sand-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>{isEdit ? `✏️ แก้ไขสินค้า: ${formData.code}` : '✨ เพิ่มสินค้าใหม่'}</span>
            </h2>
            <p className="text-xs text-ink-muted">กรอกข้อมูลและสเปกสินค้าให้ครบถ้วนเพื่อแสดงผลบนหน้าเว็บ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/60 hover:bg-sand-300 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">รหัสรุ่นสินค้า (Code) *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={e => setFormData({ ...formData, code: e.target.value })}
                placeholder="เช่น HALF-27 หรือ SLC-131"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">ชื่อสินค้า / ชื่อโมเดล *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น น้องยูกิ (Yuki)"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
          </div>

          {/* Row 2: Series & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">ซีรีส์สินค้า (Series)</label>
              <input
                type="text"
                value={formData.series}
                onChange={e => setFormData({ ...formData, series: e.target.value })}
                placeholder="เช่น ตุ๊กตายาง RBD Luxury"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">ราคา (Price)</label>
              <input
                type="text"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                placeholder="เช่น ติดต่อสอบถามทาง LINE หรือ ฿29,900"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
          </div>

          {/* Row 3: Specs (Height, Weight, Bust) */}
          <div className="grid grid-cols-3 gap-3 bg-sand-50 p-4 rounded-2xl border border-sand-200">
            <div className="space-y-1">
              <label className="font-semibold text-ink text-[11px]">ส่วนสูง (Height)</label>
              <input
                type="text"
                value={formData.height}
                onChange={e => setFormData({ ...formData, height: e.target.value })}
                placeholder="160 cm"
                className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-ink text-[11px]">น้ำหนัก (Weight)</label>
              <input
                type="text"
                value={formData.weight}
                onChange={e => setFormData({ ...formData, weight: e.target.value })}
                placeholder="35 kg"
                className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-ink text-[11px]">ขนาดหน้าอก (Bust)</label>
              <input
                type="text"
                value={formData.bust}
                onChange={e => setFormData({ ...formData, bust: e.target.value })}
                placeholder="คัพ C"
                className="w-full px-2.5 py-1.5 bg-white border border-sand-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Ready To Ship Toggle */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div>
              <p className="font-bold text-emerald-900 text-xs sm:text-sm">📦 สินค้าพร้อมส่งในไทย (Ready to Ship)</p>
              <p className="text-[11px] text-emerald-700">เปิดเมื่อมีสินค้าพร้อมจัดส่งด่วน 1-2 วันในไทย</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isReadyToShip: !prev.isReadyToShip }))}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.isReadyToShip ? 'bg-emerald-600' : 'bg-sand-300'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formData.isReadyToShip ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-ink">เลือกหมวดหมู่ที่สินค้าชิ้นนี้ควรไปแสดง:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.filter(c => c.id !== 'reviews').map(c => {
                const isSelected = formData.categories?.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleCategoryToggle(c.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition-all ${
                      isSelected ? 'bg-ink text-white border-ink font-semibold' : 'bg-sand-50 border-sand-200 text-ink hover:bg-sand-100'
                    }`}
                  >
                    <span>{c.label_th || c.label}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-bronze" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-ink">รายละเอียดสินค้า (Description)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="รายละเอียดสรีระ, โครงสร้าง, วัสดุซิลิโคน..."
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          {/* Main Image Upload & Preview */}
          <div className="space-y-2">
            <label className="font-semibold text-ink">รูปภาพหลักสินค้า (Main Image)</label>
            <div className="flex items-center gap-4">
              {formData.image ? (
                <img src={formData.image} alt="Main Preview" className="w-20 h-20 object-cover rounded-xl border border-sand-300 shadow-2xs" />
              ) : (
                <div className="w-20 h-20 bg-sand-100 rounded-xl flex items-center justify-center border border-sand-300 text-ink-muted text-xs">
                  ไม่มีรูป
                </div>
              )}
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/images/products/example.webp หรือ URL รูปภาพ"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs"
                />
                <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-sand-200 hover:bg-sand-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูปจากเครื่อง'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, 'image')} />
                </label>
              </div>
            </div>
          </div>

        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-sand-200 bg-sand-50/80 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-sand-300 text-ink hover:bg-sand-200 text-xs font-semibold transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveLoading}
            className="px-6 py-2.5 rounded-xl bg-ink hover:bg-ink-soft text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            {saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลสินค้า'}
          </button>
        </div>

      </div>
    </div>
  );
}
