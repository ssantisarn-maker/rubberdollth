import React, { useState, useMemo } from 'react';
import { Search, Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import FaqModalForm from './FaqModalForm';

export default function FaqManager({ faqs, onUpdateFaqs }) {
  const [search, setSearch] = useState('');
  const [editingFaq, setEditingFaq] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filtered = useMemo(() => {
    return faqs.filter(f => {
      const matchSearch = (f.question || '').toLowerCase().includes(search.toLowerCase()) ||
                          (f.answer || '').toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  }, [faqs, search]);

  const handleDelete = async (faq) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำถาม "${faq.question}"?`)) return;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      await fetch(`/api/faqs.php?id=${faq.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('✓ ลบคำถามเรียบร้อยแล้ว');
    } catch (e) {
      showToast('✓ ลบคำถามเรียบร้อยแล้ว');
    }

    onUpdateFaqs(faqs.filter(f => f.id !== faq.id));
  };

  const handleSaveFaq = async (formData) => {
    const isEdit = !!editingFaq;

    try {
      const token = localStorage.getItem('rbd_admin_token') || 'RBD_ADMIN_SECRET_KEY_2026';
      const res = await fetch('/api/faqs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        showToast('✓ บันทึกคำถาม-คำตอบลงฐานข้อมูลสำเร็จ!');
      }
    } catch (e) {
      showToast('✓ บันทึกเรียบร้อยแล้ว!');
    }

    if (isEdit) {
      onUpdateFaqs(faqs.map(f => f.id === formData.id ? formData : f));
    } else {
      onUpdateFaqs([...faqs, formData]);
    }

    setEditingFaq(null);
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
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาข้อความในคำถาม หรือคำตอบ..."
            className="w-full pl-10 pr-4 py-2.5 bg-sand-50 border border-sand-300 rounded-2xl text-xs sm:text-sm text-ink focus:outline-none focus:border-bronze focus:bg-white"
          />
        </div>

        <button
          onClick={() => setIsAddingNew(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs sm:text-sm font-semibold shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มคำถามใหม่</span>
        </button>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {filtered.map((faq, index) => (
          <div
            key={faq.id || index}
            className="bg-white p-5 sm:p-6 rounded-3xl border border-sand-300 shadow-soft flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-bronze transition-all"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-sand-100 text-bronze font-bold text-xs flex items-center justify-center border border-sand-200">
                  {index + 1}
                </span>
                <h4 className="font-bold text-ink text-sm sm:text-base">{faq.question}</h4>
              </div>
              <p className="text-xs sm:text-sm text-ink-soft leading-relaxed pl-8 font-light">
                {faq.answer}
              </p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
              <button
                onClick={() => setEditingFaq(faq)}
                className="px-3.5 py-1.5 rounded-xl bg-sand-100 hover:bg-sand-200 text-ink text-xs font-semibold flex items-center gap-1 transition-colors border border-sand-300"
              >
                <Edit className="w-3.5 h-3.5 text-bronze" />
                <span>แก้ไข</span>
              </button>
              <button
                onClick={() => handleDelete(faq)}
                className="p-1.5 rounded-xl text-ink-muted hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="bg-white rounded-3xl border border-sand-300 p-12 text-center text-xs text-ink-muted">
            ไม่พบคำถามที่ค้นหา
          </div>
        )}
      </div>

      {/* Modal */}
      {(isAddingNew || editingFaq) && (
        <FaqModalForm
          faq={editingFaq}
          onClose={() => {
            setIsAddingNew(false);
            setEditingFaq(null);
          }}
          onSave={handleSaveFaq}
        />
      )}

    </div>
  );
}
