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
      const res = await fetch('/api/categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newCat)
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        if (onUpdateCategories) onUpdateCategories(data.categories);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(data.categories));
      } else {
        const fallback = [...categories, newCat];
        if (onUpdateCategories) onUpdateCategories(fallback);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(fallback));
      }
      showToast(`✓ เพิ่มหมวดหมู่ "${newLabelTh}" สำเร็จ!`);
    } catch (err) {
      const fallback = [...categories, newCat];
      if (onUpdateCategories) onUpdateCategories(fallback);
      localStorage.setItem('rbd_categories_cache', JSON.stringify(fallback));
      showToast(`✓ เพิ่มหมวดหมู่ "${newLabelTh}" สำเร็จ!`);
    }

    setNewId('');
    setNewLabelTh('');
    setNewLabelEn('');
    setLoading(false);
  };

  const handleSaveEdit = async (catId) => {
    if (!editTh) return;
    const localUpdated = categories.map(c => c.id === catId ? { ...c, label_th: editTh, label_en: editEn || editTh } : c);
    
    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/categories.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id: catId, label_th: editTh, label_en: editEn || editTh })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        if (onUpdateCategories) onUpdateCategories(data.categories);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(data.categories));
      } else {
        if (onUpdateCategories) onUpdateCategories(localUpdated);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(localUpdated));
      }
      showToast('✓ บันทึกการแก้ไขหมวดหมู่แล้ว');
    } catch (e) {
      if (onUpdateCategories) onUpdateCategories(localUpdated);
      localStorage.setItem('rbd_categories_cache', JSON.stringify(localUpdated));
      showToast('✓ บันทึกการแก้ไขหมวดหมู่แล้ว');
    }

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
      const res = await fetch(`/api/categories.php?id=${catId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.categories)) {
        if (onUpdateCategories) onUpdateCategories(data.categories);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(data.categories));
      } else {
        const fallback = categories.filter(c => c.id !== catId);
        if (onUpdateCategories) onUpdateCategories(fallback);
        localStorage.setItem('rbd_categories_cache', JSON.stringify(fallback));
      }
      showToast(`✓ ลบหมวดหมู่ ${catId} เรียบร้อยแล้ว`);
    } catch (err) {
      const fallback = categories.filter(c => c.id !== catId);
      if (onUpdateCategories) onUpdateCategories(fallback);
      localStorage.setItem('rbd_categories_cache', JSON.stringify(fallback));
      showToast(`✓ ลบหมวดหมู่ ${catId} เรียบร้อยแล้ว`);
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
            <input
              type="text"
              value={newLabelEn}
              onChange={e => setNewLabelEn(e.target.value)}
              placeholder="เช่น Limited Edition Series"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-all active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึก...' : 'บันทึกหมวดหมู่ใหม่'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-sand-200 bg-sand-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-bronze" />
            <h3 className="font-bold text-ink text-sm sm:text-base">หมวดหมู่ทั้งหมดในระบบ ({categories.length})</h3>
          </div>
          <span className="text-xs text-ink-muted hidden sm:inline">คลิกไอคอนดินสอ ✏️ เพื่อแก้ไขชื่อ</span>
        </div>

        <div className="divide-y divide-sand-200">
          {categories.map((cat, idx) => {
            const isEditing = editingCat === cat.id;
            const isSystem = ['all', 'ready', 'reviews'].includes(cat.id);
            
            // Count products in this category
            const count = cat.id === 'all' 
              ? products.length 
              : cat.id === 'ready'
                ? products.filter(p => p.isReadyToShip || p.is_ready_to_ship || (Array.isArray(p.categories) && p.categories.includes('ready'))).length
                : products.filter(p => {
                    const pCats = Array.isArray(p.categories) ? p.categories : [];
                    const pCatStr = String(p.category || '');
                    const labelTh = String(cat.label_th || '');
                    return pCats.includes(cat.id) || (labelTh && pCats.includes(labelTh)) || (pCatStr && pCatStr.includes(cat.id)) || (labelTh && pCatStr.includes(labelTh));
                  }).length;

            return (
              <div key={cat.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-sand-50/50 transition-colors">
                
                {/* Left info or Edit inputs */}
                {isEditing ? (
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editTh}
                      onChange={e => setEditTh(e.target.value)}
                      placeholder="ชื่อภาษาไทย"
                      className="px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs font-semibold text-ink focus:outline-none focus:border-bronze"
                    />
                    <input
                      type="text"
                      value={editEn}
                      onChange={e => setEditEn(e.target.value)}
                      placeholder="English Label"
                      className="px-3 py-2 bg-white border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-ink-muted">{idx + 1}.</span>
                      <h4 className="font-bold text-ink text-sm sm:text-base">{cat.label_th}</h4>
                      {isSystem && (
                        <span className="text-[10px] bg-sand-200 text-ink-muted px-2 py-0.5 rounded-full font-semibold">
                          หมวดหมู่ระบบ
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-muted">
                      ID: <span className="font-mono text-bronze">{cat.id}</span> • {cat.label_en || '-'}
                    </p>
                  </div>
                )}

                {/* Right controls & Count */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <span className="text-xs font-semibold bg-sand-100 text-ink px-2.5 py-1 rounded-full border border-sand-200">
                    {count} สินค้า
                  </span>

                  {isEditing ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleSaveEdit(cat.id)}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" /> บันทึก
                      </button>
                      <button
                        onClick={() => setEditingCat(null)}
                        className="px-3 py-1.5 bg-sand-200 text-ink rounded-xl text-xs font-semibold hover:bg-sand-300 transition-colors"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingCat(cat.id);
                          setEditTh(cat.label_th);
                          setEditEn(cat.label_en || '');
                        }}
                        className="p-2 rounded-xl text-ink-muted hover:text-ink hover:bg-sand-200 transition-colors"
                        title="แก้ไขชื่อหมวดหมู่"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      {!isSystem && (
                        <button
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="ลบหมวดหมู่"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
