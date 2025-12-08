import { motion } from 'framer-motion';
import { Bot, Shield, FileCheck, FileText } from 'lucide-react';
import { AgentType } from '@/store/loanStore';
import { cn } from '@/lib/utils';

interface AgentBadgeProps {
  agent: AgentType;
  isActive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const agentConfig = {
  sales: {
    label: 'Sales Agent',
    icon: Bot,
    bgClass: 'bg-agent-sales',
    textClass: 'text-primary-foreground',
    glowClass: 'shadow-[0_0_20px_hsl(203_100%_30%/0.4)]',
  },
  verification: {
    label: 'Verification Agent',
    icon: Shield,
    bgClass: 'bg-agent-verification',
    textClass: 'text-primary-foreground',
    glowClass: 'shadow-[0_0_20px_hsl(195_65%_44%/0.4)]',
  },
  underwriting: {
    label: 'Underwriting Agent',
    icon: FileCheck,
    bgClass: 'bg-agent-underwriting',
    textClass: 'text-primary-foreground',
    glowClass: 'shadow-[0_0_20px_hsl(213_50%_50%/0.4)]',
  },
  sanction: {
    label: 'Sanction Agent',
    icon: FileText,
    bgClass: 'bg-agent-sanction',
    textClass: 'text-accent-foreground',
    glowClass: 'shadow-glow',
  },
};

export function AgentBadge({ agent, isActive = false, size = 'md' }: AgentBadgeProps) {
  const config = agentConfig[agent];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-3',
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={cn(
        'inline-flex items-center rounded-full font-semibold transition-all duration-300',
        config.bgClass,
        config.textClass,
        sizeClasses[size],
        isActive && config.glowClass
      )}
    >
      <Icon className={cn(iconSizes[size])} />
      <span>{config.label}</span>
      {isActive && (
        <motion.span
          className="w-2 h-2 rounded-full bg-current animate-pulse"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}
    </motion.div>
  );
}
