import React, { useState, useEffect, useMemo } from 'react';
import { ClientData, CalculationResult } from '../types';
import { calculateEligibility } from '../services/calculations';
import { Button } from './ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { UploadCloud, Check } from 'lucide-react';

interface Props {
  clientData: ClientData;
  onProceed: (finalData: ClientData) => void;
}

export const ResultsDashboard: React.FC<Props> = ({ clientData, onProceed }) => {
  // Local state for interactive sliders
  const [newAmount, setNewAmount] = useState(clientData.goal === 'Cash Out' ? clientData.currentLoanBalance + 50000 : clientData.currentLoanBalance);
  const [newTenure, setNewTenure] = useState(30);
  const [newRate, setNewRate] = useState(3.5);

  const result = useMemo(() => 
    calculateEligibility(clientData, newRate, newTenure, newAmount), 
  [clientData, newRate, newTenure, newAmount]);

  // Chart Data
  const chartData = [
    {
      name: 'Current Loan',
      Principal: clientData.currentLoanBalance,
      Interest: (calculateEligibility(clientData, clientData.currentInterestRate, clientData.remainingTenure, clientData.currentLoanBalance).totalInterest),
    },
    {
      name: 'New Scenario',
      Principal: newAmount,
      Interest: result.totalInterest,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Refinance Analysis</h1>
          <div className="flex items-center gap-2">
             <span className={`px-3 py-1 rounded-full text-sm font-medium ${
               result.confidence === 'High' ? 'bg-green-100 text-green-700' :
               result.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
               'bg-red-100 text-red-700'
             }`}>
               {result.confidence} Chance
             </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Controls & Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Adjust Scenario</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  New Loan Amount: <span className="text-indigo-600 font-bold">${newAmount.toLocaleString()}</span>
                </label>
                <input 
                  type="range" min={clientData.currentLoanBalance} max={result.maxLoanAmount} step={1000}
                  value={newAmount} onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>${clientData.currentLoanBalance.toLocaleString()}</span>
                  <span>Max: ${result.maxLoanAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  New Tenure: <span className="text-indigo-600 font-bold">{newTenure} Years</span>
                </label>
                <input 
                  type="range" min={5} max={35} step={1}
                  value={newTenure} onChange={(e) => setNewTenure(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                 <label className="block text-sm font-medium text-slate-600 mb-2">
                  Interest Rate: <span className="text-indigo-600 font-bold">{newRate}%</span>
                </label>
                <input 
                  type="range" min={2.5} max={6.0} step={0.1}
                  value={newRate} onChange={(e) => setNewRate(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="bg-indigo-900 text-white p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold opacity-90 mb-4">Monthly Impact</h3>
            <div className="flex justify-between items-end mb-2">
              <span className="text-indigo-200">New Payment</span>
              <span className="text-3xl font-bold">${Math.round(result.monthlyPayment)}</span>
            </div>
             <div className="flex justify-between items-end border-t border-indigo-700 pt-2">
              <span className="text-indigo-200">Savings</span>
              <span className={`text-xl font-bold ${result.monthlySavings > 0 ? 'text-green-400' : 'text-orange-400'}`}>
                {result.monthlySavings > 0 ? '-' : '+'}${Math.abs(Math.round(result.monthlySavings))}
              </span>
            </div>
            {result.cashOutAmount > 0 && (
               <div className="flex justify-between items-end border-t border-indigo-700 pt-2 mt-2">
                <span className="text-indigo-200">Cash Out</span>
                <span className="text-xl font-bold text-yellow-400">
                  ${Math.round(result.cashOutAmount).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Charts & Detailed Table */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md h-80">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Total Cost Analysis</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Principal" stackId="a" fill="#6366f1" />
                <Bar dataKey="Interest" stackId="a" fill="#f43f5e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800">Comparison Details</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                     <th className="px-6 py-3">Metric</th>
                     <th className="px-6 py-3">Current Loan</th>
                     <th className="px-6 py-3 text-indigo-600">New Scenario</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   <tr>
                     <td className="px-6 py-3 font-medium">Interest Rate</td>
                     <td className="px-6 py-3">{clientData.currentInterestRate}%</td>
                     <td className="px-6 py-3 font-bold text-indigo-600">{newRate}%</td>
                   </tr>
                   <tr>
                     <td className="px-6 py-3 font-medium">Tenure</td>
                     <td className="px-6 py-3">{clientData.remainingTenure} Years</td>
                     <td className="px-6 py-3">{newTenure} Years</td>
                   </tr>
                   <tr>
                     <td className="px-6 py-3 font-medium">Debt Service Ratio (DSR)</td>
                     <td className="px-6 py-3">-</td>
                     <td className={`px-6 py-3 font-bold ${result.dsr > 70 ? 'text-red-500' : 'text-green-600'}`}>
                       {result.dsr.toFixed(1)}%
                     </td>
                   </tr>
                   <tr>
                     <td className="px-6 py-3 font-medium">Total Interest Payable</td>
                     <td className="px-6 py-3">${Math.round(chartData[0].Interest).toLocaleString()}</td>
                     <td className="px-6 py-3">${Math.round(result.totalInterest).toLocaleString()}</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </div>

          <div className="flex justify-end">
             <Button variant="primary" onClick={() => onProceed({...clientData, desiredLoanAmount: newAmount, desiredTenure: newTenure})}>
               Proceed to Upload Documents <UploadCloud className="ml-2 w-4 h-4 inline" />
             </Button>
          </div>

        </div>
      </main>
    </div>
  );
};
