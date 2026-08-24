import React, { useState, useEffect } from 'react';
import { X, HelpCircle, Save } from 'lucide-react';

export default function FaqModalForm({ faq, onClose, onSave }) {
  const isEdit = !!faq;

  const [formData, setFormData] = useState({
    id: null,
    question: '',
    answer: '',
    category: 'general',
    order_index: 1
  });

  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (faq) {
      setFormData({
        ...faq,
        category: faq.category || 'general',
        order_index: faq.order_index || 1
      });
    }
  }, [faq]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.question || !formData.answer) {
      alert('กรุณากรอกทั้งคำถามและคำตอบ');
      return;
    }

    setSaveLoading(true);
    await onSave(formData);
    setSaveLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl border border-sand-300 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-sand-200 flex items-center justify-between bg-sand-50/80">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-ink flex items-center gap-2">
              <span>{isEdit ? '✏️ แก้ไขคำถาม-คำตอบ' : '❓ เพิ่มคำถามที่พบบ่อยใหม่'}</span>
            </h2>
            <p className="text-xs text-ink-muted">จัดการข้อความคำถามและคำตอบที่จะไปแสดงในโซน FAQ บนหน้าเว็บ</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-sand-200/60 hover:bg-sand-300 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          
          <div className="space-y-1.5">
            <label className="font-semibold text-ink">หัวข้อคำถาม (Question) *</label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={e => setFormData({ ...formData, question: e.target.value })}
              placeholder="เช่น การจัดส่งพัสดุมิดชิดแค่ไหน คนในบ้านจะรู้ไหม?"
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl font-bold text-ink focus:outline-none focus:border-bronze focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-ink">คำตอบและรายละเอียด (Answer) *</label>
            <textarea
              required
              rows={5}
              value={formData.answer}
              onChange={e => setFormData({ ...formData, answer: e.target.value })}
              placeholder="พิมพ์คำตอบอย่างละเอียด สุภาพ และให้ข้อมูลครบถ้วน..."
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-ink">หมวดหมู่คำถาม</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl text-ink focus:outline-none focus:border-bronze focus:bg-white"
              >
                <option value="shipping">การจัดส่งและความลับ (Shipping)</option>
                <option value="product">สเปกและวัสดุสินค้า (Product)</option>
                <option value="care">การทำความสะอาดและดูแล (Care)</option>
                <option value="general">ทั่วไปและการสั่งซื้อ (General)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-ink">ลำดับการแสดงผล (Order)</label>
              <input
                type="number"
                value={formData.order_index}
                onChange={e => setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-sand-300 rounded-xl focus:outline-none focus:border-bronze focus:bg-white"
              />
            </div>
          </div>

          {/* Sticky Actions */}
          <div className="pt-4 border-t border-sand-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-sand-100 hover:bg-sand-200 text-ink font-semibold text-xs sm:text-sm transition-colors border border-sand-300"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={saveLoading}
              className="px-6 py-2.5 rounded-2xl bg-ink hover:bg-ink-soft text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center gap-2"
            >
              <span>{saveLoading ? 'กำลังบันทึก...' : '💾 บันทึกคำถาม-คำตอบ'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
