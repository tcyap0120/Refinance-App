import React from 'react';
import { ArrowLeft, Shield, Lock, FileText, AlertTriangle } from 'lucide-react';

interface Props {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-slate-100 relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Home
        </button>

        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy & Disclaimer</h1>
            <p className="text-slate-500 text-sm">Last Updated: March 2024</p>
          </div>
        </div>

        <div className="prose prose-slate max-w-none text-slate-600">
          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-indigo-500" /> 1. Privacy Policy
            </h2>
            <p className="mb-4">
              Apex Consultancy Sdn Bhd ("ApexRefi", "we", "us", or "our") operates the ApexRefi platform. This Privacy Policy informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
            </p>
            
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">1.1 Information Collection</h3>
            <p className="mb-2">We collect the following types of information to process your refinance application:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li><strong>Personal Identity Data:</strong> Name, NRIC/Passport number, Age, Citizenship, Marital Status.</li>
              <li><strong>Contact Data:</strong> Email address, Phone number.</li>
              <li><strong>Financial Data:</strong> Income details (Salary, Allowances, Bonuses), Monthly Commitments (Loans, Credit Cards), and Credit History declarations.</li>
              <li><strong>Property Data:</strong> Property address, market value estimates, and existing loan details.</li>
              <li><strong>Documents:</strong> Digital copies of NRIC, Payslips, Bank Statements, and Loan Agreements uploaded via our secure portal.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">1.2 Use of Data</h3>
            <p className="mb-2">Your data is used strictly for:</p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Calculating your Debt Service Ratio (DSR) and loan eligibility.</li>
              <li>Matching your profile with suitable mortgage products from our partner banks.</li>
              <li>Facilitating the application process between you and the bank officers.</li>
              <li>Communicating with you regarding the status of your application.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">1.3 Data Security</h3>
            <p className="mb-4">
              We employ industry-standard SSL encryption for data transmission. Access to your personal data is restricted to authorized ApexRefi consultants and the specific bank officers handling your application. We do not sell your data to third-party marketers.
            </p>
          </section>

          <hr className="my-8 border-slate-100" />

          <section className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-indigo-500" /> 2. Disclaimer
            </h2>
            
            <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.1 Not a Bank</h3>
            <p className="mb-4">
              ApexRefi is a mortgage consultancy platform and not a registered financial institution or bank. We act as an intermediary to help you compare and submit applications to authorized banks in Malaysia.
            </p>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.2 Accuracy of Calculations</h3>
            <p className="mb-4">
              All tools, calculators, and eligibility results on this website are for estimation purposes only. They are based on general market guidelines and do not constitute a formal loan offer.
              <br/><br/>
              Actual approval is subject to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mb-4">
              <li>Verification of original documents.</li>
              <li>CCRIS and CTOS credit checks performed by the bank.</li>
              <li>Final property valuation by a registered valuer.</li>
              <li>The specific bank's internal credit policies at the time of application.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mt-4 mb-2">2.3 Interest Rates</h3>
            <p className="mb-4">
              Interest rates displayed (e.g., "3.55%") are indicative based on current market offerings. Rates may fluctuate based on the Overnight Policy Rate (OPR) set by Bank Negara Malaysia and the applicant's individual risk profile.
            </p>
          </section>
          
          <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 text-sm">
             <h4 className="font-bold text-indigo-900 mb-2">Contact Us</h4>
             <p>
               If you have questions about this policy or your data, please contact our Data Protection Officer at:
               <br/>
               <a href="mailto:privacy@apexrefi.com" className="text-indigo-600 hover:underline">privacy@apexrefi.com</a>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};