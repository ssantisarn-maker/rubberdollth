import React, { useState } from 'react';
import { X, Upload, Video, Image as ImageIcon, Save, CheckCircle2, AlertCircle, Play } from 'lucide-react';

export default function OptionModalForm({ option, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: option?.id || '',
    name: option?.name || '',
    price: option?.price !== undefined ? option.price : 0,
    condition: option?.condition || option?.condition_text || '',
    details: option?.details || option?.details_text || '',
    image: option?.image || '',
    video_url: option?.video_url || '',
    target_material: option?.target_material || 'all',
    is_active: option?.is_active !== undefined ? option.is_active : 1,
    order_index: option?.order_index !== undefined ? option.order_index : 0
  });

  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingVid, setUploadingVid] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImg(true);
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
        alert(data.error || 'อัปโหลดรูปภาพไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setUploadingImg(false);
    }
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingVid(true);
    const form = new FormData();
    form.append('video', file);
    form.append('code', 'OPTION');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/upload.php', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      const data = await res.json();
      if (data.success && data.url) {
        setFormData(prev => ({ ...prev, video_url: data.url }));
      } else {
        alert(data.error || 'อัปโหลดวิดีโอไม่สำเร็จ');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
    } finally {
      setUploadingVid(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMsg('กรุณาระบุชื่อออฟชั่น');
      return;
    }

    setSaveLoading(true);
    setErrorMsg('');

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/options.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        onSave(data.options || formData);
        onClose();
      } else {
        setErrorMsg(data.error || 'บันทึกข้อมูลไม่สำเร็จ');
      }
    } catch (err) {
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-sand-300 my-8 animate-in fade-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-sand-50 p-5 sm:p-6 border-b border-sand-200 flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>✨</span>
              <span>{option ? 'แก้ไขออฟชั่นเสริม' : 'เพิ่มออฟชั่นเสริมใหม่'}</span>
            </h3>
            <p className="text-xs text-ink-muted">จัดการชื่อออฟชั่น ราคา เงื่อนไข รูปภาพ และวิดีโอสาธิต</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-sand-200 rounded-full transition-colors text-ink-muted hover:text-ink cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Option Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink">
              ชื่อออฟชั่น <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="เช่น 👩 ออฟชั่นผมปลูก+ปลูกคิ้ว สำหรับหัวซิลิโคน 👩"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs sm:text-sm font-semibold text-ink"
            />
          </div>

          {/* 2. Price & Order Index & Material */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                ราคาบวกเพิ่ม (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="5500"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs sm:text-sm font-bold text-emerald-700 font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                ใช้ได้กับเนื้อวัสดุใด
              </label>
              <select
                value={formData.target_material}
                onChange={e => setFormData({ ...formData, target_material: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs font-semibold text-ink"
              >
                <option value="all">🌐 ใช้ได้ทุกรุ่น (ทั้งซิลิโคนและ TPE)</option>
                <option value="silicone">💖 เฉพาะหัวซิลิโคน / ตัวซิลิโคน</option>
                <option value="tpe">🧍‍♀ เฉพาะตัวเนื้อยาง TPE</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                ลำดับแสดงผล (Order)
              </label>
              <input
                type="number"
                min="0"
                value={formData.order_index}
                onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                placeholder="1"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs font-mono"
              />
            </div>
          </div>

          {/* 3. Condition Text & Details */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                เงื่อนไขกำกับ (Condition / Note)
              </label>
              <input
                type="text"
                value={formData.condition}
                onChange={e => setFormData({ ...formData, condition: e.target.value })}
                placeholder="เช่น 💗 สำหรับหัวซิลิโคนเท่านั้น 💗 หรือ 💗สำหรับ TPE เท่านั้น💗"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs text-ink"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink">
                รายละเอียด / ข้อดีเพิ่มเติม (Details / Benefits)
              </label>
              <textarea
                rows={2}
                value={formData.details}
                onChange={e => setFormData({ ...formData, details: e.target.value })}
                placeholder="เช่น 🌟 ข้อดี ง่ายต่อการทำความสะอาด 🌟 หรือ ❤️ รายละเอียด ❤️ - จะมีความร้อนทั้งตัวยกเว้น หัว มือ และ เท้า"
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white text-xs text-ink leading-relaxed"
              />
            </div>
          </div>

          {/* 4. Media Section: Image Upload & Preview */}
          <div className="p-4 bg-sand-50 border border-sand-300 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-bronze" />
                <span>รูปภาพตัวอย่างออฟชั่น (Option Photo)</span>
              </span>
              {formData.image && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, image: '' })}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  ลบรูปภาพ
                </button>
              )}
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="px-4 py-2.5 bg-white hover:bg-sand-100 text-ink text-xs font-bold rounded-xl cursor-pointer transition-all border border-sand-300 flex items-center gap-2 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-bronze" />
                <span>{uploadingImg ? 'กำลังอัปโหลด...' : '📸 อัปโหลดรูปภาพ'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImg}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                  placeholder="หรือวาง URL รูปภาพ เช่น /images/products/... หรือ https://..."
                  className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {formData.image && (
              <div className="w-32 h-24 bg-black/5 rounded-xl overflow-hidden border border-sand-300 relative group">
                <img
                  src={formData.image}
                  alt="Option Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = '/logo.png'; }}
                />
              </div>
            )}
          </div>

          {/* 5. Media Section: Video Upload & Preview */}
          <div className="p-4 bg-sand-50 border border-sand-300 rounded-2xl space-y-3">
            <label className="text-xs font-bold text-ink flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Video className="w-4 h-4 text-purple-600" />
                <span>วิดีโอสาธิตการทำงาน (Option Demo Video)</span>
              </span>
              {formData.video_url && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, video_url: '' })}
                  className="text-[11px] text-rose-600 hover:underline"
                >
                  ลบวิดีโอ
                </button>
              )}
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="px-4 py-2.5 bg-white hover:bg-sand-100 text-ink text-xs font-bold rounded-xl cursor-pointer transition-all border border-sand-300 flex items-center gap-2 shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                <span>{uploadingVid ? 'กำลังอัปโหลด...' : '🎬 อัปโหลดไฟล์วิดีโอ (MP4)'}</span>
                <input
                  type="file"
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  disabled={uploadingVid}
                  className="hidden"
                />
              </label>

              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={e => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="หรือวางลิงก์ YouTube, Shorts, Drive, MP4"
                  className="w-full px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            {formData.video_url && (
              <div className="p-2.5 bg-white rounded-xl border border-sand-300 flex items-center gap-2 text-xs text-purple-700 font-semibold">
                <Play className="w-4 h-4 shrink-0 fill-purple-600 text-purple-600" />
                <span className="truncate">{formData.video_url}</span>
              </div>
            )}
          </div>

          {/* 6. Active Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-sand-50 rounded-2xl border border-sand-200">
            <div>
              <div className="text-xs font-bold text-ink">เปิดใช้งานออฟชั่นนี้</div>
              <div className="text-[11px] text-ink-muted">หากปิด ออฟชั่นนี้จะไม่แสดงบนหน้าต่างสินค้า</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active === 1}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-sand-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-sand-300 text-ink-muted hover:bg-sand-100 text-xs font-bold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-98 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกออฟชั่น'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
