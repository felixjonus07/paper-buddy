import { useState, useCallback, useEffect } from 'react';

export function useAIChat(conversationId = 'default') {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  
  // Debug State
  const [agentState, setAgentState] = useState('Idle');
  const [executionTrace, setExecutionTrace] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(`ai_chat_${conversationId}`);
    if (saved) {
      try { setMessages(JSON.parse(saved)); } catch (e) {}
    }
  }, [conversationId]);

  useEffect(() => {
    localStorage.setItem(`ai_chat_${conversationId}`, JSON.stringify(messages));
  }, [messages, conversationId]);

  const clearHistory = () => {
    setMessages([]);
    setExecutionTrace([]);
    localStorage.removeItem(`ai_chat_${conversationId}`);
  };

  const confirmAction = async (action, data) => {
    setPendingConfirmation(null);
    if (action === 'cancel') {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Operation cancelled by user.' }]);
      return;
    }
    // In a real flow, this would call /chat/confirm, then re-trigger the chat stream 
    // with a hidden internal message to resume.
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: 'Proceed with the operation.' }]);
    await sendMessage('Proceed with the operation.');
  };

  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || isStreaming) return;

    setError(null);
    setAgentState('Initializing');
    const userMessage = { id: Date.now().toString(), role: 'user', content: text };
    const assistantMessageId = (Date.now() + 1).toString();
    
    setMessages((prev) => [...prev, userMessage, { id: assistantMessageId, role: 'assistant', content: '', isStreaming: true, progress: [] }]);
    setIsStreaming(true);

    try {
      const response = await fetch('http://localhost:5050/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, conversationId })
      });

      if (!response.ok) throw new Error(`Server returned ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(dataStr);
              
              if (parsed.type === 'message' && parsed.text) {
                fullContent += parsed.text;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, content: fullContent } : msg
                ));
              } else if (parsed.type === 'progress') {
                setAgentState(parsed.state);
                setExecutionTrace(prev => [...prev, parsed]);
                
                // Add progress event to the current message
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId 
                    ? { ...msg, progress: [...(msg.progress || []), { state: parsed.state, message: parsed.message }] } 
                    : msg
                ));
              } else if (parsed.type === 'confirmation') {
                setPendingConfirmation(parsed);
              } else if (parsed.type === 'error' || parsed.error) {
                throw new Error(parsed.message || parsed.error);
              }
            } catch (e) {
              // Ignore partial JSON chunks
            }
          }
        }
      }

      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
      ));
      setAgentState('Idle');

    } catch (err) {
      console.error('Chat stream error:', err);
      setError(err.message);
      setAgentState('Failed');
      setMessages(prev => {
        const newMsgs = [...prev];
        if (newMsgs[newMsgs.length - 1].id === assistantMessageId) {
          newMsgs[newMsgs.length - 1] = { 
            ...newMsgs[newMsgs.length - 1], 
            content: 'Sorry, I encountered an error during execution. ' + err.message, 
            isError: true,
            isStreaming: false 
          };
        }
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, conversationId]);

  return {
    messages,
    isStreaming,
    error,
    agentState,
    executionTrace,
    pendingConfirmation,
    confirmAction,
    sendMessage,
    clearHistory
  };
}
