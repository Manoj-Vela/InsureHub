
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { 
  LayoutDashboard, Users, ShieldCheck, FileText, Bell, PieChart, 
  Search, BellRing, Settings, Network, ClipboardList, X, User, 
  Shield, ChevronRight, ArrowRight, CheckCircle2, AlertCircle, Trash2
} from 'lucide-react';
import { Client, Policy, CRMNotification } from '../types';

const NavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Work', path: '/work', icon: ClipboardList },
  { name: 'Clients', path: '/clients', icon: Users },
  { name: 'Policies', path: '/policies', icon: ShieldCheck },
  { name: 'Documents', path: '/documents', icon: FileText },
  { name: 'Reminders', path: '/reminders', icon: Bell },
  { name: 'Insights', path: '/insights', icon: PieChart },
  { name: 'Architecture', path: '/architecture', icon: Network },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clients, policies, notifications, markNotificationRead, clearNotifications } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<{ clients: Client[], policies: Policy[] }>({ clients: [], policies: [] });
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length < 2) {
        setSearchResults({ clients: [], policies: [] });
        return;
      }
      const q = searchQuery.toLowerCase();
      const matchedClients = clients.filter(c => 
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || 
        c.phone.includes(q) || c.businessId.toLowerCase().includes(q)
      ).slice(0, 5);
      const matchedPolicies = policies.filter(p => 
        p.policyNumber.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || 
        p.provider.toLowerCase().includes(q)
      ).slice(0, 5);
      setSearchResults({ clients: matchedClients, policies: matchedPolicies });
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, clients, policies]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowSearchResults(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalResultsCount = searchResults.clients.length + searchResults.policies.length;

  const navigateToResult = (path: string) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
    setSelectedIndex(-1);
  };

  const handleNotifClick = (n: CRMNotification) => {
    markNotificationRead(n.id);
    if (n.link) navigate(n.link);
    setShowNotifications(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row pb-20 md:pb-0">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 sticky top-0 h-screen p-4">
        <div className="flex items-center gap-2 px-4 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-100">
            <ShieldCheck className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">PolicyPilot</span>
        </div>
        <nav className="flex-1 space-y-1">
          {NavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </nav>
        <div className="pt-4 mt-auto border-t border-slate-100">
          <div className="flex items-center gap-3 px-4 py-2">
            <img src="https://picsum.photos/seed/agent/100" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt="Agent" />
            <div>
              <p className="text-sm font-bold text-slate-800 leading-none">Anna D.</p>
              <p className="text-xs text-slate-400 mt-1">Manager</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-blue-900">PolicyPilot</span>
          </div>

          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); setSelectedIndex(-1); }}
              onFocus={() => setShowSearchResults(true)}
              placeholder="Search clients, policies, or ID..." 
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            {showSearchResults && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden max-h-[400px] overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="py-2">
                  {searchResults.clients.length > 0 && (
                    <div className="mb-2">
                      <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Clients</div>
                      {searchResults.clients.map((client) => (
                        <button key={client.id} onClick={() => navigateToResult(`/clients/${client.id}`)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50">
                          <img src={client.avatar} className="w-8 h-8 rounded-lg bg-slate-100 object-cover" alt="" />
                          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{client.name}</p></div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.policies.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">Policies</div>
                      {searchResults.policies.map((policy) => (
                        <button key={policy.id} onClick={() => navigateToResult(`/policies/${policy.id}`)} className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Shield className="w-4 h-4" /></div>
                          <div className="flex-1 min-w-0"><p className="text-sm font-bold text-slate-900 truncate">{policy.policyNumber}</p></div>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                        </button>
                      ))}
                    </div>
                  )}
                  {totalResultsCount === 0 && <div className="p-8 text-center text-slate-400 text-sm">No results found</div>}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 hover:bg-slate-100 rounded-full transition-all ${showNotifications ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}
              >
                <BellRing className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white rounded-full border-2 border-white text-[8px] font-black flex items-center justify-center animate-in zoom-in">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute top-full right-0 mt-2 w-[320px] sm:w-[380px] bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                  <div className="p-5 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    <div className="flex gap-2">
                       <button onClick={clearNotifications} className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1">
                         <Trash2 className="w-3 h-3" /> CLEAR
                       </button>
                    </div>
                  </div>
                  <div className="max-h-[450px] overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center text-slate-400 italic text-sm">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <button 
                          key={n.id} 
                          onClick={() => handleNotifClick(n)}
                          className={`w-full p-5 text-left flex gap-4 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}
                        >
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                            n.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {n.type === 'Policy' ? <Shield className="w-4 h-4" /> : 
                             n.type === 'Client' ? <User className="w-4 h-4" /> :
                             n.type === 'Document' ? <FileText className="w-4 h-4" /> :
                             <BellRing className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                              <p className={`text-sm font-bold truncate ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>{n.title}</p>
                              {!n.read && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{n.message}</p>
                            <p className="text-[9px] font-black text-slate-300 uppercase mt-2">{new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {n.type}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <button onClick={() => setShowNotifications(false)} className="w-full p-4 text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-colors uppercase tracking-widest border-t border-slate-50">
                      Close Panel
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button onClick={() => navigate('/settings')} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all">
              <Settings className="w-5 h-5" />
            </button>
            <NavLink to="/work" className="md:flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all hidden shadow-lg shadow-slate-200">
              <ClipboardList className="w-4 h-4" />
              <span>Today's Work</span>
            </NavLink>
          </div>
        </header>

        <div className="p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex justify-between items-center z-50 overflow-x-auto hide-scrollbar">
        {NavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 py-1 min-w-[70px] transition-all ${
                isActive ? 'text-blue-600 font-bold scale-110' : 'text-slate-400'
              }`
            }
          >
            <item.icon className={`w-5 h-5`} />
            <span className="text-[9px] mt-1 uppercase tracking-tight">{item.name}</span>
          </NavLink>
        ))}
        <NavLink
            to="/settings"
            className={({ isActive }) => 
              `flex flex-col items-center justify-center flex-1 py-1 min-w-[70px] transition-all ${
                isActive ? 'text-blue-600 font-bold scale-110' : 'text-slate-400'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] mt-1 uppercase tracking-tight">Setup</span>
        </NavLink>
      </nav>
    </div>
  );
};
