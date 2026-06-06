import { Clock } from 'lucide-react';

export default function TrialBanner({ daysLeft, hoursLeft }) {
  const urgent = daysLeft <= 1;
  const label = daysLeft > 0
    ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left in your free trial`
    : `${hoursLeft} hour${hoursLeft === 1 ? '' : 's'} left in your free trial`;

  return (
    <div className={`text-center text-xs font-medium py-2 px-4 flex items-center justify-center gap-1.5 ${
      urgent
        ? 'bg-amber-50 text-amber-700 border-b border-amber-100'
        : 'bg-brand-50 text-brand-700 border-b border-brand-100'
    }`}>
      <Clock size={12} className={urgent ? 'text-amber-500' : 'text-brand-500'} />
      <span>{label}</span>
      <span className="text-stone-400 mx-1">·</span>
      <span className="text-stone-500 font-normal">All features unlocked during trial</span>
    </div>
  );
}
