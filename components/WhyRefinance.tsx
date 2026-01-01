import React from 'react';
import { ArrowLeft, TrendingDown, PiggyBank, Briefcase } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const WhyRefinance: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <h1 className="text-4xl font-bold text-slate-800 mb-10 text-center">Why Should You Refinance?</h1>

        {/* Knowledge Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
            <TrendingDown className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Lower Interest Rate</h3>
            <p className="text-slate-600 text-sm">
              Mortgage rates fluctuate. If your current rate is above 4.2%, refinancing to ~3.8% can save you tens of thousands in interest over the loan tenure.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-500">
            <PiggyBank className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Debt Consolidation</h3>
            <p className="text-slate-600 text-sm">
              Use "Cash Out" to pay off high-interest debts like credit cards (15-18%) using a cheap mortgage rate (3.8%). Drastically reduce monthly commitments.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-500">
            <Briefcase className="w-10 h-10 text-indigo-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Access Equity</h3>
            <p className="text-slate-600 text-sm">
              Property values appreciate. Refinancing unlocks this capital for business expansion, renovation, or education without selling your home.
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg relative">
            <div className="text-5xl text-indigo-200 absolute top-4 left-4 font-serif">"</div>
            <p className="text-slate-700 italic mb-4 relative z-10">
              I was drowning in credit card debt. ApexRefi helped me cash out from my condo. I paid off 5 credit cards and now my total monthly commitment dropped by RM 2,500!
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">AK</div>
              <div>
                <p className="font-bold text-slate-900">Ahmad K.</p>
                <p className="text-xs text-slate-500">Refinanced RM 550k</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur p-8 rounded-2xl shadow-lg relative">
            <div className="text-5xl text-indigo-200 absolute top-4 left-4 font-serif">"</div>
            <p className="text-slate-700 italic mb-4 relative z-10">
              My old loan was at 4.6%. ApexRefi found me a bank offering 3.85% with zero moving costs. The process was completely online and super fast.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">JL</div>
              <div>
                <p className="font-bold text-slate-900">Jessica L.</p>
                <p className="text-xs text-slate-500">Saved RM 350/month</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};