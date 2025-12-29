
import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { useApp } from '../store/AppContext';
import { 
  Shield, 
  FileCheck, 
  RefreshCw, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  ArrowRight,
  Filter,
  ChevronDown,
  // Added missing ChevronRight icon import
  ChevronRight,
  Calendar,
  AlertCircle,
  Zap,
  DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PolicyStatus, DocumentStatus, PolicyCategory } from '../types';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type TimeFilter = 'Today' | 'Week' | 'Month' | '3 Months' | 'Year';

export const Insights: React.FC = () => {
  const { policies, documents, clients } = useApp();
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('Month');

  // 1. Core Analytics Logic
  const stats = useMemo(() => {
    // Document Completion %
    // Logic: Assume 1 ID per client and 1 Policy File per policy are mandatory
    const totalRequired = clients.length + policies.length;
    const validDocs = documents.filter(d => d.status === DocumentStatus.VALID).length;
    const docCompletion = totalRequired > 0 ? Math.round((validDocs / totalRequired) * 100) : 100;

    // Renewal Success Rate
    // Logic: Renewed / (Renewed + Expiring + Expired)
    const renewedCount = policies.filter(p => p.status === PolicyStatus.RENEWED).length;
    const dueCount = policies.filter(p => [PolicyStatus.RENEWED, PolicyStatus.EXPIRING, PolicyStatus.EXPIRED].includes(p.status)).length;
    const renewalRate = dueCount > 0 ? Math.round((renewedCount / dueCount) * 100) : 100;

    // Pending Validations
    const pendingValidations = documents.filter(d => 
      d.status === DocumentStatus.MISSING || d.status === DocumentStatus.INVALID
    ).length;

    // Audit Score
    let score = 'A';
    if (docCompletion < 60 || renewalRate < 50 || pendingValidations > 10) score = 'C';
    else if (docCompletion < 85 || renewalRate < 80) score = 'B';
    else if (docCompletion >= 95 && renewalRate >= 90) score = 'A+';

    return {
      docCompletion,
      renewalRate,
      pendingValidations,
      auditScore: score,
      totalPremium: policies.reduce((sum, p) => sum + p.premium, 0),
      activeCount: policies.filter(p => p.status === PolicyStatus.ACTIVE).length
    };
  }, [policies, documents, clients]);

  // 2. Policy Distribution Chart Data
  const categoryData = useMemo(() => {
    return Object.values(PolicyCategory).map(cat => {
      const catPolicies = policies.filter(p => p.category === cat);
      return {
        name: cat.split(' ')[0],
        fullName: cat,
        value: catPolicies.length,
        premium: catPolicies.reduce((sum, p) => sum + p.premium, 0)
      };
    }).filter(d => d.value > 0);
  }, [policies]);

  // 3. Revenue Trend Data (Mocked for visualization based on current policies)
  const revenueTrend = useMemo(() => {
    // In a real app, this would be grouped by month from historical data
    return [
      { name: 'Jan', premium: stats.totalPremium * 0.7, investments: stats.totalPremium * 0.1 },
      { name: 'Feb', premium: stats.totalPremium * 0.75, investments: stats.totalPremium * 0.15 },
      { name: 'Mar', premium: stats.totalPremium * 0.82, investments: stats.totalPremium * 0.12 },
      { name: 'Apr', premium: stats.totalPremium * 0.9, investments: stats.totalPremium * 0.2 },
      { name: 'May', premium: stats.totalPremium * 0.95, investments: stats.totalPremium * 0.25 },
      { name: 'Jun', premium: stats.totalPremium, investments: stats.totalPremium * 0.3 },
    ];
  }, [stats.totalPremium]);

  // 4. High Risk Policies
  const highRiskPolicies = useMemo(() => {
    return policies.filter(p => {
      const hasMissingDoc = documents.some(d => d.policyId === p.id && (d.status === DocumentStatus.MISSING || d.status === DocumentStatus.INVALID));
      const isExpiring = p.status === PolicyStatus.EXPIRING || p.status === PolicyStatus.EXPIRED;
      return hasMissingDoc && isExpiring;
    }).slice(0, 3);
  }, [policies, documents]);

  // 5. High Value Clients
  const highValueClients = useMemo(() => {
    return clients.map(c => {
      const clientPolicies = policies.filter(p => p.clientId === c.id);
      const totalPremium = clientPolicies.reduce((sum, p) => sum + p.premium, 0);
      return { ...c, totalPremium, policyCount: clientPolicies.length };
    }).sort((a, b) => b.totalPremium - a.totalPremium).slice(0, 3);
  }, [clients, policies]);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            Business Intelligence
            <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Derived from {policies.length} active policies and {clients.length} client profiles.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-blue-50/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          {(['Today', 'Week', 'Month', '3 Months', 'Year'] as TimeFilter[]).map(filter => (
            <button 
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`relative z-10 px-4 py-2 rounded-xl text-xs font-black transition-all ${
                timeFilter === filter ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { 
            label: 'Doc Completion', 
            value: `${stats.docCompletion}%`, 
            icon: FileCheck, 
            color: 'emerald', 
            action: () => navigate('/documents'),
            desc: 'Target: 95%+'
          },
          { 
            label: 'Renewal Success', 
            value: `${stats.renewalRate}%`, 
            icon: RefreshCw, 
            color: 'blue', 
            action: () => navigate('/work'),
            desc: 'Vs 88% last month'
          },
          { 
            label: 'Pending Validations', 
            value: stats.pendingValidations.toString(), 
            icon: AlertTriangle, 
            color: 'amber', 
            action: () => navigate('/documents'),
            desc: 'Needs immediate action'
          },
          { 
            label: 'Audit Readiness', 
            value: stats.auditScore, 
            icon: Shield, 
            color: 'indigo', 
            action: () => navigate('/architecture'),
            desc: 'Compliance Grade'
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between group hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer" onClick={stat.action}>
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <ArrowRight className="w-4 h-4 text-slate-200 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{stat.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                <span className="text-[9px] font-bold text-slate-300 italic">{stat.desc}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Charts Col */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Trend Chart */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Revenue Growth Trend</h3>
                <p className="text-xs text-slate-400 font-medium">Cumulative premium inflows and investment values.</p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Insurance</div>
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-200"></div> Investments</div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="colorPremium" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                  />
                  <Area type="monotone" dataKey="premium" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorPremium)" />
                  <Area type="monotone" dataKey="investments" stroke="#bfdbfe" strokeWidth={2} fill="#dbeafe" fillOpacity={0.3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Policy Distribution Chart */}
            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Product Mix</h3>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 mt-4">
                {categoryData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-xs font-bold text-slate-500">{d.fullName}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Risk Card */}
            <div className="bg-rose-50 p-8 rounded-[3rem] border border-rose-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-rose-900">Compliance Risk</h3>
                <AlertCircle className="w-6 h-6 text-rose-500" />
              </div>
              <p className="text-xs text-rose-700 font-medium mb-6">Policies at risk of claim rejection due to missing/invalid documentation.</p>
              
              <div className="space-y-3 flex-1">
                {highRiskPolicies.map(p => (
                   <button 
                    key={p.id}
                    onClick={() => navigate(`/policies/${p.id}`)}
                    className="w-full p-4 bg-white/60 hover:bg-white rounded-2xl border border-rose-100/50 text-left transition-all group"
                   >
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{p.policyNumber}</span>
                        <ChevronRight className="w-3 h-3 text-rose-300 group-hover:translate-x-1 transition-transform" />
                     </div>
                     <p className="text-sm font-bold text-slate-800 mt-1">{p.category}</p>
                     <p className="text-[9px] font-black text-rose-400 mt-1 uppercase">MISSING MANDATORY DOCS</p>
                   </button>
                ))}
                {highRiskPolicies.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                      <FileCheck className="w-6 h-6 text-emerald-600" />
                    </div>
                    <p className="text-xs font-bold text-emerald-700">All clear! No critical risks found.</p>
                  </div>
                )}
              </div>
              <button 
                onClick={() => navigate('/documents')}
                className="mt-6 w-full py-3 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-200"
              >
                Resolve All Issues
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Insights Col */}
        <div className="space-y-8">
          {/* High Value Clients List */}
          <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-xl shadow-slate-200">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Top Contributors
            </h3>
            <div className="space-y-6">
              {highValueClients.map((c, i) => (
                <button 
                  key={c.id} 
                  onClick={() => navigate(`/clients/${c.id}`)}
                  className="w-full flex items-center gap-4 group text-left"
                >
                  <div className="relative">
                    <img src={c.avatar} alt="" className="w-12 h-12 rounded-xl border border-white/10" />
                    <div className="absolute -top-2 -left-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-slate-900">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-100 truncate group-hover:text-blue-400 transition-colors">{c.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{c.policyCount} Policies • ₹{c.totalPremium.toLocaleString()}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
            <button 
              onClick={() => navigate('/clients')}
              className="mt-10 w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5"
            >
              View All High Value Clients
            </button>
          </div>

          {/* Actionable Tasks Panel */}
          <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Strategic Priorities</h3>
            <div className="space-y-4">
              {[
                { 
                  title: 'Improve Retention', 
                  desc: 'Renewal rate is below 90%', 
                  color: 'blue', 
                  actionLabel: 'Check Worklist',
                  action: () => navigate('/work')
                },
                { 
                  title: 'Document Clean-up', 
                  desc: `${stats.pendingValidations} files need validation`, 
                  color: 'amber', 
                  actionLabel: 'View Documents',
                  action: () => navigate('/documents')
                },
                { 
                  title: 'Client Engagement', 
                  desc: 'Reach out to top 5 contributors', 
                  color: 'emerald', 
                  actionLabel: 'Call Clients',
                  action: () => navigate('/clients')
                }
              ].map((task, i) => (
                <div key={i} className={`p-5 rounded-[2rem] border border-${task.color}-100 bg-${task.color}-50/30`}>
                  <p className="text-sm font-black text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{task.desc}</p>
                  <button 
                    onClick={task.action}
                    className={`mt-4 flex items-center gap-1.5 text-[10px] font-black text-${task.color}-600 uppercase tracking-widest hover:translate-x-1 transition-transform`}
                  >
                    {task.actionLabel} <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Business Summary Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[3rem] text-white shadow-xl shadow-blue-200">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 text-blue-100">Total Asset Value</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-blue-200">₹</span>
              <span className="text-4xl font-black">{(stats.totalPremium / 100000).toFixed(2)}L</span>
            </div>
            <p className="text-xs text-blue-100/60 mt-2 font-medium">Protecting {stats.activeCount} active policies.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-blue-200 uppercase">Yield</p>
                <p className="text-lg font-black">12.4%</p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-blue-200 uppercase">Retention</p>
                <p className="text-lg font-black">{stats.renewalRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
