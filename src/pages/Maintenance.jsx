import { useState, useRef } from 'react';
import { useApi, apiPost, apiPut, apiDelete, formatCurrency, formatDate, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Plus, Pencil, Trash2, X, AlertTriangle, Clock, CheckCircle2, ShieldCheck, Wrench, Upload, Download, Image, File, Eye, Paperclip } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { compressImage } from '../lib/compress';

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename || '');
}

const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700',
  in_progress: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-stone-100 text-stone-500',
};
const STATUS_ICONS = { pending: Clock, in_progress: AlertTriangle, completed: CheckCircle2, cancelled: X };
const PRIORITY_COLORS = {
  urgent: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  high: 'bg-orange-50 text-orange-700',
  medium: 'bg-yellow-50 text-yellow-700',
  low: 'bg-stone-50 text-stone-500',
};

const EMPTY = { date: new Date().toISOString().slice(0, 10), description: '', category: '', vendor: '', cost: 0, status: 'pending', priority: 'medium', has_warranty: 0, next_service: '', notes: '' };

export default function Maintenance() {
  const { propertyId } = useProperty();
  const pid = propertyId || 0;
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const qs = `?limit=200&property_id=${pid}${statusFilter ? `&status=${statusFilter}` : ''}${priorityFilter ? `&priority=${priorityFilter}` : ''}`;
  const { data, loading, refetch } = useApi(`/maintenance${qs}`, [statusFilter, priorityFilter, pid]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const modalFileRef = useRef(null);
  const [previewFile, setPreviewFile] = useState(null);
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const items = data?.data || [];
  const totalCost = items.reduce((s, r) => s + (r.cost || 0), 0);
  const openCount = items.filter(r => r.status === 'pending' || r.status === 'in_progress').length;

  function openNew() { setForm({ ...EMPTY }); setModalFile(null); setModal('new'); }
  function openEdit(row) { setForm({ ...row, next_service: row.next_service || '' }); setModalFile(null); setModal('edit'); }

  function handleModalFileSelect(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_FILE_SIZE) { alert('Max 25 MB.'); e.target.value = ''; return; }
    setModalFile(file);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, next_service: form.next_service || null };
      let recordId = form.id;
      if (modal === 'new') {
        const result = await apiPost('/maintenance', payload);
        recordId = result.id;
      } else {
        await apiPut(`/maintenance/${form.id}`, payload);
      }
      // Upload file if selected
      if (modalFile && recordId) {
        const { data: compressedData, filename: compressedName } = await compressImage(modalFile);
        await apiPost(`/maintenance/${recordId}/upload`, { filename: compressedName, data: compressedData });
      }
      setModal(null);
      setModalFile(null);
      refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Delete this record?')) return;
    await apiDelete(`/maintenance/${id}`);
    refetch();
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Maintenance Log</h1><HelpButton sectionId="maintenance" /></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Record</button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Records</p><p className="text-xl font-semibold">{items.length}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Open Items</p><p className="text-xl font-semibold text-amber-600">{openCount}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Cost</p><p className="text-xl font-semibold">{formatCurrency(totalCost)}</p></div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select className="input-field" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Vendor</th>
                <th className="px-4 py-3 font-medium text-right">Cost</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Warranty</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-stone-400">Loading…</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={9}>
                  <EmptyState
                    icon={Wrench}
                    title="No maintenance records yet"
                    description="Track repairs, service visits, and upkeep so nothing falls through the cracks between guests."
                    steps={[
                      'Click "Add" to log a repair, service call, or inspection',
                      'Set priority (high/medium/low) to know what needs attention first',
                      'Maintenance costs flow into your Tax Centre as deductible expenses',
                    ]}
                    tip="Regular HVAC service and safety checks are also worth logging for insurance purposes."
                  />
                </td></tr>
              ) : items.map(r => (
                <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3">{formatDate(r.date)}</td>
                  <td className="px-4 py-3 font-medium max-w-[200px]">
                    <div className="flex items-center gap-1.5">{r.file_path && <Paperclip size={12} className="text-brand-500 shrink-0" />}{r.description}</div>
                    {r.notes && <div className="text-xs text-stone-400 truncate">{r.notes}</div>}
                  </td>
                  <td className="px-4 py-3">{r.category || '—'}</td>
                  <td className="px-4 py-3">{r.vendor || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(r.cost)}</td>
                  <td className="px-4 py-3"><span className={`badge ${PRIORITY_COLORS[r.priority] || ''}`}>{r.priority}</span></td>
                  <td className="px-4 py-3"><span className={`badge ${STATUS_COLORS[r.status] || ''}`}>{r.status?.replace('_', ' ')}</span></td>
                  <td className="px-4 py-3 text-center">{r.has_warranty ? <ShieldCheck size={16} className="text-emerald-500 mx-auto" /> : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {r.file_path && isImage(r.file_path) && <button onClick={() => setPreviewFile(r)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-blue-600"><Eye size={14} /></button>}
                      {r.file_path && <a href={`/api/maintenance/${r.id}/download`} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-emerald-600"><Download size={14} /></a>}
                      <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={14} /></button>
                      <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'new' ? 'New Record' : 'Edit Record'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Date</label>
                  <input type="date" className="input-field w-full" value={form.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Category</label>
                  <input className="input-field w-full" value={form.category} onChange={e => set('category', e.target.value)} placeholder="HVAC, Plumbing…" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Description *</label>
                <input className="input-field w-full" value={form.description} onChange={e => set('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Vendor</label>
                  <input className="input-field w-full" value={form.vendor || ''} onChange={e => set('vendor', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Cost</label>
                  <input type="number" step="0.01" className="input-field w-full" value={form.cost} onChange={e => set('cost', +e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Priority</label>
                  <select className="input-field w-full" value={form.priority} onChange={e => set('priority', e.target.value)}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Next Service</label>
                  <input type="date" className="input-field w-full" value={form.next_service} onChange={e => set('next_service', e.target.value)} />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.has_warranty} onChange={e => set('has_warranty', e.target.checked ? 1 : 0)} /> Under Warranty</label>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Notes</label>
                <textarea className="input-field w-full" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Attachment (photo, receipt, PDF)</label>
                <input type="file" ref={modalFileRef} className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleModalFileSelect} />
                {modalFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 ring-1 ring-brand-200">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                      {isImage(modalFile.name) ? <Image size={18} className="text-brand-600" /> : <File size={18} className="text-brand-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-800 truncate">{modalFile.name}</p>
                      <p className="text-xs text-brand-500">{(modalFile.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => { setModalFile(null); if (modalFileRef.current) modalFileRef.current.value = ''; }} className="p-1 rounded-lg hover:bg-brand-100 text-brand-400"><X size={16} /></button>
                  </div>
                ) : form.file_path ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 ring-1 ring-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0"><File size={18} className="text-stone-500" /></div>
                    <div className="flex-1"><p className="text-sm text-stone-600 truncate">File attached</p></div>
                    <button onClick={() => modalFileRef.current?.click()} className="btn-secondary text-xs flex items-center gap-1"><Upload size={12} /> Replace</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => modalFileRef.current?.click()} className="w-full p-4 rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-center group cursor-pointer">
                    <Upload size={20} className="mx-auto text-stone-300 group-hover:text-brand-500 mb-1" />
                    <p className="text-sm text-stone-500">Upload photo, receipt, or PDF</p>
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
              <span className="font-medium text-sm truncate">{previewFile.description}</span>
              <div className="flex gap-2 items-center">
                <a href={`/api/maintenance/${previewFile.id}/download`} className="btn-secondary text-xs flex items-center gap-1"><Download size={12} /> Download</a>
                <button onClick={() => setPreviewFile(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
              </div>
            </div>
            <div className="overflow-auto max-h-[75vh] p-2 bg-stone-50">
              <img src={`/api/property/uploads/${previewFile.file_path}`} alt={previewFile.description} className="max-w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
