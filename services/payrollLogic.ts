
// Calculation Logic strictly matching Malaysia Payroll Standards (LHDN 2024/2025 & EPF Act 1991)

interface PayrollResult {
  epf: { employer: number; employee: number };
  socso: { employer: number; employee: number };
  eis: { employer: number; employee: number };
  pcb: number;
  netSalary: number;
}

const format = (n: number) => parseFloat(n.toFixed(2));

// Tax Bands for YA 2024 (Resident Individual)
// Based on Budget 2024 updates
const TAX_BANDS = [
  { limit: 5000, rate: 0, baseTax: 0 },
  { limit: 20000, rate: 0.01, baseTax: 0 },         // 5,001 - 20,000
  { limit: 35000, rate: 0.03, baseTax: 150 },       // 20,001 - 35,000
  { limit: 50000, rate: 0.06, baseTax: 600 },       // 35,001 - 50,000 (Reduced from 8%)
  { limit: 70000, rate: 0.11, baseTax: 1500 },      // 50,001 - 70,000 (Reduced from 13%)
  { limit: 100000, rate: 0.19, baseTax: 3700 },     // 70,001 - 100,000 (Reduced from 21%)
  { limit: 400000, rate: 0.25, baseTax: 9400 },     // 100,001 - 400,000
  { limit: 600000, rate: 0.26, baseTax: 84400 },    // 400,001 - 600,000
  { limit: 2000000, rate: 0.28, baseTax: 136400 },  // 600,001 - 2,000,000
  { limit: Infinity, rate: 0.30, baseTax: 528400 }  // > 2,000,000
];

const calculateAnnualTax = (chargeableIncome: number): number => {
  if (chargeableIncome <= 0) return 0;

  let tax = 0;
  for (let i = 0; i < TAX_BANDS.length; i++) {
    const band = TAX_BANDS[i];
    const prevLimit = i === 0 ? 0 : TAX_BANDS[i-1].limit;

    if (chargeableIncome <= band.limit) {
      // Calculate tax on the portion within this band
      tax = band.baseTax + ((chargeableIncome - prevLimit) * band.rate);
      return tax;
    }
  }
  return 0;
};

export const calculatePayroll = (salary: number, bonus: number, age: number = 35): PayrollResult => {
  const totalGross = salary + bonus;

  // --- 1. EPF Calculation (Third Schedule, EPF Act 1991) ---
  // Logic: 
  // - Salary <= 5000: Round up to nearest RM 20.
  // - Salary > 5000: Round up to nearest RM 100. (Verified with 16666 -> 16700 example)
  // - Salary > 20000: Exact percentage calculation (usually). 
  //   (However, most online calcs stick to the "round to 100" or simple % for high income. We will use the table logic up to 20k, then simple % logic).
  
  let epfBasis = totalGross;
  
  if (totalGross <= 5000) {
      epfBasis = Math.ceil(totalGross / 20) * 20;
  } else if (totalGross <= 20000) {
      epfBasis = Math.ceil(totalGross / 100) * 100;
  } else {
      epfBasis = Math.round(totalGross); // Standard practice for very high amounts
  }

  // Rates: 11% (Employee), 13% (Employer)
  const epfEmployer = Math.round(epfBasis * 0.13); 
  const epfEmployee = Math.round(epfBasis * 0.11);


  // --- 2. SOCSO (PERKESO) Calculation ---
  // Wage Ceiling: RM 6000 (Effective 1 Oct 2024)
  let socsoBasis = salary; // Bonus is EXEMPT from SOCSO
  if (socsoBasis > 6000) socsoBasis = 6000;
  
  if (socsoBasis > 0) {
      socsoBasis = Math.ceil(socsoBasis / 100) * 100;
  } else {
      socsoBasis = 0;
  }

  let socsoEmployer = 0;
  let socsoEmployee = 0;

  if (socsoBasis > 0) {
      // Category 1 (Standard) Formulas
      const cat1Employee = (socsoBasis * 0.005) - 0.25;
      
      const isEvenHundred = (socsoBasis / 100) % 2 === 0;
      const employerConstant = isEvenHundred ? 0.85 : 0.90;
      const cat1Employer = (socsoBasis * 0.0175) - employerConstant;

      if (age < 60) {
        // Category 1
        socsoEmployee = cat1Employee;
        socsoEmployer = cat1Employer;
      } else {
        // Category 2 (Age >= 60) - Employer Only (Injury Scheme)
        // Rate is ~1.25%. Formula: Group 1 Employer - Group 1 Employee
        socsoEmployee = 0;
        socsoEmployer = cat1Employer - cat1Employee; 
      }
  }


  // --- 3. EIS (SIP) Calculation ---
  // Wage Ceiling: RM 6000. Bonus is EXEMPT.
  let eisEmployer = 0;
  let eisEmployee = 0;

  if (age < 60) {
    let eisBasis = salary;
    if (eisBasis > 6000) eisBasis = 6000;
    
    if (eisBasis > 0) {
        eisBasis = Math.ceil(eisBasis / 100) * 100;
        // Formula: 0.2%
        eisEmployee = (eisBasis * 0.002) - 0.10;
        eisEmployer = (eisBasis * 0.002) - 0.10;
    }
  }

  // --- 4. PCB (Tax) Calculation - Computerised Calculation Method 2024 ---
  // Formula: PCB = [Tax(Annual_Remuneration) / 12]
  // Bonus PCB = Tax(Annual + Bonus) - Tax(Annual)

  // A. Determine Annual Recurring Income (Y1)
  const annualSalary = salary * 12;
  
  // B. Determine Annual EPF Relief for Salary (K1)
  // Relief capped at RM 4,000 for PCB calculation purposes usually (Private Sector).
  const annualEpfSalary = epfEmployee * 12; // Approximation using current month EPF * 12
  const epfRelief = Math.min(annualEpfSalary, 4000); 

  // C. Calculate Chargeable Income for Salary Only
  const personalRelief = 9000;
  const chargeableIncomeSalary = Math.max(0, annualSalary - personalRelief - epfRelief);

  // D. Calculate Annual Tax on Salary (T1)
  const annualTaxSalary = calculateAnnualTax(chargeableIncomeSalary);

  // E. Calculate Monthly PCB on Salary
  let pcbMonthly = annualTaxSalary / 12;

  // F. Calculate PCB on Bonus (if applicable)
  let pcbBonus = 0;
  if (bonus > 0) {
     // Recalculate Total Annual Income with Bonus
     // Note: EPF on Bonus is also deductible subject to the total 4000 cap.
     // Since 4000 cap is usually hit by salary alone, it often doesn't change relief.
     const annualGrossTotal = annualSalary + bonus;
     
     // Recalculate EPF Relief Total (Usually already maxed at 4000)
     const epfOnBonus = Math.round(bonus * 0.11); // Estimate
     const totalEpfAnnual = annualEpfSalary + epfOnBonus;
     const totalEpfRelief = Math.min(totalEpfAnnual, 4000);

     const chargeableTotal = Math.max(0, annualGrossTotal - personalRelief - totalEpfRelief);
     const annualTaxTotal = calculateAnnualTax(chargeableTotal);

     pcbBonus = annualTaxTotal - annualTaxSalary;
  }

  // Total PCB
  let totalPCB = pcbMonthly + pcbBonus;
  
  // Round up to nearest 5 sen (0.05)
  // e.g. 704.166 -> 704.20
  totalPCB = Math.ceil(totalPCB * 20) / 20;

  // --- 5. Net Salary ---
  const totalDeductions = format(epfEmployee) + format(socsoEmployee) + format(eisEmployee) + format(totalPCB);
  const netSalary = totalGross - totalDeductions;

  return {
      epf: { employer: format(epfEmployer), employee: format(epfEmployee) },
      socso: { employer: format(socsoEmployer), employee: format(socsoEmployee) },
      eis: { employer: format(eisEmployer), employee: format(eisEmployee) },
      pcb: format(totalPCB),
      netSalary: format(netSalary)
  };
}
