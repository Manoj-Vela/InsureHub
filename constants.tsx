
import { Client, Policy, PolicyCategory, PolicyStatus, Document, DocumentStatus, DocumentType } from './types';

export const INITIAL_CLIENTS: Client[] = [
  // Added missing businessId, source, createdAt and updatedAt properties
  { id: 'c1', businessId: '#80001', name: 'Michael Scott', phone: '+1234567890', email: 'michael@dundermifflin.com', notes: 'Prefers morning calls.', lastContacted: '2023-10-15', avatar: 'https://picsum.photos/seed/michael/200', source: 'Dashboard', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: 'c2', businessId: '#80002', name: 'Pam Beesly', phone: '+1234567891', email: 'pam@dundermifflin.com', notes: 'Check on vehicle insurance renewal.', lastContacted: '2023-11-01', avatar: 'https://picsum.photos/seed/pam/200', source: 'Dashboard', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: 'c3', businessId: '#80003', name: 'Jim Halpert', phone: '+1234567892', email: 'jim@dundermifflin.com', notes: 'Interested in Mutual Funds.', lastContacted: '2023-11-20', avatar: 'https://picsum.photos/seed/jim/200', source: 'Dashboard', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: 'c4', businessId: '#80004', name: 'Dwight Schrute', phone: '+1234567893', email: 'dwight@beets.com', notes: 'Beet farm insurance needs review.', lastContacted: '2023-12-05', avatar: 'https://picsum.photos/seed/dwight/200', source: 'Dashboard', createdAt: '2023-01-01', updatedAt: '2023-01-01' },
];

export const INITIAL_POLICIES: Policy[] = [
  // Added missing createdAt and updatedAt properties
  { id: 'p1', policyNumber: '#35698', clientId: 'c1', category: PolicyCategory.HEALTH, provider: 'Star Health', startDate: '2023-01-01', expiryDate: '2024-01-01', premium: 12000, status: PolicyStatus.EXPIRING, createdAt: '2023-01-01', updatedAt: '2023-01-01' },
  { id: 'p2', policyNumber: '#35697', clientId: 'c2', category: PolicyCategory.VEHICLE, provider: 'HDFC Ergo', startDate: '2023-05-15', expiryDate: '2024-05-15', premium: 8500, status: PolicyStatus.ACTIVE, createdAt: '2023-05-15', updatedAt: '2023-05-15' },
  { id: 'p3', policyNumber: '#35695', clientId: 'c3', category: PolicyCategory.TERM, provider: 'LIC', startDate: '2020-02-10', expiryDate: '2050-02-10', premium: 25000, status: PolicyStatus.ACTIVE, createdAt: '2020-02-10', updatedAt: '2020-02-10' },
  { id: 'p4', policyNumber: '#35692', clientId: 'c4', category: PolicyCategory.HEALTH, provider: 'Niva Bupa', startDate: '2023-11-01', expiryDate: '2024-11-01', premium: 15000, status: PolicyStatus.ACTIVE, createdAt: '2023-11-01', updatedAt: '2023-11-01' },
  { id: 'p5', policyNumber: '#35700', clientId: 'c1', category: PolicyCategory.MUTUAL_FUND, provider: 'ICICI Prudential', startDate: '2023-06-01', expiryDate: '2033-06-01', premium: 5000, status: PolicyStatus.ACTIVE, createdAt: '2023-06-01', updatedAt: '2023-06-01' },
];

export const INITIAL_DOCUMENTS: Document[] = [
  { id: 'd1', policyId: 'p1', clientId: 'c1', type: DocumentType.POLICY_FILE, fileName: 'Health_Policy.pdf', source: 'Agent', uploadDate: '2023-01-02', status: DocumentStatus.VALID, size: '2.4 MB' },
  { id: 'd2', policyId: 'p2', clientId: 'c2', type: DocumentType.REGISTRATION, fileName: 'Car_Reg.png', source: 'Client', uploadDate: '2023-05-16', status: DocumentStatus.INVALID, size: '0.8 MB' },
  { id: 'd3', policyId: 'p3', clientId: 'c3', type: DocumentType.ID, fileName: 'Pan_Card.pdf', source: 'Auto-import', uploadDate: '2023-02-11', status: DocumentStatus.VALID, size: '1.2 MB' },
  { id: 'd4', policyId: 'p1', clientId: 'c1', type: DocumentType.REPORT, fileName: 'Medical_Checkup.pdf', source: 'Agent', uploadDate: '2023-01-05', status: DocumentStatus.MISSING, size: '0 MB' },
];
