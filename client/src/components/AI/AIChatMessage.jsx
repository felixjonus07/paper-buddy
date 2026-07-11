import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Copy, Check, RotateCcw } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';
import TypingIndicator from './TypingIndicator';
import { useState } from 'react';

export default function AIChatMessage({ message, isStreaming, onRetry }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`ai-message-row ${isUser ? 'user' : 'assistant'}`}
    >
      <div className="ai-message-avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      
      <div className="ai-message-content-wrapper">
        <div className={`ai-message-bubble ${message.isError ? 'error' : ''}`}>
          {isStreaming && !message.content ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="ai-message-text">{message.content}</p>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>

        {!isUser && !isStreaming && !message.isError && (
          <div className="ai-message-actions">
            <button onClick={handleCopy} title="Copy response">
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
            {onRetry && (
              <button onClick={onRetry} title="Regenerate response">
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
