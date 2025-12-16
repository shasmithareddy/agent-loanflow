import { motion } from 'framer-motion';
import { Bot, ShieldCheck, FileCheck, FileText } from 'lucide-react';
import { useLoanStore, AgentType } from '@/store/loanStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const agentConfig = {
  sales: { icon: Bot, label: 'Sales Agent', color: 'bg-agent-sales' },
  verification: { icon: ShieldCheck, label: 'Verification Agent', color: 'bg-agent-verification' },
  underwriting: { icon: FileCheck, label: 'Underwriting Agent', color: 'bg-agent-underwriting' },
  sanction: { icon: FileText, label: 'Sanction Agent', color: 'bg-agent-sanction' },
};

export function AgentSwitcher() {
  const { currentAgent, switchToAgent, agentHistory } = useLoanStore();

  const agents: AgentType[] = ['sales', 'verification', 'underwriting', 'sanction'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Bot className="h-4 w-4" />
          Switch Agent
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {agents.map((agent) => {
          const config = agentConfig[agent];
          const Icon = config.icon;
          const isActive = currentAgent === agent;
          const historyItem = agentHistory.find((h) => h.agent === agent);
          const isCompleted = historyItem?.status === 'completed';

          return (
            <DropdownMenuItem
              key={agent}
              onClick={() => switchToAgent(agent)}
              className={`gap-3 cursor-pointer ${isActive ? 'bg-accent' : ''}`}
            >
              <motion.div
                className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className="h-4 w-4 text-white" />
              </motion.div>
              <div className="flex-1">
                <p className="text-sm font-medium">{config.label}</p>
                <p className="text-xs text-muted-foreground">
                  {isActive ? 'Current' : isCompleted ? 'Completed' : 'Available'}
                </p>
              </div>
              {isActive && (
                <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
