
import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Calculator, DollarSign } from 'lucide-react';
import { calculatePayroll } from '../services/payrollLogic';

interface Props {
  onBack: () => void;
}

export const PayrollCalculator: React.FC<Props> = ({ onBack }) => {
  const [salary, setSalary] = useState<number>(2000);
  const [bonus, setBonus] = useState<number>(0);
  const [age, setAge] = useState<number>(30);
  
  const [result, setResult] = useState(calculatePayroll(2000, 0, 30));

  useEffect(() => {
    setResult(calculatePayroll(salary, bonus, age));
  }, [salary, bonus, age]);

  const totalEmployer = result.epf.employer + result.socso.employer + result.eis.employer;
  const totalEmployee = result.epf.employee + result.socso.employee + result.eis.employee + result.pcb;
  const grandTotal = totalEmployer + totalEmployee;

  return (
    <div className="min-h-screen bg-theme-wave py-10 px-4 relative">
       {/* Background Overlay */}
       <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </button>

        <h1 className="text-3xl font-bold text-slate-800 mb-2 text-center">Payroll Calculator</h1>
        <p className="text-center text-slate-500 mb-8">Calculate Monthly PCB, EPF, SOCSO, EIS Deductions</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Inputs */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-lg border border-white/50 space-y-6">
            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" /> Inputs
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Salary (RM)</label>
              <div className="relative">
                 <input 
                    type="number" 
                    value={salary} 
                    onChange={e => setSalary(Number(e.target.value))} 
                    className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-lg" 
                  />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Bonus (RM)</label>
              <div className="relative">
                 <input 
                    type="number" 
                    value={bonus} 
                    onChange={e => setBonus(Number(e.target.value))} 
                    className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-lg" 
                  />
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                 <DollarSign className="w-3 h-3" /> Subject to EPF & Tax only (Exempt from SOCSO/EIS)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <div className="relative">
                 <input 
                    type="number" 
                    value={age} 
                    onChange={e => setAge(Number(e.target.value))} 
                    className="w-full p-3 pl-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-lg" 
                  />
              </div>
              <p className="text-xs text-slate-500 mt-1">Age determines SOCSO and EIS categories.</p>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg text-sm text-indigo-800">
               <p><strong>Note:</strong> 
                 <ul className="list-disc ml-4 mt-1">
                    <li>EPF: 11% (Employee), 13% (Employer)</li>
                    <li>SOCSO: RM 6k Cap. {age >= 60 ? 'Category 2 (Injury Scheme Only)' : 'Category 1 (Injury + Invalidity)'}</li>
                    <li>EIS: RM 6k Cap. {age >= 60 ? 'Exempted' : 'Applicable'}</li>
                 </ul>
               </p>
            </div>
          </div>

          {/* Salary Statement Output */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
             <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h3 className="font-bold text-xl text-slate-800">Salary Statement (in RM)</h3>
             </div>
             
             <div className="p-6 space-y-6">
                {/* Summary Header - Stacked Vertically to match Screenshot */}
                <div className="flex flex-col gap-1 pb-6 border-b border-slate-100">
                   <div className="flex justify-between items-center w-full max-w-xs">
                      <span className="text-slate-700 font-medium text-lg">Salary:</span>
                      <span className="text-slate-700 font-medium text-lg">{salary.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center w-full max-w-xs">
                      <span className="text-slate-700 font-medium text-lg">Bonus:</span>
                      <span className="text-slate-700 font-medium text-lg">{bonus.toFixed(2)}</span>
                   </div>
                   
                   <div className="flex justify-between items-center w-full max-w-xs mt-2">
                      <span className="text-blue-600 font-bold text-xl">Net Salary:</span>
                      <span className="text-blue-600 font-bold text-xl">{result.netSalary.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                   </div>
                </div>

                {/* Breakdown Table */}
                <div className="overflow-x-auto">
                   <table className="w-full text-sm">
                      <thead>
                         <tr className="text-slate-800 border-b border-slate-100">
                            <th className="pb-2 text-left w-1/4"></th>
                            <th className="pb-2 text-left w-1/4 font-medium text-base">Employer</th>
                            <th className="pb-2 text-left w-1/4 font-medium text-base">Employee</th>
                            <th className="pb-2 text-left w-1/4 font-medium text-base">Sub-Total</th>
                         </tr>
                      </thead>
                      <tbody className="space-y-3">
                         <tr className="h-8">
                            <td className="font-medium text-slate-700 text-base">EPF:</td>
                            <td className="text-base">{result.epf.employer.toFixed(2)}</td>
                            <td className="text-base">{result.epf.employee.toFixed(2)}</td>
                            <td className="text-base">{(result.epf.employer + result.epf.employee).toFixed(2)}</td>
                         </tr>
                         <tr className="h-8">
                            <td className="font-medium text-slate-700 text-base">SOCSO:</td>
                            <td className="text-base">{result.socso.employer.toFixed(2)}</td>
                            <td className="text-base">{result.socso.employee.toFixed(2)}</td>
                            <td className="text-base">{(result.socso.employer + result.socso.employee).toFixed(2)}</td>
                         </tr>
                         <tr className="h-8">
                            <td className="font-medium text-slate-700 text-base">EIS:</td>
                            <td className="text-base">{result.eis.employer.toFixed(2)}</td>
                            <td className="text-base">{result.eis.employee.toFixed(2)}</td>
                            <td className="text-base">{(result.eis.employer + result.eis.employee).toFixed(2)}</td>
                         </tr>
                         <tr className="h-8">
                            <td className="font-medium text-slate-700 text-base">Tax:</td>
                            <td className="text-base"></td>
                            <td className="text-base">{result.pcb.toFixed(2)}</td>
                            <td className="text-base">{result.pcb.toFixed(2)}</td>
                         </tr>
                         
                         {/* Spacer row */}
                         <tr className="h-4"></tr>

                         <tr className="font-bold text-slate-800 text-lg pt-4 border-t border-slate-200">
                            <td className="pt-4">Total:</td>
                            <td className="pt-4">{totalEmployer.toFixed(2)}</td>
                            <td className="pt-4">{totalEmployee.toFixed(2)}</td>
                            <td className="pt-4">{grandTotal.toFixed(2)}</td>
                         </tr>
                      </tbody>
                   </table>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
