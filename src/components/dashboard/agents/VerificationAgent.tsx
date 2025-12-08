import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { useLoanStore } from '@/store/loanStore';
import { formatCurrency } from '@/lib/emiCalculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatPanel } from '../ChatPanel';
import { toast } from 'sonner';

export function VerificationAgent() {
  const {
    verificationDetails,
    updateVerificationDetails,
    loanDetails,
    addChatMessage,
    setCurrentAgent,
    updateAgentHistory,
    chatMessages,
    goBackToAgent,
  } = useLoanStore();

  const [hasGreeted, setHasGreeted] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Initial greeting
  useEffect(() => {
    const verificationMessages = chatMessages.filter((m) => m.agent === 'verification');
    if (verificationMessages.length === 0 && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        addChatMessage({
          agent: 'verification',
          role: 'agent',
          content: `Hello! 🔐 I'm your Verification Agent.

To proceed with your loan application of ${formatCurrency(loanDetails.amount)}, I'll need to verify your identity and employment.

Please provide:
• Your full name and date of birth
• PAN and Aadhaar number
• Employer details
• Upload your latest salary slip

This helps us ensure a smooth loan disbursement process.`,
        });
      }, 500);
    }
  }, [hasGreeted, chatMessages, loanDetails.amount]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      updateVerificationDetails({ salarySlipFile: file });
      setIsParsing(true);

      // Simulate document parsing
      setTimeout(() => {
        const mockParsedIncome = Math.round(loanDetails.monthlyIncome * (0.9 + Math.random() * 0.2));
        const mockEmployers = ['Tata Consultancy Services', 'Infosys Ltd', 'Wipro Technologies', 'Tech Mahindra'];
        const mockEmployer = mockEmployers[Math.floor(Math.random() * mockEmployers.length)];

        updateVerificationDetails({
          parsedIncome: mockParsedIncome,
          parsedEmployer: mockEmployer,
        });

        setIsParsing(false);

        addChatMessage({
          agent: 'verification',
          role: 'agent',
          content: `📄 Document parsed successfully!

I've extracted the following information:
• **Monthly Salary:** ${formatCurrency(mockParsedIncome)}
• **Employer:** ${mockEmployer}

Please verify if this information is correct and fill in any remaining details.`,
        });

        toast.success('Salary slip parsed successfully!');
      }, 2000);
    }
  };

  const validatePAN = (pan: string) => {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan.toUpperCase());
  };

  const validateAadhaar = (aadhaar: string) => {
    const aadhaarRegex = /^\d{12}$/;
    return aadhaarRegex.test(aadhaar.replace(/\s/g, ''));
  };

  const isFormValid = () => {
    return (
      verificationDetails.fullName.trim().length >= 3 &&
      verificationDetails.dob &&
      validatePAN(verificationDetails.pan) &&
      validateAadhaar(verificationDetails.aadhaar) &&
      verificationDetails.salarySlipFile
    );
  };

  const handleProceed = () => {
    if (!isFormValid()) {
      toast.error('Please fill all required fields correctly');
      return;
    }

    addChatMessage({
      agent: 'verification',
      role: 'user',
      content: `Here are my details:
Name: ${verificationDetails.fullName}
DOB: ${verificationDetails.dob}
PAN: ${verificationDetails.pan.toUpperCase()}
Aadhaar: ${verificationDetails.aadhaar.slice(0, 4)}****${verificationDetails.aadhaar.slice(-4)}`,
    });

    setTimeout(() => {
      addChatMessage({
        agent: 'verification',
        role: 'agent',
        content: `✅ Verification Complete!

All your documents have been verified successfully:
• Identity: Verified via PAN & Aadhaar
• Employment: Confirmed at ${verificationDetails.parsedEmployer || verificationDetails.employerName}
• Income: ${formatCurrency(verificationDetails.parsedIncome || loanDetails.monthlyIncome)} per month

Your application will now be reviewed by our Underwriting team for credit assessment.`,
      });

      updateAgentHistory('verification', {
        status: 'completed',
        summary: 'KYC verification completed',
        decision: `Verified: ${verificationDetails.fullName}`,
      });

      updateAgentHistory('underwriting', { status: 'current' });

      setTimeout(() => {
        setCurrentAgent('underwriting');
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
        className="form-section space-y-5"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">KYC Verification</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => goBackToAgent('sales')}
          >
            ← Edit Loan Details
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-2">
            <Label>Full Name *</Label>
            <Input
              value={verificationDetails.fullName}
              onChange={(e) =>
                updateVerificationDetails({ fullName: e.target.value })
              }
              placeholder="As per PAN card"
            />
          </div>

          {/* DOB */}
          <div className="space-y-2">
            <Label>Date of Birth *</Label>
            <Input
              type="date"
              value={verificationDetails.dob}
              onChange={(e) =>
                updateVerificationDetails({ dob: e.target.value })
              }
            />
          </div>
        </div>

        {/* Employer Name */}
        <div className="space-y-2">
          <Label>Employer Name</Label>
          <Input
            value={verificationDetails.employerName}
            onChange={(e) =>
              updateVerificationDetails({ employerName: e.target.value })
            }
            placeholder="Current employer"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* PAN */}
          <div className="space-y-2">
            <Label>PAN Number *</Label>
            <Input
              value={verificationDetails.pan}
              onChange={(e) =>
                updateVerificationDetails({ pan: e.target.value.toUpperCase() })
              }
              placeholder="ABCDE1234F"
              maxLength={10}
              className={
                verificationDetails.pan && !validatePAN(verificationDetails.pan)
                  ? 'border-destructive'
                  : ''
              }
            />
            {verificationDetails.pan && !validatePAN(verificationDetails.pan) && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Invalid PAN format
              </p>
            )}
          </div>

          {/* Aadhaar */}
          <div className="space-y-2">
            <Label>Aadhaar Number *</Label>
            <Input
              value={verificationDetails.aadhaar}
              onChange={(e) =>
                updateVerificationDetails({
                  aadhaar: e.target.value.replace(/\D/g, ''),
                })
              }
              placeholder="1234 5678 9012"
              maxLength={12}
              className={
                verificationDetails.aadhaar &&
                !validateAadhaar(verificationDetails.aadhaar)
                  ? 'border-destructive'
                  : ''
              }
            />
            {verificationDetails.aadhaar &&
              !validateAadhaar(verificationDetails.aadhaar) && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Must be 12 digits
                </p>
              )}
          </div>
        </div>

        {/* Salary Slip Upload */}
        <div className="space-y-2">
          <Label>Salary Slip *</Label>
          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="salary-slip"
            />
            <label htmlFor="salary-slip" className="cursor-pointer">
              {verificationDetails.salarySlipFile ? (
                <div className="flex items-center justify-center gap-3 text-success">
                  <FileText className="h-8 w-8" />
                  <div className="text-left">
                    <p className="font-medium">
                      {verificationDetails.salarySlipFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Click to replace
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground">
                  <Upload className="h-10 w-10 mx-auto mb-2" />
                  <p className="font-medium">Upload your latest salary slip</p>
                  <p className="text-sm">PDF, JPG or PNG (max 5MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Parsed Data Display */}
        {(verificationDetails.parsedIncome || isParsing) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-success/10 border border-success/20 rounded-xl p-4"
          >
            {isParsing ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-success border-t-transparent rounded-full animate-spin" />
                <span className="text-sm">Parsing document...</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-success font-medium">
                  <Check className="h-4 w-4" />
                  Document Verified
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Extracted Salary:</span>
                    <p className="font-semibold">
                      {formatCurrency(verificationDetails.parsedIncome!)}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Employer:</span>
                    <p className="font-semibold">{verificationDetails.parsedEmployer}</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Proceed Button */}
        <Button
          onClick={handleProceed}
          className="w-full"
          size="lg"
          disabled={!isFormValid() || isParsing}
        >
          Proceed to Underwriting
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}
