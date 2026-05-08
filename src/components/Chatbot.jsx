import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Trash2, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-space-600/30 border border-space-500/30 flex items-center justify-center flex-shrink-0">
        <Bot size={13} className="text-space-400" />
      </div>
      <div className="chat-bubble-ai flex items-center gap-1 py-3 px-4">
        <span className="w-2 h-2 bg-space-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-space-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-space-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function ChatMessage({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser
          ? 'bg-space-600 border border-space-500/50'
          : 'bg-space-900/50 border border-space-500/30'
      }`}>
        {isUser ? <User size={13} className="text-white" /> : <Bot size={13} className="text-space-400" />}
      </div>
      <div className={isUser ? 'chat-bubble-user' : `chat-bubble-ai ${msg.isError ? 'border-red-500/30' : ''}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        <p className={`text-[10px] mt-1.5 ${isUser ? 'text-space-300/70' : 'text-[var(--text-secondary)]'}`}>
          {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

export default function Chatbot({ messages, loading, isOpen, setIsOpen, onSend, onClear }) {
  const [input, setInput] = useState('');
  const [minimized, setMinimized] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && !minimized) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, minimized, loading]);

  useEffect(() => {
    if (isOpen && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, minimized]);

  const handleSend = () => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUGGESTIONS = [
    'Where is the ISS right now?',
    'How fast is the ISS moving?',
    'Who is on the ISS?',
    'What are the latest space news?',
  ];

  return (
    <>
      {/* FAB Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-space-500 to-space-700 shadow-2xl shadow-space-500/40 hover:shadow-space-500/60 hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center border border-space-400/30 animate-glow"
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={22} className="text-white" />
          {messages.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">
              {messages.length > 9 ? '9+' : messages.length}
            </span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] glass-card flex flex-col shadow-2xl shadow-black/40 border-glow transition-all duration-300 ${
          minimized ? 'h-14' : 'h-[520px] max-h-[calc(100vh-100px)]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-space-500 to-space-700 flex items-center justify-center shadow-lg shadow-space-500/30">
                <Bot size={15} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--text-primary)]">Mission AI</div>
                <div className="flex items-center gap-1">
                  <div className="live-dot w-1.5 h-1.5" />
                  <span className="text-[10px] text-emerald-500 font-medium">Dashboard Context Only</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onClear()}
                className="btn-ghost p-1.5 rounded-lg"
                title="Clear chat"
              >
                <Trash2 size={13} />
              </button>
              <button
                onClick={() => setMinimized(m => !m)}
                className="btn-ghost p-1.5 rounded-lg"
                title={minimized ? 'Expand' : 'Minimize'}
              >
                {minimized ? <Maximize2 size={13} /> : <Minimize2 size={13} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="btn-ghost p-1.5 rounded-lg"
                title="Close"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 scrollbar-thin">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-space-500/10 border border-space-500/20 flex items-center justify-center">
                      <Bot size={28} className="text-space-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Mission AI Assistant</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-[220px]">
                        Ask me about ISS position, crew, speed, or today's space news.
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 w-full">
                      {SUGGESTIONS.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => onSend(s)}
                          className="text-xs text-left px-3 py-2 rounded-lg border border-space-500/20 hover:border-space-500/50 hover:bg-space-500/5 text-[var(--text-secondary)] hover:text-space-400 transition-all duration-200"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <ChatMessage key={i} msg={msg} />
                ))}

                {loading && <TypingIndicator />}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-[var(--border-color)] flex-shrink-0">
                <div className="flex items-end gap-2 bg-slate-100 dark:bg-cosmic-border/40 rounded-xl border border-[var(--border-color)] focus-within:border-space-500/50 transition-colors p-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Ask about ISS or news…"
                    rows={1}
                    className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] resize-none outline-none px-2 py-1 max-h-24 scrollbar-thin"
                    style={{ lineHeight: '1.5' }}
                    disabled={loading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    className="w-8 h-8 rounded-lg bg-space-600 hover:bg-space-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  >
                    {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
                  </button>
                </div>
                <p className="text-[9px] text-[var(--text-secondary)] text-center mt-1.5">
                  Powered by Mistral-7B · Dashboard context only
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
