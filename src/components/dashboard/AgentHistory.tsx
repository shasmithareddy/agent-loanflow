import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useLoanStore, PROCESS_STEPS, ProcessStep } from '@/store/loanStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AgentHistory() {
  const { processHistory, currentProcess, isHistoryOpen, toggleHistory, goBackToAgent } = useLoanStore();

  const getStepConfig = (stepId: ProcessStep) => {
    return PROCESS_STEPS.find(s => s.id === stepId);
  };

  const canGoBack = (stepId: ProcessStep) => {
    const currentIndex = PROCESS_STEPS.findIndex(s => s.id === currentProcess);
    const targetIndex = PROCESS_STEPS.findIndex(s => s.id === stepId);
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
          width: isHistoryOpen ? 300 : 0,
          opacity: isHistoryOpen ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={cn(
          'fixed lg:relative h-[calc(100vh-64px)] bg-card border-r border-border z-50 overflow-hidden',
          'left-0 top-16 lg:top-0'
        )}
      >
        <div className="w-[300px] h-full flex flex-col">
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
              <div className="space-y-3">
                {processHistory.map((item, index) => {
                  const stepConfig = getStepConfig(item.step);
                  if (!stepConfig) return null;

                  return (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'relative flex gap-3 p-2 rounded-lg transition-all',
                        item.status === 'current' && 'bg-primary/5 border border-primary/20',
                        item.status === 'completed' && 'bg-success/5',
                      )}
                    >
                      {/* Status indicator */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 text-lg flex-shrink-0',
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
                          <span>{stepConfig.icon}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'font-semibold text-sm truncate',
                          item.status === 'current' && 'text-primary',
                          item.status === 'completed' && 'text-success',
                          item.status === 'pending' && 'text-muted-foreground'
                        )}>
                          {stepConfig.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {item.summary}
                        </p>
                        {item.decision && (
                          <p className="text-xs font-medium text-foreground mt-1">
                            {item.decision}
                          </p>
                        )}

                        {/* Go back button for completed steps */}
                        {item.status === 'completed' && canGoBack(item.step) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-6 text-xs px-2"
                            onClick={() => {
                              const agent = stepConfig.agent;
                              goBackToAgent(agent);
                            }}
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
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
