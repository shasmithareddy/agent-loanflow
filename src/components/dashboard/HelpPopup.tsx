import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Send, Bot, MessageCircle } from 'lucide-react';
import { useLoanStore } from '@/store/loanStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HelpMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const FAQ_RESPONSES: Record<string, string> = {
  'loan': 'Our loan process involves 4 stages: Sales (understanding your needs), Verification (KYC), Underwriting (credit assessment), and Sanction (approval letter). Each stage has a dedicated AI agent to assist you.',
  'emi': 'EMI (Equated Monthly Installment) is calculated using the formula: EMI = P × r × (1+r)^n / ((1+r)^n – 1), where P = Principal, r = Monthly interest rate, n = Tenure in months.',
  'documents': 'You\'ll need: PAN Card, Aadhaar Card, Latest Salary Slip (for salaried), and Bank Statements. All documents should be clear and legible.',
  'interest': 'Interest rates vary by loan type: Personal (12%), Home (8.5%), Car (9.5%), Education (10%), Business (14%). Final rate depends on your credit profile.',
  'eligibility': 'Eligibility is based on: Monthly income, existing EMIs, credit score, employment type, and loan amount requested. Generally, your EMI should not exceed 50% of your income.',
  'time': 'With our AI-powered system, you can get instant preliminary approval. Full processing typically takes 24-48 hours after document submission.',
  'reject': 'If rejected, our system will explain why. Common reasons include: low credit score, high existing debt, or income not meeting criteria. You can modify your application and retry.',
  'default': 'I\'m here to help! You can ask about loan types, EMI calculation, required documents, interest rates, eligibility criteria, or processing time. How can I assist you today?',
};

function findResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('emi') || lowerQuery.includes('monthly')) return FAQ_RESPONSES['emi'];
  if (lowerQuery.includes('document') || lowerQuery.includes('kyc') || lowerQuery.includes('paper')) return FAQ_RESPONSES['documents'];
  if (lowerQuery.includes('interest') || lowerQuery.includes('rate')) return FAQ_RESPONSES['interest'];
  if (lowerQuery.includes('eligible') || lowerQuery.includes('qualify') || lowerQuery.includes('criteria')) return FAQ_RESPONSES['eligibility'];
  if (lowerQuery.includes('time') || lowerQuery.includes('long') || lowerQuery.includes('process')) return FAQ_RESPONSES['time'];
  if (lowerQuery.includes('reject') || lowerQuery.includes('denied') || lowerQuery.includes('fail')) return FAQ_RESPONSES['reject'];
  if (lowerQuery.includes('loan') || lowerQuery.includes('process') || lowerQuery.includes('stage')) return FAQ_RESPONSES['loan'];
  
  return FAQ_RESPONSES['default'];
}

export function HelpPopup() {
  const { isHelpOpen, toggleHelp } = useLoanStore();
  const [messages, setMessages] = useState<HelpMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hi! I\'m your loan assistant. Ask me anything about the loan process, EMI calculation, documents required, or eligibility criteria.',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: HelpMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
    };

    const response = findResponse(input);
    const assistantMessage: HelpMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: response,
    };

    setMessages([...messages, userMessage, assistantMessage]);
    setInput('');
  };

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
            className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-card border border-border rounded-2xl shadow-elegant overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <HelpCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Need Help?</h3>
                  <p className="text-xs text-primary-foreground/80">Ask me anything</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="h-[320px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted text-foreground rounded-bl-md'
                      }`}
                    >
                      {message.role === 'assistant' && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3 w-3" />
                          <span className="text-xs font-medium">Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <Button size="icon" onClick={handleSend}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
