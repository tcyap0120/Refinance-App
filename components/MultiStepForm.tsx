
import React, { useState, useEffect } from 'react';
import { ClientData, EmploymentType, RefiGoal, PropertyType, QuickQuoteData, PropertyCategory, BusinessNature } from '../types';
import { calculateEligibility } from '../services/calculations';
import { Button } from './ui/Button';
import { CheckCircle2, ChevronLeft, ChevronRight, AlertCircle, AlertTriangle, UserCheck } from 'lucide-react';

interface InputGroupProps {
  label: string;
  children?: React.ReactNode;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, children }) => (
  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
    <h3 className="text-sm font-semibold text-indigo-900 mb-3 uppercase tracking-wide">{label}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {children}
    </div>
  </div>
);

interface NumberInputProps {
  label: string;
  value: number | undefined | null;
  onChange: (val: number) => void;
  subLabel?: string;
  error?: string;
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, subLabel, error }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      type="number" 
      className={`w-full p-2 border rounded focus:ring-2 outline-none transition-all ${
        error ? 'border-red-500 bg-red-50 focus:ring-red-200' : 'border-slate-300 focus:ring-indigo-500'
      }`}
      value={value || ''}
      onChange={e => onChange(Number(e.target.value))}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    {subLabel && !error && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
  </div>
);

interface Props {
  initialGoal: RefiGoal;
  initialData?: QuickQuoteData | null; // Accept pre-filled data
  onSubmit: (data: ClientData) => void;
  onBack: () => void;
}

export const MultiStepForm: React.FC<Props> = ({ initialGoal, initialData, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Step 1: Income Analysis
  // Step 2: Commitments -> CHECK ELIGIBILITY
  // Step 3: Personal Details (If passed)
  
  const [isEligible, setIsEligible] = useState<boolean | null>(null);
  const [eligibilityReason, setEligibilityReason] = useState<string[]>([]);

  // Employment Category State for Step 1 Logic
  const [empCategory, setEmpCategory] = useState<'EMPLOYEE' | 'COMMISSION' | 'BUSINESS'>('EMPLOYEE');

  const [formData, setFormData] = useState<Partial<ClientData>>({
    status: 'Pending',
    employmentType: EmploymentType.PERMANENT,
    
    // Default nested objects to avoid undefined errors
    income: {
      fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, 
      variableBonus: 0, variableOvertime: 0, rentalIncome: 0, partTimeIncome: 0,
      avgMonthlyCommission: 0, annualDeclaredIncome: 0, avgMonthlyRevenue: 0
    },
    commitments: {
      existingHomeLoan: 0, carLoans: 0, personalLoans: 0, 
      creditCardOutstanding: 0, ptptn: 0, otherLiabilities: 0
    },
    property: {
      address: '', 
      category: PropertyCategory.LANDED,
      type: PropertyType.TERRACE, 
      titleType: 'Residential', 
      marketValue: 500000, isOwnerOccupied: true, outstandingBalance: 300000, 
      currentInterestRate: 4.5, currentInstallment: 0, remainingTenure: 20, lockInPeriodEndsYear: 0,
      storeys: 1, landSize: 0, builtUpSize: 0
    },
    // Initialize credit as undefined to force selection validation
    credit: {
      akpk: undefined as any,
      latePayments12Months: undefined as any, 
      monthsInArrears: 0, 
      restructured: false, 
      bankruptcy: undefined as any
    },
    request: {
      goal: initialGoal, desiredCashOut: 0, desiredTenure: 35
    }
  });

  // Handle Employment Category Change
  const handleEmpCategoryChange = (cat: 'EMPLOYEE' | 'COMMISSION' | 'BUSINESS') => {
      setEmpCategory(cat);
      // Set default sub-type based on category
      if (cat === 'EMPLOYEE') handleChange('employmentType', EmploymentType.PERMANENT);
      if (cat === 'COMMISSION') handleChange('employmentType', EmploymentType.COMMISSION_EARNER);
      if (cat === 'BUSINESS') handleChange('employmentType', EmploymentType.BUSINESS_OWNER);
  };

  // Effect to populate form with initial data from Quick Quote (Phase 1)
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name,
        phone: initialData.phone,
        age: initialData.age || prev.age,
        request: {
          ...prev.request!,
          goal: initialData.goal
        },
        property: {
          ...prev.property!,
          address: initialData.propertyAddress || prev.property?.address || '',
          category: initialData.propertyCategory || prev.property?.category || PropertyCategory.LANDED,
          type: initialData.propertyType || prev.property?.type || PropertyType.TERRACE,
          landSize: initialData.landSize || 0,
          builtUpSize: initialData.builtUpSize || 0,
          storeys: initialData.storeys || (initialData.propertyCategory === PropertyCategory.LANDED ? 1 : 0),
          marketValue: initialData.estimatedValue || prev.property?.marketValue || 0,
          outstandingBalance: initialData.outstandingBalance || prev.property?.outstandingBalance || 0,
          currentInterestRate: initialData.currentInterestRate || prev.property?.currentInterestRate || 4.5,
          currentInstallment: initialData.currentInstallment || prev.property?.currentInstallment || 0
        }
      }));
    }
  }, [initialData]);

  // Generic handler for root properties
  const handleChange = (field: keyof ClientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    clearError(field);
  };

  // Handler for nested objects (e.g., income.fixedSalary)
  const handleNestedChange = (parent: keyof ClientData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] as any,
        [field]: value
      }
    }));
    clearError(field);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.yearsInService) newErrors.yearsInService = "Years in service is required";
      
      // Income Validation based on Category
      if (empCategory === 'EMPLOYEE') {
          if (!formData.income?.fixedSalary) newErrors.fixedSalary = "Basic Salary is required";
      }
      if (empCategory === 'COMMISSION') {
          if (!formData.income?.avgMonthlyCommission) newErrors.avgMonthlyCommission = "Average Commission is required";
      }
      if (empCategory === 'BUSINESS') {
          if (!formData.income?.annualDeclaredIncome) newErrors.annualDeclaredIncome = "Declared Income is required";
          if (!formData.income?.avgMonthlyRevenue) newErrors.avgMonthlyRevenue = "Avg Revenue is required";
      }
    }

    if (currentStep === 2) {
      // Risk Declaration Validation
      if (formData.credit?.akpk === undefined) newErrors.akpk = "Please select Yes or No";
      if (formData.credit?.bankruptcy === undefined) newErrors.bankruptcy = "Please select Yes or No";
      if (formData.credit?.latePayments12Months === undefined) newErrors.latePayments12Months = "Please select Yes or No";
    }

    if (currentStep === 3) {
      if (!formData.name?.trim()) newErrors.name = "Full Name is required";
      if (!formData.ic?.trim()) newErrors.ic = "IC / Passport is required";
      if (!formData.age) newErrors.age = "Age is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }
    return isValid;
  };

  const handleRunEligibilityCheck = () => {
      const tempClientData = formData as ClientData;
      const result = calculateEligibility(tempClientData);
      
      if (result.approved) {
          setIsEligible(true);
          setEligibilityReason([]);
          setStep(3); // Move to Personal Details
      } else {
          setIsEligible(false);
          setEligibilityReason(result.reason);
      }
  };

  const handleNext = () => {
    if (validateStep(step)) {
      if (step === 1) {
          setStep(2);
      } else if (step === 2) {
          handleRunEligibilityCheck();
      } else if (step === 3) {
          onSubmit(formData as ClientData);
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
            step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 
            step > s ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-slate-200 text-slate-500'
          }`}>
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
          {s < 3 && (
            <div className={`w-6 md:w-12 h-1 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  const getInputClass = (field: string) => `w-full p-2 border rounded mt-1 outline-none transition-all ${
    errors[field] ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
  }`;

  // If Not Eligible, show rejection screen inside the form area
  if (isEligible === false) {
      return (
        <div className="min-h-screen py-10 px-4 relative bg-theme-wave flex items-center justify-center">
            <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[1px]"></div>
            <div className="max-w-lg w-full bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-red-100 p-8 relative z-10 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Eligibility Check Failed</h2>
                <p className="text-slate-500 mb-6">Based on the income and commitments provided, we cannot proceed with the application at this time.</p>
                
                <div className="bg-red-50 p-4 rounded-xl text-left mb-6">
                    <p className="font-bold text-red-800 text-sm mb-2">Reasons:</p>
                    <ul className="list-disc pl-5 text-sm text-red-700">
                        {eligibilityReason.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                </div>

                <Button onClick={() => { setIsEligible(null); setStep(1); }} variant="outline">
                    Edit Financial Details
                </Button>
                <div className="mt-4">
                     <button onClick={onBack} className="text-slate-400 hover:text-slate-600 text-sm">Return Home</button>
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen py-10 px-4 relative bg-theme-wave">
      
      {/* Background Overlay (75% White) */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[1px]"></div>

      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 p-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Eligibility Check</span>
        </div>

        {renderStepIndicator()}

        {/* Global Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700 font-bold">Please fix the errors below to proceed.</p>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {step === 1 && "Step 1: Income Analysis"}
          {step === 2 && "Step 2: Financial Commitments"}
          {step === 3 && "Final Step: Personal Details"}
        </h2>

        <div className="space-y-6 min-h-[400px]">
          
          {/* STEP 1: Income */}
          {step === 1 && (
            <div className="space-y-6 fade-in">
              <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 flex items-start gap-2 border border-blue-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Please select your employment type correctly. This affects how banks calculate your income.</span>
              </div>

               <InputGroup label="Employment Category">
                 <div className="md:col-span-2 flex flex-col md:flex-row gap-4 mb-4">
                     <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center hover:bg-slate-50 ${empCategory === 'EMPLOYEE' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 font-semibold text-indigo-800' : ''}`}>
                         <input type="radio" name="empCategory" className="hidden" onClick={() => handleEmpCategoryChange('EMPLOYEE')} />
                         Employee<br/><span className="text-xs font-normal text-slate-500">Permanent / Contract</span>
                     </label>
                     <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center hover:bg-slate-50 ${empCategory === 'COMMISSION' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 font-semibold text-indigo-800' : ''}`}>
                         <input type="radio" name="empCategory" className="hidden" onClick={() => handleEmpCategoryChange('COMMISSION')} />
                         Commission Earner<br/><span className="text-xs font-normal text-slate-500">Agents / Freelance</span>
                     </label>
                     <label className={`flex-1 p-3 border rounded-lg cursor-pointer text-center hover:bg-slate-50 ${empCategory === 'BUSINESS' ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 font-semibold text-indigo-800' : ''}`}>
                         <input type="radio" name="empCategory" className="hidden" onClick={() => handleEmpCategoryChange('BUSINESS')} />
                         Business Owner<br/><span className="text-xs font-normal text-slate-500">Self-Employed</span>
                     </label>
                 </div>
                 
                 {/* Specific Sub-types for Employee only */}
                 {empCategory === 'EMPLOYEE' && (
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Contract Type</label>
                        <select className="w-full p-2 border border-slate-300 rounded mt-1 bg-white"
                             value={formData.employmentType} onChange={e => handleChange('employmentType', e.target.value)}>
                             <option value={EmploymentType.PERMANENT}>Permanent</option>
                             <option value={EmploymentType.CONTRACT}>Contract</option>
                        </select>
                    </div>
                 )}
                 
                 {/* Business Nature for Business Owner */}
                 {empCategory === 'BUSINESS' && (
                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-700">Business Nature</label>
                        <select className="w-full p-2 border border-slate-300 rounded mt-1 bg-white"
                             value={formData.income?.businessNature} onChange={e => handleNestedChange('income', 'businessNature', e.target.value)}>
                             <option value={BusinessNature.RETAIL}>Retail / Trading</option>
                             <option value={BusinessNature.F_AND_B}>Food & Beverage</option>
                             <option value={BusinessNature.SERVICES}>Professional Services</option>
                             <option value={BusinessNature.MANUFACTURING}>Manufacturing / Construction</option>
                             <option value={BusinessNature.TECHNOLOGY}>Technology / IT</option>
                             <option value={BusinessNature.LOGISTICS}>Logistics / Transport</option>
                             <option value={BusinessNature.OTHER}>Other</option>
                        </select>
                    </div>
                 )}

                 <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Years in Service / Business</label>
                    <input 
                        type="number" 
                        className={getInputClass('yearsInService')}
                        value={formData.yearsInService || ''} 
                        onChange={e => handleChange('yearsInService', Number(e.target.value))} 
                    />
                    {errors.yearsInService && <p className="text-red-500 text-xs mt-1">{errors.yearsInService}</p>}
                 </div>
              </InputGroup>

              {/* DYNAMIC FIELDS BASED ON CATEGORY */}
              
              {/* SCENARIO A: EMPLOYEE */}
              {empCategory === 'EMPLOYEE' && (
                <>
                  <InputGroup label="Fixed Income">
                    <NumberInput label="Basic Salary (RM)" value={formData.income?.fixedSalary} onChange={(v: number) => handleNestedChange('income', 'fixedSalary', v)} error={errors.fixedSalary} />
                    <NumberInput label="Fixed Allowances (RM)" value={formData.income?.fixedAllowance} onChange={(v: number) => handleNestedChange('income', 'fixedAllowance', v)} />
                  </InputGroup>

                  <InputGroup label="Variable Income (Monthly Average)">
                    <NumberInput label="Commission (RM)" value={formData.income?.variableCommission} onChange={(v: number) => handleNestedChange('income', 'variableCommission', v)} />
                    <NumberInput label="Bonus (Avg RM/mth)" subLabel="Total Annual Bonus / 12" value={formData.income?.variableBonus} onChange={(v: number) => handleNestedChange('income', 'variableBonus', v)} />
                    <NumberInput label="Overtime (RM)" value={formData.income?.variableOvertime} onChange={(v: number) => handleNestedChange('income', 'variableOvertime', v)} />
                  </InputGroup>
                </>
              )}

              {/* SCENARIO B: COMMISSION EARNER */}
              {empCategory === 'COMMISSION' && (
                  <InputGroup label="Income Details">
                    <NumberInput label="6-Months Avg Commission (RM)" value={formData.income?.avgMonthlyCommission} onChange={(v: number) => handleNestedChange('income', 'avgMonthlyCommission', v)} error={errors.avgMonthlyCommission} />
                  </InputGroup>
              )}

              {/* SCENARIO C: BUSINESS OWNER */}
              {empCategory === 'BUSINESS' && (
                   <>
                    <InputGroup label="Annual Income (2024)">
                        <NumberInput label="Declared Personal Income (RM)" subLabel="Total annual income declared to LHDN" value={formData.income?.annualDeclaredIncome} onChange={(v: number) => handleNestedChange('income', 'annualDeclaredIncome', v)} error={errors.annualDeclaredIncome} />
                        <NumberInput label="Tax Paid (RM)" subLabel="Optional" value={formData.income?.annualTaxPaid} onChange={(v: number) => handleNestedChange('income', 'annualTaxPaid', v)} />
                    </InputGroup>
                    <InputGroup label="Company Revenue">
                        <NumberInput label="Avg Monthly Revenue (RM)" subLabel="Last 6 months company turnover" value={formData.income?.avgMonthlyRevenue} onChange={(v: number) => handleNestedChange('income', 'avgMonthlyRevenue', v)} error={errors.avgMonthlyRevenue} />
                    </InputGroup>
                   </>
              )}

              {/* SHARED: OTHER SOURCES */}
              <InputGroup label="Other Income">
                <NumberInput label="Rental Income (RM)" value={formData.income?.rentalIncome} onChange={(v: number) => handleNestedChange('income', 'rentalIncome', v)} />
                <NumberInput label="Part-time / Side Income (RM)" value={formData.income?.partTimeIncome} onChange={(v: number) => handleNestedChange('income', 'partTimeIncome', v)} />
              </InputGroup>
            </div>
          )}

          {/* STEP 2: Commitments & Credit */}
          {step === 2 && (
            <div className="space-y-6 fade-in">
              <InputGroup label="Monthly Instalments">
                <NumberInput label="Existing House Loan (RM)" value={formData.commitments?.existingHomeLoan} onChange={(v: number) => handleNestedChange('commitments', 'existingHomeLoan', v)} />
                <NumberInput label="Car Loans (RM)" value={formData.commitments?.carLoans} onChange={(v: number) => handleNestedChange('commitments', 'carLoans', v)} />
                <NumberInput label="Personal Loans (RM)" value={formData.commitments?.personalLoans} onChange={(v: number) => handleNestedChange('commitments', 'personalLoans', v)} />
                <NumberInput label="PTPTN (RM)" value={formData.commitments?.ptptn} onChange={(v: number) => handleNestedChange('commitments', 'ptptn', v)} />
              </InputGroup>

              <InputGroup label="Credit Cards">
                <NumberInput 
                  label="Outstanding Balance (RM)" 
                  subLabel="Banks calculate 5% as commitment"
                  value={formData.commitments?.creditCardOutstanding} 
                  onChange={(v: number) => handleNestedChange('commitments', 'creditCardOutstanding', v)} 
                />
              </InputGroup>

              <div className={`bg-red-50 p-4 rounded-lg border ${errors.akpk || errors.bankruptcy || errors.latePayments12Months ? 'border-red-500 ring-2 ring-red-200' : 'border-red-100'}`}>
                <h3 className="text-sm font-semibold text-red-900 mb-3 uppercase tracking-wide">Risk Declaration</h3>
                <div className="grid grid-cols-1 gap-4">
                  
                  {/* QUESTION 1: AKPK */}
                  <div className="flex flex-col gap-2">
                     <span className="text-sm text-slate-800">1. Are you currently under AKPK?</span>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="akpk" className="w-4 h-4 text-red-600" 
                             checked={formData.credit?.akpk === true}
                             onChange={() => { handleNestedChange('credit', 'akpk', true); clearError('akpk'); }} />
                           <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="akpk" className="w-4 h-4 text-green-600" 
                             checked={formData.credit?.akpk === false}
                             onChange={() => { handleNestedChange('credit', 'akpk', false); clearError('akpk'); }} />
                           <span className="text-sm">No</span>
                        </label>
                     </div>
                     {errors.akpk && <p className="text-red-500 text-xs">{errors.akpk}</p>}
                  </div>

                  {/* QUESTION 2: BANKRUPTCY */}
                  <div className="flex flex-col gap-2">
                     <span className="text-sm text-slate-800">2. Any history of Bankruptcy?</span>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="bankruptcy" className="w-4 h-4 text-red-600" 
                             checked={formData.credit?.bankruptcy === true}
                             onChange={() => { handleNestedChange('credit', 'bankruptcy', true); clearError('bankruptcy'); }} />
                           <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="bankruptcy" className="w-4 h-4 text-green-600" 
                             checked={formData.credit?.bankruptcy === false}
                             onChange={() => { handleNestedChange('credit', 'bankruptcy', false); clearError('bankruptcy'); }} />
                           <span className="text-sm">No</span>
                        </label>
                     </div>
                     {errors.bankruptcy && <p className="text-red-500 text-xs">{errors.bankruptcy}</p>}
                  </div>

                  {/* QUESTION 3: LATE PAYMENT > 2 MONTHS */}
                  <div className="flex flex-col gap-2">
                     <span className="text-sm text-slate-800">3. Any late payments over 2 months in the last year?</span>
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="latePayments" className="w-4 h-4 text-red-600" 
                             checked={formData.credit?.latePayments12Months === true}
                             onChange={() => { handleNestedChange('credit', 'latePayments12Months', true); clearError('latePayments12Months'); }} />
                           <span className="text-sm">Yes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="radio" name="latePayments" className="w-4 h-4 text-green-600" 
                             checked={formData.credit?.latePayments12Months === false}
                             onChange={() => { handleNestedChange('credit', 'latePayments12Months', false); clearError('latePayments12Months'); }} />
                           <span className="text-sm">No</span>
                        </label>
                     </div>
                     {errors.latePayments12Months && <p className="text-red-500 text-xs">{errors.latePayments12Months}</p>}
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Personal (Only visible if Step 2 Passed) */}
          {step === 3 && (
            <div className="space-y-6 fade-in">
              <div className="bg-green-100 p-4 rounded-lg flex items-center gap-3 mb-6">
                 <UserCheck className="w-6 h-6 text-green-700" />
                 <div>
                    <h3 className="font-bold text-green-800">You are Eligible!</h3>
                    <p className="text-sm text-green-700">Please provide your personal details to finalize the submission.</p>
                 </div>
              </div>

              <InputGroup label="Personal Details">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    className={getInputClass('name')}
                    value={formData.name || ''} 
                    onChange={e => handleChange('name', e.target.value)} 
                    disabled={!!initialData?.name} 
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">IC / Passport</label>
                  <input 
                    type="text" 
                    className={getInputClass('ic')}
                    value={formData.ic || ''} 
                    onChange={e => handleChange('ic', e.target.value)} 
                  />
                  {errors.ic && <p className="text-red-500 text-xs mt-1">{errors.ic}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Age</label>
                  <input 
                    type="number" 
                    className={getInputClass('age')}
                    value={formData.age || ''} 
                    onChange={e => handleChange('age', Number(e.target.value))} 
                  />
                  {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700">Citizenship</label>
                   <select className="w-full p-2 border border-slate-300 rounded mt-1 bg-white"
                     value={formData.citizenship} onChange={e => handleChange('citizenship', e.target.value)}>
                     <option value="Citizen">Citizen</option>
                     <option value="Non-Citizen">Non-Citizen</option>
                   </select>
                </div>
              </InputGroup>
              
              <InputGroup label="Confirmed Collateral">
                 <div className="col-span-2">
                    <p className="text-sm text-slate-500">Property</p>
                    <p className="font-medium">{formData.property?.address}</p>
                 </div>
                 <div>
                    <p className="text-sm text-slate-500">Type</p>
                    <p className="font-medium">{formData.property?.type}</p>
                 </div>
                  <div>
                    <p className="text-sm text-slate-500">Market Value</p>
                    <p className="font-medium">RM {formData.property?.marketValue.toLocaleString()}</p>
                 </div>
              </InputGroup>
            </div>
          )}

        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onBack()}>
             <ChevronLeft className="inline-block w-4 h-4 mr-1" /> Previous
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {step === 3 ? 'Final Submit' : (step === 2 ? 'Check Eligibility' : 'Next Step')} <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
