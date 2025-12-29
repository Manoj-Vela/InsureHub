
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Phone, 
  Mail, 
  MessageSquare, 
  MoreVertical, 
  Plus, 
  Filter, 
  Search, 
  ChevronRight, 
  ShieldCheck,
  Edit2,
  FilePlus,
  UserPlus,
  LayoutGrid,
  List as ListIcon,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PolicyStatus } from '../types';

export const Clients: React.FC = () => {
  const { clients, policies } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expiring'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm);
      
      const clientPolicies = policies.filter(p => p.clientId === client.id);
      
      if (filterType === 'active') {
        return matchesSearch && clientPolicies.some(p => p.status === PolicyStatus.ACTIVE);
      }
      if (filterType === 'expiring') {
        return matchesSearch && clientPolicies.some(p => p.status === PolicyStatus.EXPIRING);
      }
      
      return matchesSearch;
    });
  }, [clients, policies, searchTerm, filterType]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clients List</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and monitor {clients.length} insurance relationships.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/clients/add')}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`px-5 py-4 bg-white border border-slate-100 rounded-2xl font-bold transition-all flex items-center gap-2 shadow-sm ${showFilters ? 'text-blue-600 border-blue-100 bg-blue-50' : 'text-slate-600'}`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <div className="hidden md:flex bg-white border border-slate-100 rounded-2xl p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400'}`}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Options Panel */}
      {showFilters && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
           <button 
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
           >
             ALL CLIENTS
           </button>
           <button 
            onClick={() => setFilterType('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
           >
             HAS ACTIVE POLICIES
           </button>
           <button 
            onClick={() => setFilterType('expiring')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filterType === 'expiring' ? 'bg-amber-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
           >
             HAS EXPIRING POLICIES
           </button>
           <button onClick={() => setShowFilters(false)} className="ml-auto p-2 text-slate-300 hover:text-slate-600">
             <X className="w-4 h-4" />
           </button>
        </div>
      )}

      {/* Responsive View Container */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
            const clientPolicies = policies.filter(p => p.clientId === client.id);
            const isExpiring = clientPolicies.some(p => p.status === PolicyStatus.EXPIRING);

            return (
              <div 
                key={client.id} 
                className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden"
              >
                {/* Status Bar */}
                <div className={`h-1.5 w-full ${isExpiring ? 'bg-amber-400' : 'bg-emerald-400'}`}></div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <button 
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="flex items-center gap-4 text-left group/profile"
                    >
                      <div className="relative">
                        <img src={client.avatar} alt={client.name} className="w-14 h-14 rounded-2xl object-cover bg-slate-50 shadow-sm" />
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isExpiring ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover/profile:text-blue-600 transition-colors flex items-center gap-1">
                          {client.name}
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover/profile:opacity-100 transition-all -translate-x-2 group-hover/profile:translate-x-0" />
                        </h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{client.businessId}</p>
                      </div>
                    </button>
                    <div className="flex gap-1">
                       <button 
                        onClick={() => navigate(`/clients/${client.id}`)}
                        className="p-2 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 bg-slate-50 p-3 rounded-2xl">
                      <ShieldCheck className={`w-4 h-4 ${isExpiring ? 'text-amber-500' : 'text-blue-500'}`} />
                      <span className="font-bold">{clientPolicies.length} Active Policies</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {clientPolicies.slice(0, 3).map(p => (
                         <span key={p.id} className="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-extrabold uppercase tracking-wider">
                           {p.category.split(' ')[0]}
                         </span>
                       ))}
                       {clientPolicies.length > 3 && (
                         <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg font-extrabold">+{clientPolicies.length - 3}</span>
                       )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <a href={`tel:${client.phone}`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100">
                      <Phone className="w-5 h-5" />
                      <span className="text-[8px] font-bold mt-1 uppercase">Call</span>
                    </a>
                    <button className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100">
                      <MessageSquare className="w-5 h-5" />
                      <span className="text-[8px] font-bold mt-1 uppercase">WA</span>
                    </button>
                    <a href={`mailto:${client.email}`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
                      <Mail className="w-5 h-5" />
                      <span className="text-[8px] font-bold mt-1 uppercase">Mail</span>
                    </a>
                    <button 
                      onClick={() => navigate(`/clients/${client.id}`)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-900 hover:text-white transition-all border border-transparent"
                    >
                      <FilePlus className="w-5 h-5" />
                      <span className="text-[8px] font-bold mt-1 uppercase">Policy</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden hidden md:block">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.1em]">
                <th className="px-6 py-4">Client Detail</th>
                <th className="px-6 py-4">Policy Status</th>
                <th className="px-6 py-4">Last Interaction</th>
                <th className="px-6 py-4">Quick Actions</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClients.map(client => {
                const clientPolicies = policies.filter(p => p.clientId === client.id);
                const isExpiring = clientPolicies.some(p => p.status === PolicyStatus.EXPIRING);
                
                return (
                  <tr key={client.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                       <button onClick={() => navigate(`/clients/${client.id}`)} className="flex items-center gap-3 text-left">
                         <img src={client.avatar} className="w-10 h-10 rounded-xl bg-slate-100" alt="" />
                         <div>
                           <p className="text-sm font-bold text-slate-800">{client.name}</p>
                           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{client.businessId}</p>
                         </div>
                       </button>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                         <span className={`px-2 py-1 rounded-lg text-[9px] font-extrabold uppercase ${isExpiring ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                           {isExpiring ? 'Expiring' : 'Healthy'}
                         </span>
                         <span className="text-xs font-bold text-slate-500">{clientPolicies.length} Policies</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-700">{client.lastContacted}</span>
                         <span className="text-[10px] text-slate-400">via Phone Call</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1">
                          <a href={`tel:${client.phone}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Phone className="w-4 h-4" /></a>
                          <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><MessageSquare className="w-4 h-4" /></button>
                          <a href={`mailto:${client.email}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Mail className="w-4 h-4" /></a>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button onClick={() => navigate(`/clients/${client.id}`)} className="p-2 text-slate-300 hover:text-slate-900">
                         <ChevronRight className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {filteredClients.length === 0 && (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100 shadow-sm">
          <div className="inline-block p-8 bg-slate-50 rounded-[2.5rem] mb-6 animate-pulse">
             <Search className="w-12 h-12 text-slate-200" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">No matches found</h2>
          <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Try adjusting your search terms or filters to find the client you're looking for.</p>
          <button 
            onClick={() => { setSearchTerm(''); setFilterType('all'); }}
            className="mt-8 text-blue-600 font-bold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Mobile-only Bottom Tab Padding */}
      <div className="h-20 md:hidden"></div>
    </div>
  );
};
