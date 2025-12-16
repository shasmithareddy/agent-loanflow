import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Loader2 } from 'lucide-react';
import { useLoanStore } from '@/store/loanStore';

const Index = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { customerProfile } = useLoanStore();

  useEffect(() => {
    // Check if user has completed registration
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!customerProfile.mobileNumber) {
        navigate('/auth');
      } else if (!customerProfile.isRegistered) {
        navigate('/register');
      }
    }
  }, [loading, navigate, customerProfile.mobileNumber, customerProfile.isRegistered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!customerProfile.mobileNumber || !customerProfile.isRegistered) {
    return null;
  }

  return <Dashboard userPhone={customerProfile.mobileNumber} />;
};

export default Index;
