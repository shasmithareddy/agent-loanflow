import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot } from 'lucide-react';
import { useLoanStore, AgentType } from '@/store/loanStore';
import { AgentBadge } from './AgentBadge';
import { cn } from '@/lib/utils';

interface ChatPanelProps {
  className?: string;
}

const agentAvatars: Record<AgentType, string> = {
  sales: '🤝',
  verification: '🔐',
  underwriting: '📊',
  sanction: '📄',
};

export function ChatPanel({ className }: ChatPanelProps) {
  const { chatMessages, currentAgent } = useLoanStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const filteredMessages = chatMessages.filter((msg) => msg.agent === currentAgent);

  return (
    <div className={cn('flex flex-col h-full bg-card rounded-xl border border-border', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
          {agentAvatars[currentAgent]}
        </div>
        <div>
          <AgentBadge agent={currentAgent} isActive size="sm" />
          <p className="text-xs text-muted-foreground mt-1">AI Assistant</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-auto p-4 space-y-4 scrollbar-thin"
      >
        <AnimatePresence mode="popLayout">
          {filteredMessages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' && 'flex-row-reverse'
              )}
            >
              {message.role === 'agent' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm flex-shrink-0">
                  {agentAvatars[message.agent]}
                </div>
              )}
              <div
                className={cn(
                  'chat-bubble',
                  message.role === 'agent' && 'chat-bubble-agent',
                  message.role === 'user' && 'chat-bubble-user'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-[10px] mt-2 opacity-60">
                  {message.timestamp.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bot className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">Start your loan journey...</p>
          </div>
        )}
      </div>
    </div>
  );
}
