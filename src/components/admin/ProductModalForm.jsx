import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon, Star, Sparkles } from 'lucide-react';

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
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (product) {
      // Collect all images into gallery array
      let initialGallery = [];
      if (Array.isArray(product.gallery) && product.gallery.length > 0) {
        initialGallery = [...product.gallery];
      } else if (product.image) {
        initialGallery = [product.image];
        if (product.secondaryImage && product.secondaryImage !== product.image) {
          initialGallery.push(product.secondaryImage);
        }
      }

      setFormData({
        ...product,
        categories: product.categories || ['all'],
        gallery: initialGallery,
        image: product.image || initialGallery[0] || ''
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

  // Upload new image and add to gallery
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const form = new FormData();
      form.append('image', file);
      form.append('code', formData.code || 'PRODUCT');
      form.append('type', 'gallery');

      try {
        const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
        const res = await fetch('/api/upload.php', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: form
        });
        const data = await res.json();
        if (data.success && data.url) {
          setFormData(prev => {
            const updatedGallery = [...(prev.gallery || []), data.url];
            return {
              ...prev,
              gallery: updatedGallery,
              image: prev.image || data.url
            };
          });
        }
      } catch (err) {
        // Offline / preview fallback
        const localUrl = URL.createObjectURL(file);
        setFormData(prev => {
          const updatedGallery = [...(prev.gallery || []), localUrl];
          return {
            ...prev,
            gallery: updatedGallery,
            image: prev.image || localUrl
          };
        });
      }
    }

    setUploading(false);
  };

  // Add image by URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setFormData(prev => {
      const updatedGallery = [...(prev.gallery || []), url];
      return {
        ...prev,
        gallery: updatedGallery,
        image: prev.image || url
      };
    });
    setNewImageUrl('');
  };

  // Delete image from gallery
  const handleDeleteImage = (indexToDelete) => {
    setFormData(prev => {
      const updatedGallery = prev.gallery.filter((_, idx) => idx !== indexToDelete);
      const isDeletedMain = prev.gallery[indexToDelete] === prev.image;
      return {
        ...prev,
        gallery: updatedGallery,
        image: isDeletedMain ? (updatedGallery[0] || '') : prev.image
      };
    });
  };

  // Set as Main Image
  const handleSetMainImage = (url) => {
    setFormData(prev => ({
      ...prev,
      image: url
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('กรุณากรอกรหัสและชื่อสินค้า');
      return;
    }

    setSaveLoading(true);
    let finalCategories = Array.isArray(formData.categories) ? [...formData.categories] : ['all'];
    if (formData.isReadyToShip && !finalCategories.includes('ready')) {
      finalCategories.push('ready');
    } else if (!formData.isReadyToShip) {
      finalCategories = finalCategories.filter(c => c !== 'ready');
    }

    const finalData = {
      ...formData,
      categories: finalCategories,
      image: formData.image || formData.gallery[0] || '',
      secondaryImage: formData.gallery[1] || formData.image || '',
      totalAngles: formData.gallery.length
    };
    await onSave(finalData);
    setSaveLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-sand-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between bg-sand-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>{isEdit ? `✏️ แก้ไขข้อมูลและรูปภาพสินค้า: ${formData.code}` : '✨ เพิ่มสินค้าใหม่'}</span>
            </h2>
            <p className="text-xs text-ink-muted">จัดการสเปก ติ๊กเลือกหมวดหมู่ และเลือกลบหรือเพิ่มรูปภาพสินค้าได้ตามต้องการ</p>
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
          
          {/* Section 1: Product Images Gallery (High Priority) */}
          <div className="bg-sand-50 p-4 sm:p-5 rounded-3xl border border-sand-200 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-bronze" />
                  <span>รูปภาพสินค้าทั้งหมด ({formData.gallery?.length || 0} รูป)</span>
                </h3>
                <p className="text-[11px] text-ink-muted">
                  คลิกที่ดาว ⭐ เพื่อตั้งเป็นรูปภาพหลัก | กดไอคอน 🗑️ เพื่อลบรูปที่ไม่ต้องการออก
                </p>
              </div>

              {/* Upload Button */}
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-ink hover:bg-ink-soft text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all active:scale-98">
                <Upload className="w-3.5 h-3.5 text-bronze" />
                <span>{uploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดรูปเพิ่ม'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {formData.gallery?.map((imgUrl, index) => {
                const isMain = imgUrl === formData.image;
                return (
                  <div
                    key={index}
                    className={`relative group rounded-2xl overflow-hidden border-2 bg-white shadow-2xs transition-all ${
                      isMain ? 'border-bronze ring-2 ring-bronze/20' : 'border-sand-300 hover:border-sand-400'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-square bg-sand-100 relative">
                      <img
                        src={imgUrl}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = '/favicon.png'; }}
                      />

                      {/* Main Badge */}
                      {isMain && (
                        <div className="absolute top-1.5 left-1.5 bg-ink/90 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm backdrop-blur-xs">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>รูปหลัก</span>
                        </div>
                      )}

                      {/* Action Overlay */}
                      <div className="absolute inset-0 bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                        {!isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(imgUrl)}
                            className="p-2 rounded-xl bg-white text-ink hover:bg-amber-100 hover:text-amber-700 shadow-md transition-colors"
                            title="ตั้งเป็นรูปภาพหลัก"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          className="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
                          title="ลบรูปนี้ออก"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Footer bar */}
                    <div className="p-1.5 text-center text-[10px] text-ink-muted truncate px-2 bg-sand-50/50">
                      รูปที่ {index + 1} {isMain ? '⭐' : ''}
                    </div>
                  </div>
                );
              })}

              {/* Add by URL box */}
              <div className="aspect-square rounded-2xl border-2 border-dashed border-sand-300 bg-white/60 p-2.5 flex flex-col justify-center items-center text-center gap-1.5 hover:border-bronze hover:bg-amber-50/30 transition-all">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="วาง URL รูป..."
                  className="w-full px-2 py-1 bg-sand-50 border border-sand-200 rounded-lg text-[10px]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="w-full py-1 bg-sand-200 hover:bg-sand-300 text-ink text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>เพิ่ม URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Basic Info (Code & Name) */}
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

          {/* Section 3: Series & Price */}
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

          {/* Section 4: Physical Specs */}
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

          {/* Section 5: Ready To Ship Switch */}
          <div className="flex items-center justify-between p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div>
              <p className="font-bold text-emerald-900 text-xs sm:text-sm">📦 สถานะสินค้าพร้อมส่งในไทย (Ready to Ship)</p>
              <p className="text-[11px] text-emerald-700">เปิดสวิตช์นี้เมื่อมีสินค้าในสต็อกไทย พร้อมจัดส่งด่วน 1-2 วัน</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, isReadyToShip: !prev.isReadyToShip }))}
              className={`w-14 h-8 rounded-full p-1 transition-colors ${formData.isReadyToShip ? 'bg-emerald-600' : 'bg-sand-300'}`}
            >
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${formData.isReadyToShip ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Section 6: Category Checkboxes */}
          <div className="space-y-2">
            <label className="font-semibold text-ink">เลือกหมวดหมู่ที่ต้องการให้สินค้าชิ้นนี้ไปแสดงผล:</label>
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

          {/* Section 7: Description */}
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
            className="px-6 py-2.5 rounded-xl bg-ink hover:bg-ink-soft text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลและรูปภาพ'}
          </button>
        </div>

      </div>
    </div>
  );
}
