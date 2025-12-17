import { create } from 'zustand';

export type AgentType = 'sales' | 'verification' | 'underwriting' | 'sanction';
export type LoanStatus = 'pending' | 'approved' | 'rejected';

export type ProcessStep = 
  | 'welcome'
  | 'phone_verification'
  | 'customer_details'
  | 'loan_details'
  | 'kyc_verification'
  | 'underwriting'
  | 'document_upload'
  | 'loan_approval'
  | 'sanction_letter';

export interface ChatMessage {
  id: string;
  agent: AgentType;
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

export type LoanType = 'personal' | 'home' | 'car' | 'education' | 'business';

export interface LoanTypeConfig {
  id: LoanType;
  name: string;
  interestRate: number;
  minAmount: number;
  maxAmount: number;
  maxTenure: number;
  minIncome: number;
  maxEmiToIncomeRatio: number;
  processingFee: number;
}

export const LOAN_TYPES: LoanTypeConfig[] = [
  {
    id: 'personal',
    name: 'Personal Loan',
    interestRate: 12,
    minAmount: 50000,
    maxAmount: 2500000,
    maxTenure: 60,
    minIncome: 25000,
    maxEmiToIncomeRatio: 50,
    processingFee: 2,
  },
  {
    id: 'home',
    name: 'Home Loan',
    interestRate: 8.5,
    minAmount: 500000,
    maxAmount: 50000000,
    maxTenure: 240,
    minIncome: 50000,
    maxEmiToIncomeRatio: 60,
    processingFee: 0.5,
  },
  {
    id: 'car',
    name: 'Car Loan',
    interestRate: 9.5,
    minAmount: 100000,
    maxAmount: 5000000,
    maxTenure: 84,
    minIncome: 30000,
    maxEmiToIncomeRatio: 50,
    processingFee: 1,
  },
  {
    id: 'education',
    name: 'Education Loan',
    interestRate: 10,
    minAmount: 100000,
    maxAmount: 7500000,
    maxTenure: 120,
    minIncome: 20000,
    maxEmiToIncomeRatio: 55,
    processingFee: 1,
  },
  {
    id: 'business',
    name: 'Business Loan',
    interestRate: 14,
    minAmount: 100000,
    maxAmount: 5000000,
    maxTenure: 60,
    minIncome: 40000,
    maxEmiToIncomeRatio: 45,
    processingFee: 2.5,
  },
];

export interface ProcessStepConfig {
  id: ProcessStep;
  name: string;
  description: string;
  agent: AgentType;
  icon: string;
}

export const PROCESS_STEPS: ProcessStepConfig[] = [
  { id: 'welcome', name: 'Welcome', description: 'Getting started', agent: 'sales', icon: '👋' },
  { id: 'phone_verification', name: 'Phone Verification', description: 'OTP verified', agent: 'sales', icon: '📱' },
  { id: 'customer_details', name: 'Customer Details', description: 'Profile completed', agent: 'sales', icon: '👤' },
  { id: 'loan_details', name: 'Loan Details', description: 'Requirements captured', agent: 'sales', icon: '💰' },
  { id: 'kyc_verification', name: 'KYC Verification', description: 'Documents verified', agent: 'verification', icon: '🔐' },
  { id: 'underwriting', name: 'Underwriting', description: 'Credit assessment', agent: 'underwriting', icon: '📊' },
  { id: 'document_upload', name: 'Document Upload', description: 'Documents submitted', agent: 'underwriting', icon: '📄' },
  { id: 'loan_approval', name: 'Loan Approval', description: 'Decision pending', agent: 'sanction', icon: '⏳' },
  { id: 'sanction_letter', name: 'Sanction Letter', description: 'Final outcome', agent: 'sanction', icon: '✅' },
];

export interface CustomerProfile {
  mobileNumber: string;
  pan: string;
  employmentType: 'salaried' | 'self-employed' | 'business';
  dob: string;
  fullName: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  residenceAddress: string;
  residencePincode: string;
  residenceCity: string;
  residenceState: string;
  email: string;
  aadhaarFile: File | null;
  aadhaarFileName: string;
  livePhoto: string | null;
  isRegistered: boolean;
}

export interface LoanDetails {
  loanType: LoanType;
  amount: number;
  tenure: number;
  monthlyIncome: number;
  emi: number;
  interestRate: number;
  processingFee: number;
  maxEmiToIncomeRatio: number;
}

export interface VerificationDetails {
  fullName: string;
  dob: string;
  employerName: string;
  pan: string;
  aadhaar: string;
  salarySlipFile: File | null;
  parsedIncome: number | null;
  parsedEmployer: string | null;
}

export interface UnderwritingDetails {
  creditScore: number;
  eligibleAmount: number;
  emiAffordability: number;
  status: LoanStatus;
  rejectionReasons: string[];
  selectedPlan: LoanPlan | null;
}

export interface LoanPlan {
  id: string;
  name: string;
  interestRate: number;
  tenure: number;
  emi: number;
  totalAmount: number;
}

export interface ProcessHistoryItem {
  step: ProcessStep;
  status: 'completed' | 'current' | 'pending';
  summary: string;
  timestamp: Date;
  decision?: string;
}

export interface AgentHistoryItem {
  agent: AgentType;
  status: 'completed' | 'current' | 'pending';
  summary: string;
  timestamp: Date;
  decision?: string;
}

interface LoanState {
  currentAgent: AgentType;
  currentProcess: ProcessStep;
  chatMessages: ChatMessage[];
  loanDetails: LoanDetails;
  verificationDetails: VerificationDetails;
  underwritingDetails: UnderwritingDetails;
  processHistory: ProcessHistoryItem[];
  agentHistory: AgentHistoryItem[];
  isHistoryOpen: boolean;
  customerProfile: CustomerProfile;
  isHelpOpen: boolean;
  isApprovalPending: boolean;
  loanDecision: 'pending' | 'approved' | 'rejected';
  rejectionReason: string;

  setCurrentAgent: (agent: AgentType) => void;
  setCurrentProcess: (process: ProcessStep) => void;
  switchToAgent: (agent: AgentType) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLoanDetails: (details: Partial<LoanDetails>) => void;
  updateVerificationDetails: (details: Partial<VerificationDetails>) => void;
  updateUnderwritingDetails: (details: Partial<UnderwritingDetails>) => void;
  updateCustomerProfile: (profile: Partial<CustomerProfile>) => void;
  addAgentHistory: (item: Omit<AgentHistoryItem, 'timestamp'>) => void;
  updateAgentHistory: (agent: AgentType, updates: Partial<AgentHistoryItem>) => void;
  updateProcessHistory: (step: ProcessStep, updates: Partial<ProcessHistoryItem>) => void;
  advanceProcess: (toStep: ProcessStep) => void;
  toggleHistory: () => void;
  toggleHelp: () => void;
  resetLoan: () => void;
  goBackToAgent: (agent: AgentType) => void;
  startApprovalProcess: () => void;
  setLoanDecision: (decision: 'approved' | 'rejected', reason?: string) => void;
}

const initialCustomerProfile: CustomerProfile = {
  mobileNumber: '',
  pan: '',
  employmentType: 'salaried',
  dob: '',
  fullName: '',
  gender: 'male',
  maritalStatus: 'single',
  residenceAddress: '',
  residencePincode: '',
  residenceCity: '',
  residenceState: '',
  email: '',
  aadhaarFile: null,
  aadhaarFileName: '',
  livePhoto: null,
  isRegistered: false,
};

const initialLoanDetails: LoanDetails = {
  loanType: 'personal',
  amount: 500000,
  tenure: 36,
  monthlyIncome: 50000,
  emi: 0,
  interestRate: 12,
  processingFee: 2,
  maxEmiToIncomeRatio: 50,
};

const initialVerificationDetails: VerificationDetails = {
  fullName: '',
  dob: '',
  employerName: '',
  pan: '',
  aadhaar: '',
  salarySlipFile: null,
  parsedIncome: null,
  parsedEmployer: null,
};

const initialUnderwritingDetails: UnderwritingDetails = {
  creditScore: 0,
  eligibleAmount: 0,
  emiAffordability: 0,
  status: 'pending',
  rejectionReasons: [],
  selectedPlan: null,
};

const initialProcessHistory: ProcessHistoryItem[] = PROCESS_STEPS.map((step, index) => ({
  step: step.id,
  status: index === 0 ? 'current' : 'pending' as const,
  summary: step.description,
  timestamp: new Date(),
}));

export const useLoanStore = create<LoanState>((set, get) => ({
  currentAgent: 'sales',
  currentProcess: 'welcome',
  chatMessages: [],
  loanDetails: initialLoanDetails,
  verificationDetails: initialVerificationDetails,
  underwritingDetails: initialUnderwritingDetails,
  processHistory: initialProcessHistory,
  agentHistory: [
    { agent: 'sales', status: 'current', summary: 'Understanding your loan requirements', timestamp: new Date() },
    { agent: 'verification', status: 'pending', summary: 'KYC & Document Verification', timestamp: new Date() },
    { agent: 'underwriting', status: 'pending', summary: 'Credit Assessment', timestamp: new Date() },
    { agent: 'sanction', status: 'pending', summary: 'Loan Sanction Letter', timestamp: new Date() },
  ],
  isHistoryOpen: true,
  customerProfile: initialCustomerProfile,
  isHelpOpen: false,
  isApprovalPending: false,
  loanDecision: 'pending',
  rejectionReason: '',

  setCurrentAgent: (agent) => set({ currentAgent: agent }),
  
  setCurrentProcess: (process) => set({ currentProcess: process }),

  switchToAgent: (agent) => {
    const state = get();
    set({
      currentAgent: agent,
      chatMessages: [
        ...state.chatMessages,
        {
          id: crypto.randomUUID(),
          agent: agent,
          role: 'agent',
          content: `Switching to ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent. How can I help you?`,
          timestamp: new Date(),
        },
      ],
    });
  },

  addChatMessage: (message) => set((state) => ({
    chatMessages: [...state.chatMessages, {
      ...message,
      id: crypto.randomUUID(),
      timestamp: new Date(),
    }],
  })),

  updateLoanDetails: (details) => set((state) => ({
    loanDetails: { ...state.loanDetails, ...details },
  })),

  updateVerificationDetails: (details) => set((state) => ({
    verificationDetails: { ...state.verificationDetails, ...details },
  })),

  updateUnderwritingDetails: (details) => set((state) => ({
    underwritingDetails: { ...state.underwritingDetails, ...details },
  })),

  updateCustomerProfile: (profile) => set((state) => ({
    customerProfile: { ...state.customerProfile, ...profile },
  })),

  addAgentHistory: (item) => set((state) => ({
    agentHistory: [...state.agentHistory, { ...item, timestamp: new Date() }],
  })),

  updateAgentHistory: (agent, updates) => set((state) => ({
    agentHistory: state.agentHistory.map((item) =>
      item.agent === agent ? { ...item, ...updates } : item
    ),
  })),

  updateProcessHistory: (step, updates) => set((state) => ({
    processHistory: state.processHistory.map((item) =>
      item.step === step ? { ...item, ...updates } : item
    ),
  })),

  advanceProcess: (toStep) => {
    const stepIndex = PROCESS_STEPS.findIndex(s => s.id === toStep);
    set((state) => ({
      currentProcess: toStep,
      processHistory: state.processHistory.map((item, index) => {
        if (index < stepIndex) {
          return { ...item, status: 'completed' as const };
        } else if (index === stepIndex) {
          return { ...item, status: 'current' as const };
        }
        return item;
      }),
    }));
  },

  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

  toggleHelp: () => set((state) => ({ isHelpOpen: !state.isHelpOpen })),

  resetLoan: () => set({
    currentAgent: 'sales',
    currentProcess: 'welcome',
    chatMessages: [],
    loanDetails: initialLoanDetails,
    verificationDetails: initialVerificationDetails,
    underwritingDetails: initialUnderwritingDetails,
    processHistory: initialProcessHistory,
    agentHistory: [
      { agent: 'sales', status: 'current', summary: 'Understanding your loan requirements', timestamp: new Date() },
      { agent: 'verification', status: 'pending', summary: 'KYC & Document Verification', timestamp: new Date() },
      { agent: 'underwriting', status: 'pending', summary: 'Credit Assessment', timestamp: new Date() },
      { agent: 'sanction', status: 'pending', summary: 'Loan Sanction Letter', timestamp: new Date() },
    ],
    isApprovalPending: false,
    loanDecision: 'pending',
    rejectionReason: '',
  }),

  goBackToAgent: (agent) => {
    const agentOrder: AgentType[] = ['sales', 'verification', 'underwriting', 'sanction'];
    const targetIndex = agentOrder.indexOf(agent);
    
    set((state) => ({
      currentAgent: agent,
      agentHistory: state.agentHistory.map((item, index) => {
        const itemIndex = agentOrder.indexOf(item.agent);
        if (itemIndex < targetIndex) {
          return { ...item, status: 'completed' as const };
        } else if (itemIndex === targetIndex) {
          return { ...item, status: 'current' as const };
        } else {
          return { ...item, status: 'pending' as const };
        }
      }),
    }));
  },

  startApprovalProcess: () => set({ isApprovalPending: true }),

  setLoanDecision: (decision, reason = '') => set({
    loanDecision: decision,
    rejectionReason: reason,
    isApprovalPending: false,
  }),
}));
