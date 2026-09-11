import { useState, useEffect, useCallback, useMemo } from 'react';

const defaultSpecs = {
  groups: [
    { id: 'wig', name: 'วิกผม', icon: '💇‍♀️', target_categories: 'silicone,ready', order_index: 1, is_active: 1 },
    { id: 'eyes', name: 'สีตา', icon: '👁️', target_categories: 'silicone,ready', order_index: 2, is_active: 1 },
    { id: 'breast', name: 'ขนาดหน้าอก', icon: '🍈', target_categories: 'all', order_index: 3, is_active: 1 },
    { id: 'nails', name: 'สีเล็บ', icon: '💅', target_categories: 'silicone,ready', order_index: 4, is_active: 1 },
    { id: 'skin', name: 'สีผิว', icon: '🧴', target_categories: 'all', order_index: 5, is_active: 1 }
  ],
  items: [
    // วิกผม
    { id: 'wig_1', group_id: 'wig', name: 'ผมยาวลอน สีดำธรรมชาติ', price: 0, image: '', description: 'วิกผมสัมผัสนุ่มลื่น สไตล์หวานละมุน', is_default: 1, is_active: 1, show_price: 1, show_free: 1, order_index: 1 },
    { id: 'wig_2', group_id: 'wig', name: 'ผมยาวตรง สีน้ำตาลคาราเมล', price: 0, image: '', description: 'ทรงตรงสลวย เรียบหรูดูแพง', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 2 },
    { id: 'wig_3', group_id: 'wig', name: 'ผมสั้นบ๊อบ สีบลอนด์ทองสว่าง', price: 0, image: '', description: 'ลุคคิวท์ สดใสน่ารักสไตล์อนิเมะ', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 3 },
    { id: 'wig_4', group_id: 'wig', name: 'วิกผมเกรดพรีเมียมทนความร้อนสูงพิเศษ', price: 800, image: '', description: 'ใยสังเคราะห์พิเศษ หนีบไดร์ดัดลอนได้อิสระ', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 4 },

    // สีตา
    { id: 'eyes_1', group_id: 'eyes', name: 'น้ำตาลธรรมชาติ (Natural Brown)', price: 0, image: '', description: 'แววตาอบอุ่น มีมิติเสมือนจริง', is_default: 1, is_active: 1, show_price: 1, show_free: 1, order_index: 1 },
    { id: 'eyes_2', group_id: 'eyes', name: 'ฟ้าคริสตัล (Ocean Crystal Blue)', price: 0, image: '', description: 'ตาสีฟ้าประกาย สไตล์สาวลูกครึ่งยุโรป', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 2 },
    { id: 'eyes_3', group_id: 'eyes', name: 'เขียวมรกต (Emerald Green)', price: 0, image: '', description: 'แววตาเซ็กซี่ มีเสน่ห์น่าค้นหา', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 3 },
    { id: 'eyes_4', group_id: 'eyes', name: 'ม่วงอนิเมะ (Anime Violet Purple)', price: 0, image: '', description: 'สีตาโทนพิเศษสำหรับสายคอสเพลย์/อนิเมะ', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 4 },
    { id: 'eyes_5', group_id: 'eyes', name: 'ตาแก้วอะคริลิกขยับมุมมอง 3D', price: 1500, image: '', description: 'ดวงตาเสมือนมองตามผู้ใช้ มีชีวิตชีวาขั้นสูงสุด', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 5 },

    // ขนาดหน้าอก
    { id: 'breast_1', group_id: 'breast', name: 'คัพ C มาตรฐาน สัมผัสธรรมชาติ', price: 0, image: '', description: 'ขนาดสมส่วน เหมาะกับทุกสรีระ', is_default: 1, is_active: 1, show_price: 1, show_free: 1, order_index: 1 },
    { id: 'breast_2', group_id: 'breast', name: 'คัพ D สัมผัสนุ่มยืดหยุ่นพิเศษ', price: 1200, image: '', description: 'ขนาดกำลังดี นุ่มเด้งเป็นธรรมชาติ', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 2 },
    { id: 'breast_3', group_id: 'breast', name: 'คัพ E เสริมซิลิโคนเหลวสัมผัสเด้ง', price: 2500, image: '', description: 'หน้าอกไซส์ใหญ่ นุ่มยวบเหมือนคนจริง 100%', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 3 },
    { id: 'breast_4', group_id: 'breast', name: 'คัพ G บิ๊กไซส์ อกตูมพรีเมียม', price: 3500, image: '', description: 'อกใหญ่พิเศษ สวยเด่นตระการตา', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 4 },

    // สีเล็บ
    { id: 'nails_1', group_id: 'nails', name: 'เล็บใสธรรมชาติ (French Natural)', price: 0, image: '', description: 'เคลือบเงาสุขภาพดี ดูสะอาดสะอ้าน', is_default: 1, is_active: 1, show_price: 1, show_free: 1, order_index: 1 },
    { id: 'nails_2', group_id: 'nails', name: 'แดงไวน์เชอร์รี่ (Cherry Wine Red)', price: 0, image: '', description: 'เฉดสีแดงลักชัวรี เพิ่มเสน่ห์เย้ายวน', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 2 },
    { id: 'nails_3', group_id: 'nails', name: 'ชมพูนู้ดพาสเทล (Soft Pink Nude)', price: 0, image: '', description: 'สไตล์คุณหนู หวานน่ารัก', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 3 },
    { id: 'nails_4', group_id: 'nails', name: 'เพ้นท์เล็บเจล 3D สไตล์ญี่ปุ่น', price: 500, image: '', description: 'ติดลวดลายสวยงาม ทนทานไม่หลุดลอก', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 4 },

    // สีผิว
    { id: 'skin_1', group_id: 'skin', name: 'ผิวขาวเหลืองธรรมชาติ (Natural Asian)', price: 0, image: '', description: 'โทนยอดนิยม สัมผัสเนียนละมุน', is_default: 1, is_active: 1, show_price: 1, show_free: 1, order_index: 1 },
    { id: 'skin_2', group_id: 'skin', name: 'ผิวขาวโอโม่ (Snow Pale White)', price: 0, image: '', description: 'ผิวขาวใสออร่า ดุจหิมะบริสุทธิ์', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 2 },
    { id: 'skin_3', group_id: 'skin', name: 'ผิวสีน้ำผึ้ง/สองสี (Warm Honey Tan)', price: 0, image: '', description: 'โทนสุขภาพดี ผิวเนียนคมเข้ม', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 3 },
    { id: 'skin_4', group_id: 'skin', name: 'ผิวสีแทนเข้ม (Golden Bronze Tan)', price: 0, image: '', description: 'สไตล์สายฝอ สวยคมเซ็กซี่', is_default: 0, is_active: 1, show_price: 1, show_free: 1, order_index: 4 }
  ]
};

export function useLiveCustomSpecs(includeAll = false) {
  const [data, setData] = useState(() => {
    try {
      const local = localStorage.getItem('rbd_custom_specs_cache');
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.groups) && parsed.groups.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
    return defaultSpecs;
  });

  const [loading, setLoading] = useState(false);

  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    try {
      const param = includeAll ? '?all=1&' : '?';
      const res = await fetch(`/api/custom_specs.php${param}_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Specs API offline');
      const resData = await res.json();
      if (resData.success && resData.data && Array.isArray(resData.data.groups)) {
        setData(resData.data);
        localStorage.setItem('rbd_custom_specs_cache', JSON.stringify(resData.data));
        return resData.data;
      }
    } catch (err) {
      console.warn('Using local specs cache:', err.message);
    } finally {
      setLoading(false);
    }
    return null;
  }, [includeAll]);

  useEffect(() => {
    fetchSpecs();

    const handleSpecsUpdate = (e) => {
      if (e.detail && typeof e.detail === 'object' && Array.isArray(e.detail.groups)) {
        setData(e.detail);
      }
    };
    window.addEventListener('rbd_custom_specs_updated', handleSpecsUpdate);
    return () => {
      window.removeEventListener('rbd_custom_specs_updated', handleSpecsUpdate);
    };
  }, [fetchSpecs]);

  const updateSpecsState = (newData) => {
    setData(newData);
    try {
      localStorage.setItem('rbd_custom_specs_cache', JSON.stringify(newData));
      window.dispatchEvent(new CustomEvent('rbd_custom_specs_updated', { detail: newData }));
    } catch (e) {}
  };

  const groups = useMemo(() => {
    return (data.groups || []).slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [data.groups]);

  const activeGroups = useMemo(() => {
    return groups.filter(g => g.is_active !== 0);
  }, [groups]);

  const items = useMemo(() => {
    return (data.items || []).slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [data.items]);

  const itemsByGroup = useMemo(() => {
    const map = {};
    (data.groups || []).forEach(g => { map[g.id] = []; });
    (data.items || []).forEach(item => {
      if (item.is_active !== 0) {
        if (!map[item.group_id]) map[item.group_id] = [];
        map[item.group_id].push(item);
      }
    });
    Object.keys(map).forEach(gid => {
      map[gid].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    });
    return map;
  }, [data.groups, data.items]);

  const allItemsByGroup = useMemo(() => {
    const map = {};
    (data.groups || []).forEach(g => { map[g.id] = []; });
    (data.items || []).forEach(item => {
      if (!map[item.group_id]) map[item.group_id] = [];
      map[item.group_id].push(item);
    });
    Object.keys(map).forEach(gid => {
      map[gid].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    });
    return map;
  }, [data.groups, data.items]);

  // Default selection mapped by group_id
  const defaultSelection = useMemo(() => {
    const sel = {};
    activeGroups.forEach(g => {
      const gItems = itemsByGroup[g.id] || [];
      const def = gItems.find(i => i.is_default === 1) || gItems[0];
      if (def) {
        sel[g.id] = def.id;
      }
    });
    return sel;
  }, [activeGroups, itemsByGroup]);

  // Save or Edit Group
  const saveGroup = async (groupData) => {
    const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
    const res = await fetch('/api/custom_specs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'save_group', group: groupData })
    });
    const resJson = await res.json();
    if (resJson.success && resJson.data) {
      updateSpecsState(resJson.data);
      return resJson.data;
    }
    // Local fallback update
    const nextGroups = (data.groups || []).filter(g => g.id !== groupData.id);
    nextGroups.push(groupData);
    const updated = { ...data, groups: nextGroups };
    updateSpecsState(updated);
    return updated;
  };

  // Delete Group
  const deleteGroup = async (groupId) => {
    const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
    const res = await fetch('/api/custom_specs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'delete_group', id: groupId })
    });
    const resJson = await res.json();
    if (resJson.success && resJson.data) {
      updateSpecsState(resJson.data);
      return resJson.data;
    }
    const nextGroups = (data.groups || []).filter(g => g.id !== groupId);
    const nextItems = (data.items || []).filter(i => i.group_id !== groupId);
    const updated = { groups: nextGroups, items: nextItems };
    updateSpecsState(updated);
    return updated;
  };

  // Save or Edit Item
  const saveItem = async (itemData) => {
    const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
    const res = await fetch('/api/custom_specs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'save_item', item: itemData })
    });
    const resJson = await res.json();
    if (resJson.success && resJson.data) {
      updateSpecsState(resJson.data);
      return resJson.data;
    }
    const nextItems = (data.items || []).filter(i => i.id !== itemData.id);
    if (itemData.is_default === 1) {
      nextItems.forEach(i => {
        if (i.group_id === itemData.group_id) i.is_default = 0;
      });
    }
    nextItems.push(itemData);
    const updated = { ...data, items: nextItems };
    updateSpecsState(updated);
    return updated;
  };

  // Delete Item
  const deleteItem = async (itemId) => {
    const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
    const res = await fetch('/api/custom_specs.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ action: 'delete_item', id: itemId })
    });
    const resJson = await res.json();
    if (resJson.success && resJson.data) {
      updateSpecsState(resJson.data);
      return resJson.data;
    }
    const nextItems = (data.items || []).filter(i => i.id !== itemId);
    const updated = { ...data, items: nextItems };
    updateSpecsState(updated);
    return updated;
  };

  // Reorder Items in a group
  const reorderItems = async (groupId, itemIds) => {
    // Optimistic local update
    const orderMap = {};
    itemIds.forEach((id, idx) => { orderMap[id] = idx + 1; });
    const nextItems = (data.items || []).map(i => {
      if (orderMap[i.id] !== undefined) {
        return { ...i, order_index: orderMap[i.id] };
      }
      return i;
    });
    const updated = { ...data, items: nextItems };
    updateSpecsState(updated);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/custom_specs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'reorder_items', group_id: groupId, item_ids: itemIds })
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        updateSpecsState(resJson.data);
      }
    } catch (e) {
      console.warn('Reorder specs API error:', e);
    }
  };

  // Reorder Groups
  const reorderGroups = async (groupIds) => {
    // Optimistic local update
    const orderMap = {};
    groupIds.forEach((id, idx) => { orderMap[id] = idx + 1; });
    const nextGroups = (data.groups || []).map(g => {
      if (orderMap[g.id] !== undefined) {
        return { ...g, order_index: orderMap[g.id] };
      }
      return g;
    });
    const updated = { ...data, groups: nextGroups };
    updateSpecsState(updated);

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/custom_specs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ action: 'reorder_groups', group_ids: groupIds })
      });
      const resJson = await res.json();
      if (resJson.success && resJson.data) {
        updateSpecsState(resJson.data);
      }
    } catch (e) {
      console.warn('Reorder groups API error:', e);
    }
  };

  return {
    groups,
    activeGroups,
    items,
    itemsByGroup,
    allItemsByGroup,
    defaultSelection,
    loading,
    reload: fetchSpecs,
    saveGroup,
    deleteGroup,
    saveItem,
    deleteItem,
    reorderItems,
    reorderGroups,
    setSpecsData: updateSpecsState
  };
}
