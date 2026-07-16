import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles } from 'lucide-react';
import AIChatWindow from './AIChatWindow';

export default function AIChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="ai-floating-button"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              className="ai-sparkles-icon"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles size={16} />
            </motion.div>
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AIChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
