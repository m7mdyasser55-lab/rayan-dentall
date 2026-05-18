import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Message[]>([
    { role: 'assistant', text: 'Welcome to Rayan Dental Care! How can I help you today? \n أهلاً بك في عيادة ريان لطب الأسنان! كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: message };
    setChatHistory(prev => [...prev, userMsg]);
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history: chatHistory }),
      });
      const data = await res.json();
      setChatHistory(prev => [...prev, { role: 'assistant', text: data.text }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'assistant', text: 'Sorry, I am having trouble connecting right now. Please call us at 01550809980.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* FAB */}
      <motion.button
        id="chat-fab"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#047857] text-white rounded-full shadow-2xl flex items-center justify-center z-50 cursor-pointer"
      >
        <MessageSquare size={28} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chat-window"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors"
          >
            {/* Header */}
            <div className="bg-[#047857] p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Rayan Dental Assistant</h3>
                  <span className="text-[10px] opacity-80 uppercase tracking-widest">Always Online</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50"
            >
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                     <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#047857]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-gray-600 dark:text-gray-400" />}
                     </div>
                     <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                       msg.role === 'user' 
                       ? 'bg-[#047857] text-white rounded-tr-none' 
                       : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-none text-gray-700 dark:text-gray-300 shadow-sm'
                     }`}>
                       {msg.text}
                     </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-3 rounded-2xl shadow-sm">
                    <Loader2 size={16} className="animate-spin text-[#047857]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Ask about dental care..."
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all dark:text-white dark:placeholder:text-gray-600"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  id="send-btn"
                  onClick={handleSend}
                  disabled={isLoading}
                  className="w-10 h-10 bg-[#047857] text-white rounded-full flex items-center justify-center hover:bg-[#059669] disabled:opacity-50 transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
