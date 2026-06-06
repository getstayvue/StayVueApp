import { Eye, X } from 'lucide-react';

export default function DemoBanner({ onExit }) {
  return (
    <div className="bg-violet-500 text-white text-xs font-medium py-2 px-4 flex items-center justify-center gap-2 border-b border-violet-400">
      <Eye size={12} />
      <span>You're viewing the demo with sample data</span>
      <span className="text-violet-200">·</span>
      <span className="text-violet-200">Read-only</span>
      <button onClick={onExit} className="ml-2 px-2 py-0.5 rounded-md bg-white/20 hover:bg-white/30 transition-colors text-[11px]">
        Switch to My App
      </button>
    </div>
  );
}
