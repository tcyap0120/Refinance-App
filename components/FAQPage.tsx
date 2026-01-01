import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { FAQItem } from '../types';

interface Props {
  onBack: () => void;
  faqs: FAQItem[];
}

export const FAQPage: React.FC<Props> = ({ onBack, faqs }) => {
  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <div className="text-center mb-12">
          <HelpCircle className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-slate-800">Frequently Asked Questions</h1>
          <p className="text-slate-500 mt-2">Everything you need to know about refinancing.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <details key={faq.id} className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <summary className="flex justify-between items-center p-6 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                <span className="font-semibold text-slate-800">{faq.question}</span>
                <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 bg-slate-50/50">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};