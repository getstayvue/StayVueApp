import { useState } from 'react';
import { LayoutDashboard, CalendarRange, DollarSign, Users, Users2, ArrowRight, X, Eye, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { DEMO_HIGHLIGHTS } from '../data/demoData';

const ICONS = { LayoutDashboard, CalendarRange, DollarSign, Users, Users2 };

export default function DemoOverlay({ onClose, onNavigate }) {
  const [step, setStep] = useState(0);
  const isLast = step === DEMO_HIGHLIGHTS.length - 1;
  const h = DEMO_HIGHLIGHTS[step];
  const Icon = ICONS[h.icon] || LayoutDashboard;

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 text-white px-6 pt-6 pb-5 relative">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/20 transition-colors">
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 text-brand-200 text-xs font-medium mb-4">
            <Sparkles size={14} />
            <span>Quick tour · {step + 1} of {DEMO_HIGHLIGHTS.length}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
            <Icon size={24} />
          </div>
          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {h.title}
          </h2>
          <p className="text-brand-100 text-sm leading-relaxed">{h.desc}</p>
        </div>

        {/* Tip */}
        <div className="px-6 py-4">
          <div className="bg-amber-50 rounded-xl px-4 py-3 flex items-start gap-2.5">
            <Eye size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Pro tip: </span>{h.tip}
            </p>
          </div>
        </div>

        {/* Progress dots + nav */}
        <div className="px-6 pb-5 flex items-center justify-between">
          <div className="flex gap-1.5">
            {DEMO_HIGHLIGHTS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className={`rounded-full transition-all ${i === step ? 'w-6 h-2 bg-brand-500' : 'w-2 h-2 bg-stone-200 hover:bg-stone-300'}`} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors">
                <ChevronLeft size={18} />
              </button>
            )}
            {isLast ? (
              <button onClick={onClose}
                className="bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-sm shadow-brand-500/20">
                Explore the Demo <ArrowRight size={15} />
              </button>
            ) : (
              <button onClick={() => setStep(s => s + 1)}
                className="bg-brand-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-sm shadow-brand-500/20">
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        <div className="border-t border-stone-100 px-6 py-3 text-center">
          <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600 transition-colors">
            Skip tour — I'll explore on my own
          </button>
        </div>
      </div>
    </div>
  );
}
