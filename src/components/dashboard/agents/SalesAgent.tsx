import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, IndianRupee, Calendar, Wallet, Percent, Building2, Car, GraduationCap, Briefcase, Home } from 'lucide-react';
import { useLoanStore, LOAN_TYPES, LoanType } from '@/store/loanStore';
import { calculateEMI, formatCurrency, formatNumber } from '@/lib/emiCalculator';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChatPanel } from '../ChatPanel';

const loanTypeIcons: Record<LoanType, React.ElementType> = {
  personal: Wallet,
  home: Home,
  car: Car,
  education: GraduationCap,
  business: Briefcase,
};

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

  const selectedLoanType = LOAN_TYPES.find((lt) => lt.id === loanDetails.loanType) || LOAN_TYPES[0];

  // Update loan details when loan type changes
  const handleLoanTypeChange = (type: LoanType) => {
    const config = LOAN_TYPES.find((lt) => lt.id === type)!;
    updateLoanDetails({
      loanType: type,
      interestRate: config.interestRate,
      processingFee: config.processingFee,
      maxEmiToIncomeRatio: config.maxEmiToIncomeRatio,
      amount: Math.max(config.minAmount, Math.min(loanDetails.amount, config.maxAmount)),
      tenure: Math.min(loanDetails.tenure, config.maxTenure),
    });

    addChatMessage({
      agent: 'sales',
      role: 'agent',
      content: `Great choice! You've selected **${config.name}**.

📊 **Loan Details:**
• Interest Rate: **${config.interestRate}% p.a.**
• Processing Fee: **${config.processingFee}%**
• Max EMI/Income Ratio: **${config.maxEmiToIncomeRatio}%**
• Loan Range: ${formatCurrency(config.minAmount)} - ${formatCurrency(config.maxAmount)}
• Max Tenure: ${config.maxTenure} months
• Min. Monthly Income: ${formatCurrency(config.minIncome)}

Please adjust the loan amount and tenure as per your needs.`,
    });
  };

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
          content: `Hello! 👋 Welcome to Tata Capital.

I'm your Sales Agent, and I'm here to help you find the perfect loan for your needs.

**Step 1:** Select your loan type from the options below:
• Personal Loan (12% p.a.)
• Home Loan (8.5% p.a.)
• Car Loan (9.5% p.a.)
• Education Loan (10% p.a.)
• Business Loan (14% p.a.)

Each loan type has different interest rates, eligibility criteria, and limits. Choose the one that best fits your requirement! 💰`,
        });
      }, 500);
    }
  }, [hasGreeted, chatMessages]);

  const emiResult = calculateEMI(
    loanDetails.amount,
    loanDetails.interestRate,
    loanDetails.tenure
  );

  const processingFeeAmount = (loanDetails.amount * selectedLoanType.processingFee) / 100;
  const affordabilityRatio = (emiResult.emi / loanDetails.monthlyIncome) * 100;
  const isAffordable = affordabilityRatio <= selectedLoanType.maxEmiToIncomeRatio;
  const meetsMinIncome = loanDetails.monthlyIncome >= selectedLoanType.minIncome;

  const handleProceed = () => {
    addChatMessage({
      agent: 'sales',
      role: 'user',
      content: `I want a ${selectedLoanType.name} of ${formatCurrency(loanDetails.amount)} for ${loanDetails.tenure} months. My monthly income is ${formatCurrency(loanDetails.monthlyIncome)}.`,
    });

    setTimeout(() => {
      addChatMessage({
        agent: 'sales',
        role: 'agent',
        content: `Excellent choice! Here's your loan summary:

📋 **Loan Type:** ${selectedLoanType.name}
💰 **Loan Amount:** ${formatCurrency(loanDetails.amount)}
📅 **Tenure:** ${loanDetails.tenure} months
💵 **Monthly EMI:** ${formatCurrency(emiResult.emi)}
📈 **Interest Rate:** ${loanDetails.interestRate}% p.a.
🧾 **Processing Fee:** ${formatCurrency(processingFeeAmount)} (${selectedLoanType.processingFee}%)
💰 **Total Amount Payable:** ${formatCurrency(emiResult.totalAmount)}
📊 **EMI/Income Ratio:** ${affordabilityRatio.toFixed(1)}% (Max: ${selectedLoanType.maxEmiToIncomeRatio}%)

Now, let's proceed to verify your identity and documents. Our Verification Agent will guide you through the KYC process.`,
      });

      updateAgentHistory('sales', {
        status: 'completed',
        summary: 'Loan requirements collected',
        decision: `${selectedLoanType.name}: ${formatCurrency(loanDetails.amount)} @ ${loanDetails.interestRate}% for ${loanDetails.tenure} months`,
      });

      updateAgentHistory('verification', { status: 'current' });

      setTimeout(() => {
        setCurrentAgent('verification');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6 h-full">
      {/* Chat Panel */}
      <ChatPanel className="min-h-[400px] lg:min-h-0" />

      {/* Form Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="form-section space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]"
      >
        <h3 className="text-lg font-bold text-foreground">Loan Calculator</h3>

        {/* Loan Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Loan Type</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LOAN_TYPES.map((type) => {
              const Icon = loanTypeIcons[type.id];
              const isSelected = loanDetails.loanType === type.id;
              return (
                <motion.button
                  key={type.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLoanTypeChange(type.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? 'border-primary bg-primary/10 shadow-md'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-semibold ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                      {type.name.replace(' Loan', '')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-accent font-bold text-sm">
                    <Percent className="h-3 w-3" />
                    {type.interestRate}% p.a.
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Loan Type Info Card */}
        <motion.div
          key={selectedLoanType.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-accent/10 border border-accent/30 rounded-xl p-4"
        >
          <h4 className="font-semibold text-accent-foreground mb-2 flex items-center gap-2">
            {(() => { const Icon = loanTypeIcons[selectedLoanType.id]; return <Icon className="h-4 w-4" />; })()}
            {selectedLoanType.name} Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Interest:</span>
              <span className="font-semibold">{selectedLoanType.interestRate}% p.a.</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Processing:</span>
              <span className="font-semibold">{selectedLoanType.processingFee}%</span>
            </div>
            <div className="flex items-center gap-2">
              <IndianRupee className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Min Income:</span>
              <span className="font-semibold">{formatCurrency(selectedLoanType.minIncome)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="h-3 w-3 text-accent" />
              <span className="text-muted-foreground">Max EMI/Income:</span>
              <span className="font-semibold">{selectedLoanType.maxEmiToIncomeRatio}%</span>
            </div>
          </div>
        </motion.div>

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
            min={selectedLoanType.minAmount}
            max={selectedLoanType.maxAmount}
            step={10000}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatCurrency(selectedLoanType.minAmount)}</span>
            <span>{formatCurrency(selectedLoanType.maxAmount)}</span>
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
            max={selectedLoanType.maxTenure}
            step={6}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>12 months</span>
            <span>{selectedLoanType.maxTenure} months</span>
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
          {!meetsMinIncome && (
            <p className="text-xs text-destructive">
              ⚠ Minimum income required: {formatCurrency(selectedLoanType.minIncome)}
            </p>
          )}
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

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Interest</span>
              <p className="font-semibold">{formatCurrency(emiResult.totalInterest)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Processing Fee</span>
              <p className="font-semibold">{formatCurrency(processingFeeAmount)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Amount</span>
              <p className="font-semibold">{formatCurrency(emiResult.totalAmount + processingFeeAmount)}</p>
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
                {affordabilityRatio.toFixed(1)}% / {selectedLoanType.maxEmiToIncomeRatio}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              {/* Max threshold marker */}
              <div 
                className="absolute h-full w-0.5 bg-destructive/70 z-10"
                style={{ left: `${selectedLoanType.maxEmiToIncomeRatio}%` }}
              />
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
                ? `✓ EMI is within affordable range (≤${selectedLoanType.maxEmiToIncomeRatio}% of income)`
                : `⚠ EMI exceeds ${selectedLoanType.maxEmiToIncomeRatio}% of income - consider adjusting`}
            </p>
          </div>
        </motion.div>

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          className="w-full"
          size="lg"
          disabled={!isAffordable || !meetsMinIncome}
        >
          Proceed to Verification
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}