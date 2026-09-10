import React, { useState, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, Sparkles, Image as ImageIcon, CheckCircle2, 
  XCircle, Search, Eye, X, Settings, ArrowUpDown, DollarSign, FolderPlus 
} from 'lucide-react';
import CustomSpecModalForm from './CustomSpecModalForm';

export default function CustomSpecManager({ specsData, onUpdateSpecs }) {
  const { 
    groups = [], 
    items = [], 
    saveGroup, 
    deleteGroup, 
    saveItem, 
    deleteItem,
    reorderItems,
    reorderGroups
  } = specsData;

  const [activeGroupId, setActiveGroupId] = useState(() => groups[0]?.id || 'wig');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState('all'); // all | free | paid
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | inactive

  // Modal states
  const [editingItem, setEditingItem] = useState(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Group modal states (Add/Edit category)
  const [editingGroup, setEditingGroup] = useState(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [groupFormData, setGroupFormData] = useState({ name: '', icon: '✨', order_index: 0, is_active: 1 });

  // Lightbox preview
  const [previewImage, setPreviewImage] = useState(null); // { url, title }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Ensure activeGroupId is valid
  const currentGroup = groups.find(g => g.id === activeGroupId) || groups[0] || { id: 'wig', name: 'วิกผม' };

  // Filter items in active group
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      if (item.group_id !== currentGroup.id) return false;

      // Search
      const q = search.toLowerCase();
      const matchSearch = !search || 
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q);

      // Price filter
      const isFree = !item.price || Number(item.price) === 0;
      const matchPrice = priceFilter === 'all' ||
        (priceFilter === 'free' && isFree) ||
        (priceFilter === 'paid' && !isFree);

      // Status filter
      const matchStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && (item.is_active === 1 || item.is_active === undefined)) ||
        (statusFilter === 'inactive' && item.is_active === 0);

      return matchSearch && matchPrice && matchStatus;
    }).sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [items, currentGroup.id, search, priceFilter, statusFilter]);

  // Counts per group
  const groupItemCounts = useMemo(() => {
    const counts = {};
    groups.forEach(g => { counts[g.id] = 0; });
    items.forEach(i => {
      if (counts[i.group_id] !== undefined) counts[i.group_id]++;
    });
    return counts;
  }, [groups, items]);

  // Handle Save Item
  const handleSaveItem = async (formData) => {
    try {
      await saveItem(formData);
      showToast(editingItem ? '✓ บันทึกการแก้ไขตัวเลือกแล้ว' : '✓ เพิ่มตัวเลือกใหม่สำเร็จ');
      setIsAddingItem(false);
      setEditingItem(null);
    } catch (e) {
      showToast('❌ ไม่สามารถบันทึกตัวเลือกได้');
    }
  };

  // Handle Delete Item
  const handleDeleteItem = async (item) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบตัวเลือก "${item.name}"?`)) return;
    try {
      await deleteItem(item.id);
      showToast('✓ ลบตัวเลือกเรียบร้อยแล้ว');
    } catch (e) {
      showToast('❌ ไม่สามารถลบตัวเลือกได้');
    }
  };

  // Handle Toggle Item Active
  const handleToggleItemActive = async (item) => {
    const nextStatus = item.is_active === 1 || item.is_active === undefined ? 0 : 1;
    try {
      await saveItem({ ...item, is_active: nextStatus });
      showToast(nextStatus === 1 ? '✓ เปิดใช้งานตัวเลือกแล้ว' : '✓ ซ่อนตัวเลือกแล้ว');
    } catch (e) {
      showToast('❌ ไม่สามารถเปลี่ยนสถานะได้');
    }
  };

  // Reorder Item (Move Up / Down)
  const handleMoveItemOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= filteredItems.length) return;

    const newSorted = [...filteredItems];
    const temp = newSorted[index];
    newSorted[index] = newSorted[targetIndex];
    newSorted[targetIndex] = temp;

    const newItemIds = newSorted.map(item => item.id);
    if (typeof reorderItems === 'function') {
      await reorderItems(currentGroup.id, newItemIds);
    }
    showToast(`✓ สลับลำดับ "${temp.name}" เรียบร้อย`);
  };

  // Reorder Group (Move Left / Right)
  const handleMoveGroupOrder = async (index, direction, e) => {
    if (e) e.stopPropagation();
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= groups.length) return;

    const newGroups = [...groups];
    const temp = newGroups[index];
    newGroups[index] = newGroups[targetIndex];
    newGroups[targetIndex] = temp;

    const newGroupIds = newGroups.map(g => g.id);
    if (typeof reorderGroups === 'function') {
      await reorderGroups(newGroupIds);
    }
    showToast(`✓ ปรับลำดับหัวข้อ "${temp.name}" เรียบร้อย`);
  };

  // Open Add Group Modal
  const handleOpenAddGroup = () => {
    setGroupFormData({
      id: '',
      name: '',
      icon: '✨',
      order_index: groups.length + 1,
      is_active: 1
    });
    setEditingGroup(null);
    setIsAddingGroup(true);
  };

  // Open Edit Group Modal
  const handleOpenEditGroup = (group, e) => {
    e.stopPropagation();
    setGroupFormData({
      id: group.id,
      name: group.name,
      icon: group.icon || '✨',
      order_index: group.order_index ?? 0,
      is_active: group.is_active ?? 1
    });
    setEditingGroup(group);
    setIsAddingGroup(true);
  };

  // Handle Save Group
  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!groupFormData.name.trim()) return;

    let slug = groupFormData.id ? groupFormData.id.trim() : '';
    if (!slug) {
      slug = 'group_' + Date.now().toString(36);
    }

    const payload = {
      id: slug,
      name: groupFormData.name.trim(),
      icon: (groupFormData.icon || '✨').trim(),
      order_index: Number(groupFormData.order_index) || 0,
      is_active: groupFormData.is_active ? 1 : 0
    };

    try {
      await saveGroup(payload);
      showToast(editingGroup ? `✓ แก้ไขหัวข้อ "${payload.name}" แล้ว` : `✓ เพิ่มหัวข้อ "${payload.name}" สำเร็จ`);
      setIsAddingGroup(false);
      setEditingGroup(null);
      setActiveGroupId(slug);
    } catch (e) {
      showToast('❌ ไม่สามารถบันทึกหัวข้อได้');
    }
  };

  // Handle Delete Group
  const handleDeleteGroup = async (group, e) => {
    e.stopPropagation();
    const count = groupItemCounts[group.id] || 0;
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบหัวข้อ "${group.name}"?\n(ตัวเลือกทั้งหมดในหัวข้อนี้จำนวน ${count} รายการ จะถูกลบไปด้วย)`)) {
      return;
    }

    try {
      await deleteGroup(group.id);
      showToast(`✓ ลบหัวข้อ "${group.name}" เรียบร้อยแล้ว`);
      const remaining = groups.filter(g => g.id !== group.id);
      if (remaining.length > 0) {
        setActiveGroupId(remaining[0].id);
      }
    } catch (e) {
      showToast('❌ ไม่สามารถลบหัวข้อได้');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-[130] bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-400/30 flex items-center gap-3 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs">✓</div>
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Heading */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="font-serif font-black text-ink text-lg sm:text-xl">
              จัดการสเปกสั่งทำ (Custom Doll Specifications)
            </h2>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            ระบบปรับแต่งสเปกตุ๊กตายางแบบดรอปดาวน์ สามารถ <strong>เพิ่มหรือลบหัวข้อสเปก</strong> ได้อิสระ พร้อมกำหนดราคา <strong>"ฟรี"</strong> หรือ <strong>"คิดเงินเพิ่ม"</strong> และแนบภาพตัวอย่าง
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenAddGroup}
            className="py-2.5 px-4 bg-sand-100 hover:bg-sand-200 text-ink rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-sand-300"
          >
            <FolderPlus className="w-4 h-4 text-bronze" />
            <span>+ เพิ่มหัวข้อใหม่</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsAddingItem(true);
            }}
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มตัวเลือกในหมวดนี้</span>
          </button>
        </div>
      </div>

      {/* Category Tabs (Dynamic Groups) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {groups.map((g, gIdx) => {
          const isActive = g.id === currentGroup.id;
          const count = groupItemCounts[g.id] || 0;
          return (
            <div
              key={g.id}
              onClick={() => setActiveGroupId(g.id)}
              className={`group/tab relative py-2.5 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 select-none ${
                isActive
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-md scale-[1.02]'
                  : 'bg-white text-ink border-sand-300 hover:bg-sand-50 hover:border-sand-400'
              }`}
            >
              <span className="text-base">{g.icon || '✨'}</span>
              <span>{g.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                isActive ? 'bg-amber-400 text-neutral-950' : 'bg-sand-100 text-ink-muted'
              }`}>
                {count}
              </span>

              {/* Edit / Delete / Reorder Group Actions */}
              <div className="flex items-center gap-0.5 pl-1 ml-1 border-l border-white/20">
                {groups.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => handleMoveGroupOrder(gIdx, -1, e)}
                      disabled={gIdx === 0}
                      className={`p-1 rounded-md transition-colors disabled:opacity-20 ${
                        isActive ? 'hover:bg-white/20 text-neutral-300 hover:text-white' : 'hover:bg-sand-200 text-ink-muted hover:text-ink'
                      }`}
                      title="ย้ายหัวข้อไปทางซ้าย"
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleMoveGroupOrder(gIdx, 1, e)}
                      disabled={gIdx === groups.length - 1}
                      className={`p-1 rounded-md transition-colors disabled:opacity-20 ${
                        isActive ? 'hover:bg-white/20 text-neutral-300 hover:text-white' : 'hover:bg-sand-200 text-ink-muted hover:text-ink'
                      }`}
                      title="ย้ายหัวข้อไปทางขวา"
                    >
                      ▶
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={(e) => handleOpenEditGroup(g, e)}
                  className={`p-1 rounded-md transition-colors ${
                    isActive ? 'hover:bg-white/20 text-neutral-300 hover:text-white' : 'hover:bg-sand-200 text-ink-muted hover:text-ink'
                  }`}
                  title="แก้ไขชื่อหัวข้อสเปก"
                >
                  <Edit className="w-3 h-3" />
                </button>
                {groups.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteGroup(g, e)}
                    className={`p-1 rounded-md transition-colors ${
                      isActive ? 'hover:bg-rose-500/30 text-rose-300 hover:text-rose-200' : 'hover:bg-rose-100 text-rose-600'
                    }`}
                    title="ลบหัวข้อสเปกนี้"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Group Button in Tab Bar */}
        <button
          type="button"
          onClick={handleOpenAddGroup}
          className="py-2.5 px-3.5 rounded-2xl border border-dashed border-sand-400 hover:border-bronze bg-sand-50/70 hover:bg-sand-100 text-ink-muted hover:text-ink text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 text-bronze" />
          <span>เพิ่มหัวข้อ</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-sand-300 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={`ค้นหาตัวเลือกในหมวด ${currentGroup.name}...`}
            className="w-full pl-9 pr-3.5 py-2 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Price Filter */}
          <select
            value={priceFilter}
            onChange={e => setPriceFilter(e.target.value)}
            className="px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze"
          >
            <option value="all">ทุกราคา (All)</option>
            <option value="free">🟢 ฟรีเท่านั้น (Free)</option>
            <option value="paid">🟠 คิดเงินเพิ่ม (+฿ Paid)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze"
          >
            <option value="all">ทุกสถานะ (All)</option>
            <option value="active">เปิดใช้งาน (Active)</option>
            <option value="inactive">ปิดชั่วคราว (Inactive)</option>
          </select>
        </div>
      </div>

      {/* Items Table / Cards Grid */}
      <div className="bg-white rounded-3xl border border-sand-300 shadow-soft overflow-hidden">
        
        <div className="p-4 sm:p-5 border-b border-sand-200 flex items-center justify-between bg-sand-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{currentGroup.icon || '✨'}</span>
            <div>
              <h3 className="font-bold text-ink text-sm sm:text-base">
                รายการตัวเลือกในหมวด: {currentGroup.name}
              </h3>
              <p className="text-xs text-ink-muted">
                พบทั้งหมด {filteredItems.length} รายการ (ลูกค้าจะเห็นตัวเลือกเหล่านี้ในดรอปดาวน์หน้าต่างสินค้า)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              setIsAddingItem(true);
            }}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มตัวเลือก</span>
          </button>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sand-100 text-ink-muted flex items-center justify-center mx-auto text-xl">
              📂
            </div>
            <p className="text-sm font-semibold text-ink">ยังไม่มีตัวเลือกในหมวดหมู่นี้</p>
            <p className="text-xs text-ink-muted">กดปุ่ม "+ เพิ่มตัวเลือกในหมวดนี้" เพื่อเพิ่มตัวเลือกให้ลูกค้าคลิกเลือกในดรอปดาวน์</p>
            <button
              type="button"
              onClick={() => {
                setEditingItem(null);
                setIsAddingItem(true);
              }}
              className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>เพิ่มตัวเลือกแรก</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-sand-200">
            {filteredItems.map((item, idx) => {
              const isFree = !item.price || Number(item.price) === 0;
              const isActive = item.is_active === 1 || item.is_active === undefined;
              const isFilterActive = Boolean(search || priceFilter !== 'all' || statusFilter !== 'all');

              return (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    !isActive ? 'bg-sand-50/80 opacity-65' : 'hover:bg-sand-50/50'
                  }`}
                >
                  {/* Left: Reorder Controls + Thumbnail & Info */}
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    
                    {/* Reorder Buttons (▲ / ▼) */}
                    <div className="flex flex-col items-center justify-center shrink-0 pr-1 select-none">
                      <button
                        type="button"
                        onClick={() => handleMoveItemOrder(idx, -1)}
                        disabled={idx === 0 || isFilterActive}
                        className="p-1 text-ink-muted hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 disabled:hover:text-ink-muted disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer text-xs font-bold leading-none"
                        title={isFilterActive ? 'กรุณาล้างการค้นหา/ตัวกรองก่อนสลับลำดับ' : 'เลื่อนขึ้น (แสดงก่อน)'}
                      >
                        ▲
                      </button>
                      <span className="text-[10px] font-mono font-bold text-ink-muted/80 my-0.5" title="ลำดับที่">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleMoveItemOrder(idx, 1)}
                        disabled={idx === filteredItems.length - 1 || isFilterActive}
                        className="p-1 text-ink-muted hover:text-amber-600 hover:bg-amber-50 disabled:opacity-20 disabled:hover:text-ink-muted disabled:hover:bg-transparent rounded-lg transition-colors cursor-pointer text-xs font-bold leading-none"
                        title={isFilterActive ? 'กรุณาล้างการค้นหา/ตัวกรองก่อนสลับลำดับ' : 'เลื่อนลง (แสดงหลัง)'}
                      >
                        ▼
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div
                      onClick={() => item.image && setPreviewImage({ url: item.image, title: item.name })}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border shrink-0 overflow-hidden flex items-center justify-center relative bg-sand-100 ${
                        item.image ? 'cursor-pointer hover:ring-2 hover:ring-bronze/50' : 'border-dashed border-sand-300'
                      }`}
                      title={item.image ? 'คลิกเพื่อดูรูปภาพขนาดใหญ่' : 'ไม่มีรูปภาพตัวอย่าง'}
                    >
                      {item.image ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-4 h-4 text-white" />
                          </div>
                        </>
                      ) : (
                        <ImageIcon className="w-5 h-5 text-sand-400" />
                      )}
                    </div>

                    {/* Text info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-xs sm:text-sm text-ink truncate">
                          {item.name}
                        </h4>

                        {/* Price Badge */}
                        {isFree ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0">
                            🟢 ฟรี (รวมในค่าตัว)
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                            🟠 +฿{Number(item.price).toLocaleString()}.-
                          </span>
                        )}

                        {/* Default Badge */}
                        {item.is_default === 1 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 shrink-0">
                            ⭐ ค่าเริ่มต้น
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-xs text-ink-muted truncate mt-0.5">
                          {item.description}
                        </p>
                      )}

                      <div className="text-[10px] text-ink-muted font-mono mt-1">
                        ID: {item.id} • ลำดับ: {item.order_index ?? 0}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleItemActive(item)}
                      className={`py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-sand-200 hover:bg-sand-300 text-ink-muted border border-sand-300'
                      }`}
                      title={isActive ? 'คลิกเพื่อซ่อนตัวเลือกนี้' : 'คลิกเพื่อเปิดใช้งานตัวเลือกนี้'}
                    >
                      {isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      <span>{isActive ? 'เปิดใช้งาน' : 'ซ่อน'}</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setEditingItem(item);
                        setIsAddingItem(true);
                      }}
                      className="p-2 rounded-xl bg-sand-100 hover:bg-sand-200 text-ink transition-colors cursor-pointer border border-sand-200"
                      title="แก้ไขตัวเลือก"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer border border-rose-200"
                      title="ลบตัวเลือก"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL: Add / Edit Item */}
      {isAddingItem && (
        <CustomSpecModalForm
          isOpen={isAddingItem}
          onClose={() => {
            setIsAddingItem(false);
            setEditingItem(null);
          }}
          onSave={handleSaveItem}
          initialData={editingItem}
          groups={groups}
          activeGroupId={currentGroup.id}
        />
      )}

      {/* MODAL: Add / Edit Group */}
      {isAddingGroup && (
        <div className="fixed inset-0 z-[120] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-sand-300 overflow-hidden">
            <div className="p-4 bg-sand-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{groupFormData.icon || '✨'}</span>
                <h3 className="font-bold text-sm sm:text-base">
                  {editingGroup ? 'แก้ไขหัวข้อสเปก' : 'เพิ่มหัวข้อสเปกใหม่'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddingGroup(false)}
                className="p-1 text-neutral-400 hover:text-white rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGroup} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="space-y-1.5">
                <label className="font-bold text-ink">
                  ชื่อหัวข้อสเปก *
                </label>
                <input
                  type="text"
                  required
                  value={groupFormData.name}
                  onChange={e => setGroupFormData({ ...groupFormData, name: e.target.value })}
                  placeholder="เช่น สไตล์การแต่งหน้า, ระดับความสูง, ทรงวิกผม..."
                  className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    ไอคอน / อีโมจิ
                  </label>
                  <input
                    type="text"
                    value={groupFormData.icon}
                    onChange={e => setGroupFormData({ ...groupFormData, icon: e.target.value })}
                    placeholder="เช่น 💇‍♀️, 👁️, 🍈, 💅, 🧴"
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze text-center text-base"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-ink">
                    ลำดับการแสดง
                  </label>
                  <input
                    type="number"
                    value={groupFormData.order_index}
                    onChange={e => setGroupFormData({ ...groupFormData, order_index: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-medium focus:outline-none focus:border-bronze text-center"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 p-2.5 bg-sand-50 rounded-xl border border-sand-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={groupFormData.is_active === 1}
                  onChange={e => setGroupFormData({ ...groupFormData, is_active: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-emerald-600 rounded border-sand-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-ink">เปิดใช้งานหัวข้อนี้</span>
              </label>

              <div className="pt-3 border-t border-sand-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGroup(false)}
                  className="py-2 px-4 rounded-xl border border-sand-300 text-ink-muted hover:text-ink font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow"
                >
                  บันทึกหัวข้อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX: Preview Image */}
      {previewImage && (
        <div 
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-[140] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="relative max-w-lg w-full bg-neutral-900 border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="p-3 border-b border-white/10 flex items-center justify-between text-white">
              <span className="text-xs font-bold truncate pr-3">📷 {previewImage.title}</span>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 bg-black flex items-center justify-center max-h-[75vh]">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
