export enum AppView {
  LANDING = 'LANDING',
  FORM = 'FORM',
  RESULTS = 'RESULTS',
  UPLOAD = 'UPLOAD',
  SUCCESS = 'SUCCESS',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  // New Pages
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  WHY_REFINANCE = 'WHY_REFINANCE',
  CALCULATOR = 'CALCULATOR',
  FAQ = 'FAQ',
  PRIVACY = 'PRIVACY'
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export enum RefiGoal {
  CASH_OUT = 'Cash Out',
  SAVE_INTEREST = 'Save Interest'
}

export enum EmploymentType {
  PERMANENT = 'Permanent',
  CONTRACT = 'Contract',
  SELF_EMPLOYED = 'Self-Employed',
  BUSINESS_OWNER = 'Business Owner',
  FREELANCE = 'Freelance'
}

export enum PropertyType {
  LANDED = 'Landed',
  CONDO = 'Condo/Serviced Residence',
  APARTMENT = 'Apartment/Flat',
  SOHO = 'SOHO/Studio',
  COMMERCIAL = 'Commercial'
}

export interface ClientData {
  id: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  
  // A. Personal Profile
  name: string;
  ic: string;
  age: number;
  email: string;
  phone: string;
  citizenship: 'Citizen' | 'Non-Citizen';
  maritalStatus: 'Single' | 'Married' | 'Divorced';
  dependents: number;

  // B. Employment
  employmentType: EmploymentType;
  jobTitle: string;
  employerName: string;
  yearsInService: number;

  // C. Income (Monthly Gross)
  income: {
    fixedSalary: number;
    fixedAllowance: number;
    variableCommission: number;
    variableBonus: number; // Monthly average
    variableOvertime: number;
    rentalIncome: number;
    businessIncome: number;
    dividends: number;
  };

  // D. Monthly Commitments
  commitments: {
    existingHomeLoan: number; // To be removed if refinancing, but kept for record
    carLoans: number;
    personalLoans: number;
    creditCardOutstanding: number; // Balance, not payment
    bnpl: number;
    ptptn: number;
    otherLiabilities: number;
  };

  // E. Credit Behaviour
  credit: {
    latePayments12Months: boolean;
    monthsInArrears: number;
    restructured: boolean;
    bankruptcy: boolean;
  };

  // F & G. Property & Existing Loan
  property: {
    address: string;
    type: PropertyType;
    titleType: 'Residential' | 'Commercial';
    marketValue: number;
    isOwnerOccupied: boolean;
    // Existing Loan
    outstandingBalance: number;
    currentInterestRate: number;
    remainingTenure: number;
    lockInPeriodEndsYear: number; // 0 if none
  };

  // H. Refinance Request
  request: {
    goal: RefiGoal;
    desiredCashOut: number;
    desiredTenure: number;
  };
}

export interface DecisionResult {
  approved: boolean;
  reason: string[]; // List of failure reasons
  maxEligibleLoan: number;
  
  // Calculations
  recognisedIncome: number;
  newMonthlyPayment: number;
  stressMonthlyPayment: number;
  
  // Ratios
  dsr: number;
  stressDsr: number;
  ltv: number;
  ndi: number;
  
  // Comparison
  monthlySavings: number;
  totalInterestNew: number;
}