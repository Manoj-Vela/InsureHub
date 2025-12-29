
import React from 'react';
import { 
  Database, 
  RefreshCw, 
  ShieldCheck, 
  GitBranch, 
  Server, 
  Smartphone, 
  Cloud, 
  ArrowRight,
  HardDrive,
  Users,
  FileText
} from 'lucide-react';

const SchemaTable: React.FC<{ title: string; fields: string[]; icon: any }> = ({ title, fields, icon: Icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
      <Icon className="w-4 h-4 text-blue-600" />
      <h4 className="font-bold text-sm text-slate-800 uppercase tracking-wider">{title}</h4>
    </div>
    <div className="p-4 space-y-2">
      {fields.map((f, i) => (
        <div key={i} className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-600">{f.split(':')[0]}</span>
          <span className="text-slate-400 italic">{f.split(':')[1]}</span>
        </div>
      ))}
    </div>
  </div>
);

export const SystemDesign: React.FC = () => {
  return (
    <div className="space-y-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Architecture</h1>
          <p className="text-slate-500 mt-1">Infrastructure and Database Blueprint for PolicyPilot.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          SYNC ACTIVE (G-SHEETS)
        </div>
      </div>

      {/* 1. Database Schema View */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" /> Relational Database Schema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SchemaTable 
            title="Clients" 
            icon={Users}
            fields={['id: UUID (PK)', 'name: VARCHAR', 'phone: STRING', 'email: STRING', 'last_contact: DATE']} 
          />
          <SchemaTable 
            title="Policies" 
            icon={ShieldCheck}
            fields={['id: UUID (PK)', 'policy_no: INDEX', 'client_id: FK', 'premium: NUMERIC', 'expiry: DATE']} 
          />
          <SchemaTable 
            title="Documents" 
            icon={FileText}
            fields={['id: UUID (PK)', 'policy_id: FK', 'client_id: FK', 's3_uri: URL', 'status: ENUM']} 
          />
          <SchemaTable 
            title="Reminders" 
            icon={RefreshCw}
            fields={['id: UUID (PK)', 'policy_id: FK', 'type: ENUM', 'sent_at: TIMESTAMP', 'status: ENUM']} 
          />
        </div>
      </section>

      {/* 2. Architecture Diagram */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-indigo-600" /> Application Stack
        </h2>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm overflow-x-auto">
          <div className="min-w-[800px] flex justify-between items-center relative">
            {/* Frontend */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">Frontend</p>
                <p className="text-[10px] text-slate-400">React + Tailwind</p>
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-slate-200" />

            {/* API Layer */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Server className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">Core Service</p>
                <p className="text-[10px] text-slate-400">Node/Go API</p>
              </div>
            </div>

            <ArrowRight className="w-8 h-8 text-slate-200" />

            {/* Storage/DB */}
            <div className="flex flex-col items-center gap-3 z-10">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Database className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="font-bold text-sm">PostgreSQL</p>
                <p className="text-[10px] text-slate-400">Source of Truth</p>
              </div>
            </div>

            <div className="flex flex-col gap-12">
               {/* G-Sheets Sync */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <RefreshCw className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">G-Sheets Worker</p>
                  <p className="text-[10px] text-slate-400">Two-way Sync</p>
                </div>
              </div>
              {/* File Storage */}
              <div className="flex flex-col items-center gap-3 z-10">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <Cloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm">AWS S3 / Firebase</p>
                  <p className="text-[10px] text-slate-400">Document Store</p>
                </div>
              </div>
            </div>
            
            {/* Background connecting lines simulated with CSS */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10"></div>
          </div>
        </div>
      </section>

      {/* 3. Sync Strategy */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-3xl p-8 text-white">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-blue-400" /> Synchronization Logic
          </h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 flex items-center justify-center font-bold">1</div>
              <div>
                <p className="font-semibold text-sm">Manual Entry</p>
                <p className="text-xs text-slate-400 mt-1">Writes directly to PostgreSQL. Triggers webhook to update Google Sheet immediately.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 flex items-center justify-center font-bold">2</div>
              <div>
                <p className="font-semibold text-sm">Bulk Import</p>
                <p className="text-xs text-slate-400 mt-1">CSV/XLSX parsed via worker. Uses Policy Number as UPSERT key to prevent duplicates.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex-shrink-0 flex items-center justify-center font-bold">3</div>
              <div>
                <p className="font-semibold text-sm">Continuous Sync</p>
                <p className="text-xs text-slate-400 mt-1">Polling service checks G-Sheets every 5 mins for external updates. Diffing logic applied.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Compliance & Integrity
          </h3>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold">Unique Identifiers</p>
                  <p className="text-[10px] text-slate-400">UUIDs for internal, Policy Number for public</p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg">ACTIVE</div>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold">Soft Deletes</p>
                  <p className="text-[10px] text-slate-400">Records never removed, only flagged as inactive</p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg">ENFORCED</div>
             </div>
             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div>
                  <p className="text-sm font-bold">Audit Logs</p>
                  <p className="text-[10px] text-slate-400">Track changes to policy status and document validation</p>
                </div>
                <div className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-lg">LOGGING</div>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};
