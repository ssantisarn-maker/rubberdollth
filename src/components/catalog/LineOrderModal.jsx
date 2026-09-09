import React, { useState } from 'react';
import { X, MessageCircle, UserPlus, Send, Copy, Check, CheckCircle2, QrCode, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

export default function LineOrderModal({
  isOpen,
  onClose,
  product,
  selectedOptions = [],
  grandTotal = 0,
  basePriceNum = 0,
  lineMessage = '',
  settings = {},
  siteConfig = {},
  onCustomize = null
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'existing'
  const [step1Done, setStep1Done] = useState(false);
  const [showQr, setShowQr] = useState(false);

  if (!isOpen || !product) return null;

  const lineId = (settings.line_id || siteConfig.lineId || 'RUBBERDOLL.TH').replace(/^@/, '');
  const addFriendUrl = settings.line_url || siteConfig.lineUrl || `https://line.me/R/ti/p/~${lineId}`;
  const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent(lineMessage)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(addFriendUrl)}`;

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(lineMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      const input = document.createElement('textarea');
      input.value = lineMessage;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleStep1AddFriend = async () => {
    await handleCopyMessage();
    setStep1Done(true);
    window.open(addFriendUrl, '_blank', 'noopener,noreferrer');
  };

  const handleStep2SendOrder = async () => {
    await handleCopyMessage();
    window.open(lineShareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-ink/75 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sand-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-[#06C755] to-emerald-700 p-4 sm:p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5 fill-white text-white" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-base sm:text-lg leading-tight">
                สั่งซื้อ / ส่งรายการเข้า LINE
              </h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                LINE ID: <span className="font-mono font-bold text-white bg-white/20 px-1.5 py-0.5 rounded">{lineId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/30 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* Product Summary Box */}
          <div className="p-3 sm:p-3.5 bg-sand-50 rounded-2xl border border-sand-200 flex items-center gap-3">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                className="w-14 h-18 sm:w-16 sm:h-20 object-cover rounded-xl border border-sand-200 shrink-0 bg-white"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-bold text-bronze uppercase tracking-wider">
                รหัสรุ่น: {product.code || '-'}
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-ink truncate mt-0.5">
                {product.name}
              </h4>

              {selectedOptions.length > 0 && (
                <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>เพิ่มออฟชั่นพิเศษ {selectedOptions.length} รายการ</span>
                </div>
              )}

              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-xs text-ink-muted">ยอดรวมทั้งสิ้น:</span>
                <span className="font-sans font-extrabold text-sm sm:text-base text-bronze">
                  ฿{grandTotal > 0 ? grandTotal.toLocaleString() : (product.price || '-')}.-
                </span>
              </div>
            </div>
          </div>

          {/* Quick Customize Option Link if opened without options */}
          {onCustomize && selectedOptions.length === 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onCustomize(product);
              }}
              className="w-full py-2 px-3 rounded-xl border border-sand-300 bg-sand-50 hover:bg-sand-100 text-ink text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-bronze" />
              <span>ต้องการเลือกออฟชั่นเสริม (ระบบอุ่น, โครงยืน ฯลฯ) คลิกที่นี่</span>
            </button>
          )}

          {/* Customer Status Selector Tabs */}
          <div className="bg-sand-100/80 p-1 rounded-2xl grid grid-cols-2 gap-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'new'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ลูกค้าใหม่ (ยังไม่เคยแอด)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'existing'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ลูกค้าเดิม (แอดเพื่อนแล้ว)</span>
            </button>
          </div>

          {/* TAB 1: For New Customers (2-Step Guide) */}
          {activeTab === 'new' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              
              <div className="text-xs text-ink-soft bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-2xl leading-relaxed">
                💡 <strong className="text-emerald-900">สำหรับลูกค้าใหม่:</strong> ทำตาม 2 ขั้นตอนนี้ เพื่อให้ส่งข้อมูลและรายการออฟชั่นเข้า LINE ร้านค้าได้ทันทีครับ
              </div>

              {/* Step 1: Add Friend */}
              <div className="p-3.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] font-mono">1</span>
                    <span>ขั้นตอนที่ 1: แอดเพื่อนร้านค้า</span>
                  </span>
                  {step1Done && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Check className="w-3 h-3" /> แอดแล้ว
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-ink-muted">
                  กดปุ่มด้านล่างเพื่อเปิด LINE ร้านค้า แล้วกด <strong>"เพิ่มเพื่อน" (Add Friend)</strong> หรือ <strong>"แชท" (Chat)</strong>
                </p>

                <button
                  type="button"
                  onClick={handleStep1AddFriend}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs sm:text-sm font-bold shadow flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>กดแอดเพื่อน LINE: {lineId}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-100" />
                </button>
                <div className="text-[10px] text-center text-emerald-700">
                  *(ระบบจะคัดลอกข้อความคำสั่งซื้อทั้งหมดลงเครื่องให้คุณอัตโนมัติ)*
                </div>
              </div>

              {/* Step 2: Send Order into LINE */}
              <div className={`p-3.5 rounded-2xl border space-y-2 transition-all ${
                step1Done 
                  ? 'border-emerald-500 bg-white shadow-md ring-2 ring-emerald-400/20' 
                  : 'border-sand-200 bg-sand-50/60 opacity-90'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                      step1Done ? 'bg-emerald-600 text-white' : 'bg-sand-400 text-white'
                    }`}>2</span>
                    <span>ขั้นตอนที่ 2: ส่งรายการสั่งซื้อเข้า LINE</span>
                  </span>
                </div>

                <p className="text-[11px] text-ink-muted">
                  เมื่อกดแอดเพื่อนแล้ว ให้กดปุ่มนี้เพื่อส่งข้อมูลสินค้าพร้อมออฟชั่นที่เลือกเข้าแชทร้านค้า
                </p>

                <button
                  type="button"
                  onClick={handleStep2SendOrder}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
                    step1Done
                      ? 'bg-[#06C755] hover:bg-[#05b34c] text-white ring-2 ring-emerald-300'
                      : 'bg-emerald-700/80 hover:bg-emerald-700 text-white'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>กดส่งรายการสั่งซื้อเข้า LINE</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-100" />
                </button>
              </div>

              {/* Alternative Paste Method */}
              <div className="text-[11px] text-ink-soft bg-sand-100/70 p-2.5 rounded-xl flex items-start gap-2">
                <span className="text-emerald-700 font-bold shrink-0">💡 ทางเลือกสำรอง:</span>
                <span>
                  หากเปิดห้องแชทร้านค้าแล้ว สามารถกด <strong>"วาง" (Paste)</strong> ในช่องพิมพ์ข้อความของ LINE แล้วกดส่งได้ทันทีครับ
                </span>
              </div>

            </div>
          )}

          {/* TAB 2: For Existing Customers (Direct 1-Click Send) */}
          {activeTab === 'existing' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="text-xs text-ink-soft bg-sand-50 border border-sand-200 p-3 rounded-2xl leading-relaxed">
                ✓ <strong className="text-ink">สำหรับลูกค้าที่เคยแอดเพื่อนร้านค้าแล้ว:</strong> คุณสามารถกดปุ่มด้านล่างเพื่อส่งข้อมูลและออฟชั่นเข้าห้องแชทร้าน <strong>{lineId}</strong> ได้ทันที
              </div>

              <button
                type="button"
                onClick={handleStep2SendOrder}
                className="w-full py-3.5 px-4 rounded-2xl bg-[#06C755] hover:bg-[#05b34c] text-white font-bold text-sm sm:text-base shadow-md flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
              >
                <Send className="w-5 h-5 fill-white" />
                <span>🚀 ส่งรายการสั่งซื้อเข้า LINE ทันที</span>
                <ExternalLink className="w-4 h-4 text-emerald-100" />
              </button>

              <p className="text-[11px] text-center text-ink-muted">
                เมื่อ LINE เปิดขึ้นมา ให้แตะเลือกแชท <strong>"{lineId}"</strong> แล้วกดส่งได้เลยครับ
              </p>
            </div>
          )}

          {/* Copy Message Button & Preview */}
          <div className="pt-2 border-t border-sand-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">
                📋 ข้อความคำสั่งซื้อของคุณ:
              </span>
              <button
                type="button"
                onClick={handleCopyMessage}
                className={`py-1 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold'
                    : 'bg-white hover:bg-sand-50 border-sand-300 text-ink shadow-2xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>✓ คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-bronze" />
                    <span>คัดลอกข้อความ</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 bg-sand-100/80 rounded-xl text-[11px] text-ink font-mono whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed border border-sand-200 select-all">
              {lineMessage}
            </div>

            {/* Toggle QR Code View */}
            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowQr(prev => !prev)}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? 'ซ่อน QR Code ร้านค้า' : 'แสดง QR Code ร้านค้า (สำหรับสแกน)'}</span>
              </button>
              
              <span className="text-[11px] text-ink-muted font-mono">
                ID: {lineId}
              </span>
            </div>

            {/* QR Code Display */}
            {showQr && (
              <div className="p-4 bg-sand-50 border border-sand-200 rounded-2xl flex flex-col items-center justify-center gap-2 animate-in fade-in">
                <img
                  src={qrCodeUrl}
                  alt={`LINE QR Code ${lineId}`}
                  className="w-40 h-40 bg-white p-2 rounded-xl shadow-sm border border-sand-200"
                />
                <p className="text-xs font-bold text-ink">
                  สแกนด้วยแอป LINE เพื่อเพิ่มเพื่อน
                </p>
                <span className="text-[10px] text-ink-muted">
                  LINE ID: {lineId}
                </span>
              </div>
            )}
          </div>

          {/* Privacy & Trust Badge */}
          <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-center gap-2 text-[11px] text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>บรรจุกล่องทึบ 2 ชั้น ไม่ระบุชื่อสินค้า รักษาความลับ 100%</span>
          </div>

        </div>

      </div>
    </div>
  );
}
