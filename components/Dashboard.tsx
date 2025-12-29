
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../store/AppContext';
import { PolicyStatus, DocumentStatus } from '../types';
import { 
  Clock, 
  AlertCircle, 
  Users, 
  ShieldCheck, 
  FileWarning, 
  ArrowRight,
  TrendingUp,
  TrendingDown,
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: any; 
  color: string; 
  trend?: string; 
  trendUp?: boolean;
  onClick: () => void 
}> = ({ title, value, icon: Icon, color, trend, trendUp, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 text-left group w-full"
  >
    <div className="flex justify-between items-start">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-slate-400 text-sm font-medium">{title}</h3>
      <div className="flex items-end justify-between mt-1">
        <p className="text-3xl font-bold text-slate-900">{value}</p>
        <div className="p-1 rounded-full bg-slate-50 group-hover:bg-blue-50 text-slate-300 group-hover:text-blue-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  </button>
);

export const Dashboard: React.FC = () => {
  const { clients, policies, documents, triggerSync, syncLogs } = useApp();
  const navigate = useNavigate();
  const [isSyncing, setIsSyncing] = useState(false);

  // Aggregated live KPIs from central database (AppContext)
  // Strictly recalculated whenever clients, policies, or documents change
  const stats = useMemo(() => {
    // 1. Total Clients count
    const totalClients = clients.length;

    // 2. Active Policies: status is ACTIVE (expiry >= today)
    const activePoliciesCount = policies.filter(p => p.status === PolicyStatus.ACTIVE).length;

    // 3. Expiring Soon: status is EXPIRING (expiry >= today AND <= today + 7)
    const expiringSoonCount = policies.filter(p => p.status === PolicyStatus.EXPIRING).length;

    // 4. Incomplete Docs: status is MISSING or INVALID
    const incompleteDocsCount = documents.filter(d => 
      d.status === DocumentStatus.MISSING || d.status === DocumentStatus.INVALID
    ).length;

    // Failsafe Debug Visibility
    console.debug('[DASHBOARD KPI AUDIT]', {
      timestamp: new Date().toISOString(),
      sourceOfTruth: {
        rawPolicies: policies.length,
        rawClients: clients.length,
        rawDocs: documents.length
      },
      calculatedKPIs: {
        totalClients,
        activePolicies: activePoliciesCount,
        expiringSoon: expiringSoonCount,
        incompleteDocs: incompleteDocsCount
      }
    });

    return {
      totalClients,
      activePolicies: activePoliciesCount,
      expiringSoon: expiringSoonCount,
      incompleteDocs: incompleteDocsCount
    };
  }, [clients, policies, documents]);

  // Specific Logic for Urgent Renewals Feed
  const urgentRenewals = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return policies
      .filter(p => p.status === PolicyStatus.EXPIRING || p.status === PolicyStatus.EXPIRED)
      .map(p => {
        const expiry = new Date(p.expiryDate).getTime();
        const diffDays = Math.ceil((expiry - todayStart) / (1000 * 60 * 60 * 24));
        return {
          ...p,
          daysRemaining: diffDays,
          client: clients.find(c => c.id === p.clientId)
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining)
      .slice(0, 5);
  }, [policies, clients]);

  const handleSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setTimeout(() => setIsSyncing(false), 1000);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, Anna</h1>
          <p className="text-slate-500 mt-1">Live visibility over your financial portfolio.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Clients" 
          value={stats.totalClients} 
          icon={Users} 
          color="bg-blue-50 text-blue-600" 
          trend="+12%" 
          trendUp={true}
          onClick={() => navigate('/clients')}
        />
        <StatCard 
          title="Active Policies" 
          value={stats.activePolicies} 
          icon={ShieldCheck} 
          color="bg-emerald-50 text-emerald-600" 
          trend="Total Active" 
          trendUp={true}
          onClick={() => navigate('/policies')}
        />
        <StatCard 
          title="Expiring Soon" 
          value={stats.expiringSoon} 
          icon={Clock} 
          color="bg-amber-50 text-amber-600" 
          trend="Next 7 Days"
          onClick={() => navigate('/work')}
        />
        <StatCard 
          title="Incomplete Docs" 
          value={stats.incompleteDocs} 
          icon={FileWarning} 
          color="bg-rose-50 text-rose-600" 
          trend="Critical"
          onClick={() => navigate('/documents')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Urgent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="font-bold text-lg">Urgent Renewals (Next 7 Days)</h2>
              <button className="text-blue-600 text-sm font-semibold hover:underline" onClick={() => navigate('/work')}>View All</button>
            </div>
            <div className="divide-y divide-slate-50">
              {urgentRenewals.map(policy => (
                <button 
                  key={policy.id} 
                  onClick={() => navigate(`/policies/${policy.id}`)}
                  className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <img src={policy.client?.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <p className="font-semibold text-slate-900">{policy.client?.name}</p>
                      <p className="text-xs text-slate-400">{policy.category} • {policy.provider}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{policy.premium.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                      policy.daysRemaining <= 0 ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {policy.daysRemaining <= 0 ? (policy.daysRemaining === 0 ? 'Expiring Today' : 'Overdue') : `Expires in ${policy.daysRemaining}d`}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-0.5">{policy.expiryDate}</p>
                  </div>
                </button>
              ))}
              {urgentRenewals.length === 0 && (
                <div className="p-10 text-center text-slate-400 font-medium">
                  No urgent renewals in the next 7 days.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sync & Compliance Widgets */}
        <div className="space-y-6">
          <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="font-semibold text-blue-100 text-sm mb-2 uppercase tracking-wider">Sync Status</h3>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-3xl font-bold">Latest</span>
                <span className="text-sm text-blue-200">
                  {syncLogs.length > 0 ? new Date(syncLogs[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'}
                </span>
              </div>
              <div className="w-full bg-blue-500/50 h-2 rounded-full overflow-hidden mb-6">
                <div className="bg-white h-full rounded-full w-full"></div>
              </div>
              <ul className="space-y-3">
                <li className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white"></div> Sheets Records</span>
                  <span>{syncLogs[0]?.recordsProcessed || 0} Processed</span>
                </li>
                <li className="flex justify-between text-xs font-medium">
                  <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-300"></div> Manual Updates</span>
                  <span>Live</span>
                </li>
              </ul>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">Compliance Tasks</h3>
              <AlertCircle className="w-5 h-5 text-amber-500" />
            </div>
            <div className="space-y-4">
               <button 
                  onClick={() => navigate('/documents')}
                  className="w-full flex items-center justify-between p-3 bg-rose-50 border border-rose-100 rounded-2xl hover:bg-rose-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-100 text-rose-600 rounded-xl"><Clock className="w-4 h-4" /></div>
                    <span className="text-sm font-semibold text-rose-900">Missing Docs</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-rose-300" />
               </button>
               <button 
                  onClick={() => navigate('/documents')}
                  className="w-full flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-2xl hover:bg-amber-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 text-amber-600 rounded-xl"><FileWarning className="w-4 h-4" /></div>
                    <span className="text-sm font-semibold text-amber-900">Invalid Data</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
