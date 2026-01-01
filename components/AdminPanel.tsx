import React, { useState } from 'react';
import { ClientData, FAQItem } from '../types';
import { calculateEligibility } from '../services/calculations';
import { generateClientCommunication } from '../services/geminiService';
import { Button } from './ui/Button';
import { Search, MessageCircle, FileText, CheckCircle, Loader2, Database, AlertTriangle, HelpCircle, Plus, Trash2, Edit } from 'lucide-react';

interface Props {
  clients: ClientData[];
  onUpdateStatus: (id: string, status: ClientData['status']) => void;
  onLogout: () => void;
  // FAQ Props
  faqs: FAQItem[];
  onAddFaq: (q: string, a: string) => void;
  onDeleteFaq: (id: string) => void;
  onEditFaq: (id: string, q: string, a: string) => void;
}

export const AdminPanel: React.FC<Props> = ({ 
  clients, onUpdateStatus, onLogout,
  faqs, onAddFaq, onDeleteFaq, onEditFaq
}) => {
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'FAQ'>('CLIENTS');
  
  // Client State
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // FAQ State
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ q: '', a: '' });

  // --- CLIENT LOGIC ---
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateMessage = async (type: 'EMAIL' | 'WHATSAPP') => {
    if (!selectedClient) return;
    setIsGenerating(true);
    setGeneratedMessage('');
    const results = calculateEligibility(selectedClient);
    const msg = await generateClientCommunication(selectedClient, results, type);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  const getAnalysis = (client: ClientData) => calculateEligibility(client);

  // --- FAQ LOGIC ---
  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingFaqId) {
      onEditFaq(editingFaqId, faqForm.q, faqForm.a);
      setEditingFaqId(null);
    } else {
      onAddFaq(faqForm.q, faqForm.a);
    }
    setFaqForm({ q: '', a: '' });
  };

  const startEditFaq = (faq: FAQItem) => {
    setEditingFaqId(faq.id);
    setFaqForm({ q: faq.question, a: faq.answer });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-indigo-900 text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="font-bold text-xl flex items-center gap-2">
          ApexRefi Admin
        </div>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setActiveTab('CLIENTS')}
            className={`px-3 py-1 rounded-md text-sm ${activeTab === 'CLIENTS' ? 'bg-indigo-700 font-bold' : 'hover:bg-indigo-800'}`}
          >
            Applications
          </button>
          <button 
             onClick={() => setActiveTab('FAQ')}
             className={`px-3 py-1 rounded-md text-sm ${activeTab === 'FAQ' ? 'bg-indigo-700 font-bold' : 'hover:bg-indigo-800'}`}
          >
            Manage FAQ
          </button>
          
          <div className="w-px h-6 bg-indigo-700 mx-2"></div>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-indigo-800 h-8 text-sm px-3">Logout</Button>
        </div>
      </header>

      {/* --- FAQ VIEW --- */}
      {activeTab === 'FAQ' && (
        <div className="p-8 max-w-5xl mx-auto w-full">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-600" />
              {editingFaqId ? 'Edit FAQ Item' : 'Add New FAQ Item'}
            </h2>
            <form onSubmit={handleFaqSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input 
                  type="text" 
                  value={faqForm.q} 
                  onChange={e => setFaqForm(prev => ({ ...prev, q: e.target.value }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. How long does the process take?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Answer</label>
                <textarea 
                  value={faqForm.a} 
                  onChange={e => setFaqForm(prev => ({ ...prev, a: e.target.value }))}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none h-24"
                  placeholder="Enter the detailed answer..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingFaqId ? 'Update FAQ' : 'Add FAQ'}</Button>
                {editingFaqId && (
                  <Button type="button" variant="ghost" onClick={() => { setEditingFaqId(null); setFaqForm({ q: '', a: '' }); }}>Cancel</Button>
                )}
              </div>
            </form>
          </div>

          <div className="grid gap-4">
            {faqs.map(faq => (
              <div key={faq.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between gap-4 group hover:border-indigo-200">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">{faq.question}</h4>
                  <p className="text-slate-600 text-sm">{faq.answer}</p>
                </div>
                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEditFaq(faq)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => onDeleteFaq(faq.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {faqs.length === 0 && <p className="text-center text-slate-400 py-10">No FAQs added yet.</p>}
          </div>
        </div>
      )}

      {/* --- CLIENT VIEW --- */}
      {activeTab === 'CLIENTS' && (
        <div className="flex-grow flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden">
          {/* Sidebar List */}
          <aside className="w-full md:w-1/3 bg-white border-r border-slate-200 flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search clients..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {filteredClients.map(client => {
                 const analysis = getAnalysis(client);
                 return (
                  <div 
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setGeneratedMessage(''); }}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-slate-800">{client.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        client.status === 'Approved' ? 'bg-green-100 text-green-700' :
                        client.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>{client.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1">
                      <span className={`${analysis.dsr > 70 ? 'text-red-600 font-bold' : 'text-slate-500'}`}>DSR: {analysis.dsr.toFixed(1)}%</span>
                      <span className="text-slate-300">|</span>
                      <span className="text-slate-500">{client.request.goal}</span>
                    </div>
                  </div>
                 );
              })}
            </div>
          </aside>

          {/* Main Content Detail */}
          <main className="flex-grow p-6 overflow-y-auto">
            {selectedClient ? (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{selectedClient.name}</h2>
                    <p className="text-slate-500 text-sm">{selectedClient.ic} • {selectedClient.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(selectedClient.id, 'Rejected')}>Reject</Button>
                    <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(selectedClient.id, 'Approved')}>Approve</Button>
                  </div>
                </div>

                {/* Analysis Warning Box */}
                {(() => {
                  const analysis = getAnalysis(selectedClient);
                  if (!analysis.approved) {
                    return (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-800">System Recommendation: REJECT</h4>
                          <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                            {analysis.reason.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-indigo-900 border-b pb-2">Profile & Income</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                       <span className="text-slate-500">Job:</span> <span>{selectedClient.jobTitle}</span>
                       <span className="text-slate-500">Type:</span> <span>{selectedClient.employmentType}</span>
                       <span className="text-slate-500">Fixed Salary:</span> <span>${selectedClient.income.fixedSalary.toLocaleString()}</span>
                       <span className="text-slate-500">Variable:</span> <span>${(selectedClient.income.variableCommission + selectedClient.income.variableBonus).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                    <h3 className="font-semibold text-indigo-900 border-b pb-2">Commitments (Declared)</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                       <span className="text-slate-500">Car Loans:</span> <span>${selectedClient.commitments.carLoans.toLocaleString()}</span>
                       <span className="text-slate-500">Personal:</span> <span>${selectedClient.commitments.personalLoans.toLocaleString()}</span>
                       <span className="text-slate-500">Credit Card:</span> <span>${selectedClient.commitments.creditCardOutstanding.toLocaleString()} (Bal)</span>
                       <span className="text-slate-500">PTPTN:</span> <span>${selectedClient.commitments.ptptn.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* AI Generator */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageCircle className="w-5 h-5 text-indigo-600" />
                    <h3 className="font-bold text-indigo-900">AI Response Generator</h3>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <Button variant="secondary" onClick={() => handleGenerateMessage('WHATSAPP')} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : 'Draft WhatsApp'}
                    </Button>
                    <Button variant="outline" onClick={() => handleGenerateMessage('EMAIL')} disabled={isGenerating}>
                      {isGenerating ? <Loader2 className="animate-spin w-4 h-4" /> : 'Draft Email'}
                    </Button>
                  </div>
                  {generatedMessage && (
                    <textarea 
                      className="w-full h-32 p-4 rounded-lg border border-indigo-200 text-sm"
                      readOnly
                      value={generatedMessage}
                    />
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Database className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a client to view details</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};