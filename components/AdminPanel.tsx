import React, { useState } from 'react';
import { ClientData } from '../types';
import { calculateEligibility } from '../services/calculations';
import { generateClientCommunication } from '../services/geminiService';
import { Button } from './ui/Button';
import { Search, Mail, MessageCircle, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface Props {
  clients: ClientData[];
  onUpdateStatus: (id: string, status: ClientData['status']) => void;
  onLogout: () => void;
}

export const AdminPanel: React.FC<Props> = ({ clients, onUpdateStatus, onLogout }) => {
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateMessage = async (type: 'EMAIL' | 'WHATSAPP') => {
    if (!selectedClient) return;
    setIsGenerating(true);
    setGeneratedMessage('');
    
    // Recalculate results on the fly for the AI
    const results = calculateEligibility(
      selectedClient, 
      3.5, // Assuming default refined rate
      selectedClient.desiredTenure || 30, 
      selectedClient.desiredLoanAmount || selectedClient.currentLoanBalance
    );

    const msg = await generateClientCommunication(selectedClient, results, type);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-indigo-900 text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="font-bold text-xl">RefiSmart Admin</div>
        <div className="flex gap-4 items-center">
          <span className="text-sm opacity-80">Administrator</span>
          <Button variant="ghost" onClick={onLogout} className="text-white hover:bg-indigo-800">Logout</Button>
        </div>
      </header>

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
            {filteredClients.map(client => (
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
                <p className="text-xs text-slate-500 mb-1">{client.goal}</p>
                <p className="text-xs text-slate-400">{new Date(client.submittedAt).toLocaleDateString()}</p>
              </div>
            ))}
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
                  <p className="text-slate-500">{selectedClient.email} • {selectedClient.phone}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(selectedClient.id, 'Rejected')}>Reject</Button>
                  <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(selectedClient.id, 'Approved')}>Approve</Button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Application Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Goal:</span> <span className="font-medium">{selectedClient.goal}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Employment:</span> <span className="font-medium">{selectedClient.employmentType}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Income:</span> <span className="font-medium">${selectedClient.monthlyIncome.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Debts:</span> <span className="font-medium">${selectedClient.monthlyDebts.toLocaleString()}</span></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                   <h3 className="font-semibold text-slate-700 mb-4 border-b pb-2">Property & Loan</h3>
                   <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Value:</span> <span className="font-medium">${selectedClient.propertyValue.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Current Balance:</span> <span className="font-medium">${selectedClient.currentLoanBalance.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Current Rate:</span> <span className="font-medium">{selectedClient.currentInterestRate}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Desired Amount:</span> <span className="font-medium">${(selectedClient.desiredLoanAmount || selectedClient.currentLoanBalance).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>

              {/* Documents Preview (Mock) */}
              <div className="bg-white p-6 rounded-xl shadow-sm">
                 <h3 className="font-semibold text-slate-700 mb-4">Uploaded Documents</h3>
                 <div className="flex gap-4">
                    {['IC_Copy.pdf', 'Payslips_Combined.pdf', 'Loan_Statement.pdf'].map((doc, i) => (
                      <div key={i} className="flex items-center gap-2 p-3 border rounded-lg bg-slate-50 text-sm">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        <span>{doc}</span>
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      </div>
                    ))}
                 </div>
              </div>

              {/* AI Communication Generator */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-indigo-600 rounded-lg">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-indigo-900">AI Response Generator (Gemini)</h3>
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
                  <div className="mt-4">
                    <textarea 
                      className="w-full h-40 p-4 rounded-lg border border-indigo-200 text-sm text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={generatedMessage}
                      onChange={(e) => setGeneratedMessage(e.target.value)}
                    />
                    <div className="flex justify-end mt-2">
                       <Button variant="primary" className="text-xs" onClick={() => alert("Message copied to clipboard (Simulated)")}>Copy Text</Button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>Select a client to view details</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
