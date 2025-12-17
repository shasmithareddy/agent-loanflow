import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, MessageCircle, Calculator, Loader2 } from 'lucide-react';
import { useLoanStore, LOAN_TYPES } from '@/store/loanStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { calculateEMI } from '@/lib/emiCalculator';

interface HelpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
}

type ConversationState = 
  | 'idle'
  | 'awaiting_loan_type'
  | 'awaiting_amount'
  | 'awaiting_tenure'
  | 'awaiting_income'
  | 'calculating';

interface EMIContext {
  loanType?: string;
  amount?: number;
  tenure?: number;
  income?: number;
  interestRate?: number;
}

export function HelpPopup() {
  const { isHelpOpen, toggleHelp, loanDetails, customerProfile } = useLoanStore();
  const [messages, setMessages] = useState<HelpMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello${customerProfile.fullName ? ` ${customerProfile.fullName.split(' ')[0]}` : ''}! 👋 I'm your Master Loan Agent. I can help you with:\n\n• EMI calculations\n• Loan eligibility checks\n• Document requirements\n• Process status updates\n\nHow can I assist you today?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [emiContext, setEmiContext] = useState<EMIContext>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, {
      id: crypto.randomUUID(),
      role,
      content,
    }]);
  };

  const simulateTyping = (response: string, callback?: () => void) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage('assistant', response);
      setIsTyping(false);
      callback?.();
    }, 800 + Math.random() * 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleEMICalculation = () => {
    setConversationState('awaiting_loan_type');
    simulateTyping("Let me help you calculate EMI! 🧮\n\nWhich type of loan are you interested in?\n\n1️⃣ Personal Loan (12% p.a.)\n2️⃣ Home Loan (8.5% p.a.)\n3️⃣ Car Loan (9.5% p.a.)\n4️⃣ Education Loan (10% p.a.)\n5️⃣ Business Loan (14% p.a.)\n\nJust type the number or loan type!");
  };

  const processLoanTypeResponse = (input: string) => {
    const lowerInput = input.toLowerCase();
    let loanType: string | undefined;
    let interestRate: number | undefined;

    if (lowerInput.includes('1') || lowerInput.includes('personal')) {
      loanType = 'Personal Loan';
      interestRate = 12;
    } else if (lowerInput.includes('2') || lowerInput.includes('home')) {
      loanType = 'Home Loan';
      interestRate = 8.5;
    } else if (lowerInput.includes('3') || lowerInput.includes('car')) {
      loanType = 'Car Loan';
      interestRate = 9.5;
    } else if (lowerInput.includes('4') || lowerInput.includes('education')) {
      loanType = 'Education Loan';
      interestRate = 10;
    } else if (lowerInput.includes('5') || lowerInput.includes('business')) {
      loanType = 'Business Loan';
      interestRate = 14;
    }

    if (loanType && interestRate) {
      setEmiContext({ loanType, interestRate });
      setConversationState('awaiting_amount');
      simulateTyping(`Great choice! ${loanType} at ${interestRate}% p.a. 👍\n\nHow much loan amount do you need?\n\n(Enter amount in rupees, e.g., 500000 or 5 lakhs)`);
    } else {
      simulateTyping("I didn't catch that. Please type a number (1-5) or the loan type (Personal, Home, Car, Education, Business).");
    }
  };

  const parseAmount = (input: string): number | null => {
    const lowerInput = input.toLowerCase().replace(/,/g, '').replace(/₹/g, '').replace(/rs\.?/g, '').trim();
    
    if (lowerInput.includes('lakh') || lowerInput.includes('lac')) {
      const num = parseFloat(lowerInput.replace(/[^0-9.]/g, ''));
      return num * 100000;
    } else if (lowerInput.includes('crore') || lowerInput.includes('cr')) {
      const num = parseFloat(lowerInput.replace(/[^0-9.]/g, ''));
      return num * 10000000;
    }
    
    const num = parseFloat(lowerInput.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };

  const processAmountResponse = (input: string) => {
    const amount = parseAmount(input);
    
    if (amount && amount >= 10000) {
      setEmiContext(prev => ({ ...prev, amount }));
      setConversationState('awaiting_tenure');
      simulateTyping(`Amount: ${formatCurrency(amount)} ✓\n\nWhat loan tenure would you prefer?\n\n(Enter in months or years, e.g., "36 months" or "3 years")`);
    } else {
      simulateTyping("Please enter a valid loan amount (minimum ₹10,000).\n\nExample: 500000 or 5 lakhs");
    }
  };

  const parseTenure = (input: string): number | null => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('year')) {
      const num = parseFloat(lowerInput.replace(/[^0-9.]/g, ''));
      return isNaN(num) ? null : num * 12;
    }
    
    const num = parseFloat(lowerInput.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  };

  const processTenureResponse = (input: string) => {
    const tenure = parseTenure(input);
    
    if (tenure && tenure >= 6 && tenure <= 360) {
      setEmiContext(prev => ({ ...prev, tenure }));
      setConversationState('awaiting_income');
      simulateTyping(`Tenure: ${tenure} months (${(tenure / 12).toFixed(1)} years) ✓\n\nWhat is your monthly income?\n\n(This helps us check affordability)`);
    } else {
      simulateTyping("Please enter a valid tenure between 6 months and 30 years.\n\nExample: 36 months or 3 years");
    }
  };

  const processIncomeResponse = (input: string) => {
    const income = parseAmount(input);
    
    if (income && income >= 10000) {
      const { amount, tenure, interestRate, loanType } = emiContext;
      
      if (amount && tenure && interestRate) {
        setConversationState('calculating');
        setIsTyping(true);
        
        setTimeout(() => {
          const emiResult = calculateEMI(amount, interestRate, tenure);
          const emi = emiResult.emi;
          const totalPayable = emiResult.totalAmount;
          const totalInterest = emiResult.totalInterest;
          const emiToIncomeRatio = (emi / income) * 100;
          const isAffordable = emiToIncomeRatio <= 50;

          const response = `📊 **EMI Calculation Results**\n\n` +
            `**Loan Type:** ${loanType}\n` +
            `**Principal:** ${formatCurrency(amount)}\n` +
            `**Interest Rate:** ${interestRate}% p.a.\n` +
            `**Tenure:** ${tenure} months\n\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `💰 **Monthly EMI:** ${formatCurrency(emi)}\n` +
            `📈 **Total Interest:** ${formatCurrency(totalInterest)}\n` +
            `💵 **Total Payable:** ${formatCurrency(totalPayable)}\n\n` +
            `━━━━━━━━━━━━━━━━━━\n\n` +
            `**Affordability Check:**\n` +
            `• Your Income: ${formatCurrency(income)}/month\n` +
            `• EMI/Income Ratio: ${emiToIncomeRatio.toFixed(1)}%\n` +
            `• Status: ${isAffordable ? '✅ Affordable' : '⚠️ High EMI burden'}\n\n` +
            `${isAffordable 
              ? 'Great news! This EMI fits comfortably in your budget.' 
              : 'Consider a longer tenure or lower amount to reduce EMI.'}\n\n` +
            `Would you like to:\n• Calculate another EMI\n• Know about documents required\n• Check your loan status`;

          addMessage('assistant', response);
          setIsTyping(false);
          setConversationState('idle');
          setEmiContext({});
        }, 1500);
      }
    } else {
      simulateTyping("Please enter a valid monthly income (minimum ₹10,000).\n\nExample: 50000 or 50 thousand");
    }
  };

  const handleGeneralQuery = (input: string) => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('emi') || lowerInput.includes('calculate') || lowerInput.includes('calculator')) {
      handleEMICalculation();
    } else if (lowerInput.includes('document') || lowerInput.includes('kyc') || lowerInput.includes('paper')) {
      simulateTyping("📄 **Documents Required:**\n\n**Identity Proof:**\n• PAN Card (mandatory)\n• Aadhaar Card\n\n**Income Proof:**\n• Latest 3 months salary slips\n• Bank statements (6 months)\n• Form 16 / ITR\n\n**Address Proof:**\n• Utility bills\n• Rent agreement\n\n**For Self-Employed:**\n• Business registration\n• Audited financials\n\nNeed help with anything else?");
    } else if (lowerInput.includes('status') || lowerInput.includes('progress') || lowerInput.includes('where')) {
      const { loanDetails } = useLoanStore.getState();
      simulateTyping(`📋 **Your Loan Status:**\n\n• Loan Type: ${loanDetails.loanType.charAt(0).toUpperCase() + loanDetails.loanType.slice(1)} Loan\n• Amount: ${formatCurrency(loanDetails.amount)}\n• EMI: ${formatCurrency(loanDetails.emi)}/month\n\nCheck the left sidebar for detailed progress of each step. Is there anything specific you'd like to know?`);
    } else if (lowerInput.includes('eligib') || lowerInput.includes('qualify')) {
      simulateTyping("📊 **Eligibility Criteria:**\n\n**Age:** 21-60 years\n\n**Income (Salaried):**\n• Personal: ₹25,000/month\n• Home: ₹50,000/month\n• Car: ₹30,000/month\n\n**Credit Score:** 650+ preferred\n\n**Employment:** Min 1 year total, 6 months current\n\n**EMI/Income:** Should not exceed 50%\n\nWant me to calculate if you're eligible?");
    } else if (lowerInput.includes('interest') || lowerInput.includes('rate')) {
      simulateTyping("💹 **Current Interest Rates:**\n\n• Personal Loan: 12% p.a.\n• Home Loan: 8.5% p.a.\n• Car Loan: 9.5% p.a.\n• Education Loan: 10% p.a.\n• Business Loan: 14% p.a.\n\n*Final rate may vary based on credit profile*\n\nWould you like to calculate EMI for any of these?");
    } else if (lowerInput.includes('time') || lowerInput.includes('long') || lowerInput.includes('process') || lowerInput.includes('fast')) {
      simulateTyping("⏱️ **Processing Timeline:**\n\n1. **Application:** Instant\n2. **KYC Verification:** 1-2 hours\n3. **Credit Assessment:** 2-4 hours\n4. **Final Approval:** Same day*\n5. **Disbursement:** 24-48 hours\n\n*Subject to document verification*\n\nOur AI agents work round the clock to speed up your application!");
    } else if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      simulateTyping(`Hello! 👋 Great to hear from you. I'm your Master Loan Agent, here to help with:\n\n• 🧮 EMI Calculations\n• 📋 Loan Eligibility\n• 📄 Document Requirements\n• 📊 Application Status\n\nWhat would you like to know?`);
    } else if (lowerInput.includes('thank')) {
      simulateTyping("You're welcome! 😊 I'm always here to help. Feel free to ask if you have any more questions about your loan application. Good luck! 🍀");
    } else {
      simulateTyping("I'd be happy to help! Here's what I can assist with:\n\n• **Calculate EMI** - Get instant EMI estimates\n• **Check Eligibility** - Know your loan eligibility\n• **Documents** - List of required documents\n• **Interest Rates** - Current rates for all loans\n• **Status** - Your application progress\n\nJust type your query or choose from above!");
    }
  };

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userInput = input.trim();
    addMessage('user', userInput);
    setInput('');

    switch (conversationState) {
      case 'awaiting_loan_type':
        processLoanTypeResponse(userInput);
        break;
      case 'awaiting_amount':
        processAmountResponse(userInput);
        break;
      case 'awaiting_tenure':
        processTenureResponse(userInput);
        break;
      case 'awaiting_income':
        processIncomeResponse(userInput);
        break;
      default:
        handleGeneralQuery(userInput);
    }
  };

  const quickActions = [
    { label: '🧮 Calculate EMI', action: handleEMICalculation },
    { label: '📄 Documents', action: () => handleGeneralQuery('documents required') },
    { label: '📊 My Status', action: () => handleGeneralQuery('status') },
  ];

  return (
    <>
      {/* Floating Help Button */}
      <motion.button
        onClick={toggleHelp}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full gradient-primary shadow-elegant flex items-center justify-center text-primary-foreground"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isHelpOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </motion.button>

      {/* Help Popup */}
      <AnimatePresence>
        {isHelpOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-50 w-[380px] max-h-[550px] bg-card border border-border rounded-2xl shadow-elegant overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="gradient-primary p-4 text-primary-foreground flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Master Agent</h3>
                  <p className="text-xs text-primary-foreground/80">Always here to help</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 p-3 border-b border-border bg-muted/30 flex-shrink-0">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  disabled={isTyping}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1.5">
                          <Bot className="h-3 w-3" />
                          <span className="text-xs font-medium">Master Agent</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Bot className="h-3 w-3" />
                        <span className="text-xs font-medium">Master Agent</span>
                      </div>
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border bg-card flex-shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    conversationState === 'awaiting_loan_type' ? "Type loan type or number..." :
                    conversationState === 'awaiting_amount' ? "Enter loan amount..." :
                    conversationState === 'awaiting_tenure' ? "Enter tenure..." :
                    conversationState === 'awaiting_income' ? "Enter monthly income..." :
                    "Ask me anything..."
                  }
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isTyping}
                />
                <Button size="icon" onClick={handleSend} disabled={isTyping || !input.trim()}>
                  {isTyping ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
