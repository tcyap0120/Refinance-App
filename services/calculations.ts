import { ClientData, DecisionResult } from '../types';

export const calculatePMT = (principal: number, annualRate: number, years: number): number => {
  if (annualRate === 0) return principal / (years * 12);
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
};

// Reverse PMT to find Principal based on affordable installment
export const calculatePV = (installment: number, annualRate: number, years: number): number => {
  const monthlyRate = annualRate / 100 / 12;
  const n = years * 12;
  return installment * ((Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n)));
}

// Generate simple annual amortization table
export const calculateAmortizationSchedule = (principal: number, annualRate: number, years: number) => {
  const monthlyRate = annualRate / 100 / 12;
  const monthlyPayment = calculatePMT(principal, annualRate, years);
  let balance = principal;
  const schedule = [];

  for (let year = 1; year <= years; year++) {
    let interestPaidYearly = 0;
    let principalPaidYearly = 0;

    for (let month = 1; month <= 12; month++) {
      if (balance <= 0) break;
      const interest = balance * monthlyRate;
      const principalPart = monthlyPayment - interest;
      
      interestPaidYearly += interest;
      principalPaidYearly += principalPart;
      balance -= principalPart;
    }

    schedule.push({
      year,
      interest: interestPaidYearly,
      principal: principalPaidYearly,
      balance: Math.max(0, balance)
    });
  }
  return schedule;
};

export const calculateEligibility = (data: ClientData, newRate: number = 3.8): DecisionResult => {
  const { income, commitments, property, request, credit } = data;

  // --- Step 1: Recognised Monthly Income (Haircuts) ---
  const recognisedIncome = 
    income.fixedSalary + 
    income.fixedAllowance + 
    (income.variableCommission * 0.60) + // 60% recognition
    (income.variableBonus * 0.50) +      // 50% recognition
    (income.variableOvertime * 0.50) +   // 50% recognition
    (income.rentalIncome * 0.75) +       // 75% recognition
    (income.businessIncome * 0.70) +     // 70% recognition
    (income.dividends * 0.70);

  // --- Step 2: Monthly Debt Commitments ---
  // Note: We exclude existing home loan assuming it's being settled by refinance
  const creditCardCommitment = commitments.creditCardOutstanding * 0.05;
  
  const nonMortgageCommitments = 
    commitments.carLoans + 
    commitments.personalLoans + 
    commitments.bnpl + 
    commitments.ptptn + 
    commitments.otherLiabilities + 
    creditCardCommitment;

  // --- Step 3: New Refinance Instalment ---
  // Requested Loan Amount = Outstanding Balance + Cash Out
  const requestedLoanAmount = property.outstandingBalance + (request.desiredCashOut || 0);
  const newMonthlyPayment = calculatePMT(requestedLoanAmount, newRate, request.desiredTenure);

  // --- Step 4: DSR Calculation ---
  const totalNewCommitments = nonMortgageCommitments + newMonthlyPayment;
  const dsr = (totalNewCommitments / recognisedIncome) * 100;

  // --- Step 5: Stress-Tested DSR ---
  const stressRate = newRate + 1.75;
  const stressMonthlyPayment = calculatePMT(requestedLoanAmount, stressRate, request.desiredTenure);
  const stressTotalCommitments = nonMortgageCommitments + stressMonthlyPayment;
  const stressDsr = (stressTotalCommitments / recognisedIncome) * 100;

  // --- Step 6: Loan-to-Value (LTV) ---
  const ltv = (requestedLoanAmount / property.marketValue) * 100;

  // --- Step 8: Net Disposable Income (NDI) ---
  const ndi = recognisedIncome - totalNewCommitments;

  // --- Step 7 & 9: Decision Logic & Max Loan ---
  const reasons: string[] = [];
  let isApproved = true;

  // 1. Credit Flags
  if (credit.bankruptcy || credit.monthsInArrears > 2 || credit.restructured) {
    isApproved = false;
    reasons.push("Adverse Credit History");
  }

  // 2. DSR Check (Threshold 70%)
  if (dsr > 70) {
    isApproved = false;
    reasons.push(`DSR too high (${dsr.toFixed(1)}% > 70%)`);
  }

  // 3. Stress DSR Check (Threshold 75%)
  if (stressDsr > 75) {
    isApproved = false;
    reasons.push(`Failed Stress Test (DSR ${stressDsr.toFixed(1)}% > 75%)`);
  }

  // 4. LTV Check
  const maxLTV = request.goal === 'Cash Out' ? 85 : 90;
  if (ltv > maxLTV) {
    isApproved = false;
    reasons.push(`LTV exceeds limit (${ltv.toFixed(1)}% > ${maxLTV}%)`);
  }

  // 5. NDI Check
  if (ndi < 1000) {
    isApproved = false;
    reasons.push("Net Disposable Income too low");
  }

  // --- Max Eligible Calculation ---
  // Max Instalment allowed based on DSR 70%
  const maxAllowedCommitment = recognisedIncome * 0.70;
  const availableForMortgage = Math.max(0, maxAllowedCommitment - nonMortgageCommitments);
  
  // Calculate Principal from available installment
  const maxLoanBasedOnDSR = calculatePV(availableForMortgage, newRate, request.desiredTenure);
  
  // Calculate Principal based on LTV
  const maxLoanBasedOnLTV = property.marketValue * (maxLTV / 100);

  const maxEligibleLoan = Math.min(maxLoanBasedOnDSR, maxLoanBasedOnLTV);

  // Comparison Data
  const currentInstalment = calculatePMT(property.outstandingBalance, property.currentInterestRate, property.remainingTenure);
  const monthlySavings = currentInstalment - newMonthlyPayment;
  const totalInterestNew = (newMonthlyPayment * request.desiredTenure * 12) - requestedLoanAmount;

  return {
    approved: isApproved,
    reason: reasons,
    maxEligibleLoan,
    recognisedIncome,
    newMonthlyPayment,
    stressMonthlyPayment,
    dsr,
    stressDsr,
    ltv,
    ndi,
    monthlySavings,
    totalInterestNew
  };
};