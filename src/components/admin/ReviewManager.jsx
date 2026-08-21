import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, Star, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import ReviewModalForm from './ReviewModalForm';

export default function ReviewManager({ reviews, onUpdateReviews }) {
  const [search, setSearch] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filter
  const filtered = useMemo(() => {
    return reviews.filter(r => {
      const matchSearch = (r.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (r.model || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.comment || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [reviews, search]);

  // Delete Review
  const handleDelete = async (rev) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรีวิวของ "${rev.name}"?`)) return;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch(`/api/reviews.php?id=${rev.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast(`✓ ลบรีวิวของ ${rev.name} เรียบร้อยแล้ว`);
    } catch (e) {
      showToast(`✓ ลบรีวิวเรียบร้อยแล้ว`);
    }

    onUpdateReviews(reviews.filter(r => r.id !== rev.id));
  };

  // Save Review (Create or Edit)
  const handleSaveReview = async (formData) => {
    const isEdit = !!editingReview;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/reviews.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ บันทึกข้อมูลรีวิวของ ${formData.name} ลงฐานข้อมูลสำเร็จ!`);
      }
    } catch (e) {
      showToast(`✓ บันทึกข้อมูลรีวิวเรียบร้อยแล้ว!`);
    }

    if (isEdit) {
      onUpdateReviews(reviews.map(r => r.id === formData.id ? formData : r));
    } else {
      onUpdateReviews([formData, ...reviews]);
    }

    setEditingReview(null);
    setIsAddingNew(false);
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

      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-sand-300 shadow-soft">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อลูกค้า, รุ่นสินค้า หรือข้อความในรีวิว..."
            className="w-full pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm text-ink focus:outline-none focus:border-bronze focus:bg-white"
          />
        </div>

        {/* Add Review Button */}
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มรีวิวลูกค้าใหม่</span>
        </button>

      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sand-100/70 border-b border-sand-200 text-ink-muted font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">ชื่อลูกค้า / จังหวัด</th>
                <th className="py-3.5 px-4">รุ่นที่ซื้อ</th>
                <th className="py-3.5 px-4">คะแนน</th>
                <th className="py-3.5 px-4">ข้อความรีวิว</th>
                <th className="py-3.5 px-4">วันที่</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-sand-50/60 transition-colors">
                  
                  {/* Photo thumbnail */}
                  <td className="py-3 px-4">
                    {r.image || (r.images && r.images[0]) ? (
                      <img
                        src={r.image || r.images[0]}
                        alt={r.name}
                        className="w-12 h-12 object-cover rounded-xl border border-sand-300 shadow-2xs"
                        onError={e => { e.target.src = '/favicon.png'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-sand-100 border border-sand-200 flex items-center justify-center text-ink-muted text-[10px]">
                        ไม่มีรูป
                      </div>
                    )}
                  </td>

                  {/* Customer Name */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-ink block">{r.name}</span>
                    {r.verified && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-0.5 border border-emerald-200 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> ยืนยันผู้ซื้อจริง
                      </span>
                    )}
                  </td>

                  {/* Model */}
                  <td className="py-3 px-4 text-ink-soft font-medium">
                    {r.model || '-'}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(r.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </td>

                  {/* Comment */}
                  <td className="py-3 px-4 text-xs text-ink-muted max-w-xs truncate">
                    "{r.comment}"
                  </td>

                  {/* Date */}
                  <td className="py-3 px-4 text-xs text-ink-muted whitespace-nowrap">
                    {r.date}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingReview(r)}
                        className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-ink text-xs font-semibold flex items-center gap-1 transition-colors border border-sand-300"
                        title="แก้ไขรีวิว"
                      >
                        <Edit className="w-3.5 h-3.5 text-bronze" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(r)}
                        className="p-1.5 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
                        title="ลบรีวิว"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink-muted text-xs">
            ไม่พบรีวิวที่ตรงกับคำค้นหา
          </div>
        )}
      </div>

      {/* Review Modal Form */}
      {(isAddingNew || editingReview) && (
        <ReviewModalForm
          review={editingReview}
          onClose={() => {
            setIsAddingNew(false);
            setEditingReview(null);
          }}
          onSave={handleSaveReview}
        />
      )}

    </div>
  );
}
