
export enum PolicyStatus {
  ACTIVE = 'Active',
  EXPIRING = 'Expiring',
  EXPIRED = 'Expired',
  RENEWED = 'Renewed',
  CANCELLED = 'Cancelled'
}

export enum PolicyCategory {
  HEALTH = 'Health Insurance',
  TERM = 'Term Insurance',
  VEHICLE = 'Vehicle Insurance',
  MUTUAL_FUND = 'Mutual Fund',
  OTHER = 'Other'
}

export enum DocumentStatus {
  VALID = 'Valid',
  MISSING = 'Missing',
  INVALID = 'Invalid',
  PENDING = 'Pending'
}

export enum DocumentType {
  ID = 'ID Document',
  POLICY_FILE = 'Policy File',
  REGISTRATION = 'Registration',
  REPORT = 'Report'
}

export interface InteractionLog {
  id: string;
  clientId: string;
  date: string;
  type: 'Call' | 'Email' | 'Meeting' | 'WhatsApp';
  note: string;
  agentId: string;
}

export interface Client {
  id: string; 
  businessId: string; 
  name: string;
  phone: string;
  email: string;
  dob?: string;
  address?: string;
  notes: string;
  lastContacted: string;
  avatar: string;
  source: 'Dashboard' | 'Bulk Import' | 'Google Sheets';
  createdAt: string;
  updatedAt: string;
}

export interface Policy {
  id: string;
  policyNumber: string;
  clientId: string;
  category: PolicyCategory;
  provider: string;
  startDate: string;
  expiryDate: string;
  premium: number;
  status: PolicyStatus;
  lastReminderSent?: string;
  snoozedUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  policyId: string;
  clientId: string;
  type: DocumentType;
  fileName: string;
  source: 'Agent' | 'Client' | 'Auto-import';
  uploadDate: string;
  expiryDate?: string;
  status: DocumentStatus;
  size: string;
}

export interface Reminder {
  id: string;
  policyId: string;
  clientId: string;
  scheduledDate: string;
  sentDate?: string;
  type: 'Email' | 'WhatsApp' | 'Push';
  daysBefore: number;
  status: 'Queued' | 'Sent' | 'Failed';
  content: string;
  retryCount: number;
}

export interface CRMTask {
  id: string;
  clientId: string;
  type: 'Renewal' | 'Follow-up' | 'Documents' | 'Relationship';
  reason: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'Completed' | 'Snoozed';
  note?: string;
  createdAt: string;
}

export interface SyncLog {
  id: string;
  source: 'Google Sheets' | 'Manual' | 'Bulk';
  timestamp: string;
  status: 'Success' | 'Partial' | 'Failed';
  recordsProcessed: number;
  reason?: string;
}

export interface CRMNotification {
  id: string;
  type: 'Policy' | 'Client' | 'Document' | 'Task' | 'Sync';
  title: string;
  message: string;
  date: string;
  read: boolean;
  link?: string;
  priority: 'High' | 'Normal';
}

export interface AgentSettings {
  profile: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatar: string;
  };
  notifications: {
    inApp: boolean;
    email: boolean;
    whatsapp: boolean;
    categories: {
      policy: boolean;
      client: boolean;
      document: boolean;
      task: boolean;
      sync: boolean;
    };
  };
  workday: {
    startTime: string;
    endTime: string;
    weekendsEnabled: boolean;
    defaultReminderTime: string;
  };
  defaults: {
    reminderIntervals: number[];
    autoCalculateStatus: boolean;
    defaultCategory: PolicyCategory;
  };
}
