import React from 'react';
import { Button } from './ui/Button';
import { RefiGoal, AppView } from '../types';
import { ArrowRight, DollarSign, Percent, Building2, Calculator } from 'lucide-react';

interface LandingPageProps {
  onStart: (goal: RefiGoal) => void;
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-theme-wave">
      
      {/* Adjusted Overlay Transparency (75% white) */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <main className="flex-grow flex flex-col items-center justify-center px-4 text-center mb-10 relative z-10 pt-10">
        
        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 max-w-4xl leading-tight tracking-tight drop-shadow-sm">
          Your Partner in <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-blue-700">Smart Refinancing</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-700 mb-12 max-w-2xl leading-relaxed font-medium">
          We help you refinance to <strong>save money</strong> or <strong>cash out</strong>. 
          Unlike others, we compare different banks instead of just one to give you the 
          <strong> best solution</strong>. We handle the entire submission process, making it easy and convenient for you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
          {/* Option 1: Cash Out */}
          <div 
            className="group bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/50 hover:border-indigo-100 cursor-pointer relative overflow-hidden transform hover:-translate-y-1"
            onClick={() => onStart(RefiGoal.CASH_OUT)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-sm">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Cash Out Refinance</h3>
              <p className="text-slate-500 mb-6 h-12">
                Unlock equity from your home for renovations, debt consolidation, or investments.
              </p>
              <Button variant="primary" fullWidth onClick={(e) => { e.stopPropagation(); onStart(RefiGoal.CASH_OUT); }} className="shadow-lg shadow-green-500/20 bg-green-600 hover:bg-green-700 focus:ring-green-500">
                Get Cash Out <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Option 2: Save Interest */}
          <div 
            className="group bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all border border-white/50 hover:border-indigo-100 cursor-pointer relative overflow-hidden transform hover:-translate-y-1"
            onClick={() => onStart(RefiGoal.SAVE_INTEREST)}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-transform shadow-sm">
                <Percent className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Save Interest</h3>
              <p className="text-slate-500 mb-6 h-12">
                 Secure a lower interest rate to save on total interest costs. 
              </p>
              <Button variant="primary" fullWidth onClick={(e) => { e.stopPropagation(); onStart(RefiGoal.SAVE_INTEREST); }} className="shadow-lg shadow-indigo-500/20">
                Start Saving <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-600 bg-white/60 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/50">
           <span className="flex items-center gap-2"><Building2 className="w-4 h-4 text-indigo-500" /> Multiple Banks Compared</span>
           <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
           <span className="flex items-center gap-2">Best Rate Guarantee</span>
           <span className="hidden md:inline w-1 h-1 bg-slate-300 rounded-full"></span>
           <span className="flex items-center gap-2">Hassle-free Submission</span>
        </div>
      </main>

      <footer className="p-6 text-center text-slate-500 text-sm relative z-10 font-medium">
        <div className="mb-2 space-x-4">
          <button onClick={() => onNavigate(AppView.PRIVACY)} className="hover:text-indigo-700 underline">Privacy Policy</button>
          <span>|</span>
          <button onClick={() => onNavigate(AppView.PRIVACY)} className="hover:text-indigo-700 underline">Disclaimer</button>
        </div>
        &copy; 2026 Apex Consultancy Sdn Bhd. All calculations are estimates. Terms and conditions apply.
      </footer>
    </div>
  );
};