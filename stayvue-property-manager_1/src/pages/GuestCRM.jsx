import { useState } from 'react';
import { useApi, apiPost, apiPut, apiDelete, formatCurrency, formatDate } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Plus, Pencil, Trash2, X, Mail, Phone, MapPin, Star, PawPrint, Send, FileText, Clock, Users, Eye, Calendar, Repeat, CheckCircle, Search } from 'lucide-react';
import EmptyState from '../components/EmptyState';

const STATUS_COLORS = {
  active: 'bg-emerald-50 text-emerald-700',
  inactive: 'bg-stone-100 text-stone-500',
  vip: 'bg-amber-50 text-amber-700',
  blocked: 'bg-red-50 text-red-600',
};

const CAMPAIGN_STATUS_COLORS = {
  draft: 'bg-stone-100 text-stone-600',
  scheduled: 'bg-blue-50 text-blue-700',
  active: 'bg-emerald-50 text-emerald-700',
  paused: 'bg-amber-50 text-amber-700',
  sent: 'bg-purple-50 text-purple-700',
  cancelled: 'bg-red-50 text-red-600',
};

const TEMPLATE_CATEGORIES = ['welcome', 'thank_you', 'promo', 'reminder', 'follow_up', 'newsletter', 'general'];

const EMPTY_GUEST = {
  first_name: '', last_name: '', email: '', phone: '', country_city: '',
  total_stays: 0, total_nights: 0, total_spend: 0, last_rating: '',
  is_pet_owner: 0, preferences: '', marketing_optin: 0, last_contacted: '', status: 'active',
};

const EMPTY_CAMPAIGN = {
  name: '', template_id: '', subject: '', body: '',
  recipient_type: 'all_optin', recipient_ids: [],
  frequency: 'once', scheduled_at: '', status: 'draft',
};

export default function GuestCRM() {
  const [tab, setTab] = useState('guests'); // guests | emails | templates
  const [statusFilter, setStatusFilter] = useState('');
  const qs = `?limit=200${statusFilter ? `&status=${statusFilter}` : ''}`;
  const { data: rows, loading, refetch } = useApi(`/guests${qs}`, [statusFilter]);
  const { data: templates, refetch: refetchTemplates } = useApi('/emails/templates');
  const { data: campaigns, refetch: refetchCampaigns } = useApi('/emails/campaigns');
  const [modal, setModal] = useState(null); // null | 'guest-new' | 'guest-edit' | 'campaign-new' | 'campaign-edit' | 'template-new' | 'template-edit' | 'preview' | 'send-result'
  const [form, setForm] = useState(EMPTY_GUEST);
  const [campForm, setCampForm] = useState(EMPTY_CAMPAIGN);
  const [tplForm, setTplForm] = useState({ name: '', subject: '', body: '', category: 'general' });
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [previewData, setPreviewData] = useState(null);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  const guests = (rows || []).filter(g => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${g.first_name} ${g.last_name}`.toLowerCase().includes(q) || g.email?.toLowerCase().includes(q);
  });

  const optedInGuests = (rows || []).filter(g => g.marketing_optin && g.email);
  const totalRevenue = guests.reduce((s, g) => s + (g.total_spend || 0), 0);
  const avgRating = guests.filter(g => g.last_rating).reduce((s, g, _, a) => s + g.last_rating / a.length, 0);

  // Guest CRUD
  function openNewGuest() { setForm({ ...EMPTY_GUEST }); setModal('guest-new'); }
  function openEditGuest(g) { setForm({ ...g, last_rating: g.last_rating ?? '', last_contacted: g.last_contacted || '' }); setModal('guest-edit'); }
  async function saveGuest() {
    setSaving(true);
    try {
      const payload = { ...form, last_rating: form.last_rating === '' ? null : Number(form.last_rating), last_contacted: form.last_contacted || null };
      if (modal === 'guest-new') await apiPost('/guests', payload);
      else await apiPut(`/guests/${form.id}`, payload);
      setModal(null); refetch();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }
  async function removeGuest(id) { if (!confirm('Delete this guest?')) return; await apiDelete(`/guests/${id}`); refetch(); }
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Template CRUD
  function openNewTemplate() { setTplForm({ name: '', subject: '', body: '', category: 'general' }); setModal('template-new'); }
  function openEditTemplate(t) { setTplForm({ ...t }); setModal('template-edit'); }
  async function saveTemplate() {
    setSaving(true);
    try {
      if (modal === 'template-new') await apiPost('/emails/templates', tplForm);
      else await apiPut(`/emails/templates/${tplForm.id}`, tplForm);
      setModal(null); refetchTemplates();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }
  async function removeTemplate(id) { if (!confirm('Delete this template?')) return; await apiDelete(`/emails/templates/${id}`); refetchTemplates(); }

  // Campaign CRUD
  function openNewCampaign(templateId) {
    const tpl = templateId ? (templates || []).find(t => t.id === templateId) : null;
    setCampForm({
      ...EMPTY_CAMPAIGN,
      template_id: tpl?.id || '',
      subject: tpl?.subject || '',
      body: tpl?.body || '',
      name: tpl ? `${tpl.name} — ${new Date().toLocaleDateString('en-CA')}` : '',
    });
    setModal('campaign-new');
  }
  function openEditCampaign(c) {
    setCampForm({ ...c, recipient_ids: c.recipient_ids ? JSON.parse(c.recipient_ids) : [], template_id: c.template_id || '' });
    setModal('campaign-edit');
  }
  async function saveCampaign() {
    setSaving(true);
    try {
      if (modal === 'campaign-new') await apiPost('/emails/campaigns', campForm);
      else await apiPut(`/emails/campaigns/${campForm.id}`, campForm);
      setModal(null); refetchCampaigns();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }
  async function removeCampaign(id) { if (!confirm('Delete this campaign?')) return; await apiDelete(`/emails/campaigns/${id}`); refetchCampaigns(); }

  // Preview & Send
  async function previewEmail(campaign) {
    try {
      const sampleGuest = optedInGuests[0];
      const res = await apiPost('/emails/preview', {
        subject: campaign.subject || campForm.subject,
        body: campaign.body || campForm.body,
        guest_id: sampleGuest?.id,
      });
      setPreviewData(res);
      setModal('preview');
    } catch (e) { alert(e.message); }
  }

  async function sendCampaign(id) {
    if (!confirm('Send this campaign now? Emails will be generated for all recipients.')) return;
    try {
      const res = await apiPost(`/emails/send/${id}`, {});
      setSendResult(res);
      setModal('send-result');
      refetchCampaigns();
      refetch();
    } catch (e) { alert(e.message); }
  }

  // Send individual email to a guest
  function emailGuest(guest) {
    setCampForm({
      ...EMPTY_CAMPAIGN,
      name: `Direct to ${guest.first_name} ${guest.last_name}`,
      recipient_type: 'individual',
      recipient_ids: [guest.id],
      subject: '',
      body: `Hi ${guest.first_name},\n\n\n\nBest regards,\nYour Host`,
    });
    setModal('campaign-new');
  }

  const setCamp = (k, v) => setCampForm(f => ({ ...f, [k]: v }));
  const setTpl = (k, v) => setTplForm(f => ({ ...f, [k]: v }));

  // Load template into campaign form
  function loadTemplate(templateId) {
    const t = (templates || []).find(x => x.id === Number(templateId));
    if (t) {
      setCampForm(f => ({ ...f, template_id: t.id, subject: t.subject, body: t.body }));
    } else {
      setCampForm(f => ({ ...f, template_id: '' }));
    }
  }

  function recipientLabel(type) {
    const map = { all_optin: 'All opted-in guests', individual: 'Specific guests', vip: 'VIP guests only', past_guests: 'Past guests' };
    return map[type] || type;
  }

  function recipientCount(type, ids) {
    if (type === 'individual') return (ids || []).length;
    if (type === 'vip') return (rows || []).filter(g => g.status === 'vip' && g.marketing_optin && g.email).length;
    if (type === 'past_guests') return (rows || []).filter(g => g.total_stays > 0 && g.marketing_optin && g.email).length;
    return optedInGuests.length;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Guest CRM</h1><HelpButton sectionId="guests" /></div>
        <div className="flex gap-2">
          {tab === 'guests' && <button onClick={openNewGuest} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> Add Guest</button>}
          {tab === 'emails' && <button onClick={() => openNewCampaign()} className="btn-primary flex items-center gap-1.5"><Send size={16} /> New Campaign</button>}
          {tab === 'templates' && <button onClick={openNewTemplate} className="btn-primary flex items-center gap-1.5"><Plus size={16} /> New Template</button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
        {[
          { id: 'guests', label: 'Guests', icon: Users },
          { id: 'emails', label: 'Email Campaigns', icon: Send },
          { id: 'templates', label: 'Templates', icon: FileText },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <t.icon size={15} />{t.label}
          </button>
        ))}
      </div>

      {/* ─── GUESTS TAB ─── */}
      {tab === 'guests' && (
        <>
          {/* KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Guests</p><p className="text-xl font-semibold">{guests.length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Revenue</p><p className="text-xl font-semibold">{formatCurrency(totalRevenue)}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Opted-in Emails</p><p className="text-xl font-semibold">{optedInGuests.length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Repeat Guests</p><p className="text-xl font-semibold">{guests.filter(g => g.total_stays > 1).length}</p></div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-xs">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input className="input-field pl-9 w-full" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-field" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="active">Active</option><option value="vip">VIP</option>
              <option value="inactive">Inactive</option><option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Guest Cards */}
          {loading ? (
            <div className="text-center py-12 text-stone-400">Loading…</div>
          ) : guests.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Your guest list is empty"
              description="Build guest profiles, track VIPs, note preferences, and run email campaigns to drive repeat direct bookings."
              steps={[
                'Guests are added automatically when you log bookings with their email address',
                'Or click "Add Guest" to manually create a profile',
                'Mark repeat guests as VIPs and turn on marketing opt-in to send them seasonal promos',
              ]}
              tip="Direct bookings from past guests save you the 3-15% platform fee."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {guests.map(g => (
                <div key={g.id} className="card p-5 flex gap-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 font-semibold text-sm shrink-0">
                    {(g.first_name?.[0] || '')}{(g.last_name?.[0] || '')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{g.first_name} {g.last_name}</span>
                      <span className={`badge text-[10px] ${STATUS_COLORS[g.status] || ''}`}>{g.status}</span>
                      {g.marketing_optin ? <Mail size={12} className="text-brand-500" title="Email opted-in" /> : null}
                      {g.is_pet_owner ? <PawPrint size={14} className="text-amber-500" /> : null}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500 mb-2">
                      {g.email && <span className="flex items-center gap-1"><Mail size={12} />{g.email}</span>}
                      {g.phone && <span className="flex items-center gap-1"><Phone size={12} />{g.phone}</span>}
                      {g.country_city && <span className="flex items-center gap-1"><MapPin size={12} />{g.country_city}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span><strong>{g.total_stays}</strong> stays</span>
                      <span><strong>{g.total_nights}</strong> nights</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(g.total_spend)}</span>
                      {g.last_rating && <span className="flex items-center gap-0.5"><Star size={12} className="text-amber-500" />{g.last_rating}</span>}
                      {g.last_contacted && <span className="text-stone-400">Last contacted: {formatDate(g.last_contacted)}</span>}
                    </div>
                    {g.preferences && <p className="text-xs text-stone-400 mt-1.5 truncate">{g.preferences}</p>}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {g.email && <button onClick={() => emailGuest(g)} className="p-1.5 rounded-lg hover:bg-brand-50 text-stone-400 hover:text-brand-600" title="Send email"><Mail size={14} /></button>}
                    <button onClick={() => openEditGuest(g)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={14} /></button>
                    <button onClick={() => removeGuest(g.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── EMAIL CAMPAIGNS TAB ─── */}
      {tab === 'emails' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Campaigns</p><p className="text-xl font-semibold">{(campaigns || []).length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Active / Scheduled</p><p className="text-xl font-semibold">{(campaigns || []).filter(c => ['active','scheduled'].includes(c.status)).length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Opted-in Recipients</p><p className="text-xl font-semibold">{optedInGuests.length}</p></div>
            <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Total Sent</p><p className="text-xl font-semibold">{(campaigns || []).reduce((s, c) => s + (c.send_count || 0), 0)}</p></div>
          </div>

          {/* Quick-start from template */}
          {(templates || []).length > 0 && (
            <div className="card p-4">
              <p className="text-xs text-stone-500 mb-2 font-medium">Quick start from template</p>
              <div className="flex flex-wrap gap-2">
                {(templates || []).slice(0, 5).map(t => (
                  <button key={t.id} onClick={() => openNewCampaign(t.id)}
                    className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 text-xs font-medium hover:bg-brand-100 transition-colors">
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Campaign list */}
          {(campaigns || []).length === 0 ? (
            <div className="text-center py-12 text-stone-400">No campaigns yet — create one to get started</div>
          ) : (
            <div className="space-y-3">
              {(campaigns || []).map(c => (
                <div key={c.id} className="card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm truncate">{c.name}</h3>
                        <span className={`badge text-[10px] ${CAMPAIGN_STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                        {c.frequency !== 'once' && <span className="badge text-[10px] bg-blue-50 text-blue-600 flex items-center gap-1"><Repeat size={10} />{c.frequency}</span>}
                      </div>
                      <p className="text-xs text-stone-500 truncate mb-2">{c.subject}</p>
                      <div className="flex flex-wrap gap-3 text-xs text-stone-400">
                        <span className="flex items-center gap-1"><Users size={12} />{recipientLabel(c.recipient_type)} ({recipientCount(c.recipient_type, c.recipient_ids ? JSON.parse(c.recipient_ids) : [])})</span>
                        {c.scheduled_at && <span className="flex items-center gap-1"><Calendar size={12} />Scheduled: {formatDate(c.scheduled_at)}</span>}
                        {c.last_sent_at && <span className="flex items-center gap-1"><CheckCircle size={12} />Last sent: {formatDate(c.last_sent_at)}</span>}
                        {c.next_send_at && c.status === 'active' && <span className="flex items-center gap-1"><Clock size={12} />Next: {formatDate(c.next_send_at)}</span>}
                        {c.send_count > 0 && <span>Sent {c.send_count}x</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => previewEmail(c)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600" title="Preview"><Eye size={14} /></button>
                      {['draft','scheduled','active','paused'].includes(c.status) && (
                        <button onClick={() => sendCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-emerald-50 text-stone-400 hover:text-emerald-600" title="Send now"><Send size={14} /></button>
                      )}
                      <button onClick={() => openEditCampaign(c)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={14} /></button>
                      <button onClick={() => removeCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TEMPLATES TAB ─── */}
      {tab === 'templates' && (
        <div className="space-y-4">
          {(templates || []).length === 0 ? (
            <div className="text-center py-12 text-stone-400">No templates yet</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {(templates || []).map(t => (
                <div key={t.id} className="card p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-sm">{t.name}</h3>
                      <span className="badge text-[10px] bg-stone-100 text-stone-500 mt-1">{t.category}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openNewCampaign(t.id)} className="p-1.5 rounded-lg hover:bg-brand-50 text-stone-400 hover:text-brand-600" title="Use in campaign"><Send size={13} /></button>
                      <button onClick={() => openEditTemplate(t)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600"><Pencil size={13} /></button>
                      <button onClick={() => removeTemplate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 font-medium mb-1">{t.subject}</p>
                  <p className="text-xs text-stone-400 line-clamp-3 whitespace-pre-line">{t.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── GUEST MODAL ─── */}
      {(modal === 'guest-new' || modal === 'guest-edit') && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'guest-new' ? 'New Guest' : 'Edit Guest'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">First Name *</label><input className="input-field w-full" value={form.first_name} onChange={e => set('first_name', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Last Name</label><input className="input-field w-full" value={form.last_name || ''} onChange={e => set('last_name', e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Email</label><input type="email" className="input-field w-full" value={form.email || ''} onChange={e => set('email', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Phone</label><input className="input-field w-full" value={form.phone || ''} onChange={e => set('phone', e.target.value)} /></div>
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Location</label><input className="input-field w-full" value={form.country_city || ''} onChange={e => set('country_city', e.target.value)} placeholder="City, Country" /></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Stays</label><input type="number" className="input-field w-full" value={form.total_stays} onChange={e => set('total_stays', +e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Nights</label><input type="number" className="input-field w-full" value={form.total_nights} onChange={e => set('total_nights', +e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Total Spend</label><input type="number" className="input-field w-full" value={form.total_spend} onChange={e => set('total_spend', +e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Rating</label><input type="number" step="0.1" min="0" max="5" className="input-field w-full" value={form.last_rating} onChange={e => set('last_rating', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Status</label>
                  <select className="input-field w-full" value={form.status} onChange={e => set('status', e.target.value)}>
                    <option value="active">Active</option><option value="vip">VIP</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.is_pet_owner} onChange={e => set('is_pet_owner', e.target.checked ? 1 : 0)} /> Pet Owner</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="rounded" checked={!!form.marketing_optin} onChange={e => set('marketing_optin', e.target.checked ? 1 : 0)} /> Marketing Opt-in</label>
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Preferences</label><textarea className="input-field w-full" rows={2} value={form.preferences || ''} onChange={e => set('preferences', e.target.value)} /></div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Last Contacted</label><input type="date" className="input-field w-full" value={form.last_contacted} onChange={e => set('last_contacted', e.target.value)} /></div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveGuest} disabled={saving} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CAMPAIGN MODAL ─── */}
      {(modal === 'campaign-new' || modal === 'campaign-edit') && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><Send size={18} className="text-brand-500" />{modal === 'campaign-new' ? 'New Email Campaign' : 'Edit Campaign'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Campaign name + template */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Campaign Name *</label>
                  <input className="input-field w-full" value={campForm.name} onChange={e => setCamp('name', e.target.value)} placeholder="e.g. Summer 2025 Promo" />
                </div>
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Load from Template</label>
                  <select className="input-field w-full" value={campForm.template_id} onChange={e => loadTemplate(e.target.value)}>
                    <option value="">— Write from scratch —</option>
                    {(templates || []).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Recipients */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Recipients</label>
                  <select className="input-field w-full" value={campForm.recipient_type} onChange={e => setCamp('recipient_type', e.target.value)}>
                    <option value="all_optin">All opted-in guests ({optedInGuests.length})</option>
                    <option value="individual">Specific guests</option>
                    <option value="vip">VIP guests only</option>
                    <option value="past_guests">Past guests (1+ stays)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Frequency</label>
                    <select className="input-field w-full" value={campForm.frequency} onChange={e => setCamp('frequency', e.target.value)}>
                      <option value="once">One-time</option>
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Every 2 weeks</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1 block">Schedule</label>
                    <input type="datetime-local" className="input-field w-full" value={campForm.scheduled_at} onChange={e => setCamp('scheduled_at', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Individual recipient picker */}
              {campForm.recipient_type === 'individual' && (
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Select Guests</label>
                  <div className="max-h-36 overflow-auto rounded-xl ring-1 ring-stone-200 p-2 space-y-1">
                    {(rows || []).filter(g => g.email).map(g => (
                      <label key={g.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-stone-50 cursor-pointer">
                        <input type="checkbox" className="rounded"
                          checked={(campForm.recipient_ids || []).includes(g.id)}
                          onChange={e => {
                            const ids = campForm.recipient_ids || [];
                            setCamp('recipient_ids', e.target.checked ? [...ids, g.id] : ids.filter(x => x !== g.id));
                          }}
                        />
                        <span>{g.first_name} {g.last_name}</span>
                        <span className="text-xs text-stone-400 ml-auto">{g.email}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Email content */}
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Subject Line *</label>
                <input className="input-field w-full" value={campForm.subject} onChange={e => setCamp('subject', e.target.value)} placeholder="e.g. Special summer rates just for you, {{first_name}}!" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Email Body *</label>
                <textarea className="input-field w-full font-mono text-sm" rows={10} value={campForm.body}
                  onChange={e => setCamp('body', e.target.value)}
                  placeholder="Hi {{first_name}},\n\nWe'd love to welcome you back this summer! As a returning guest, you'll enjoy exclusive rates.\n\nSee you soon,\nYour Host" />
              </div>

              {/* Variable guide */}
              <div className="rounded-xl bg-blue-50 ring-1 ring-blue-100 p-3.5">
                <p className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1.5">💡 Personalization Variables</p>
                <p className="text-[11px] text-blue-700 leading-relaxed mb-2">
                  Insert any of these placeholders in your subject or body. When the email sends, each variable is replaced with the actual guest's information.
                </p>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between">
                    <code className="text-blue-600 font-mono">{'{{first_name}}'}</code><span className="text-blue-500">→ Emma</span>
                  </div>
                  <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between">
                    <code className="text-blue-600 font-mono">{'{{last_name}}'}</code><span className="text-blue-500">→ Wilson</span>
                  </div>
                  <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between">
                    <code className="text-blue-600 font-mono">{'{{full_name}}'}</code><span className="text-blue-500">→ Emma Wilson</span>
                  </div>
                  <div className="bg-white/60 rounded-lg px-2 py-1.5 flex justify-between">
                    <code className="text-blue-600 font-mono">{'{{email}}'}</code><span className="text-blue-500">→ emma@email.com</span>
                  </div>
                </div>
                <p className="text-[10px] text-blue-500 mt-2 italic">Example: "Hi {'{{first_name}}'}" sends as "Hi Emma" to Emma Wilson and "Hi James" to James Chen.</p>
              </div>

              {/* Status for edit */}
              {modal === 'campaign-edit' && (
                <div>
                  <label className="text-xs font-medium text-stone-500 mb-1 block">Status</label>
                  <select className="input-field w-fit" value={campForm.status} onChange={e => setCamp('status', e.target.value)}>
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-between">
              <button onClick={() => previewEmail(campForm)} className="btn-secondary flex items-center gap-1.5" disabled={!campForm.body}>
                <Eye size={14} /> Preview
              </button>
              <div className="flex gap-2">
                <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
                <button onClick={saveCampaign} disabled={saving || !campForm.name || !campForm.subject || !campForm.body} className="btn-primary">
                  {saving ? 'Saving…' : 'Save Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TEMPLATE MODAL ─── */}
      {(modal === 'template-new' || modal === 'template-edit') && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold">{modal === 'template-new' ? 'New Template' : 'Edit Template'}</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Template Name *</label><input className="input-field w-full" value={tplForm.name} onChange={e => setTpl('name', e.target.value)} /></div>
                <div><label className="text-xs font-medium text-stone-500 mb-1 block">Category</label>
                  <select className="input-field w-full" value={tplForm.category} onChange={e => setTpl('category', e.target.value)}>
                    {TEMPLATE_CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs font-medium text-stone-500 mb-1 block">Subject *</label><input className="input-field w-full" value={tplForm.subject} onChange={e => setTpl('subject', e.target.value)} /></div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Body *</label>
                <textarea className="input-field w-full font-mono text-sm" rows={10} value={tplForm.body} onChange={e => setTpl('body', e.target.value)}
                  placeholder="Hi {{first_name}},\n\nThank you for staying with us!\n\nBest regards,\nYour Host" />
                <div className="mt-2 flex flex-wrap gap-1">
                  {['{{first_name}}','{{last_name}}','{{full_name}}','{{email}}'].map(v => (
                    <button key={v} type="button" onClick={() => setTpl('body', tplForm.body + v)}
                      className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-[10px] font-mono hover:bg-blue-100 transition-colors">{v}</button>
                  ))}
                  <span className="text-[10px] text-stone-400 self-center ml-1">← click to insert</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="btn-secondary">Cancel</button>
              <button onClick={saveTemplate} disabled={saving || !tplForm.name || !tplForm.subject || !tplForm.body} className="btn-primary">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── PREVIEW MODAL ─── */}
      {modal === 'preview' && previewData && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><Eye size={18} /> Email Preview</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs text-stone-400">Previewing with sample guest: <span className="text-stone-600 font-medium">{previewData.guest_name}</span> ({previewData.guest_email})</div>
              <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                <div className="bg-stone-50 px-4 py-2.5 border-b border-stone-200">
                  <p className="text-xs text-stone-400">Subject:</p>
                  <p className="text-sm font-medium">{previewData.subject}</p>
                </div>
                <div className="p-4 whitespace-pre-line text-sm text-stone-700 leading-relaxed">
                  {previewData.body}
                </div>
              </div>
              <div className="text-xs text-stone-400 italic">
                Variables like {'{{first_name}}'} have been replaced with "{previewData.guest_name?.split(' ')[0]}" for this preview. Each recipient will see their own name.
              </div>

              {/* Send test email */}
              <div className="rounded-xl bg-amber-50 ring-1 ring-amber-100 p-3.5">
                <p className="text-xs font-semibold text-amber-800 mb-2">Send a test email to yourself</p>
                <p className="text-[11px] text-amber-700 mb-2.5">Check formatting, links, and how the variables look in a real inbox before sending to guests.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    onClick={async () => {
                      if (!testEmail) { alert('Enter your email address'); return; }
                      setTestSending(true);
                      try {
                        await apiPost('/emails/test-send', {
                          to: testEmail,
                          subject: previewData.subject,
                          body: previewData.body,
                        });
                        setTestSent(true);
                        setTimeout(() => setTestSent(false), 3000);
                      } catch (e) { alert('Test send failed: ' + e.message); }
                      setTestSending(false);
                    }}
                    disabled={testSending || !testEmail}
                    className="btn-primary text-sm flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send size={13} />
                    {testSending ? 'Sending…' : testSent ? '✓ Sent!' : 'Send Test'}
                  </button>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── SEND RESULT MODAL ─── */}
      {modal === 'send-result' && sendResult && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><CheckCircle size={18} className="text-emerald-500" /> Campaign Sent</h2>
              <button onClick={() => setModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 text-sm text-emerald-800">
                <p className="font-medium">{sendResult.sent} emails generated successfully</p>
                {sendResult.next_send_at && <p className="text-xs text-emerald-600 mt-1">Next scheduled send: {formatDate(sendResult.next_send_at)}</p>}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-stone-500">Recipients:</p>
                {sendResult.recipients?.map((r, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span>{r.name}</span>
                    <a href={`mailto:${r.to}?subject=${encodeURIComponent(sendResult.emails?.[i]?.subject || '')}&body=${encodeURIComponent(sendResult.emails?.[i]?.body || '')}`}
                      className="text-brand-600 text-xs hover:underline flex items-center gap-1"><Mail size={12} />Open in mail app</a>
                  </div>
                ))}
              </div>
              <p className="text-xs text-stone-400">Click "Open in mail app" to send each email via your default email client. For automated sending, connect an email service like SendGrid or Mailgun.</p>
            </div>
            <div className="px-6 py-4 border-t border-stone-100 flex justify-end">
              <button onClick={() => setModal(null)} className="btn-primary">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
