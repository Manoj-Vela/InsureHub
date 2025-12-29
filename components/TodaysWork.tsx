
import React, { useMemo, useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  CheckCircle2, 
  Phone, 
  MessageSquare, 
  Mail,
  Bell, 
  Clock, 
  AlertCircle, 
  UserX, 
  Calendar,
  ChevronRight,
  UserCheck,
  Moon,
  X,
  FileWarning,
  Zap,
  PhoneCall,
  Plus,
  ArrowRight,
  CheckCircle,
  // Added missing RefreshCw icon
  RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PolicyStatus, DocumentStatus, Client, Policy, InteractionLog, CRMTask } from '../types';

type DerivedTask = {
  id: string;
  clientId: string;
  client: Client;
  type: 'Renewal' | 'Follow-up' | 'Documents' | 'Relationship' | 'Expiry';
  priority: 'High' | 'Medium' | 'Low';
  reason: string;
  dateLabel: string;
  dateValue: string;
  isManual: boolean;
  relatedId?: string;
}

export const TodaysWork: React.FC = () => {
  const { clients, policies, documents, tasks, completeTask, snoozePolicy, scheduleTask } = useApp();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'Today' | 'Tomorrow' | 'Week' | 'Overdue'>('Today');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endOfWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const derivedTasks: DerivedTask[] = useMemo(() => {
    const list: DerivedTask[] = [];

    // 1. Auto: Expiring Policies
    policies.forEach(p => {
      if (p.status === PolicyStatus.RENEWED) return;
      if (p.snoozedUntil && p.snoozedUntil > todayStr) return;

      const client = clients.find(c => c.id === p.clientId);
      if (!client) return;

      if (p.expiryDate === todayStr) {
        list.push({
          id: `expiry-today-${p.id}`,
          clientId: client.id,
          client,
          type: 'Renewal',
          priority: 'High',
          reason: `Policy ${p.policyNumber} expires today`,
          dateLabel: 'Expiring Today',
          dateValue: p.expiryDate,
          isManual: false,
          relatedId: p.id
        });
      } else if (p.expiryDate > todayStr && p.expiryDate <= endOfWeek) {
        list.push({
          id: `expiry-soon-${p.id}`,
          clientId: client.id,
          client,
          type: 'Renewal',
          priority: 'Medium',
          reason: `Policy ${p.policyNumber} expires soon`,
          dateLabel: 'Expiry Date',
          dateValue: p.expiryDate,
          isManual: false,
          relatedId: p.id
        });
      } else if (p.expiryDate < todayStr) {
        list.push({
          id: `expiry-overdue-${p.id}`,
          clientId: client.id,
          client,
          type: 'Renewal',
          priority: 'High',
          reason: `Policy ${p.policyNumber} is OVERDUE`,
          dateLabel: 'Expired On',
          dateValue: p.expiryDate,
          isManual: false,
          relatedId: p.id
        });
      }
    });

    // 2. Auto: Compliance
    documents.forEach(d => {
      if (d.status === DocumentStatus.MISSING || d.status === DocumentStatus.INVALID) {
        const client = clients.find(c => c.id === d.clientId);
        if (client) {
          const alreadyInList = list.some(t => t.clientId === client.id && t.type === 'Documents');
          if (!alreadyInList) {
            list.push({
              id: `compliance-${d.id}`,
              clientId: client.id,
              client,
              type: 'Documents',
              priority: 'Medium',
              reason: `Action required: ${d.status} ${d.type}`,
              dateLabel: 'Since',
              dateValue: d.uploadDate,
              isManual: false,
              relatedId: d.id
            });
          }
        }
      }
    });

    // 3. Auto: Neglected
    clients.forEach(c => {
      if (c.lastContacted <= thirtyDaysAgo) {
        const alreadyInList = list.some(t => t.clientId === c.id);
        if (!alreadyInList) {
          list.push({
            id: `neglected-${c.id}`,
            clientId: c.id,
            client: c,
            type: 'Relationship',
            priority: 'Low',
            reason: 'No contact in over 30 days',
            dateLabel: 'Last Contacted',
            dateValue: c.lastContacted,
            isManual: false
          });
        }
      }
    });

    // 4. Manual: Tasks from AppContext
    tasks.filter(t => t.status === 'Pending').forEach(t => {
      const client = clients.find(c => c.id === t.clientId);
      if (client) {
        list.push({
          id: t.id,
          clientId: client.id,
          client,
          type: t.type,
          priority: t.priority,
          reason: t.reason,
          dateLabel: 'Scheduled For',
          dateValue: t.dueDate,
          isManual: true
        });
      }
    });

    return list;
  }, [clients, policies, documents, tasks, todayStr, endOfWeek, thirtyDaysAgo]);

  const filteredTasks = useMemo(() => {
    let base = derivedTasks;
    if (activeFilter === 'Today') {
      return base.filter(t => t.dateValue <= todayStr);
    } else if (activeFilter === 'Tomorrow') {
      return base.filter(t => t.dateValue === tomorrow);
    } else if (activeFilter === 'Week') {
      return base.filter(t => t.dateValue <= endOfWeek);
    } else if (activeFilter === 'Overdue') {
      return base.filter(t => t.dateValue < todayStr);
    }
    return base;
  }, [derivedTasks, activeFilter, todayStr, tomorrow, endOfWeek]);

  const sortedTasks = useMemo(() => {
    const weight = { High: 3, Medium: 2, Low: 1 };
    return [...filteredTasks].sort((a, b) => weight[b.priority] - weight[a.priority]);
  }, [filteredTasks]);

  const motivationLine = useMemo(() => {
    const critical = derivedTasks.filter(t => t.priority === 'High').length;
    if (critical > 0) return "Renewals today protect tomorrow's income.";
    if (derivedTasks.length > 0) return "A focused day leads to consistent growth.";
    return "All clear. Proactive check-ins build long-term loyalty.";
  }, [derivedTasks]);

  const completedTodayCount = useMemo(() => {
    // This is simple mock logic, in real DB we would query tasks completed today
    return 0; // Placeholder for UI
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <header className="flex flex-col gap-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900">Today's Focus</h1>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase ring-4 ring-white">
                {derivedTasks.filter(t => t.dateValue <= todayStr).length} Tasks
              </span>
            </div>
            <p className="text-slate-400 font-medium mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button 
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Schedule Follow-up
          </button>
        </div>
        <p className="text-blue-600 font-bold text-sm italic mt-2 opacity-80 flex items-center gap-2">
          <Zap className="w-4 h-4 fill-blue-600" />
          {motivationLine}
        </p>
      </header>

      {/* Progress & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-100 shadow-sm w-fit">
          {(['Today', 'Tomorrow', 'Week', 'Overdue'] as const).map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeFilter === filter ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-sm">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
           </div>
           <p className="text-xs font-black text-slate-700">0 of {sortedTasks.length} Completed</p>
        </div>
      </div>

      {/* Task List */}
      {sortedTasks.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm">
          <div className="inline-block p-10 bg-emerald-50 rounded-[3rem] mb-8">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">All caught up!</h2>
          <p className="text-slate-400 font-medium max-w-xs mx-auto mt-3">
            {activeFilter === 'Today' ? motivationLine : 'No tasks found for this period.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onComplete={() => completeTask(task.id)}
              onReschedule={(until) => task.isManual ? console.log('resched manual') : (task.relatedId && snoozePolicy(task.relatedId, until))}
            />
          ))}
        </div>
      )}

      {showScheduleModal && (
        <ScheduleModal 
          onClose={() => setShowScheduleModal(false)} 
          clients={clients} 
          onSave={scheduleTask}
        />
      )}
    </div>
  );
};

const TaskCard: React.FC<{ 
  task: DerivedTask; 
  onComplete: () => void;
  onReschedule: (date: string) => void;
}> = ({ task, onComplete, onReschedule }) => {
  const navigate = useNavigate();
  const [showReschedule, setShowReschedule] = useState(false);

  const priorityColor = {
    High: 'bg-rose-600',
    Medium: 'bg-amber-500',
    Low: 'bg-blue-600',
  };

  const handleReschedule = (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    onReschedule(target.toISOString().split('T')[0]);
    setShowReschedule(false);
  };

  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${priorityColor[task.priority]}`}></div>
      
      <div className="flex items-start gap-5 flex-1 min-w-0">
        <button onClick={() => navigate(`/clients/${task.clientId}`)} className="relative flex-shrink-0 transition-transform group-hover:scale-105">
          <img src={task.client.avatar} alt="" className="w-16 h-16 rounded-[1.5rem] object-cover bg-slate-50 border border-slate-100" />
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white flex items-center justify-center ${priorityColor[task.priority]} text-white`}>
            {task.type === 'Renewal' ? <RefreshCw className="w-2.5 h-2.5" /> : task.type === 'Documents' ? <FileWarning className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
          </div>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3 className="font-bold text-slate-900 text-lg truncate hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/clients/${task.clientId}`)}>
              {task.client.name}
            </h3>
            <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest text-white ${priorityColor[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <p className="text-sm font-black text-slate-800 flex items-center gap-2">
            {task.reason}
          </p>
          <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {task.dateLabel}: {task.dateValue}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showReschedule ? (
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-2xl animate-in slide-in-from-right-2">
            <button onClick={() => handleReschedule(2)} className="px-3 py-2 bg-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white shadow-sm transition-all">2d</button>
            <button onClick={() => handleReschedule(7)} className="px-3 py-2 bg-white rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 hover:text-white shadow-sm transition-all">1w</button>
            <button onClick={() => setShowReschedule(false)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <button 
            onClick={() => setShowReschedule(true)}
            className="p-3.5 bg-slate-50 text-slate-400 hover:bg-amber-100 hover:text-amber-600 rounded-2xl transition-all active:scale-90"
          >
            <Moon className="w-5 h-5" />
          </button>
        )}

        <div className="h-10 w-px bg-slate-100 mx-1 hidden md:block"></div>

        <div className="flex items-center gap-2">
          <a href={`tel:${task.client.phone}`} className="p-3.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-sm active:scale-90">
            <PhoneCall className="w-5 h-5" />
          </a>
          <button onClick={onComplete} className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-200">
            <CheckCircle className="w-4 h-4" />
            <span>Mark Done</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const ScheduleModal: React.FC<{ 
  onClose: () => void; 
  clients: Client[]; 
  onSave: (task: Omit<CRMTask, 'id' | 'createdAt' | 'status'>) => void 
}> = ({ onClose, clients, onSave }) => {
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    type: 'Follow-up' as CRMTask['type'],
    dueDate: new Date().toISOString().split('T')[0],
    priority: 'Medium' as CRMTask['priority'],
    reason: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason) return;
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-bold">Schedule Action</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Client</label>
              <select 
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium appearance-none"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                >
                  <option value="Renewal">Renewal</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Documents">Documents</option>
                  <option value="Relationship">Relationship</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                <select 
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
              <input 
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Description</label>
              <textarea 
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="e.g. Call regarding health policy update..."
                className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium min-h-[100px] resize-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-slate-200"
          >
            Create Task
          </button>
        </form>
      </div>
    </div>
  );
};
