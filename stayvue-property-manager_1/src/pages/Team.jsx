import { useState, useEffect } from 'react';
import { useApi, apiPost, apiPut, apiDelete, apiGet, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { UserPlus, Users, Shield, Pencil, Trash2, X, Mail, Copy, Check, ChevronDown, Eye, EyeOff, Lock, CreditCard, Sparkles } from 'lucide-react';

const ROLES = [
  { id: 'co-host', label: 'Co-Host', desc: 'Full access to manage everything except team settings' },
  { id: 'manager', label: 'Property Manager', desc: 'Manage bookings, calendar, maintenance, guests, and cleaning' },
  { id: 'cleaner', label: 'Cleaner', desc: 'View calendar and manage cleaning checklists only' },
  { id: 'accountant', label: 'Accountant', desc: 'View-only access to finances, expenses, and tax reports' },
  { id: 'viewer', label: 'Viewer', desc: 'View-only access to everything' },
  { id: 'custom', label: 'Custom', desc: 'Choose exactly which sections they can access' },
];

const MODULES = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'calendar', label: 'Calendar' },
  { id: 'bookings', label: 'Bookings' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'guests', label: 'Guest CRM' },
  { id: 'vendors', label: 'Vendors' },
  { id: 'cleaning', label: 'Cleaning' },
  { id: 'property', label: 'Property' },
  { id: 'tax', label: 'Tax Centre' },
  { id: 'team', label: 'Team Management' },
];

const ACCESS_LABELS = { edit: 'Can edit', view: 'View only', none: 'No access' };
const ACCESS_COLORS = { edit: 'bg-emerald-50 text-emerald-700', view: 'bg-blue-50 text-blue-700', none: 'bg-stone-100 text-stone-400' };

const ROLE_COLORS = {
  'co-host': 'bg-purple-50 text-purple-700',
  'manager': 'bg-blue-50 text-blue-700',
  'cleaner': 'bg-teal-50 text-teal-700',
  'accountant': 'bg-amber-50 text-amber-700',
  'viewer': 'bg-stone-100 text-stone-600',
  'custom': 'bg-brand-50 text-brand-700',
};

export default function Team() {
  const { properties } = useProperty();
  const { data: members, refetch: reMembers } = useApi('/team/members');
  const { data: invitations, refetch: reInvites } = useApi('/team/invitations');
  const [presets, setPresets] = useState({});
  const [inviteModal, setInviteModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // member object
  const [invForm, setInvForm] = useState({ email: '', role: 'viewer', property_ids: [], permissions: {} });
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [invResult, setInvResult] = useState(null);
  const [billingStatus, setBillingStatus] = useState(null);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => { apiGet('/team/presets').then(setPresets).catch(() => {}); }, []);
  useEffect(() => { apiGet('/billing/status').then(setBillingStatus).catch(() => {}); }, []);

  function openInvite() {
    const perms = presets['viewer'] || {};
    setInvForm({ email: '', role: 'viewer', property_ids: [], permissions: perms });
    setInvResult(null);
    setInviteModal(true);
  }

  function setRole(role) {
    const perms = role === 'custom' ? invForm.permissions : (presets[role] || {});
    setInvForm(f => ({ ...f, role, permissions: perms }));
  }

  function setPerm(module, level) {
    setInvForm(f => ({ ...f, role: 'custom', permissions: { ...f.permissions, [module]: level } }));
  }

  // Same for edit modal
  function setEditRole(role) {
    const perms = role === 'custom' ? editModal.permissions : (presets[role] || {});
    setEditModal(m => ({ ...m, role, permissions: perms }));
  }
  function setEditPerm(module, level) {
    setEditModal(m => ({ ...m, role: 'custom', permissions: { ...m.permissions, [module]: level } }));
  }

  async function sendInvite() {
    setSaving(true);
    try {
      // Check team limit
      const check = await apiGet('/billing/can-add-team');
      if (!check.allowed) {
        setSaving(false);
        setUpgradeModal(true);
        return;
      }
      const result = await apiPost('/team/invite', {
        email: invForm.email,
        role: invForm.role,
        property_ids: invForm.property_ids.length > 0 ? invForm.property_ids : null,
        permissions: invForm.permissions,
      });
      setInvResult(result);
      reMembers();
      reInvites();
      const status = await apiGet('/billing/status');
      setBillingStatus(status);
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function handleUpgrade(planId) {
    setUpgrading(true);
    try {
      const result = await apiPost('/billing/upgrade', { plan_id: planId });
      alert(result.message);
      const status = await apiGet('/billing/status');
      setBillingStatus(status);
      setUpgradeModal(false);
    } catch (e) { alert(e.message); }
    setUpgrading(false);
  }

  async function saveEdit() {
    setSaving(true);
    try {
      await apiPut(`/team/members/${editModal.id}`, {
        role: editModal.role,
        property_ids: editModal.property_ids || null,
        permissions: editModal.permissions,
        status: editModal.status,
      });
      setEditModal(null);
      reMembers();
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  async function removeMember(id) {
    if (!confirm('Remove this team member? They will lose all access immediately.')) return;
    await apiDelete(`/team/members/${id}`);
    reMembers();
  }

  async function cancelInvite(id) {
    await apiDelete(`/team/invitations/${id}`);
    reInvites();
  }

  async function copyInviteLink(id) {
    const link = `${window.location.origin}/invite/${id}`;
    await navigator.clipboard.writeText(link);
    setCopied(id);
    setTimeout(() => setCopied(false), 2000);
  }

  function toggleProperty(propId, formSetter) {
    formSetter(f => {
      const ids = f.property_ids || [];
      return { ...f, property_ids: ids.includes(propId) ? ids.filter(x => x !== propId) : [...ids, propId] };
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Team Management</h1><HelpButton sectionId="team" /></div>
          <p className="text-sm text-stone-400 mt-1">Share access with co-hosts, managers, cleaners, and accountants</p>
        </div>
        <button onClick={openInvite} className="btn-primary flex items-center gap-1.5"><UserPlus size={16} /> Invite Member</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Team Members</p><p className="text-xl font-semibold">{(members || []).length}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Pending Invites</p><p className="text-xl font-semibold">{(invitations || []).length}</p></div>
        <div className="card p-4"><p className="text-xs text-stone-500 mb-1">Team Slots</p>
          <p className="text-xl font-semibold">{billingStatus ? `${billingStatus.team_count}/${billingStatus.team_limit === 999 ? '∞' : billingStatus.team_limit}` : '—'}</p>
        </div>
        <div className="card p-4 flex items-center justify-between">
          <div><p className="text-xs text-stone-500 mb-1">Plan</p>
            <p className="text-sm font-semibold">{billingStatus?.team_limit === 0 ? 'No team access' : billingStatus?.team_limit === 999 ? 'Unlimited' : `${billingStatus?.team_limit} member${billingStatus?.team_limit === 1 ? '' : 's'}`}</p>
          </div>
          <button onClick={() => setUpgradeModal(true)} className="btn-secondary text-xs flex items-center gap-1"><Sparkles size={12} /> Upgrade</button>
        </div>
      </div>

      {/* Members list */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="font-semibold flex items-center gap-2"><Users size={18} className="text-brand-500" /> Team Members</h2>
        </div>
        {(members || []).length === 0 ? (
          <div className="p-12 text-center">
            <Users size={36} className="mx-auto text-stone-300 mb-2" />
            <p className="text-stone-400 text-sm">No team members yet — invite someone to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {(members || []).map(m => (
              <div key={m.id} className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {m.avatar_url ? (
                    <img src={m.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 flex items-center justify-center text-sm font-semibold">
                      {m.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{m.name}</span>
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium ${ROLE_COLORS[m.role] || ROLE_COLORS.viewer}`}>{ROLES.find(r => r.id === m.role)?.label || m.role}</span>
                      {m.status === 'revoked' && <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-medium bg-red-50 text-red-600">Revoked</span>}
                    </div>
                    <p className="text-xs text-stone-400">{m.email}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {Object.entries(m.permissions || {}).filter(([, v]) => v !== 'none').map(([mod, level]) => (
                        <span key={mod} className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${ACCESS_COLORS[level]}`}>
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => setEditModal({ ...m })} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600" title="Edit permissions"><Shield size={15} /></button>
                    <button onClick={() => removeMember(m.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500" title="Remove"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {(invitations || []).length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100">
            <h2 className="font-semibold flex items-center gap-2"><Mail size={18} className="text-amber-500" /> Pending Invitations</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {(invitations || []).map(inv => (
              <div key={inv.id} className="px-6 py-3 flex items-center gap-3">
                <Mail size={16} className="text-stone-300 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{inv.email}</p>
                  <p className="text-[10px] text-stone-400">Expires {new Date(inv.expires_at).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${ROLE_COLORS[inv.role] || ''}`}>{inv.role}</span>
                <button onClick={() => copyInviteLink(inv.id)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400" title="Copy invite link">
                  {copied === inv.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                </button>
                <button onClick={() => cancelInvite(inv.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500" title="Cancel"><X size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── INVITE MODAL ─── */}
      {inviteModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setInviteModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><UserPlus size={18} className="text-brand-500" /> Invite Team Member</h2>
              <button onClick={() => setInviteModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {invResult ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-sm">
                    <p className="font-medium">{invResult.auto_accepted ? 'Member added!' : 'Invitation created!'}</p>
                    <p className="text-xs mt-1">{invResult.message}</p>
                  </div>
                  <button onClick={() => { setInviteModal(false); setInvResult(null); }} className="btn-primary w-full">Done</button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1.5 block">Email Address *</label>
                    <input type="email" className="input-field w-full" placeholder="colleague@example.com"
                      value={invForm.email} onChange={e => setInvForm(f => ({ ...f, email: e.target.value }))} />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-2 block">Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ROLES.map(r => (
                        <button key={r.id} onClick={() => setRole(r.id)}
                          className={`text-left p-3 rounded-xl ring-1 transition-all ${
                            invForm.role === r.id ? 'ring-brand-400 bg-brand-50' : 'ring-stone-200 hover:ring-stone-300'
                          }`}>
                          <p className="text-xs font-medium">{r.label}</p>
                          <p className="text-[10px] text-stone-400 mt-0.5">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Property access */}
                  {(properties || []).length > 1 && (
                    <div>
                      <label className="text-xs font-medium text-stone-500 mb-2 block">Property Access</label>
                      <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="radio" name="propAccess" checked={invForm.property_ids.length === 0}
                            onChange={() => setInvForm(f => ({ ...f, property_ids: [] }))} />
                          All properties
                        </label>
                        {(properties || []).map(p => (
                          <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" className="rounded" checked={invForm.property_ids.includes(p.id)}
                              onChange={() => toggleProperty(p.id, setInvForm)} />
                            {p.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Permission grid */}
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-2 block">Permissions</label>
                    <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                      {MODULES.map(mod => {
                        const level = invForm.permissions[mod.id] || 'none';
                        return (
                          <div key={mod.id} className="flex items-center justify-between px-4 py-2.5 border-b border-stone-50 last:border-0">
                            <span className="text-sm text-stone-700">{mod.label}</span>
                            <div className="flex gap-1">
                              {['edit', 'view', 'none'].map(l => (
                                <button key={l} onClick={() => setPerm(mod.id, l)}
                                  className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                                    level === l ? ACCESS_COLORS[l] + ' ring-1 ring-current/20' : 'text-stone-400 hover:bg-stone-50'
                                  }`}>
                                  {ACCESS_LABELS[l]}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button onClick={sendInvite} disabled={saving || !invForm.email} className="btn-primary w-full flex items-center justify-center gap-1.5">
                    <Mail size={14} /> {saving ? 'Sending…' : 'Send Invitation'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT PERMISSIONS MODAL ─── */}
      {editModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setEditModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><Shield size={18} className="text-brand-500" /> Edit Permissions — {editModal.name}</h2>
              <button onClick={() => setEditModal(null)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-2 block">Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button key={r.id} onClick={() => setEditRole(r.id)}
                      className={`p-2.5 rounded-xl ring-1 text-left transition-all ${
                        editModal.role === r.id ? 'ring-brand-400 bg-brand-50' : 'ring-stone-200 hover:ring-stone-300'
                      }`}>
                      <p className="text-xs font-medium">{r.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-1.5 block">Status</label>
                <select className="input-field" value={editModal.status} onChange={e => setEditModal(m => ({ ...m, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="revoked">Revoked</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 mb-2 block">Permissions</label>
                <div className="rounded-xl ring-1 ring-stone-200 overflow-hidden">
                  {MODULES.map(mod => {
                    const level = editModal.permissions[mod.id] || 'none';
                    return (
                      <div key={mod.id} className="flex items-center justify-between px-4 py-2.5 border-b border-stone-50 last:border-0">
                        <span className="text-sm text-stone-700">{mod.label}</span>
                        <div className="flex gap-1">
                          {['edit', 'view', 'none'].map(l => (
                            <button key={l} onClick={() => setEditPerm(mod.id, l)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                                level === l ? ACCESS_COLORS[l] + ' ring-1 ring-current/20' : 'text-stone-400 hover:bg-stone-50'
                              }`}>
                              {ACCESS_LABELS[l]}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving…' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── UPGRADE MODAL ─── */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[10vh] overflow-y-auto" onClick={() => setUpgradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><CreditCard size={18} className="text-brand-500" /> Add Team Access</h2>
              <button onClick={() => setUpgradeModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-500">
                Your plan includes {billingStatus?.team_limit === 999 ? 'unlimited' : billingStatus?.team_limit || 0} team member{billingStatus?.team_limit === 1 ? '' : 's'}.
                {billingStatus?.team_count > 0 && ` You currently have ${billingStatus.team_count}.`}
                {billingStatus?.team_limit === 0 && ' Upgrade to start sharing access with your team.'}
              </p>
              <div className="space-y-3">
                {billingStatus?.plans?.team?.map(plan => (
                  <button key={plan.id} onClick={() => handleUpgrade(plan.id)} disabled={upgrading}
                    className="w-full flex items-center justify-between p-4 rounded-xl ring-1 ring-stone-200 hover:ring-brand-400 hover:bg-brand-50/30 transition-all text-left">
                    <div>
                      <p className="text-sm font-semibold">{plan.label}</p>
                      <p className="text-xs text-stone-400">{plan.add >= 999 ? 'No limits — invite your whole team' : `Add ${plan.add} team member${plan.add === 1 ? '' : 's'} to your plan`}</p>
                    </div>
                    <span className="text-lg font-bold text-brand-600">${plan.price}</span>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 text-center">In production, this would process payment via Stripe.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
