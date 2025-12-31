export enum AppView {
  LANDING = 'LANDING',
  FORM = 'FORM',
  RESULTS = 'RESULTS',
  UPLOAD = 'UPLOAD',
  SUCCESS = 'SUCCESS',
  ADMIN_LOGIN = 'ADMIN_LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export enum RefiGoal {
  CASH_OUT = 'Cash Out',
  SAVE_INTEREST = 'Save Interest'
}

export enum EmploymentType {
  SALARIED = 'Salaried',
  SELF_EMPLOYED = 'Self-Employed',
  FREELANCE = 'Freelance'
}

export interface ClientData {
  id: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  goal: RefiGoal;
  // Personal
  name: string;
  email: string;
  phone: string;
  // Employment
  employmentType: EmploymentType;
  monthlyIncome: number;
  // Property
  address: string;
  propertyValue: number;
  // Current Loan
  currentLoanBalance: number;
  currentInterestRate: number;
  remainingTenure: number; // in years
  // Commitments
  monthlyDebts: number;
  // Desired (for calculation)
  desiredLoanAmount?: number;
  desiredTenure?: number;
}

export interface CalculationResult {
  dsr: number; // Debt Service Ratio
  maxLoanAmount: number;
  ltv: number;
  confidence: 'High' | 'Medium' | 'Low';
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  monthlySavings: number;
  cashOutAmount: number;
}

export interface LoanScenario {
  name: string;
  interestRate: number;
  tenure: number;
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
}
