
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { PolicyCategory, PolicyStatus, Policy, Client } from '../types';
import { 
  Filter, Shield, MoreVertical, Calendar, Tag, Search, CreditCard, 
  ChevronRight, ArrowUpDown, AlertCircle, CheckCircle2, Send, 
  FileUp, RefreshCw, Trash2, Download, CheckSquare, Square,
  X, FilterX, Clock, DollarSign
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Dynamic Status Calculation Helper
const getDynamicStatus = (policy: Policy, reminderWindow: number = 30): PolicyStatus => {
  if (policy.status === PolicyStatus.CANCELLED || policy.status === PolicyStatus.RENEWED) {
    return policy.status;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(policy.expiryDate);
  expiry.setHours(0, 0, 0, 0);
  
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return PolicyStatus.EXPIRED;
  if (diffDays <= reminderWindow) return PolicyStatus.EXPIRING;
  return PolicyStatus.ACTIVE;
};

const StatusBadge: React.FC<{ status: PolicyStatus }> = ({ status }) => {
  const styles = {
    [PolicyStatus.ACTIVE]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [PolicyStatus.EXPIRING]: 'bg-amber-50 text-amber-600 border-amber-100',
    [PolicyStatus.EXPIRED]: 'bg-rose-50 text-rose-600 border-rose-100',
    [PolicyStatus.RENEWED]: 'bg-blue-50 text-blue-600 border-blue-100',
    [PolicyStatus.CANCELLED]: 'bg-slate-100 text-slate-500 border-slate-200',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const Policies: React.FC = () => {
  const { policies, clients, settings, renewPolicy, sendPolicyReminder } = useApp();
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PolicyCategory | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<PolicyStatus | 'All'>('All');
  const [selectedExpiry, setSelectedExpiry] = useState<'All' | '7d' | '30d' | 'Overdue'>('All');
  const [sortBy, setSortBy] = useState<'expiry' | 'premium' | 'name'>('expiry');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Constants
  const reminderWindow = settings.defaults.reminderIntervals[0] || 30;

  // Filtered & Sorted Data
  const filteredPolicies = useMemo(() => {
    let result = policies.map(p => ({
      ...p,
      calculatedStatus: getDynamicStatus(p, reminderWindow),
      client: clients.find(c => c.id === p.clientId)
    }));

    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.policyNumber.toLowerCase().includes(q) || 
        p.provider.toLowerCase().includes(q) ||
        p.client?.name.toLowerCase().includes(q)
      );
    }

    // Category
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Status
    if (selectedStatus !== 'All') {
      result = result.filter(p => p.calculatedStatus === selectedStatus);
    }

    // Expiry Window
    if (selectedExpiry !== 'All') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = result.filter(p => {
        const expiry = new Date(p.expiryDate);
        const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (selectedExpiry === '7d') return diffDays >= 0 && diffDays <= 7;
        if (selectedExpiry === '30d') return diffDays >= 0 && diffDays <= 30;
        if (selectedExpiry === 'Overdue') return diffDays < 0;
        return true;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'expiry') return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      if (sortBy === 'premium') return b.premium - a.premium;
      if (sortBy === 'name') return (a.client?.name || '').localeCompare(b.client?.name || '');
      return 0;
    });

    return result;
  }, [policies, clients, searchTerm, selectedCategory, selectedStatus, selectedExpiry, sortBy, reminderWindow]);

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPolicies.length) setSelectedIds([]);
    else setSelectedIds(filteredPolicies.map(p => p.id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkReminder = () => {
    if (window.confirm(`Send reminders for ${selectedIds.length} policies?`)) {
      selectedIds.forEach(id => sendPolicyReminder(id, 'Email'));
      setSelectedIds([]);
      alert('Reminders queued successfully.');
    }
  };

  const handleBulkRenew = () => {
    if (window.confirm(`Mark ${selectedIds.length} policies as Renewed?`)) {
      selectedIds.forEach(id => renewPolicy(id));
      setSelectedIds([]);
      alert('Policies updated successfully.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Policies Portfolio</h1>
          <p className="text-slate-500 font-medium">Monitoring {policies.length} coverage lines across your client base.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/work')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all"
          >
            <RefreshCw className="w-4 h-4" /> Sync Status
          </button>
          <button 
            onClick={() => navigate('/clients')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Shield className="w-4 h-4" /> Link New Policy
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="sticky top-[73px] z-30 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search policy #, provider, or client..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-4 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-5 py-4 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm ${showFilters ? 'bg-slate-900 text-white border-slate-900' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <Filter className="w-4 h-4" /> Filters
            </button>
            <div className="bg-white border border-slate-100 rounded-2xl p-1 shadow-sm flex items-center">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-600 focus:ring-0 cursor-pointer px-3"
              >
                <option value="expiry">Sort: Expiry</option>
                <option value="premium">Sort: Premium</option>
                <option value="name">Sort: Client</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl flex flex-col gap-6 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...Object.values(PolicyCategory)].map(cat => (
                    <button 
                      key={cat} 
                      onClick={() => setSelectedCategory(cat as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {cat.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Calculated Status</label>
                <div className="flex flex-wrap gap-2">
                  {['All', ...Object.values(PolicyStatus)].map(status => (
                    <button 
                      key={status} 
                      onClick={() => setSelectedStatus(status as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedStatus === status ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry Timeline</label>
                <div className="flex flex-wrap gap-2">
                  {['All', 'Overdue', '7d', '30d'].map(window => (
                    <button 
                      key={window} 
                      onClick={() => setSelectedExpiry(window as any)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${selectedExpiry === window ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                    >
                      {window === '7d' ? 'Next 7 Days' : window === '30d' ? 'Next 30 Days' : window}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-slate-50">
               <div className="text-[10px] font-bold text-slate-400 italic">Showing {filteredPolicies.length} matches</div>
               <button 
                onClick={() => { setSelectedCategory('All'); setSelectedStatus('All'); setSelectedExpiry('All'); setSearchTerm(''); }}
                className="flex items-center gap-2 text-[10px] font-black text-rose-600 hover:text-rose-700 uppercase"
               >
                 <FilterX className="w-4 h-4" /> Clear All Filters
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white px-8 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-8 duration-300 w-[90%] max-w-4xl border border-white/10">
           <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center font-black">
               {selectedIds.length}
             </div>
             <div className="hidden sm:block">
               <p className="text-xs font-black uppercase tracking-widest">Policies Selected</p>
               <p className="text-[10px] text-slate-400">Apply action to current selection</p>
             </div>
           </div>
           <div className="h-10 w-px bg-white/10 mx-2 hidden sm:block"></div>
           <div className="flex-1 flex gap-3">
             <button onClick={handleBulkReminder} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">
               <Send className="w-4 h-4" /> Reminder
             </button>
             <button onClick={handleBulkRenew} className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">
               <RefreshCw className="w-4 h-4" /> Renew
             </button>
             <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase transition-all">
               <Download className="w-4 h-4" /> Export
             </button>
           </div>
           <button onClick={() => setSelectedIds([])} className="p-3 hover:bg-white/10 rounded-2xl transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bulk Select Helper */}
        {filteredPolicies.length > 0 && (
          <div className="col-span-full flex items-center gap-2 px-2 py-1">
             <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
               {selectedIds.length === filteredPolicies.length ? <CheckSquare className="w-4 h-4 text-blue-600" /> : <Square className="w-4 h-4" />}
               Select All Visible
             </button>
          </div>
        )}

        {filteredPolicies.map(policy => (
          <div 
            key={policy.id} 
            className={`bg-white rounded-[2.5rem] border transition-all flex flex-col group relative overflow-hidden ${selectedIds.includes(policy.id) ? 'border-blue-600 ring-4 ring-blue-500/10' : 'border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50'}`}
          >
            {/* Selection Checkbox (Visible on hover or if selected) */}
            <button 
              onClick={(e) => { e.stopPropagation(); toggleSelect(policy.id); }}
              className={`absolute top-6 left-6 z-10 p-2 rounded-xl transition-all ${selectedIds.includes(policy.id) ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-200 opacity-0 group-hover:opacity-100 hover:text-blue-500'}`}
            >
              {selectedIds.includes(policy.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>

            <div className="p-8">
              <div className="flex justify-between items-start mb-6 pl-10">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{policy.category}</p>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate max-w-[150px]">{policy.policyNumber}</h3>
                  </div>
                </div>
                <StatusBadge status={policy.calculatedStatus} />
              </div>

              <div className="space-y-5">
                 {/* Policy Holder Context */}
                 <button 
                  onClick={() => navigate(`/clients/${policy.client?.id}`)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-[1.5rem] hover:bg-blue-50 transition-colors group/client"
                 >
                    <div className="flex items-center gap-3">
                       <img src={policy.client?.avatar} className="w-9 h-9 rounded-xl border-2 border-white shadow-sm" alt="" />
                       <div className="text-left">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Policy Holder</p>
                          <p className="text-sm font-bold text-slate-900 group-hover/client:text-blue-600">{policy.client?.name}</p>
                       </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover/client:text-blue-600 group-hover/client:translate-x-1 transition-all" />
                 </button>

                 {/* Key Stats */}
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-[1.5rem] border border-slate-50 flex items-center gap-3">
                       <div className="p-2 bg-slate-50 text-slate-400 rounded-lg"><Clock className="w-4 h-4" /></div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Expires</p>
                          <p className="text-xs font-bold text-slate-800 truncate">{new Date(policy.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                       </div>
                    </div>
                    <div className="p-4 rounded-[1.5rem] border border-slate-50 flex items-center gap-3">
                       <div className="p-2 bg-slate-50 text-slate-400 rounded-lg"><DollarSign className="w-4 h-4" /></div>
                       <div className="min-w-0">
                          <p className="text-[8px] font-black text-slate-400 uppercase">Premium</p>
                          <p className="text-xs font-black text-blue-600 truncate">₹{policy.premium.toLocaleString()}</p>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 text-xs font-bold text-slate-500 px-1">
                    <CreditCard className="w-4 h-4 text-slate-300" />
                    <span>{policy.provider}</span>
                 </div>
              </div>

              {/* Action Grid */}
              <div className="mt-8 pt-8 border-t border-slate-50 grid grid-cols-2 gap-3">
                 <button 
                  onClick={() => navigate(`/policies/${policy.id}`)}
                  className="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95"
                 >
                   Details
                 </button>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => sendPolicyReminder(policy.id, 'Email')}
                      className="flex-1 flex items-center justify-center p-3.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all active:scale-95"
                      title="Send Reminder"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => renewPolicy(policy.id)}
                      className="flex-1 flex items-center justify-center p-3.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all active:scale-95"
                      title="Renew Policy"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    <button 
                      className="flex-1 flex items-center justify-center p-3.5 bg-slate-50 text-slate-400 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
                      title="Upload Documents"
                    >
                      <FileUp className="w-4 h-4" />
                    </button>
                 </div>
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredPolicies.length === 0 && (
          <div className="col-span-full bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm">
            <div className="inline-block p-10 bg-slate-50 rounded-[3rem] mb-8 animate-pulse">
               <Shield className="w-16 h-16 text-slate-200" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">No policies found</h2>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-3 italic">Try adjusting your filters or adding a new policy to your portfolio.</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
               <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('All'); setSelectedStatus('All'); setSelectedExpiry('All'); }}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
               >
                 Clear Search & Filters
               </button>
               <button 
                onClick={() => navigate('/clients')}
                className="px-8 py-4 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all"
               >
                 Add Your First Policy
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-center py-10">
         <div className="flex items-center gap-6 text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Accurate Status</span>
            <span className="flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-400" /> Priority Tracking</span>
            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-blue-400" /> Fast Execution</span>
         </div>
      </div>
      
      <div className="h-24 md:hidden"></div>
    </div>
  );
};


const Zap = (props: any) => <Shield {...props} />; // Mocked
