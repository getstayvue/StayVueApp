import { useState, useMemo } from 'react';
import { useApi, apiPost, apiPut, apiDelete, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { CheckCircle2, Circle, Sparkles, Share2, Plus, Pencil, Trash2, X, Clock, AlertTriangle, ClipboardCheck, MessageSquare, ClipboardList, Wand2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const PRIORITY_DOT = { high: 'bg-red-400', medium: 'bg-amber-400', low: 'bg-stone-300' };
const AREA_ICONS = {
  Kitchen: '🍳', Bathroom: '🚿', Bedroom: '🛏️', 'Living Room': '🛋️',
  Outdoor: '🌿', Laundry: '🧺', General: '🏠', Entrance: '🚪', Garage: '🚗',
};
const AREAS = Object.keys(AREA_ICONS);

export default function Cleaning() {
  const { propertyId, properties } = useProperty();
  const { data: tasks, loading, refetch } = useApi('/property/cleaning');
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState({});
  const [modal, setModal] = useState(null); // null | 'new' | 'edit'
  const [form, setForm] = useState({ area: 'Kitchen', task: '', priority: 'medium', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [showNotes, setShowNotes] = useState({});
  const [guestName, setGuestName] = useState('');
  const [shareModal, setShareModal] = useState(false);

  const grouped = useMemo(() => {
    const map = {};
    (tasks || []).forEach(t => {
      if (!map[t.area]) map[t.area] = [];
      map[t.area].push(t);
    });
    return map;
  }, [tasks]);

  const areas = Object.keys(grouped);
  const totalTasks = tasks?.length || 0;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const progress = totalTasks ? Math.round((doneCount / totalTasks) * 100) : 0;

  function toggle(id) { setChecked(c => ({ ...c, [id]: !c[id] })); }
  function resetAll() { setChecked({}); setNotes({}); setGuestName(''); }
  function toggleNote(id) { setShowNotes(s => ({ ...s, [id]: !s[id] })); }

  // CRUD
  function openNew(area) { setForm({ area: area || 'Kitchen', task: '', priority: 'medium', sort_order: (tasks?.length || 0) + 1 }); setModal('new'); }
  function openEdit(t) { setForm({ ...t }); setModal('edit'); }

  async function saveTask() {
    setSaving(true);
    try {
      if (modal === 'new') await apiPost('/property/cleaning', form);
      else await apiPut(`/property/cleaning/${form.id}`, form);
      setModal(null); refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function deleteTask(id) {
    if (!confirm('Delete this task?')) return;
    await apiDelete(`/property/cleaning/${id}`);
    refetch();
  }

  const [autoPopulating, setAutoPopulating] = useState(false);
  async function autoPopulate() {
    if (tasks?.length > 0) {
      if (!confirm('This will only work on an empty checklist. Would you like to clear all existing tasks and generate a fresh checklist?')) return;
      // Delete all existing tasks
      for (const t of tasks) {
        await apiDelete(`/property/cleaning/${t.id}`);
      }
    }
    setAutoPopulating(true);
    try {
      await apiPost('/property/cleaning/auto-populate', {});
      refetch();
    } catch (e) { alert(e.message); }
    setAutoPopulating(false);
  }

  // Generate shareable text
  function generateShareText() {
    const propName = propertyId ? properties?.find(p => p.id === propertyId)?.name : 'All Properties';
    let text = `🏠 CLEANING CHECKLIST\n${propName}\n`;
    if (guestName) text += `Guest checkout: ${guestName}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-CA')}\n\n`;

    for (const area of areas) {
      const areaTasks = grouped[area];
      text += `${AREA_ICONS[area] || '📋'} ${area.toUpperCase()}\n`;
      for (const t of areaTasks) {
        const done = checked[t.id];
        const priority = t.priority === 'high' ? ' ⚠️' : '';
        text += `  ${done ? '✅' : '☐'} ${t.task}${priority}\n`;
        if (notes[t.id]) text += `     📝 ${notes[t.id]}\n`;
      }
      text += '\n';
    }
    text += `Progress: ${doneCount}/${totalTasks} tasks (${progress}%)\n`;
    if (progress === 100) text += '✨ All tasks complete — ready for guests!\n';
    return text;
  }

  async function shareChecklist() {
    const text = generateShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Cleaning Checklist', text });
        return;
      } catch {}
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      alert('Checklist copied to clipboard! You can paste it into any messaging app or email.');
    } catch {
      // Final fallback: mailto
      const subject = encodeURIComponent('Cleaning Checklist');
      const body = encodeURIComponent(text);
      window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    }
  }

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Cleaning Checklist</h1><HelpButton sectionId="cleaning" /></div>
        <div className="flex gap-2">
          <button onClick={autoPopulate} disabled={autoPopulating} className="btn-secondary flex items-center gap-1.5"><Wand2 size={14} /> {autoPopulating ? 'Generating…' : 'Auto-Generate'}</button>
          <button onClick={() => openNew()} className="btn-secondary flex items-center gap-1.5"><Plus size={14} /> Add Task</button>
          <button onClick={resetAll} className="btn-secondary flex items-center gap-1.5"><Sparkles size={14} /> Reset</button>
          <button onClick={() => setShareModal(true)} className="btn-primary flex items-center gap-1.5"><Share2 size={14} /> Share</button>
        </div>
      </div>

      {/* Active turnover header */}
      <div className="card p-5">
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium">Turnover Progress</span>
              <span className="text-sm text-stone-500">{doneCount}/{totalTasks} tasks</span>
            </div>
            <div className="h-3.5 bg-stone-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: progress === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #5A7F4B, #476B3A)' }} />
            </div>
          </div>
        </div>
        {progress === 100 && (
          <p className="text-sm text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={16} /> All tasks complete — ready for guests!</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <label className="text-xs text-stone-500">Guest checkout:</label>
          <input className="input-field flex-1 max-w-xs text-sm" placeholder="Guest name (optional)" value={guestName} onChange={e => setGuestName(e.target.value)} />
        </div>
      </div>

      {/* Task groups */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading…</div>
      ) : areas.length === 0 ? (
        <div className="space-y-4">
          <EmptyState
            icon={ClipboardList}
            title="No cleaning checklist yet"
            description="Build a turnover checklist for your cleaner. Share it after each checkout so nothing gets missed between guests."
            steps={[
              'Click "Auto-Generate" for a ready-made 30+ task checklist covering every room',
              'Or click "Add Task" to build your own from scratch',
              'Use the Share button to send the full checklist to your cleaner after each checkout',
            ]}
            tip="The auto-generated checklist covers bedrooms, bathrooms, kitchen, living areas, entrance, laundry, outdoor, and general tasks. Edit it to match your property."
          />
          <div className="text-center">
            <button onClick={autoPopulate} disabled={autoPopulating} className="btn-primary inline-flex items-center gap-2 text-base px-6 py-3">
              <Wand2 size={18} /> {autoPopulating ? 'Generating…' : 'Auto-Generate Checklist'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {areas.map(area => {
            const areaTasks = grouped[area];
            const areaDone = areaTasks.filter(t => checked[t.id]).length;
            const areaComplete = areaDone === areaTasks.length && areaTasks.length > 0;
            return (
              <div key={area} className={`card overflow-hidden transition-all ${areaComplete ? 'ring-1 ring-emerald-200' : ''}`}>
                <div className="px-5 py-3.5 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{AREA_ICONS[area] || '📋'}</span>
                    <span className="font-semibold text-sm">{area}</span>
                    {areaComplete && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">{areaDone}/{areaTasks.length}</span>
                    <button onClick={() => openNew(area)} className="p-1 rounded hover:bg-stone-200 text-stone-400" title="Add task"><Plus size={14} /></button>
                  </div>
                </div>
                <ul className="divide-y divide-stone-50">
                  {areaTasks.map(t => {
                    const done = !!checked[t.id];
                    return (
                      <li key={t.id}>
                        <div className={`px-5 py-3 transition-colors ${done ? 'bg-emerald-50/30' : 'hover:bg-stone-50/50'}`}>
                          <div className="flex items-center gap-3">
                            <button onClick={() => toggle(t.id)} className="shrink-0">
                              {done ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Circle size={18} className="text-stone-300" />}
                            </button>
                            <span className={`flex-1 text-sm ${done ? 'line-through text-stone-400' : ''}`}>{t.task}</span>
                            {t.priority === 'high' && <AlertTriangle size={13} className="text-red-400 shrink-0" title="High priority" />}
                            <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[t.priority] || PRIORITY_DOT.medium}`} title={t.priority} />
                            <button onClick={() => toggleNote(t.id)} className={`p-1 rounded hover:bg-stone-100 ${notes[t.id] ? 'text-brand-500' : 'text-stone-300'}`} title="Add note">
                              <MessageSquare size={13} />
                            </button>
                            <button onClick={() => openEdit(t)} className="p-1 rounded hover:bg-stone-100 text-stone-300 hover:text-stone-500"><Pencil size={13} /></button>
                            <button onClick={() => deleteTask(t.id)} className="p-1 rounded hover:bg-red-50 text-stone-300 hover:text-red-500"><Trash2 size={13} /></button>
                          </div>
                          {showNotes[t.id] && (
                            <div className="mt-2 ml-9">
                              <input className="input-field w-full text-xs" placeholder="Add a note for this task…"
                                value={notes[t.id] || ''} onChange={e => setNotes(n => ({ ...n, [t.id]: e.target.value }))} />
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend - only show when there are tasks */}
      {areas.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-stone-400">
          <span>Priority:</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> High</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Medium</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-stone-300" /> Low</span>
        </div>
      )}

      {/* Share Modal */}
      {shareModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setShareModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><Share2 size={18} className="text-brand-500" /> Share Checklist</h2>
              <button onClick={() => setShareModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-500">Share the cleaning checklist with your cleaning company or team. The checklist includes all tasks, priorities, notes, and current progress.</p>
              <div className="rounded-xl bg-stone-50 p-4 max-h-60 overflow-y-auto">
                <pre className="text-xs text-stone-600 whitespace-pre-wrap font-mono">{generateShareText()}</pre>
              </div>
              <div className="flex gap-2">
                <button onClick={async () => { try { await navigator.clipboard.writeText(generateShareText()); alert('Copied!'); } catch {} }}
                  className="btn-secondary flex-1 flex items-center justify-center gap-1.5"><ClipboardCheck size={14} /> Copy to Clipboard</button>
                <button onClick={shareChecklist} className="btn-primary flex-1 flex items-center justify-center gap-1.5"><Share2 size={14} /> Share</button>
              </div>
              <p className="text-xs text-stone-400 text-center">On mobile, "Share" opens your share sheet (Messages, WhatsApp, email, etc.)</p>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'new' ? 'Add Task' : 'Edit Task'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Area</label>
                <select className="input-field w-full" value={form.area} onChange={e => setF('area', e.target.value)}>
                  {AREAS.map(a => <option key={a} value={a}>{AREA_ICONS[a]} {a}</option>)}
                </select>
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Task *</label>
                <input className="input-field w-full" value={form.task} onChange={e => setF('task', e.target.value)} placeholder="e.g. Wipe down countertops" />
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Priority</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} onClick={() => setF('priority', p)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                        form.priority === p
                          ? p === 'high' ? 'bg-red-100 text-red-700 ring-1 ring-red-300' : p === 'medium' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-300' : 'bg-stone-100 text-stone-700 ring-1 ring-stone-300'
                          : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                      }`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveTask} disabled={saving || !form.task} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
