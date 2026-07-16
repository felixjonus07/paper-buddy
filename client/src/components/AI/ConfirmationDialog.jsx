import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

export default function ConfirmationDialog({ data, onConfirm }) {
  if (!data) return null;

  return (
    <div className="my-4 border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10 rounded-xl overflow-hidden">
      <div className="bg-red-100 dark:bg-red-900/30 px-4 py-2 flex items-center gap-2 text-red-700 dark:text-red-400 font-bold text-sm">
        <AlertTriangle size={16} />
        Confirmation Required
      </div>
      <div className="p-4">
        <p className="text-sm text-text-color font-medium mb-3">
          {data.message || `The tool "${data.tool}" requires confirmation.`}
        </p>
        
        <div className="bg-black/5 dark:bg-white/5 p-2 rounded text-xs font-mono mb-4 text-text-light overflow-x-auto">
          {JSON.stringify(data.args, null, 2)}
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => onConfirm('proceed', data)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Check size={16} /> Proceed
          </button>
          <button 
            onClick={() => onConfirm('cancel', data)}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-text-color py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2"
          >
            <X size={16} /> Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
