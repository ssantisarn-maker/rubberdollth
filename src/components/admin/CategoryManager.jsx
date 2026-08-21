import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Tag, Check, Sparkles } from 'lucide-react';

export default function CategoryManager({ categories, onUpdateCategories, products }) {
  const [newId, setNewId] = useState('');
  const [newLabelTh, setNewLabelTh] = useState('');
  const [newLabelEn, setNewLabelEn] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newId || !newLabelTh) return;

    setLoading(true);
    const slug = newId.toLowerCase().trim().replace(/\s+/g, '-');
    const newCat = {
      id: slug,
      label_th: newLabelTh,
      label_en: newLabelEn || newLabelTh,
      order_index: categories.length + 1
    };

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newCat)
      });
    } catch (err) {
      console.warn('Saved locally');
    }

    onUpdateCategories([...categories, newCat]);
    setNewId('');
    setNewLabelTh('');
    setNewLabelEn('');
    setLoading(false);
  };

  const handleDeleteCategory = async (catId) => {
    if (['all', 'ready'].includes(catId)) {
      alert('ไม่สามารถลบหมวดหมู่หลักนี้ได้ครับ');
      return;
    }

    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่: ${catId}?`)) return;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch(`/api/categories.php?id=${catId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (err) {
      console.warn('Deleted locally');
    }

    onUpdateCategories(categories.filter(c => c.id !== catId));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Add Category Card */}
      <div className="bg-white p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
        <h3 className="font-bold text-ink text-sm sm:text-base flex items-center gap-2">
          <Tag className="w-4 h-4 text-bronze" />
          <span>เพิ่มหมวดหมู่สินค้าใหม่</span>
        </h3>
        <form onSubmit={handleAddCategory} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={newId}
            onChange={e => setNewId(e.target.value)}
            placeholder="รหัสหมวดหมู่ (เช่น limited, promo)"
            className="px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
          />
          <input
            type="text"
            required
            value={newLabelTh}
            onChange={e => setNewLabelTh(e.target.value)}
            placeholder="ชื่อภาษาไทย (เช่น รุ่นพิเศษ Limited)"
            className="px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabelEn}
              onChange={e => setNewLabelEn(e.target.value)}
              placeholder="ชื่อภาษาอังกฤษ (Optional)"
              className="flex-1 px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-xs text-ink focus:outline-none focus:border-bronze focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-ink hover:bg-ink-soft text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่ม</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-sand-200">
          <h4 className="font-bold text-ink text-sm">รายการหมวดหมู่ทั้งหมด</h4>
          <p className="text-xs text-ink-muted">หมวดหมู่จะไปแสดงผลเป็นปุ่มให้ลูกค้าเลือกชมในหน้าแคตตาล็อกสินค้า</p>
        </div>

        <div className="divide-y divide-sand-200">
          {categories.map((c, index) => {
            const count = products.filter(p => p.categories && p.categories.includes(c.id)).length;
            const isProtected = ['all', 'ready'].includes(c.id);

            return (
              <div key={c.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-sand-50 transition-colors text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-ink-muted text-xs font-mono">{index + 1}.</span>
                  <div>
                    <span className="font-bold text-ink block">{c.label_th || c.label}</span>
                    <span className="text-xs text-ink-muted font-mono">id: {c.id} {c.label_en ? `| ${c.label_en}` : ''}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-ink bg-sand-100 px-2.5 py-1 rounded-full">
                    {count} ชิ้น
                  </span>
                  {!isProtected && (
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="ลบหมวดหมู่"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
