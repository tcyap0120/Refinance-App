import React, { useState, useEffect } from 'react';
import { QuickQuoteData, RefiGoal, PropertyCategory, PropertyType } from '../types';
import { Button } from './ui/Button';
import { ArrowRight, User, Phone, AlertCircle } from 'lucide-react';

interface Props {
  initialGoal: RefiGoal;
  onComplete: (data: QuickQuoteData) => void;
  onBack: () => void;
}

export const QuickQuoteForm: React.FC<Props> = ({ initialGoal, onComplete, onBack }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<Partial<QuickQuoteData>>({
    goal: initialGoal,
    // No default category to force selection
    propertyCategory: undefined,
    propertyType: undefined
  });

  // Reset subtypes when category changes
  useEffect(() => {
    // ALWAYS reset propertyType to undefined when category changes
    // This forces the user to manually pick the specific type (Terrace, Condo, etc.)
    setFormData(prev => ({ ...prev, propertyType: undefined }));
  }, [formData.propertyCategory]);

  const handleChange = (field: keyof QuickQuoteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    if (currentStep === 1) {
      if (!formData.name?.trim()) newErrors.name = "Full Name is required";
      if (!formData.phone?.trim()) newErrors.phone = "WhatsApp Number is required";
    }

    if (currentStep === 2) {
      if (formData.goal === RefiGoal.CASH_OUT) {
        if (!formData.propertyAddress?.trim()) newErrors.propertyAddress = "Property Address is required";
        if (!formData.outstandingBalance) newErrors.outstandingBalance = "Outstanding Loan Amount is required";
        if (!formData.currentInstallment) newErrors.currentInstallment = "Monthly Instalment is required";
        
        // Property Category Validation
        if (!formData.propertyCategory) {
            newErrors.propertyCategory = "Please select a property category";
        }

        // Property Specific Validation
        if (formData.propertyCategory === PropertyCategory.LANDED) {
            if (!formData.propertyType) newErrors.propertyType = "Please select a house type";
            if (!formData.landSize) newErrors.landSize = "Land Size is required";
            if (!formData.storeys) newErrors.storeys = "No. of Storeys is required";
        }
        
        if (formData.propertyCategory === PropertyCategory.HIGH_RISE) {
            if (!formData.propertyType) newErrors.propertyType = "Please select a unit type";
            if (!formData.builtUpSize) newErrors.builtUpSize = "Built-up Size is required";
        }

        if (formData.propertyCategory === PropertyCategory.COMMERCIAL) {
            if (!formData.propertyType) {
                newErrors.propertyType = "Please select a commercial type";
            } else {
                const type = formData.propertyType;
                if (type === PropertyType.SHOP_LOT || type === PropertyType.FACTORY) {
                    if (!formData.landSize) newErrors.landSize = "Land Size is required for this type";
                } else if (type === PropertyType.OFFICE) {
                    if (!formData.landSize && !formData.builtUpSize) {
                        newErrors.builtUpSize = "Please fill either Land Size or Built-up Size";
                    }
                }
            }
        }
      } else {
        // Save Interest Validation
        if (!formData.outstandingBalance) newErrors.outstandingBalance = "Outstanding Loan Amount is required";
        if (!formData.currentInterestRate) newErrors.currentInterestRate = "Current Interest Rate is required";
        if (!formData.currentInstallment) newErrors.currentInstallment = "Monthly Instalment is required";
        if (!formData.age) newErrors.age = "Age is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    return isValid;
  };

  const handleNext = () => {
    if (validateStep(1)) {
      setStep(prev => prev + 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep(2)) {
      onComplete(formData as QuickQuoteData);
    }
  };

  const getInputClass = (field: string) => `w-full p-3 border rounded-lg outline-none transition-all ${
    errors[field] ? 'border-red-500 bg-red-50 focus:ring-2 focus:ring-red-200' : 'border-slate-300 focus:ring-2 focus:ring-indigo-500'
  }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-theme-wave">
      <div className="absolute inset-0 z-0 bg-white/75 backdrop-blur-[2px]"></div>

      <div className="bg-white/95 backdrop-blur p-8 rounded-2xl shadow-xl w-full max-w-lg border border-indigo-50 relative z-10">
        
        {/* Progress Bar (2 Steps) */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mb-8">
          <div className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${step * 50}%` }}></div>
        </div>

        {/* Global Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded animate-pulse">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm text-red-700 font-bold">Please fill in the highlighted fields.</p>
            </div>
          </div>
        )}

        {/* STEP 1: Lead Capture */}
        {step === 1 && (
          <div className="fade-in space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 text-center">Estimate Your Potential</h2>
            <p className="text-slate-500 text-center text-sm">
                Let's calculate how much you can <strong>{initialGoal === RefiGoal.CASH_OUT ? 'Cash Out' : 'Save'}</strong>.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <User className="w-4 h-4 text-indigo-500" /> Full Name
                </label>
                <input 
                  type="text" 
                  className={getInputClass('name')}
                  placeholder="e.g. Ali Bin Abu"
                  value={formData.name || ''}
                  onChange={e => handleChange('name', e.target.value)}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1">
                  <Phone className="w-4 h-4 text-indigo-500" /> WhatsApp Number
                </label>
                <input 
                  type="text" 
                  className={getInputClass('phone')}
                  placeholder="e.g. 0123456789"
                  value={formData.phone || ''}
                  onChange={e => handleChange('phone', e.target.value)}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            
            <div className="pt-4">
               <Button fullWidth onClick={handleNext}>Next Step <ArrowRight className="w-4 h-4 ml-2 inline" /></Button>
               <button onClick={onBack} className="w-full text-center text-xs text-slate-400 mt-4 hover:text-slate-600">Cancel</button>
            </div>
          </div>
        )}

        {/* STEP 2: Conditional Inputs */}
        {step === 2 && (
          <div className="fade-in space-y-6">
            <h2 className="text-xl font-bold text-slate-800 text-center mb-6">
              {formData.goal === RefiGoal.CASH_OUT ? 'Property Details' : 'Current Loan Details'}
            </h2>

            {formData.goal === RefiGoal.CASH_OUT ? (
              // CASH OUT INPUTS
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Property Address</label>
                  <input 
                    type="text" 
                    className={getInputClass('propertyAddress')}
                    placeholder="e.g. 12, Jalan..." 
                    value={formData.propertyAddress || ''} 
                    onChange={e => handleChange('propertyAddress', e.target.value)} 
                  />
                  {errors.propertyAddress && <p className="text-red-500 text-xs mt-1">{errors.propertyAddress}</p>}
                </div>
                
                {/* Property Category */}
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Property Category*</label>
                  <select 
                    className={getInputClass('propertyCategory')}
                    value={formData.propertyCategory || ''} 
                    onChange={e => handleChange('propertyCategory', e.target.value)}
                  >
                    <option value="" disabled>-- Select Category --</option>
                    <option value={PropertyCategory.LANDED}>Landed</option>
                    <option value={PropertyCategory.HIGH_RISE}>High Rise</option>
                    <option value={PropertyCategory.COMMERCIAL}>Commercial</option>
                  </select>
                  {errors.propertyCategory && <p className="text-red-500 text-xs mt-1">{errors.propertyCategory}</p>}
                </div>

                {/* Sub-types and Sizes */}
                {formData.propertyCategory === PropertyCategory.LANDED && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded border border-slate-100">
                         <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">House Type*</label>
                            <select 
                                className={getInputClass('propertyType')}
                                value={formData.propertyType || ''} 
                                onChange={e => handleChange('propertyType', e.target.value)}
                            >
                                <option value="" disabled>-- Select House Type --</option>
                                <option value={PropertyType.TERRACE}>Terrace / Link House</option>
                                <option value={PropertyType.SEMI_D}>Semi-D</option>
                                <option value={PropertyType.BUNGALOW}>Bungalow</option>
                                <option value={PropertyType.CLUSTER}>Cluster House</option>
                            </select>
                            {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Land Size (sqft)*</label>
                                <input 
                                  type="number" 
                                  className={getInputClass('landSize')}
                                  placeholder="Req" 
                                  value={formData.landSize || ''} 
                                  onChange={e => handleChange('landSize', Number(e.target.value))} 
                                />
                                {errors.landSize && <p className="text-red-500 text-xs mt-1">{errors.landSize}</p>}
                             </div>
                             <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Built-up (sqft)</label>
                                <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Optional" 
                                    value={formData.builtUpSize || ''} onChange={e => handleChange('builtUpSize', Number(e.target.value))} />
                             </div>
                         </div>
                         <div>
                             <label className="text-sm font-medium text-slate-700 block mb-1">No. of Storeys*</label>
                             <input 
                               type="number" 
                               className={getInputClass('storeys')}
                               placeholder="e.g. 2" 
                               value={formData.storeys || ''} 
                               onChange={e => handleChange('storeys', Number(e.target.value))} 
                             />
                             {errors.storeys && <p className="text-red-500 text-xs mt-1">{errors.storeys}</p>}
                         </div>
                    </div>
                )}

                {formData.propertyCategory === PropertyCategory.HIGH_RISE && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded border border-slate-100">
                         <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Unit Type*</label>
                            <select 
                                className={getInputClass('propertyType')}
                                value={formData.propertyType || ''} 
                                onChange={e => handleChange('propertyType', e.target.value)}
                            >
                                <option value="" disabled>-- Select Unit Type --</option>
                                <option value={PropertyType.CONDO}>Condo / Serviced Residence</option>
                                <option value={PropertyType.APARTMENT}>Apartment</option>
                                <option value={PropertyType.FLAT}>Flat</option>
                                <option value={PropertyType.STUDIO}>Studio / SOHO</option>
                            </select>
                            {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                         </div>
                         <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Built-up Size (sqft)*</label>
                            <input 
                              type="number" 
                              className={getInputClass('builtUpSize')}
                              placeholder="Required" 
                              value={formData.builtUpSize || ''} 
                              onChange={e => handleChange('builtUpSize', Number(e.target.value))} 
                            />
                            {errors.builtUpSize && <p className="text-red-500 text-xs mt-1">{errors.builtUpSize}</p>}
                         </div>
                    </div>
                )}
                
                 {formData.propertyCategory === PropertyCategory.COMMERCIAL && (
                    <div className="space-y-4 p-4 bg-slate-50 rounded border border-slate-100">
                         <div>
                            <label className="text-sm font-medium text-slate-700 block mb-1">Unit Type*</label>
                            <select 
                                className={getInputClass('propertyType')}
                                value={formData.propertyType || ''} 
                                onChange={e => handleChange('propertyType', e.target.value)}
                            >
                                <option value="" disabled>-- Select Type --</option>
                                <option value={PropertyType.SHOP_LOT}>Shop Lot</option>
                                <option value={PropertyType.FACTORY}>Factory</option>
                                <option value={PropertyType.OFFICE}>Office Unit</option>
                            </select>
                            {errors.propertyType && <p className="text-red-500 text-xs mt-1">{errors.propertyType}</p>}
                         </div>
                         
                         {(formData.propertyType === PropertyType.SHOP_LOT || formData.propertyType === PropertyType.FACTORY) && (
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Land Size (sqft)*</label>
                                    <input 
                                      type="number" 
                                      className={getInputClass('landSize')}
                                      placeholder="Req" 
                                      value={formData.landSize || ''} 
                                      onChange={e => handleChange('landSize', Number(e.target.value))} 
                                    />
                                    {errors.landSize && <p className="text-red-500 text-xs mt-1">{errors.landSize}</p>}
                                 </div>
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Built-up (sqft)</label>
                                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Optional" 
                                        value={formData.builtUpSize || ''} onChange={e => handleChange('builtUpSize', Number(e.target.value))} />
                                 </div>
                            </div>
                         )}

                         {formData.propertyType === PropertyType.OFFICE && (
                            <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Land Size (sqft)</label>
                                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Optional" 
                                        value={formData.landSize || ''} onChange={e => handleChange('landSize', Number(e.target.value))} />
                                 </div>
                                 <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Built-up (sqft)</label>
                                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg" placeholder="Optional" 
                                        value={formData.builtUpSize || ''} onChange={e => handleChange('builtUpSize', Number(e.target.value))} />
                                 </div>
                                 {(errors.builtUpSize || errors.landSize) && <p className="col-span-2 text-red-500 text-xs">Please fill either Land Size or Built-up Size.</p>}
                            </div>
                         )}
                    </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Outstanding Loan Amount (RM)</label>
                    <input 
                      type="number" 
                      className={getInputClass('outstandingBalance')}
                      placeholder="0.00" 
                      value={formData.outstandingBalance || ''} 
                      onChange={e => handleChange('outstandingBalance', Number(e.target.value))} 
                    />
                    {errors.outstandingBalance && <p className="text-red-500 text-xs mt-1">{errors.outstandingBalance}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Monthly Instalment (RM)</label>
                    <input 
                      type="number" 
                      className={getInputClass('currentInstallment')}
                      placeholder="e.g. 2500" 
                      value={formData.currentInstallment || ''} 
                      onChange={e => handleChange('currentInstallment', Number(e.target.value))} 
                    />
                    {errors.currentInstallment && <p className="text-red-500 text-xs mt-1">{errors.currentInstallment}</p>}
                  </div>
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-slate-700 block mb-1">Est. Value (RM)</label>
                    <input type="number" className="w-full p-3 border border-slate-300 rounded-lg bg-slate-50" placeholder="Optional" 
                      value={formData.estimatedValue || ''} onChange={e => handleChange('estimatedValue', Number(e.target.value))} />
                    <p className="text-[10px] text-slate-500 mt-1">Leave blank if unsure.</p>
                  </div>
                </div>
              </div>
            ) : (
              // SAVE INTEREST INPUTS
              <div className="space-y-4">
                <div>
                   <label className="text-sm font-medium text-slate-700 block mb-1">Outstanding Loan Amount (RM)</label>
                   <input 
                    type="number" 
                    className={getInputClass('outstandingBalance')}
                    value={formData.outstandingBalance || ''} 
                    onChange={e => handleChange('outstandingBalance', Number(e.target.value))} 
                   />
                   {errors.outstandingBalance && <p className="text-red-500 text-xs mt-1">{errors.outstandingBalance}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Current Rate (%)</label>
                      <input 
                        type="number" 
                        className={getInputClass('currentInterestRate')}
                        placeholder="e.g. 4.5" 
                        value={formData.currentInterestRate || ''} 
                        onChange={e => handleChange('currentInterestRate', Number(e.target.value))} 
                      />
                      {errors.currentInterestRate && <p className="text-red-500 text-xs mt-1">{errors.currentInterestRate}</p>}
                   </div>
                   <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Monthly Instalment (RM)</label>
                      <input 
                        type="number" 
                        className={getInputClass('currentInstallment')}
                        value={formData.currentInstallment || ''} 
                        onChange={e => handleChange('currentInstallment', Number(e.target.value))} 
                      />
                      {errors.currentInstallment && <p className="text-red-500 text-xs mt-1">{errors.currentInstallment}</p>}
                   </div>
                </div>
                <div>
                   <label className="text-sm font-medium text-slate-700 block mb-1">Current Age</label>
                   <input 
                    type="number" 
                    className={getInputClass('age')}
                    placeholder="e.g. 35" 
                    value={formData.age || ''} 
                    onChange={e => handleChange('age', Number(e.target.value))} 
                   />
                   {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
                </div>
              </div>
            )}

            <div className="pt-6">
              <Button fullWidth onClick={handleSubmit}>Get Report</Button>
               <button onClick={() => setStep(1)} className="w-full text-center text-xs text-slate-400 mt-4 hover:text-slate-600">Back</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};