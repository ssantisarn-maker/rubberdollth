import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle, PackageCheck, Image as ImageIcon } from 'lucide-react';
import ProductModalForm from './ProductModalForm';

export default function ProductManager({ products, categories, onUpdateProducts }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);

  // Filter
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch = (p.code || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.name || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'all' || (p.categories && p.categories.includes(selectedCat));
      return matchSearch && matchCat;
    });
  }, [products, search, selectedCat]);

  // Quick Toggle Ready to Ship
  const handleToggleReady = async (prod) => {
    setToggleLoading(prod.code);
    const newStatus = !prod.isReadyToShip;
    let newCats = prod.categories ? [...prod.categories] : ['all'];
    if (newStatus && !newCats.includes('ready')) newCats.push('ready');
    if (!newStatus) newCats = newCats.filter(c => c !== 'ready');

    const updated = { ...prod, isReadyToShip: newStatus, categories: newCats };

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch('/api/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
    } catch (e) {
      console.warn('Updated locally');
    }

    onUpdateProducts(products.map(p => p.code === prod.code ? updated : p));
    setToggleLoading(null);
  };

  // Delete Product
  const handleDelete = async (prod) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้ารหัส: ${prod.code} (${prod.name})?`)) return;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch(`/api/products.php?code=${prod.code}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.warn('Deleted locally');
    }

    onUpdateProducts(products.filter(p => p.code !== prod.code));
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (formData) => {
    const isEdit = !!editingProduct;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const method = isEdit ? 'PUT' : 'POST';
      await fetch('/api/products.php', {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
    } catch (e) {
      console.warn('Saved locally');
    }

    if (isEdit) {
      onUpdateProducts(products.map(p => p.code === formData.code ? formData : p));
    } else {
      onUpdateProducts([formData, ...products]);
    }

    setEditingProduct(null);
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar: Search, Category Filter, and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-3xl border border-sand-300 shadow-soft">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหารหัสรุ่น (เช่น HALF-27) หรือชื่อสินค้า..."
            className="w-full pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm text-ink focus:outline-none focus:border-bronze focus:bg-white"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value)}
          className="px-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm font-medium text-ink focus:outline-none focus:border-bronze"
        >
          <option value="all">ทุกหมวดหมู่ ({products.length})</option>
          {categories.filter(c => c.id !== 'reviews').map(c => (
            <option key={c.id} value={c.id}>
              {c.label_th || c.label}
            </option>
          ))}
        </select>

        {/* Add Product Button */}
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มสินค้าใหม่</span>
        </button>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sand-100/70 border-b border-sand-200 text-ink-muted font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">รหัส / ชื่อรุ่น</th>
                <th className="py-3.5 px-4">สเปก (ส่วนสูง/นน.)</th>
                <th className="py-3.5 px-4">หมวดหมู่</th>
                <th className="py-3.5 px-4 text-center">พร้อมส่งในไทย</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filtered.map(p => (
                <tr key={p.code} className="hover:bg-sand-50/60 transition-colors">
                  
                  {/* Image */}
                  <td className="py-3 px-4">
                    <img
                      src={p.image}
                      alt={p.code}
                      className="w-12 h-12 object-cover rounded-xl border border-sand-300 shadow-2xs"
                      onError={e => { e.target.src = '/favicon.png'; }}
                    />
                  </td>

                  {/* Code & Name */}
                  <td className="py-3 px-4">
                    <span className="font-bold font-sans text-ink block">{p.code}</span>
                    <span className="text-xs text-ink-muted">{p.name}</span>
                  </td>

                  {/* Specs */}
                  <td className="py-3 px-4 text-xs text-ink-soft">
                    <span>{p.height || '-'}</span> | <span>{p.weight || '-'}</span>
                  </td>

                  {/* Categories Pills */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {p.categories?.map(c => (
                        <span key={c} className="text-[10px] px-2 py-0.5 bg-sand-100 border border-sand-200 rounded-md text-ink-muted font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Ready Toggle */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => handleToggleReady(p)}
                      disabled={toggleLoading === p.code}
                      className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 transition-all ${
                        p.isReadyToShip 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-sand-100 text-ink-muted hover:bg-sand-200'
                      }`}
                    >
                      {p.isReadyToShip ? '✓ พร้อมส่ง' : 'สั่งผลิต'}
                    </button>
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-bronze hover:bg-sand-100 transition-colors"
                        title="แก้ไขสินค้า"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-lg text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="ลบสินค้า"
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
            ไม่พบสินค้าที่ตรงกับคำค้นหา
          </div>
        )}
      </div>

      {/* Modal Form for Add/Edit */}
      {(isAddingNew || editingProduct) && (
        <ProductModalForm
          product={editingProduct}
          categories={categories}
          onClose={() => {
            setIsAddingNew(false);
            setEditingProduct(null);
          }}
          onSave={handleSaveProduct}
        />
      )}

    </div>
  );
}
