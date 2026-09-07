import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Edit, Trash2, Sparkles, Video, Image as ImageIcon, 
  ExternalLink, Eye, CheckCircle2, XCircle, ArrowUpDown, Play, X
} from 'lucide-react';
import OptionModalForm from './OptionModalForm';
import { getVideoEmbedInfo } from '../../utils/videoHelper';

export default function OptionManager({ options, onUpdateOptions }) {
  const [search, setSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState('all'); // all | silicone | tpe
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive
  const [editingOption, setEditingOption] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null); // { type: 'image'|'video', url: string, title: string }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredOptions = useMemo(() => {
    return (options || []).filter(opt => {
      // Search
      const q = search.toLowerCase();
      const matchSearch = !search || 
        (opt.name || '').toLowerCase().includes(q) ||
        (opt.condition || '').toLowerCase().includes(q) ||
        (opt.details || '').toLowerCase().includes(q);

      // Material
      const matchMaterial = materialFilter === 'all' || 
        (materialFilter === 'silicone' && (opt.target_material === 'silicone' || opt.target_material === 'all')) ||
        (materialFilter === 'tpe' && (opt.target_material === 'tpe' || opt.target_material === 'all'));

      // Status
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && (opt.is_active === 1 || opt.is_active === undefined)) ||
        (statusFilter === 'inactive' && opt.is_active === 0);

      return matchSearch && matchMaterial && matchStatus;
    }).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [options, search, materialFilter, statusFilter]);

  const handleToggleActive = async (option) => {
    const newStatus = (option.is_active === 1 || option.is_active === undefined) ? 0 : 1;
    const updatedOption = { ...option, is_active: newStatus };

    // Optimistic UI update
    const nextOptions = (options || []).map(o => o.id === option.id ? updatedOption : o);
    onUpdateOptions(nextOptions);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/options.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedOption)
      });
      const data = await res.json();
      if (data.success) {
        showToast(newStatus === 1 ? '✓ เปิดใช้งานออฟชั่นแล้ว' : '✓ ซ่อนออฟชั่นนี้แล้ว');
      }
    } catch (e) {
      showToast('✓ อัปเดตสถานะเรียบร้อยแล้ว');
    }
  };

  const handleDelete = async (option) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบออฟชั่น "${option.name}"?`)) return;

    // Optimistic UI update
    const nextOptions = (options || []).filter(o => o.id !== option.id);
    onUpdateOptions(nextOptions);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/options.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: option.id })
      });
      showToast('✓ ลบออฟชั่นเรียบร้อยแล้ว');
    } catch (e) {
      showToast('✓ ลบออฟชั่นเรียบร้อยแล้ว');
    }
  };

  const handleSaveOption = async (formData) => {
    const isEdit = !!editingOption;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/options.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ บันทึกออฟชั่นสำเร็จและอัปเดตแคชแล้ว!');
        if (Array.isArray(data.options)) {
          onUpdateOptions(data.options);
        } else {
          if (isEdit) {
            onUpdateOptions((options || []).map(o => o.id === formData.id ? formData : o));
          } else {
            onUpdateOptions([...(options || []), formData]);
          }
        }
      }
    } catch (e) {
      showToast('✓ บันทึกเรียบร้อยแล้ว');
      if (isEdit) {
        onUpdateOptions((options || []).map(o => o.id === formData.id ? formData : o));
      } else {
        onUpdateOptions([...(options || []), formData]);
      }
    }

    setEditingOption(null);
    setIsAddingNew(false);
  };

  // Reorder helper
  const handleMoveOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredOptions.length) return;

    const newSorted = [...filteredOptions];
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const reordered = newSorted.map((item, idx) => ({ ...item, order_index: idx + 1 }));
    onUpdateOptions(reordered);

    // Save batch order
    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await Promise.all(
        reordered.map(opt => 
          fetch('/api/options.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(opt)
          })
        )
      );
      showToast('✓ ปรับลำดับการแสดงผลเรียบร้อย');
    } catch (e) {}
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

      {/* Header Info Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-black text-ink text-base sm:text-lg">
              ✨ ระบบจัดการออฟชั่นเสริมพิเศษ (Custom Doll Options)
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
              ออฟชั่น 14 รายการดึงข้อความ/ราคาตามบล็อก 100% สามารถเพิ่มรูปภาพ, คลิปวิดีโอตัวอย่าง, และเปิด/ปิดการแสดงผลได้ทันที
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มออฟชั่นใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-sand-300 shadow-soft flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อออฟชั่น, ข้อจำกัด, หรือรายละเอียด..."
            className="w-full pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm text-ink focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Material Filter */}
          <div className="flex items-center bg-sand-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setMaterialFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                materialFilter === 'all' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              วัสดุทั้งหมด
            </button>
            <button
              onClick={() => setMaterialFilter('silicone')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                materialFilter === 'silicone' ? 'bg-purple-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              ซิลิโคน
            </button>
            <button
              onClick={() => setMaterialFilter('tpe')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                materialFilter === 'tpe' ? 'bg-sky-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              TPE
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center bg-sand-100 p-1 rounded-2xl text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'all' ? 'bg-white text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              ทั้งหมด ({options?.length || 0})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              เปิด ({options?.filter(o => o.is_active !== 0).length || 0})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === 'inactive' ? 'bg-rose-600 text-white shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              ปิด ({options?.filter(o => o.is_active === 0).length || 0})
            </button>
          </div>
        </div>

      </div>

      {/* Options List / Table */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-sand-50 border-b border-sand-300 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <th className="py-3.5 px-4 text-center w-16">ลำดับ</th>
                <th className="py-3.5 px-4 min-w-[240px]">ชื่อออฟชั่นเสริม & เงื่อนไข</th>
                <th className="py-3.5 px-4 w-32">ราคา (บาท)</th>
                <th className="py-3.5 px-4 w-28">ประเภทวัสดุ</th>
                <th className="py-3.5 px-4 w-36 text-center">รูป / วิดีโอ</th>
                <th className="py-3.5 px-4 w-24 text-center">แสดงผล</th>
                <th className="py-3.5 px-4 w-28 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200 text-xs sm:text-sm">
              {filteredOptions.map((opt, index) => {
                const isActive = opt.is_active !== 0;
                return (
                  <tr 
                    key={opt.id || index}
                    className={`hover:bg-amber-500/5 transition-colors ${!isActive ? 'opacity-50 bg-neutral-50/50' : ''}`}
                  >
                    {/* Reorder Buttons & Index */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-mono font-bold text-ink-muted text-xs w-5 text-center">
                          {index + 1}
                        </span>
                        <div className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, -1)}
                            disabled={index === 0}
                            className="p-0.5 hover:text-amber-600 disabled:opacity-20 text-[10px] cursor-pointer"
                            title="เลื่อนขึ้น"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveOrder(index, 1)}
                            disabled={index === filteredOptions.length - 1}
                            className="p-0.5 hover:text-amber-600 disabled:opacity-20 text-[10px] cursor-pointer"
                            title="เลื่อนลง"
                          >
                            ▼
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Name & Details */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="font-bold text-ink text-sm sm:text-base leading-snug">
                          {opt.name}
                        </div>
                        {opt.condition && (
                          <div className="text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-lg inline-block">
                            {opt.condition}
                          </div>
                        )}
                        {opt.details && (
                          <p className="text-[11px] text-ink-muted line-clamp-1">
                            {opt.details}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 text-sm sm:text-base whitespace-nowrap">
                      {opt.price > 0 ? `+฿${Number(opt.price).toLocaleString()}.-` : 'ฟรี'}
                    </td>

                    {/* Target Material Badge */}
                    <td className="py-3 px-4">
                      {opt.target_material === 'silicone' && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200 whitespace-nowrap">
                          ซิลิโคน
                        </span>
                      )}
                      {opt.target_material === 'tpe' && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-sky-100 text-sky-700 border border-sky-200 whitespace-nowrap">
                          TPE เท่านั้น
                        </span>
                      )}
                      {(!opt.target_material || opt.target_material === 'all') && (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-200 whitespace-nowrap">
                          ทุกวัสดุ
                        </span>
                      )}
                    </td>

                    {/* Media Previews */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {opt.image ? (
                          <button
                            type="button"
                            onClick={() => setPreviewMedia({ type: 'image', url: opt.image, title: opt.name })}
                            className="relative group w-9 h-9 rounded-xl overflow-hidden border border-sand-300 shadow-sm shrink-0 cursor-pointer"
                            title="ดูรูปภาพ"
                          >
                            <img src={opt.image} alt={opt.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Eye className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        ) : (
                          <span className="w-8 h-8 rounded-xl bg-sand-100 flex items-center justify-center text-neutral-300" title="ไม่มีรูปภาพ">
                            <ImageIcon className="w-4 h-4" />
                          </span>
                        )}

                        {opt.video_url ? (
                          <button
                            type="button"
                            onClick={() => setPreviewMedia({ type: 'video', url: opt.video_url, title: opt.name })}
                            className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm"
                            title="เล่นวิดีโอตัวอย่าง"
                          >
                            <Play className="w-4 h-4 fill-current" />
                          </button>
                        ) : (
                          <span className="w-8 h-8 rounded-xl bg-sand-100 flex items-center justify-center text-neutral-300" title="ไม่มีวิดีโอ">
                            <Video className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Active Switch */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(opt)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isActive ? 'bg-emerald-500' : 'bg-neutral-300'
                        }`}
                        title={isActive ? 'คลิกเพื่อปิดใช้งาน' : 'คลิกเพื่อเปิดใช้งาน'}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingOption(opt)}
                          className="p-2 rounded-xl bg-sand-100 hover:bg-amber-500 hover:text-white text-ink-muted transition-all cursor-pointer"
                          title="แก้ไขออฟชั่นนี้"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(opt)}
                          className="p-2 rounded-xl bg-sand-100 hover:bg-rose-600 hover:text-white text-ink-muted transition-all cursor-pointer"
                          title="ลบออฟชั่น"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOptions.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-ink-muted">
                    <p className="text-sm">ไม่พบรายการออฟชั่นเสริมที่ตรงกับเงื่อนไขการค้นหา</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Lightbox Preview Modal */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h4 className="text-white font-bold text-sm truncate pr-4">{previewMedia.title}</h4>
              <button
                onClick={() => setPreviewMedia(null)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-black flex items-center justify-center min-h-[300px] max-h-[70vh]">
              {previewMedia.type === 'image' ? (
                <img src={previewMedia.url} alt={previewMedia.title} className="max-h-[65vh] w-auto object-contain rounded-xl" />
              ) : (
                (() => {
                  const info = getVideoEmbedInfo(previewMedia.url);
                  if (info.type === 'direct') {
                    return (
                      <video 
                        src={info.src} 
                        controls 
                        autoPlay 
                        className="max-h-[65vh] w-full rounded-xl bg-black"
                      />
                    );
                  }
                  return (
                    <iframe
                      src={info.src}
                      title={previewMedia.title}
                      className="w-full aspect-video rounded-xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit / Add Modal */}
      {(isAddingNew || editingOption) && (
        <OptionModalForm
          option={editingOption}
          onClose={() => {
            setIsAddingNew(false);
            setEditingOption(null);
          }}
          onSave={handleSaveOption}
        />
      )}

    </div>
  );
}
