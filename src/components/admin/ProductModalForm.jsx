import React, { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, CheckCircle2, Image as ImageIcon, Star, Sparkles, Tag, DollarSign, Layers, Gift } from 'lucide-react';

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
    skinTone: 'ผิวขาว/สีขาวเหลือง',
    material: 'Pure Silicone + ปลูกผมและคิ้วเสมือนจริงเส้นต่อเส้น',
    skeleton: 'EVO Stainless-Steel 360° Articulated Frame',
    price: 'ติดต่อสอบถามทาง LINE',
    originalPrice: '',
    specialOption: '',
    gifts: 'ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร',
    isReadyToShip: false,
    orderIndex: 999,
    videoUrl: '',
    image: '',
    secondaryImage: '',
    gallery: []
  });

  const [uploading, setUploading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Safety guardrail: Check video size (Max 25MB for direct hosting)
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 25) {
      if (!window.confirm(`⚠️ ไฟล์วิดีโอนี้มีขนาด ${sizeInMB.toFixed(1)} MB ซึ่งอาจทำให้เปลืองพื้นที่โฮสติ้งและทำให้เว็บโหลดช้าลง\n\n💡 แนะนำ: ให้อัปโหลดขึ้น YouTube แบบ Unlisted แล้วนำลิงก์มาวาง จะโหลดเร็วกว่าและไม่เปลืองพื้นที่โฮสติ้งเลย\n\nคุณยังต้องการอัปโหลดไฟล์นี้ลงโฮสติ้งต่อไปหรือไม่?`)) {
        e.target.value = '';
        return;
      }
    }

    setUploadingVideo(true);
    const form = new FormData();
    form.append('video', file);
    form.append('code', formData.code || 'PROD');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, videoUrl: data.url }));
        alert('อัปโหลดวิดีโอตัวอย่างสินค้าสำเร็จ!');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
    } finally {
      setUploadingVideo(false);
    }
  };


  useEffect(() => {
    if (product) {
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
        image: product.image || initialGallery[0] || '',
        skinTone: product.skinTone || product.skin_tone || 'ผิวขาว/สีขาวเหลือง',
        material: product.material || 'Pure Silicone + ปลูกผมและคิ้วเสมือนจริงเส้นต่อเส้น',
        skeleton: product.skeleton || 'EVO Stainless-Steel 360° Articulated Frame',
        originalPrice: product.originalPrice || product.original_price || '',
        specialOption: product.specialOption || product.special_option || '',
        orderIndex: product.orderIndex ?? product.order_index ?? 999,
        videoUrl: product.videoUrl || product.video_url || '',
        gifts: product.gifts || 'ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม สัมผัสนุ่มลื่น, แป้งฝุ่นบำรุงผิว Silky Smooth Powder, เซ็ตอุปกรณ์ทำความสะอาดและดูแลรักษาครบวงจร'
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

  // Upload image to gallery
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);

    for (const file of files) {
      const form = new FormData();
      form.append('image', file);
      form.append('code', formData.code || 'PROD');
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
          setFormData(prev => {
            const updatedGallery = [...(prev.gallery || []), data.url];
            return {
              ...prev,
              gallery: updatedGallery,
              image: prev.image || data.url
            };
          });
        } else {
          alert(`⚠️ ไม่สามารถอัปโหลดรูปภาพ "${file.name}" ได้: ${data.message || 'โปรดลองใหม่อีกครั้ง'}`);
        }
      } catch (err) {
        alert(`⚠️ ไม่สามารถเชื่อมต่อกับระบบอัปโหลดสำหรับรูป "${file.name}"`);
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

  // Delete image
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

  // Set as main cover image
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
              <span>{isEdit ? `✏️ แก้ไขข้อมูลและสเปกสินค้า: ${formData.code}` : '✨ เพิ่มสินค้าใหม่'}</span>
            </h2>
            <p className="text-xs text-ink-muted">กรอกข้อมูลสเปก ราคา โปรโมชั่น ออฟชั่นเสริม และจัดการรูปภาพสินค้าได้ตามต้องการ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/60 hover:bg-sand-300 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
          
          {/* Section 1: Gallery Management */}
          <div className="space-y-3 p-4 bg-sand-50/70 border border-sand-200 rounded-3xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-bold text-ink text-xs sm:text-sm flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-bronze" />
                  <span>รูปภาพสินค้าทั้งหมด ({formData.gallery?.length || 0} รูป)</span>
                </label>
                <p className="text-[11px] text-ink-muted">
                  คลิกที่ดาว ⭐ เพื่อตั้งเป็นรูปภาพหน้าปก | กดไอคอน 🗑️ เพื่อลบรูปที่ไม่ต้องการออก
                </p>
              </div>

              {/* Upload Button */}
              <label className="px-4 py-2 bg-ink text-white rounded-2xl text-xs font-semibold cursor-pointer hover:bg-ink-soft transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'กำลังอัปโหลด...' : '+ อัปโหลดรูปเพิ่ม'}</span>
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

            {/* Gallery Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {formData.gallery?.map((imgUrl, index) => {
                const isMain = imgUrl === formData.image;
                return (
                  <div
                    key={index}
                    className={`group relative rounded-2xl overflow-hidden border-2 bg-white shadow-2xs transition-all ${
                      isMain ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-sand-300'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={imgUrl}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                        onError={e => { e.target.src = '/favicon.png'; }}
                      />
                      {isMain && (
                        <div className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 z-10">
                          <Star className="w-2.5 h-2.5 fill-white" /> ปกหลัก
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(index)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-md transition-all active:scale-90 z-10"
                        title="ลบรูปนี้ออก"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {!isMain && (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(imgUrl)}
                          className="absolute bottom-1.5 right-1.5 p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all active:scale-90 z-10 flex items-center gap-1 text-[10px] font-bold"
                          title="ตั้งเป็นรูปปกหลัก"
                        >
                          <Star className="w-3.5 h-3.5" /> ตั้งปก
                        </button>
                      )}
                    </div>
                    <div className="p-1.5 text-center text-[10px] text-ink-muted truncate px-2 bg-sand-50/50">
                      รูปที่ {index + 1} {isMain ? '⭐' : ''}
                    </div>
                  </div>
                );
              })}

              {/* Add by URL */}
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

                    {/* Section: Product Video (วิดีโอคลิปตัวอย่างสินค้า) */}
          <div className="p-4 bg-purple-50/60 border border-purple-200/70 rounded-3xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="font-bold text-purple-950 text-xs sm:text-sm flex items-center gap-1.5">
                  <span>🎬 วิดีโอตัวอย่างสินค้าจริง (Product Video Clip / YouTube)</span>
                </label>
                <p className="text-[11px] text-purple-800">
                  อัปโหลดไฟล์วิดีโอ (MP4/WebM) หรือวางลิงก์ YouTube เพื่อให้ลูกค้ากดดูวิดีโอเคลื่อนไหว 360° บนหน้าเว็บ
                </p>
              </div>

              <label className="px-4 py-2 bg-purple-800 text-white rounded-2xl text-xs font-semibold cursor-pointer hover:bg-purple-900 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingVideo ? 'กำลังอัปโหลดวิดีโอ...' : '+ อัปโหลดไฟล์วิดีโอ (MP4)'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/quicktime"
                  onChange={handleVideoUpload}
                  disabled={uploadingVideo}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted">หรือวางลิงก์ URL วิดีโอ (แนะนำ: ลิงก์ YouTube / TikTok / MP4):</label>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="เช่น https://www.youtube.com/watch?v=... หรือ https://youtu.be/..."
                className="w-full px-3.5 py-2 bg-white border border-purple-300 rounded-xl text-xs focus:outline-none focus:border-purple-600 font-mono"
              />
            </div>

            <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 space-y-1">
              <p className="font-bold flex items-center gap-1">💡 แนะนำวิธีประหยัดพื้นที่โฮสติ้ง 100%:</p>
              <p>
                อัปโหลดคลิปขึ้น <strong>YouTube</strong> ของคุณ โดยตั้งค่าเป็น <strong>"ไม่เป็นสาธารณะ (Unlisted)"</strong> แล้วก๊อปลิงก์มาวางในช่องนี้ จะช่วยให้วิดีโอเล่นลื่นระดับ 4K โหลดไวมาก และ <strong>ไม่กินพื้นที่โฮสต์เลยแม้แต่ 1 MB ครับ!</strong>
              </p>
            </div>

            {formData.videoUrl && (
              <div className="p-2 bg-white rounded-xl border border-purple-200 flex items-center justify-between text-xs">
                <span className="text-purple-900 font-semibold truncate max-w-md">▶ มีวิดีโอ: {formData.videoUrl}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, videoUrl: '' })}
                  className="text-rose-600 hover:text-rose-800 font-semibold px-2 py-0.5"
                >
                  ลบวิดีโอออก
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Basic Info (Code, Name, Series) */}
          <div className="space-y-4">
            <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-sand-200 pb-2">
              <span>📖 ข้อมูลหลักของสินค้า (Basic Information)</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">รหัสสินค้า (Code) *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  placeholder="เช่น HALF - 01 หรือ SLC-134"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink">ชื่อสินค้า / ชื่อโมเดล *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น Half Doll แบบครึ่งตัว 24 กิโลกรัม หรือ น้องฟางหมิง"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-ink">ซีรีส์สินค้า (Series / Subtitle)</label>
                <input
                  type="text"
                  value={formData.series}
                  onChange={e => setFormData({ ...formData, series: e.target.value })}
                  placeholder="เช่น รุ่นครึ่งตัว 24 กิโลกรัม หรือ ตุ๊กตายางพรีเมียม รุ่น Amber Luxury"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">📌 ลำดับการแสดงผล (Order)</label>
                <input
                  type="number"
                  value={formData.orderIndex}
                  onChange={e => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 999 })}
                  placeholder="เช่น 1, 2, 3 (เลขน้อยขึ้นก่อน)"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Pricing, Promotions & Special Options */}
          <div className="space-y-4 p-4 bg-amber-50/40 border border-amber-200/60 rounded-3xl">
            <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2 border-b border-amber-200 pb-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              <span>💰 ราคา โปรโมชั่น และออฟชั่นเสริม (Pricing & Options)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">⭐ ราคาพิเศษ / ราคาโปรโมชั่น</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })}
                  placeholder="เช่น 12,900.- หรือ ติดต่อสอบถามทาง LINE"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl font-bold text-emerald-800 focus:outline-none focus:border-bronze"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">ราคาเต็มปกติ (ก่อนลด)</label>
                <input
                  type="text"
                  value={formData.originalPrice}
                  onChange={e => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="เช่น 15,900.-"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl text-ink-muted focus:outline-none focus:border-bronze"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">📋 ออฟชั่นเสริมพิเศษ</label>
                <input
                  type="text"
                  value={formData.specialOption}
                  onChange={e => setFormData({ ...formData, specialOption: e.target.value })}
                  placeholder="เช่น เพิ่มออฟชั่นอกนุ่มพิเศษ +1,000.-"
                  className="w-full px-3.5 py-2.5 bg-white border border-sand-300 rounded-xl text-ink-soft focus:outline-none focus:border-bronze"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Physical Specs (Height, Weight, Bust, Skin Tone, Material, Skeleton) */}
          <div className="space-y-4">
            <h3 className="font-bold text-ink text-sm flex items-center gap-2 border-b border-sand-200 pb-2">
              <Layers className="w-4 h-4 text-bronze" />
              <span>📐 ข้อมูลสเปกความพรีเมียม (Specifications)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">🧍‍♀️ ส่วนสูง (Height)</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={e => setFormData({ ...formData, height: e.target.value })}
                  placeholder="เช่น 85 เซนติเมตร หรือ 165 cm"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">⚖️ น้ำหนัก (Weight)</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={e => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="เช่น 24 กิโลกรัม หรือ 35 kg"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">👩 สีผิว (Skin Tone)</label>
                <input
                  type="text"
                  value={formData.skinTone}
                  onChange={e => setFormData({ ...formData, skinTone: e.target.value })}
                  placeholder="เช่น ผิวขาว/สีขาวเหลือง หรือ ผิวขาวอมชมพู"
                  className="w-full px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-ink">🧴 วัสดุเนื้อผิวตุ๊กตา</label>
                <input
                  type="text"
                  value={formData.material}
                  onChange={e => setFormData({ ...formData, material: e.target.value })}
                  placeholder="เช่น เนื้อยาง TPE หรือ Pure Silicone"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-ink">🦴 โครงสร้างข้อต่อ (Skeleton & Articulation)</label>
                <input
                  type="text"
                  value={formData.skeleton}
                  onChange={e => setFormData({ ...formData, skeleton: e.target.value })}
                  placeholder="เช่น EVO Stainless-Steel 360° Articulated Frame"
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Gifts & Collector Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink text-xs sm:text-sm flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-bronze" />
              <span>🎁 เซ็ตของขวัญ / ของแถมระดับพรีเมียม (Free Gifts)</span>
            </label>
            <textarea
              rows={2}
              value={formData.gifts}
              onChange={e => setFormData({ ...formData, gifts: e.target.value })}
              placeholder="เช่น ชุดแฟชั่นสั่งตัดตามสไตล์โมเดล, วิกผมเกรดพรีเมียม, แป้งฝุ่นบำรุงผิว Silky Smooth, เซ็ตอุปกรณ์ทำความสะอาดครบวงจร"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white leading-relaxed"
            />
          </div>

          {/* Section 6: Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink text-xs sm:text-sm">📝 รายละเอียดสินค้าเพิ่มเติม (Description)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="พิมพ์จุดเด่น ฟีเจอร์พิเศษ หรือคำแนะนำเพิ่มเติมสำหรับสินค้ารุ่นนี้..."
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs focus:outline-none focus:border-bronze focus:bg-white leading-relaxed"
            />
          </div>

          {/* Section 7: Ready To Ship Switch */}
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

          {/* Section 8: Category Checkboxes */}
          <div className="space-y-2">
            <label className="font-semibold text-ink">📂 เลือกหมวดหมู่ที่ต้องการให้สินค้าชิ้นนี้ไปแสดงผล:</label>
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

          {/* Sticky Bottom Actions */}
          <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm py-2">
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
              <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลและรูปภาพสินค้า'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
