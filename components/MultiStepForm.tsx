import React, { useState } from 'react';
import { ClientData, EmploymentType, RefiGoal } from '../types';
import { Button } from './ui/Button';
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  initialGoal: RefiGoal;
  onSubmit: (data: ClientData) => void;
  onBack: () => void;
}

export const MultiStepForm: React.FC<Props> = ({ initialGoal, onSubmit, onBack }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  
  const [formData, setFormData] = useState<Partial<ClientData>>({
    goal: initialGoal,
    employmentType: EmploymentType.SALARIED,
    currentLoanBalance: 300000,
    currentInterestRate: 4.5,
    remainingTenure: 20,
    propertyValue: 500000,
    monthlyIncome: 5000,
    monthlyDebts: 1000
  });

  const handleChange = (field: keyof ClientData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
    else {
      // Final submission
      if (formData.name) { // Basic validation
        onSubmit(formData as ClientData);
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
            step === s ? 'bg-indigo-600 text-white' : 
            step > s ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
          </div>
          {s < 4 && (
            <div className={`w-10 h-1 ${step > s ? 'bg-green-500' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 flex items-center">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back
          </button>
          <span className="text-sm font-medium text-indigo-600">{formData.goal} Application</span>
        </div>

        {renderStepIndicator()}

        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
          {step === 1 && "Personal Details"}
          {step === 2 && "Employment Information"}
          {step === 3 && "Property & Loan Info"}
          {step === 4 && "Financial Commitments"}
        </h2>

        <div className="space-y-6 min-h-[300px]">
          {/* Step 1: Personal */}
          {step === 1 && (
            <div className="space-y-4 fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="John Doe"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="john@example.com"
                  value={formData.email || ''}
                  onChange={e => handleChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="+1 234 567 890"
                  value={formData.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Step 2: Employment */}
          {step === 2 && (
            <div className="space-y-4 fade-in">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
                <select 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  value={formData.employmentType}
                  onChange={e => handleChange('employmentType', e.target.value)}
                >
                  <option value={EmploymentType.SALARIED}>Salaried Employee</option>
                  <option value={EmploymentType.SELF_EMPLOYED}>Self-Employed / Business Owner</option>
                  <option value={EmploymentType.FREELANCE}>Freelance / Gig Worker</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Net Income ($)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.monthlyIncome}
                  onChange={e => handleChange('monthlyIncome', Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Step 3: Property & Loan */}
          {step === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-in">
               <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="123 Main St, City"
                  value={formData.address || ''}
                  onChange={e => handleChange('address', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Property Value ($)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.propertyValue}
                  onChange={e => handleChange('propertyValue', Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Existing Loan Balance ($)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.currentLoanBalance}
                  onChange={e => handleChange('currentLoanBalance', Number(e.target.value))}
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Interest Rate (%)</label>
                <input 
                  type="number" step="0.1"
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.currentInterestRate}
                  onChange={e => handleChange('currentInterestRate', Number(e.target.value))}
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Remaining Tenure (Years)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.remainingTenure}
                  onChange={e => handleChange('remainingTenure', Number(e.target.value))}
                />
              </div>
            </div>
          )}

          {/* Step 4: Commitments */}
          {step === 4 && (
            <div className="space-y-4 fade-in">
               <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Monthly Debt Payments ($)</label>
                <p className="text-xs text-slate-500 mb-2">Include car loans, credit cards, personal loans (exclude current mortgage).</p>
                <input 
                  type="number" 
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={formData.monthlyDebts}
                  onChange={e => handleChange('monthlyDebts', Number(e.target.value))}
                />
              </div>
              
              <div className="mt-8 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 text-indigo-600 rounded" required />
                  <span className="text-sm text-indigo-900">
                    I agree to the <a href="#" className="underline font-semibold">Privacy Policy</a> and consent to RefiSmart processing my personal data for the purpose of this application.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
          <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : onBack()}>
             <ChevronLeft className="inline-block w-4 h-4 mr-1" /> Previous
          </Button>
          <Button variant="primary" onClick={handleNext}>
            {step === totalSteps ? 'Calculate Eligibility' : 'Next Step'} <ChevronRight className="inline-block w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
