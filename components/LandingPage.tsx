import React from 'react';
import { Button } from './ui/Button';
import { RefiGoal } from '../types';
import { ArrowRight, DollarSign, Percent } from 'lucide-react';

interface LandingPageProps {
  onStart: (goal: RefiGoal) => void;
  onAdminLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onAdminLogin }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-blue-50">
      <nav className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          RefiSmart
        </div>
        <Button variant="ghost" onClick={onAdminLogin}>Admin Login</Button>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center mb-10">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 max-w-4xl">
          Smart Mortgage Refinancing <br/> <span className="text-indigo-600">Made Simple</span>
        </h1>
        <p className="text-lg text-slate-600 mb-12 max-w-2xl">
          Unlock the potential of your property. Whether you need extra cash or want to reduce your monthly interest, we calculate your best options instantly.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Option 1: Cash Out */}
          <div 
            className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-100 cursor-pointer"
            onClick={() => onStart(RefiGoal.CASH_OUT)}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Cash Out Refinance</h3>
            <p className="text-slate-500 mb-6">
              Unlock equity from your home for renovations, debt consolidation, or investments.
            </p>
            <Button variant="primary" fullWidth onClick={(e) => { e.stopPropagation(); onStart(RefiGoal.CASH_OUT); }}>
              Get Cash Out <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </Button>
          </div>

          {/* Option 2: Save Interest */}
          <div 
            className="group bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border-2 border-transparent hover:border-indigo-100 cursor-pointer"
            onClick={() => onStart(RefiGoal.SAVE_INTEREST)}
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Percent className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-3">Lower Interest Rate</h3>
            <p className="text-slate-500 mb-6">
              Reduce your monthly payments and save thousands in interest over the life of your loan.
            </p>
            <Button variant="secondary" fullWidth onClick={(e) => { e.stopPropagation(); onStart(RefiGoal.SAVE_INTEREST); }}>
              Start Saving <ArrowRight className="inline-block ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-400 text-sm">
        &copy; 2024 RefiSmart. All calculations are estimates. Terms and conditions apply.
      </footer>
    </div>
  );
};
