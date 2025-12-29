
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  FileText, 
  Shield, 
  DollarSign,
  Briefcase,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PolicyCategory } from '../types';

export const AddClient: React.FC = () => {
  const navigate = useNavigate();
  const { addClientWithPolicy } = useApp();
  
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    // Client Info
    name: '',
    phone: '',
    email: '',
    dob: '',
    address: '',
    notes: '',
    // Policy Info
    policyNumber: '',
    category: PolicyCategory.HEALTH,
    provider: '',
    startDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    premium: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name || !formData.phone) {
      setError('Full Name and Phone Number are required.');
      return;
    }

    const result = addClientWithPolicy(
      {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        dob: formData.dob,
        address: formData.address,
        notes: formData.notes
      },
      formData.policyNumber ? {
        policyNumber: formData.policyNumber,
        category: formData.category,
        provider: formData.provider,
        startDate: formData.startDate,
        expiryDate: formData.expiryDate,
        premium: parseFloat(formData.premium) || 0
      } : undefined
    );

    if (result.success && result.clientId) {
      navigate(`/clients/${result.clientId}`);
    } else {
      setError(result.error || 'Failed to save client.');
    }
  };

  return (
    <div className="pb-32 max-w-2xl mx-auto">
      <header className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/clients')}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </button>
        <h1 className="text-2xl font-bold text-slate-900">Add New Client</h1>
      </header>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Section */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Client Information
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  placeholder="e.g. Michael Scott"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+91 9876543210"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input 
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    placeholder="name@email.com"
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="date" name="dob" value={formData.dob} onChange={handleChange}
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                <textarea 
                  name="address" value={formData.address} onChange={handleChange}
                  placeholder="Residential address..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium min-h-[100px] resize-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Internal Notes</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-300" />
                <textarea 
                  name="notes" value={formData.notes} onChange={handleChange}
                  placeholder="Any specific preference or history..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium min-h-[80px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Policy Section */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Initial Policy (Optional)
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Policy Number</label>
                <input 
                  type="text" name="policyNumber" value={formData.policyNumber} onChange={handleChange}
                  placeholder="e.g. #35698"
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Product Category</label>
                <select 
                  name="category" value={formData.category} onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium appearance-none"
                >
                  {Object.values(PolicyCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Provider / Company</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="text" name="provider" value={formData.provider} onChange={handleChange}
                  placeholder="e.g. LIC, Star Health"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Start Date</label>
                <input 
                  type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Expiry Date</label>
                <input 
                  type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 ml-1">Premium Amount (₹)</label>
              <div className="relative">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input 
                  type="number" name="premium" value={formData.premium} onChange={handleChange}
                  placeholder="0.00"
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Save Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-slate-100 z-50 md:relative md:bg-transparent md:border-none md:p-0">
          <button 
            type="submit"
            className="w-full max-w-2xl mx-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-200 group active:scale-[0.98]"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Save Client Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
