import React, { useState } from 'react';
import { AppView, RefiGoal, ClientData, EmploymentType, PropertyType, FAQItem } from './types';
import { LandingPage } from './components/LandingPage';
import { MultiStepForm } from './components/MultiStepForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DocumentUpload } from './components/DocumentUpload';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { HowItWorks } from './components/HowItWorks';
import { WhyRefinance } from './components/WhyRefinance';
import { RefinanceCalculator } from './components/RefinanceCalculator';
import { FAQPage } from './components/FAQPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CheckCircle } from 'lucide-react';
import { Button } from './components/ui/Button';

// Mock Data
const MOCK_CLIENTS: ClientData[] = [
  {
    id: '1',
    submittedAt: new Date().toISOString(),
    status: 'Pending',
    name: 'Sarah Jenkins',
    ic: '901212-10-5522',
    age: 34,
    email: 'sarah.j@example.com',
    phone: '012-3456789',
    citizenship: 'Citizen',
    maritalStatus: 'Married',
    dependents: 1,
    employmentType: EmploymentType.PERMANENT,
    jobTitle: 'Senior Manager',
    employerName: 'Tech Corp',
    yearsInService: 5,
    income: {
      fixedSalary: 8500, fixedAllowance: 500, variableCommission: 0, 
      variableBonus: 1000, variableOvertime: 0, rentalIncome: 1200, 
      businessIncome: 0, dividends: 0
    },
    commitments: {
      existingHomeLoan: 1500, carLoans: 800, personalLoans: 0, 
      creditCardOutstanding: 5000, bnpl: 200, ptptn: 150, otherLiabilities: 0
    },
    property: {
      address: '45 Lake View, Suburbia', type: PropertyType.CONDO, titleType: 'Residential', 
      marketValue: 650000, isOwnerOccupied: true, outstandingBalance: 380000, 
      currentInterestRate: 4.2, remainingTenure: 22, lockInPeriodEndsYear: 0
    },
    credit: {
      latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false
    },
    request: {
      goal: RefiGoal.CASH_OUT, desiredCashOut: 50000, desiredTenure: 30
    }
  },
  {
    id: '2',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'Rejected',
    name: 'Michael Chen',
    ic: '850505-14-1234',
    age: 39,
    email: 'm.chen@example.com',
    phone: '019-8765432',
    citizenship: 'Citizen',
    maritalStatus: 'Single',
    dependents: 0,
    employmentType: EmploymentType.SELF_EMPLOYED,
    jobTitle: 'Freelance Designer',
    employerName: 'Self',
    yearsInService: 3,
    income: {
      fixedSalary: 0, fixedAllowance: 0, variableCommission: 8000, 
      variableBonus: 0, variableOvertime: 0, rentalIncome: 0, 
      businessIncome: 2000, dividends: 0
    },
    commitments: {
      existingHomeLoan: 2200, carLoans: 1200, personalLoans: 1500, 
      creditCardOutstanding: 15000, bnpl: 0, ptptn: 0, otherLiabilities: 0
    },
    property: {
      address: '88 High Street, Metro City', type: PropertyType.SOHO, titleType: 'Commercial', 
      marketValue: 500000, isOwnerOccupied: true, outstandingBalance: 400000, 
      currentInterestRate: 4.5, remainingTenure: 25, lockInPeriodEndsYear: 0
    },
    credit: {
      latePayments12Months: true, monthsInArrears: 1, restructured: false, bankruptcy: false
    },
    request: {
      goal: RefiGoal.SAVE_INTEREST, desiredCashOut: 0, desiredTenure: 30
    }
  }
];

const INITIAL_FAQS: FAQItem[] = [
  { id: '1', question: 'How long does the process take?', answer: 'Typically 3-4 months for standard refinancing cases, depending on bank approval and lawyer processing times.' },
  { id: '2', question: 'Are there any hidden fees?', answer: 'We are transparent. You will incur standard legal fees, stamp duty, and valuation fees, which can often be financed into the loan. We do not charge upfront consultation fees.' },
  { id: '3', question: 'What is the "Lock-in Period"?', answer: 'A period (usually 3 years) where you pay a penalty (2-3% of loan amount) if you settle the loan early. Check your current offer letter before refinancing.' },
  { id: '4', question: 'Can I refinance if I have bad credit?', answer: 'It depends on severity. We can help assess if you can consolidate debt to improve your score, but bankruptcy usually requires discharge first.' }
];

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [goal, setGoal] = useState<RefiGoal>(RefiGoal.CASH_OUT);
  const [activeClientData, setActiveClientData] = useState<ClientData | null>(null);
  const [clients, setClients] = useState<ClientData[]>(MOCK_CLIENTS);
  
  // FAQ State Management
  const [faqs, setFaqs] = useState<FAQItem[]>(INITIAL_FAQS);

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

  // FAQ Handlers
  const addFaq = (q: string, a: string) => {
    const newFaq = { id: Date.now().toString(), question: q, answer: a };
    setFaqs([...faqs, newFaq]);
  };
  const deleteFaq = (id: string) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };
  const editFaq = (id: string, q: string, a: string) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, question: q, answer: a } : f));
  };

  // Views Logic
  if (view === AppView.LANDING) {
    return <LandingPage onStart={startApplication} onNavigate={setView} />;
  }
  if (view === AppView.ADMIN_LOGIN) {
    return <AdminLogin onLogin={() => setView(AppView.ADMIN_DASHBOARD)} onBack={() => setView(AppView.LANDING)} />;
  }
  
  // New Pages
  if (view === AppView.HOW_IT_WORKS) return <HowItWorks onBack={() => setView(AppView.LANDING)} />;
  if (view === AppView.WHY_REFINANCE) return <WhyRefinance onBack={() => setView(AppView.LANDING)} />;
  if (view === AppView.CALCULATOR) return <RefinanceCalculator onBack={() => setView(AppView.LANDING)} />;
  if (view === AppView.FAQ) return <FAQPage onBack={() => setView(AppView.LANDING)} faqs={faqs} />;
  if (view === AppView.PRIVACY) return <PrivacyPolicy onBack={() => setView(AppView.LANDING)} />;

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-theme-wave">
         {/* Background Overlay */}
        <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

        <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-lg border border-white/50">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
          <p className="text-slate-500 max-w-md mb-8 mx-auto">
            We have received your documents securely. A consultant will review your application and contact you within 24 hours.
          </p>
          <Button onClick={() => setView(AppView.LANDING)}>Return Home</Button>
        </div>
      </div>
    );
  }
  if (view === AppView.ADMIN_DASHBOARD) {
    return (
      <AdminPanel 
        clients={clients} 
        onUpdateStatus={updateClientStatus} 
        onLogout={() => setView(AppView.LANDING)}
        faqs={faqs}
        onAddFaq={addFaq}
        onDeleteFaq={deleteFaq}
        onEditFaq={editFaq}
      />
    );
  }

  return <div>Unknown View</div>;
}