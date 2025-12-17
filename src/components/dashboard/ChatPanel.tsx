import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Loader2 } from 'lucide-react';
import { useLoanStore, AgentType } from '@/store/loanStore';
import { AgentBadge } from './AgentBadge';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatPanelProps {
  className?: string;
}

const agentAvatars: Record<AgentType, string> = {
  sales: '🤝',
  verification: '🔐',
  underwriting: '📊',
  sanction: '📄',
};

const agentResponses: Record<AgentType, (input: string) => string> = {
  sales: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('loan') || lower.includes('amount')) {
      return "I see you're interested in the loan amount! You can adjust the loan amount using the slider on the right. Our rates are competitive starting from 8.5% p.a.";
    }
    if (lower.includes('emi') || lower.includes('payment')) {
      return "Great question about EMI! The monthly payment depends on your loan amount and tenure. Use the calculator on the right to see real-time EMI calculations.";
    }
    if (lower.includes('rate') || lower.includes('interest')) {
      return "Our interest rates vary by loan type: Personal (12%), Home (8.5%), Car (9.5%), Education (10%), Business (14%). Select a loan type to see specific rates!";
    }
    if (lower.includes('tenure') || lower.includes('month') || lower.includes('year')) {
      return "You can choose a tenure from 12 months up to 240 months for home loans. Longer tenure means lower EMI but more interest paid overall.";
    }
    if (lower.includes('help') || lower.includes('how')) {
      return "I'm here to help! Select your loan type, adjust the amount and tenure using the sliders, enter your monthly income, and click 'Proceed to Verification' when ready.";
    }
    return "Thanks for your message! I'm your Sales Agent. Please use the loan calculator on the right to configure your loan, or ask me about rates, EMI, or eligibility.";
  },
  verification: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('pan') || lower.includes('document')) {
      return "PAN card is mandatory for KYC. Please ensure your PAN is valid and matches your name exactly. We also need Aadhaar for address verification.";
    }
    if (lower.includes('aadhaar') || lower.includes('address')) {
      return "Your Aadhaar helps us verify your address. Make sure the address on Aadhaar matches your current residence for smooth verification.";
    }
    if (lower.includes('salary') || lower.includes('income') || lower.includes('slip')) {
      return "Salary slips from the last 3 months help us verify your income. If self-employed, ITR or bank statements work too.";
    }
    if (lower.includes('time') || lower.includes('long')) {
      return "KYC verification usually takes 1-2 hours after document submission. Our AI systems work quickly to validate your documents.";
    }
    return "I'm your Verification Agent. Please complete the KYC details on the right panel. Ask me about documents needed or verification process.";
  },
  underwriting: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('credit') || lower.includes('score') || lower.includes('cibil')) {
      return "Your credit score is a key factor. A score above 750 gives you better rates. Below 650 may affect approval chances.";
    }
    if (lower.includes('eligible') || lower.includes('qualify')) {
      return "Eligibility depends on income, credit score, existing EMIs, and employment stability. We assess all factors for the best offer.";
    }
    if (lower.includes('reject') || lower.includes('deny')) {
      return "If eligibility concerns arise, we may offer alternative plans with adjusted amounts or tenures. We work to find a solution for you.";
    }
    return "I'm analyzing your credit profile. The assessment considers credit score, income stability, and debt-to-income ratio. Ask me about eligibility criteria!";
  },
  sanction: (input) => {
    const lower = input.toLowerCase();
    if (lower.includes('letter') || lower.includes('document')) {
      return "Once approved, your sanction letter will be generated with all loan terms. You can download it as PDF.";
    }
    if (lower.includes('disburse') || lower.includes('when') || lower.includes('money')) {
      return "After sanction, disbursement typically happens within 24-48 hours to your registered bank account.";
    }
    if (lower.includes('sign') || lower.includes('accept')) {
      return "Review all terms in the sanction letter carefully. Once you accept, the loan will be processed for disbursement.";
    }
    return "I'm your Sanction Agent. The final decision on your loan is being processed. Ask me about the sanction letter or disbursement timeline!";
  },
};

export function ChatPanel({ className }: ChatPanelProps) {
  const { chatMessages, currentAgent, addChatMessage } = useLoanStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const filteredMessages = chatMessages.filter((msg) => msg.agent === currentAgent);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addChatMessage({
      agent: currentAgent,
      role: 'user',
      content: userMessage,
    });

    // Simulate agent typing and response
    setIsTyping(true);
    setTimeout(() => {
      const response = agentResponses[currentAgent](userMessage);
      addChatMessage({
        agent: currentAgent,
        role: 'agent',
        content: response,
      });
      setIsTyping(false);
    }, 1000 + Math.random() * 500);
  };

  return (
    <div className={cn('flex flex-col h-full bg-card rounded-xl border border-border', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
          {agentAvatars[currentAgent]}
        </div>
        <div>
          <AgentBadge agent={currentAgent} isActive size="sm" />
          <p className="text-xs text-muted-foreground mt-1">AI Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
      >
        <AnimatePresence mode="popLayout">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              {message.role === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                  {agentAvatars[message.agent]}
                </div>
              )}
              <div
                className={cn(
                  'chat-bubble',
                  message.role === 'agent' && 'chat-bubble-agent',
                  message.role === 'user' && 'chat-bubble-user'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-[10px] mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                {agentAvatars[currentAgent]}
              </div>
              <div className="chat-bubble chat-bubble-agent">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Typing...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {filteredMessages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Start your loan journey...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            disabled={isTyping}
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isTyping}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
