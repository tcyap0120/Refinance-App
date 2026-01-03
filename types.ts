
export enum AppView {
  LANDING = 'LANDING',
  QUICK_QUOTE = 'QUICK_QUOTE',
  QUICK_QUOTE_SUCCESS = 'QUICK_QUOTE_SUCCESS', // New View
  QUICK_REPORT = 'QUICK_REPORT',
  FORM = 'FORM',
  RESULTS = 'RESULTS',
  UPLOAD = 'UPLOAD',
  SUCCESS = 'SUCCESS',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  // Content Pages
  HOW_IT_WORKS = 'HOW_IT_WORKS',
  WHY_REFINANCE = 'WHY_REFINANCE',
  CALCULATOR = 'CALCULATOR',
  PAYROLL = 'PAYROLL',
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
  COMMISSION_EARNER = 'Commission Earner', // New
  SELF_EMPLOYED = 'Self-Employed',
  BUSINESS_OWNER = 'Business Owner',
  FREELANCE = 'Freelance'
}

export enum BusinessNature {
  RETAIL = 'Retail / Trading',
  F_AND_B = 'Food & Beverage',
  SERVICES = 'Professional Services',
  MANUFACTURING = 'Manufacturing / Construction',
  TECHNOLOGY = 'Technology / IT',
  LOGISTICS = 'Logistics / Transport',
  OTHER = 'Other'
}

export enum PropertyCategory {
  LANDED = 'Landed',
  HIGH_RISE = 'High Rise',
  COMMERCIAL = 'Commercial'
}

export enum PropertyType {
  // Landed
  TERRACE = 'Terrace / Link House',
  SEMI_D = 'Semi-D',
  BUNGALOW = 'Bungalow',
  CLUSTER = 'Cluster House',
  // High Rise
  CONDO = 'Condominium / Serviced Residence',
  APARTMENT = 'Apartment',
  FLAT = 'Flat',
  STUDIO = 'Studio / SOHO',
  // Commercial
  SHOP_LOT = 'Shop Lot',
  OFFICE = 'Office Unit',
  FACTORY = 'Factory'
}

// Minimal data collected in the first phase
export interface QuickQuoteData {
  name: string;
  phone: string;
  goal: RefiGoal;
  
  // Common
  outstandingBalance: number;
  
  // Cash Out Specific
  propertyAddress?: string;
  propertyCategory?: PropertyCategory; // New
  propertyType?: PropertyType;
  
  // Size Logic
  landSize?: number; // Req for Landed & Commercial (Factory/Shop)
  builtUpSize?: number; // Req for High Rise, Opt for Landed, Mixed for Commercial
  storeys?: number; // Req for Landed
  
  estimatedValue?: number; // Optional now

  // Save Interest Specific
  currentInterestRate?: number;
  currentInstallment?: number;
  age?: number;
}

export type PipelineStage = 'LEAD' | 'ELIGIBILITY' | 'SUBMISSION' | 'TRASH';

export interface ClientData {
  id: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  pipelineStage: PipelineStage; // NEW FIELD: Tracks the 3 steps
  
  // Admin Flags
  linkSent?: boolean; // Track if WhatsApp link sent
  deletedAt?: string; // For trash logic

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
    // Employee Fields
    fixedSalary: number;
    fixedAllowance: number;
    variableCommission: number;
    variableBonus: number; // Monthly average
    variableOvertime: number;
    
    // Commission Earner Fields
    avgMonthlyCommission?: number; // Recent 6 months avg
    
    // Business Owner Fields
    businessNature?: BusinessNature;
    annualDeclaredIncome?: number; // 2024 Declared
    annualTaxPaid?: number; // Optional
    avgMonthlyRevenue?: number; // Recent 6 months company revenue

    // Shared / Other
    rentalIncome: number; 
    partTimeIncome: number; // Added
  };

  // D. Monthly Commitments
  commitments: {
    existingHomeLoan: number; 
    carLoans: number;
    personalLoans: number;
    creditCardOutstanding: number; // Balance, not payment
    ptptn: number;
    otherLiabilities: number;
  };

  // E. Credit Behaviour
  credit: {
    akpk: boolean; // New
    latePayments12Months: boolean; // Now strictly > 2 months
    monthsInArrears: number; // Can default to 0
    restructured: boolean; // Kept for logic, mapped from AKPK mostly
    bankruptcy: boolean;
  };

  // F & G. Property & Existing Loan
  property: {
    address: string;
    category: PropertyCategory;
    type: PropertyType;
    titleType: 'Residential' | 'Commercial';
    marketValue: number;
    isOwnerOccupied: boolean;
    landSize?: number;
    builtUpSize?: number;
    storeys?: number;
    // Existing Loan
    outstandingBalance: number;
    currentInterestRate: number;
    currentInstallment: number; // Added
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
