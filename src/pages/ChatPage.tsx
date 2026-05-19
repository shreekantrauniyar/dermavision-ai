import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { ChatMessage } from '../types';
import { useAuth } from '../hooks/useAuth';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const clearHistory = async () => {
    if (!user || !window.confirm("Are you sure you want to clear your local chat history for this session?")) return;
    setMessages([]);
    localStorage.removeItem(`chats_${user.uid}`);
  };

  useEffect(() => {
    if (!user) return;
    const loadedStr = localStorage.getItem(`chats_${user.uid}`);
    if (loadedStr) {
      try {
        setMessages(JSON.parse(loadedStr));
      } catch (e) {}
    }
  }, [user]);

  const saveChats = (chats: ChatMessage[]) => {
    if (!user) return;
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify(chats));
    setMessages(chats);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    try {
      const userId = user.uid;
      
      const newUserMsg: ChatMessage = {
        userId,
        role: 'user',
        content: userMessage || "",
        createdAt: new Date().toISOString(),
      };
      
      const currentMessages = [...messages, newUserMsg];
      saveChats(currentMessages);

      // Call Server-side AI
      const response = await axios.post('/api/chat', { 
        messages: currentMessages 
      });
      
      const newModelMsg: ChatMessage = {
        userId,
        role: 'model',
        content: response.data.content || "I'm sorry, I couldn't generate a response.",
        createdAt: new Date().toISOString(),
      };
      
      saveChats([...currentMessages, newModelMsg]);

    } catch (err: any) {
      console.error(err);
      let errorMessage = "Sorry, I couldn't process that request.";
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 503) {
        errorMessage = "The AI is currently at capacity. Please wait a few moments and try again.";
      }
      
      saveChats([...messages, {
        userId: user.uid,
        role: 'model',
        content: errorMessage,
        createdAt: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 text-slate-800 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Bot size={24} />
          </div>
          <div>
            <h3 className="font-bold dark:text-white">DermaVision Assistant</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Skin health expert AI</p>
          </div>
        </div>
        <button 
          onClick={clearHistory}
          className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors uppercase tracking-widest"
        >
          Clear History
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-slate-950/50">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <MessageSquareHeartIcon size={32} />
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">How can I help you?</h4>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm">Ask me about skin symptoms, prevention tips, or how to use the app.</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={m.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex items-start gap-3",
                m.role === 'user' ? "flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'user' ? "bg-white text-slate-600" : "bg-indigo-600 text-white"
              )}>
                {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "px-4 py-3 rounded-2xl max-w-[80%] shadow-sm text-sm leading-relaxed",
                m.role === 'user' 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
              )}>
                <p className="whitespace-pre-wrap">{m.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Bot size={16} />
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700">
              <Loader2 size={16} className="animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900">
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..." 
            className="flex-1 bg-transparent border-none focus:outline-none px-2 text-sm dark:text-white dark:placeholder-slate-500"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}

function MessageSquareHeartIcon({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      <path d="M12 13s-1.5-1.5-1.5-2.5a1.5 1.5 0 0 1 3 0c0 1-1.5 2.5-1.5 2.5z"/>
    </svg>
  );
}
