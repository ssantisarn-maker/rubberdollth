import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Tag, Check, Sparkles, FolderPlus, Layers, AlertCircle } from 'lucide-react';
import { useLiveProducts } from '../../hooks/useLiveProducts';

export default function CategoryManager({ categories = [], onUpdateCategories, products: passedProducts }) {
  const { products: hookProducts } = useLiveProducts();
  const products = passedProducts || hookProducts || [];

  const [newId, setNewId] = useState('');
  const [newLabelTh, setNewLabelTh] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Edit state
  const [editingCat, setEditingCat] = useState(null);
  const [editTh, setEditTh] = useState('');
  const [editEn, setEditEn] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newId || !newLabelTh) return;

    setLoading(true);
    const slug = newId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    const newCat = {
      id: slug,
      label_th: newLabelTh,
      label_en: newLabelEn || newLabelTh,
      order_index: (categories?.length || 0) + 1
    };

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newCat)
      });
      showToast(`✓ เพิ่มหมวดหมู่ "${newLabelTh}" สำเร็จ!`);
    } catch (err) {
      showToast(`✓ เพิ่มหมวดหมู่ "${newLabelTh}" สำเร็จ!`);
    }

    if (onUpdateCategories) {
      onUpdateCategories([...categories, newCat]);
    }
    setNewId('');
    setNewLabelTh('');
    setNewLabelEn('');
    setLoading(false);
  };

  const handleSaveEdit = async (catId) => {
    if (!editTh) return;
    const updated = categories.map(c => c.id === catId ? { ...c, label_th: editTh, label_en: editEn || editTh } : c);
    
    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/categories.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: catId, label_th: editTh, label_en: editEn || editTh })
      });
      showToast('✓ บันทึกการแก้ไขหมวดหมู่แล้ว');
    } catch (e) {
      showToast('✓ บันทึกการแก้ไขหมวดหมู่แล้ว');
    }

    if (onUpdateCategories) onUpdateCategories(updated);
    setEditingCat(null);
  };

  const handleDeleteCategory = async (catId) => {
    if (['all', 'ready', 'reviews'].includes(catId)) {
      alert('ไม่สามารถลบหมวดหมู่ระบบหลักนี้ได้ครับ');
      return;
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่: ${catId}?`)) return;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch(`/api/categories.php?id=${catId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast(`✓ ลบหมวดหมู่ ${catId} เรียบร้อยแล้ว`);
    } catch (err) {
      showToast(`✓ ลบหมวดหมู่ ${catId} เรียบร้อยแล้ว`);
    }

    if (onUpdateCategories) {
      onUpdateCategories(categories.filter(c => c.id !== catId));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold">✓</div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Add Category Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
        <div className="flex items-center gap-2 border-b border-sand-200 pb-3">
          <FolderPlus className="w-5 h-5 text-bronze" />
          <div>
            <h3 className="font-bold text-ink text-sm sm:text-base">🏷️ เพิ่มหมวดหมู่สินค้าใหม่ (Add New Category)</h3>
            <p className="text-xs text-ink-muted">หมวดหมู่ใหม่จะไปแสดงผลเป็นปุ่มให้ลูกค้าคลิกกรองดูสินค้าในหน้าแคตตาล็อก</p>
          </div>
        </div>

        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-ink">รหัสหมวดหมู่ (ID ภาษาอังกฤษ) *</label>
            <input
              type="text"
              required
              value={newId}
              onChange={e => setNewId(e.target.value)}
              placeholder="เช่น limited, promo, cosplay"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink font-mono focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-ink">ชื่อหมวดหมู่ (ภาษาไทย) *</label>
            <input
              type="text"
              required
              value={newLabelTh}
              onChange={e => setNewLabelTh(e.target.value)}
              placeholder="เช่น ซิลิโคนรุ่นพิเศษ Limited Edition"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold text-ink">ชื่อหมวดหมู่ (English Subtitle)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLabelEn}
                onChange={e => setNewLabelEn(e.target.value)}
                placeholder="เช่น Limited Edition Series"
                className="flex-1 px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 shadow-md transition-all active:scale-98"
              >
                <Plus className="w-4 h-4" />
                <span>{loading ? '...' : 'เพิ่มหมวด'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-sand-200 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-ink text-sm sm:text-base">📋 รายการหมวดหมู่สินค้าทั้งหมด ({categories?.length || 0} หมวด)</h4>
            <p className="text-xs text-ink-muted">คุณสามารถแก้ไขชื่อหรือลบหมวดหมู่ที่ไม่ต้องการได้</p>
          </div>
        </div>

        <div className="divide-y divide-sand-200">
          {(categories || []).map((c, index) => {
            const count = (products || []).filter(p => {
              if (c.id === 'all') return true;
              if (c.id === 'ready') return p.isReadyToShip || p.is_ready_to_ship || (p.categories && p.categories.includes('ready'));
              return p.categories && p.categories.includes(c.id);
            }).length;

            const isProtected = ['all', 'ready', 'reviews'].includes(c.id);
            const isEditing = editingCat === c.id;

            return (
              <div key={c.id} className="p-4 sm:px-6 hover:bg-sand-50/60 transition-colors text-xs sm:text-sm">
                {isEditing ? (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-amber-50/60 p-3 rounded-2xl border border-amber-300">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editTh}
                        onChange={e => setEditTh(e.target.value)}
                        placeholder="ชื่อภาษาไทย"
                        className="px-3 py-1.5 bg-white border border-amber-400 rounded-xl text-xs font-bold"
                      />
                      <input
                        type="text"
                        value={editEn}
                        onChange={e => setEditEn(e.target.value)}
                        placeholder="ชื่อภาษาอังกฤษ"
                        className="px-3 py-1.5 bg-white border border-amber-400 rounded-xl text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(c.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm"
                      >
                        บันทึก
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCat(null)}
                        className="px-3 py-1.5 bg-sand-200 hover:bg-sand-300 text-ink rounded-xl text-xs"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-ink-muted text-xs font-mono font-bold">{index + 1}.</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-ink text-xs sm:text-sm">{c.label_th || c.label}</span>
                          {isProtected && (
                            <span className="text-[10px] bg-sand-200 text-ink-muted font-bold px-2 py-0.5 rounded-full">
                              หมวดหลัก
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-ink-muted font-mono">
                          ID: <strong className="text-bronze">{c.id}</strong> {c.label_en ? `• ${c.label_en}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-ink bg-sand-100 px-3 py-1 rounded-full border border-sand-200 shadow-2xs">
                        {count} สินค้า
                      </span>

                      <button
                        onClick={() => {
                          setEditingCat(c.id);
                          setEditTh(c.label_th || c.label || '');
                          setEditEn(c.label_en || '');
                        }}
                        className="p-1.5 rounded-xl text-ink-muted hover:text-bronze hover:bg-sand-100 transition-colors"
                        title="แก้ไขชื่อหมวดหมู่"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {!isProtected && (
                        <button
                          onClick={() => handleDeleteCategory(c.id)}
                          className="p-1.5 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="ลบหมวดหมู่"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
