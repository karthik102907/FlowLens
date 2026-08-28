import React, { useState } from 'react';
import { api } from '../../services/api';
import { AIChatResponse } from '../../types';
import { Sparkles, Send, X, Bot, User, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  datasetId: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundedFacts?: string[];
  suggestedFollowups?: string[];
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose, datasetId }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        "Hello! I am your **FlowLens AI Process Analyst**. I answer operational questions strictly derived from your computed dataset metrics. Ask me anything about bottlenecks, delays, SLA breaches, or root causes!",
      suggestedFollowups: [
        'What is the biggest bottleneck?',
        'Why is this stage slow?',
        'Where is most rework happening?',
        'Which department has the highest waiting time?',
        'What should we fix first?',
        'Which cases are most at risk?',
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (questionText?: string) => {
    const query = questionText || input.trim();
    if (!query || loading) return;

    // Add user message
    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res: AIChatResponse = await api.askAI(datasetId, query);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: res.answer,
          groundedFacts: res.grounded_facts,
          suggestedFollowups: res.suggested_followups,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Unable to analyze dataset query at this time. Please ensure the dataset is loaded.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">FlowLens AI Analyst</h3>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Grounded in verified process metrics
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Transparency Banner */}
      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 text-[11px] text-slate-600 flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
        <span>AI responses are grounded in verified analysis data and restricted from generating unsupported claims.</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 border border-slate-700 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200/80 shadow-xs rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Grounded facts badges */}
              {msg.groundedFacts && msg.groundedFacts.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                    Based on this analysis:
                  </span>
                  {msg.groundedFacts.map((fact, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Follow-up question pills */}
              {msg.suggestedFollowups && msg.suggestedFollowups.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                  {msg.suggestedFollowups.map((pill, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSend(pill)}
                      className="text-[11px] bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-200 px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors text-left cursor-pointer"
                    >
                      <span>{pill}</span>
                      <ArrowRight className="w-3 h-3 text-cyan-600" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-cyan-400 flex items-center justify-center shrink-0 border border-slate-700">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping"></span>
              Consulting calculated process metrics...
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 border-t border-slate-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about this process..."
            className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
