
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  ArrowLeft, 
  Phone, 
  Mail, 
  MessageSquare, 
  Shield, 
  FileText, 
  Calendar, 
  MoreVertical,
  Plus,
  ChevronRight,
  ExternalLink,
  Save,
  Edit2,
  X,
  User,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Coins,
  TrendingUp,
  Repeat,
  Upload,
  Download,
  DollarSign,
  Briefcase,
  History
} from 'lucide-react';
import { PolicyStatus, PolicyCategory, DocumentType, DocumentStatus } from '../types';

export const ClientDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clients, policies, documents, addPolicy, updateClient, markClientContacted, interactionLogs } = useApp();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddPolicyModal, setShowAddPolicyModal] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [policyError, setPolicyError] = useState<string | null>(null);
  
  const client = clients.find(c => c.id === id);
  const clientPolicies = policies.filter(p => p.clientId === id);
  const clientDocuments = documents.filter(d => d.clientId === id);
  const clientInteractions = interactionLogs.filter(log => log.clientId === id);

  // Value Summary Calculations
  const valueSummary = useMemo(() => {
    const active = clientPolicies.filter(p => p.status === PolicyStatus.ACTIVE).length;
    const totalPremium = clientPolicies.reduce((sum, p) => sum + p.premium, 0);
    const renewed = clientPolicies.filter(p => p.status === PolicyStatus.RENEWED).length;
    const dueCount = clientPolicies.filter(p => p.status === PolicyStatus.EXPIRING).length;
    
    // Relationship score: Base + Active Policies + Interaction Frequency
    const interactionScore = Math.min(40, clientInteractions.length * 5);
    const policyScore = Math.min(60, active * 15 + renewed * 10);
    const strength = interactionScore + policyScore;

    return {
      active,
      totalPremium,
      renewed,
      dueCount,
      strength,
      isHighValue: totalPremium > 25000 || active > 2
    };
  }, [clientPolicies, clientInteractions]);

  // Form States
  const [editFormData, setEditFormData] = useState({
    name: client?.name || '',
    phone: client?.phone || '',
    email: client?.email || '',
    address: client?.address || '',
    notes: client?.notes || ''
  });

  const [policyFormData, setPolicyFormData] = useState({
    policyNumber: '',
    category: PolicyCategory.HEALTH,
    provider: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    premium: ''
  });

  if (!client) return <div className="p-8 text-center">Client not found.</div>;

  const handleContactAction = (type: 'Call' | 'Email' | 'WhatsApp', action: () => void) => {
    action();
    markClientContacted(client.id, type, `${type} initiated from client dashboard.`);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);
    if (!editFormData.name || !editFormData.phone) {
      setEditError('Name and Phone are mandatory.');
      return;
    }
    const result = updateClient(client.id, editFormData);
    if (result.success) {
      setShowEditModal(false);
    } else {
      setEditError(result.error || 'Failed to update client.');
    }
  };

  const handleAddPolicySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyError(null);

    if (!policyFormData.policyNumber || !policyFormData.provider || !policyFormData.premium) {
      setPolicyError('Please fill in all required policy fields.');
      return;
    }

    // Uniqueness check
    if (policies.some(p => p.policyNumber === policyFormData.policyNumber)) {
      setPolicyError('A policy with this number already exists in the system.');
      return;
    }

    addPolicy({
      clientId: client.id,
      policyNumber: policyFormData.policyNumber,
      category: policyFormData.category,
      provider: policyFormData.provider,
      startDate: policyFormData.startDate,
      expiryDate: policyFormData.expiryDate,
      premium: parseFloat(policyFormData.premium),
      status: PolicyStatus.ACTIVE,
    });

    setShowAddPolicyModal(false);
    setPolicyFormData({
      policyNumber: '',
      category: PolicyCategory.HEALTH,
      provider: '',
      startDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      premium: ''
    });
  };

  return (
    <div className="space-y-6 pb-32 max-w-7xl mx-auto px-4 md:px-0">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Clients
        </button>
        <div className="flex items-center gap-2">
           <button 
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </button>
          <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profile & Insights */}
        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center relative overflow-hidden">
            {valueSummary.isHighValue && (
              <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ring-1 ring-amber-200">
                <TrendingUp className="w-3 h-3" />
                High Value
              </div>
            )}
            
            <div className="relative inline-block mb-6">
              <img src={client.avatar} alt={client.name} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-xl bg-slate-50" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center">
                 <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
            <p className="text-sm font-medium text-slate-400 mt-1">Client ID: {client.businessId}</p>
            
            <div className="grid grid-cols-3 gap-3 mt-8">
               <button 
                onClick={() => handleContactAction('Call', () => window.location.href = `tel:${client.phone}`)}
                className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100"
               >
                 <Phone className="w-5 h-5 mb-1" />
                 <span className="text-[10px] font-bold uppercase">Call</span>
               </button>
               <button 
                onClick={() => handleContactAction('Email', () => window.location.href = `mailto:${client.email}`)}
                className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
               >
                 <Mail className="w-5 h-5 mb-1" />
                 <span className="text-[10px] font-bold uppercase">Email</span>
               </button>
               <button 
                onClick={() => handleContactAction('WhatsApp', () => {})}
                className="flex flex-col items-center p-4 rounded-2xl bg-slate-50 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
               >
                 <MessageSquare className="w-5 h-5 mb-1" />
                 <span className="text-[10px] font-bold uppercase">Chat</span>
               </button>
            </div>

            <div className="mt-8 text-left space-y-4 pt-8 border-t border-slate-50">
              <div className="flex gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                <p className="text-slate-600 leading-relaxed">{client.address || 'No address provided'}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
                <div className="text-slate-600">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added On</p>
                   <p className="font-semibold">{new Date(client.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Intelligence Widget */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-600 rounded-full blur-[64px] opacity-20 group-hover:opacity-40 transition-opacity"></div>
            
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Value Summary
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                    <Coins className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Portfolio Value</p>
                    <p className="text-lg font-black">₹{valueSummary.totalPremium.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Active</p>
                  <p className="text-xl font-black flex items-center gap-2">
                    {valueSummary.active}
                    <Shield className="w-4 h-4 text-emerald-400" />
                  </p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Due soon</p>
                  <p className="text-xl font-black flex items-center gap-2">
                    {valueSummary.dueCount}
                    <Repeat className="w-4 h-4 text-amber-400" />
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                   <span>Relationship Strength</span>
                   <span className="text-blue-400">{valueSummary.strength}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000"
                    style={{ width: `${valueSummary.strength}%` }}
                   ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800">Internal Notes</h3>
              <Save className="w-4 h-4 text-slate-300 cursor-pointer hover:text-blue-500" />
            </div>
            <textarea 
              value={client.notes}
              onChange={(e) => updateClient(client.id, { notes: e.target.value })}
              className="w-full bg-slate-50 p-4 rounded-2xl text-sm text-slate-600 border-none focus:ring-2 focus:ring-blue-500/10 min-h-[100px] resize-none"
              placeholder="Start typing notes..."
            />
          </div>
        </div>

        {/* Right Col: Policies & Docs */}
        <div className="lg:col-span-2 space-y-8">
          {/* Active Policies */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" /> Active Policies
              </h2>
              <button 
                onClick={() => setShowAddPolicyModal(true)}
                className="text-sm font-bold text-blue-600 flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Policy
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clientPolicies.map(policy => (
                <button 
                  key={policy.id} 
                  onClick={() => navigate(`/policies/${policy.id}`)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    policy.status === PolicyStatus.ACTIVE ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}></div>
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      policy.status === PolicyStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {policy.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{policy.category}</p>
                  <h4 className="font-bold text-slate-900 text-lg">{policy.policyNumber}</h4>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-bold text-slate-300 uppercase">Provider</span>
                       <span className="text-xs font-bold text-slate-500">{policy.provider}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-[9px] font-bold text-slate-300 uppercase">Premium</p>
                       <p className="text-sm font-black text-blue-600">₹{policy.premium.toLocaleString()}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {clientPolicies.length === 0 && (
              <div className="p-12 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold">No policies linked yet.</p>
                <button 
                  onClick={() => setShowAddPolicyModal(true)}
                  className="mt-4 text-sm font-bold text-blue-600"
                >
                  Click here to add the first policy
                </button>
              </div>
            )}
          </section>

          {/* Documents Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Documents Vault
              </h2>
              <button className="text-sm font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-50">
                {clientDocuments.map(doc => (
                  <div key={doc.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-500 rounded-2xl group-hover:bg-white group-hover:shadow-sm transition-all">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800">{doc.fileName}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            doc.status === DocumentStatus.VALID ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{doc.type} • {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <button className="p-2.5 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                         <Download className="w-4 h-4" />
                       </button>
                       <button className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                         <ExternalLink className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
              {clientDocuments.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-sm font-medium italic">
                  No documents have been uploaded for this client profile.
                </div>
              )}
            </div>
          </section>

          {/* Interaction History (Recent) */}
          <section className="space-y-4">
             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" /> Recent Interactions
             </h2>
             <div className="space-y-3">
                {clientInteractions.slice(0, 3).map(log => (
                  <div key={log.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-start gap-4">
                     <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl">
                        {log.type === 'Call' ? <Phone className="w-4 h-4" /> : log.type === 'Email' ? <Mail className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                     </div>
                     <div>
                        <div className="flex items-center gap-2">
                           <span className="text-xs font-bold text-slate-800">{log.type}</span>
                           <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                           <span className="text-[10px] font-bold text-slate-400">{new Date(log.date).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{log.note}</p>
                     </div>
                  </div>
                ))}
                {clientInteractions.length === 0 && (
                   <div className="text-center p-6 text-slate-400 text-sm italic">No recent interactions logged.</div>
                )}
             </div>
          </section>
        </div>
      </div>

      {/* Edit Client Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Edit Client Details</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {editError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{editError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      value={editFormData.name} 
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Phone *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="tel" 
                        value={editFormData.phone} 
                        onChange={(e) => setEditFormData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                      <input 
                        type="email" 
                        value={editFormData.email} 
                        onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                    <textarea 
                      value={editFormData.address} 
                      onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Residential address..."
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                 <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Policy Modal */}
      {showAddPolicyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddPolicyModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">Link New Policy</h2>
              <button onClick={() => setShowAddPolicyModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {policyError && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-semibold">{policyError}</p>
              </div>
            )}

            <form onSubmit={handleAddPolicySubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Category *</label>
                    <select 
                      value={policyFormData.category}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, category: e.target.value as PolicyCategory }))}
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium appearance-none"
                    >
                      {Object.values(PolicyCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Policy Number *</label>
                    <input 
                      type="text" 
                      value={policyFormData.policyNumber}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, policyNumber: e.target.value }))}
                      placeholder="#P12345"
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Provider / Company *</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="text" 
                      value={policyFormData.provider}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, provider: e.target.value }))}
                      placeholder="e.g. Star Health, HDFC"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Start Date</label>
                    <input 
                      type="date" 
                      value={policyFormData.startDate}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 ml-1">Expiry Date</label>
                    <input 
                      type="date" 
                      value={policyFormData.expiryDate}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 ml-1">Premium Amount *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="number" 
                      value={policyFormData.premium}
                      onChange={(e) => setPolicyFormData(prev => ({ ...prev, premium: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <button 
                  type="button"
                  onClick={() => setShowAddPolicyModal(false)}
                  className="flex-1 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all border border-slate-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                >
                  <Shield className="w-5 h-5" />
                  Link Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Floating Action Button (FAB) Area */}
      <div className="md:hidden fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setShowAddPolicyModal(true)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};
