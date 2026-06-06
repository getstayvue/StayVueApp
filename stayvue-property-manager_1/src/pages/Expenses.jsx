import { useState, useMemo, useRef } from 'react';
import { useApi, apiPost, apiPut, apiDelete, formatCurrency, formatDate, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Plus, Pencil, Trash2, X, RefreshCw, Upload, Download, Eye, FileText, Image, Receipt, DollarSign } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const CATEGORIES = ['Utilities','Cleaning','Maintenance','Management Fees','Insurance','Tax','Supplies','Marketing','Professional Services','Capital/Depreciation'];

const CAT_COLORS = {
  Utilities: 'bg-sky-50 text-sky-700', Cleaning: 'bg-teal-50 text-teal-700',
  Maintenance: 'bg-orange-50 text-orange-700', 'Management Fees': 'bg-violet-50 text-violet-700',
  Insurance: 'bg-rose-50 text-rose-700', Tax: 'bg-rose-50 text-rose-700',
  Supplies: 'bg-lime-50 text-lime-700', Marketing: 'bg-pink-50 text-pink-700',
  'Professional Services': 'bg-indigo-50 text-indigo-700', 'Capital/Depreciation': 'bg-amber-50 text-amber-700',
};

const EMPTY = { date: new Date().toISOString().slice(0, 10), description: '', amount: 0, category: 'Utilities', vendor: '', notes: '', is_recurring: 0, recurrence: '', is_deductible: 1 };
const MAX_FILE_SIZE = 25 * 1024 * 1024;

function isImage(f) { return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(f || ''); }

export default function Expenses() {
  const { propertyId } = useProperty();
  const pid = propertyId || 0;
  const [catFilter, setCatFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const qs = `?limit=200&property_id=${pid}${catFilter ? `&category=${encodeURIComponent(catFilter)}` : ''}${yearFilter ? `&year=${yearFilter}` : ''}`;
  const { data, loading, refetch } = useApi(`/expenses${qs}`, [catFilter, yearFilter, pid]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [modalFile, setModalFile] = useState(null);
  const [previewImg, setPreviewImg] = useState(null);
  const fileRef = useRef(null);

  const rows = data?.data || [];

  const summary = useMemo(() => {
    const total = rows.reduce((s, r) => s + (r.amount || 0), 0);
    const deductible = rows.filter(r => r.is_deductible).reduce((s, r) => s + (r.amount || 0), 0);
    const recurring = rows.filter(r => r.is_recurring).reduce((s, r) => s + (r.amount || 0), 0);
    const withReceipts = rows.filter(r => r.file_path).length;
    return { total, deductible, recurring, count: rows.length, withReceipts };
  }, [rows]);

  function openNew() { setForm({ ...EMPTY }); setModalFile(null); setModal('new'); }
  function openEdit(row) { setForm({ ...row, recurrence: row.recurrence || '', vendor: row.vendor || '' }); setModalFile(null); setModal('edit'); }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, recurrence: form.recurrence || null, property_id: pid || 1 };
      let expId = form.id;
      if (modal === 'new') {
        const result = await apiPost('/expenses', payload);
        expId = result.id;
      } else {
        await apiPut(`/expenses/${form.id}`, payload);
      }
      // Upload file if selected
      if (modalFile && expId) {
        const reader = new FileReader();
        await new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              await apiPost(`/expenses/${expId}/upload`, { filename: modalFile.name, data: reader.result.split(',')[1] });
              resolve();
            } catch (e) { reject(e); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(modalFile);
        });
      }
      setModal(null); setModalFile(null); refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Delete this expense and any attached receipt?')) return;
    await apiDelete(`/expenses/${id}`);
    refetch();
  }

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is 25 MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      e.target.value = ''; return;
    }
    setModalFile(file);
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Expenses</h1><HelpButton sectionId="expenses" /></div>
        <button onClick={openNew} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Expense</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Expenses</p><p className="text-xl font-semibold">{formatCurrency(summary.total)}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Tax Deductible</p><p className="text-xl font-semibold text-emerald-700">{formatCurrency(summary.deductible)}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Entries</p><p className="text-xl font-semibold">{summary.count}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">With Receipts</p><p className="text-xl font-semibold flex items-center gap-1"><Receipt size={14} className="text-brand-500" />{summary.withReceipts}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Recurring</p><p className="text-xl font-semibold flex items-center gap-1"><RefreshCw size={14} className="text-brand-500" />{formatCurrency(summary.recurring)}</p></div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select className="input-field" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input-field" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {[...Array(3)].map((_, i) => { const y = new Date().getFullYear() - i; return <option key={y} value={y}>{y}</option>; })}
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
                <th className="px-4 py-3 font-medium text-right">Amount</th>
                <th className="px-4 py-3 font-medium text-center">Deductible</th>
                <th className="px-4 py-3 font-medium text-center">Receipt</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-stone-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-stone-400">
                  <EmptyState
                    icon={DollarSign}
                    title="No expenses yet"
                    description="Track every cost — cleaning, utilities, maintenance, insurance — so you know exactly what your properties are costing you."
                    steps={[
                      'Click "Add Expense" and enter the date, amount, and category',
                      'Attach a receipt photo so you never lose documentation',
                      'Check "Tax Deductible" on eligible costs — they appear in your Tax Centre report automatically',
                    ]}
                    action={{ label: 'Add your first expense', onClick: openNew }}
                    tip="Most cleaning, utilities, and maintenance costs are tax-deductible. Check with your accountant."
                  />
                </td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3 text-stone-500">{formatDate(r.date)}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{r.description}</span>
                    {r.vendor && <span className="text-xs text-stone-400 block">{r.vendor}</span>}
                  </td>
                  <td className="px-4 py-3"><span className={`badge ${CAT_COLORS[r.category] || 'bg-stone-100 text-stone-600'}`}>{r.category}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(r.amount)}</td>
                  <td className="px-4 py-3 text-center">{r.is_deductible ? <span className="text-emerald-600 font-medium">✓</span> : <span className="text-stone-300">—</span>}</td>
                  <td className="px-4 py-3 text-center">
                    {r.file_path ? (
                      <div className="flex items-center justify-center gap-1">
                        {isImage(r.file_path) && (
                          <button onClick={() => setPreviewImg(r)} className="p-1 rounded hover:bg-stone-100 text-blue-500" title="Preview"><Eye size={14} /></button>
                        )}
                        <a href={`/api/expenses/${r.id}/download`} className="p-1 rounded hover:bg-stone-100 text-brand-600" title="Download"><Download size={14} /></a>
                      </div>
                    ) : <span className="text-stone-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'new' ? 'New Expense' : 'Edit Expense'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Date</label><input type="date" className="input-field w-full" value={form.date} onChange={e => set('date', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Amount *</label><input type="number" step="0.01" className="input-field w-full" value={form.amount} onChange={e => set('amount', +e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Description *</label><input className="input-field w-full" value={form.description} onChange={e => set('description', e.target.value)} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Category *</label>
                  <select className="input-field w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Vendor</label><input className="input-field w-full" value={form.vendor} onChange={e => set('vendor', e.target.value)} placeholder="e.g. Home Depot" /></div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.is_deductible} onChange={e => set('is_deductible', e.target.checked ? 1 : 0)} /> Tax Deductible</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.is_recurring} onChange={e => set('is_recurring', e.target.checked ? 1 : 0)} /> Recurring</label>
                {form.is_recurring ? (
                  <select className="input-field" value={form.recurrence} onChange={e => set('recurrence', e.target.value)}>
                    <option value="">Select…</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="annual">Annual</option>
                  </select>
                ) : null}
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Notes</label><textarea className="input-field w-full" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} /></div>

              {/* Receipt Upload */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Receipt / Invoice</label>
                <input type="file" ref={fileRef} className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileSelect} />
                {modalFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 ring-1 ring-brand-200">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                      {isImage(modalFile.name) ? <Image size={18} className="text-brand-600" /> : <FileText size={18} className="text-brand-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-800 truncate">{modalFile.name}</p>
                      <p className="text-xs text-brand-500">{(modalFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => { setModalFile(null); if (fileRef.current) fileRef.current.value = ''; }} className="p-1 rounded-lg hover:bg-brand-100 text-brand-400"><X size={16} /></button>
                  </div>
                ) : form.file_path ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 ring-1 ring-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                      {isImage(form.file_path) ? <Image size={18} className="text-stone-500" /> : <FileText size={18} className="text-stone-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-600 truncate">File attached: {form.file_path}</p>
                    </div>
                    <button onClick={() => fileRef.current?.click()} className="btn-secondary text-xs flex items-center gap-1"><Upload size={12} /> Replace</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full p-5 rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-center group cursor-pointer">
                    <Upload size={22} className="mx-auto text-stone-300 group-hover:text-brand-500 mb-1.5" />
                    <p className="text-sm text-stone-500 group-hover:text-brand-600">Upload receipt or invoice</p>
                    <p className="text-xs text-stone-400 mt-0.5">Photos, PDFs, docs — up to 25 MB</p>
                  </button>
                )}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || !form.description || !form.category} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImg && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewImg(null)}>
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
              <span className="font-medium text-sm truncate">{previewImg.description} — Receipt</span>
              <div className="flex gap-2 items-center">
                <a href={`/api/expenses/${previewImg.id}/download`} className="btn-secondary text-xs flex items-center gap-1"><Download size={12} /> Download</a>
                <button onClick={() => setPreviewImg(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
              </div>
            </div>
            <div className="overflow-auto max-h-[75vh] p-2 bg-stone-50">
              <img src={`/api/expenses/uploads/${previewImg.file_path}`} alt="Receipt" className="max-w-full h-auto rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
