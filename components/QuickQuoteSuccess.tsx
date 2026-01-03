import React from 'react';
import { Button } from './ui/Button';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { QuickQuoteData } from '../types';

interface Props {
  data: QuickQuoteData;
  onSimulateLinkClick: () => void;
  onHome: () => void;
}

export const QuickQuoteSuccess: React.FC<Props> = ({ data, onSimulateLinkClick, onHome }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-theme-wave">
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl w-full max-w-lg border border-indigo-50 relative z-10 text-center">
        
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-blob">
           <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">Request Received!</h2>
        <p className="text-slate-600 mb-8">
          Thanks <strong>{data.name}</strong>. We have received your preliminary details. 
          A consultant will review your case shortly.
          <br/><br/>
          To speed up your approval, you can proceed to fill in your full details now.
        </p>

        <div className="space-y-4">
            <Button fullWidth onClick={onSimulateLinkClick} className="py-3 shadow-lg shadow-indigo-500/30">
               <ExternalLink className="w-4 h-4 mr-2 inline" /> Proceed to Eligibility Form
            </Button>
            <p className="text-xs text-slate-400">
              This helps us check your DSR and exact loan eligibility instantly.
            </p>
        </div>

        <div className="border-t border-slate-100 pt-6 mt-6">
            <button onClick={onHome} className="text-slate-400 hover:text-slate-600 text-sm">Return to Home</button>
        </div>

      </div>
    </div>
  );
};