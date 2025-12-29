
import React, { useState } from 'react';
import { useApp } from '../store/AppContext';
import { 
  Bell, Clock, Shield, Database, User, Lock, 
  Smartphone, Mail, MessageSquare, Check, 
  ChevronRight, RefreshCw, LogOut, Globe,
  Calendar, ShieldCheck, Zap, AlertCircle,
  Plus, X, Trash2, Save, Download
} from 'lucide-react';
import { PolicyCategory } from '../types';

const Toggle: React.FC<{ checked: boolean; onChange: () => void }> = ({ checked, onChange }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-blue-600' : 'bg-slate-200'}`}
  >
    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
  </button>
);

const SettingsSection: React.FC<{ title: string; icon: any; children: React.ReactNode; badge?: string }> = ({ title, icon: Icon, children, badge }) => (
  <section className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
    <div className="p-6 border-b border-slate-50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-slate-50 text-slate-400 rounded-xl"><Icon className="w-5 h-5" /></div>
        <h2 className="font-bold text-slate-800">{title}</h2>
      </div>
      {badge && <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{badge}</span>}
    </div>
    <div className="p-6 space-y-6 flex-1">
      {children}
    </div>
  </section>
);

export const Settings: React.FC = () => {
  const { settings, updateSettings, triggerSync, syncLogs } = useApp();
  const [isSyncing, setIsSyncing] = useState(false);
  const [profileForm, setProfileForm] = useState(settings.profile);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleToggleNotif = (category: keyof typeof settings.notifications.categories) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        categories: {
          ...settings.notifications.categories,
          [category]: !settings.notifications.categories[category]
        }
      }
    });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await triggerSync();
    setIsSyncing(false);
  };

  const saveProfile = () => {
    updateSettings({ profile: profileForm });
  };

  const addInterval = () => {
    const days = parseInt(prompt('Enter days for reminder (e.g. 45):') || '');
    if (!isNaN(days) && !settings.defaults.reminderIntervals.includes(days)) {
      updateSettings({
        defaults: {
          ...settings.defaults,
          reminderIntervals: [...settings.defaults.reminderIntervals, days].sort((a,b) => b-a)
        }
      });
    }
  };

  const removeInterval = (days: number) => {
    updateSettings({
      defaults: {
        ...settings.defaults,
        reminderIntervals: settings.defaults.reminderIntervals.filter(i => i !== days)
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-medium mt-1">Manage global preferences, automation rules, and agent identity.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-100 rounded-2xl text-xs font-black text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" /> EXPORT BACKUP
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile & Identity */}
        <div className="space-y-8">
          <SettingsSection title="Profile & Identity" icon={User}>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative group">
                <img src={settings.profile.avatar} className="w-20 h-20 rounded-[2rem] border-4 border-white shadow-xl" alt="" />
                <button className="absolute inset-0 bg-slate-900/40 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-black uppercase">Change</button>
              </div>
              <div className="flex-1">
                <p className="text-xl font-bold text-slate-900">{settings.profile.name}</p>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{settings.profile.role}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Display Name</label>
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                  <input 
                    type="email" 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Phone</label>
                  <input 
                    type="tel" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button 
                onClick={saveProfile}
                className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" /> Update Profile
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                <Lock className="w-4 h-4" /> Reset Security
              </button>
            </div>
          </SettingsSection>

          {/* Workday & Scheduling */}
          <SettingsSection title="Automation & Scheduling" icon={Clock}>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working From</label>
                <input 
                  type="time" 
                  value={settings.workday.startTime}
                  onChange={(e) => updateSettings({ workday: { ...settings.workday, startTime: e.target.value } })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Working Until</label>
                <input 
                  type="time" 
                  value={settings.workday.endTime}
                  onChange={(e) => updateSettings({ workday: { ...settings.workday, endTime: e.target.value } })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none"
                />
              </div>
            </div>
            
            <div className="space-y-4 pt-2">
               <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold text-slate-800">Weekend Alerts</p>
                  <p className="text-[10px] text-slate-400 font-medium">Allow system notifications on non-business days</p>
                </div>
                <Toggle checked={settings.workday.weekendsEnabled} onChange={() => updateSettings({ workday: { ...settings.workday, weekendsEnabled: !settings.workday.weekendsEnabled } })} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Task Delivery Time</label>
                <select 
                  value={settings.workday.defaultReminderTime}
                  onChange={(e) => updateSettings({ workday: { ...settings.workday, defaultReminderTime: e.target.value } })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none"
                >
                  <option value="08:00">08:00 AM (Early Focus)</option>
                  <option value="09:00">09:00 AM (Start of Day)</option>
                  <option value="10:00">10:00 AM (Standard)</option>
                  <option value="13:00">01:00 PM (Post-Lunch)</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>

        {/* Right Col */}
        <div className="space-y-8">
          {/* Notification Engine */}
          <SettingsSection title="Notification Engine" icon={Bell} badge="ACTIVE">
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => updateSettings({ notifications: { ...settings.notifications, inApp: !settings.notifications.inApp } })}
                className={`p-4 rounded-2xl border transition-all text-left ${settings.notifications.inApp ? 'bg-blue-50 border-blue-100' : 'bg-slate-50 border-transparent'}`}
              >
                <Smartphone className={`w-5 h-5 mb-3 ${settings.notifications.inApp ? 'text-blue-600' : 'text-slate-300'}`} />
                <p className="text-xs font-black uppercase tracking-widest mb-1">In-App</p>
                <p className="text-[10px] text-slate-500 font-medium">{settings.notifications.inApp ? 'Enabled' : 'Paused'}</p>
              </button>
              <button 
                onClick={() => updateSettings({ notifications: { ...settings.notifications, email: !settings.notifications.email } })}
                className={`p-4 rounded-2xl border transition-all text-left ${settings.notifications.email ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-transparent'}`}
              >
                <Mail className={`w-5 h-5 mb-3 ${settings.notifications.email ? 'text-indigo-600' : 'text-slate-300'}`} />
                <p className="text-xs font-black uppercase tracking-widest mb-1">Email</p>
                <p className="text-[10px] text-slate-500 font-medium">{settings.notifications.email ? 'Enabled' : 'Paused'}</p>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Event Categories</p>
              {(Object.keys(settings.notifications.categories) as Array<keyof typeof settings.notifications.categories>).map(cat => (
                <div key={cat} className="flex items-center justify-between group">
                  <span className="text-sm font-bold text-slate-600 capitalize">{cat} Lifecycle</span>
                  <Toggle checked={settings.notifications.categories[cat]} onChange={() => handleToggleNotif(cat)} />
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-50">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-1">Reminder Intervals (New Policies)</p>
              <div className="flex flex-wrap gap-2">
                {settings.defaults.reminderIntervals.map(interval => (
                  <div key={interval} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl">
                    <span className="text-xs font-black">{interval}d</span>
                    <button onClick={() => removeInterval(interval)} className="hover:text-rose-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
                <button 
                  onClick={addInterval}
                  className="px-3 py-1.5 border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </SettingsSection>

          {/* Sync & Integrity */}
          <SettingsSection title="Data Source & Sync" icon={Database}>
             <div className="p-5 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100/50">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900">Google Sheets Connection</p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">STATUS: AUTHENTICATED</p>
                </div>
              </div>
              <button 
                onClick={handleSync}
                disabled={isSyncing}
                className={`p-3 bg-white text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm ${isSyncing ? 'animate-spin' : 'active:scale-95'}`}
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800">Auto-Calculate Status</p>
                  <p className="text-[10px] text-slate-400 font-medium">Recalculate policy health daily based on expiry date</p>
                </div>
                <Toggle checked={settings.defaults.autoCalculateStatus} onChange={() => updateSettings({ defaults: { ...settings.defaults, autoCalculateStatus: !settings.defaults.autoCalculateStatus } })} />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Business Line</label>
                <select 
                  value={settings.defaults.defaultCategory}
                  onChange={(e) => updateSettings({ defaults: { ...settings.defaults, defaultCategory: e.target.value as PolicyCategory } })}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold appearance-none"
                >
                  {Object.values(PolicyCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4">Last 3 Sync Events</p>
               <div className="space-y-2">
                 {syncLogs.slice(0, 3).map(log => (
                   <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Success' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className="text-[10px] font-bold text-slate-600 capitalize">{log.status}</span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                   </div>
                 ))}
               </div>
            </div>
          </SettingsSection>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button 
          className="flex items-center gap-3 px-10 py-5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all border border-rose-100 shadow-xl shadow-rose-100/20 active:scale-95 group"
        >
          <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Terminate Current Session
        </button>
      </div>

      {/* Password Reset Modal Overlay */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Secure Password Reset</h2>
              <button onClick={() => setShowPasswordModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-[11px] font-bold text-amber-800 leading-relaxed">
                Changing your password will immediately sign you out of all other active sessions and devices for security.
              </p>
            </div>

            <form className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Current Password</label>
                <input type="password" placeholder="••••••••" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">New Password</label>
                <input type="password" placeholder="Min 8 characters" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Confirm New Password</label>
                <input type="password" placeholder="Repeat password" className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/10" />
              </div>
              <button 
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest mt-4 shadow-xl shadow-slate-200"
              >
                Apply New Credentials
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
