import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useLoanStore } from '@/store/loanStore';

// Mock mode - set to true for testing without real OTP
const MOCK_MODE = true;

export default function AuthPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { updateCustomerProfile } = useLoanStore();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, '');
    return digits.slice(0, 10);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);

    // Mock mode - skip actual OTP send
    if (MOCK_MODE) {
      setTimeout(() => {
        setIsOtpSent(true);
        setCountdown(30);
        toast.success('Demo mode: Enter any 6-digit OTP');
        setIsLoading(false);
      }, 500);
      return;
    }

    // Real OTP logic would go here
    setIsLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    // Mock mode - accept any 6-digit OTP
    if (MOCK_MODE) {
      setTimeout(() => {
        updateCustomerProfile({ mobileNumber: phoneNumber });
        toast.success('Login successful!');
        navigate('/register');
        setIsLoading(false);
      }, 500);
      return;
    }

    // Real verification logic would go here
    setIsLoading(false);
  };

  const handleResendOtp = () => {
    if (countdown === 0) {
      handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center p-12 text-primary-foreground">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center">
                <span className="font-bold text-2xl">TC</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Tata Capital</h1>
                <p className="text-primary-foreground/80 text-sm">Financial Services</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              AI-Powered
              <br />
              Personal Loans
            </h2>

            <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
              Experience the future of lending with our intelligent multi-agent loan processing system. Get instant approvals and personalized loan offers.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg">🤖</span>
                </div>
                <span>4 AI agents working for you</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg">⚡</span>
                </div>
                <span>Instant loan decisions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg">📄</span>
                </div>
                <span>Digital sanction letter</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <span className="font-bold text-xl text-primary-foreground">TC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Tata Capital</h1>
              <p className="text-muted-foreground text-xs">Personal Loans</p>
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-foreground">
              {isOtpSent ? 'Enter OTP' : 'Login with Mobile'}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isOtpSent
                ? `We've sent a 6-digit code to +91 ${phoneNumber}`
                : 'Enter your mobile number to continue'}
            </p>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative flex">
                  <div className="flex items-center px-3 bg-muted border border-r-0 border-input rounded-l-md text-muted-foreground">
                    +91
                  </div>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                      placeholder="9876543210"
                      className="pl-10 rounded-l-none"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || phoneNumber.length !== 10}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Send OTP
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-4">
                <Label className="text-center block">Enter 6-digit OTP</Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={setOtp}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Verify OTP
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Didn't receive OTP?{' '}
                  {countdown > 0 ? (
                    <span className="text-primary">Resend in {countdown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-primary font-medium hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp('');
                }}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
}
