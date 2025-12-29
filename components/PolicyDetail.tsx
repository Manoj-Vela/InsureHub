
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  FileCheck,
  MoreVertical,
  ChevronRight,
  Download,
  CheckCircle2
} from 'lucide-react';
import { PolicyStatus } from '../types';

export const PolicyDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { policies, clients, documents, renewPolicy } = useApp();
  const [isRenewing, setIsRenewing] = useState(false);

  const policy = policies.find(p => p.id === id);
  const client = clients.find(c => c?.id === policy?.clientId);
  const policyDocs = documents.filter(d => d.policyId === id);

  if (!policy || !client) return <div className="p-8 text-center">Policy not found.</div>;

  const handleRenew = () => {
    setIsRenewing(true);
    setTimeout(() => {
      renewPolicy(policy.id);
      setIsRenewing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/policies')}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Policies
        </button>
        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Policy Overview Hero Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    {policy.category}
                  </div>
                  <h1 className="text-3xl font-bold text-slate-900">{policy.policyNumber}</h1>
                  <p className="text-slate-500 font-medium mt-1">{policy.provider}</p>
                </div>
                <div className={`px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider ${
                  policy.status === PolicyStatus.ACTIVE ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {policy.status}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Premium</p>
                    <p className="text-xl font-bold text-slate-900">₹{policy.premium.toLocaleString()}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</p>
                    <p className="text-sm font-bold text-slate-700">{policy.startDate}</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expiry Date</p>
                    <p className="text-sm font-bold text-rose-600">{policy.expiryDate}</p>
                 </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          </div>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" /> Premium Schedule
            </h3>
            <div className="space-y-4">
               {[1, 2, 3].map((_, i) => (
                 <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                    <div className="flex items-center gap-4">
                       <div className={`p-2 rounded-xl ${i === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                          <CreditCard className="w-4 h-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-800">Premium Installment #{i + 1}</p>
                          <p className="text-xs font-medium text-slate-400">{i === 0 ? 'Paid on Jan 01' : `Due on ${i === 1 ? 'Apr' : 'Jul'} 01, 2024`}</p>
                       </div>
                    </div>
                    {i === 0 ? (
                      <span className="text-[10px] font-bold text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm border border-emerald-50">SUCCESS</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-100">UPCOMING</span>
                    )}
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* Right Col: Client Context & Tasks */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Linked Client</h3>
             <button 
              onClick={() => navigate(`/clients/${client.id}`)}
              className="flex items-center gap-4 group w-full text-left"
             >
                <img src={client.avatar} className="w-14 h-14 rounded-2xl bg-white/10" alt="" />
                <div className="flex-1">
                   <p className="font-bold text-lg group-hover:text-blue-400 transition-colors">{client.name}</p>
                   <p className="text-xs text-slate-400 font-medium">{client.email}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-blue-400 transition-colors" />
             </button>
             <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
                <button className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold transition-all text-center">CONTACT</button>
                <button 
                  disabled={isRenewing || policy.status === PolicyStatus.ACTIVE}
                  onClick={handleRenew}
                  className={`py-3 px-4 rounded-2xl font-bold transition-all text-center shadow-lg text-xs flex items-center justify-center gap-2 ${
                    policy.status === PolicyStatus.ACTIVE 
                    ? 'bg-emerald-600 text-white cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                  }`}
                >
                  {isRenewing ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : policy.status === PolicyStatus.ACTIVE ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      RENEWED
                    </>
                  ) : (
                    'RENEW NOW'
                  )}
                </button>
             </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Required Docs</h3>
                <AlertCircle className="w-4 h-4 text-amber-500" />
             </div>
             <div className="space-y-3">
                {policyDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                     <div className="flex items-center gap-3">
                        <FileCheck className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">{doc.type}</span>
                     </div>
                     <Download className="w-4 h-4 text-slate-300 hover:text-blue-600 cursor-pointer" />
                  </div>
                ))}
                {policyDocs.length === 0 && (
                  <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-center gap-3">
                     <AlertCircle className="w-5 h-5 text-rose-500" />
                     <p className="text-xs font-bold text-rose-900">Missing Policy File</p>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
