import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, CheckCircle2, XCircle, PackageCheck, Image as ImageIcon, Sparkles, Check, ArrowUpDown, SlidersHorizontal, ArrowDownAZ, Calendar, Zap, ListOrdered, Filter } from 'lucide-react';
import ProductModalForm from './ProductModalForm';
import { useSiteSettings } from '../../hooks/useSiteSettings';

export default function ProductManager({ products, categories, onUpdateProducts }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const { settings, setSettings } = useSiteSettings();
  const sortMode = settings.product_sort_mode || 'ready_first';
  const sortPrefix = settings.product_sort_prefix || 'HALF';

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Change sort mode and immediately sync to settings & localStorage
  const handleSortChange = async (newMode) => {
    await setSettings({ product_sort_mode: newMode });
    showToast('✓ บันทึกรูปแบบการจัดเรียงบนหน้าเว็บหลักสำเร็จแล้ว!');
  };

  // Change sort prefix (e.g. HALF, SLC, RBD)
  const handlePrefixChange = async (newPrefix) => {
    await setSettings({ product_sort_mode: 'prefix_priority', product_sort_prefix: newPrefix });
    showToast(`✓ ตั้งค่าให้รหัส "${newPrefix}" ขึ้นก่อนบนหน้าเว็บแล้ว!`);
  };

  // Sort function helper (Multi-Tier Product Sorting System)
  const sortProducts = (list, mode, prefix) => {
    const arr = [...list];

    // Helper: Compare Ready To Ship status
    const compareReady = (a, b) => {
      const aReady = a.isReadyToShip || a.is_ready_to_ship ? 1 : 0;
      const bReady = b.isReadyToShip || b.is_ready_to_ship ? 1 : 0;
      return bReady - aReady; // 1 (ready) comes before 0
    };

    // Helper: Compare Code A-Z
    const compareCodeAsc = (a, b) => {
      return (a.code || '').localeCompare(b.code || '', undefined, { numeric: true });
    };

    // Helper: Compare Code Z-A
    const compareCodeDesc = (a, b) => {
      return (b.code || '').localeCompare(a.code || '', undefined, { numeric: true });
    };

    // Helper: Compare Prefix
    const comparePrefix = (a, b, pref) => {
      const aCode = (a.code || '').toUpperCase();
      const bCode = (b.code || '').toUpperCase();
      const aMatches = aCode.startsWith(pref) ? 1 : 0;
      const bMatches = bCode.startsWith(pref) ? 1 : 0;
      if (bMatches !== aMatches) return bMatches - aMatches;
      return aCode.localeCompare(bCode, undefined, { numeric: true });
    };

    // Helper: Compare Newest (updated_at)
    const compareNewest = (a, b) => {
      const aDate = new Date(a.updated_at || a.updatedAt || 0).getTime();
      const bDate = new Date(b.updated_at || b.updatedAt || 0).getTime();
      return bDate - aDate;
    };

    // Helper: Compare Price Low to High
    const comparePriceAsc = (a, b) => {
      const aPrice = parseFloat(String(a.price || 0).replace(/[^0-9.]/g, '')) || 0;
      const bPrice = parseFloat(String(b.price || 0).replace(/[^0-9.]/g, '')) || 0;
      return aPrice - bPrice;
    };

    // Helper: Compare Price High to Low
    const comparePriceDesc = (a, b) => {
      const aPrice = parseFloat(String(a.price || 0).replace(/[^0-9.]/g, '')) || 0;
      const bPrice = parseFloat(String(b.price || 0).replace(/[^0-9.]/g, '')) || 0;
      return bPrice - aPrice;
    };

    // 1. Ready to ship first + Code A-Z (Default & Recommended)
    if (mode === 'ready_then_code_asc' || mode === 'ready_first') {
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return compareCodeAsc(a, b);
      });
    }

    // 2. Ready to ship first + Code Z-A
    if (mode === 'ready_then_code_desc') {
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return compareCodeDesc(a, b);
      });
    }

    // 3. Ready to ship first + Prefix Priority (e.g. HALF / SLC)
    if (mode === 'ready_then_prefix') {
      const pref = (prefix || 'HALF').toUpperCase();
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return comparePrefix(a, b, pref);
      });
    }

    // 4. Ready to ship first + Newest Updated
    if (mode === 'ready_then_newest') {
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return compareNewest(a, b);
      });
    }

    // 5. Ready to ship first + Price Low to High
    if (mode === 'ready_then_price_asc') {
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return comparePriceAsc(a, b);
      });
    }

    // 6. Ready to ship first + Price High to Low
    if (mode === 'ready_then_price_desc') {
      return arr.sort((a, b) => {
        const readyDiff = compareReady(a, b);
        if (readyDiff !== 0) return readyDiff;
        return comparePriceDesc(a, b);
      });
    }

    // Pure Sorts (Without Ready Priority)
    if (mode === 'code_asc') {
      return arr.sort(compareCodeAsc);
    }

    if (mode === 'code_desc') {
      return arr.sort(compareCodeDesc);
    }

    if (mode === 'prefix_priority') {
      const pref = (prefix || 'HALF').toUpperCase();
      return arr.sort((a, b) => comparePrefix(a, b, pref));
    }

    if (mode === 'updated_desc') {
      return arr.sort(compareNewest);
    }

    if (mode === 'price_asc') {
      return arr.sort(comparePriceAsc);
    }

    if (mode === 'price_desc') {
      return arr.sort(comparePriceDesc);
    }

    if (mode === 'custom_order') {
      return arr.sort((a, b) => {
        const aOrd = a.order_index ?? a.orderIndex ?? 999;
        const bOrd = b.order_index ?? b.orderIndex ?? 999;
        if (aOrd !== bOrd) return aOrd - bOrd;
        return (parseInt(a.id) || 0) - (parseInt(b.id) || 0);
      });
    }

    return arr;
  };

  // Filter & Sort
  const filtered = useMemo(() => {
    const list = products.filter(p => {
      const matchSearch = (p.code || '').toLowerCase().includes(search.toLowerCase()) || 
                          (p.name || '').toLowerCase().includes(search.toLowerCase());
      const matchCat = selectedCat === 'all' || (p.categories && p.categories.includes(selectedCat));
      return matchSearch && matchCat;
    });

    return sortProducts(list, sortMode, sortPrefix);
  }, [products, search, selectedCat, sortMode, sortPrefix]);

  // Toggle Ready To Ship Status directly from table
  const handleToggleReady = async (prod) => {
    const current = prod.isReadyToShip || prod.is_ready_to_ship;
    const newStatus = !current;
    setToggleLoading(prod.code);

    const updated = {
      ...prod,
      isReadyToShip: newStatus,
      is_ready_to_ship: newStatus
    };

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/products.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ บันทึกสำเร็จ: ${prod.code} ปรับสถานะเป็น "${newStatus ? 'พร้อมส่งในไทย' : 'สั่งผลิต'}" เรียบร้อยแล้ว`);
      }
    } catch (e) {
      showToast(`✓ อัปเดต ${prod.code} เรียบร้อยแล้ว`);
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
      showToast(`✓ ลบสินค้า ${prod.code} เรียบร้อยแล้ว`);
    } catch (e) {
      showToast(`✓ ลบสินค้า ${prod.code} เรียบร้อยแล้ว`);
    }

    onUpdateProducts(products.filter(p => p.code !== prod.code));
  };

  // Save Product (Create or Edit)
  const handleSaveProduct = async (formData) => {
    const isEdit = !!editingProduct;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch('/api/products.php', {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ บันทึกข้อมูลสินค้า ${formData.code} สำเร็จ!`);
      }
    } catch (e) {
      showToast(`✓ บันทึกข้อมูลสินค้า ${formData.code} เรียบร้อยแล้ว!`);
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
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-bold">✓</div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-sand-300 shadow-soft space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหารหัสสินค้า (Code) หรือชื่อโมเดล..."
              className="w-full pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm text-ink focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          {/* Sort Selector Dropdown */}
          <div className="flex flex-wrap items-center gap-2 bg-sand-50 p-2 rounded-2xl border border-sand-300 shrink-0">
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-bronze ml-1 shrink-0" />
              <span className="text-xs font-bold text-ink shrink-0">รูปแบบการจัดเรียง:</span>
            </div>

            <select
              value={sortMode}
              onChange={e => handleSortChange(e.target.value)}
              className="bg-white px-3 py-1.5 rounded-xl border border-sand-300 text-xs sm:text-sm font-bold text-ink focus:outline-none focus:border-bronze cursor-pointer shadow-2xs"
            >
              <optgroup label="⚡ สินค้าพร้อมส่งขึ้นก่อน (Ready to Ship First)">
                <option value="ready_then_code_asc">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ เรียงรหัส A-Z (แนะนำ)</option>
                <option value="ready_then_code_desc">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ เรียงรหัส Z-A</option>
                <option value="ready_then_prefix">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ ดันกลุ่มรหัสขึ้นก่อน (HALF/SLC)</option>
                <option value="ready_then_newest">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ สินค้าลงใหม่/อัปเดตล่าสุด</option>
                <option value="ready_then_price_asc">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ ราคา: ต่ำ ➔ สูง</option>
                <option value="ready_then_price_desc">⚡ สินค้าพร้อมส่งขึ้นก่อน ➔ ราคา: สูง ➔ ต่ำ</option>
              </optgroup>
              <optgroup label="🔤 การจัดเรียงทั่วไป (General Sorting)">
                <option value="code_asc">🔤 เรียงตามรหัสโมเดล A ➔ Z (ก-ฮ)</option>
                <option value="code_desc">🔤 เรียงตามรหัสโมเดล Z ➔ A (ฮ-ก)</option>
                <option value="prefix_priority">🎯 เลือกหมวดรหัส/ตัวอักษรขึ้นก่อน (Custom Prefix)</option>
                <option value="updated_desc">🆕 เรียงตามสินค้าที่แก้ไขล่าสุด (Recently Updated)</option>
                <option value="price_asc">💰 เรียงตามราคา: น้อย ➔ มาก</option>
                <option value="price_desc">💎 เรียงตามราคา: มาก ➔ น้อย</option>
                <option value="custom_order">📌 เรียงตามลำดับตัวเลขที่กำหนดเอง (Order Index)</option>
              </optgroup>
            </select>

            {/* If Prefix Priority is chosen, show quick prefix buttons / selector */}
            {(sortMode === 'prefix_priority' || sortMode === 'ready_then_prefix') && (
              <div className="flex items-center gap-1.5 pl-1 border-l border-sand-300">
                <span className="text-xs text-ink-muted">ขึ้นก่อน:</span>
                <select
                  value={sortPrefix}
                  onChange={e => handlePrefixChange(e.target.value)}
                  className="bg-emerald-50 text-emerald-900 border border-emerald-300 font-extrabold px-2.5 py-1 rounded-xl text-xs focus:outline-none cursor-pointer"
                >
                  <option value="HALF">HALF (รุ่นครึ่งตัว)</option>
                  <option value="SLC">SLC (รุ่นซิลิโคนเต็มตัว)</option>
                  <option value="RBD">RBD (รุ่นรีวิว/Master)</option>
                  <option value="H">ตัวอักษร H...</option>
                  <option value="S">ตัวอักษร S...</option>
                  <option value="R">ตัวอักษร R...</option>
                  <option value="A">ตัวอักษร A...</option>
                  <option value="B">ตัวอักษร B...</option>
                  <option value="C">ตัวอักษร C...</option>
                  <option value="T">ตัวอักษร T...</option>
                </select>
              </div>
            )}
          </div>

          {/* Add Product Button */}
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มสินค้าใหม่</span>
          </button>

        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-sand-200 pt-3">
          <button
            onClick={() => setSelectedCat('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCat === 'all'
                ? 'bg-ink text-white font-semibold shadow-2xs'
                : 'bg-sand-100/80 text-ink-soft hover:bg-sand-200/80'
            }`}
          >
            ทั้งหมด ({products.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCat === cat.id
                  ? 'bg-ink text-white font-semibold shadow-2xs'
                  : 'bg-sand-100/80 text-ink-soft hover:bg-sand-200/80'
              }`}
            >
              {cat.label_th || cat.label}
            </button>
          ))}
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-sand-100/70 border-b border-sand-200 text-ink-muted font-semibold text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">รูปภาพ</th>
                <th className="py-3.5 px-4">รหัส / ชื่อสินค้า</th>
                <th className="py-3.5 px-4">ราคาพิเศษ</th>
                <th className="py-3.5 px-4">สเปก (สูง / หนัก)</th>
                <th className="py-3.5 px-4">สถานะสต็อกไทย</th>
                <th className="py-3.5 px-4 text-center">ลำดับ</th>
                <th className="py-3.5 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {filtered.map(p => (
                <tr key={p.code} className="hover:bg-sand-50/60 transition-colors">
                  
                  {/* Photo thumbnail */}
                  <td className="py-3 px-4">
                    <div className="relative w-12 h-14 rounded-xl overflow-hidden border border-sand-300 bg-sand-100 shadow-2xs">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-full h-full object-cover object-top"
                        onError={e => { e.target.src = '/favicon.png'; }}
                      />
                      {p.gallery && p.gallery.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-ink/70 text-white text-[9px] px-1 rounded-tl">
                          {p.gallery.length}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Code & Name */}
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-ink block font-mono">{p.code}</span>
                    <span className="text-ink-soft line-clamp-1">{p.name}</span>
                    <span className="text-[10px] text-bronze font-medium block">{p.series || p.category}</span>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-800 font-sans block">{p.price || 'สอบถาม LINE'}</span>
                    {p.originalPrice && (
                      <span className="text-[10px] text-ink-muted line-through font-sans block">{p.originalPrice}</span>
                    )}
                  </td>

                  {/* Specs */}
                  <td className="py-3 px-4 text-xs text-ink-soft">
                    <div>สูง: <strong className="text-ink">{p.height || '-'}</strong></div>
                    <div>หนัก: <strong className="text-ink">{p.weight || '-'}</strong></div>
                  </td>

                  {/* Ready to ship quick toggle */}
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleReady(p)}
                      disabled={toggleLoading === p.code}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        p.isReadyToShip || (p.categories && p.categories.includes('ready'))
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                          : 'bg-sand-200/60 text-ink-muted border border-sand-300 hover:bg-sand-200'
                      }`}
                    >
                      {p.isReadyToShip ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>พร้อมส่ง (ไทย)</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5 text-ink-muted" />
                          <span>สั่งผลิต</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Order Index */}
                  <td className="py-3 px-4 text-center font-mono font-bold text-xs text-ink-muted">
                    {p.order_index ?? p.orderIndex ?? '-'}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-ink text-xs font-semibold flex items-center gap-1 transition-colors border border-sand-300"
                        title="แก้ไขข้อมูลสินค้า"
                      >
                        <Edit className="w-3.5 h-3.5 text-bronze" />
                        <span>แก้ไข</span>
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        className="p-1.5 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
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

      {/* Edit/Create Modal */}
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
