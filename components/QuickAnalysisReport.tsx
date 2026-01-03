import React, { useMemo } from 'react';
import { QuickQuoteData, RefiGoal } from '../types';
import { calculateQuickQuote } from '../services/calculations';
import { Button } from './ui/Button';
import { CheckCircle, TrendingDown, DollarSign, Lock } from 'lucide-react';

interface Props {
  data: QuickQuoteData;
  onUnlock: () => void;
  onBack: () => void;
}

export const QuickAnalysisReport: React.FC<Props> = ({ data, onUnlock, onBack }) => {
  const result = useMemo(() => calculateQuickQuote(data), [data]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-theme-wave">
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-indigo-100 relative z-10 text-center">
        
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1 rounded-full text-sm font-bold mb-6">
          <CheckCircle className="w-4 h-4" /> Pre-Qualification Successful
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Hi {data.name.split(' ')[0]}, Great News!
        </h2>
        <p className="text-slate-500 mb-8">
          Based on the details provided, you are eligible for the following benefits with our 3.55% special rate package.
        </p>

        <div className="grid grid-cols-1 gap-6 mb-8">
            
            {/* Main Highlight Box */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
              <p className="text-indigo-100 text-sm font-medium mb-1">
                {data.goal === RefiGoal.CASH_OUT ? 'Potential Cash Out Available' : 'Monthly Savings'}
              </p>
              <h3 className="text-4xl font-bold mb-2">
                {data.goal === RefiGoal.CASH_OUT 
                  ? `RM ${Math.round(result.potentialCashOut).toLocaleString()}` 
                  : `RM ${Math.round(result.monthlySavings).toLocaleString()}`
                }
              </h3>
              <p className="text-xs text-indigo-200">
                {data.goal === RefiGoal.CASH_OUT 
                  ? 'Subject to final valuation check' 
                  : `Save RM ${Math.round(result.totalInterestSaved).toLocaleString()} in total interest`}
              </p>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                 <p className="text-xs text-slate-400 mb-1">New Installment</p>
                 <p className="text-xl font-bold text-slate-700">RM {Math.round(result.newMonthlyPayment).toLocaleString()}</p>
                 <p className="text-[10px] text-green-600 font-medium">@ 3.55% p.a.</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                 <p className="text-xs text-slate-400 mb-1">Total Interest Saved</p>
                 <p className="text-xl font-bold text-green-600">RM {Math.round(result.totalInterestSaved / 1000)}k+</p>
                 <p className="text-[10px] text-slate-400">Approx. over 30 yrs</p>
              </div>
            </div>
        </div>

        <div className="space-y-4">
          <Button fullWidth onClick={onUnlock} className="py-4 text-lg shadow-xl shadow-indigo-500/20">
            <Lock className="w-4 h-4 mr-2 inline" /> Unlock Full Report & Apply
          </Button>
          <p className="text-xs text-slate-400">
            Proceed to the full application form to finalize your eligibility check. We've pre-filled your info.
          </p>
        </div>

        <button onClick={onBack} className="mt-6 text-slate-400 text-sm hover:text-slate-600">
           Edit Details
        </button>

      </div>
    </div>
  );
};