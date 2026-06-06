import { useState, useRef } from 'react';
import { useApi, apiPost, apiPut, apiDelete, formatCurrency, formatDate, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Plus, Pencil, Trash2, X, Search, Upload, FileSpreadsheet, Check, AlertCircle, CalendarDays } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-600',
  pending: 'bg-amber-50 text-amber-700',
};

const PLATFORM_COLORS = {
  'Airbnb': 'bg-rose-50 text-rose-700',
  'VRBO': 'bg-blue-50 text-blue-700',
  'Booking.com': 'bg-indigo-50 text-indigo-700',
  'Direct': 'bg-emerald-50 text-emerald-700',
};

const PLATFORMS = ['Airbnb', 'VRBO', 'Booking.com', 'Direct', 'Other'];

const EMPTY = {
  guest_name: '', check_in: '', check_out: '', guests: 1, platform: 'Airbnb',
  nightly_rate: 0, cleaning_fee: 0, airbnb_fee: 0, pet_fee: 0, other_fee: 0,
  airbnb_payout: 0, rating: '', has_pet: 0, has_damage: 0, has_review: 0, review_notes: '', status: 'confirmed',
};

export default function Bookings() {
  const { propertyId, properties } = useProperty();
  const pid = propertyId || 0;
  const [statusFilter, setStatusFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [search, setSearch] = useState('');
  const qs = `?limit=200&property_id=${pid}${statusFilter ? `&status=${statusFilter}` : ''}${yearFilter ? `&year=${yearFilter}` : ''}`;
  const { data, loading, refetch } = useApi(`/bookings${qs}`, [statusFilter, yearFilter, pid]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  // CSV Import state
  const [importModal, setImportModal] = useState(false);
  const [importPlatform, setImportPlatform] = useState('Airbnb');
  const [csvText, setCsvText] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const rows = (data?.data || []).filter(r => {
    if (platformFilter && r.platform !== platformFilter) return false;
    if (!search) return true;
    return r.guest_name?.toLowerCase().includes(search.toLowerCase());
  });

  function openNew() { setForm({ ...EMPTY }); setModal('new'); }
  function openEdit(row) { setForm({ ...row, rating: row.rating ?? '' }); setModal('edit'); }

  async function save() {
    setSaving(true);
    try {
      const payload = { ...form, rating: form.rating === '' ? null : Number(form.rating) };
      if (modal === 'new') await apiPost('/bookings', payload);
      else await apiPut(`/bookings/${form.id}`, payload);
      setModal(null);
      refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Delete this booking?')) return;
    await apiDelete(`/bookings/${id}`);
    refetch();
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // CSV Import handlers
  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setCsvText(ev.target.result);
      setImportPreview(null);
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  async function previewImport() {
    if (!csvText.trim()) return;
    setImporting(true);
    try {
      const res = await apiPost('/bookings/import/preview', { csv: csvText, platform: importPlatform });
      setImportPreview(res);
    } catch (e) { alert('Preview failed: ' + e.message); }
    setImporting(false);
  }

  async function executeImport() {
    setImporting(true);
    try {
      const res = await apiPost('/bookings/import', { csv: csvText, platform: importPlatform });
      setImportResult(res);
      setImportPreview(null);
      refetch();
    } catch (e) { alert('Import failed: ' + e.message); }
    setImporting(false);
  }

  function resetImport() {
    setCsvText('');
    setImportPreview(null);
    setImportResult(null);
    setImportModal(false);
    if (fileRef.current) fileRef.current.value = '';
  }

  // Compute fee/payout labels based on platform
  const feeLabel = (platform) => {
    if (platform === 'Direct') return 'Fees';
    return 'Platform Fee';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Bookings</h1><HelpButton sectionId="bookings" /></div>
        <div className="flex gap-2">
          <button onClick={() => setImportModal(true)} className="btn-secondary flex items-center gap-1.5">
            <Upload size={16} /> Import CSV
          </button>
          <button onClick={openNew} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Booking</button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="input-field pl-9 w-full" placeholder="Search guests…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
          <option value="">All Platforms</option>
          {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="pending">Pending</option>
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
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Check-in</th>
                <th className="px-4 py-3 font-medium">Check-out</th>
                <th className="px-4 py-3 font-medium text-right">Nights</th>
                <th className="px-4 py-3 font-medium">Platform</th>
                <th className="px-4 py-3 font-medium text-right">Rate/nt</th>
                <th className="px-4 py-3 font-medium text-right">Gross</th>
                <th className="px-4 py-3 font-medium text-right">Net Payout</th>
                <th className="px-4 py-3 font-medium text-center">Rating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="text-center py-12 text-stone-400">Loading…</td></tr>
              ) : rows.length === 0 && !data?.total ? (
                <tr><td colSpan={11}>
                  <EmptyState
                    icon={CalendarDays}
                    title="No bookings yet"
                    description="Your booking history and upcoming reservations will all appear here once you add them."
                    steps={[
                      'Click "Add Booking" above to manually enter a booking',
                      'Or use "Import CSV" to bulk-import from an Airbnb or VRBO export',
                      'You can also sync bookings automatically via iCal — set it up in the Calendar section',
                    ]}
                    action={{ label: 'Add your first booking', onClick: openNew }}
                    tip="Syncing your iCal from Airbnb is the fastest way to get started."
                  />
                </td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={11} className="text-center py-12 text-stone-400">No bookings match your filters</td></tr>
              ) : rows.map(r => (
                <tr key={r.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{r.guest_name}</td>
                  <td className="px-4 py-3">{formatDate(r.check_in)}</td>
                  <td className="px-4 py-3">{formatDate(r.check_out)}</td>
                  <td className="px-4 py-3 text-right">{r.nights}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${PLATFORM_COLORS[r.platform] || 'bg-stone-50 text-stone-600'}`}>{r.platform}</span>
                  </td>
                  <td className="px-4 py-3 text-right">{formatCurrency(r.nightly_rate)}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(r.gross_income)}</td>
                  <td className="px-4 py-3 text-right">{formatCurrency(r.airbnb_payout)}</td>
                  <td className="px-4 py-3 text-center">{r.rating ? `${r.rating}★` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[r.status] || ''}`}>{r.status}</span>
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
        {data?.total > 0 && (
          <div className="px-4 py-3 border-t border-stone-100 text-xs text-stone-500">
            Showing {rows.length} of {data.total} bookings
          </div>
        )}
      </div>

      {/* Edit/New Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'new' ? 'New Booking' : 'Edit Booking'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Guest Name *</label>
                  <input className="input-field w-full" value={form.guest_name} onChange={e => set('guest_name', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Check-in *</label>
                  <input type="date" className="input-field w-full" value={form.check_in} onChange={e => set('check_in', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Check-out *</label>
                  <input type="date" className="input-field w-full" value={form.check_out} onChange={e => set('check_out', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Guests</label>
                  <input type="number" className="input-field w-full" value={form.guests} onChange={e => set('guests', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Platform</label>
                  <select className="input-field w-full" value={form.platform} onChange={e => set('platform', e.target.value)}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Nightly Rate</label>
                  <input type="number" className="input-field w-full" value={form.nightly_rate} onChange={e => set('nightly_rate', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Cleaning Fee</label>
                  <input type="number" className="input-field w-full" value={form.cleaning_fee} onChange={e => set('cleaning_fee', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">{feeLabel(form.platform)}</label>
                  <input type="number" className="input-field w-full" value={form.airbnb_fee} onChange={e => set('airbnb_fee', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Pet Fee</label>
                  <input type="number" className="input-field w-full" value={form.pet_fee} onChange={e => set('pet_fee', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Other Fee</label>
                  <input type="number" className="input-field w-full" value={form.other_fee} onChange={e => set('other_fee', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Net Payout</label>
                  <input type="number" className="input-field w-full" value={form.airbnb_payout} onChange={e => set('airbnb_payout', +e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Rating</label>
                  <input type="number" step="0.1" min="0" max="5" className="input-field w-full" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="1-5" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.has_pet} onChange={e => set('has_pet', e.target.checked ? 1 : 0)} /> Pet</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.has_damage} onChange={e => set('has_damage', e.target.checked ? 1 : 0)} /> Damage</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.has_review} onChange={e => set('has_review', e.target.checked ? 1 : 0)} /> Review</label>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Review Notes</label>
                <textarea className="input-field w-full" rows={2} value={form.review_notes || ''} onChange={e => set('review_notes', e.target.value)} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[8vh] overflow-y-auto" onClick={resetImport}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-brand-500" />
                <h2 className="font-semibold">Import Bookings from CSV</h2>
              </div>
              <button onClick={resetImport} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">

              {/* Instructions */}
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 space-y-2">
                <p className="font-medium">How to export your bookings:</p>
                <div className="text-xs space-y-1 text-blue-700">
                  <p><span className="font-medium">Airbnb:</span> Go to Earnings → Transaction History → Export CSV</p>
                  <p><span className="font-medium">VRBO:</span> Go to Reservations → Export → Download CSV</p>
                  <p><span className="font-medium">Booking.com:</span> Go to Finance → Reservation statements → Export</p>
                  <p><span className="font-medium">Direct/Other:</span> Any CSV with columns for guest name, check-in, check-out, and payout</p>
                </div>
              </div>

              {/* Platform selector + file upload */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Source Platform</label>
                  <select className="input-field w-full" value={importPlatform} onChange={e => setImportPlatform(e.target.value)}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">CSV File</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,.tsv,.txt"
                    onChange={handleFileSelect}
                    className="input-field w-full text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                  />
                </div>
              </div>

              {/* Or paste CSV */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Or paste CSV data directly</label>
                <textarea
                  className="input-field w-full font-mono text-xs"
                  rows={5}
                  value={csvText}
                  onChange={e => { setCsvText(e.target.value); setImportPreview(null); setImportResult(null); }}
                  placeholder={'guest_name,check_in,check_out,nightly_rate,payout,status\nJohn Doe,2025-07-01,2025-07-05,150,650,confirmed'}
                />
              </div>

              {/* Preview results */}
              {importPreview && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{importPreview.valid}</span> bookings found
                    {importPreview.preview?.filter(p => p.isDuplicate).length > 0 && (
                      <span className="text-amber-600 text-xs">
                        ({importPreview.preview.filter(p => p.isDuplicate).length} duplicates will be skipped)
                      </span>
                    )}
                  </div>
                  <div className="max-h-48 overflow-auto rounded-xl ring-1 ring-stone-200">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-stone-50 text-left text-stone-500">
                          <th className="px-3 py-2">Guest</th>
                          <th className="px-3 py-2">Check-in</th>
                          <th className="px-3 py-2">Check-out</th>
                          <th className="px-3 py-2">Platform</th>
                          <th className="px-3 py-2 text-right">Payout</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.preview?.slice(0, 20).map((row, i) => (
                          <tr key={i} className={`border-t border-stone-100 ${row.isDuplicate ? 'opacity-40 line-through' : ''}`}>
                            <td className="px-3 py-2">{row.guest_name}</td>
                            <td className="px-3 py-2">{row.check_in}</td>
                            <td className="px-3 py-2">{row.check_out}</td>
                            <td className="px-3 py-2">{row.platform}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(row.airbnb_payout)}</td>
                            <td className="px-3 py-2">
                              {row.isDuplicate ? <span className="text-amber-600">duplicate</span> : row.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import success */}
              {importResult && (
                <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800 flex items-start gap-3">
                  <Check size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{importResult.imported} bookings imported successfully</p>
                    {importResult.skipped > 0 && (
                      <p className="text-xs text-emerald-600 mt-1">{importResult.skipped} skipped (duplicates or invalid)</p>
                    )}
                    {importResult.errors?.length > 0 && (
                      <div className="mt-2 text-xs text-emerald-600">
                        {importResult.errors.slice(0, 5).map((e, i) => <p key={i}>{e}</p>)}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={resetImport} className="btn-secondary">Close</button>
              {!importResult && (
                <>
                  {!importPreview ? (
                    <button onClick={previewImport} disabled={!csvText.trim() || importing} className="btn-secondary">
                      {importing ? 'Parsing…' : 'Preview'}
                    </button>
                  ) : (
                    <button onClick={executeImport} disabled={importing} className="btn-primary flex items-center gap-1.5">
                      {importing ? 'Importing…' : <><Upload size={14} /> Import {importPreview.preview?.filter(p => !p.isDuplicate).length} Bookings</>}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
