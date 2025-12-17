import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check, X, AlertTriangle, TrendingUp, Shield } from 'lucide-react';
import { useLoanStore, LoanPlan } from '@/store/loanStore';
import { calculateEMI, formatCurrency } from '@/lib/emiCalculator';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '../ChatPanel';
import { cn } from '@/lib/utils';

export function UnderwritingAgent() {
  const {
    loanDetails,
    verificationDetails,
    underwritingDetails,
    updateUnderwritingDetails,
    addChatMessage,
    setCurrentAgent,
    updateAgentHistory,
    chatMessages,
    goBackToAgent,
    advanceProcess,
  } = useLoanStore();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [loanPlans, setLoanPlans] = useState<LoanPlan[]>([]);

  // Initial greeting and analysis
  useEffect(() => {
    const underwritingMessages = chatMessages.filter((m) => m.agent === 'underwriting');
    if (underwritingMessages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        addChatMessage({
          agent: 'underwriting',
          role: 'agent',
          content: `Hello! 📊 I'm your Underwriting Agent.

I'm now analyzing your application to determine your loan eligibility. This includes:

• Credit score assessment
• Income verification
• EMI affordability check
• Risk evaluation

Please wait while I process your application...`,
        });

        // Simulate analysis
        setTimeout(() => performAnalysis(), 3000);
      }, 500);
    }
  }, [hasGreeted, chatMessages]);

  const performAnalysis = () => {
    // Mock credit score (650-850)
    const creditScore = Math.floor(650 + Math.random() * 200);
    
    // Eligibility based on 4x monthly income
    const income = verificationDetails.parsedIncome || loanDetails.monthlyIncome;
    const eligibleAmount = income * 48; // 4 years of income
    
    // EMI affordability (50% of salary)
    const maxAffordableEMI = income * 0.5;
    const currentEMI = loanDetails.emi;
    const emiAffordability = (currentEMI / income) * 100;

    // Determine approval status
    const rejectionReasons: string[] = [];
    
    if (creditScore < 650) {
      rejectionReasons.push('Credit score below minimum threshold (650)');
    }
    if (loanDetails.amount > eligibleAmount) {
      rejectionReasons.push(`Requested amount exceeds eligible limit of ${formatCurrency(eligibleAmount)}`);
    }
    if (emiAffordability > 50) {
      rejectionReasons.push('EMI exceeds 50% of monthly income');
    }

    const status = rejectionReasons.length === 0 ? 'approved' : 'rejected';

    // Generate loan plans if approved
    let plans: LoanPlan[] = [];
    if (status === 'approved') {
      const baseRate = 10 + Math.random() * 4;
      plans = [
        {
          id: 'economy',
          name: 'Economy Plan',
          interestRate: parseFloat((baseRate + 2).toFixed(2)),
          tenure: loanDetails.tenure + 12,
          emi: calculateEMI(loanDetails.amount, baseRate + 2, loanDetails.tenure + 12).emi,
          totalAmount: calculateEMI(loanDetails.amount, baseRate + 2, loanDetails.tenure + 12).totalAmount,
        },
        {
          id: 'standard',
          name: 'Standard Plan',
          interestRate: parseFloat(baseRate.toFixed(2)),
          tenure: loanDetails.tenure,
          emi: calculateEMI(loanDetails.amount, baseRate, loanDetails.tenure).emi,
          totalAmount: calculateEMI(loanDetails.amount, baseRate, loanDetails.tenure).totalAmount,
        },
        {
          id: 'premium',
          name: 'Premium Plan',
          interestRate: parseFloat((baseRate - 1.5).toFixed(2)),
          tenure: loanDetails.tenure - 6 > 12 ? loanDetails.tenure - 6 : 12,
          emi: calculateEMI(loanDetails.amount, baseRate - 1.5, loanDetails.tenure - 6 > 12 ? loanDetails.tenure - 6 : 12).emi,
          totalAmount: calculateEMI(loanDetails.amount, baseRate - 1.5, loanDetails.tenure - 6 > 12 ? loanDetails.tenure - 6 : 12).totalAmount,
        },
      ];
      setLoanPlans(plans);
    }

    updateUnderwritingDetails({
      creditScore,
      eligibleAmount,
      emiAffordability,
      status,
      rejectionReasons,
    });

    setIsAnalyzing(false);

    // Add result message
    if (status === 'approved') {
      addChatMessage({
        agent: 'underwriting',
        role: 'agent',
        content: `🎉 Great news! Your loan application has been **APPROVED**!

**Credit Assessment:**
• Credit Score: ${creditScore} (${creditScore >= 750 ? 'Excellent' : creditScore >= 700 ? 'Good' : 'Fair'})
• Eligible Amount: ${formatCurrency(eligibleAmount)}
• EMI Affordability: ${emiAffordability.toFixed(1)}% of income

I've prepared 3 loan plans for you to choose from. Each offers different interest rates and tenures.

Please select the plan that best suits your needs.`,
      });
    } else {
      addChatMessage({
        agent: 'underwriting',
        role: 'agent',
        content: `I'm sorry, but your loan application has been **DECLINED** at this time.

**Reasons:**
${rejectionReasons.map((r) => `• ${r}`).join('\n')}

**Suggestions to improve your eligibility:**
• Reduce the loan amount to ${formatCurrency(Math.min(loanDetails.amount, eligibleAmount * 0.8))}
• Increase the tenure to reduce EMI
• Improve your credit score by paying existing debts

You can go back and modify your application to try again.`,
      });
    }
  };

  const handleSelectPlan = (plan: LoanPlan) => {
    updateUnderwritingDetails({ selectedPlan: plan });
    
    addChatMessage({
      agent: 'underwriting',
      role: 'user',
      content: `I'll go with the ${plan.name} at ${plan.interestRate}% p.a.`,
    });

    setTimeout(() => {
      addChatMessage({
        agent: 'underwriting',
        role: 'agent',
        content: `Excellent choice! 🎯

You've selected the **${plan.name}**:
• Interest Rate: ${plan.interestRate}% p.a.
• Tenure: ${plan.tenure} months
• Monthly EMI: ${formatCurrency(plan.emi)}
• Total Repayment: ${formatCurrency(plan.totalAmount)}

Your loan is now approved and ready for sanction. Our Sanction Agent will generate your official sanction letter.`,
      });

      updateAgentHistory('underwriting', {
        status: 'completed',
        summary: 'Credit assessment completed',
        decision: `Approved: ${plan.name} @ ${plan.interestRate}%`,
      });

      updateAgentHistory('sanction', { status: 'current' });
      
      // Advance process
      advanceProcess('document_upload');

      setTimeout(() => {
        setCurrentAgent('sanction');
        advanceProcess('loan_approval');
      }, 2000);
    }, 1000);
  };

  const renderAnalyzing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center h-full py-12"
    >
      <div className="relative">
        <div className="w-24 h-24 border-4 border-primary/20 rounded-full" />
        <div className="absolute inset-0 w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <TrendingUp className="absolute inset-0 m-auto h-10 w-10 text-primary" />
      </div>
      <h3 className="mt-6 text-lg font-semibold">Analyzing Your Application</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Running credit checks and eligibility assessment...
      </p>
    </motion.div>
  );

  const renderApproved = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Credit Score Card */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-success flex items-center justify-center">
            <Check className="h-5 w-5 text-success-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-success">Application Approved!</h4>
            <p className="text-sm text-muted-foreground">
              Credit Score: {underwritingDetails.creditScore}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Eligible Amount</span>
            <p className="font-semibold">{formatCurrency(underwritingDetails.eligibleAmount)}</p>
          </div>
          <div>
            <span className="text-muted-foreground">EMI to Income</span>
            <p className="font-semibold">{underwritingDetails.emiAffordability.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Loan Plans */}
      <div>
        <h4 className="font-semibold mb-4">Choose Your Plan</h4>
        <div className="space-y-3">
          {loanPlans.map((plan, index) => (
            <motion.button
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleSelectPlan(plan)}
              className={cn(
                'w-full p-4 rounded-xl border-2 text-left transition-all hover:shadow-md',
                plan.id === 'premium' 
                  ? 'border-accent bg-accent/5 hover:border-accent/80'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{plan.name}</span>
                {plan.id === 'premium' && (
                  <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full">
                    Best Rate
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Rate</span>
                  <p className="font-semibold">{plan.interestRate}% p.a.</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tenure</span>
                  <p className="font-semibold">{plan.tenure} months</p>
                </div>
                <div>
                  <span className="text-muted-foreground">EMI</span>
                  <p className="font-semibold">{formatCurrency(plan.emi)}</p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderRejected = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Rejection Card */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
            <X className="h-5 w-5 text-destructive-foreground" />
          </div>
          <div>
            <h4 className="font-bold text-destructive">Application Declined</h4>
            <p className="text-sm text-muted-foreground">
              Credit Score: {underwritingDetails.creditScore}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h5 className="text-sm font-medium">Reasons:</h5>
          {underwritingDetails.rejectionReasons.map((reason, index) => (
            <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-warning/10 border border-warning/20 rounded-xl p-5">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4" />
          How to Improve Your Chances
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Try reducing the loan amount</li>
          <li>• Increase the tenure to lower EMI</li>
          <li>• Clear any existing outstanding debts</li>
          <li>• Ensure all documents are up to date</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => goBackToAgent('sales')}
        >
          Modify Loan Amount
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => goBackToAgent('verification')}
        >
          Update Documents
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Chat Panel */}
      <ChatPanel className="min-h-[400px] lg:min-h-0" />

      {/* Analysis Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="form-section"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Credit Assessment</h3>
          {!isAnalyzing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => goBackToAgent('verification')}
            >
              ← Edit Details
            </Button>
          )}
        </div>

        {isAnalyzing && renderAnalyzing()}
        {!isAnalyzing && underwritingDetails.status === 'approved' && renderApproved()}
        {!isAnalyzing && underwritingDetails.status === 'rejected' && renderRejected()}
      </motion.div>
    </div>
  );
}
