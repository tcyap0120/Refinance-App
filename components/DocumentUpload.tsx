import React, { useState } from 'react';
import { Button } from './ui/Button';
import { FileText, CheckCircle, Lock } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const DocumentUpload: React.FC<Props> = ({ onComplete }) => {
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    ic: null,
    payslips: null,
    bankStatements: null
  });

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
    }
  };

  const isComplete = Object.values(files).every(f => f !== null);

  return (
    <div className="min-h-screen bg-theme-wave flex flex-col items-center justify-center p-4 relative">
      {/* Background Overlay */}
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[1px]"></div>

      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Secure Document Upload</h2>
          <p className="text-slate-500 mt-2">
            Your data is encrypted using SSL. Upload the required documents to finalize your application.
          </p>
        </div>

        <div className="space-y-6">
          {/* Document 1 */}
          <div className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-between transition-colors ${files.ic ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-indigo-400'}`}>
            <div className="flex items-center gap-3">
              <FileText className={`w-6 h-6 ${files.ic ? 'text-green-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-medium text-slate-700">Identity Card (IC) / Passport</p>
                <p className="text-xs text-slate-400">{files.ic ? files.ic.name : 'PDF or JPG'}</p>
              </div>
            </div>
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleFileChange('ic', e)} accept=".pdf,.jpg,.png" />
              <span className={`text-sm font-semibold px-3 py-1 rounded-md ${files.ic ? 'text-green-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                {files.ic ? 'Change' : 'Upload'}
              </span>
            </label>
          </div>

          {/* Document 2 */}
          <div className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-between transition-colors ${files.payslips ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-indigo-400'}`}>
            <div className="flex items-center gap-3">
              <FileText className={`w-6 h-6 ${files.payslips ? 'text-green-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-medium text-slate-700">Latest 3 Months Payslips</p>
                <p className="text-xs text-slate-400">{files.payslips ? files.payslips.name : 'PDF only'}</p>
              </div>
            </div>
             <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleFileChange('payslips', e)} accept=".pdf" />
              <span className={`text-sm font-semibold px-3 py-1 rounded-md ${files.payslips ? 'text-green-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                {files.payslips ? 'Change' : 'Upload'}
              </span>
            </label>
          </div>

          {/* Document 3 */}
          <div className={`border-2 border-dashed rounded-lg p-4 flex items-center justify-between transition-colors ${files.bankStatements ? 'border-green-500 bg-green-50' : 'border-slate-300 hover:border-indigo-400'}`}>
            <div className="flex items-center gap-3">
              <FileText className={`w-6 h-6 ${files.bankStatements ? 'text-green-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-medium text-slate-700">Latest Loan Statement</p>
                <p className="text-xs text-slate-400">{files.bankStatements ? files.bankStatements.name : 'PDF'}</p>
              </div>
            </div>
             <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => handleFileChange('bankStatements', e)} accept=".pdf" />
              <span className={`text-sm font-semibold px-3 py-1 rounded-md ${files.bankStatements ? 'text-green-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                 {files.bankStatements ? 'Change' : 'Upload'}
              </span>
            </label>
          </div>
        </div>

        <div className="mt-8">
          <Button variant="primary" fullWidth disabled={!isComplete} onClick={onComplete}>
            Submit Application {isComplete && <CheckCircle className="ml-2 w-4 h-4 inline" />}
          </Button>
        </div>
      </div>
    </div>
  );
};