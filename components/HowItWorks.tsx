import React from 'react';
import { AppView } from '../types';
import { ArrowLeft, FileText, Calculator, CheckCircle, UploadCloud } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const HowItWorks: React.FC<Props> = ({ onBack }) => {
  const steps = [
    {
      icon: <Calculator className="w-8 h-8 text-indigo-600" />,
      title: "1. Check Eligibility",
      description: "Use our interactive form to input your income, commitments, and property details. Our system instantly estimates your Debt Service Ratio (DSR) and Max Loan Eligibility."
    },
    {
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      title: "2. View Offers",
      description: "Based on your profile, we generate a comparison of the best rates from multiple banks. We show you exactly how much you can save or cash out."
    },
    {
      icon: <UploadCloud className="w-8 h-8 text-indigo-600" />,
      title: "3. Submit Documents",
      description: "Upload your documents securely through our portal. No need to visit physical branches. We handle the submission to all selected banks."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "4. Approval & Disbursement",
      description: "Track your status online. Once approved, you sign the offer letter and lawyers handle the rest until your cash is disbursed."
    }
  ];

  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <h1 className="text-4xl font-bold text-slate-800 mb-4 text-center">How ApexRefi Works</h1>
        <p className="text-slate-600 text-center max-w-2xl mx-auto mb-12">
          We simplify the complex mortgage process into 4 easy steps, ensuring you get the best deal with zero hassle.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg border border-indigo-50 hover:border-indigo-200 transition-all">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-indigo-900 rounded-3xl p-8 md:p-12 text-center text-white shadow-xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to start saving?</h2>
          <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
            Join thousands of Malaysians who have successfully lowered their monthly commitments.
          </p>
          <button onClick={onBack} className="bg-white text-indigo-900 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition-colors shadow-lg">
            Start My Application
          </button>
        </div>
      </div>
    </div>
  );
};