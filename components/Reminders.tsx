
import React, { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Bell, 
  MessageSquare, 
  Mail, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  X,
  Phone,
  CalendarDays,
  History,
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  ArrowRight,
  Moon
} from 'lucide-react';
import { PolicyStatus, Policy } from '../types';

type ReminderTab = 'today' | '7days' | '30days' | 'overdue' | 'history';

export const Reminders: React.FC = () => {
  const { clients, policies, reminders, sendPolicyReminder, runAutomationEngine, snoozePolicy } = useApp();
  const [activeTab, setActiveTab] = useState<ReminderTab>('today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic to calculate eligibility and tabs
  const reminderData = useMemo(() => {
    const now = new Date();
    // Normalize today to start of day for accurate day counting
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    return policies.map(p => {
      const client = clients.find(c => c.id === p.clientId);
      const expiryDate = new Date(p.expiryDate);
      
      // Calculate diff in days
      const diffTime = expiryDate.getTime() - startOfToday;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...p,
        client,
        diffDays
      };
    }).filter(p => 
      p.client && 
      p.status !== PolicyStatus.RENEWED &&
      (!p.snoozedUntil || p.snoozedUntil <= todayStr) // Hide snoozed until date is reached
    );
  }, [policies, clients, todayStr]);

  const filteredData = useMemo(() => {
    let result = reminderData;

    // Filter by tab
    if (activeTab === 'today') {
      result = result.filter(p => p.diffDays === 0);
    } else if (activeTab === '7days') {
      result = result.filter(p => p.diffDays > 0 && p.diffDays <= 7);
    } else if (activeTab === '30days') {
      result = result.filter(p => p.diffDays > 7 && p.diffDays <= 30);
    } else if (activeTab === 'overdue') {
      result = result.filter(p => p.diffDays < 0);
    }

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.client?.name.toLowerCase().includes(q) || 
        p.policyNumber.toLowerCase().includes(q) ||
        p.client?.phone.includes(q)
      );
    }

    // Duplicate Prevention: Do not show policies already reminded today
    if (activeTab !== 'history') {
      result = result.filter(p => {
        if (!p.lastReminderSent) return true;
        const lastSentDate = new Date(p.lastReminderSent).toISOString().split('T')[0];
        return lastSentDate !== todayStr;
      });
    }

    return result.sort((a, b) => a.diffDays - b.diffDays);
  }, [reminderData, activeTab, searchQuery, todayStr]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    runAutomationEngine();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const stats = {
    today: reminderData.filter(p => p.diffDays === 0).length,
    '7days': reminderData.filter(p => p.diffDays > 0 && p.diffDays <= 7).length,
    '30days': reminderData.filter(p => p.diffDays > 7 && p.diffDays <= 30).length,
    overdue: reminderData.filter(p => p.diffDays < 0).length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Reminders Engine
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">Smart notifications for upcoming policy maturities and overdue renewals.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Engine</span>
        </button>
      </div>

      {/* View Tabs / Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { id: 'today', label: 'Today', count: stats.today, icon: Clock, color: 'rose' },
          { id: '7days', label: 'Next 7 Days', count: stats['7days'], icon: CalendarDays, color: 'amber' },
          { id: '30days', label: 'Next 30 Days', count: stats['30days'], icon: Bell, color: 'blue' },
          { id: 'overdue', label: 'Overdue', count: stats.overdue, icon: AlertTriangle, color: 'slate' },
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ReminderTab)}
            className={`p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${
              activeTab === tab.id 
              ? `bg-white border-${tab.color}-200 shadow-xl shadow-${tab.color}-100/50 ring-2 ring-${tab.color}-500/10` 
              : 'bg-white border-slate-100 hover:border-slate-200'
            }`}
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${activeTab === tab.id ? `text-${tab.color}-500` : 'text-slate-400'}`}>
                  {tab.label}
                </p>
                <p className={`text-3xl font-black ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-600'}`}>
                  {tab.count}
                </p>
              </div>
              <div className={`mt-4 p-2 inline-flex items-center justify-center rounded-xl w-fit transition-colors ${
                activeTab === tab.id ? `bg-${tab.color}-500 text-white` : 'bg-slate-50 text-slate-300'
              }`}>
                <tab.icon className="w-5 h-5" />
              </div>
            </div>
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-all ${
              activeTab === tab.id ? `bg-${tab.color}-500 scale-150` : 'bg-slate-200 scale-100'
            }`}></div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text"
          placeholder="Filter by client name, phone or policy ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/20 outline-none transition-all text-slate-600 font-medium"
        />
      </div>

      {/* Main List Area */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
             <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">
                {activeTab === 'history' ? 'Reminders History' : `${activeTab.replace('days', ' Days')} Pending`}
             </h2>
          </div>
          <button 
            onClick={() => setActiveTab(activeTab === 'history' ? 'today' : 'history')} 
            className="text-xs font-bold flex items-center gap-1 transition-colors hover:text-blue-600"
            style={{ color: activeTab === 'history' ? '#2563eb' : '#94a3b8' }}
          >
            <History className="w-4 h-4" />
            {activeTab === 'history' ? 'Back to Pending' : 'View History Log'}
          </button>
        </div>

        {activeTab === 'history' ? (
          <HistoryLog sentReminders={reminders.filter(r => r.status === 'Sent')} clients={clients} />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-[3rem] p-20 text-center border border-dashed border-slate-200">
                <div className="inline-block p-8 bg-slate-50 rounded-full mb-6">
                  <CheckCircle className="w-12 h-12 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Zero Pending Items</h3>
                <p className="text-slate-400 max-w-xs mx-auto mt-2 font-medium">No policies found for this window. Either you are all caught up or no renewals are due.</p>
              </div>
            ) : (
              filteredData.map(item => (
                <ReminderItem 
                  key={item.id} 
                  policy={item} 
                  client={item.client!} 
                  diffDays={item.diffDays} 
                  onSend={(type) => sendPolicyReminder(item.id, type)}
                  onSnooze={(until) => snoozePolicy(item.id, until)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const ReminderItem: React.FC<{ 
  policy: Policy; 
  client: any; 
  diffDays: number;
  onSend: (type: 'Email' | 'WhatsApp') => void;
  onSnooze: (until: string | null) => void;
}> = ({ policy, client, diffDays, onSend, onSnooze }) => {
  const isOverdue = diffDays < 0;
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false);

  const handleSnooze = (days: number | 'custom') => {
    if (days === 'custom') {
      const date = prompt("Enter snooze until date (YYYY-MM-DD):", new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
      if (date) onSnooze(date);
    } else {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + (days as number));
      onSnooze(targetDate.toISOString().split('T')[0]);
    }
    setShowSnoozeOptions(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
      <div className={`absolute top-0 left-0 w-2 h-full transition-colors ${
        isOverdue ? 'bg-slate-900' : diffDays === 0 ? 'bg-rose-500' : diffDays <= 7 ? 'bg-amber-500' : 'bg-blue-500'
      }`}></div>
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start gap-5 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <img src={client.avatar} alt="" className="w-16 h-16 rounded-[1.25rem] object-cover bg-slate-50 border border-slate-100 shadow-sm" />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white flex items-center justify-center ${
               isOverdue ? 'bg-slate-900' : diffDays === 0 ? 'bg-rose-500' : 'bg-emerald-500'
            }`}>
              <User className="w-2 h-2 text-white" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-slate-900 text-lg truncate">{client.name}</h3>
              <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${isOverdue ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'}`}>
                {policy.category}
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> {policy.policyNumber}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {client.phone}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Expiry Date</span>
                <span className={`text-sm font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                  {new Date(policy.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Days Remaining</span>
                <span className={`text-sm font-black ${isOverdue ? 'text-rose-600' : diffDays === 0 ? 'text-rose-500' : diffDays <= 7 ? 'text-amber-500' : 'text-blue-600'}`}>
                  {isOverdue ? `${Math.abs(diffDays)}d Overdue` : diffDays === 0 ? 'Due Today' : `${diffDays}d Left`}
                </span>
              </div>
              <div className="flex flex-col hidden md:flex">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Last Interaction</span>
                <span className="text-sm font-bold text-slate-500">
                  {policy.lastReminderSent ? new Date(policy.lastReminderSent).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never Engaged'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 lg:self-center">
          <div className="h-10 w-px bg-slate-100 mx-2 hidden lg:block"></div>
          {showSnoozeOptions ? (
            <div className="flex items-center gap-2 animate-in slide-in-from-right-2 duration-200">
               <button onClick={() => handleSnooze(2)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase">2d</button>
               <button onClick={() => handleSnooze(5)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase">5d</button>
               <button onClick={() => handleSnooze('custom')} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-[10px] font-black uppercase">Date</button>
               <button onClick={() => setShowSnoozeOptions(false)} className="p-2 text-slate-300 hover:text-rose-500"><X className="w-4 h-4" /></button>
            </div>
          ) : (
            <button 
              onClick={() => setShowSnoozeOptions(true)}
              className="p-3.5 bg-slate-50 text-slate-400 hover:bg-amber-100 hover:text-amber-600 rounded-2xl transition-all group/snooze"
            >
              <Moon className="w-5 h-5 group-hover/snooze:scale-110 transition-transform" />
            </button>
          )}
          
          <button 
            onClick={() => onSend('Email')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-4 lg:py-3.5 rounded-2xl font-black text-xs transition-all border border-blue-100 active:scale-95 group/btn"
          >
            <Mail className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span>EMAIL</span>
          </button>
          <button 
            onClick={() => onSend('WhatsApp')}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white px-6 py-4 lg:py-3.5 rounded-2xl font-black text-xs transition-all border border-emerald-100 active:scale-95 group/btn"
          >
            <MessageSquare className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            <span>WA</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryLog: React.FC<{ sentReminders: any[]; clients: any[] }> = ({ sentReminders, clients }) => (
  <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
    <div className="divide-y divide-slate-50">
      {sentReminders.length === 0 ? (
        <div className="p-16 text-center text-slate-400 font-bold italic opacity-50">
          The history log is currently empty. Start sending reminders to see records here.
        </div>
      ) : (
        sentReminders.map(log => {
          const client = clients.find(c => c.id === log.clientId);
          return (
            <div key={log.id} className="p-6 flex items-start gap-5 hover:bg-slate-50/80 transition-colors group">
              <div className={`p-4 rounded-2xl flex-shrink-0 ${
                log.type === 'Email' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'
              }`}>
                {log.type === 'Email' ? <Mail className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{client?.name || 'Deactivated Client'}</h4>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                      Engagement via {log.type} • {new Date(log.sentDate).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Sent Successfully</span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                  {log.content}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-slate-900 transition-all self-center">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          );
        })
      )}
    </div>
  </div>
);
