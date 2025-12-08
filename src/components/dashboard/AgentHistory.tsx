import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useLoanStore, AgentType } from '@/store/loanStore';
import { AgentBadge } from './AgentBadge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AgentHistory() {
  const { agentHistory, currentAgent, isHistoryOpen, toggleHistory, goBackToAgent } = useLoanStore();

  const canGoBack = (agent: AgentType) => {
    const agentOrder: AgentType[] = ['sales', 'verification', 'underwriting', 'sanction'];
    const currentIndex = agentOrder.indexOf(currentAgent);
    const targetIndex = agentOrder.indexOf(agent);
    return targetIndex < currentIndex;
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={toggleHistory}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isHistoryOpen ? 320 : 0,
          opacity: isHistoryOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed lg:relative h-[calc(100vh-64px)] bg-card border-r border-border z-50 overflow-hidden',
          'left-0 top-16 lg:top-0'
        )}
      >
        <div className="w-80 h-full flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-foreground">Loan Progress</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleHistory}
              className="lg:hidden"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto p-4 scrollbar-thin">
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-border" />

              {/* Steps */}
              <div className="space-y-6">
                {agentHistory.map((item, index) => (
                  <motion.div
                    key={item.agent}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative flex gap-4"
                  >
                    {/* Status indicator */}
                    <div
                      className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300',
                        item.status === 'completed' && 'bg-success text-success-foreground',
                        item.status === 'current' && 'bg-primary text-primary-foreground shadow-primary animate-pulse',
                        item.status === 'pending' && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {item.status === 'completed' ? (
                        <Check className="h-5 w-5" />
                      ) : item.status === 'current' ? (
                        <Clock className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-6">
                      <AgentBadge
                        agent={item.agent}
                        isActive={item.status === 'current'}
                        size="sm"
                      />
                      <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                      {item.decision && (
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {item.decision}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.timestamp.toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>

                      {/* Go back button for completed steps */}
                      {item.status === 'completed' && canGoBack(item.agent) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs"
                          onClick={() => goBackToAgent(item.agent)}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Edit this step
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Toggle button when collapsed */}
      <AnimatePresence>
        {!isHistoryOpen && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={toggleHistory}
            className="fixed left-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-r-lg shadow-lg z-40 hidden lg:flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="text-xs font-medium pr-1">Progress</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
