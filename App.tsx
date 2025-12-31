import React, { useState } from 'react';
import { AppView, RefiGoal, ClientData, EmploymentType } from './types';
import { LandingPage } from './components/LandingPage';
import { MultiStepForm } from './components/MultiStepForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DocumentUpload } from './components/DocumentUpload';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { CheckCircle } from 'lucide-react';
import { Button } from './components/ui/Button';

// Mock initial data for Admin Panel
const MOCK_CLIENTS: ClientData[] = [
  {
    id: '1',
    submittedAt: new Date().toISOString(),
    status: 'Pending',
    goal: RefiGoal.CASH_OUT,
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '012-3456789',
    employmentType: EmploymentType.SALARIED,
    monthlyIncome: 6500,
    address: '45 Lake View, Suburbia',
    propertyValue: 650000,
    currentLoanBalance: 380000,
    currentInterestRate: 4.2,
    remainingTenure: 22,
    monthlyDebts: 800
  },
  {
    id: '2',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'Approved',
    goal: RefiGoal.SAVE_INTEREST,
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    phone: '019-8765432',
    employmentType: EmploymentType.SELF_EMPLOYED,
    monthlyIncome: 12000,
    address: '88 High Street, Metro City',
    propertyValue: 950000,
    currentLoanBalance: 600000,
    currentInterestRate: 4.5,
    remainingTenure: 25,
    monthlyDebts: 2500
  }
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [goal, setGoal] = useState<RefiGoal>(RefiGoal.CASH_OUT);
  const [activeClientData, setActiveClientData] = useState<ClientData | null>(null);
  
  // Admin State (Mock Database)
  const [clients, setClients] = useState<ClientData[]>(MOCK_CLIENTS);

  // Flow Handlers
  const startApplication = (selectedGoal: RefiGoal) => {
    setGoal(selectedGoal);
    setView(AppView.FORM);
  };

  const handleFormSubmit = (data: ClientData) => {
    setActiveClientData(data);
    setView(AppView.RESULTS);
  };

  const handleProceedToUpload = (refinedData: ClientData) => {
    setActiveClientData(refinedData);
    setView(AppView.UPLOAD);
  };

  const handleUploadComplete = () => {
    if (activeClientData) {
      // Save to "DB"
      const newClient: ClientData = {
        ...activeClientData,
        id: Math.random().toString(36).substr(2, 9),
        submittedAt: new Date().toISOString(),
        status: 'Pending'
      };
      setClients(prev => [newClient, ...prev]);
    }
    setView(AppView.SUCCESS);
  };

  const updateClientStatus = (id: string, status: ClientData['status']) => {
    setClients(clients.map(c => c.id === id ? { ...c, status } : c));
  };

  // Views
  if (view === AppView.LANDING) {
    return <LandingPage onStart={startApplication} onAdminLogin={() => setView(AppView.ADMIN_LOGIN)} />;
  }

  if (view === AppView.ADMIN_LOGIN) {
    return (
      <AdminLogin 
        onLogin={() => setView(AppView.ADMIN_DASHBOARD)} 
        onBack={() => setView(AppView.LANDING)} 
      />
    );
  }

  if (view === AppView.FORM) {
    return <MultiStepForm initialGoal={goal} onSubmit={handleFormSubmit} onBack={() => setView(AppView.LANDING)} />;
  }

  if (view === AppView.RESULTS && activeClientData) {
    return <ResultsDashboard clientData={activeClientData} onProceed={handleProceedToUpload} />;
  }

  if (view === AppView.UPLOAD) {
    return <DocumentUpload onComplete={handleUploadComplete} />;
  }

  if (view === AppView.SUCCESS) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
        <p className="text-slate-500 max-w-md mb-8">
          We have received your documents securely. A consultant will review your application and contact you within 24 hours.
        </p>
        <Button onClick={() => setView(AppView.LANDING)}>Return Home</Button>
      </div>
    );
  }

  if (view === AppView.ADMIN_DASHBOARD) {
    return (
      <AdminPanel 
        clients={clients} 
        onUpdateStatus={updateClientStatus} 
        onLogout={() => setView(AppView.LANDING)} 
      />
    );
  }

  return <div>Unknown View</div>;
}