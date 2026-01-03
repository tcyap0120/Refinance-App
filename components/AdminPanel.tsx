
import React, { useState } from 'react';
import { ClientData, FAQItem, PipelineStage, QuickQuoteData, RefiGoal } from '../types';
import { calculateEligibility, calculateQuickQuote } from '../services/calculations';
import { generateClientCommunication } from '../services/geminiService';
import { Button } from './ui/Button';
import { Search, MessageCircle, FileText, CheckCircle, Loader2, Database, AlertTriangle, HelpCircle, Plus, Trash2, Edit, Send, Wifi, WifiOff, RefreshCw, Cloud, HardDrive, Users, Calculator, Briefcase, ExternalLink, FileCheck, Archive, Home } from 'lucide-react';

interface Props {
  clients: ClientData[];
  onUpdateStatus: (id: string, status: ClientData['status']) => void;
  onToggleLinkSent: (id: string, currentStatus: boolean) => void;
  onMoveToTrash: (id: string) => void;
  onLogout: () => void;
  // FAQ Props
  faqs: FAQItem[];
  onAddFaq: (q: string, a: string) => void;
  onDeleteFaq: (id: string) => void;
  onEditFaq: (id: string, q: string, a: string) => void;
  // Connection Status
  isOfflineMode: boolean;
  connectionError?: string | null;
  onRetryConnection: () => void;
}

export const AdminPanel: React.FC<Props> = ({ 
  clients, onUpdateStatus, onToggleLinkSent, onMoveToTrash, onLogout,
  faqs, onAddFaq, onDeleteFaq, onEditFaq,
  isOfflineMode, connectionError, onRetryConnection
}) => {
  const [activeTab, setActiveTab] = useState<'CLIENTS' | 'FAQ'>('CLIENTS');
  const [pipelineTab, setPipelineTab] = useState<PipelineStage>('LEAD');
  
  // Client State
  const [selectedClient, setSelectedClient] = useState<ClientData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // FAQ State
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({ q: '', a: '' });

  // --- CLIENT LOGIC ---
  
  // Filter by stage AND search term
  const filteredClients = clients.filter(c => {
    // Default to 'LEAD' if undefined
    const stage = c.pipelineStage || 'LEAD'; 
    return stage === pipelineTab && (
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleGenerateMessage = async (type: 'EMAIL' | 'WHATSAPP') => {
    if (!selectedClient) return;
    setIsGenerating(true);
    setGeneratedMessage('');
    
    // For leads, we want a simple link message
    if (pipelineTab === 'LEAD' && type === 'WHATSAPP') {
        const link = `https://www.apexconsultancymy.com/?id=${selectedClient.id}`;
        const msg = `Hi ${selectedClient.name.split(' ')[0]}, thanks for your interest in ApexRefi. Based on your initial details, you are eligible for a preliminary check. Please complete your full eligibility form here to proceed: ${link}`;
        setGeneratedMessage(msg);
        setIsGenerating(false);
        return;
    }

    const results = calculateEligibility(selectedClient);
    const msg = await generateClientCommunication(selectedClient, results, type);
    setGeneratedMessage(msg);
    setIsGenerating(false);
  };

  const handleSendWhatsApp = () => {
    if (!selectedClient || !generatedMessage) return;
    
    // Format Phone: Strip non-digits, replace leading 0 with 60 for Malaysia
    let phone = selectedClient.phone.replace(/\D/g, '');
    if (phone.startsWith('0')) {
      phone = '60' + phone.substring(1);
    }
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(generatedMessage)}`;
    window.open(url, '_blank');
  };

  const handleManualRefresh = () => {
      setIsRefreshing(true);
      onRetryConnection();
      setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getAnalysis = (client: ClientData) => calculateEligibility(client);
  
  // Helper to convert ClientData back to QuickQuoteData for Lead view calculation
  const getQuickAnalysis = (client: ClientData) => {
      const data: QuickQuoteData = {
          name: client.name,
          phone: client.phone,
          goal: client.request.goal,
          outstandingBalance: client.property.outstandingBalance,
          currentInstallment: client.property.currentInstallment,
          currentInterestRate: client.property.currentInterestRate,
          estimatedValue: client.property.marketValue,
          propertyCategory: client.property.category,
          propertyType: client.property.type
      };
      return calculateQuickQuote(data);
  };

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
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl flex items-center gap-2">
            ApexRefi Admin
          </div>
          
          {/* Connection Status Indicator */}
          <div className="flex items-center gap-2">
              <div 
                 title={connectionError || (isOfflineMode ? "Local Mode" : "Connected")}
                 className={`cursor-help flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${!isOfflineMode ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-yellow-900/50 border-yellow-500 text-yellow-400'}`}
              >
                <div className={`w-2 h-2 rounded-full ${!isOfflineMode ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                {!isOfflineMode ? (
                   <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> System Online</span>
                ) : (
                   <span className="flex items-center gap-1"><WifiOff className="w-3 h-3" /> Offline: {connectionError ? 'Check Rules' : 'Local Data'}</span>
                )}
              </div>
              
              <button 
                onClick={handleManualRefresh}
                className="p-1 hover:bg-indigo-800 rounded-full transition-colors"
                title="Refresh Connection"
              >
                  <RefreshCw className={`w-4 h-4 text-indigo-300 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
          </div>
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
            
            {/* Pipeline Tabs */}
            <div className="flex text-xs font-bold border-b border-slate-200 bg-slate-50">
               <button 
                  onClick={() => { setPipelineTab('LEAD'); setSelectedClient(null); }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors ${pipelineTab === 'LEAD' ? 'border-blue-500 text-blue-600 bg-white' : 'border-transparent text-slate-500 hover:bg-white'}`}
               >
                 New Leads
               </button>
               <button 
                  onClick={() => { setPipelineTab('ELIGIBILITY'); setSelectedClient(null); }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors ${pipelineTab === 'ELIGIBILITY' ? 'border-purple-500 text-purple-600 bg-white' : 'border-transparent text-slate-500 hover:bg-white'}`}
               >
                 Eligibility
               </button>
               <button 
                  onClick={() => { setPipelineTab('SUBMISSION'); setSelectedClient(null); }}
                  className={`flex-1 py-3 text-center border-b-2 transition-colors ${pipelineTab === 'SUBMISSION' ? 'border-green-500 text-green-600 bg-white' : 'border-transparent text-slate-500 hover:bg-white'}`}
               >
                 Submission
               </button>
                <button 
                  onClick={() => { setPipelineTab('TRASH'); setSelectedClient(null); }}
                  className={`w-16 py-3 text-center border-b-2 transition-colors ${pipelineTab === 'TRASH' ? 'border-slate-500 text-slate-600 bg-slate-200' : 'border-transparent text-slate-500 hover:text-slate-600'}`}
                  title="Trash Bin"
               >
                 Trash
               </button>
            </div>

            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={`Search ${pipelineTab.toLowerCase()}...`} 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
              {filteredClients.map(client => {
                 const isLocal = client.id.startsWith('mock') || client.id.startsWith('local');
                 // Use different subtitle based on stage
                 let subtitle = '';
                 let statusColor = 'bg-yellow-100 text-yellow-700';
                 
                 if (pipelineTab === 'LEAD') {
                     // Lead view shows link status AND goal
                     const goalLabel = client.request.goal === RefiGoal.CASH_OUT ? '[Cash Out]' : '[Save Interest]';
                     subtitle = `${goalLabel} • ${client.linkSent ? '✅ Link Sent' : '⚠️ Pending Link'}`;
                     statusColor = client.linkSent ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700';
                 } else if (pipelineTab === 'TRASH') {
                     subtitle = `Deleted: ${new Date(client.deletedAt!).toLocaleDateString()}`;
                     statusColor = 'bg-slate-100 text-slate-500';
                 } else {
                     const analysis = getAnalysis(client);
                     subtitle = `DSR: ${analysis.dsr.toFixed(1)}% | ${client.request.goal}`;
                     if (client.status === 'Approved') statusColor = 'bg-green-100 text-green-700';
                     if (client.status === 'Rejected') statusColor = 'bg-red-100 text-red-700';
                 }

                 return (
                  <div 
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setGeneratedMessage(''); }}
                    className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${selectedClient?.id === client.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        {isLocal ? (
                          <span title="Local Data"><HardDrive className="w-3 h-3 text-slate-400" /></span>
                        ) : (
                          <span title="Cloud Data"><Cloud className="w-3 h-3 text-indigo-400" /></span>
                        )}
                        <h4 className="font-semibold text-slate-800">{client.name}</h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${statusColor}`}>
                          {pipelineTab === 'LEAD' && client.linkSent ? 'Contacted' : client.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs mt-1 pl-5">
                      <span className={`font-medium ${pipelineTab === 'ELIGIBILITY' && getAnalysis(client).dsr > 70 ? 'text-red-600' : 'text-slate-600'}`}>
                         {subtitle}
                      </span>
                    </div>
                  </div>
                 );
              })}
              {filteredClients.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-sm">
                   {isOfflineMode ? 'Using Local Demo Data (Session Only)' : 'No applications found'}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content Detail */}
          <main className="flex-grow p-6 overflow-y-auto bg-slate-50">
            {selectedClient ? (
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 1. Header Card (Shared) */}
                <div className="flex justify-between items-start bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        {selectedClient.name}
                        {(selectedClient.id.startsWith('mock') || selectedClient.id.startsWith('local')) && (
                             <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded uppercase font-bold tracking-wider border">Local</span>
                        )}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">{selectedClient.phone} • {selectedClient.email}</p>
                    <div className="flex gap-2 mt-3">
                        <span className={`px-2 py-1 text-xs font-bold rounded ${selectedClient.request.goal === RefiGoal.CASH_OUT ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                            {selectedClient.request.goal}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded">{selectedClient.pipelineStage}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap justify-end">
                     {pipelineTab === 'LEAD' && (
                        <Button 
                            variant="secondary" 
                            onClick={() => handleGenerateMessage('WHATSAPP')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                        >
                             <Send className="w-4 h-4 mr-2" /> Draft Link Msg
                        </Button>
                     )}

                     {pipelineTab === 'ELIGIBILITY' && (
                         <>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(selectedClient.id, 'Rejected')}>Reject</Button>
                            <Button variant="primary" onClick={() => {/* In real app, trigger email to upload docs */}}>Request Docs</Button>
                         </>
                     )}
                     
                     {pipelineTab === 'SUBMISSION' && (
                         <>
                            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => onUpdateStatus(selectedClient.id, 'Rejected')}>Reject</Button>
                            <Button variant="primary" className="bg-green-600 hover:bg-green-700" onClick={() => onUpdateStatus(selectedClient.id, 'Approved')}>Approve Loan</Button>
                         </>
                     )}

                     {pipelineTab !== 'TRASH' && (
                        <button 
                            onClick={() => onMoveToTrash(selectedClient.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Move to Trash"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                     )}
                     
                     {pipelineTab === 'TRASH' && (
                         <div className="text-red-500 text-xs italic p-2">
                             Items in trash will be permanently deleted after 7 days.
                         </div>
                     )}
                  </div>
                </div>

                {/* 2. STAGE SPECIFIC VIEW */}
                
                {/* VIEW A: NEW LEAD (Quick Quote Analysis) */}
                {pipelineTab === 'LEAD' && (() => {
                    const qa = getQuickAnalysis(selectedClient);
                    const isCashOut = selectedClient.request.goal === RefiGoal.CASH_OUT;

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {/* Financial Estimate Card */}
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-blue-500" /> Preliminary Analysis
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Goal</span>
                                        <span className="font-medium text-slate-800">{selectedClient.request.goal}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Outstanding Loan</span>
                                        <span className="font-medium">RM {selectedClient.property.outstandingBalance.toLocaleString()}</span>
                                    </div>
                                    <div className={`flex justify-between border-b border-slate-50 pb-2 px-2 rounded ${isCashOut ? 'bg-green-50' : 'bg-blue-50'}`}>
                                        <span className={`font-bold ${isCashOut ? 'text-green-700' : 'text-blue-700'}`}>
                                            {isCashOut ? 'Est. Cash Out' : 'Est. Monthly Savings'}
                                        </span>
                                        <span className={`font-bold ${isCashOut ? 'text-green-700' : 'text-blue-700'}`}>
                                            RM {Math.round(isCashOut ? qa.potentialCashOut : qa.monthlySavings).toLocaleString()}
                                            {!isCashOut && <span className="text-xs font-normal"> /mo</span>}
                                        </span>
                                    </div>
                                </div>
                             </div>

                             {/* Full Input Data Display */}
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-orange-500" /> Submission Data
                                </h3>
                                <div className="text-sm space-y-3">
                                    {/* Fields relevant to CASH OUT */}
                                    {isCashOut ? (
                                        <>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Address</span>
                                                <span className="font-medium text-right">{selectedClient.property.address || '-'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Est. Market Value</span>
                                                <span className="font-medium text-right">RM {(selectedClient.property.marketValue || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Category</span>
                                                <span className="font-medium text-right">{selectedClient.property.category || '-'}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Property Type</span>
                                                <span className="font-medium text-right">{selectedClient.property.type || '-'}</span>
                                            </div>
                                            {selectedClient.property.landSize ? (
                                                <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Land Size</span>
                                                    <span className="font-medium text-right">{selectedClient.property.landSize} sqft</span>
                                                </div>
                                            ) : null}
                                            {selectedClient.property.builtUpSize ? (
                                                <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Built-Up Size</span>
                                                    <span className="font-medium text-right">{selectedClient.property.builtUpSize} sqft</span>
                                                </div>
                                            ) : null}
                                            {selectedClient.property.storeys ? (
                                                <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                    <span className="text-slate-500">Storeys</span>
                                                    <span className="font-medium text-right">{selectedClient.property.storeys}</span>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : (
                                        /* Fields relevant to SAVE INTEREST */
                                        <>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Current Interest Rate</span>
                                                <span className="font-medium text-right">{selectedClient.property.currentInterestRate}%</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Current Installment</span>
                                                <span className="font-medium text-right">RM {(selectedClient.property.currentInstallment || 0).toLocaleString()}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Age</span>
                                                <span className="font-medium text-right">{selectedClient.age} years</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                                                <span className="text-slate-500">Outstanding Balance</span>
                                                <span className="font-medium text-right">RM {(selectedClient.property.outstandingBalance || 0).toLocaleString()}</span>
                                            </div>
                                        </>
                                    )}
                                    <div className="grid grid-cols-2 gap-2 pt-2">
                                        <span className="text-slate-500">Phone</span>
                                        <span className="font-medium text-right">{selectedClient.phone}</span>
                                    </div>
                                </div>
                             </div>
                             
                             <div className="col-span-1 md:col-span-2 bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                     <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${selectedClient.linkSent ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                                            {selectedClient.linkSent && <CheckCircle className="w-4 h-4 text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={!!selectedClient.linkSent} 
                                            onChange={() => onToggleLinkSent(selectedClient.id, !!selectedClient.linkSent)} 
                                        />
                                        <div>
                                            <p className="font-bold text-slate-800">Mark as Link Sent</p>
                                            <p className="text-xs text-slate-500">Check this box after sending the Eligibility Form link to the client.</p>
                                        </div>
                                     </label>
                                 </div>
                             </div>
                        </div>
                    );
                })()}

                {/* VIEW B: ELIGIBILITY CHECK (Financial Deep Dive) */}
                {pipelineTab === 'ELIGIBILITY' && (() => {
                   const analysis = getAnalysis(selectedClient);
                   return (
                     <>
                        {/* Status Alert */}
                        {!analysis.approved ? (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                <div>
                                <h4 className="font-bold text-red-800">System Recommendation: REJECT</h4>
                                <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                    {analysis.reason.map((r, i) => <li key={i}>{r}</li>)}
                                </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <div>
                                    <h4 className="font-bold text-green-800">System Recommendation: ELIGIBLE</h4>
                                    <p className="text-sm text-green-700">DSR and NDI within healthy range. Proceed to documentation.</p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Income & Employment */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Income Profile</h3>
                                <div className="grid grid-cols-2 gap-y-2 text-sm">
                                    <span className="text-slate-500">Employment:</span> 
                                    <span className="font-medium text-right">{selectedClient.employmentType}</span>
                                    
                                    <span className="text-slate-500">Declared Gross:</span> 
                                    <span className="font-medium text-right">RM {Object.values(selectedClient.income).reduce((a:number,b:number)=>a+b, 0).toLocaleString()}</span>
                                    
                                    <span className="text-slate-500 font-bold text-indigo-600">Recognised Income:</span> 
                                    <span className="font-bold text-right text-indigo-600">RM {Math.round(analysis.recognisedIncome).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Scoring */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4 border-b pb-2">Scoring Metrics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>DSR (Limit 70%)</span>
                                            <span className={`font-bold ${analysis.dsr > 70 ? 'text-red-600' : 'text-green-600'}`}>{analysis.dsr.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${analysis.dsr > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{width: `${Math.min(analysis.dsr, 100)}%`}}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>Stress DSR (Limit 75%)</span>
                                            <span className={`font-bold ${analysis.stressDsr > 75 ? 'text-red-600' : 'text-orange-500'}`}>{analysis.stressDsr.toFixed(1)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${analysis.stressDsr > 75 ? 'bg-red-500' : 'bg-orange-500'}`} style={{width: `${Math.min(analysis.stressDsr, 100)}%`}}></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2">
                                        <span className="text-slate-500">Net Disposable Income</span>
                                        <span className="font-bold">RM {Math.round(analysis.ndi).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Commitments Table */}
                            <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4">Declared Commitments</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-slate-500 text-xs">Car Loans</p>
                                        <p className="font-medium">RM {selectedClient.commitments.carLoans}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-slate-500 text-xs">Personal Loans</p>
                                        <p className="font-medium">RM {selectedClient.commitments.personalLoans}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-slate-500 text-xs">Credit Card (5% Calc)</p>
                                        <p className="font-medium">RM {Math.round(selectedClient.commitments.creditCardOutstanding * 0.05)}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded">
                                        <p className="text-slate-500 text-xs">PTPTN</p>
                                        <p className="font-medium">RM {selectedClient.commitments.ptptn}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </>
                   );
                })()}

                {/* VIEW C: SUBMISSION (Documents & Personal) */}
                {pipelineTab === 'SUBMISSION' && (
                    <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                             <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FileCheck className="w-5 h-5 text-indigo-600" /> Application Documents
                             </h3>
                             <div className="space-y-4">
                                 <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                                     <div className="flex items-center gap-3">
                                         <FileText className="w-5 h-5 text-green-700" />
                                         <div>
                                             <p className="font-medium text-green-800">Identity Card (IC)</p>
                                             <p className="text-xs text-green-600">Uploaded {new Date(selectedClient.submittedAt).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     <Button variant="ghost" className="text-xs h-8">View</Button>
                                 </div>
                                 <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                                     <div className="flex items-center gap-3">
                                         <FileText className="w-5 h-5 text-green-700" />
                                         <div>
                                             <p className="font-medium text-green-800">Payslips (3 Months)</p>
                                             <p className="text-xs text-green-600">Uploaded {new Date(selectedClient.submittedAt).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     <Button variant="ghost" className="text-xs h-8">View</Button>
                                 </div>
                                 <div className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200">
                                     <div className="flex items-center gap-3">
                                         <FileText className="w-5 h-5 text-green-700" />
                                         <div>
                                             <p className="font-medium text-green-800">Bank Statements</p>
                                             <p className="text-xs text-green-600">Uploaded {new Date(selectedClient.submittedAt).toLocaleDateString()}</p>
                                         </div>
                                     </div>
                                     <Button variant="ghost" className="text-xs h-8">View</Button>
                                 </div>
                             </div>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-800 mb-4">Personal Details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <p className="text-slate-500 text-xs">Full Name</p>
                                    <p className="font-medium">{selectedClient.name}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">IC Number</p>
                                    <p className="font-medium">{selectedClient.ic}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Marital Status</p>
                                    <p className="font-medium">{selectedClient.maritalStatus}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Citizenship</p>
                                    <p className="font-medium">{selectedClient.citizenship}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs">Age</p>
                                    <p className="font-medium">{selectedClient.age}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* VIEW D: TRASH (ReadOnly) */}
                {pipelineTab === 'TRASH' && (
                    <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center justify-center text-center">
                         <Archive className="w-12 h-12 text-red-200 mb-4" />
                         <h3 className="font-bold text-red-800">Archived Case</h3>
                         <p className="text-red-600 text-sm">This case was deleted on {new Date(selectedClient.deletedAt || '').toLocaleString()}.</p>
                         <p className="text-xs text-red-400 mt-2">Data is read-only.</p>
                    </div>
                )}

                {/* AI Generator (Shared but content varies based on need) */}
                {pipelineTab !== 'TRASH' && (
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
                        <div className="space-y-4">
                          <textarea 
                            className="w-full h-32 p-4 rounded-lg border border-indigo-200 text-sm"
                            value={generatedMessage}
                            onChange={(e) => setGeneratedMessage(e.target.value)}
                          />
                          <Button variant="primary" fullWidth onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700 text-white">
                            <Send className="w-4 h-4 mr-2" /> Send via WhatsApp
                          </Button>
                          <p className="text-xs text-slate-500 text-center">This will open WhatsApp Web/App to send the message to {selectedClient.phone}.</p>
                        </div>
                      )}
                    </div>
                )}

              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <Database className="w-16 h-16 mb-4 opacity-20" />
                <p>Select a client from the <strong>{pipelineTab === 'LEAD' ? 'New Leads' : pipelineTab === 'ELIGIBILITY' ? 'Eligibility' : pipelineTab === 'SUBMISSION' ? 'Submission' : 'Trash'}</strong> list</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
