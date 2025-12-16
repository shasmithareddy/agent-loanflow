import { LogOut, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useLoanStore } from '@/store/loanStore';

interface HeaderProps {
  userPhone: string;
}

export function Header({ userPhone }: HeaderProps) {
  const navigate = useNavigate();
  const { toggleHistory, customerProfile } = useLoanStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
    navigate('/auth');
  };

  return (
    <header className="h-16 bg-card border-b border-border px-4 lg:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleHistory}
          className="lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">TC</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-foreground text-lg">Tata Capital</h1>
            <p className="text-xs text-muted-foreground">AI Loan Dashboard</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
          {customerProfile.livePhoto ? (
            <img src={customerProfile.livePhoto} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm text-foreground">
            {customerProfile.fullName || `+91 ${userPhone}`}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
