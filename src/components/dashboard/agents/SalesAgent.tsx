import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Calendar, Wallet } from 'lucide-react';
import { useLoanStore } from '@/store/loanStore';
import { calculateEMI, formatCurrency, formatNumber } from '@/lib/emiCalculator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChatPanel } from '../ChatPanel';

export function SalesAgent() {
  const {
    loanDetails,
    updateLoanDetails,
    addChatMessage,
    setCurrentAgent,
    updateAgentHistory,
    chatMessages,
  } = useLoanStore();

  const [hasGreeted, setHasGreeted] = useState(false);

  // Calculate EMI whenever loan details change
  useEffect(() => {
    const emiResult = calculateEMI(
      loanDetails.amount,
      loanDetails.interestRate,
      loanDetails.tenure
    );
    updateLoanDetails({ emi: emiResult.emi });
  }, [loanDetails.amount, loanDetails.interestRate, loanDetails.tenure]);

  // Initial greeting
  useEffect(() => {
    const salesMessages = chatMessages.filter((m) => m.agent === 'sales');
    if (salesMessages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        addChatMessage({
          agent: 'sales',
          role: 'agent',
          content: `Hello! 👋 Welcome to Tata Capital Personal Loans.

I'm your Sales Agent, and I'm here to help you find the perfect loan for your needs.

Please use the form on the right to tell me:
• How much you'd like to borrow
• Your preferred repayment tenure
• Your monthly income

I'll calculate your EMI in real-time! 💰`,
        });
      }, 500);
    }
  }, [hasGreeted, chatMessages]);

  const emiResult = calculateEMI(
    loanDetails.amount,
    loanDetails.interestRate,
    loanDetails.tenure
  );

  const handleProceed = () => {
    addChatMessage({
      agent: 'sales',
      role: 'user',
      content: `I want a loan of ${formatCurrency(loanDetails.amount)} for ${loanDetails.tenure} months. My monthly income is ${formatCurrency(loanDetails.monthlyIncome)}.`,
    });

    setTimeout(() => {
      addChatMessage({
        agent: 'sales',
        role: 'agent',
        content: `Excellent choice! Here's your loan summary:

📋 **Loan Amount:** ${formatCurrency(loanDetails.amount)}
📅 **Tenure:** ${loanDetails.tenure} months
💵 **Monthly EMI:** ${formatCurrency(emiResult.emi)}
📈 **Interest Rate:** ${loanDetails.interestRate}% p.a.
💰 **Total Amount:** ${formatCurrency(emiResult.totalAmount)}

Now, let's proceed to verify your identity and documents. Our Verification Agent will guide you through the KYC process.`,
      });

      updateAgentHistory('sales', {
        status: 'completed',
        summary: 'Loan requirements collected',
        decision: `${formatCurrency(loanDetails.amount)} @ ${loanDetails.interestRate}% for ${loanDetails.tenure} months`,
      });

      updateAgentHistory('verification', { status: 'current' });

      setTimeout(() => {
        setCurrentAgent('verification');
      }, 2000);
    }, 1000);
  };

  const affordabilityRatio = (emiResult.emi / loanDetails.monthlyIncome) * 100;
  const isAffordable = affordabilityRatio <= 50;

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Chat Panel */}
      <ChatPanel className="min-h-[400px] lg:min-h-0" />

      {/* Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="form-section space-y-6"
      >
        <h3 className="text-lg font-bold text-foreground">Loan Calculator</h3>

        {/* Loan Amount */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Loan Amount</Label>
            <div className="flex items-center gap-1 text-lg font-bold text-primary">
              <IndianRupee className="h-4 w-4" />
              {formatNumber(loanDetails.amount)}
            </div>
          </div>
          <Slider
            value={[loanDetails.amount]}
            onValueChange={([value]) => updateLoanDetails({ amount: value })}
            min={50000}
            max={5000000}
            step={10000}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>₹50,000</span>
            <span>₹50,00,000</span>
          </div>
        </div>

        {/* Tenure */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Tenure (Months)</Label>
            <div className="flex items-center gap-1 text-lg font-bold text-primary">
              <Calendar className="h-4 w-4" />
              {loanDetails.tenure} months
            </div>
          </div>
          <Slider
            value={[loanDetails.tenure]}
            onValueChange={([value]) => updateLoanDetails({ tenure: value })}
            min={12}
            max={60}
            step={6}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 months</span>
            <span>60 months</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Monthly Income</Label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={loanDetails.monthlyIncome}
              onChange={(e) =>
                updateLoanDetails({ monthlyIncome: parseInt(e.target.value) || 0 })
              }
              className="pl-9"
              placeholder="Enter your monthly income"
            />
          </div>
        </div>

        {/* EMI Display */}
        <motion.div
          key={emiResult.emi}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Monthly EMI</span>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5" />
              {formatNumber(emiResult.emi)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Interest</span>
              <p className="font-semibold">{formatCurrency(emiResult.totalInterest)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount</span>
              <p className="font-semibold">{formatCurrency(emiResult.totalAmount)}</p>
            </div>
          </div>

          {/* Affordability indicator */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">EMI to Income Ratio</span>
              <span
                className={`text-sm font-semibold ${
                  isAffordable ? 'text-success' : 'text-destructive'
                }`}
              >
                {affordabilityRatio.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(affordabilityRatio, 100)}%` }}
                className={`h-full rounded-full ${
                  isAffordable ? 'bg-success' : 'bg-destructive'
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isAffordable
                ? '✓ EMI is within affordable range (≤50% of income)'
                : '⚠ EMI exceeds 50% of income - consider adjusting'}
            </p>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          className="w-full"
          size="lg"
          disabled={!isAffordable || loanDetails.monthlyIncome < 10000}
        >
          Proceed to Verification
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
