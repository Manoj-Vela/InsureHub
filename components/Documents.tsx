
import React from 'react';
import { useApp } from '../store/AppContext';
import { 
  Folder, 
  Search, 
  Upload, 
  MoreVertical, 
  File, 
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { DocumentStatus } from '../types';

const StatusPill: React.FC<{ status: DocumentStatus }> = ({ status }) => {
  const styles = {
    [DocumentStatus.VALID]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [DocumentStatus.MISSING]: 'bg-rose-50 text-rose-600 border-rose-100',
    [DocumentStatus.INVALID]: 'bg-amber-50 text-amber-600 border-amber-100',
    [DocumentStatus.PENDING]: 'bg-slate-50 text-slate-500 border-slate-100',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
};

export const Documents: React.FC = () => {
  const { documents, clients } = useApp();

  const folders = [
    { name: 'Policy Files', count: documents.filter(d => d.type === 'Policy File').length, size: '256 MB' },
    { name: 'ID Documents', count: documents.filter(d => d.type === 'ID Document').length, size: '512 MB' },
    { name: 'Vehicle Reg', count: documents.filter(d => d.type === 'Registration').length, size: '64 MB' },
    { name: 'Others', count: documents.filter(d => d.type === 'Report').length, size: '32 MB' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-500 mt-1">Shared storage and compliance management.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-2xl font-bold transition-all">
            <Upload className="w-5 h-5" />
            <span>Bulk Import</span>
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-200">
            <Plus className="w-5 h-5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map(folder => (
          <button key={folder.name} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                <Folder className="w-6 h-6 fill-current" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
            <h3 className="font-bold text-slate-900">{folder.name}</h3>
            <p className="text-xs text-slate-400 mt-1">{folder.count} files • {folder.size}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="font-bold text-lg">Recent Files</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter files..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4">File Info</th>
                <th className="px-6 py-4">Linked Client</th>
                <th className="px-6 py-4">Upload Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {documents.map(doc => {
                const client = clients.find(c => c.id === doc.clientId);
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                          <File className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{doc.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <img src={client?.avatar} className="w-6 h-6 rounded-full" alt="" />
                        <span className="text-sm font-medium text-slate-700">{client?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {doc.uploadDate}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><ExternalLink className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
