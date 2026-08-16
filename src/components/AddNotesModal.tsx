import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  Building,
  Folder,
} from 'lucide-react';
import { DailyRoutineItem, WeeklyScheduleItem, MonthlyDueItem, SpecialRuleItem } from '../types';

interface AddNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDailyRoutine: (item: Omit<DailyRoutineItem, 'id' | 'order'>) => void;
  onAddWeeklySchedule: (item: Omit<WeeklyScheduleItem, 'id'>) => void;
  onAddSpecialRule: (item: Omit<SpecialRuleItem, 'id'>) => void;
}

export const AddNotesModal: React.FC<AddNotesModalProps> = ({
  isOpen,
  onClose,
  onAddDailyRoutine,
  onAddWeeklySchedule,
  onAddSpecialRule,
}) => {
  const [rawText, setRawText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedResult, setParsedResult] = useState<{
    summary?: string;
    items?: any[];
  } | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleProcessAi = async () => {
    if (!rawText.trim()) return;
    setIsLoading(true);
    setParsedResult(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/ai/parse-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      if (response.ok) {
        const data = await response.json();
        setParsedResult(data);
        if (data.items && data.items.length > 0) {
          setSelectedIndices(data.items.map((_: any, idx: number) => idx));
        }
      } else {
        alert('Erro ao processar as anotações. Tente novamente.');
      }
    } catch (e) {
      console.error(e);
      alert('Erro de conexão ao processar com a IA.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const handleImportSelected = () => {
    if (!parsedResult?.items) return;

    let addedCount = 0;
    parsedResult.items.forEach((item, idx) => {
      if (!selectedIndices.includes(idx)) return;

      if (item.type === 'daily_routine') {
        onAddDailyRoutine({
          title: item.title,
          description: item.description,
          timing: item.timing || 'Manhã',
          category: 'geral',
          alert: item.criticalAlert,
          actionableSteps: item.actionableSteps,
        });
        addedCount++;
      } else if (item.type === 'weekly_schedule') {
        const dayMap: Record<string, any> = {
          seg: 'Segunda-feira',
          ter: 'Terça-feira',
          qua: 'Quarta-feira',
          qui: 'Quinta-feira',
          sex: 'Sexta-feira',
        };
        const dayKey = item.daysOfWeek?.[0] || 'qua';
        onAddWeeklySchedule({
          title: item.title,
          description: item.description,
          dayOfWeek: dayKey,
          dayName: dayMap[dayKey] || 'Semanal',
          category: 'fornecedores',
          status: 'pending',
          criticalRule: item.criticalAlert,
        });
        addedCount++;
      } else if (item.type === 'special_rule') {
        onAddSpecialRule({
          entityName: item.relatedEntity || item.title.split(':')[0] || 'Fornecedor',
          title: item.title,
          description: item.description,
          actionRequired: item.criticalAlert || item.description,
          severity: item.importance === 'alta' ? 'high' : 'medium',
          tags: ['Anotação IA', item.category || 'Geral'],
          category: 'outros',
        });
        addedCount++;
      } else {
        // Fallback to special rule or daily routine
        onAddSpecialRule({
          entityName: item.relatedEntity || 'Regra de Trabalho',
          title: item.title,
          description: item.description,
          actionRequired: item.criticalAlert || 'Seguir instrução',
          severity: 'medium',
          tags: ['Anotação Adicionada'],
          category: 'outros',
        });
        addedCount++;
      }
    });

    setSuccessMessage(`${addedCount} novos itens foram adicionados à sua rotina com sucesso!`);
    setTimeout(() => {
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#141414] rounded-3xl max-w-3xl w-full border border-[#262626] shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#121212] border-b border-[#222] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950/60 text-teal-400 border border-teal-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Adicionar Novas Anotações com IA</h3>
              <p className="text-xs text-[#888]">
                Cole qualquer lista, e-mail ou instrução que você recebeu para o Gemini categorizar automaticamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#202020] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-mono font-medium uppercase tracking-wider text-zinc-300 mb-2">
              Cole o texto bruto das anotações recebidas:
            </label>
            <textarea
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Ex: 'O Marcos me avisou que na quinta-feira precisamos fechar a prévia do câmbio com o banco Santander até as 15h. Para o fornecedor ABC, sempre reter 1.5% de IR.' "
              rows={5}
              className="w-full p-3.5 text-xs sm:text-sm bg-[#181818] border border-[#2a2a2a] rounded-2xl text-white placeholder-[#666] focus:outline-none focus:border-teal-500 transition-all font-mono"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() =>
                setRawText(
                  '1. Toda quinta-feira antes das 11:00 enviar relatório de conciliação para o gestor.\n2. Fornecedor ABC tem desconto de 5% por pontualidade.\n3. Entrar em contato com o Carlos do RH para validar a lista de novos colaboradores no dia 15.'
                )
              }
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              Inserir exemplo de teste
            </button>

            <button
              onClick={handleProcessAi}
              disabled={isLoading || !rawText.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-medium shadow-xs transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Analisando com IA...' : 'Organizar com Gemini IA'}</span>
            </button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="p-4 rounded-xl bg-teal-950/40 border border-teal-900/50 text-teal-200 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <Check className="w-5 h-5 text-teal-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Parsed Result Preview */}
          {parsedResult && parsedResult.items && (
            <div className="mt-4 pt-4 border-t border-[#222] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Itens Identificados ({parsedResult.items.length})
                  </h4>
                  {parsedResult.summary && (
                    <p className="text-xs text-[#888] mt-0.5">{parsedResult.summary}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedIndices(
                      selectedIndices.length === parsedResult.items?.length
                        ? []
                        : parsedResult.items.map((_, i) => i)
                    )
                  }
                  className="text-xs font-medium text-teal-400 hover:underline"
                >
                  {selectedIndices.length === parsedResult.items?.length
                    ? 'Desmarcar Todos'
                    : 'Selecionar Todos'}
                </button>
              </div>

              <div className="space-y-3">
                {parsedResult.items.map((item, idx) => {
                  const isSelected = selectedIndices.includes(idx);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectIndex(idx)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#181818] border-teal-800/80 ring-1 ring-teal-900/40'
                          : 'bg-[#101010] border-[#222] opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 w-4 h-4 accent-teal-500 rounded-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-[#252525] text-zinc-200 uppercase border border-[#333]">
                              {item.type.replace('_', ' ')}
                            </span>
                            <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#1e1e1e] text-teal-400 border border-teal-900/40">
                              {item.category}
                            </span>
                            {item.timing && (
                              <span className="text-xs text-[#888] font-mono">⏰ {item.timing}</span>
                            )}
                          </div>
                          <h5 className="text-sm font-semibold text-white">{item.title}</h5>
                          <p className="text-xs text-[#aaa] mt-1">{item.description}</p>
                          {item.criticalAlert && (
                            <p className="text-xs text-orange-300 font-medium mt-1">
                              ⚠️ {item.criticalAlert}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#888] hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={selectedIndices.length === 0}
                  className="px-5 py-2 text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  Adicionar Selecionados à Minha Rotina
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
