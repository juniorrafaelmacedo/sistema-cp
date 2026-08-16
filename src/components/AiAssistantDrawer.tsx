import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  User,
  Bot,
  Loader2,
  HelpCircle,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { FinancialAssistantState } from '../types';

interface AiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  state: FinancialAssistantState;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAssistantDrawer: React.FC<AiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Olá! Sou seu assistente de rotina de Tesouraria e Contas a Pagar. Pode me perguntar qualquer coisa sobre os procedimentos da empresa, fornecedores (Welcon, Cemas, Visteon), prazos (quarta-feira, sexta-feira, dia 20), contas bancárias ou pastas de rede!',
      timestamp: 'Agora',
    },
  ]);

  if (!isOpen) return null;

  const quickQuestions = [
    'Como devo realizar o pagamento da Welcon?',
    'O que preciso fazer com a Cemas e a Nota de Débito?',
    'Qual a regra para adiantamento de pagamentos?',
    'Qual a categoria em inglês para Contas de Consumo / Licenças de Software?',
    'Quais são os vencimentos do dia 20?',
    'Qual o número da conta Santander de Gravataí e Guarulhos?',
    'Qual o passo a passo da rotina matinal?',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input;
    if (!q.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/ask-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q.trim(),
          context: {
            dailyRoutines: state.dailyRoutines,
            weeklySchedules: state.weeklySchedules,
            monthlyDues: state.monthlyDues,
            specialRules: state.specialRules,
            contacts: state.contacts,
            bankAccounts: state.bankAccounts,
            folderPaths: state.folderPaths,
            expenseTypes: state.expenseTypes,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: data.answer || 'Sem resposta disponível.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const errorMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'Desculpe, ocorreu um erro ao consultar o assistente. Por favor, tente novamente.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e) {
      console.error(e);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'Erro de comunicação com o servidor.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex justify-end">
      <div className="bg-[#141414] w-full max-w-lg h-full shadow-2xl flex flex-col justify-between border-l border-[#222]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#121212] border-b border-[#222] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950/60 text-teal-400 border border-teal-900/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm sm:text-base text-white">Assistente Financeiro & Regras</h3>
              <p className="text-xs text-[#888]">MPP Treasury • Inteligência Operacional</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#202020] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message history */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-[#0d0d0d]">
          {messages.map(m => (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-[#262626] text-white font-bold border border-[#333]'
                    : 'bg-teal-950/60 text-teal-400 border border-teal-900/40'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  m.sender === 'user'
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : 'bg-[#181818] text-zinc-200 border border-[#262626] shadow-xs rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-[#888] text-xs pl-9">
              <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
              <span>Consultando procedimentos da tesouraria...</span>
            </div>
          )}
        </div>

        {/* Quick prompt chips */}
        <div className="p-3 border-t border-[#222] bg-[#121212]">
          <div className="text-xs font-medium text-[#888] mb-2 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-teal-400" />
            <span>Perguntas Frequentes:</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 text-xs bg-[#1c1c1c] hover:bg-[#252525] text-zinc-300 border border-[#2a2a2a] rounded-lg whitespace-nowrap transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#222] bg-[#141414]">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Digite sua dúvida sobre regras ou tarefas..."
              className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#181818] border border-[#2a2a2a] rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-teal-500 transition-all"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
