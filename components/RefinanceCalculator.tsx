import React, { useState, useMemo } from 'react';
import { calculatePMT, calculateAmortizationSchedule } from '../services/calculations';
import { ArrowLeft, RefreshCw } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const RefinanceCalculator: React.FC<Props> = ({ onBack }) => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [currentRate, setCurrentRate] = useState(4.5);
  const [newRate, setNewRate] = useState(3.8);
  const [tenure, setTenure] = useState(30);

  const currentPayment = useMemo(() => calculatePMT(loanAmount, currentRate, tenure), [loanAmount, currentRate, tenure]);
  const newPayment = useMemo(() => calculatePMT(loanAmount, newRate, tenure), [loanAmount, newRate, tenure]);
  
  const monthlySaving = currentPayment - newPayment;
  const totalSaving = monthlySaving * tenure * 12;

  const amortization = useMemo(() => calculateAmortizationSchedule(loanAmount, newRate, tenure), [loanAmount, newRate, tenure]);

  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Refinance Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Inputs */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600" /> Parameters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Loan Amount ($)</label>
                <input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className="w-full p-2 border rounded" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current Rate (%)</label>
                  <input type="number" step="0.05" value={currentRate} onChange={e => setCurrentRate(Number(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Rate (%)</label>
                  <input type="number" step="0.05" value={newRate} onChange={e => setNewRate(Number(e.target.value))} className="w-full p-2 border rounded border-indigo-300 bg-indigo-50" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tenure (Years)</label>
                <input type="range" min="5" max="35" value={tenure} onChange={e => setTenure(Number(e.target.value))} className="w-full accent-indigo-600" />
                <div className="text-right text-sm text-slate-500">{tenure} Years</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Estimated Monthly Saving</p>
                <p className="text-3xl font-bold text-green-600">+ ${Math.round(monthlySaving).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-2">Total Interest Saved: ${Math.round(totalSaving).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col h-[500px]">
             <h3 className="font-bold text-lg mb-4">New Loan Amortization Schedule (Yearly)</h3>
             <div className="flex-grow overflow-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-600 sticky top-0">
                   <tr>
                     <th className="p-3">Year</th>
                     <th className="p-3">Interest Paid</th>
                     <th className="p-3">Principal Paid</th>
                     <th className="p-3">Ending Balance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {amortization.map((row) => (
                     <tr key={row.year} className="hover:bg-slate-50">
                       <td className="p-3 font-medium">{row.year}</td>
                       <td className="p-3 text-red-500">${Math.round(row.interest).toLocaleString()}</td>
                       <td className="p-3 text-green-600">${Math.round(row.principal).toLocaleString()}</td>
                       <td className="p-3 text-slate-700 font-bold">${Math.round(row.balance).toLocaleString()}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};