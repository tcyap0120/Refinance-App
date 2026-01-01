import React, { useState } from 'react';
import { ClientData, EmploymentType, RefiGoal, PropertyType } from '../types';
import { Button } from './ui/Button';
import { CheckCircle2, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

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
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, subLabel }) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input 
      type="number" 
      className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
      value={value || ''}
      onChange={e => onChange(Number(e.target.value))}
    />
    {subLabel && <p className="text-xs text-slate-500 mt-1">{subLabel}</p>}
  </div>
);

interface Props {
  initialGoal: RefiGoal;
  onSubmit: (data: ClientData) => void;
  onBack: () => void;
}

export const MultiStepForm: React.FC<Props> = ({ initialGoal, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  
  const [formData, setFormData] = useState<Partial<ClientData>>({
    status: 'Pending',
    
    // Default nested objects to avoid undefined errors
    income: {
      fixedSalary: 0, fixedAllowance: 0, variableCommission: 0, 
      variableBonus: 0, variableOvertime: 0, rentalIncome: 0, 
      businessIncome: 0, dividends: 0
    },
    commitments: {
      existingHomeLoan: 0, carLoans: 0, personalLoans: 0, 
      creditCardOutstanding: 0, bnpl: 0, ptptn: 0, otherLiabilities: 0
    },
    property: {
      address: '', type: PropertyType.LANDED, titleType: 'Residential', 
      marketValue: 500000, isOwnerOccupied: true, outstandingBalance: 300000, 
      currentInterestRate: 4.5, remainingTenure: 20, lockInPeriodEndsYear: 0
    },
    credit: {
      latePayments12Months: false, monthsInArrears: 0, 
      restructured: false, bankruptcy: false
    },
    request: {
      goal: initialGoal, desiredCashOut: 0, desiredTenure: 30
    }
  });

  // Generic handler for root properties
  const handleChange = (field: keyof ClientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      // Basic validation
      if (formData.name && formData.ic) { 
        onSubmit(formData as ClientData);
      } else {
        alert("Please complete personal details.");
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
            step === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 
            step > s ? 'bg-green-500 text-white shadow-md shadow-green-500/20' : 'bg-slate-200 text-slate-500'
          }`}>
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
          {s < totalSteps && (
            <div className={`w-6 md:w-12 h-1 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 relative bg-theme-wave">
      
      {/* Background Overlay (75% White) */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[1px]"></div>

      <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur rounded-2xl shadow-xl border border-slate-100 p-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{formData.request?.goal} Application</span>
        </div>

        {renderStepIndicator()}

        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {step === 1 && "Personal Profile & Employment"}
          {step === 2 && "Income Analysis (Monthly Gross)"}
          {step === 3 && "Financial Commitments & Credit"}
          {step === 4 && "Property & Existing Loan"}
          {step === 5 && "Refinance Objectives"}
        </h2>

        <div className="space-y-6 min-h-[400px]">
          
          {/* STEP 1: Personal & Employment */}
          {step === 1 && (
            <div className="space-y-6 fade-in">
              <InputGroup label="Personal Details">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                    value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">IC / Passport</label>
                  <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                    value={formData.ic || ''} onChange={e => handleChange('ic', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Age</label>
                  <input type="number" className="w-full p-2 border border-slate-300 rounded mt-1" 
                    value={formData.age || ''} onChange={e => handleChange('age', Number(e.target.value))} />
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

              <InputGroup label="Employment Info">
                <div>
                   <label className="block text-sm font-medium text-slate-700">Employment Type</label>
                   <select className="w-full p-2 border border-slate-300 rounded mt-1 bg-white"
                     value={formData.employmentType} onChange={e => handleChange('employmentType', e.target.value)}>
                     <option value={EmploymentType.PERMANENT}>Permanent Employee</option>
                     <option value={EmploymentType.CONTRACT}>Contract</option>
                     <option value={EmploymentType.SELF_EMPLOYED}>Self-Employed</option>
                     <option value={EmploymentType.BUSINESS_OWNER}>Business Owner</option>
                   </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Years in Service</label>
                  <input type="number" className="w-full p-2 border border-slate-300 rounded mt-1" 
                    value={formData.yearsInService || ''} onChange={e => handleChange('yearsInService', Number(e.target.value))} />
                </div>
              </InputGroup>
            </div>
          )}

          {/* STEP 2: Income */}
          {step === 2 && (
            <div className="space-y-6 fade-in">
              <div className="bg-blue-50 p-4 rounded text-sm text-blue-800 flex items-start gap-2 border border-blue-100">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>Enter <strong>Gross Monthly Income</strong>. Our system will apply the necessary haircuts automatically based on bank policies (e.g., 50% for bonuses).</span>
              </div>

              <InputGroup label="Fixed Income">
                <NumberInput label="Basic Salary" value={formData.income?.fixedSalary} onChange={(v: number) => handleNestedChange('income', 'fixedSalary', v)} />
                <NumberInput label="Fixed Allowances" value={formData.income?.fixedAllowance} onChange={(v: number) => handleNestedChange('income', 'fixedAllowance', v)} />
              </InputGroup>

              <InputGroup label="Variable Income (Average)">
                <NumberInput label="Commission" value={formData.income?.variableCommission} onChange={(v: number) => handleNestedChange('income', 'variableCommission', v)} />
                <NumberInput label="Bonus (Monthly Avg)" value={formData.income?.variableBonus} onChange={(v: number) => handleNestedChange('income', 'variableBonus', v)} />
                <NumberInput label="Overtime" value={formData.income?.variableOvertime} onChange={(v: number) => handleNestedChange('income', 'variableOvertime', v)} />
              </InputGroup>

              <InputGroup label="Other Sources">
                <NumberInput label="Rental Income" value={formData.income?.rentalIncome} onChange={(v: number) => handleNestedChange('income', 'rentalIncome', v)} />
                <NumberInput label="Business/Dividends" value={formData.income?.businessIncome} onChange={(v: number) => handleNestedChange('income', 'businessIncome', v)} />
              </InputGroup>
            </div>
          )}

          {/* STEP 3: Commitments & Credit */}
          {step === 3 && (
            <div className="space-y-6 fade-in">
              <InputGroup label="Monthly Instalments">
                <NumberInput label="Car Loans" value={formData.commitments?.carLoans} onChange={(v: number) => handleNestedChange('commitments', 'carLoans', v)} />
                <NumberInput label="Personal Loans" value={formData.commitments?.personalLoans} onChange={(v: number) => handleNestedChange('commitments', 'personalLoans', v)} />
                <NumberInput label="PTPTN" value={formData.commitments?.ptptn} onChange={(v: number) => handleNestedChange('commitments', 'ptptn', v)} />
                <NumberInput label="BNPL / Instalments" value={formData.commitments?.bnpl} onChange={(v: number) => handleNestedChange('commitments', 'bnpl', v)} />
              </InputGroup>

              <InputGroup label="Credit Cards">
                <NumberInput 
                  label="Outstanding Balance" 
                  subLabel="We calculate 5% as commitment"
                  value={formData.commitments?.creditCardOutstanding} 
                  onChange={(v: number) => handleNestedChange('commitments', 'creditCardOutstanding', v)} 
                />
              </InputGroup>

              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-sm font-semibold text-red-900 mb-3 uppercase tracking-wide">Risk Declaration</h3>
                <div className="grid grid-cols-1 gap-3">
                  <label className="flex items-center gap-3">
                     <input type="checkbox" className="w-4 h-4 text-red-600 rounded" 
                       checked={formData.credit?.latePayments12Months}
                       onChange={e => handleNestedChange('credit', 'latePayments12Months', e.target.checked)} />
                     <span className="text-sm">Any late payments in last 12 months?</span>
                  </label>
                  <label className="flex items-center gap-3">
                     <input type="checkbox" className="w-4 h-4 text-red-600 rounded" 
                       checked={formData.credit?.bankruptcy}
                       onChange={e => handleNestedChange('credit', 'bankruptcy', e.target.checked)} />
                     <span className="text-sm">History of bankruptcy or legal suits?</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Property */}
          {step === 4 && (
             <div className="space-y-6 fade-in">
                <InputGroup label="Collateral Details">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700">Property Address</label>
                    <input type="text" className="w-full p-2 border border-slate-300 rounded mt-1" 
                      value={formData.property?.address} onChange={e => handleNestedChange('property', 'address', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Property Type</label>
                     <select className="w-full p-2 border border-slate-300 rounded mt-1 bg-white"
                       value={formData.property?.type} onChange={e => handleNestedChange('property', 'type', e.target.value)}>
                       <option value={PropertyType.LANDED}>Landed</option>
                       <option value={PropertyType.CONDO}>Condo/Apartment</option>
                       <option value={PropertyType.COMMERCIAL}>Commercial</option>
                     </select>
                  </div>
                   <NumberInput label="Market Value (Est.)" value={formData.property?.marketValue} onChange={(v: number) => handleNestedChange('property', 'marketValue', v)} />
                </InputGroup>

                <InputGroup label="Current Mortgage">
                   <NumberInput label="Outstanding Balance" value={formData.property?.outstandingBalance} onChange={(v: number) => handleNestedChange('property', 'outstandingBalance', v)} />
                   <NumberInput label="Current Rate (%)" value={formData.property?.currentInterestRate} onChange={(v: number) => handleNestedChange('property', 'currentInterestRate', v)} />
                   <NumberInput label="Remaining Tenure (Yrs)" value={formData.property?.remainingTenure} onChange={(v: number) => handleNestedChange('property', 'remainingTenure', v)} />
                </InputGroup>
             </div>
          )}

          {/* STEP 5: Request */}
          {step === 5 && (
            <div className="space-y-6 fade-in">
              <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-center">
                <h3 className="text-lg font-bold text-indigo-900 mb-2">Final Step: Your Goal</h3>
                <p className="text-slate-600 mb-6">Customize your desired refinance package.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Refinance Objective</label>
                     <select className="w-full p-3 border border-slate-300 rounded bg-white"
                       value={formData.request?.goal} onChange={e => handleNestedChange('request', 'goal', e.target.value)}>
                       <option value={RefiGoal.CASH_OUT}>Cash Out</option>
                       <option value={RefiGoal.SAVE_INTEREST}>Save Interest</option>
                     </select>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Desired Tenure (Years)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded" 
                      value={formData.request?.desiredTenure} onChange={e => handleNestedChange('request', 'desiredTenure', Number(e.target.value))} />
                  </div>
                  {formData.request?.goal === RefiGoal.CASH_OUT && (
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1">Cash Out Amount Needed ($)</label>
                       <input type="number" className="w-full p-3 border border-slate-300 rounded font-bold text-indigo-600" 
                        value={formData.request?.desiredCashOut} onChange={e => handleNestedChange('request', 'desiredCashOut', Number(e.target.value))} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onBack()}>
             <ChevronLeft className="inline-block w-4 h-4 mr-1" /> Previous
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {step === totalSteps ? 'Run Analysis' : 'Next Step'} <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};