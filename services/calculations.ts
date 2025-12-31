import { ClientData, CalculationResult, LoanScenario } from '../types';

export const calculatePMT = (principal: number, annualRate: number, years: number): number => {
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

export const calculateEligibility = (data: ClientData, newRate: number, newTenure: number, newAmount: number): CalculationResult => {
  // Constants
  const MAX_LTV = 0.90; // 90%
  
  // 1. LTV
  const maxLoanBasedOnLTV = data.propertyValue * MAX_LTV;
  const ltv = (newAmount / data.propertyValue) * 100;

  // 2. New Monthly Payment
  const newMonthlyPayment = calculatePMT(newAmount, newRate, newTenure);

  // 3. DSR Calculation
  // DSR = (Total Monthly Commitments + New Mortgage) / Net Income
  // Assuming 'monthlyIncome' is net for simplicity in this demo, or we treat it as gross and apply a factor.
  const totalCommitments = data.monthlyDebts + newMonthlyPayment;
  const dsr = (totalCommitments / data.monthlyIncome) * 100;

  // 4. Current Situation (Estimate)
  // Current payment approximation (if we don't have exact historical data, we re-calc based on balance/rate/tenure)
  const currentMonthlyPayment = calculatePMT(data.currentLoanBalance, data.currentInterestRate, data.remainingTenure);

  // 5. Savings / Cash Out
  const monthlySavings = currentMonthlyPayment - newMonthlyPayment;
  const cashOutAmount = Math.max(0, newAmount - data.currentLoanBalance);

  // 6. Confidence
  let confidence: 'High' | 'Medium' | 'Low' = 'High';
  if (dsr > 70 || ltv > 90) confidence = 'Low';
  else if (dsr > 50 || ltv > 80) confidence = 'Medium';

  return {
    dsr,
    maxLoanAmount: maxLoanBasedOnLTV,
    ltv,
    confidence,
    monthlyPayment: newMonthlyPayment,
    totalInterest: (newMonthlyPayment * newTenure * 12) - newAmount,
    totalPayment: newMonthlyPayment * newTenure * 12,
    monthlySavings,
    cashOutAmount
  };
};

export const generateScenarios = (amount: number): LoanScenario[] => {
  // Generate 3 standard market scenarios
  return [
    { name: 'Short Term', tenure: 15, interestRate: 3.8 },
    { name: 'Standard', tenure: 30, interestRate: 4.1 },
    { name: 'Low Rate Special', tenure: 35, interestRate: 3.9 }
  ].map(s => {
    const monthlyPayment = calculatePMT(amount, s.interestRate, s.tenure);
    const totalPayment = monthlyPayment * s.tenure * 12;
    return {
      ...s,
      monthlyPayment,
      totalPayment,
      totalInterest: totalPayment - amount
    };
  });
};
