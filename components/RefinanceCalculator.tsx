
import React, { useState, useMemo } from 'react';
import { calculatePMT, calculateAmortizationSchedule } from '../services/calculations';
import { ArrowLeft, RefreshCw, AlertCircle, TrendingDown, TrendingUp, PiggyBank } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const RefinanceCalculator: React.FC<Props> = ({ onBack }) => {
  // Current Loan Inputs
  const [outstandingBalance, setOutstandingBalance] = useState(500000);
  const [currentRate, setCurrentRate] = useState(4.5);
  const [currentInstallment, setCurrentInstallment] = useState(2600); 

  // New Loan Inputs
  const [newRate, setNewRate] = useState(3.55);
  const [newTenure, setNewTenure] = useState(30);

  // 1. Calculate New Monthly Payment
  const newMonthlyPayment = useMemo(() => 
    calculatePMT(outstandingBalance, newRate, newTenure), 
  [outstandingBalance, newRate, newTenure]);

  // 2. Calculate Monthly Savings
  const monthlySaving = currentInstallment - newMonthlyPayment;

  // 3. Derive Old Loan Remaining Tenure to Estimate Total Interest
  const oldLoanAnalysis = useMemo(() => {
      if (currentInstallment <= 0 || outstandingBalance <= 0) return { valid: false, msg: '' };

      const r = currentRate / 100 / 12;
      const interestPortion = outstandingBalance * r;

      if (currentInstallment <= interestPortion) {
          return { 
              valid: false, 
              msg: `Installment too low (Interest is RM ${Math.round(interestPortion)})` 
          };
      }

      // Formula for n: -ln(1 - (r*PV)/PMT) / ln(1+r)
      const n = -Math.log(1 - (interestPortion / currentInstallment)) / Math.log(1 + r);
      const totalRemainingCost = currentInstallment * n;
      
      return { valid: true, totalRemainingCost, remainingMonths: n, msg: '' };
  }, [outstandingBalance, currentRate, currentInstallment]);

  // 4. Calculate Total Savings (Lifetime)
  const newTotalCost = newMonthlyPayment * newTenure * 12;
  const totalLifetimeSaving = oldLoanAnalysis.valid 
      ? oldLoanAnalysis.totalRemainingCost! - newTotalCost 
      : 0; // Fallback or invalid

  const amortization = useMemo(() => 
    calculateAmortizationSchedule(outstandingBalance, newRate, newTenure), 
  [outstandingBalance, newRate, newTenure]);

  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">Refinance Savings Calculator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Inputs (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Current Loan Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b pb-2">
                  1. Current Loan Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Outstanding Balance (RM)</label>
                    <input 
                        type="number" 
                        value={outstandingBalance} 
                        onChange={e => setOutstandingBalance(Number(e.target.value))} 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Interest Rate (%)</label>
                    <input 
                        type="number" 
                        step="0.05" 
                        value={currentRate} 
                        onChange={e => setCurrentRate(Number(e.target.value))} 
                        className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Monthly Installment (RM)</label>
                    <input 
                        type="number" 
                        value={currentInstallment} 
                        onChange={e => setCurrentInstallment(Number(e.target.value))} 
                        className={`w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none ${!oldLoanAnalysis.valid && oldLoanAnalysis.msg ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                    />
                    {!oldLoanAnalysis.valid && oldLoanAnalysis.msg && (
                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {oldLoanAnalysis.msg}
                        </p>
                    )}
                  </div>
                </div>
            </div>

            {/* New Loan Section */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/30">
                <h3 className="font-bold text-indigo-900 mb-4 flex items-center gap-2 border-b border-indigo-100 pb-2">
                  2. New Refinance Loan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Interest Rate (%)</label>
                    <input 
                        type="number" 
                        step="0.05" 
                        value={newRate} 
                        onChange={e => setNewRate(Number(e.target.value))} 
                        className="w-full p-2 border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Tenure (Years)</label>
                    <input 
                        type="range" 
                        min="5" max="35" 
                        value={newTenure} 
                        onChange={e => setNewTenure(Number(e.target.value))} 
                        className="w-full accent-indigo-600 cursor-pointer" 
                    />
                    <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>5 Years</span>
                        <span className="font-bold text-indigo-700 text-sm">{newTenure} Years</span>
                        <span>35 Years</span>
                    </div>
                  </div>
                </div>
            </div>

          </div>

          {/* MIDDLE: Results (Span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
             
             {/* Main Impact Card */}
             <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                <div className="bg-slate-50 border-b border-slate-100 p-4 text-center">
                    <h3 className="font-bold text-slate-800 flex items-center justify-center gap-2">
                        Financial Impact Summary
                    </h3>
                </div>
                
                <div className="p-6 space-y-8">
                    {/* Metric 1: Monthly Change */}
                    <div className="text-center relative">
                         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none">
                            {monthlySaving >= 0 ? <TrendingDown className="w-32 h-32" /> : <TrendingUp className="w-32 h-32" />}
                         </div>
                         <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-2">Monthly Installment Change</p>
                         <div className={`text-4xl font-extrabold flex items-center justify-center gap-2 ${monthlySaving >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                             {monthlySaving >= 0 ? <TrendingDown className="w-8 h-8" /> : <TrendingUp className="w-8 h-8" />}
                             RM {Math.abs(Math.round(monthlySaving)).toLocaleString()}
                         </div>
                         <p className={`text-sm font-medium mt-1 ${monthlySaving >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                             {monthlySaving >= 0 ? 'Reduction per month' : 'Increase per month'}
                         </p>
                    </div>

                    <div className="border-t border-slate-100"></div>

                    {/* Metric 2: Total Interest */}
                    <div className="text-center relative">
                         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center opacity-[0.03] pointer-events-none">
                             <PiggyBank className="w-32 h-32" />
                         </div>
                         <p className="text-slate-500 text-xs uppercase tracking-wider font-bold mb-2">Total Interest Saving</p>
                         <div className={`text-3xl font-bold flex items-center justify-center gap-2 ${totalLifetimeSaving >= 0 ? 'text-blue-600' : 'text-orange-500'}`}>
                             {totalLifetimeSaving >= 0 ? '+' : '-'} RM {Math.abs(Math.round(totalLifetimeSaving)).toLocaleString()}
                         </div>
                         <p className="text-xs text-slate-400 mt-1">Over Full Tenure (Lifetime)</p>
                         {totalLifetimeSaving < 0 && (
                            <p className="text-[10px] text-red-400 mt-1 italic">
                                Note: Extending tenure usually increases total interest cost.
                            </p>
                         )}
                    </div>
                </div>
             </div>

             {/* Comparisons Small */}
             <div className="grid grid-cols-2 gap-4">
                 <div className="bg-white p-4 rounded-xl shadow border border-slate-100 text-center">
                     <p className="text-xs text-slate-400 mb-1">Current Payment</p>
                     <p className="font-bold text-slate-700">RM {currentInstallment.toLocaleString()}</p>
                 </div>
                 <div className="bg-indigo-600 p-4 rounded-xl shadow border border-indigo-700 text-center text-white">
                     <p className="text-xs text-indigo-200 mb-1">New Payment</p>
                     <p className="font-bold">RM {Math.round(newMonthlyPayment).toLocaleString()}</p>
                 </div>
             </div>

             {/* Detailed Breakdown */}
             <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                 <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide">Projection Details</h4>
                 
                 {oldLoanAnalysis.valid ? (
                     <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Implied Remaining Tenure</span>
                            <span className="font-medium text-slate-800">~{Math.round(oldLoanAnalysis.remainingMonths! / 12 * 10) / 10} Years</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Cost to Complete (Old)</span>
                            <span className="font-medium text-slate-800">RM {Math.round(oldLoanAnalysis.totalRemainingCost!).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Total Cost to Complete (New)</span>
                            <span className="font-medium text-indigo-600">RM {Math.round(newTotalCost).toLocaleString()}</span>
                        </div>
                     </div>
                 ) : (
                     <p className="text-slate-400 text-sm text-center py-4">Enter valid current installment to see lifetime savings.</p>
                 )}
             </div>
          </div>

          {/* RIGHT: Amortization (Span 4) */}
          <div className="lg:col-span-4 bg-white p-6 rounded-xl shadow-lg border border-slate-200 flex flex-col h-[600px]">
             <h3 className="font-bold text-lg mb-4">New Loan Schedule (Yearly)</h3>
             <div className="flex-grow overflow-auto pr-2">
               <table className="w-full text-xs text-left">
                 <thead className="bg-slate-50 text-slate-600 sticky top-0 z-10">
                   <tr>
                     <th className="p-2 rounded-tl-lg">Year</th>
                     <th className="p-2">Interest</th>
                     <th className="p-2">Principal</th>
                     <th className="p-2 rounded-tr-lg">Balance</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {amortization.map((row) => (
                     <tr key={row.year} className="hover:bg-slate-50 transition-colors">
                       <td className="p-2 font-medium text-slate-700">{row.year}</td>
                       <td className="p-2 text-red-500">RM {Math.round(row.interest).toLocaleString()}</td>
                       <td className="p-2 text-green-600">RM {Math.round(row.principal).toLocaleString()}</td>
                       <td className="p-2 text-slate-700 font-bold">RM {Math.round(row.balance).toLocaleString()}</td>
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
