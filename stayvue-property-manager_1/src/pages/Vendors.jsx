import { HelpButton } from './HelpCentre';
import { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete, useProperty } from '../hooks/useApi';
import { Plus, X, Search, Star, Phone, Mail, Globe, MapPin, Pencil, Trash2, Share2, Copy, Check as CheckIcon, Contact, Building } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const CATEGORY_COLORS = {
  'Cleaning': { bg: 'bg-sky-50', accent: 'bg-sky-500', text: 'text-sky-700', ring: 'ring-sky-200' },
  'Plumbing': { bg: 'bg-blue-50', accent: 'bg-blue-500', text: 'text-blue-700', ring: 'ring-blue-200' },
  'HVAC': { bg: 'bg-orange-50', accent: 'bg-orange-500', text: 'text-orange-700', ring: 'ring-orange-200' },
  'Electrical': { bg: 'bg-amber-50', accent: 'bg-amber-500', text: 'text-amber-700', ring: 'ring-amber-200' },
  'Snow Removal': { bg: 'bg-indigo-50', accent: 'bg-indigo-500', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  'Lawn Care': { bg: 'bg-emerald-50', accent: 'bg-emerald-500', text: 'text-emerald-700', ring: 'ring-emerald-200' },
  'Insurance': { bg: 'bg-purple-50', accent: 'bg-purple-500', text: 'text-purple-700', ring: 'ring-purple-200' },
  'Photography': { bg: 'bg-pink-50', accent: 'bg-pink-500', text: 'text-pink-700', ring: 'ring-pink-200' },
  'Appliance Repair': { bg: 'bg-red-50', accent: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200' },
  'Locksmith': { bg: 'bg-stone-100', accent: 'bg-stone-500', text: 'text-stone-700', ring: 'ring-stone-200' },
};

const DEFAULT_COLORS = { bg: 'bg-stone-50', accent: 'bg-stone-500', text: 'text-stone-700', ring: 'ring-stone-200' };

const EMPTY = {
  name: '', company: '', category: 'Cleaning', phone: '', email: '',
  website: '', address: '', notes: '', is_favorite: 0, property_id: 0,
};

function VendorCard({ vendor, onEdit, onDelete, onFlip, flipped }) {
  const colors = CATEGORY_COLORS[vendor.category] || DEFAULT_COLORS;
  const initials = vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const [copied, setCopied] = useState(false);

  async function handleShare(e) {
    e.stopPropagation();
    const lines = [
      vendor.name,
      vendor.company ? `${vendor.company}` : null,
      `Category: ${vendor.category}`,
      vendor.phone ? `Phone: ${vendor.phone}` : null,
      vendor.email ? `Email: ${vendor.email}` : null,
      vendor.website ? `Web: ${vendor.website}` : null,
      vendor.address ? `Address: ${vendor.address}` : null,
      vendor.notes ? `\nNotes: ${vendor.notes}` : null,
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: `${vendor.name} — ${vendor.category}`, text: lines });
      } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(lines);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (_) {}
    }
  }

  return (
    <div className="perspective-1000" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full transition-transform duration-500 cursor-pointer`}
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '240px',
        }}
        onClick={() => onFlip(vendor.id)}
      >
        {/* FRONT — Business Card */}
        <div
          className={`absolute inset-0 rounded-2xl ${colors.bg} ring-1 ${colors.ring} p-5 flex flex-col justify-between overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Top accent bar */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.accent} rounded-t-2xl`} />

          <div className="flex items-start justify-between mt-1">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${colors.accent} flex items-center justify-center text-white font-semibold text-sm shrink-0`}>
                {initials}
              </div>
              <div>
                <h3 className="font-semibold text-stone-800 text-sm leading-tight">{vendor.name}</h3>
                {vendor.company && (
                  <p className="text-stone-500 text-xs mt-0.5">{vendor.company}</p>
                )}
              </div>
            </div>
            {vendor.is_favorite ? (
              <Star size={16} className="text-amber-400 fill-amber-400 shrink-0 mt-1" />
            ) : null}
          </div>

          <div className="mt-3">
            <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${colors.bg} ${colors.text} ring-1 ${colors.ring}`}>
              {vendor.category}
            </span>
          </div>

          {vendor.notes && (
            <p className="text-stone-500 text-xs mt-3 line-clamp-2 leading-relaxed">{vendor.notes}</p>
          )}

          <p className="text-stone-400 text-[10px] mt-3 uppercase tracking-wider font-medium">Click to flip →</p>
        </div>

        {/* BACK — Contact Details */}
        <div
          className="absolute inset-0 rounded-2xl bg-white ring-1 ring-stone-200 p-5 flex flex-col overflow-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${colors.accent} rounded-t-2xl`} />

          <div className="flex items-center justify-between mt-1 mb-3 shrink-0">
            <h3 className="font-semibold text-stone-800 text-sm truncate mr-2">{vendor.name}</h3>
            <div className="flex gap-1">
              <button
                onClick={handleShare}
                className="p-1.5 rounded-lg hover:bg-brand-50 text-stone-400 hover:text-brand-600 transition-colors"
                title={copied ? 'Copied!' : 'Share contact'}
              >
                {copied ? <CheckIcon size={13} className="text-emerald-500" /> : <Share2 size={13} />}
              </button>
              <button
                onClick={e => { e.stopPropagation(); onEdit(vendor); }}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); onDelete(vendor.id); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 min-h-0">
            {vendor.phone && (
              <a
                href={`tel:${vendor.phone}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2.5 text-sm text-stone-600 hover:text-brand-600 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <Phone size={14} className="text-emerald-600" />
                </span>
                <span className="underline decoration-stone-300 underline-offset-2 truncate">{vendor.phone}</span>
              </a>
            )}
            {vendor.email && (
              <a
                href={`mailto:${vendor.email}`}
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2.5 text-sm text-stone-600 hover:text-brand-600 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                  <Mail size={14} className="text-blue-600" />
                </span>
                <span className="underline decoration-stone-300 underline-offset-2 truncate">{vendor.email}</span>
              </a>
            )}
            {vendor.website && (
              <a
                href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="flex items-center gap-2.5 text-sm text-stone-600 hover:text-brand-600 transition-colors group"
              >
                <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                  <Globe size={14} className="text-purple-600" />
                </span>
                <span className="underline decoration-stone-300 underline-offset-2 truncate">{vendor.website}</span>
              </a>
            )}
            {vendor.address && (
              <div className="flex items-start gap-2.5 text-sm text-stone-500">
                <span className="w-8 h-8 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-stone-400" />
                </span>
                <span className="text-xs leading-snug line-clamp-2">{vendor.address}</span>
              </div>
            )}
          </div>

          <p className="text-stone-400 text-[10px] mt-2 uppercase tracking-wider font-medium shrink-0">← Click to flip back</p>
        </div>
      </div>
    </div>
  );
}

export default function Vendors() {
  const { propertyId, properties } = useProperty();
  const [vendorPropFilter, setVendorPropFilter] = useState(0);
  const propQuery = vendorPropFilter ? `?property_id=${vendorPropFilter}` : '';
  const { data: vendors, loading, refetch } = useApi(`/vendors${propQuery}`, [vendorPropFilter]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [flippedId, setFlippedId] = useState(null);

  const categories = [...new Set((vendors || []).map(v => v.category))].sort();

  const filtered = (vendors || []).filter(v => {
    if (categoryFilter && v.category !== categoryFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      return v.name.toLowerCase().includes(s) ||
        (v.company || '').toLowerCase().includes(s) ||
        v.category.toLowerCase().includes(s);
    }
    return true;
  });

  function openNew() { setForm({ ...EMPTY, property_id: vendorPropFilter || 0 }); setModal('new'); }
  function openEdit(v) { setForm({ ...v }); setModal('edit'); }

  async function save() {
    setSaving(true);
    try {
      if (modal === 'new') await apiPost('/vendors', form);
      else await apiPut(`/vendors/${form.id}`, form);
      setModal(null);
      refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm('Delete this vendor?')) return;
    await apiDelete(`/vendors/${id}`);
    refetch();
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFlip = (id) => setFlippedId(prev => prev === id ? null : id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Vendor Contacts</h1><HelpButton sectionId="vendors" /></div>
          <p className="text-stone-500 text-sm mt-1">Your trusted service providers — click any card to see contact details</p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Vendor</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input className="input-field pl-9 w-full" placeholder="Search vendors…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field" value={vendorPropFilter} onChange={e => setVendorPropFilter(+e.target.value)}>
          <option value={0}>All Properties</option>
          {(properties || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="input-field" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <EmptyState
            icon={Contact}
            title="No vendors yet"
            description="Store contact info for your cleaners, plumbers, HVAC technicians, and other service providers so it's always one tap away."
            steps={[
              'Click "Add Vendor" and enter their name, category, phone, and email',
              'Mark frequently-used vendors as favourites for quick access',
              'Use the share button on any card to send contact details via text or email',
            ]}
            tip="Start with your cleaner — they're the vendor you'll contact most between stays."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(v => (
            <VendorCard
              key={v.id}
              vendor={v}
              onEdit={openEdit}
              onDelete={remove}
              onFlip={handleFlip}
              flipped={flippedId === v.id}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'new' ? 'New Vendor' : 'Edit Vendor'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Contact Name *</label>
                  <input className="input-field w-full" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Claire Johnson" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Company</label>
                  <input className="input-field w-full" value={form.company} onChange={e => set('company', e.target.value)} placeholder="e.g. SparkleClean" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Property</label>
                  <select className="input-field w-full" value={form.property_id || 0} onChange={e => set('property_id', +e.target.value)}>
                    <option value={0}>All Properties</option>
                    {(properties || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Category *</label>
                  <select className="input-field w-full" value={form.category} onChange={e => set('category', e.target.value)}>
                    {['Cleaning', 'Plumbing', 'HVAC', 'Electrical', 'Snow Removal', 'Lawn Care',
                      'Insurance', 'Photography', 'Appliance Repair', 'Locksmith', 'Pest Control',
                      'General Contractor', 'Interior Design', 'Security', 'Other'].map(c =>
                      <option key={c} value={c}>{c}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Phone</label>
                  <input className="input-field w-full" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1-514-555-0000" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Email</label>
                  <input type="email" className="input-field w-full" value={form.email} onChange={e => set('email', e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Website</label>
                  <input className="input-field w-full" value={form.website} onChange={e => set('website', e.target.value)} placeholder="example.com" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Address</label>
                  <input className="input-field w-full" value={form.address} onChange={e => set('address', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Notes</label>
                  <textarea className="input-field w-full" rows={2} value={form.notes || ''} onChange={e => set('notes', e.target.value)} placeholder="Rates, availability, special instructions…" />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" className="rounded" checked={!!form.is_favorite} onChange={e => set('is_favorite', e.target.checked ? 1 : 0)} />
                    <Star size={14} className="text-amber-400" /> Mark as favorite
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={save} disabled={saving || !form.name || !form.category} className="btn-primary">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
