import { create } from 'zustand';

export type AgentType = 'sales' | 'verification' | 'underwriting' | 'sanction';
export type LoanStatus = 'pending' | 'approved' | 'rejected';

export interface ChatMessage {
  id: string;
  agent: AgentType;
  role: 'agent' | 'user';
  content: string;
  timestamp: Date;
}

export interface LoanDetails {
  amount: number;
  tenure: number;
  monthlyIncome: number;
  emi: number;
  interestRate: number;
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

export interface AgentHistoryItem {
  agent: AgentType;
  status: 'completed' | 'current' | 'pending';
  summary: string;
  timestamp: Date;
  decision?: string;
}

interface LoanState {
  currentAgent: AgentType;
  chatMessages: ChatMessage[];
  loanDetails: LoanDetails;
  verificationDetails: VerificationDetails;
  underwritingDetails: UnderwritingDetails;
  agentHistory: AgentHistoryItem[];
  isHistoryOpen: boolean;

  setCurrentAgent: (agent: AgentType) => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLoanDetails: (details: Partial<LoanDetails>) => void;
  updateVerificationDetails: (details: Partial<VerificationDetails>) => void;
  updateUnderwritingDetails: (details: Partial<UnderwritingDetails>) => void;
  addAgentHistory: (item: Omit<AgentHistoryItem, 'timestamp'>) => void;
  updateAgentHistory: (agent: AgentType, updates: Partial<AgentHistoryItem>) => void;
  toggleHistory: () => void;
  resetLoan: () => void;
  goBackToAgent: (agent: AgentType) => void;
}

const initialLoanDetails: LoanDetails = {
  amount: 500000,
  tenure: 36,
  monthlyIncome: 50000,
  emi: 0,
  interestRate: 12,
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

export const useLoanStore = create<LoanState>((set, get) => ({
  currentAgent: 'sales',
  chatMessages: [],
  loanDetails: initialLoanDetails,
  verificationDetails: initialVerificationDetails,
  underwritingDetails: initialUnderwritingDetails,
  agentHistory: [
    { agent: 'sales', status: 'current', summary: 'Understanding your loan requirements', timestamp: new Date() },
    { agent: 'verification', status: 'pending', summary: 'KYC & Document Verification', timestamp: new Date() },
    { agent: 'underwriting', status: 'pending', summary: 'Credit Assessment', timestamp: new Date() },
    { agent: 'sanction', status: 'pending', summary: 'Loan Sanction Letter', timestamp: new Date() },
  ],
  isHistoryOpen: true,

  setCurrentAgent: (agent) => set({ currentAgent: agent }),

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

  addAgentHistory: (item) => set((state) => ({
    agentHistory: [...state.agentHistory, { ...item, timestamp: new Date() }],
  })),

  updateAgentHistory: (agent, updates) => set((state) => ({
    agentHistory: state.agentHistory.map((item) =>
      item.agent === agent ? { ...item, ...updates } : item
    ),
  })),

  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

  resetLoan: () => set({
    currentAgent: 'sales',
    chatMessages: [],
    loanDetails: initialLoanDetails,
    verificationDetails: initialVerificationDetails,
    underwritingDetails: initialUnderwritingDetails,
    agentHistory: [
      { agent: 'sales', status: 'current', summary: 'Understanding your loan requirements', timestamp: new Date() },
      { agent: 'verification', status: 'pending', summary: 'KYC & Document Verification', timestamp: new Date() },
      { agent: 'underwriting', status: 'pending', summary: 'Credit Assessment', timestamp: new Date() },
      { agent: 'sanction', status: 'pending', summary: 'Loan Sanction Letter', timestamp: new Date() },
    ],
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
}));
