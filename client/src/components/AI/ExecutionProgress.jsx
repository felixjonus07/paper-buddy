import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function ExecutionProgress({ progress = [] }) {
  if (!progress || progress.length === 0) return null;

  return (
    <div className="w-full my-3 p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
      <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-text-light">
        <Loader2 size={14} className="animate-spin text-primary" />
        Workflow Execution
      </div>
      
      <div className="space-y-3">
        <AnimatePresence>
          {progress.map((step, idx) => {
            const isLast = idx === progress.length - 1;
            const isCompleted = step.state === 'Completed' || (!isLast && !step.state.includes('RollingBack'));
            const isFailed = step.state === 'FAILED' || step.state.includes('error');
            const isRollback = step.state.includes('Rollback');
            
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-2 text-sm ${isLast ? 'text-text-color font-medium' : 'text-text-light'} ${isRollback || isFailed ? 'text-red-500' : ''}`}
              >
                <div className="mt-0.5 relative">
                  {isFailed ? (
                    <AlertTriangle size={14} className="text-red-500" />
                  ) : isRollback ? (
                    <RotateCcw size={14} className="text-red-500 animate-spin-slow" />
                  ) : isCompleted ? (
                    <CheckCircle2 size={14} className="text-green-500" />
                  ) : (
                    <Loader2 size={14} className="animate-spin text-primary" />
                  )}
                  {/* Visual connector line for DAG timeline */}
                  {!isLast && (
                    <div className={`absolute top-4 left-[6px] w-[2px] h-6 ${isRollback ? 'bg-red-500/30' : 'bg-black/10 dark:bg-white/10'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <span className="font-semibold">{step.state}: </span>
                  <span className="opacity-90">{step.message}</span>
                  {/* If this is executing multiple tools (parallel), we could show sub-bullets here if the backend passed them */}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
