import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Check, PartyPopper, Bot, Users } from 'lucide-react';
import { useLoanStore } from '@/store/loanStore';
import { formatCurrency } from '@/lib/emiCalculator';
import { generateSanctionLetter } from '@/lib/pdfGenerator';
import { Button } from '@/components/ui/button';
import { ChatPanel } from '../ChatPanel';
import { toast } from 'sonner';

export function SanctionAgent() {
  const {
    loanDetails,
    verificationDetails,
    underwritingDetails,
    addChatMessage,
    updateAgentHistory,
    chatMessages,
    resetLoan,
    advanceProcess,
    isApprovalPending,
    startApprovalProcess,
    loanDecision,
    setLoanDecision,
  } = useLoanStore();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [discussionStep, setDiscussionStep] = useState(0);

  const selectedPlan = underwritingDetails.selectedPlan;

  const discussionSteps = [
    { agent: 'Sales Agent', message: 'Customer requirements verified ✓', delay: 1500 },
    { agent: 'Verification Agent', message: 'KYC and documents verified ✓', delay: 2500 },
    { agent: 'Underwriting Agent', message: 'Credit assessment passed ✓', delay: 3500 },
    { agent: 'Master Agent', message: 'Consolidating all approvals...', delay: 4500 },
    { agent: 'System', message: 'Final decision: APPROVED', delay: 5500 },
  ];

  // Initial greeting - show "discussing with agents" first
  useEffect(() => {
    const sanctionMessages = chatMessages.filter((m) => m.agent === 'sanction');
    if (sanctionMessages.length === 0 && !hasGreeted && !isApprovalPending && loanDecision === 'pending') {
      setHasGreeted(true);
      startApprovalProcess();
      
      // Start the discussion animation
      discussionSteps.forEach((step, index) => {
        setTimeout(() => {
          setDiscussionStep(index + 1);
        }, step.delay);
      });

      // After discussion, show approval
      setTimeout(() => {
        const isApproved = underwritingDetails.status === 'approved';
        setLoanDecision(isApproved ? 'approved' : 'rejected', isApproved ? '' : 'Credit assessment failed');
        advanceProcess('sanction_letter');
        
        addChatMessage({
          agent: 'sanction',
          role: 'agent',
          content: isApproved ? `🎉 **Congratulations!** Your loan has been **APPROVED**!

All our agents have reviewed and approved your application:
• Sales Agent: Loan requirements ✓
• Verification Agent: KYC verified ✓  
• Underwriting Agent: Credit approved ✓

**Loan Details:**
• Customer: ${verificationDetails.fullName}
• Loan Amount: ${formatCurrency(loanDetails.amount)}
• Interest Rate: ${selectedPlan?.interestRate}% p.a.
• Tenure: ${selectedPlan?.tenure} months
• Monthly EMI: ${formatCurrency(selectedPlan?.emi || 0)}

Click below to generate your official Sanction Letter!` : `We're sorry, your loan application could not be approved at this time. Please contact our support team for more details.`,
        });
      }, 6500);
    }
  }, [hasGreeted, chatMessages]);

  const handleGenerateLetter = () => {
    setIsGenerating(true);

    addChatMessage({
      agent: 'sanction',
      role: 'user',
      content: 'Please generate my sanction letter.',
    });

    setTimeout(() => {
      try {
        generateSanctionLetter({
          customerName: verificationDetails.fullName,
          loanAmount: loanDetails.amount,
          interestRate: selectedPlan?.interestRate || loanDetails.interestRate,
          tenure: selectedPlan?.tenure || loanDetails.tenure,
          emi: selectedPlan?.emi || loanDetails.emi,
          approvalDate: new Date(),
        });

        setIsGenerating(false);
        setIsGenerated(true);

        addChatMessage({
          agent: 'sanction',
          role: 'agent',
          content: `✅ Your Sanction Letter has been generated and downloaded!

**What's Next?**
1. Review the sanction letter carefully
2. Sign the loan agreement (will be sent via email)
3. Complete e-signature verification
4. Loan will be disbursed within 24-48 hours

Thank you for choosing Tata Capital! 🙏

If you need any assistance, our customer support team is available 24/7 at 1800-xxx-xxxx.`,
        });

        updateAgentHistory('sanction', {
          status: 'completed',
          summary: 'Sanction letter generated',
          decision: 'Loan documentation complete',
        });

        toast.success('Sanction letter downloaded successfully!');
      } catch (error) {
        setIsGenerating(false);
        toast.error('Failed to generate sanction letter');
      }
    }, 2000);
  };

  const handleStartNew = () => {
    resetLoan();
    toast.success('Ready for a new loan application');
  };

  // Render the "discussing with agents" animation
  const renderDiscussing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12"
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Users className="h-12 w-12 text-primary animate-pulse" />
        </div>
        <motion.div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Bot className="h-4 w-4 text-accent-foreground" />
        </motion.div>
      </div>

      <h3 className="text-lg font-bold text-foreground mb-2">
        Master Agent Discussing with Team
      </h3>
      <p className="text-sm text-muted-foreground mb-8">
        Consolidating approvals from all agents...
      </p>

      <div className="w-full max-w-sm space-y-3">
        {discussionSteps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: discussionStep > index ? 1 : 0.3, 
              x: discussionStep > index ? 0 : -20 
            }}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              discussionStep > index ? 'bg-success/10 border border-success/20' : 'bg-muted/50'
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
              discussionStep > index ? 'bg-success text-success-foreground' : 'bg-muted'
            }`}>
              {discussionStep > index ? <Check className="h-4 w-4" /> : (index + 1)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{step.agent}</p>
              <p className="text-xs text-muted-foreground">{step.message}</p>
            </div>
          </motion.div>
        ))}
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
        className="form-section space-y-6"
      >
        <h3 className="text-lg font-bold text-foreground">Sanction Letter</h3>

        <AnimatePresence mode="wait">
          {isApprovalPending && loanDecision === 'pending' ? (
            renderDiscussing()
          ) : (
            <motion.div
              key="approved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Success Banner */}
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="bg-gradient-to-r from-success/10 to-accent/10 border border-success/30 rounded-xl p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="w-16 h-16 rounded-full bg-success mx-auto flex items-center justify-center mb-4"
                >
                  <PartyPopper className="h-8 w-8 text-success-foreground" />
                </motion.div>
                <h4 className="text-xl font-bold text-success mb-2">Loan Approved!</h4>
                <p className="text-muted-foreground">
                  Your personal loan of {formatCurrency(loanDetails.amount)} has been sanctioned
                </p>
              </motion.div>

              {/* Loan Summary Card */}
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="gradient-primary p-4">
                  <h4 className="font-semibold text-primary-foreground">Loan Summary</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Customer Name</span>
                    <span className="font-semibold">{verificationDetails.fullName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Loan Amount</span>
                    <span className="font-semibold">{formatCurrency(loanDetails.amount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-semibold">{selectedPlan?.interestRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Tenure</span>
                    <span className="font-semibold">{selectedPlan?.tenure} months</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Monthly EMI</span>
                    <span className="font-semibold text-primary">
                      {formatCurrency(selectedPlan?.emi || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Total Repayment</span>
                    <span className="font-semibold">
                      {formatCurrency(selectedPlan?.totalAmount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isGenerated ? (
                <Button
                  onClick={handleGenerateLetter}
                  className="w-full"
                  size="lg"
                  variant="accent"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Sanction Letter
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerateLetter}
                    className="w-full"
                    size="lg"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Again
                  </Button>
                  <Button
                    onClick={handleStartNew}
                    className="w-full"
                    size="lg"
                    variant="secondary"
                  >
                    Start New Application
                  </Button>
                </div>
              )}

              {/* Completion Status */}
              {isGenerated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 bg-muted rounded-xl"
                >
                  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
                    <Check className="h-4 w-4 text-success-foreground" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">Application Complete</p>
                    <p className="text-muted-foreground">
                      Your loan will be disbursed within 24-48 hours
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
