import { useState, useEffect, useRef } from 'react';
import { useApi, apiPut, apiPost, apiDelete, apiGet, formatCurrency, formatDate, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Save, FileText, Star, BarChart3, Plus, Pencil, Trash2, X, Upload, Download, Image, File, Eye, Key, Wifi, Lock, Shield, Car, Thermometer, Building, Anchor, DoorOpen, Copy, Check, ChevronLeft, ChevronRight, Home, CreditCard, Sparkles, Share2, MapPin, User, Phone, Link, Calendar, Ruler, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { compressImage } from '../lib/compress';

const DOC_CATEGORIES = ['Insurance', 'Lease', 'License', 'Tax', 'Invoice', 'Receipt', 'Contract', 'Warranty', 'Inspection', 'Photo', 'Other'];
const EMPTY_DOC = { name: '', category: 'Other', date: '', amount: 0, vendor: '', tax_year: new Date().getFullYear(), status: 'pending', is_deductible: 0 };

const CODE_ICONS = {
  key: Key, wifi: Wifi, lock: Lock, shield: Shield, car: Car,
  thermometer: Thermometer, building: Building, anchor: Anchor,
  door: DoorOpen, gate: Lock,
};
const CODE_ICON_OPTIONS = ['door', 'wifi', 'lock', 'key', 'shield', 'car', 'thermometer', 'building', 'anchor', 'gate'];

function isImage(filename) {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(filename || '');
}

export default function PropertyInfo() {
  const ctx = useProperty();
  const { propertyId, setPropertyId, properties } = ctx;
  const [localPid, setLocalPid] = useState(propertyId || (properties?.[0]?.id) || 1);
  const pid = localPid;

  // Sync with global selector
  useEffect(() => {
    if (propertyId && propertyId !== 0) setLocalPid(propertyId);
    else if (properties?.length > 0) setLocalPid(properties[0].id);
  }, [propertyId, properties]);

  const { data: property, loading: pLoad, refetch: reProp } = useApi(`/property?property_id=${pid}`, [pid]);
  const { data: pricing, refetch: rePrice } = useApi(`/property/pricing?property_id=${pid}`, [pid]);
  const { data: documents, refetch: reDocs } = useApi(`/property/documents?property_id=${pid}`, [pid]);
  const { data: surveySum } = useApi(`/property/surveys/summary?property_id=${pid}`, [pid]);
  const { data: codes, refetch: reCodes } = useApi(`/property/codes?property_id=${pid}`, [pid]);

  // Billing
  const [billingStatus, setBillingStatus] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(null); // null | 'property' | 'team'
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => { apiGet('/billing/status').then(setBillingStatus).catch(() => {}); }, []);

  // Property form
  const [propForm, setPropForm] = useState(null);
  const [propSaving, setPropSaving] = useState(false);
  const [propEditing, setPropEditing] = useState(false);
  const [insEditing, setInsEditing] = useState(false);
  const [newPropModal, setNewPropModal] = useState(false);
  const [newPropName, setNewPropName] = useState('');
  useEffect(() => { if (property) { setPropForm({ ...property }); setPropEditing(false); setInsEditing(false); } }, [property]);

  async function saveProp() {
    setPropSaving(true);
    try { await apiPut(`/property?property_id=${pid}`, propForm); reProp(); setPropEditing(false); setInsEditing(false); } catch (e) { alert(e.message); }
    setPropSaving(false);
  }

  function cancelEdit() {
    setPropForm({ ...property });
    setPropEditing(false);
    setInsEditing(false);
  }

  async function sharePropertyInfo() {
    const p = property;
    let text = `${p.name}\n${p.property_type || ''}\n${p.address || ''}\n\n${p.bedrooms} bed · ${p.bathrooms} bath · ${p.max_guests} guests`;
    if (p.square_footage) text += ` · ${p.square_footage} sq ft`;
    text += `\nNightly rate: $${p.base_nightly_rate}`;
    if (p.property_manager) text += `\nProperty Manager: ${p.property_manager}`;
    if (p.emergency_contact) text += `\nEmergency: ${p.emergency_contact}`;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(text); alert('Property info copied to clipboard!'); } catch {}
  }

  async function addProperty() {
    try {
      const check = await apiGet('/billing/can-add-property');
      if (!check.allowed) {
        setUpgradeModal('property');
        return;
      }
    } catch {
      // If billing check fails, still allow — better UX than blocking
    }
    setNewPropName('');
    setNewPropModal(true);
  }

  async function createProperty() {
    if (!newPropName.trim()) return;
    setPropSaving(true);
    try {
      const result = await apiPost('/property', { name: newPropName.trim() });
      setNewPropModal(false);
      // Refetch properties list by updating parent context
      const updated = await apiGet('/property/list');
      // Update parent properties list via context setter
      if (ctx.setProperties) ctx.setProperties(updated);
      setLocalPid(result.id);
      setPropertyId(result.id);
    } catch (e) { alert(e.message); }
    setPropSaving(false);
  }

  async function deleteProperty() {
    if (properties.length <= 1) { alert('You must have at least one property.'); return; }
    if (!confirm(`Delete "${property?.name}"? This will remove all bookings, expenses, and data for this property. This cannot be undone.`)) return;
    try {
      await apiDelete(`/property/${pid}`);
      const updated = await apiGet('/property/list');
      if (ctx.setProperties) ctx.setProperties(updated);
      if (updated.length) { setLocalPid(updated[0].id); setPropertyId(updated[0].id); }
    } catch (e) { alert(e.message); }
  }

  async function handleUpgrade(planId) {
    setUpgrading(true);
    try {
      const result = await apiPost('/billing/upgrade', { plan_id: planId });
      alert(result.message);
      const status = await apiGet('/billing/status');
      setBillingStatus(status);
      setUpgradeModal(null);
    } catch (e) { alert(e.message); }
    setUpgrading(false);
  }

  // Navigate between properties
  const currentIdx = properties.findIndex(p => p.id === pid);
  function prevProp() {
    if (currentIdx > 0) { const id = properties[currentIdx - 1].id; setLocalPid(id); setPropertyId(id); }
  }
  function nextProp() {
    if (currentIdx < properties.length - 1) { const id = properties[currentIdx + 1].id; setLocalPid(id); setPropertyId(id); }
  }

  // Pricing inline edit
  const [editPrice, setEditPrice] = useState(null);
  async function savePrice() {
    try { await apiPut(`/property/pricing/${editPrice.id}`, editPrice); setEditPrice(null); rePrice(); } catch (e) { alert(e.message); }
  }

  // Document CRUD
  const [docModal, setDocModal] = useState(null);
  const [docForm, setDocForm] = useState(EMPTY_DOC);
  const [docSaving, setDocSaving] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  const modalFileRef = useRef(null);
  const [uploadingDocId, setUploadingDocId] = useState(null);
  const [modalFile, setModalFile] = useState(null);
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  function openNewDoc() { setDocForm({ ...EMPTY_DOC, date: new Date().toISOString().slice(0, 10) }); setModalFile(null); setDocModal('new'); }
  function openEditDoc(d) { setDocForm({ ...d }); setModalFile(null); setDocModal('edit'); }

  async function saveDoc() {
    setDocSaving(true);
    try {
      let docId = docForm.id;
      if (docModal === 'new') { const result = await apiPost('/property/documents', { ...docForm, property_id: pid }); docId = result.id; }
      else await apiPut(`/property/documents/${docForm.id}`, docForm);
      if (modalFile && docId) {
        const { data: compressedData, filename: compressedName } = await compressImage(modalFile);
        await apiPost(`/property/documents/${docId}/upload`, { filename: compressedName, data: compressedData });
      }
      setDocModal(null); setModalFile(null); reDocs();
    } catch (e) { alert(e.message); }
    setDocSaving(false);
  }

  async function deleteDoc(id) { if (!confirm('Delete this document?')) return; await apiDelete(`/property/documents/${id}`); reDocs(); }

  async function uploadFile(docId, file) {
    setUploadingDocId(docId);
    try {
      const { data, filename } = await compressImage(file);
      await apiPost(`/property/documents/${docId}/upload`, { filename, data });
      reDocs();
      setUploadingDocId(null);
    } catch (e) { alert('Upload failed: ' + e.message); setUploadingDocId(null); }
  }

  function triggerUpload(docId) { setUploadingDocId(docId); fileInputRef.current?.click(); }
  function handleFileSelect(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_FILE_SIZE) { alert(`Max 25 MB. Your file is ${(file.size/1024/1024).toFixed(1)} MB.`); e.target.value = ''; return; }
    if (file && uploadingDocId) uploadFile(uploadingDocId, file); e.target.value = '';
  }
  function handleModalFileSelect(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > MAX_FILE_SIZE) { alert(`Max 25 MB.`); e.target.value = ''; return; }
    setModalFile(file);
    if (!docForm.name) setDocForm(f => ({ ...f, name: file.name.replace(/\.[^.]+$/, '') }));
  }

  const setP = (k, v) => setPropForm(f => ({ ...f, [k]: v }));
  const setD = (k, v) => setDocForm(f => ({ ...f, [k]: v }));

  // Codes CRUD
  const [codeModal, setCodeModal] = useState(null);
  const [codeForm, setCodeForm] = useState({ label: '', value: '', icon: 'key' });
  const [codeSaving, setCodeSaving] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  function openNewCode() { setCodeForm({ label: '', value: '', icon: 'key' }); setCodeModal('new'); }
  function openEditCode(c) { setCodeForm({ ...c }); setCodeModal('edit'); }
  async function saveCode() {
    setCodeSaving(true);
    try {
      if (codeModal === 'new') await apiPost('/property/codes', { ...codeForm, property_id: pid });
      else await apiPut(`/property/codes/${codeForm.id}`, codeForm);
      setCodeModal(null); reCodes();
    } catch (e) { alert(e.message); } setCodeSaving(false);
  }
  async function deleteCode(id) { if (!confirm('Delete?')) return; await apiDelete(`/property/codes/${id}`); reCodes(); }
  async function copyCode(id, value) { try { await navigator.clipboard.writeText(value); setCopiedId(id); setTimeout(() => setCopiedId(null), 1500); } catch {} }
  const setC = (k, v) => setCodeForm(f => ({ ...f, [k]: v }));

  const ratingCategories = [
    { key: 'avg_overall', label: 'Overall' }, { key: 'avg_cleanliness', label: 'Cleanliness' },
    { key: 'avg_communication', label: 'Communication' }, { key: 'avg_checkin', label: 'Check-in' },
    { key: 'avg_accuracy', label: 'Accuracy' }, { key: 'avg_location', label: 'Location' }, { key: 'avg_value', label: 'Value' },
  ];

  if (pLoad || !propForm) {
    // No properties yet — show onboarding
    if (!pLoad && (!properties || properties.length === 0)) {
      return (
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold tracking-tight">Property</h1>
          <EmptyState
            icon={Home}
            title="Add your first property"
            description="Your property is the foundation of everything in StayVue — bookings, expenses, and guests all connect to it."
            steps={[
              'Click the + button next to "All Properties" in the sidebar to create your first property',
              'Fill in the details: name, address, type, bedrooms, and base nightly rate',
              'Add your door code, WiFi password, and other quick-access codes',
              'Set up pricing seasons to automatically adjust rates for peak and off-season',
            ]}
            tip="You can add up to 2 properties on the Starter plan. Upgrade to Professional for 7."
          />
        </div>
      );
    }
    return <div className="text-center py-12 text-stone-400">Loading…</div>;
  }

  return (
    <div className="space-y-8">
      {/* Property Navigation Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Property Info</h1><HelpButton sectionId="property" /></div>
          <p className="text-sm text-stone-400 mt-0.5">{properties.length} propert{properties.length === 1 ? 'y' : 'ies'} · Viewing {property?.name || ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={addProperty} className="btn-primary flex items-center gap-1.5 text-sm"><Plus size={14} /> Add Property</button>
          {properties.length > 1 && (
            <button onClick={deleteProperty} className="btn-secondary text-sm text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1"><Trash2 size={14} /> Remove</button>
          )}
        </div>
      </div>

      {/* Property Switcher */}
      {properties.length > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={prevProp} disabled={currentIdx <= 0} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 disabled:opacity-30"><ChevronLeft size={18} /></button>
          <div className="flex-1 flex gap-2 overflow-x-auto py-1 scrollbar-hide">
            {properties.map(p => (
              <button key={p.id} onClick={() => { setLocalPid(p.id); setPropertyId(p.id); }}
                className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  p.id === pid ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' : 'bg-white ring-1 ring-stone-200 text-stone-600 hover:ring-brand-300'
                }`}>
                <Home size={14} className="inline mr-1.5 -mt-0.5" />{p.name}
              </button>
            ))}
          </div>
          <button onClick={nextProp} disabled={currentIdx >= properties.length - 1} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* Plan usage banner */}
      {billingStatus && (
        <div className="card p-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="text-stone-500">Properties: <span className="font-semibold text-stone-800">{billingStatus.property_count}/{billingStatus.property_limit === 999 ? '∞' : billingStatus.property_limit}</span></span>
            <span className="text-stone-300">|</span>
            <span className="text-stone-500">Team: <span className="font-semibold text-stone-800">{billingStatus.team_count}/{billingStatus.team_limit === 999 ? '∞' : billingStatus.team_limit}</span></span>
          </div>
          <button onClick={() => setUpgradeModal('property')} className="text-xs text-brand-600 hover:underline flex items-center gap-1"><Sparkles size={12} /> Upgrade Plan</button>
        </div>
      )}

      {/* Property Details */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><FileText size={18} className="text-brand-500" /> Details</h2>
          <div className="flex gap-2">
            <button onClick={sharePropertyInfo} className="btn-secondary flex items-center gap-1.5 text-sm"><Share2 size={14} /> Share</button>
            {!propEditing && <button onClick={() => setPropEditing(true)} className="btn-secondary flex items-center gap-1.5 text-sm"><Pencil size={14} /> Edit</button>}
          </div>
        </div>

        {propEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Property Name</label><input className="input-field w-full" value={propForm.name || ''} onChange={e => setP('name', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Type</label>
                <select className="input-field w-full" value={propForm.property_type || ''} onChange={e => setP('property_type', e.target.value)}>
                  <option value="">Select…</option><option>Entire home</option><option>Apartment</option><option>Condo</option><option>Cottage</option><option>Townhouse</option><option>Cabin</option><option>Guest suite</option>
                </select>
              </div>
              <div className="md:col-span-2"><label className="text-xs font-medium text-stone-500 mb-1 block">Address</label><input className="input-field w-full" value={propForm.address || ''} onChange={e => setP('address', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Bedrooms</label><input type="number" className="input-field w-full" value={propForm.bedrooms} onChange={e => setP('bedrooms', +e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Bathrooms</label><input type="number" step="0.5" className="input-field w-full" value={propForm.bathrooms} onChange={e => setP('bathrooms', +e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Max Guests</label><input type="number" className="input-field w-full" value={propForm.max_guests} onChange={e => setP('max_guests', +e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Base Nightly Rate</label><input type="number" className="input-field w-full" value={propForm.base_nightly_rate} onChange={e => setP('base_nightly_rate', +e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Square Footage</label><input type="number" className="input-field w-full" value={propForm.square_footage || ''} onChange={e => setP('square_footage', +e.target.value)} placeholder="e.g. 1200" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Year Built</label><input type="number" className="input-field w-full" value={propForm.year_built || ''} onChange={e => setP('year_built', +e.target.value)} placeholder="e.g. 2015" /></div>
              <div className="md:col-span-2"><label className="text-xs font-medium text-stone-500 mb-1 block">Listing URLs</label><input className="input-field w-full" value={propForm.listing_urls || ''} onChange={e => setP('listing_urls', e.target.value)} placeholder="Comma-separated: https://airbnb.com/rooms/123, https://vrbo.com/456" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Property Manager</label><input className="input-field w-full" value={propForm.property_manager || ''} onChange={e => setP('property_manager', e.target.value)} placeholder="e.g. Jane Smith" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Emergency Contact</label><input className="input-field w-full" value={propForm.emergency_contact || ''} onChange={e => setP('emergency_contact', e.target.value)} placeholder="e.g. 514-555-0100" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={cancelEdit} className="btn-secondary">Cancel</button>
              <button onClick={saveProp} disabled={propSaving} className="btn-primary flex items-center gap-1.5"><Save size={14} /> {propSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Property Name</p>
              <p className="text-sm font-medium text-stone-800">{property?.name || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Type</p>
              <p className="text-sm text-stone-800">{property?.property_type || '—'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Address</p>
              <p className="text-sm text-stone-800">{property?.address || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Bedrooms</p>
              <p className="text-sm text-stone-800">{property?.bedrooms || 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Bathrooms</p>
              <p className="text-sm text-stone-800">{property?.bathrooms || 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Max Guests</p>
              <p className="text-sm text-stone-800">{property?.max_guests || 0}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Base Nightly Rate</p>
              <p className="text-sm font-medium text-stone-800">{formatCurrency(property?.base_nightly_rate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Square Footage</p>
              <p className="text-sm text-stone-800">{property?.square_footage ? `${property.square_footage.toLocaleString()} sq ft` : '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Year Built</p>
              <p className="text-sm text-stone-800">{property?.year_built || '—'}</p>
            </div>
            {property?.listing_urls && (
              <div className="md:col-span-2">
                <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Listing URLs</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {property.listing_urls.split(',').map((url, i) => {
                    const trimmed = url.trim();
                    if (!trimmed) return null;
                    const label = trimmed.includes('airbnb') ? 'Airbnb' : trimmed.includes('vrbo') ? 'VRBO' : trimmed.includes('booking.com') ? 'Booking.com' : `Link ${i + 1}`;
                    return <a key={i} href={trimmed} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 hover:underline"><Link size={12} />{label}</a>;
                  })}
                </div>
              </div>
            )}
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Property Manager</p>
              <p className="text-sm text-stone-800">{property?.property_manager || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Emergency Contact</p>
              <p className="text-sm text-stone-800">{property?.emergency_contact || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Insurance & Licensing */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><Shield size={18} className="text-brand-500" /> Insurance & Licensing</h2>
          <div className="flex gap-2">
            {!insEditing && <button onClick={() => setInsEditing(true)} className="btn-secondary flex items-center gap-1.5 text-sm"><Pencil size={14} /> Edit</button>}
          </div>
        </div>

        {insEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Insurance Provider</label><input className="input-field w-full" value={propForm.insurance_provider || ''} onChange={e => setP('insurance_provider', e.target.value)} placeholder="e.g. State Farm" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Policy Number</label><input className="input-field w-full" value={propForm.policy_number || ''} onChange={e => setP('policy_number', e.target.value)} placeholder="e.g. HO-2025-12345" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Annual Premium</label><input type="number" className="input-field w-full" value={propForm.annual_premium || ''} onChange={e => setP('annual_premium', +e.target.value)} placeholder="e.g. 2400" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">STR License Number</label><input className="input-field w-full" value={propForm.str_license_number || ''} onChange={e => setP('str_license_number', e.target.value)} placeholder="e.g. STR-2025-0001" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">License Expiry</label><input type="date" className="input-field w-full" value={propForm.license_expiry || ''} onChange={e => setP('license_expiry', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Business License</label><input className="input-field w-full" value={propForm.business_license || ''} onChange={e => setP('business_license', e.target.value)} placeholder="e.g. BL-2024-09912" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => { setPropForm({ ...property }); setInsEditing(false); }} className="btn-secondary">Cancel</button>
              <button onClick={saveProp} disabled={propSaving} className="btn-primary flex items-center gap-1.5"><Save size={14} /> {propSaving ? 'Saving…' : 'Save Changes'}</button>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Insurance Provider</p>
              <p className="text-sm text-stone-800">{property?.insurance_provider || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Policy Number</p>
              <p className="text-sm font-mono text-stone-800">{property?.policy_number || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Annual Premium</p>
              <p className="text-sm font-medium text-stone-800">{property?.annual_premium ? formatCurrency(property.annual_premium) : '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">STR License Number</p>
              <p className="text-sm font-mono text-stone-800">{property?.str_license_number || '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">License Expiry</p>
              <p className="text-sm text-stone-800">{property?.license_expiry ? formatDate(property.license_expiry) : '—'}</p>
            </div>
            <div>
              <p className="text-[11px] font-medium text-stone-400 uppercase tracking-wide mb-0.5">Business License</p>
              <p className="text-sm font-mono text-stone-800">{property?.business_license || '—'}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Codes */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><Key size={18} className="text-brand-500" /> Quick Codes</h2>
          <button onClick={openNewCode} className="btn-secondary flex items-center gap-1.5 text-sm"><Plus size={14} /> Add Code</button>
        </div>
        {(codes || []).length === 0 ? (
          <p className="text-center text-stone-400 text-sm py-6">No codes yet — add door codes, WiFi passwords, and more</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(codes || []).map(c => {
              const IconComp = CODE_ICONS[c.icon] || Key;
              const isCopied = copiedId === c.id;
              return (
                <div key={c.id} className="group relative flex items-center gap-3 p-3.5 rounded-xl bg-stone-50 hover:bg-brand-50/50 ring-1 ring-stone-100 hover:ring-brand-200 transition-all">
                  <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0"><IconComp size={17} className="text-brand-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wide">{c.label}</p>
                    <p className="text-sm font-semibold text-stone-800 font-mono tracking-wide">{c.value || '—'}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyCode(c.id, c.value)} className={`p-1.5 rounded-lg transition-colors ${isCopied ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-stone-200 text-stone-400'}`}>{isCopied ? <Check size={13} /> : <Copy size={13} />}</button>
                    <button onClick={() => openEditCode(c)} className="p-1.5 rounded-lg hover:bg-stone-200 text-stone-400"><Pencil size={13} /></button>
                    <button onClick={() => deleteCode(c.id)} className="p-1.5 rounded-lg hover:bg-red-100 text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pricing Seasons */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100"><h2 className="font-semibold flex items-center gap-2"><BarChart3 size={18} className="text-brand-500" /> Pricing Seasons</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
              <th className="px-4 py-3 font-medium">Season</th><th className="px-4 py-3 font-medium">Start</th><th className="px-4 py-3 font-medium">End</th>
              <th className="px-4 py-3 font-medium text-right">Multiplier</th><th className="px-4 py-3 font-medium text-right">Rate</th><th className="px-4 py-3 font-medium text-right">Min Nights</th><th className="px-4 py-3 font-medium w-24"></th>
            </tr></thead>
            <tbody>
              {(pricing || []).map(s => {
                const isEditing = editPrice?.id === s.id;
                const effectiveRate = (propForm.base_nightly_rate || 0) * (s.multiplier || 1);
                return (
                  <tr key={s.id} className="border-b border-stone-50 hover:bg-stone-50/50">
                    <td className="px-4 py-3 font-medium">{s.name}</td>
                    <td className="px-4 py-3">{formatDate(s.start_date)}</td><td className="px-4 py-3">{formatDate(s.end_date)}</td>
                    <td className="px-4 py-3 text-right">{isEditing ? <input type="number" step="0.05" className="input-field w-20 text-right" value={editPrice.multiplier} onChange={e => setEditPrice(p => ({ ...p, multiplier: +e.target.value }))} /> : <span className={`font-medium ${s.multiplier > 1 ? 'text-emerald-600' : s.multiplier < 1 ? 'text-red-500' : ''}`}>{s.multiplier}x</span>}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(effectiveRate)}</td>
                    <td className="px-4 py-3 text-right">{isEditing ? <input type="number" className="input-field w-16 text-right" value={editPrice.min_nights} onChange={e => setEditPrice(p => ({ ...p, min_nights: +e.target.value }))} /> : s.min_nights}</td>
                    <td className="px-4 py-3">{isEditing ? <div className="flex gap-1"><button onClick={savePrice} className="btn-primary text-xs px-2 py-1">Save</button><button onClick={() => setEditPrice(null)} className="btn-secondary text-xs px-2 py-1">Cancel</button></div> : <button onClick={() => setEditPrice({ ...s })} className="text-xs text-brand-500 hover:underline">Edit</button>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Survey Summary */}
      {surveySum && surveySum.total > 0 && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold flex items-center gap-2"><Star size={18} className="text-amber-500" /> Guest Ratings ({surveySum.total} surveys)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {ratingCategories.map(rc => {
              const val = surveySum[rc.key];
              return (<div key={rc.key} className="text-center"><div className={`text-2xl font-semibold ${val >= 4.5 ? 'text-emerald-600' : val >= 4 ? 'text-amber-600' : 'text-red-500'}`}>{val ?? '—'}</div><div className="text-xs text-stone-500 mt-1">{rc.label}</div><div className="h-1.5 bg-stone-100 rounded-full mt-2 overflow-hidden"><div className="h-full rounded-full bg-amber-400" style={{ width: `${(val / 5) * 100}%` }} /></div></div>);
            })}
          </div>
        </div>
      )}

      {/* Documents & Files */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2"><FileText size={18} className="text-brand-500" /> Documents & Files</h2>
          <button onClick={openNewDoc} className="btn-primary flex items-center gap-1.5 text-sm"><Plus size={14} /> Add Document</button>
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={handleFileSelect} />
        {(documents || []).length === 0 ? (
          <div className="p-12 text-center"><File size={36} className="mx-auto text-stone-300 mb-2" /><p className="text-stone-400 text-sm">No documents yet</p></div>
        ) : (
          <div className="divide-y divide-stone-100">
            {(documents || []).map(d => (
              <div key={d.id} className="px-4 sm:px-6 py-4 hover:bg-stone-50/50 transition-colors">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {d.file_path && isImage(d.file_path) ? <img src={`/api/property/uploads/${d.file_path}`} alt="" className="w-full h-full object-cover cursor-pointer" onClick={() => setPreviewFile(d)} />
                      : d.file_path ? <File size={18} className="text-stone-400" /> : <FileText size={18} className="text-stone-300" />}
                  </div>
                  <span className="font-medium text-sm flex-1 min-w-0 truncate">{d.name}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={() => triggerUpload(d.id)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-600" title="Upload">{uploadingDocId === d.id ? <span className="text-xs animate-pulse">…</span> : <Upload size={14} />}</button>
                    {d.file_path && isImage(d.file_path) && <button onClick={() => setPreviewFile(d)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-blue-600"><Eye size={14} /></button>}
                    {d.file_path && <a href={`/api/property/documents/${d.id}/download`} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-emerald-600"><Download size={14} /></a>}
                    <button onClick={() => openEditDoc(d)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={14} /></button>
                    <button onClick={() => deleteDoc(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 ml-[52px] mb-1.5">
                  <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-500">{d.category || 'Other'}</span>
                  <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${d.status === 'filed' ? 'bg-emerald-50 text-emerald-700' : d.status === 'active' ? 'bg-blue-50 text-blue-700' : d.status === 'expired' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>{d.status}</span>
                  {d.is_deductible ? <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700">Deductible</span> : null}
                  {d.file_path && <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-brand-50 text-brand-700">📎 Receipt</span>}
                </div>
                <div className="ml-[52px] grid grid-cols-2 sm:flex sm:flex-wrap sm:gap-x-6 gap-y-0.5 text-xs text-stone-400">
                  {d.date && <span>{formatDate(d.date)}</span>}
                  {d.amount > 0 && <span className="font-semibold text-stone-600">{formatCurrency(d.amount)}</span>}
                  {d.vendor && <span>{d.vendor}</span>}
                  {d.tax_year && <span>Tax yr: {d.tax_year}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── ADD PROPERTY MODAL ─── */}
      {newPropModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setNewPropModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">Add New Property</h2>
              <button onClick={() => setNewPropModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Property Name *</label>
                <input className="input-field w-full" placeholder="e.g. Beach House" value={newPropName} onChange={e => setNewPropName(e.target.value)} autoFocus /></div>
              <p className="text-xs text-stone-400">You can fill in the full details after creating the property.</p>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setNewPropModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={createProperty} disabled={propSaving || !newPropName.trim()} className="btn-primary">{propSaving ? 'Creating…' : 'Create Property'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── UPGRADE MODAL ─── */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setUpgradeModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><CreditCard size={18} className="text-brand-500" />
                {upgradeModal === 'property' ? 'Add More Properties' : 'Add Team Access'}
              </h2>
              <button onClick={() => setUpgradeModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {upgradeModal === 'property' ? (
                <>
                  <p className="text-sm text-stone-500">Your plan includes {billingStatus?.property_limit === 999 ? 'unlimited' : billingStatus?.property_limit} properties. You're currently using {billingStatus?.property_count}.</p>
                  <div className="space-y-3">
                    {billingStatus?.plans?.property?.map(plan => (
                      <button key={plan.id} onClick={() => handleUpgrade(plan.id)} disabled={upgrading}
                        className="w-full flex items-center justify-between p-4 rounded-xl ring-1 ring-stone-200 hover:ring-brand-400 hover:bg-brand-50/30 transition-all text-left">
                        <div><p className="text-sm font-semibold">{plan.label}</p><p className="text-xs text-stone-400">{plan.add >= 999 ? 'No limits ever' : `Add ${plan.add} more propert${plan.add === 1 ? 'y' : 'ies'}`}</p></div>
                        <span className="text-lg font-bold text-brand-600">${plan.price}</span>
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-stone-500">Your plan includes {billingStatus?.team_limit === 999 ? 'unlimited' : billingStatus?.team_limit} team members. You currently have {billingStatus?.team_count}.</p>
                  <div className="space-y-3">
                    {billingStatus?.plans?.team?.map(plan => (
                      <button key={plan.id} onClick={() => handleUpgrade(plan.id)} disabled={upgrading}
                        className="w-full flex items-center justify-between p-4 rounded-xl ring-1 ring-stone-200 hover:ring-brand-400 hover:bg-brand-50/30 transition-all text-left">
                        <div><p className="text-sm font-semibold">{plan.label}</p><p className="text-xs text-stone-400">{plan.add >= 999 ? 'No limits ever' : `Add ${plan.add} team member${plan.add === 1 ? '' : 's'}`}</p></div>
                        <span className="text-lg font-bold text-brand-600">${plan.price}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              <p className="text-[10px] text-stone-400 text-center">In production, this would process payment via Stripe. Currently simulated for demo purposes.</p>
            </div>
          </div>
        </div>
      )}

      {/* ─── DOCUMENT MODAL ─── */}
      {docModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setDocModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{docModal === 'new' ? 'Add Document' : 'Edit Document'}</h2>
              <button onClick={() => setDocModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><label className="text-xs font-medium text-stone-500 mb-1 block">Name *</label><input className="input-field w-full" value={docForm.name} onChange={e => setD('name', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Category</label><select className="input-field w-full" value={docForm.category} onChange={e => setD('category', e.target.value)}>{DOC_CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Date</label><input type="date" className="input-field w-full" value={docForm.date || ''} onChange={e => setD('date', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Amount</label><input type="number" className="input-field w-full" value={docForm.amount} onChange={e => setD('amount', +e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Vendor</label><input className="input-field w-full" value={docForm.vendor || ''} onChange={e => setD('vendor', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Tax Year</label><input type="number" className="input-field w-full" value={docForm.tax_year} onChange={e => setD('tax_year', +e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Status</label><select className="input-field w-full" value={docForm.status} onChange={e => setD('status', e.target.value)}><option value="pending">Pending</option><option value="active">Active</option><option value="filed">Filed</option><option value="expired">Expired</option></select></div>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Attach File</label>
                <input type="file" ref={modalFileRef} className="hidden" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={handleModalFileSelect} />
                {modalFile ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50 ring-1 ring-brand-200">
                    <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">{isImage(modalFile.name) ? <Image size={18} className="text-brand-600" /> : <File size={18} className="text-brand-600" />}</div>
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-brand-800 truncate">{modalFile.name}</p><p className="text-xs text-brand-500">{(modalFile.size/1024/1024).toFixed(2)} MB</p></div>
                    <button onClick={() => { setModalFile(null); if (modalFileRef.current) modalFileRef.current.value = ''; }} className="p-1 rounded-lg hover:bg-brand-100 text-brand-400"><X size={16} /></button>
                  </div>
                ) : docForm.file_path ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 ring-1 ring-stone-200">
                    <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0"><File size={18} className="text-stone-500" /></div>
                    <div className="flex-1"><p className="text-sm text-stone-600 truncate">File attached</p></div>
                    <button onClick={() => modalFileRef.current?.click()} className="btn-secondary text-xs"><Upload size={12} /> Replace</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => modalFileRef.current?.click()} className="w-full p-5 rounded-xl border-2 border-dashed border-stone-200 hover:border-brand-400 hover:bg-brand-50/30 transition-colors text-center group cursor-pointer">
                    <Upload size={22} className="mx-auto text-stone-300 group-hover:text-brand-500 mb-1.5" /><p className="text-sm text-stone-500">Upload file — up to 25 MB</p>
                  </button>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!docForm.is_deductible} onChange={e => setD('is_deductible', e.target.checked ? 1 : 0)} /> Tax Deductible</label>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setDocModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveDoc} disabled={docSaving || !docForm.name} className="btn-primary">{docSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Code Modal */}
      {codeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh]" onClick={() => setCodeModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100"><h2 className="font-semibold">{codeModal === 'new' ? 'Add Code' : 'Edit Code'}</h2><button onClick={() => setCodeModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button></div>
            <div className="p-6 space-y-4">
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Label *</label><input className="input-field w-full" value={codeForm.label} onChange={e => setC('label', e.target.value)} placeholder="e.g. Front Door Code" /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Code / Value *</label><input className="input-field w-full font-mono text-lg tracking-wider" value={codeForm.value} onChange={e => setC('value', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">{CODE_ICON_OPTIONS.map(ic => { const Ic = CODE_ICONS[ic] || Key; return (<button key={ic} onClick={() => setC('icon', ic)} className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${codeForm.icon === ic ? 'bg-brand-500 text-white ring-2 ring-brand-300' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}><Ic size={16} /></button>); })}</div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setCodeModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveCode} disabled={codeSaving || !codeForm.label || !codeForm.value} className="btn-primary">{codeSaving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="max-w-3xl max-h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-3 border-b border-stone-100">
              <span className="font-medium text-sm truncate">{previewFile.name}</span>
              <div className="flex gap-2 items-center"><a href={`/api/property/documents/${previewFile.id}/download`} className="btn-secondary text-xs flex items-center gap-1"><Download size={12} /> Download</a><button onClick={() => setPreviewFile(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button></div>
            </div>
            <div className="overflow-auto max-h-[75vh] p-2 bg-stone-50"><img src={`/api/property/uploads/${previewFile.file_path}`} alt={previewFile.name} className="max-w-full h-auto rounded-lg" /></div>
          </div>
        </div>
      )}
    </div>
  );
}
