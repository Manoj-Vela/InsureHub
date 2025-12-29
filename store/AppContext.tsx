
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Client, Policy, Document, Reminder, PolicyStatus, DocumentStatus,
  SyncLog, PolicyCategory, DocumentType, InteractionLog, CRMTask,
  CRMNotification, AgentSettings
} from '../types';
import { INITIAL_CLIENTS, INITIAL_POLICIES, INITIAL_DOCUMENTS } from '../constants';

interface AppContextType {
  clients: Client[];
  policies: Policy[];
  documents: Document[];
  reminders: Reminder[];
  tasks: CRMTask[];
  syncLogs: SyncLog[];
  interactionLogs: InteractionLog[];
  notifications: CRMNotification[];
  settings: AgentSettings;
  addClientWithPolicy: (
    client: Omit<Client, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'avatar' | 'lastContacted' | 'source'>,
    policy?: Omit<Policy, 'id' | 'clientId' | 'createdAt' | 'updatedAt' | 'status'>,
    docs?: Array<Omit<Document, 'id' | 'clientId' | 'uploadDate' | 'status' | 'source'>>
  ) => { success: boolean; clientId?: string; error?: string };
  updateClient: (id: string, updates: Partial<Client>) => { success: boolean; error?: string };
  markClientContacted: (id: string, type?: InteractionLog['type'], note?: string) => void;
  addPolicy: (
    policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>,
    docs?: Array<Omit<Document, 'id' | 'clientId' | 'policyId' | 'uploadDate' | 'status' | 'source'>>
  ) => void;
  updatePolicy: (id: string, updates: Partial<Policy>) => void;
  snoozePolicy: (policyId: string, until: string | null) => void;
  addDocument: (doc: Omit<Document, 'id' | 'uploadDate' | 'status'>) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (docId: string, status: DocumentStatus) => void;
  renewPolicy: (policyId: string) => void;
  sendPolicyReminder: (policyId: string, type: 'Email' | 'WhatsApp') => void;
  scheduleTask: (task: Omit<CRMTask, 'id' | 'createdAt' | 'status'>) => void;
  completeTask: (taskId: string) => void;
  triggerSync: () => Promise<void>;
  runAutomationEngine: () => void;
  markReminderAsSent: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  updateSettings: (updates: Partial<AgentSettings>) => void;
}

const DEFAULT_SETTINGS: AgentSettings = {
  profile: {
    name: 'Anna Dewitt',
    email: 'anna@policypilot.io',
    phone: '+1 (555) 012-3456',
    role: 'Senior Agent',
    avatar: 'https://picsum.photos/seed/agent/100',
  },
  notifications: {
    inApp: true,
    email: true,
    whatsapp: false,
    categories: {
      policy: true,
      client: true,
      document: true,
      task: true,
      sync: true,
    },
  },
  workday: {
    startTime: '09:00',
    endTime: '18:00',
    weekendsEnabled: false,
    defaultReminderTime: '10:00',
  },
  defaults: {
    reminderIntervals: [30, 15, 7],
    autoCalculateStatus: true,
    defaultCategory: PolicyCategory.HEALTH,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [documents, setDocuments] = useState<Document[]>(INITIAL_DOCUMENTS);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [tasks, setTasks] = useState<CRMTask[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [interactionLogs, setInteractionLogs] = useState<InteractionLog[]>([]);
  const [notifications, setNotifications] = useState<CRMNotification[]>([]);
  const [settings, setSettings] = useState<AgentSettings>(DEFAULT_SETTINGS);

  const addNotification = useCallback((notif: Omit<CRMNotification, 'id' | 'date' | 'read'>) => {
    const now = new Date();
    const day = now.getDay();
    const isWeekend = day === 0 || day === 6;

    if (isWeekend && !settings.workday.weekendsEnabled) return;

    const categoryKey = notif.type.toLowerCase() as keyof AgentSettings['notifications']['categories'];
    if (!settings.notifications.inApp || (settings.notifications.categories[categoryKey] === false)) return;

    const newNotif: CRMNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, [settings]);

  const addDocument = useCallback((doc: Omit<Document, 'id' | 'uploadDate' | 'status'>) => {
    const timestamp = new Date().toISOString();
    const newDoc: Document = {
      ...doc,
      id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      uploadDate: timestamp.split('T')[0],
      status: DocumentStatus.VALID // Assume valid on manual agent upload for now
    };
    setDocuments(prev => [newDoc, ...prev]);
  }, []);

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const addClientWithPolicy = (
    clientData: Omit<Client, 'id' | 'businessId' | 'createdAt' | 'updatedAt' | 'avatar' | 'lastContacted' | 'source'>,
    policyData?: Omit<Policy, 'id' | 'clientId' | 'createdAt' | 'updatedAt' | 'status'>,
    docs?: Array<Omit<Document, 'id' | 'clientId' | 'uploadDate' | 'status' | 'source'>>
  ) => {
    const exists = clients.some(c => c.phone === clientData.phone);
    if (exists) return { success: false, error: 'A client with this phone number already exists.' };

    const timestamp = new Date().toISOString();
    const newClientId = `c${Date.now()}`;

    // Find profile photo in docs if any
    const profileDoc = docs?.find(d => d.type === DocumentType.PROFILE_PHOTO);
    const avatar = profileDoc ? `https://picsum.photos/seed/${profileDoc.fileName}/200` : `https://picsum.photos/seed/${newClientId}/200`;

    const newClient: Client = {
      ...clientData,
      id: newClientId,
      businessId: `#${Math.floor(Math.random() * 90000) + 10000}`,
      avatar: avatar,
      lastContacted: timestamp.split('T')[0],
      source: 'Dashboard',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    setClients(prev => [newClient, ...prev]);

    let newPolicyId: string | undefined;
    if (policyData && policyData.policyNumber) {
      newPolicyId = `p${Date.now()}`;
      const newPolicy: Policy = {
        ...policyData,
        id: newPolicyId,
        clientId: newClientId,
        status: PolicyStatus.ACTIVE,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      setPolicies(prev => [newPolicy, ...prev]);
    }

    if (docs && docs.length > 0) {
      const newDocs: Document[] = docs.map(d => ({
        ...d,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        clientId: newClientId,
        policyId: d.type === DocumentType.POLICY_PDF || d.type === DocumentType.VEHICLE_RC || d.type === DocumentType.MEDICAL_REPORT ? newPolicyId : undefined,
        uploadDate: timestamp.split('T')[0],
        status: DocumentStatus.VALID,
        source: 'Agent'
      }));
      setDocuments(prev => [...newDocs, ...prev]);
    }

    addNotification({
      type: 'Client',
      title: 'New Client Added',
      message: `${newClient.name} has been added to your portfolio.`,
      priority: 'Normal',
      link: `/clients/${newClient.id}`,
    });

    return { success: true, clientId: newClientId };
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
    return { success: true };
  };

  const markClientContacted = (id: string, type: InteractionLog['type'] = 'Call', note: string = 'Follow-up completed') => {
    const now = new Date().toISOString();
    setClients(prev => prev.map(c => c.id === id ? { ...c, lastContacted: now.split('T')[0], updatedAt: now } : c));
    const newLog: InteractionLog = { id: `log-${Date.now()}`, clientId: id, date: now, type, note, agentId: 'agent-1' };
    setInteractionLogs(prev => [newLog, ...prev]);
  };

  const addPolicy = (
    newPolicyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>,
    docs?: Array<Omit<Document, 'id' | 'clientId' | 'policyId' | 'uploadDate' | 'status' | 'source'>>
  ) => {
    const timestamp = new Date().toISOString();
    const newPolicyId = `p${Date.now()}`;
    const policy: Policy = { ...newPolicyData, id: newPolicyId, createdAt: timestamp, updatedAt: timestamp };
    setPolicies(prev => [policy, ...prev]);

    if (docs && docs.length > 0) {
      const newDocs: Document[] = docs.map(d => ({
        ...d,
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        clientId: policy.clientId,
        policyId: newPolicyId,
        uploadDate: timestamp.split('T')[0],
        status: DocumentStatus.VALID,
        source: 'Agent'
      }));
      setDocuments(prev => [...newDocs, ...prev]);
    }

    addNotification({
      type: 'Policy',
      title: 'New Policy Linked',
      message: `Policy #${policy.policyNumber} has been added for a client.`,
      priority: 'Normal',
      link: `/policies/${policy.id}`,
    });
  };

  const completeTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      markClientContacted(task.clientId, 'Call', `Completed task: ${task.reason}`);
      addNotification({
        type: 'Task',
        title: 'Task Completed',
        message: `You finished: ${task.reason}`,
        priority: 'Normal',
      });
    }
  };

  const scheduleTask = (task: Omit<CRMTask, 'id' | 'createdAt' | 'status'>) => {
    const newTask: CRMTask = { ...task, id: `task-${Date.now()}`, status: 'Pending', createdAt: new Date().toISOString() };
    setTasks(prev => [newTask, ...prev]);
    addNotification({
      type: 'Task',
      title: 'Task Scheduled',
      message: `New ${task.type} set for ${task.dueDate}`,
      priority: 'Normal',
      link: '/work',
    });
  };

  const updatePolicy = (id: string, updates: Partial<Policy>) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p));
  };

  const snoozePolicy = (id: string, until: string | null) => {
    setPolicies(prev => prev.map(p => p.id === id ? { ...p, snoozedUntil: until || undefined, updatedAt: new Date().toISOString() } : p));
    if (until) {
      addNotification({
        type: 'Task',
        title: 'Renewal Snoozed',
        message: `Policy renewal reminder paused until ${until}`,
        priority: 'Normal',
      });
    }
  };

  const updateDocumentStatus = (docId: string, status: DocumentStatus) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status } : d));
    if (status === DocumentStatus.INVALID || status === DocumentStatus.MISSING) {
      const doc = documents.find(d => d.id === docId);
      addNotification({
        type: 'Document',
        title: 'Document Issue Flagged',
        message: `${doc?.fileName} is now marked as ${status}.`,
        priority: 'High',
        link: '/documents',
      });
    }
  };

  const renewPolicy = (policyId: string) => {
    setPolicies(prev => prev.map(p => {
      if (p.id === policyId) {
        const oldExpiry = new Date(p.expiryDate);
        const newExpiry = new Date(oldExpiry.setFullYear(oldExpiry.getFullYear() + 1));
        const updated = {
          ...p,
          expiryDate: newExpiry.toISOString().split('T')[0],
          status: PolicyStatus.ACTIVE,
          lastReminderSent: undefined,
          snoozedUntil: undefined,
          updatedAt: new Date().toISOString(),
        };
        addNotification({
          type: 'Policy',
          title: 'Policy Renewed',
          message: `Policy #${p.policyNumber} has been successfully renewed.`,
          priority: 'Normal',
          link: `/policies/${p.id}`,
        });
        return updated;
      }
      return p;
    }));
  };

  const sendPolicyReminder = (policyId: string, type: 'Email' | 'WhatsApp') => {
    const timestamp = new Date().toISOString();
    setPolicies(prev => prev.map(p => p.id === policyId ? { ...p, lastReminderSent: timestamp, updatedAt: timestamp } : p));
    const policy = policies.find(p => p.id === policyId);
    if (policy) {
      const client = clients.find(c => c.id === policy.clientId);
      const newRem: Reminder = {
        id: `rem-${Date.now()}`,
        policyId,
        clientId: policy.clientId,
        scheduledDate: timestamp.split('T')[0],
        sentDate: timestamp,
        type: type === 'Email' ? 'Email' : 'WhatsApp',
        daysBefore: 0,
        status: 'Sent',
        content: `Reminder sent to ${client?.name} regarding policy ${policy.policyNumber}`,
        retryCount: 0
      };
      setReminders(prev => [newRem, ...prev]);
    }
  };

  const triggerSync = async () => {
    const success = Math.random() > 0.05;
    const newLog: SyncLog = {
      id: Math.random().toString(36).substr(2, 9),
      source: 'Google Sheets',
      timestamp: new Date().toISOString(),
      status: success ? 'Success' : 'Failed',
      recordsProcessed: success ? Math.floor(Math.random() * 5) + 1 : 0,
      reason: success ? undefined : 'Rate limit exceeded by Google API'
    };
    setSyncLogs(prev => [newLog, ...prev].slice(0, 10));
    addNotification({
      type: 'Sync',
      title: `Sync ${success ? 'Successful' : 'Failed'}`,
      message: success ? `Processed ${newLog.recordsProcessed} updates from Google Sheets.` : 'Check connection settings. Reason: ' + newLog.reason,
      priority: success ? 'Normal' : 'High',
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateSettings = (updates: Partial<AgentSettings>) => {
    console.debug('[PROFILE SYNC] Updating Settings:', {
      prev: settings.profile,
      next: updates.profile,
      timestamp: new Date().toISOString()
    });
    setSettings(prev => ({ ...prev, ...updates }));
    addNotification({
      type: 'Sync',
      title: 'Settings Updated',
      message: 'Your system preferences and profile have been saved successfully.',
      priority: 'Normal',
    });
  };

  useEffect(() => {
    if (!settings.defaults.autoCalculateStatus) return;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysOut = todayStart + (7 * 24 * 60 * 60 * 1000);

    const updatedPolicies = policies.map(p => {
      if (!p.expiryDate) return p.status !== PolicyStatus.EXPIRED ? { ...p, status: PolicyStatus.EXPIRED } : p;
      if (p.status === PolicyStatus.CANCELLED || p.status === PolicyStatus.RENEWED) return p;

      const expiry = new Date(p.expiryDate).getTime();
      let newStatus = p.status;
      if (expiry < todayStart) newStatus = PolicyStatus.EXPIRED;
      else if (expiry >= todayStart && expiry <= sevenDaysOut) newStatus = PolicyStatus.EXPIRING;
      else newStatus = PolicyStatus.ACTIVE;

      return p.status !== newStatus ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p;
    });

    if (JSON.stringify(updatedPolicies) !== JSON.stringify(policies)) setPolicies(updatedPolicies);
  }, [policies, settings.defaults.autoCalculateStatus]);

  return (
    <AppContext.Provider value={{
      clients, policies, documents, reminders, tasks, syncLogs, interactionLogs, notifications, settings,
      addClientWithPolicy, updateClient, markClientContacted, addPolicy, updatePolicy, snoozePolicy,
      addDocument, removeDocument, updateDocumentStatus, renewPolicy, sendPolicyReminder, scheduleTask, completeTask,
      triggerSync, runAutomationEngine: () => { }, markReminderAsSent: () => { },
      markNotificationRead, clearNotifications, updateSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
