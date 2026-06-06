import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { HardDrive, Download, Trash2, CreditCard, X, Sparkles, FileText, Image, Archive, AlertTriangle } from 'lucide-react';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 KB';
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(0) + ' KB';
}

export default function Storage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function loadStatus() {
    try {
      const s = await apiGet('/billing/status');
      setStatus(s);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  useEffect(() => { loadStatus(); }, []);

  async function handleUpgrade(planId) {
    setUpgrading(true);
    try {
      if (status?.stripe_enabled) {
        const result = await apiPost('/billing/create-checkout', { plan_id: planId });
        if (result.checkout_url) {
          window.location.href = result.checkout_url;
          return;
        }
      }
      const result = await apiPost('/billing/upgrade', { plan_id: planId });
      alert(result.message);
      setUpgradeModal(false);
      loadStatus();
    } catch (e) { alert(e.message); }
    setUpgrading(false);
  }

  async function exportData() {
    setExporting(true);
    try {
      const a = document.createElement('a');
      a.href = '/api/billing/export-data';
      a.download = `stayvue-backup-${new Date().toISOString().slice(0, 10)}.json`;
      // Need auth header — fetch manually
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/billing/export-data', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { alert('Export failed: ' + e.message); }
    setExporting(false);
  }

  if (loading || !status) {
    return <div className="animate-pulse space-y-4"><div className="h-32 bg-stone-100 rounded-2xl" /></div>;
  }

  const usagePct = status.storage_limit > 0 ? Math.min(100, (status.storage_used / status.storage_limit) * 100) : 0;
  const isNearLimit = usagePct > 80;
  const isAtLimit = usagePct >= 95;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Storage & Data</h1>
            <HelpButton sectionId="getting-started" />
          </div>
          <p className="text-sm text-stone-400 mt-1">Manage your storage usage and download your data</p>
        </div>
      </div>

      {/* Storage usage card */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2"><HardDrive size={18} className="text-brand-500" /> Storage Usage</h2>
          <button onClick={() => setUpgradeModal(true)} className="btn-secondary text-sm flex items-center gap-1.5"><Sparkles size={14} /> Upgrade</button>
        </div>

        {/* Usage bar */}
        <div className="mb-4">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-3xl font-bold">{formatBytes(status.storage_used)}</span>
              <span className="text-stone-400 text-sm ml-1">of {formatBytes(status.storage_limit)}</span>
            </div>
            <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-stone-500'}`}>
              {usagePct.toFixed(0)}% used
            </span>
          </div>
          <div className="h-4 bg-stone-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${usagePct}%`,
                background: isAtLimit ? 'linear-gradient(90deg, #ef4444, #dc2626)' : isNearLimit ? 'linear-gradient(90deg, #f59e0b, #d97706)' : 'linear-gradient(90deg, #5A7F4B, #476B3A)',
              }} />
          </div>
        </div>

        {isAtLimit && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-sm mb-4">
            <AlertTriangle size={16} /> You're almost out of storage. Upgrade or export data to free up space.
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-lg font-semibold">{formatBytes(status.storage_used)}</p>
            <p className="text-xs text-stone-400">Used</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-lg font-semibold">{formatBytes(status.storage_remaining)}</p>
            <p className="text-xs text-stone-400">Available</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50">
            <p className="text-lg font-semibold">{formatBytes(status.storage_limit)}</p>
            <p className="text-xs text-stone-400">Total Limit</p>
          </div>
        </div>
      </div>

      {/* Plan overview */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Your Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-stone-50 ring-1 ring-stone-100">
            <p className="text-xs text-stone-400 mb-1">Properties</p>
            <p className="text-lg font-semibold">{status.property_count} <span className="text-stone-400 font-normal text-sm">/ {status.property_limit === 999 ? '∞' : status.property_limit}</span></p>
            <div className="h-1.5 bg-stone-200 rounded-full mt-2"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${Math.min(100, (status.property_count / (status.property_limit || 1)) * 100)}%` }} /></div>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 ring-1 ring-stone-100">
            <p className="text-xs text-stone-400 mb-1">Team Members</p>
            <p className="text-lg font-semibold">{status.team_count} <span className="text-stone-400 font-normal text-sm">/ {status.team_limit === 999 ? '∞' : status.team_limit}</span></p>
            <div className="h-1.5 bg-stone-200 rounded-full mt-2"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${status.team_limit > 0 ? Math.min(100, (status.team_count / status.team_limit) * 100) : 0}%` }} /></div>
          </div>
          <div className="p-4 rounded-xl bg-stone-50 ring-1 ring-stone-100">
            <p className="text-xs text-stone-400 mb-1">Storage</p>
            <p className="text-lg font-semibold">{formatBytes(status.storage_used)} <span className="text-stone-400 font-normal text-sm">/ {formatBytes(status.storage_limit)}</span></p>
            <div className="h-1.5 bg-stone-200 rounded-full mt-2"><div className={`h-full rounded-full ${isNearLimit ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${usagePct}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Data export */}
      <div className="card p-6">
        <h2 className="font-semibold flex items-center gap-2 mb-2"><Archive size={18} className="text-brand-500" /> Export & Download Data</h2>
        <p className="text-sm text-stone-500 mb-4">Download a complete backup of all your data as a JSON file. This includes all properties, bookings, expenses, guests, maintenance records, and more. Use this to keep a local backup or to free up cloud storage.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} disabled={exporting}
            className="btn-primary flex items-center gap-1.5">
            <Download size={15} /> {exporting ? 'Preparing download…' : 'Download All Data'}
          </button>
        </div>
        <div className="mt-4 p-4 rounded-xl bg-brand-50">
          <p className="text-xs text-brand-700">
            <strong>Tip:</strong> After downloading your backup, you can delete old receipts and documents from the app to free up storage space.
            Your booking and expense records will stay in the app — only the attached files count toward your storage limit.
          </p>
        </div>
      </div>

      {/* ─── UPGRADE MODAL ─── */}
      {upgradeModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center pt-[5vh] overflow-y-auto" onClick={() => setUpgradeModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 mb-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <h2 className="font-semibold flex items-center gap-2"><CreditCard size={18} className="text-brand-500" /> Optional Cloud Backup & Sync</h2>
              <button onClick={() => setUpgradeModal(false)} className="p-1 rounded-lg hover:bg-stone-100"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-500">You're currently using {formatBytes(status.storage_used)} of {formatBytes(status.storage_limit)}.</p>

              {/* Explanation */}
              <div className="rounded-xl bg-brand-50 p-4">
                <p className="text-xs font-semibold text-brand-800 mb-1">What is Optional Cloud Backup & Sync?</p>
                <p className="text-xs text-brand-600 leading-relaxed">
                  Your StayVue purchase gives you generous cloud storage included. If you upload a lot of receipts, 
                  photos, and documents and need more space, you can add extra cloud backup capacity. 
                  This covers the cost of securely storing and syncing your uploaded files.
                </p>
                <p className="text-xs text-brand-600 mt-2 leading-relaxed">
                  <span className="font-semibold">Don't need it?</span> You can download your receipts and documents to your computer at any time, 
                  then remove them from the app to free up space. Your records stay — only attached files count toward storage.
                </p>
              </div>

              <div className="space-y-3">
                {status.plans?.storage?.map(plan => (
                  <button key={plan.id} onClick={() => handleUpgrade(plan.id)} disabled={upgrading}
                    className="w-full flex items-center justify-between p-4 rounded-xl ring-1 ring-stone-200 hover:ring-brand-400 hover:bg-brand-50/30 transition-all text-left">
                    <div>
                      <p className="text-sm font-semibold">{plan.label}</p>
                      <p className="text-xs text-stone-400">Cloud Backup & Sync for files & receipts</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-brand-600">${plan.price}</span>
                      <span className="text-xs text-stone-400">/mo</span>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-stone-400 text-center">
                All prices in USD. Cancel anytime. Your files remain accessible for 30 days after cancellation to download locally.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
