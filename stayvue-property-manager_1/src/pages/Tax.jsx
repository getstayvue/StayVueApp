import { useState } from 'react';
import { useApi, formatCurrency, useProperty } from '../hooks/useApi';
import { HelpButton } from './HelpCentre';
import { Download, FileSpreadsheet, TrendingUp, TrendingDown, DollarSign, Building2, Share2, Mail, Home, Receipt } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Tax() {
  const { propertyId, setPropertyId, properties } = useProperty();
  const currentYear = new Date().getFullYear().toString();
  const [year, setYear] = useState(String(+currentYear - 1));
  const [viewPid, setViewPid] = useState(0); // 0 = all, >0 = specific property
  const { data, loading, error } = useApi(`/tax/summary?year=${year}&property_id=${viewPid}`, [year, viewPid]);

  function downloadCSV(propId) {
    const token = localStorage.getItem('auth_token');
    const pid = propId !== undefined ? propId : viewPid;
    const propName = pid === 0 ? 'all-properties' : (properties?.find(p => p.id === pid)?.name || 'property').replace(/\s+/g, '-').toLowerCase();
    const a = document.createElement('a');
    a.href = `/api/tax/export?year=${year}&property_id=${pid}`;
    a.download = `tax-report-${year}-${propName}.csv`;
    a.click();
  }

  async function shareReport(propId) {
    const pid = propId !== undefined ? propId : viewPid;
    const propName = pid === 0 ? 'All Properties' : (properties?.find(p => p.id === pid)?.name || 'Property');
    const filename = `tax-report-${year}-${propName.replace(/\s+/g, '-').toLowerCase()}.csv`;
    if (navigator.share) {
      try {
        const response = await fetch(`/api/tax/export?year=${year}&property_id=${pid}`);
        const text = await response.text();
        const file = new File([text], filename, { type: 'text/csv' });
        await navigator.share({ title: `Tax Report ${year} — ${propName}`, text: `Property tax report for ${year}`, files: [file] });
        return;
      } catch {}
    }
    const subject = encodeURIComponent(`Tax Report — ${year} — ${propName}`);
    const body = encodeURIComponent(`Hi,\n\nPlease find attached the ${year} rental property tax report for ${propName}.\n\nBest regards`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    downloadCSV(pid);
  }

  if (loading) return <div className="animate-pulse space-y-4"><div className="h-32 bg-stone-100 rounded-2xl" /><div className="h-48 bg-stone-100 rounded-2xl" /></div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading tax data: {error}</div>;
  if (!data) return <div className="text-center py-12 text-stone-400">No data available</div>;

  const { totals, properties: propData, deductible_expenses } = data;
  const hasData = totals.total_bookings > 0 || totals.total_expenses > 0;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-semibold tracking-tight">Tax Centre</h1></div>
        <EmptyState
          icon={Receipt}
          title="No tax data yet"
          description="Once you start logging bookings and expenses, your Tax Centre will generate a complete income and expense report ready for your accountant."
          steps={[
            'Add bookings via the Bookings page or sync your iCal from Airbnb/VRBO',
            'Log expenses under the Expenses page and toggle "Tax Deductible" on eligible costs',
            'Come back here to download a full CSV report — it takes one click',
          ]}
          tip="Most cleaning, utilities, insurance, and maintenance costs are deductible. Label them as you go to save time at tax time."
        />
      </div>
    );
  }
  const viewingAll = viewPid === 0;
  const viewPropName = viewPid === 0 ? 'All Properties' : properties?.find(p => p.id === viewPid)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">Tax Centre</h1><HelpButton sectionId="tax" /></div>
          <p className="text-stone-500 text-sm mt-1">{viewPropName} · {year}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <select className="input-field" value={year} onChange={e => setYear(e.target.value)}>
              {Array.from({ length: 4 }, (_, i) => String(+currentYear - i)).map(y =>
                <option key={y} value={y}>{y}</option>
              )}
            </select>
            <button onClick={() => downloadCSV()} className="btn-secondary flex items-center gap-1.5 text-sm">
              <Download size={14} /> CSV
            </button>
            <button onClick={() => shareReport()} className="btn-primary flex items-center gap-1.5 text-sm">
              <Share2 size={14} /> Send
            </button>
          </div>
          {/* Property toggle */}
          {(properties || []).length > 1 && (
            <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
              <button onClick={() => setViewPid(0)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewPid === 0 ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
                All
              </button>
              {(properties || []).map(p => (
                <button key={p.id} onClick={() => setViewPid(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all max-w-[120px] truncate ${viewPid === p.id ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="card p-12 text-center">
          <FileSpreadsheet size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-500 font-medium">No financial data for {year}</p>
          <p className="text-stone-400 text-sm mt-1">Try selecting a different year or property.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="card p-4"><div className="flex items-center gap-2 mb-1"><TrendingUp size={14} className="text-emerald-500" /><p className="text-xs text-stone-500">Gross Revenue</p></div><p className="text-xl font-semibold text-emerald-700">{formatCurrency(totals.gross_revenue)}</p></div>
            <div className="card p-4"><div className="flex items-center gap-2 mb-1"><DollarSign size={14} className="text-amber-500" /><p className="text-xs text-stone-500">Platform Fees</p></div><p className="text-xl font-semibold text-amber-700">{formatCurrency(totals.platform_fees)}</p></div>
            <div className="card p-4"><div className="flex items-center gap-2 mb-1"><TrendingDown size={14} className="text-red-500" /><p className="text-xs text-stone-500">Total Expenses</p></div><p className="text-xl font-semibold text-red-700">{formatCurrency(totals.total_expenses)}</p></div>
            <div className="card p-4"><div className="flex items-center gap-2 mb-1"><Building2 size={14} className="text-blue-500" /><p className="text-xs text-stone-500">Maintenance</p></div><p className="text-xl font-semibold text-blue-700">{formatCurrency(totals.total_maintenance)}</p></div>
            <div className="card p-4"><div className="flex items-center gap-2 mb-1"><FileSpreadsheet size={14} className="text-brand-500" /><p className="text-xs text-stone-500">Net Income</p></div><p className={`text-xl font-semibold ${totals.net_income >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(totals.net_income)}</p></div>
          </div>

          {/* Per-property cards (shown when viewing all) */}
          {viewingAll && propData.length > 1 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Income by Property</h2>
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">Property</th><th className="px-4 py-3 font-medium text-right">Bookings</th><th className="px-4 py-3 font-medium text-right">Nights</th>
                      <th className="px-4 py-3 font-medium text-right">Revenue</th><th className="px-4 py-3 font-medium text-right">Fees</th><th className="px-4 py-3 font-medium text-right">Expenses</th>
                      <th className="px-4 py-3 font-medium text-right">Net</th><th className="px-4 py-3 font-medium w-24"></th>
                    </tr></thead>
                    <tbody>
                      {propData.map(p => (
                        <tr key={p.property_id} className="border-b border-stone-50 hover:bg-stone-50/50">
                          <td className="px-4 py-3 font-medium">{p.property_name}</td>
                          <td className="px-4 py-3 text-right">{p.total_bookings}</td>
                          <td className="px-4 py-3 text-right">{p.total_nights}</td>
                          <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(p.gross_revenue)}</td>
                          <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(p.platform_fees)}</td>
                          <td className="px-4 py-3 text-right text-red-600">{formatCurrency(p.total_expenses)}</td>
                          <td className={`px-4 py-3 text-right font-semibold ${p.net_income >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(p.net_income)}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 justify-end">
                              <button onClick={() => downloadCSV(p.property_id)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-600" title={`Download CSV for ${p.property_name}`}><Download size={13} /></button>
                              <button onClick={() => setViewPid(p.property_id)} className="text-xs text-brand-500 hover:underline px-1">View</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-stone-50 font-semibold">
                        <td className="px-4 py-3">Portfolio Total</td>
                        <td className="px-4 py-3 text-right">{totals.total_bookings}</td>
                        <td className="px-4 py-3 text-right">{totals.total_nights}</td>
                        <td className="px-4 py-3 text-right text-emerald-700">{formatCurrency(totals.gross_revenue)}</td>
                        <td className="px-4 py-3 text-right text-amber-600">{formatCurrency(totals.platform_fees)}</td>
                        <td className="px-4 py-3 text-right text-red-600">{formatCurrency(totals.total_expenses)}</td>
                        <td className={`px-4 py-3 text-right ${totals.net_income >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{formatCurrency(totals.net_income)}</td>
                        <td className="px-4 py-3"><button onClick={() => downloadCSV(0)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-brand-600" title="Download combined CSV"><Download size={13} /></button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Single property detail (shown when viewing one property) */}
          {!viewingAll && propData.length === 1 && (
            <div className="card p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center"><Home size={18} className="text-brand-600" /></div>
                <div>
                  <p className="font-semibold text-sm">{propData[0].property_name}</p>
                  <p className="text-xs text-stone-400">{propData[0].total_bookings} bookings · {propData[0].total_nights} nights · {year}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => downloadCSV(viewPid)} className="btn-secondary flex items-center gap-1.5 text-sm"><Download size={13} /> CSV for this property</button>
                <button onClick={() => setViewPid(0)} className="text-xs text-brand-500 hover:underline">View all</button>
              </div>
            </div>
          )}

          {/* Expense breakdown per property */}
          <div className="grid lg:grid-cols-2 gap-6">
            {propData.map(p => (
              <div key={p.property_id} className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">{p.property_name} — Expenses</h3>
                  <span className="text-xs text-stone-400 font-medium">{formatCurrency(p.total_expenses)}</span>
                </div>
                {p.expense_breakdown?.length > 0 ? (
                  <div className="space-y-2">
                    {p.expense_breakdown.map(e => {
                      const pct = p.total_expenses > 0 ? (e.total / p.total_expenses * 100) : 0;
                      return (
                        <div key={e.category} className="flex items-center gap-3">
                          <span className="text-xs text-stone-600 w-28 truncate">{e.category}</span>
                          <div className="flex-1 bg-stone-100 rounded-full h-2.5">
                            <div className="bg-brand-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className="text-xs font-medium text-stone-700 w-20 text-right">{formatCurrency(e.total)}</span>
                          <span className="text-[10px] text-stone-400 w-10 text-right">{pct.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <p className="text-xs text-stone-400">No expenses recorded</p>}
              </div>
            ))}
          </div>

          {/* Deductible */}
          {deductible_expenses?.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold mb-3">Tax-Deductible Expenses</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-stone-100 text-left text-stone-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2 font-medium">Category</th><th className="px-4 py-2 font-medium text-right">Amount</th>
                  </tr></thead>
                  <tbody>
                    {deductible_expenses.map(d => (
                      <tr key={d.category} className="border-b border-stone-50"><td className="px-4 py-2">{d.category}</td><td className="px-4 py-2 text-right font-medium">{formatCurrency(d.total)}</td></tr>
                    ))}
                    <tr className="bg-stone-50 font-semibold"><td className="px-4 py-2">Total Deductible</td><td className="px-4 py-2 text-right">{formatCurrency(deductible_expenses.reduce((s, d) => s + d.total, 0))}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Export info */}
          <div className="card p-5 bg-brand-50 border-brand-200">
            <div className="flex items-start gap-3">
              <Mail size={20} className="text-brand-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-brand-800">Ready for your accountant</p>
                <p className="text-xs text-brand-600 mt-1">
                  Download a CSV for individual properties or all combined. Each report includes rental income, expenses, maintenance, category breakdowns, and net income. 
                  Tap "Send" to share directly via email.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
