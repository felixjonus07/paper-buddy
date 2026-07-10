import React, { useState } from 'react';
import { Terminal, Activity, Code, Clock, BarChart2, AlertCircle } from 'lucide-react';

export default function AIDebugDashboard({ agentState, executionTrace }) {
  const [activeTab, setActiveTab] = useState('trace');

  // Compute some quick metrics from the trace if available
  const toolExecutions = executionTrace.filter(t => t.type === 'tool_execution');
  const rollbacks = executionTrace.filter(t => t.type === 'tool_rollback');
  const errors = executionTrace.filter(t => t.type === 'tool_error' || t.type === 'workflow_error');
  
  const avgDuration = toolExecutions.length > 0 
    ? (toolExecutions.reduce((acc, t) => acc + (t.duration || 0), 0) / toolExecutions.length).toFixed(0) 
    : 0;

  return (
    <div className="absolute top-0 left-0 h-full w-full bg-clay-base shadow-clay-card z-50 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-black/10 dark:border-white/10 flex items-center justify-between font-bold font-mono text-sm bg-black/5 dark:bg-white/5">
        <div className="flex items-center gap-2">
          <Terminal size={16} />
          Enterprise Workflow Engine Monitor
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('trace')} className={`flex items-center gap-1 ${activeTab === 'trace' ? 'text-primary' : 'text-text-light'}`}><Code size={14}/> Trace</button>
          <button onClick={() => setActiveTab('metrics')} className={`flex items-center gap-1 ${activeTab === 'metrics' ? 'text-primary' : 'text-text-light'}`}><BarChart2 size={14}/> Metrics</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Agent State Header */}
        <section className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-black/5">
          <div className="flex items-center gap-2">
            <Activity size={14} className={agentState === 'FAILED' || agentState.includes('Rollback') ? 'text-red-500' : 'text-green-500'} />
            <span className="text-xs font-bold uppercase text-text-light">Engine State:</span>
            <span className="font-mono text-sm font-bold">{agentState}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-light font-mono">
            <Clock size={12} /> {toolExecutions.length} Steps Executed
          </div>
        </section>

        {activeTab === 'metrics' && (
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl">
              <div className="text-xs text-text-light uppercase font-bold mb-1">Avg Tool Latency</div>
              <div className="text-xl font-mono">{avgDuration} ms</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl">
              <div className="text-xs text-text-light uppercase font-bold mb-1">Success Rate</div>
              <div className="text-xl font-mono">
                {toolExecutions.length > 0 ? (((toolExecutions.length - errors.length) / toolExecutions.length) * 100).toFixed(1) : 100}%
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 p-4 rounded-xl border-red-500/20 border">
              <div className="text-xs text-red-500 uppercase font-bold mb-1">Rollbacks Triggered</div>
              <div className="text-xl font-mono text-red-500">{rollbacks.length}</div>
            </div>
          </section>
        )}

        {activeTab === 'trace' && (
          <section>
            <h4 className="text-xs font-bold uppercase text-text-light mb-2 flex items-center gap-1">
              <Code size={12} /> Execution DAG Timeline
            </h4>
            <div className="space-y-2">
              {executionTrace.length === 0 ? (
                <div className="text-xs text-text-light italic">No trace events yet.</div>
              ) : (
                executionTrace.map((trace, i) => (
                  <div key={i} className={`bg-black/5 dark:bg-white/5 p-2 rounded-lg border font-mono text-[11px] overflow-x-auto ${trace.type.includes('error') || trace.type.includes('rollback') ? 'border-red-500/50 bg-red-500/5' : 'border-black/5'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-bold ${trace.type.includes('error') ? 'text-red-500' : 'text-primary'}`}>
                        {trace.type === 'tool_execution' ? `⚙️ ${trace.tool}` : trace.type === 'tool_rollback' ? `↩️ ROLLBACK ${trace.tool}` : trace.state || trace.type}
                      </span>
                      {trace.duration && <span className="text-text-light">{trace.duration}ms</span>}
                      {trace.cached && <span className="text-green-500 font-bold bg-green-500/10 px-1 rounded">CACHE HIT</span>}
                    </div>
                    <span className="text-text-light whitespace-pre-wrap">
                      {JSON.stringify(trace.args || trace.result || trace.message || trace.error || trace, null, 2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
