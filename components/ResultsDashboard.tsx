import React, { useState, useMemo } from 'react';
import { ClientData } from '../types';
import { calculateEligibility } from '../services/calculations';
import { Button } from './ui/Button';
import { UploadCloud, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  clientData: ClientData;
  onProceed: (finalData: ClientData) => void;
}

export const ResultsDashboard: React.FC<Props> = ({ clientData, onProceed }) => {
  const [newRate, setNewRate] = useState(3.55);

  // Recalculate based on slider
  const result = useMemo(() => 
    calculateEligibility(clientData, newRate), 
  [clientData, newRate]);

  // Data for DSR Chart
  const dsrData = [
    { name: 'Used', value: result.dsr },
    { name: 'Available', value: Math.max(0, 100 - result.dsr) }
  ];

  return (
    <div className="min-h-screen pb-20 relative bg-theme-wave">
      
      {/* Background Overlay (75% White) */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[1px]"></div>

      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Banking Analysis Result</h1>
          <div className="flex items-center gap-3">
             <div className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold shadow-sm ${
               result.approved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
             }`}>
               {result.approved ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
               {result.approved ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* LEFT COLUMN: Summary & Decision */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Status Box */}
          <div className={`p-6 rounded-xl shadow-md border-t-4 bg-white/90 backdrop-blur ${result.approved ? 'border-green-500' : 'border-red-500'}`}>
             <h3 className="text-lg font-bold text-slate-800 mb-2">Decision Summary</h3>
             {result.approved ? (
               <p className="text-green-700 text-sm">
                 You pass all banking criteria (DSR, Stress Test, LTV, NDI). You are eligible for the requested loan amount.
               </p>
             ) : (
               <div className="space-y-2">
                 <p className="text-red-700 font-semibold text-sm">Application Rejected due to:</p>
                 <ul className="list-disc list-inside text-sm text-red-600">
                   {result.reason.map((r, i) => <li key={i}>{r}</li>)}
                 </ul>
               </div>
             )}
          </div>

          {/* Loan Details */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-xl shadow-md border border-slate-100">
             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Loan Proposal</h3>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Requested Amount</span>
                  <span className="font-bold text-lg">RM {(clientData.property.outstandingBalance + (clientData.request.desiredCashOut || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Max Eligible Limit</span>
                  <span className="font-semibold text-indigo-600">RM {Math.round(result.maxEligibleLoan).toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-100 pt-4">
                   <label className="text-xs text-slate-400 block mb-2">Proposed Interest Rate: {newRate}%</label>
                   <input 
                    type="range" min={3.0} max={6.0} step={0.05}
                    value={newRate} onChange={(e) => setNewRate(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* DSR Card */}
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">DSR (Normal)</span>
                <Info className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-2xl font-bold ${result.dsr > 70 ? 'text-red-500' : 'text-slate-800'}`}>
                  {result.dsr.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 mb-1">Limit: 70%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${result.dsr > 70 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${Math.min(result.dsr, 100)}%` }}></div>
              </div>
            </div>

            {/* Stress DSR Card */}
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">Stress Test DSR</span>
                <Info className="w-4 h-4 text-slate-300" />
              </div>
              <div className="flex items-end gap-2">
                 <span className={`text-2xl font-bold ${result.stressDsr > 75 ? 'text-red-500' : 'text-slate-800'}`}>
                  {result.stressDsr.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 mb-1">Limit: 75%</span>
              </div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className={`h-full ${result.stressDsr > 75 ? 'bg-red-500' : 'bg-orange-400'}`} style={{ width: `${Math.min(result.stressDsr, 100)}%` }}></div>
              </div>
            </div>

            {/* NDI Card */}
            <div className="bg-white/90 backdrop-blur p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500 font-medium">Net Disposable Income</span>
              </div>
              <div className="flex items-end gap-2">
                 <span className={`text-2xl font-bold ${result.ndi < 1000 ? 'text-red-500' : 'text-slate-800'}`}>
                  RM {Math.round(result.ndi).toLocaleString()}
                </span>
              </div>
               <p className="text-xs text-slate-400 mt-2">
                  Recognised Income - All Commitments
               </p>
            </div>
          </div>

          {/* Detailed Breakdown Table */}
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-md overflow-hidden border border-slate-100">
             <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
               <h3 className="font-bold text-slate-700">Financial Calculation Breakdown</h3>
             </div>
             <div className="p-6">
               <table className="w-full text-sm">
                 <tbody className="divide-y divide-slate-100">
                   <tr>
                     <td className="py-3 text-slate-500">Gross Income (Declared)</td>
                     <td className="py-3 text-right font-medium">
                       RM {Object.values(clientData.income).reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                     </td>
                   </tr>
                   <tr>
                     <td className="py-3 text-slate-500">
                       <span className="flex items-center gap-2">
                         Recognised Income <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">After Haircuts</span>
                       </span>
                     </td>
                     <td className="py-3 text-right font-bold text-indigo-700">
                       RM {Math.round(result.recognisedIncome).toLocaleString()}
                     </td>
                   </tr>
                   <tr>
                     <td className="py-3 text-slate-500">Existing Commitments (Non-Mortgage)</td>
                     <td className="py-3 text-right">
                       RM {Math.round(result.recognisedIncome * (result.dsr/100) - result.newMonthlyPayment).toLocaleString()}
                     </td>
                   </tr>
                   <tr className="bg-indigo-50/50">
                     <td className="py-3 pl-3 font-semibold text-indigo-900">New Mortgage Instalment</td>
                     <td className="py-3 pr-3 text-right font-bold text-indigo-900">
                       RM {Math.round(result.newMonthlyPayment).toLocaleString()}
                     </td>
                   </tr>
                   <tr>
                     <td className="py-3 text-slate-500">Stress Test Instalment (+1.75%)</td>
                     <td className="py-3 text-right text-slate-400">
                       RM {Math.round(result.stressMonthlyPayment).toLocaleString()}
                     </td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <div className="flex justify-end pt-4">
             <Button variant="primary" disabled={!result.approved} onClick={() => onProceed(clientData)}>
               {result.approved ? 'Proceed to Document Upload' : 'Contact Support for Appeal'} 
               {result.approved && <UploadCloud className="ml-2 w-4 h-4 inline" />}
             </Button>
          </div>

        </div>
      </main>
    </div>
  );
};