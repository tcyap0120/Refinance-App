
import { ClientData, DecisionResult, QuickQuoteData, RefiGoal, EmploymentType } from '../types';

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

export interface QuickAnalysisResult {
  newMonthlyPayment: number;
  monthlySavings: number;
  potentialCashOut: number;
  totalInterestSaved: number; // Over 30 years roughly
}

export const calculateQuickQuote = (data: QuickQuoteData, newRate: number = 3.55): QuickAnalysisResult => {
  const standardTenure = 30; // Default assumption for quick quote
  
  // 1. Calculate New Payment on Outstanding Balance
  const newMonthlyPayment = calculatePMT(data.outstandingBalance, newRate, standardTenure);

  // 2. Calculate Savings
  let monthlySavings = 0;
  if (data.currentInstallment) {
    monthlySavings = data.currentInstallment - newMonthlyPayment;
  } else {
    // If current installment not provided (Cash Out flow), estimate based on average rate (4.5%)
    const estCurrentPayment = calculatePMT(data.outstandingBalance, 4.5, standardTenure);
    monthlySavings = estCurrentPayment - newMonthlyPayment;
  }

  // 3. Calculate Potential Cash Out
  let potentialCashOut = 0;
  if (data.goal === RefiGoal.CASH_OUT && data.estimatedValue) {
    // Assume 80% Margin of Finance (Conservative)
    const maxLoan = data.estimatedValue * 0.80;
    potentialCashOut = Math.max(0, maxLoan - data.outstandingBalance);
  } else if (data.goal === RefiGoal.CASH_OUT && !data.estimatedValue) {
      // Cannot calculate without est value, return 0
      potentialCashOut = 0;
  }

  // 4. Total Interest Saved (Rough approximation over tenure)
  const totalInterestSaved = monthlySavings * standardTenure * 12;

  return {
    newMonthlyPayment,
    monthlySavings,
    potentialCashOut,
    totalInterestSaved
  };
};

export const calculateEligibility = (data: ClientData, newRate: number = 3.55): DecisionResult => {
  const { income, commitments, property, request, credit } = data;

  // --- Step 1: Recognised Monthly Income (Haircuts) ---
  let recognisedIncome = 0;

  // Calculate Other Income First
  // Rental: 75% recognition
  // Part Time: 50% recognition
  const otherIncome = (income.rentalIncome * 0.75) + (income.partTimeIncome * 0.50);

  if (data.employmentType === EmploymentType.COMMISSION_EARNER) {
      // Logic for Commission Earner
      // 80% recognition of 6-month average commission + other income
      recognisedIncome = ((income.avgMonthlyCommission || 0) * 0.80) + otherIncome;

  } else if (data.employmentType === EmploymentType.BUSINESS_OWNER || data.employmentType === EmploymentType.SELF_EMPLOYED) {
      // Logic for Business Owner
      // Primary Method: Annual Declared Income / 12
      const monthlyDeclared = (income.annualDeclaredIncome || 0) / 12;
      recognisedIncome = monthlyDeclared + otherIncome;

  } else {
      // Logic for Standard Employee (Permanent/Contract)
      recognisedIncome = 
        income.fixedSalary + 
        income.fixedAllowance + 
        (income.variableCommission * 0.60) + // 60% recognition
        (income.variableBonus * 0.50) +      // 50% recognition
        (income.variableOvertime * 0.50) +   // 50% recognition
        otherIncome;
  }

  // --- Step 2: Monthly Debt Commitments ---
  // Note: We exclude existing home loan assuming it's being settled by refinance? 
  // NOTE: If refinancing, the 'existingHomeLoan' is usually removed from DSR calc as it will be replaced by 'newMonthlyPayment'.
  // However, if they have *other* house loans, they should stay. 
  // For this calculator, we assume 'existingHomeLoan' input refers to the one being refinanced, so we exclude it.
  
  const creditCardCommitment = commitments.creditCardOutstanding * 0.05;
  
  const nonMortgageCommitments = 
    commitments.carLoans + 
    commitments.personalLoans + 
    commitments.ptptn + 
    commitments.otherLiabilities + 
    creditCardCommitment;
    // We intentionally do not add commitments.existingHomeLoan here assuming it is the subject property.

  // --- Step 3: New Refinance Instalment ---
  // Requested Loan Amount = Outstanding Balance + Cash Out
  const requestedLoanAmount = property.outstandingBalance + (request.desiredCashOut || 0);
  const newMonthlyPayment = calculatePMT(requestedLoanAmount, newRate, request.desiredTenure);

  // --- Step 4: DSR Calculation ---
  const totalNewCommitments = nonMortgageCommitments + newMonthlyPayment;
  const dsr = recognisedIncome > 0 ? (totalNewCommitments / recognisedIncome) * 100 : 100;

  // --- Step 5: Stress-Tested DSR ---
  const stressRate = newRate + 1.75;
  const stressMonthlyPayment = calculatePMT(requestedLoanAmount, stressRate, request.desiredTenure);
  const stressTotalCommitments = nonMortgageCommitments + stressMonthlyPayment;
  const stressDsr = recognisedIncome > 0 ? (stressTotalCommitments / recognisedIncome) * 100 : 100;

  // --- Step 6: Loan-to-Value (LTV) ---
  const ltv = (requestedLoanAmount / property.marketValue) * 100;

  // --- Step 8: Net Disposable Income (NDI) ---
  const ndi = recognisedIncome - totalNewCommitments;

  // --- Step 7 & 9: Decision Logic & Max Loan ---
  const reasons: string[] = [];
  let isApproved = true;

  // 1. Credit Flags
  if (credit.akpk) {
      isApproved = false;
      reasons.push("Under AKPK Program");
  }
  if (credit.bankruptcy) {
    isApproved = false;
    reasons.push("Bankruptcy Status");
  }
  if (credit.latePayments12Months) {
      // Logic: > 2 months late
      isApproved = false;
      reasons.push("Severe Late Payments (>2 months)");
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
  // If property.currentInstallment is available, use it, otherwise calc
  let currentInstalment = property.currentInstallment;
  if (!currentInstalment) {
      currentInstalment = calculatePMT(property.outstandingBalance, property.currentInterestRate, property.remainingTenure);
  }
  
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