import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppView, RefiGoal, ClientData, EmploymentType, PropertyType, PropertyCategory, FAQItem, QuickQuoteData, BusinessNature } from './types';
import { LandingPage } from './components/LandingPage';
import { QuickQuoteForm } from './components/QuickQuoteForm';
import { QuickQuoteSuccess } from './components/QuickQuoteSuccess';
import { QuickAnalysisReport } from './components/QuickAnalysisReport';
import { MultiStepForm } from './components/MultiStepForm';
import { ResultsDashboard } from './components/ResultsDashboard';
import { DocumentUpload } from './components/DocumentUpload';
import { AdminPanel } from './components/AdminPanel';
import { AdminLogin } from './components/AdminLogin';
import { HowItWorks } from './components/HowItWorks';
import { WhyRefinance } from './components/WhyRefinance';
import { RefinanceCalculator } from './components/RefinanceCalculator';
import { PayrollCalculator } from './components/PayrollCalculator';
import { FAQPage } from './components/FAQPage';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { CheckCircle, Home as HomeIcon, Menu, X, Database, AlertTriangle, RefreshCw, Wifi, Loader2 } from 'lucide-react';
import { Button } from './components/ui/Button';

// Firebase Imports
import { db, DB_COLLECTION, FAQ_COLLECTION } from './services/firebase';
import { collection, addDoc, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy, Timestamp, getDoc } from 'firebase/firestore';

// --- MOCK DATA CONSTANTS (Fallback) ---
const MOCK_CLIENTS: ClientData[] = [
  // 1. LEAD (New)
  {
    id: 'mock-lead-1', submittedAt: new Date().toISOString(), status: 'Pending', pipelineStage: 'LEAD', 
    name: 'Jason Leong', phone: '0123456789', email: 'jason@example.com',
    ic: '', age: 34, citizenship: 'Citizen', maritalStatus: 'Single', dependents: 0, employmentType: EmploymentType.PERMANENT,
    jobTitle: '', employerName: '', yearsInService: 0,
    income: { fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, variableBonus: 0, variableOvertime: 0, rentalIncome: 0, partTimeIncome: 0 },
    commitments: { existingHomeLoan: 0, carLoans: 0, personalLoans: 0, creditCardOutstanding: 0, ptptn: 0, otherLiabilities: 0 },
    property: { address: '12, Jalan Damansara', category: PropertyCategory.LANDED, type: PropertyType.TERRACE, titleType: 'Residential', marketValue: 800000, outstandingBalance: 400000, currentInterestRate: 4.5, currentInstallment: 2000, remainingTenure: 25, lockInPeriodEndsYear: 0, isOwnerOccupied: true, landSize: 1400, storeys: 2 },
    credit: { akpk: false, latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false },
    request: { goal: RefiGoal.CASH_OUT, desiredCashOut: 200000, desiredTenure: 35 },
    linkSent: false
  },

  // 2. ELIGIBILITY 1 (High Income, Save Interest)
  {
    id: 'mock-elig-1', submittedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Pending', pipelineStage: 'ELIGIBILITY', 
    name: 'Dr. Sarah Ahmad', phone: '0198887777', email: 'sarah.dr@example.com',
    ic: '850101-14-5555', age: 39, citizenship: 'Citizen', maritalStatus: 'Married', dependents: 2, employmentType: EmploymentType.PERMANENT,
    jobTitle: 'Specialist Doctor', employerName: 'Private Hospital', yearsInService: 8,
    income: { fixedSalary: 15000, fixedAllowance: 2000, variableCommission: 0, variableBonus: 0, variableOvertime: 3000, rentalIncome: 2500, partTimeIncome: 0 },
    commitments: { existingHomeLoan: 0, carLoans: 3500, personalLoans: 0, creditCardOutstanding: 5000, ptptn: 0, otherLiabilities: 0 },
    property: { address: 'The Ritz Condo, KL', category: PropertyCategory.HIGH_RISE, type: PropertyType.CONDO, titleType: 'Residential', marketValue: 1200000, outstandingBalance: 900000, currentInterestRate: 4.4, currentInstallment: 4200, remainingTenure: 25, lockInPeriodEndsYear: 0, isOwnerOccupied: true, builtUpSize: 1800 },
    credit: { akpk: false, latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false },
    request: { goal: RefiGoal.SAVE_INTEREST, desiredCashOut: 0, desiredTenure: 30 },
    linkSent: true
  },

  // 3. ELIGIBILITY 2 (Borderline DSR, Cash Out)
  {
    id: 'mock-elig-2', submittedAt: new Date(Date.now() - 172800000).toISOString(), status: 'Pending', pipelineStage: 'ELIGIBILITY', 
    name: 'Kenji Tan', phone: '0173334444', email: 'kenji@example.com',
    ic: '950505-10-2222', age: 29, citizenship: 'Citizen', maritalStatus: 'Single', dependents: 0, employmentType: EmploymentType.CONTRACT,
    jobTitle: 'IT Analyst', employerName: 'Tech Corp', yearsInService: 2,
    income: { fixedSalary: 4500, fixedAllowance: 300, variableCommission: 0, variableBonus: 0, variableOvertime: 500, rentalIncome: 0, partTimeIncome: 1000 },
    commitments: { existingHomeLoan: 0, carLoans: 900, personalLoans: 1200, creditCardOutstanding: 8000, ptptn: 200, otherLiabilities: 0 },
    property: { address: 'Vista Apartment', category: PropertyCategory.HIGH_RISE, type: PropertyType.APARTMENT, titleType: 'Residential', marketValue: 350000, outstandingBalance: 200000, currentInterestRate: 4.6, currentInstallment: 1100, remainingTenure: 28, lockInPeriodEndsYear: 0, isOwnerOccupied: true, builtUpSize: 850 },
    credit: { akpk: false, latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false },
    request: { goal: RefiGoal.CASH_OUT, desiredCashOut: 50000, desiredTenure: 35 },
    linkSent: true
  },

  // 4. SUBMISSION 1 (Business Owner, Factory Refinance)
  {
    id: 'mock-sub-1', submittedAt: new Date(Date.now() - 259200000).toISOString(), status: 'Approved', pipelineStage: 'SUBMISSION', 
    name: 'Mega Trading Sdn Bhd', phone: '0122229999', email: 'director@megatrading.com',
    ic: '750202-07-8888', age: 49, citizenship: 'Citizen', maritalStatus: 'Married', dependents: 3, employmentType: EmploymentType.BUSINESS_OWNER,
    jobTitle: 'Director', employerName: 'Mega Trading Sdn Bhd', yearsInService: 15,
    income: { fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, variableBonus: 0, variableOvertime: 0, rentalIncome: 0, partTimeIncome: 0, annualDeclaredIncome: 350000, avgMonthlyRevenue: 120000, businessNature: BusinessNature.MANUFACTURING },
    commitments: { existingHomeLoan: 0, carLoans: 4500, personalLoans: 0, creditCardOutstanding: 25000, ptptn: 0, otherLiabilities: 0 },
    property: { address: 'Lot 55, Shah Alam Industrial Park', category: PropertyCategory.COMMERCIAL, type: PropertyType.FACTORY, titleType: 'Commercial', marketValue: 3500000, outstandingBalance: 1500000, currentInterestRate: 5.2, currentInstallment: 9000, remainingTenure: 12, lockInPeriodEndsYear: 0, isOwnerOccupied: true, landSize: 8000, builtUpSize: 5000 },
    credit: { akpk: false, latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false },
    request: { goal: RefiGoal.CASH_OUT, desiredCashOut: 800000, desiredTenure: 20 },
    linkSent: true
  },

  // 5. SUBMISSION 2 (Commission Earner, Terrace House)
  {
    id: 'mock-sub-2', submittedAt: new Date(Date.now() - 300000000).toISOString(), status: 'Pending', pipelineStage: 'SUBMISSION', 
    name: 'Linda Wong (Agent)', phone: '0165551111', email: 'linda.wong@realty.com',
    ic: '881212-14-3333', age: 36, citizenship: 'Citizen', maritalStatus: 'Single', dependents: 0, employmentType: EmploymentType.COMMISSION_EARNER,
    jobTitle: 'Real Estate Negotiator', employerName: 'Top Realty', yearsInService: 5,
    income: { fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, variableBonus: 0, variableOvertime: 0, rentalIncome: 0, partTimeIncome: 0, avgMonthlyCommission: 15000 },
    commitments: { existingHomeLoan: 0, carLoans: 1800, personalLoans: 0, creditCardOutstanding: 3000, ptptn: 0, otherLiabilities: 0 },
    property: { address: '22, Jalan USJ 4/5', category: PropertyCategory.LANDED, type: PropertyType.TERRACE, titleType: 'Residential', marketValue: 850000, outstandingBalance: 600000, currentInterestRate: 4.3, currentInstallment: 2800, remainingTenure: 30, lockInPeriodEndsYear: 0, isOwnerOccupied: true, landSize: 1650, storeys: 2 },
    credit: { akpk: false, latePayments12Months: false, monthsInArrears: 0, restructured: false, bankruptcy: false },
    request: { goal: RefiGoal.SAVE_INTEREST, desiredCashOut: 0, desiredTenure: 35 },
    linkSent: true
  }
];

const MOCK_FAQS: FAQItem[] = [
  { id: '1', question: 'Why am I seeing this?', answer: 'The database connection failed or is not configured. The app is running in Demo Mode.' }
];

// Helper to safely convert Firestore Timestamp/Object to String
const safeDate = (val: any): string => {
  if (!val) return new Date().toISOString();
  if (typeof val === 'string') return val;
  // Handle Firestore Timestamp or similar objects
  if (val?.toDate && typeof val.toDate === 'function') {
      try { return val.toDate().toISOString(); } catch (e) { return new Date().toISOString(); }
  }
  // Handle seconds/nanoseconds object format
  if (typeof val?.seconds === 'number') {
      return new Date(val.seconds * 1000).toISOString();
  }
  return String(val); // Fallback
};

export default function App() {
  const [view, setView] = useState<AppView>(AppView.LANDING);
  const [goal, setGoal] = useState<RefiGoal>(RefiGoal.CASH_OUT);
  const [quickQuoteData, setQuickQuoteData] = useState<QuickQuoteData | null>(null);
  const [activeClientData, setActiveClientData] = useState<ClientData | null>(null);
  
  // Data State ( Synced with Firebase )
  const [clients, setClients] = useState<ClientData[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  
  // UI State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isProcessingLink, setIsProcessingLink] = useState(false);

  // Refs for Unsubscribing
  const unsubClientsRef = useRef<() => void>(() => {});
  const unsubFaqsRef = useRef<() => void>(() => {});

  // --- 1. SYNC DATA FROM FIREBASE ---
  const connectToDatabase = useCallback(() => {
    setIsRetrying(true);
    setConnectionError(null);

    // Helper to fallback to mock data
    const useMockData = (errorMsg?: any) => {
        // Sanitize error for console to avoid circular structure issues in some environments
        const safeLog = errorMsg?.message || errorMsg?.code || (typeof errorMsg === 'string' ? errorMsg : 'Unknown Error');
        console.warn("Falling back to local data. Reason:", safeLog);
        
        setIsOfflineMode(true);
        setIsRetrying(false);

        // Extract useful error message for UI
        let msg = "Unknown Error";
        if (typeof errorMsg === 'string') msg = errorMsg;
        else if (errorMsg?.message) msg = errorMsg.message;
        else if (errorMsg?.code) msg = `Firebase Error: ${errorMsg.code}`;
        
        setConnectionError(msg);
        
        // Preserve existing mock data if already there, otherwise init
        setClients(prev => prev.length === 0 ? MOCK_CLIENTS : prev);
        setFaqs(prev => prev.length === 0 ? MOCK_FAQS : prev);
    };

    if (!db) {
      useMockData("No DB Configured");
      return;
    }

    // Cleanup previous listeners
    unsubClientsRef.current();
    unsubFaqsRef.current();

    try {
      console.log("Attempting to connect to Firestore...");
      // Sync Clients
      // NOTE: If this fails due to permission (User view), it will fallback to mock
      // but URL handling should still attempt to fetch single doc.
      const qClients = query(collection(db, DB_COLLECTION), orderBy('submittedAt', 'desc'));
      unsubClientsRef.current = onSnapshot(qClients, 
        (snapshot) => {
          const loadedClients = snapshot.docs.map(doc => {
            const data = doc.data();
            // Sanitize complex objects (like Timestamps) into primitive strings immediately
            return {
              id: doc.id,
              ...data,
              submittedAt: safeDate(data.submittedAt),
              deletedAt: data.deletedAt ? safeDate(data.deletedAt) : undefined
            };
          }) as ClientData[];
          
          console.log(`Connected! Loaded ${loadedClients.length} clients.`);
          
          // IMPORTANT: If connected but empty (new project), show mock data for demo purposes
          if (loadedClients.length === 0) {
              console.log("Database empty. Loading mock data for display.");
              setClients(MOCK_CLIENTS);
              // We don't set offline mode here because connection is technically successful
          } else {
              setClients(loadedClients);
          }
          
          setIsOfflineMode(false); 
          setConnectionError(null);
          setIsRetrying(false);
        }, 
        (error) => useMockData(error) // Fallback on error
      );

      // Sync FAQs
      const qFaqs = collection(db, FAQ_COLLECTION);
      unsubFaqsRef.current = onSnapshot(qFaqs, 
        (snapshot) => {
          const loadedFaqs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as FAQItem[];
          setFaqs(loadedFaqs);
        }, 
        (error) => console.warn("FAQ Sync Error (Check console for details)")
      );

    } catch (e) {
      useMockData(e);
    }
  }, []);

  // Initial Connect
  useEffect(() => {
    connectToDatabase();
    return () => {
      unsubClientsRef.current();
      unsubFaqsRef.current();
    };
  }, [connectToDatabase]);

  // --- 2. URL PARAMETER HANDLING (For Lead Links) ---
  const urlProcessedRef = useRef(false);

  useEffect(() => {
    const handleUrlLink = async () => {
        // Prevent re-processing if already done
        if (urlProcessedRef.current) return;

        const params = new URLSearchParams(window.location.search);
        const leadId = params.get('id');

        if (!leadId) return;

        setIsProcessingLink(true);
        console.log("Processing URL Link for ID:", leadId);

        let targetClient: ClientData | undefined;

        // A. Direct Fetch: Prioritize direct fetch from DB to ensure fresh data and work around permission issues with full list
        if (db) {
            try {
                const docRef = doc(db, DB_COLLECTION, leadId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    targetClient = {
                        id: docSnap.id,
                        ...data,
                        submittedAt: safeDate(data.submittedAt),
                        deletedAt: data.deletedAt ? safeDate(data.deletedAt) : undefined
                    } as ClientData;
                } else {
                    console.warn("Target ID from URL not found in Database.");
                }
            } catch (error) {
                console.error("Error fetching specific lead from URL:", error);
            }
        }

        // B. If not found in DB (e.g. offline/mock mode), try local list
        if (!targetClient && clients.length > 0) {
             targetClient = clients.find(c => c.id === leadId);
        }

        // C. If Found, Switch View
        if (targetClient) {
            console.log("Opening application session for:", targetClient.name);
            
            try {
                setActiveClientData(targetClient);
                setGoal(targetClient.request?.goal || RefiGoal.CASH_OUT);
                
                // Map ClientData back to QuickQuoteData format for pre-filling the form
                // Add safety checks for optional nested objects
                const prefillData: QuickQuoteData = {
                    name: targetClient.name || '',
                    phone: targetClient.phone || '',
                    goal: targetClient.request?.goal || RefiGoal.CASH_OUT,
                    outstandingBalance: targetClient.property?.outstandingBalance || 0,
                    currentInstallment: targetClient.property?.currentInstallment || 0,
                    currentInterestRate: targetClient.property?.currentInterestRate || 0,
                    age: targetClient.age || 0,
                    estimatedValue: targetClient.property?.marketValue || 0,
                    propertyAddress: targetClient.property?.address || '',
                    propertyCategory: targetClient.property?.category || undefined,
                    propertyType: targetClient.property?.type || undefined,
                    landSize: targetClient.property?.landSize || 0,
                    builtUpSize: targetClient.property?.builtUpSize || 0,
                    storeys: targetClient.property?.storeys || 0
                };
                
                setQuickQuoteData(prefillData);
                setView(AppView.FORM); // Go directly to Step 2
                
                // Mark as processed so we don't accidentally reset
                urlProcessedRef.current = true;
            } catch (e) {
                console.error("Error processing client data for view:", e);
                // Fallback to landing if data is corrupt
                setView(AppView.LANDING);
            }
        } else {
             // If ID provided but not found, maybe show error or stay on landing
             console.log("Lead ID not found.");
        }
        
        setIsProcessingLink(false);
    };

    // Run handling if DB is ready OR if we are in offline mode/clients loaded
    if (db || clients.length > 0) {
        handleUrlLink();
    }

  }, [db, clients.length]); 

  const startApplication = (selectedGoal: RefiGoal) => {
    setGoal(selectedGoal);
    setView(AppView.QUICK_QUOTE);
  };

  const handleQuickQuoteComplete = async (data: QuickQuoteData) => {
    setQuickQuoteData(data);
    setGoal(data.goal);

    // Create a new lead case (STAGE 1: LEAD)
    const newLead: Omit<ClientData, 'id'> = {
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      pipelineStage: 'LEAD', // Stage 1
      linkSent: false,
      name: data.name,
      phone: data.phone,
      email: 'Pending Input',
      ic: 'Pending Input',
      age: data.age || 0,
      citizenship: 'Citizen',
      maritalStatus: 'Single',
      dependents: 0,
      employmentType: EmploymentType.PERMANENT,
      jobTitle: 'Pending',
      employerName: 'Pending',
      yearsInService: 0,
      income: {
        fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, 
        variableBonus: 0, variableOvertime: 0, rentalIncome: 0, partTimeIncome: 0
      },
      commitments: {
        existingHomeLoan: 0, carLoans: 0, personalLoans: 0, 
        creditCardOutstanding: 0, ptptn: 0, otherLiabilities: 0
      },
      property: {
        address: data.propertyAddress || 'Not Provided',
        category: data.propertyCategory || PropertyCategory.LANDED,
        type: data.propertyType || PropertyType.TERRACE,
        titleType: 'Residential',
        marketValue: data.estimatedValue || 0,
        outstandingBalance: data.outstandingBalance,
        currentInterestRate: data.currentInterestRate || 0,
        currentInstallment: data.currentInstallment || 0,
        remainingTenure: 0,
        lockInPeriodEndsYear: 0,
        isOwnerOccupied: true,
        landSize: data.landSize || 0, 
        builtUpSize: data.builtUpSize || 0,
        storeys: data.storeys || 0
      },
      credit: {
        akpk: false, 
        latePayments12Months: false, 
        monthsInArrears: 0, 
        restructured: false, 
        bankruptcy: false
      },
      request: {
        goal: data.goal,
        desiredCashOut: data.goal === RefiGoal.CASH_OUT ? (data.estimatedValue ? (data.estimatedValue * 0.8 - data.outstandingBalance) : 0) : 0,
        desiredTenure: 35
      }
    };
    
    // Attempt to save to Cloud, fallback to local if fails
    if (db && !isOfflineMode) {
      try {
        const docRef = await addDoc(collection(db, DB_COLLECTION), newLead);
        setActiveClientData({ id: docRef.id, ...newLead });
        console.log("Lead saved to Firestore");
      } catch (e: any) {
        // Safe Error Log
        const errorMsg = e?.message || "Write Error";
        console.error("Cloud save failed (using local): ", errorMsg);
        setIsOfflineMode(true);
        setConnectionError(errorMsg);
        
        // IMPORTANT: Add to local session list so it appears in Admin Panel immediately
        const localId = 'local-temp-id-' + Date.now();
        const localClient = { id: localId, ...newLead } as ClientData;
        setActiveClientData(localClient);
        setClients(prev => [localClient, ...prev]);
      }
    } else {
      console.log("Demo Mode: Local data created");
      const localId = 'local-temp-id-' + Date.now();
      const localClient = { id: localId, ...newLead } as ClientData;
      setActiveClientData(localClient);
      setClients(prev => [localClient, ...prev]);
    }

    setView(AppView.QUICK_QUOTE_SUCCESS);
  };

  const handleSimulateWhatsAppLink = () => {
     // In a real app, this would be a link with a query param like ?id=123
     // Here we assume the activeClientData is the one continuing
     setView(AppView.FORM);
  };

  const handleUnlockFullReport = () => {
    setView(AppView.FORM);
  };

  const handleFormSubmit = async (data: ClientData) => {
    // Stage 2: Eligibility Check Submitted
    const updatedData = { 
        ...data, 
        pipelineStage: 'ELIGIBILITY' as const 
    };
    
    setActiveClientData(updatedData);
    
    // Update DB
    if (db && updatedData.id && !updatedData.id.startsWith('local-')) {
       try {
          const clientRef = doc(db, DB_COLLECTION, updatedData.id);
          const { id, ...saveData } = updatedData;
          await updateDoc(clientRef, saveData);
       } catch(e: any) { console.error("Update error:", e?.message || "Unknown error"); }
    } else {
       setClients(prev => prev.map(c => c.id === updatedData.id ? updatedData : c));
    }
    
    setView(AppView.RESULTS);
  };

  const handleProceedToUpload = async (refinedData: ClientData) => {
    // Still Stage 2 until upload complete, but we update data if changed in dashboard
    const updatedLocal = { ...refinedData };

    if (db && activeClientData?.id && !activeClientData.id.startsWith('local-')) {
       try {
         const clientRef = doc(db, DB_COLLECTION, activeClientData.id);
         const { id, ...updateData } = refinedData;
         await updateDoc(clientRef, updateData);
       } catch (e: any) {
         const errorMsg = e?.message || "Update Error";
         console.error("Cloud update failed (continuing locally):", errorMsg);
         setIsOfflineMode(true);
         setConnectionError(errorMsg);
       }
    } else {
        // Local Update
        setClients(prev => prev.map(c => c.id === activeClientData?.id ? updatedLocal : c));
    }
    setActiveClientData(updatedLocal);
    setView(AppView.UPLOAD);
  };

  const handleUploadComplete = async () => {
    // Stage 3: Documents Uploaded (Submission)
    if (db && activeClientData?.id && !activeClientData.id.startsWith('local-')) {
       try {
         const clientRef = doc(db, DB_COLLECTION, activeClientData.id);
         await updateDoc(clientRef, {
           status: 'Pending',
           pipelineStage: 'SUBMISSION', // Move to Stage 3
           submittedAt: new Date().toISOString()
         });
       } catch (e: any) {
         console.error("Cloud status update failed:", e?.message || "Error");
         setConnectionError(e?.message);
       }
    } else if (activeClientData) {
        // Local update
        const updated = { ...activeClientData, pipelineStage: 'SUBMISSION' as const, status: 'Pending' as const };
        setClients(prev => prev.map(c => c.id === activeClientData.id ? updated : c));
    }
    setView(AppView.SUCCESS);
  };

  const updateClientStatus = async (id: string, status: ClientData['status']) => {
    // Optimistic Update
    setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    
    if (db && !id.startsWith('mock') && !id.startsWith('local')) {
      try {
        const clientRef = doc(db, DB_COLLECTION, id);
        await updateDoc(clientRef, { status });
      } catch (e: any) {
         console.error("Failed to update status on cloud", e?.message || "Error");
         setConnectionError(e?.message);
      }
    }
  };

  // --- NEW HANDLERS FOR ADMIN FEATURES ---
  
  const handleToggleLinkSent = async (id: string, currentStatus: boolean) => {
      // Optimistic Update
      setClients(prev => prev.map(c => c.id === id ? { ...c, linkSent: !currentStatus } : c));
      
      if (db && !id.startsWith('mock') && !id.startsWith('local')) {
          try {
              const clientRef = doc(db, DB_COLLECTION, id);
              await updateDoc(clientRef, { linkSent: !currentStatus });
          } catch (e: any) {
              console.error("Failed to update link status", e?.message || "Error");
          }
      }
  };

  const handleMoveToTrash = async (id: string) => {
      const deletedAt = new Date().toISOString();
      // Optimistic
      setClients(prev => prev.map(c => c.id === id ? { ...c, pipelineStage: 'TRASH', deletedAt } : c));
      
      if (db && !id.startsWith('mock') && !id.startsWith('local')) {
          try {
              const clientRef = doc(db, DB_COLLECTION, id);
              await updateDoc(clientRef, { pipelineStage: 'TRASH', deletedAt });
          } catch (e: any) {
              console.error("Failed to move to trash", e?.message || "Error");
          }
      }
  };

  // --- FAQ DB Handlers ---
  const addFaq = async (q: string, a: string) => {
    const newFaq = { id: 'local-' + Date.now(), question: q, answer: a };
    if (db && !isOfflineMode) {
      try {
        await addDoc(collection(db, FAQ_COLLECTION), { question: q, answer: a });
      } catch (e: any) {
        console.error("Failed to add FAQ to cloud", e?.message || "Error");
        setConnectionError(e?.message);
        setFaqs(prev => [...prev, newFaq]);
      }
    } else {
      setFaqs(prev => [...prev, newFaq]);
    }
  };
  const deleteFaq = async (id: string) => {
    if (db && !isOfflineMode && !id.startsWith('local') && !id.startsWith('mock')) {
      try {
        await deleteDoc(doc(db, FAQ_COLLECTION, id));
      } catch (e: any) {
        console.error("Failed to delete FAQ from cloud", e?.message || "Error");
        setConnectionError(e?.message);
      }
    } else {
      setFaqs(prev => prev.filter(f => f.id !== id));
    }
  };
  const editFaq = async (id: string, q: string, a: string) => {
    if (db && !isOfflineMode && !id.startsWith('local') && !id.startsWith('mock')) {
      try {
        await updateDoc(doc(db, FAQ_COLLECTION, id), { question: q, answer: a });
      } catch (e: any) {
        console.error("Failed to update FAQ on cloud", e?.message || "Error");
        setConnectionError(e?.message);
      }
    } else {
      setFaqs(prev => prev.map(f => f.id === id ? { ...f, question: q, answer: a } : f));
    }
  };

  const Navbar = () => (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-indigo-50 shadow-sm px-4 md:px-6 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo / Home */}
        <div 
          className="flex items-center gap-2 cursor-pointer group" 
          onClick={() => setView(AppView.LANDING)}
        >
          <img 
            src="/logo.png" 
            alt="ApexRefi" 
            className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform rounded-lg"
          />
          <span className="text-xl font-bold text-indigo-900 tracking-tight">ApexRefi</span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button onClick={() => setView(AppView.LANDING)} className="hover:text-indigo-600 flex items-center gap-1">
             <HomeIcon className="w-4 h-4" /> Home
          </button>
          <button onClick={() => setView(AppView.HOW_IT_WORKS)} className="hover:text-indigo-600">How It Works</button>
          <button onClick={() => setView(AppView.WHY_REFINANCE)} className="hover:text-indigo-600">Why Refinance</button>
          <button onClick={() => setView(AppView.CALCULATOR)} className="hover:text-indigo-600">Loan Calc</button>
          {/* Style removed as requested */}
          <button onClick={() => setView(AppView.PAYROLL)} className="hover:text-indigo-600">Payroll Calc</button>
          <button onClick={() => setView(AppView.FAQ)} className="hover:text-indigo-600">FAQ</button>
          <div className="w-px h-4 bg-slate-300 mx-2"></div>
          <button onClick={() => setView(AppView.ADMIN_LOGIN)} className="hover:text-indigo-600 flex items-center gap-1">
             Admin
             {isOfflineMode && <span title="Offline Mode" className="w-2 h-2 rounded-full bg-yellow-400"></span>}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-slate-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 shadow-xl p-4 flex flex-col gap-4 text-sm font-medium text-slate-600 animate-in slide-in-from-top-2">
          <button onClick={() => { setView(AppView.LANDING); setIsMobileMenuOpen(false); }} className="flex items-center gap-2 py-2 px-4 hover:bg-slate-50 rounded-lg">
             <HomeIcon className="w-4 h-4" /> Home
          </button>
          <button onClick={() => { setView(AppView.HOW_IT_WORKS); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left">How It Works</button>
          <button onClick={() => { setView(AppView.WHY_REFINANCE); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left">Why Refinance</button>
          <button onClick={() => { setView(AppView.CALCULATOR); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left">Loan Calculator</button>
          <button onClick={() => { setView(AppView.PAYROLL); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left">Payroll Calculator</button>
          <button onClick={() => { setView(AppView.FAQ); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left">FAQ</button>
          <div className="h-px bg-slate-100 my-1"></div>
          <button onClick={() => { setView(AppView.ADMIN_LOGIN); setIsMobileMenuOpen(false); }} className="py-2 px-4 hover:bg-slate-50 rounded-lg text-left text-indigo-600 flex justify-between items-center">
             Admin Login
             {isOfflineMode && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Offline</span>}
          </button>
        </div>
      )}
      
      {/* Offline Alert Banner */}
      {isOfflineMode && (
          <div className="bg-yellow-50 text-yellow-800 text-[10px] md:text-xs text-center py-1 border-b border-yellow-200 flex items-center justify-center gap-2" title={connectionError || "Connection Error"}>
              <AlertTriangle className="w-3 h-3" />
              <span>Offline Mode: {connectionError ? `Error: ${connectionError}` : "Data saved locally."}</span>
              <button 
                onClick={connectToDatabase} 
                disabled={isRetrying}
                className="flex items-center gap-1 bg-yellow-100 hover:bg-yellow-200 border border-yellow-300 rounded px-2 py-0.5 font-bold transition-colors disabled:opacity-50"
              >
                {isRetrying ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Retry
              </button>
          </div>
      )}
    </nav>
  );

  const renderView = () => {
    // Show Loader while fetching unique link
    if (isProcessingLink) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-bold text-slate-800">Loading Application...</h2>
                <p className="text-slate-500">Retrieving secure data.</p>
            </div>
        );
    }

    switch (view) {
      case AppView.LANDING:
        return <LandingPage onStart={startApplication} onNavigate={setView} />;
      case AppView.ADMIN_LOGIN:
        return <AdminLogin onLogin={() => setView(AppView.ADMIN_DASHBOARD)} onBack={() => setView(AppView.LANDING)} />;
      case AppView.HOW_IT_WORKS:
        return <HowItWorks onBack={() => setView(AppView.LANDING)} />;
      case AppView.WHY_REFINANCE:
        return <WhyRefinance onBack={() => setView(AppView.LANDING)} />;
      case AppView.CALCULATOR:
        return <RefinanceCalculator onBack={() => setView(AppView.LANDING)} />;
      case AppView.PAYROLL:
        return <PayrollCalculator onBack={() => setView(AppView.LANDING)} />;
      case AppView.FAQ:
        return <FAQPage onBack={() => setView(AppView.LANDING)} faqs={faqs} />;
      case AppView.PRIVACY:
        return <PrivacyPolicy onBack={() => setView(AppView.LANDING)} />;
      case AppView.QUICK_QUOTE:
        return <QuickQuoteForm initialGoal={goal} onComplete={handleQuickQuoteComplete} onBack={() => setView(AppView.LANDING)} />;
      case AppView.QUICK_QUOTE_SUCCESS:
        return quickQuoteData ? <QuickQuoteSuccess data={quickQuoteData} onSimulateLinkClick={handleSimulateWhatsAppLink} onHome={() => setView(AppView.LANDING)} /> : null;
      case AppView.QUICK_REPORT:
        return quickQuoteData ? <QuickAnalysisReport data={quickQuoteData} onUnlock={handleUnlockFullReport} onBack={() => setView(AppView.QUICK_QUOTE)} /> : null;
      case AppView.FORM:
        return <MultiStepForm initialGoal={goal} initialData={quickQuoteData} onSubmit={handleFormSubmit} onBack={() => setView(AppView.LANDING)} />;
      case AppView.RESULTS:
        return activeClientData ? <ResultsDashboard clientData={activeClientData} onProceed={handleProceedToUpload} /> : null;
      case AppView.UPLOAD:
        return <DocumentUpload onComplete={handleUploadComplete} />;
      case AppView.SUCCESS:
        return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center relative overflow-hidden bg-theme-wave">
             <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>
            <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-lg border border-white/50">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Application Submitted!</h1>
              <p className="text-slate-500 max-w-md mb-8 mx-auto">
                We have received your documents securely. A consultant will review your application and contact you within 24 hours.
              </p>
              {isOfflineMode && (
                 <div className="bg-yellow-50 border border-yellow-100 p-2 rounded text-xs text-yellow-700 mb-4">
                    Offline Mode: Data saved locally. Reconnect to sync.
                 </div>
              )}
              <Button onClick={() => setView(AppView.LANDING)}>Return Home</Button>
            </div>
          </div>
        );
      case AppView.ADMIN_DASHBOARD:
        return (
          <AdminPanel 
            clients={clients} 
            onUpdateStatus={updateClientStatus} 
            onToggleLinkSent={handleToggleLinkSent}
            onMoveToTrash={handleMoveToTrash}
            onLogout={() => setView(AppView.LANDING)}
            faqs={faqs}
            onAddFaq={addFaq}
            onDeleteFaq={deleteFaq}
            onEditFaq={editFaq}
            isOfflineMode={isOfflineMode}
            connectionError={connectionError}
            onRetryConnection={connectToDatabase}
          />
        );
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <div className="min-h-screen pt-16">
      <Navbar />
      {renderView()}
    </div>
  );
}