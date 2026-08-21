import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Star, Image as ImageIcon } from 'lucide-react';

export default function ReviewModalForm({ review, onClose, onSave }) {
  const isEdit = !!review;

  const [formData, setFormData] = useState({
    id: null,
    name: '',
    model: '',
    rating: 5,
    date: new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' }),
    comment: '',
    image: '',
    images: [],
    verified: true
  });

  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    if (review) {
      let initialImages = [];
      if (Array.isArray(review.images) && review.images.length > 0) {
        initialImages = [...review.images];
      } else if (review.image) {
        initialImages = [review.image];
      }

      setFormData({
        ...review,
        rating: review.rating || 5,
        images: initialImages,
        image: review.image || initialImages[0] || '',
        verified: review.verified !== false
      });
    }
  }, [review]);

  // Upload Photo for Review
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const form = new FormData();
      form.append('image', file);
      form.append('type', 'review');
      form.append('is_review', '1');

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
            const updated = [...(prev.images || []), data.url];
            return {
              ...prev,
              images: updated,
              image: prev.image || data.url
            };
          });
        }
      } catch (err) {
        const localUrl = URL.createObjectURL(file);
        setFormData(prev => {
          const updated = [...(prev.images || []), localUrl];
          return {
            ...prev,
            images: updated,
            image: prev.image || localUrl
          };
        });
      }
    }

    setUploading(false);
  };

  // Add Image by URL
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setFormData(prev => {
      const updated = [...(prev.images || []), url];
      return {
        ...prev,
        images: updated,
        image: prev.image || url
      };
    });
    setNewImageUrl('');
  };

  // Delete Image
  const handleDeleteImage = (indexToDelete) => {
    setFormData(prev => {
      const updated = prev.images.filter((_, idx) => idx !== indexToDelete);
      return {
        ...prev,
        images: updated,
        image: updated[0] || ''
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) {
      alert('กรุณากรอกชื่อลูกค้าและข้อความรีวิว');
      return;
    }

    setSaveLoading(true);
    const finalData = {
      ...formData,
      image: formData.image || formData.images[0] || '',
      images: formData.images
    };
    await onSave(finalData);
    setSaveLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-sand-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between bg-sand-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>{isEdit ? `✏️ แก้ไขรีวิวลูกค้า: ${formData.name}` : '⭐ เพิ่มรีวิวลูกค้าใหม่'}</span>
            </h2>
            <p className="text-xs text-ink-muted">เพิ่มข้อความความประทับใจ คะแนนดาว และรูปภาพรีวิวจริงจากลูกค้า</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/60 hover:bg-sand-300 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          
          {/* Customer Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">ชื่อลูกค้า / จังหวัด *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="เช่น คุณ กิตติศักดิ์ (กรุงเทพฯ)"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-ink">รุ่นที่ลูกค้าสั่งซื้อ</label>
              <input
                type="text"
                value={formData.model}
                onChange={e => setFormData({ ...formData, model: e.target.value })}
                placeholder="เช่น SLC-134 น้องฟางหมิง หรือ HALF 28"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
          </div>

          {/* Rating & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">คะแนนความพึงพอใจ (ดาว)</label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`w-6 h-6 ${star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-sand-300'}`} />
                  </button>
                ))}
                <span className="text-xs font-bold text-ink ml-2">({formData.rating} ดาว)</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-ink">วันที่รีวิว</label>
              <input
                type="text"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                placeholder="เช่น 21 สิงหาคม 2569"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
          </div>

          {/* Review Comment */}
          <div className="space-y-1.5">
            <label className="font-semibold text-ink">ข้อความรีวิวจากลูกค้า *</label>
            <textarea
              required
              rows={4}
              value={formData.comment}
              onChange={e => setFormData({ ...formData, comment: e.target.value })}
              placeholder="พิมพ์ข้อความความประทับใจ การจัดส่ง สัมผัสสินค้า หรือการบริการของแอดมิน..."
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white leading-relaxed"
            />
          </div>

          {/* Review Photo Gallery */}
          <div className="space-y-3 p-4 bg-sand-50/70 border border-sand-200 rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-bold text-ink text-xs sm:text-sm">📸 รูปภาพรีวิวประกอบ (Review Photos)</label>
                <p className="text-[11px] text-ink-muted">อัปโหลดรูปภาพสินค้าจริงที่ลูกค้าส่งมารีวิว หรือรูปกล่องพัสดุ</p>
              </div>

              {/* Upload Button */}
              <label className="px-3.5 py-1.5 bg-ink text-white rounded-xl text-xs font-semibold cursor-pointer hover:bg-ink-soft transition-colors flex items-center gap-1.5 shrink-0 shadow-sm">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดรูป'}</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo List */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 pt-2">
              {formData.images?.map((img, index) => (
                <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border border-sand-300 bg-white shadow-2xs">
                  <img
                    src={img}
                    alt={`Review ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = '/favicon.png'; }}
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-600 text-white opacity-90 hover:opacity-100 hover:scale-105 transition-all shadow-sm"
                    title="ลบรูปนี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add by URL */}
              <div className="aspect-square rounded-xl border border-dashed border-sand-300 bg-white/60 p-2 flex flex-col justify-center items-center text-center gap-1">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={e => setNewImageUrl(e.target.value)}
                  placeholder="URL รูป..."
                  className="w-full px-1.5 py-0.5 bg-sand-50 border border-sand-200 rounded text-[9px]"
                />
                <button
                  type="button"
                  onClick={handleAddImageUrl}
                  className="w-full py-0.5 bg-sand-200 hover:bg-sand-300 text-ink text-[10px] font-semibold rounded transition-colors"
                >
                  + ใส่ URL
                </button>
              </div>
            </div>
          </div>

          {/* Verified Buyer Switch */}
          <div className="flex items-center justify-between p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div>
              <p className="font-bold text-emerald-900 text-xs sm:text-sm">✓ ตราประทับ "ยืนยันผู้ซื้อจริง"</p>
              <p className="text-[11px] text-emerald-700">แสดงสัญลักษณ์ Verified Buyer ให้ความน่าเชื่อถือ</p>
            </div>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, verified: !prev.verified }))}
              className={`w-12 h-7 rounded-full p-1 transition-colors ${formData.verified ? 'bg-emerald-600' : 'bg-sand-300'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${formData.verified ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-ink font-semibold text-xs sm:text-sm transition-colors border border-sand-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-2xl bg-ink hover:bg-ink-soft text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลรีวิว'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
