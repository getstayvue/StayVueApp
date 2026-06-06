import { Plus, ArrowRight } from 'lucide-react';

/**
 * EmptyState — shown on My App pages when the user has no data yet.
 * Clean, minimal, helpful without being noisy.
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  steps = [],      // [{ text: "..." }]  — ordered quick-start steps
  action,          // { label: "Add your first booking", onClick: fn }
  tip,             // optional extra tip shown at bottom
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-5">
        <Icon size={26} />
      </div>

      {/* Title + description */}
      <h2 className="text-lg font-semibold text-stone-800 mb-2">{title}</h2>
      <p className="text-sm text-stone-500 leading-relaxed mb-6">{description}</p>

      {/* Quick-start steps */}
      {steps.length > 0 && (
        <div className="w-full bg-stone-50 rounded-2xl p-4 mb-6 text-left space-y-2.5">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">How to get started</p>
          {steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-white border border-stone-200 text-stone-400 text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                {i + 1}
              </span>
              <p className="text-sm text-stone-600 leading-relaxed">{step}</p>
            </div>
          ))}
        </div>
      )}

      {/* CTA button */}
      {action && (
        <button onClick={action.onClick}
          className="bg-brand-500 text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-brand-600 transition-colors flex items-center gap-2 shadow-sm shadow-brand-500/20 mb-4">
          <Plus size={16} />
          {action.label}
        </button>
      )}

      {/* Tip */}
      {tip && (
        <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-2">
          <span className="text-amber-400">💡</span>
          {tip}
        </p>
      )}
    </div>
  );
}
