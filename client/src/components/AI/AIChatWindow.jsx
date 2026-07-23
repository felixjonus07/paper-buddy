import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2, Minimize2, Send, Trash2, Bug } from 'lucide-react';
import AIChatMessage from './AIChatMessage';
import ExecutionProgress from './ExecutionProgress';
import ConfirmationDialog from './ConfirmationDialog';
import AIDebugDashboard from './AIDebugDashboard';
import { useAIChat } from '../../hooks/useAIChat';

export default function AIChatWindow({ isOpen, onClose }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  
  const { 
    messages, isStreaming, error, agentState, 
    executionTrace, pendingConfirmation, confirmAction, 
    sendMessage, clearHistory 
  } = useAIChat('admin-session');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !showDebug) {
      scrollToBottom();
    }
  }, [messages, isOpen, isStreaming, pendingConfirmation, showDebug]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !isStreaming && !pendingConfirmation) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const windowVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, scale: 1, y: 0,
      transition: { type: 'spring', damping: 25, stiffness: 300 }
    },
    exit: { 
      opacity: 0, scale: 0.9, y: 20,
      transition: { duration: 0.2 }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={`ai-chat-window ${isFullscreen ? 'fullscreen' : ''}`}
        variants={windowVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="ai-chat-header relative z-[60]">
          <div className="ai-chat-title">
            <div className="ai-chat-indicator" />
            <h3>EduFin AI Assistant</h3>
          </div>
          <div className="ai-chat-controls">
            <button onClick={() => setShowDebug(!showDebug)} title="Developer Debug Mode" className={showDebug ? 'text-primary' : ''}>
              <Bug size={18} />
            </button>
            <button onClick={clearHistory} title="Clear Chat">
              <Trash2 size={18} />
            </button>
            <button onClick={() => setIsFullscreen(!isFullscreen)} title="Toggle Fullscreen">
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
            <button onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 flex flex-col overflow-hidden">
          {showDebug && (
            <AIDebugDashboard agentState={agentState} executionTrace={executionTrace} />
          )}

          <div className="ai-chat-messages pb-4">
            {messages.length === 0 ? (
              <div className="ai-chat-empty">
                <h4>How can I help you today?</h4>
                <p>I can execute multi-step workflows like managing users and fees.</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id}>
                  <AIChatMessage 
                    message={msg} 
                    isStreaming={msg.isStreaming}
                    onRetry={msg.isError ? () => sendMessage(messages[messages.length-2].content) : null}
                  />
                  {msg.progress && msg.progress.length > 0 && (
                    <ExecutionProgress progress={msg.progress} />
                  )}
                </div>
              ))
            )}
            
            {pendingConfirmation && (
              <ConfirmationDialog data={pendingConfirmation} onConfirm={confirmAction} />
            )}
            
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </div>

        <div className="ai-chat-input-area relative z-[60]">
          <form onSubmit={handleSubmit} className="ai-chat-form">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pendingConfirmation ? "Action requires confirmation..." : "Ask me to do something..."}
              rows={1}
              disabled={isStreaming || pendingConfirmation}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isStreaming || pendingConfirmation}
              className={`send-button ${input.trim() && !isStreaming && !pendingConfirmation ? 'active' : ''}`}
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
