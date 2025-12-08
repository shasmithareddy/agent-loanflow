import { useLoanStore } from '@/store/loanStore';
import { Header } from './Header';
import { AgentHistory } from './AgentHistory';
import { AgentBadge } from './AgentBadge';
import { SalesAgent } from './agents/SalesAgent';
import { VerificationAgent } from './agents/VerificationAgent';
import { UnderwritingAgent } from './agents/UnderwritingAgent';
import { SanctionAgent } from './agents/SanctionAgent';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  userEmail: string;
}

const agentComponents = {
  sales: SalesAgent,
  verification: VerificationAgent,
  underwriting: UnderwritingAgent,
  sanction: SanctionAgent,
};

export function Dashboard({ userEmail }: DashboardProps) {
  const { currentAgent, isHistoryOpen } = useLoanStore();
  const AgentComponent = agentComponents[currentAgent];

  return (
    <div className="min-h-screen bg-background">
      <Header userEmail={userEmail} />

      <div className="flex">
        <AgentHistory />

        <main
          className={`flex-1 transition-all duration-300 ${
            isHistoryOpen ? 'lg:ml-0' : ''
          }`}
        >
          <div className="p-4 lg:p-6 max-w-6xl mx-auto">
            {/* Active Agent Badge */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Current Step:</span>
              <AgentBadge agent={currentAgent} isActive size="md" />
            </div>

            {/* Agent Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentAgent}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AgentComponent />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
