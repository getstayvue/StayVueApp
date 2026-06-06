import { Eye, Edit3 } from 'lucide-react';

export default function DemoToggle({ isDemo, onToggle, compact = false }) {
  if (compact) {
    return (
      <button onClick={onToggle} title={isDemo ? 'Viewing demo — tap for your app' : 'Viewing your app — tap for demo'}
        className={`p-2 rounded-xl transition-all ${isDemo ? 'bg-violet-100 text-violet-600' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
        {isDemo ? <Eye size={16} /> : <Edit3 size={16} />}
      </button>
    );
  }

  return (
    <div className="flex bg-stone-100 rounded-xl p-0.5">
      <button onClick={() => isDemo && onToggle()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          !isDemo ? 'bg-white shadow-sm text-stone-800' : 'text-stone-400 hover:text-stone-600'
        }`}>
        <Edit3 size={12} /> My App
      </button>
      <button onClick={() => !isDemo && onToggle()}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isDemo ? 'bg-violet-500 shadow-sm text-white' : 'text-stone-400 hover:text-stone-600'
        }`}>
        <Eye size={12} /> Demo
      </button>
    </div>
  );
}
