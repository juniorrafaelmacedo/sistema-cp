import React, { useState, useEffect, useMemo } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Send,
  CreditCard,
  User,
  MessageSquare,
  ShieldCheck,
  X,
  Sparkles,
} from 'lucide-react';
import { WeeklyScheduleItem, WeeklyClosureRecord, CustomNoteItem, UserProfile } from '../types';
import { WeekPeriodInfo, getWeekPeriodInfo, getISOWeekNumber } from '../utils/weekUtils';

interface WeeklyClosureModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWeekInfo?: WeekPeriodInfo | null;
  weekInfo?: WeekPeriodInfo | null;
  weeklySchedules: WeeklyScheduleItem[];
  completedWeeklyIds: string[];
  customNotes?: CustomNoteItem[];
  currentUser?: UserProfile | null;
  existingClosure?: WeeklyClosureRecord | null;
  onSaveClosure?: (closure: Omit<WeeklyClosureRecord, 'id' | 'closedAt'>) => void;
  onSave?: (closure: Omit<WeeklyClosureRecord, 'id' | 'closedAt'>) => void;
}

export const WeeklyClosureModal: React.FC<WeeklyClosureModalProps> = ({
  isOpen,
  onClose,
  selectedWeekInfo,
  weekInfo,
  weeklySchedules = [],
  completedWeeklyIds = [],
  customNotes = [],
  currentUser,
  existingClosure,
  onSaveClosure,
  onSave,
}) => {
  const activeWeekInfo: WeekPeriodInfo = useMemo(() => {
    if (selectedWeekInfo) return selectedWeekInfo;
    if (weekInfo) return weekInfo;
    const currentISO = getISOWeekNumber(new Date());
    return getWeekPeriodInfo(currentISO.weekNumber, currentISO.year);
  }, [selectedWeekInfo, weekInfo]);

  const [closedBy, setClosedBy] = useState(
    existingClosure?.closedBy || currentUser?.name || 'Responsável Tesouraria'
  );
  const [summaryNotes, setSummaryNotes] = useState(
    existingClosure?.summaryNotes ||
      `Fechamento da Semana ${activeWeekInfo.weekNumber}/${activeWeekInfo.year} realizado. Lotes de pagamento autorizados na quarta-feira e executados na sexta-feira conforme cronograma da Diretoria.`
  );
  const [pendingItemsNotes, setPendingItemsNotes] = useState(
    existingClosure?.pendingItemsNotes || ''
  );
  const [criticalRulesChecked, setCriticalRulesChecked] = useState(
    existingClosure?.criticalRulesChecked ?? true
  );

  // Sync state whenever modal opens or active week/closure changes
  useEffect(() => {
    if (isOpen) {
      setClosedBy(existingClosure?.closedBy || currentUser?.name || 'Responsável Tesouraria');
      setSummaryNotes(
        existingClosure?.summaryNotes ||
          `Fechamento da Semana ${activeWeekInfo.weekNumber}/${activeWeekInfo.year} realizado. Lotes de pagamento autorizados na quarta-feira e executados na sexta-feira conforme cronograma da Diretoria.`
      );
      setPendingItemsNotes(existingClosure?.pendingItemsNotes || '');
      setCriticalRulesChecked(existingClosure?.criticalRulesChecked ?? true);
    }
  }, [isOpen, existingClosure, activeWeekInfo.weekNumber, activeWeekInfo.year, currentUser?.name]);

  if (!isOpen) return null;

  const totalTasks = weeklySchedules.length;
  const completedTasks = weeklySchedules.filter(s => completedWeeklyIds.includes(s.id)).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tasksSnapshot = weeklySchedules.map(task => ({
      id: task.id,
      title: task.title,
      dayOfWeek: task.dayOfWeek,
      dayName: task.dayName,
      completed: completedWeeklyIds.includes(task.id),
      dueTime: task.dueTime,
      criticalRule: task.criticalRule,
    }));

    const closurePayload = {
      year: activeWeekInfo.year,
      weekNumber: activeWeekInfo.weekNumber,
      periodLabel: activeWeekInfo.formattedRange,
      startDateFormatted: activeWeekInfo.mondayFormatted,
      endDateFormatted: activeWeekInfo.sundayFormatted,
      wednesdayFormatted: activeWeekInfo.wednesdayFormatted,
      fridayFormatted: activeWeekInfo.fridayFormatted,
      closedBy: closedBy.trim() || 'Tesouraria',
      summaryNotes: summaryNotes.trim(),
      pendingItemsNotes: pendingItemsNotes.trim() || undefined,
      criticalRulesChecked,
      totalTasksCount: totalTasks,
      completedTasksCount: completedTasks,
      completedTaskIds: completedWeeklyIds,
      tasksSnapshot,
      customNotesSnapshot: customNotes,
      status: (completedTasks === totalTasks ? 'closed' : 'in_progress') as 'closed' | 'in_progress',
    };

    if (onSaveClosure) {
      onSaveClosure(closurePayload);
    } else if (onSave) {
      onSave(closurePayload);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 relative my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#222] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-950/80 border border-teal-700/60 text-teal-400 rounded-2xl">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60">
                  SEMANA {activeWeekInfo.weekNumber}/{activeWeekInfo.year}
                </span>
                <span className="text-xs text-zinc-400">
                  {activeWeekInfo.formattedRange}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                {existingClosure ? 'Atualizar Fechamento Semanal' : 'Registrar Fechamento Semanal'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-[#202020] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Quick Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#181818] border border-[#262626]">
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Progresso das Rotinas</span>
            <div className="text-lg font-bold text-white flex items-center gap-2">
              <span className="font-mono">{completedTasks}/{totalTasks}</span>
              <span className={`text-xs px-2 py-0.5 rounded-md font-mono ${
                completionPercentage === 100
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                  : 'bg-amber-950 text-amber-300 border border-amber-800/50'
              }`}>
                {completionPercentage}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Envio p/ Diretoria</span>
            <div className="text-xs font-semibold text-orange-300 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>Quarta ({activeWeekInfo.wednesdayFormatted})</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] text-zinc-400 font-medium">Execução Pagamentos</span>
            <div className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>Sexta ({activeWeekInfo.fridayFormatted})</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Name */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>Responsável pelo Fechamento</span>
            </label>
            <input
              type="text"
              required
              value={closedBy}
              onChange={e => setClosedBy(e.target.value)}
              placeholder="Ex: Rafael Junior / Tesouraria & Contas a Pagar"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-all"
            />
          </div>

          {/* Critical Rules Checkbox Confirmation */}
          <div className="p-3.5 rounded-xl bg-[#191512] border border-orange-900/50 space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={criticalRulesChecked}
                onChange={e => setCriticalRulesChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-teal-600 bg-[#121212] border-zinc-700 focus:ring-teal-500"
              />
              <div className="text-xs">
                <span className="font-semibold text-orange-300 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  Validação de Regras Críticas de Fornecedores
                </span>
                <p className="text-[11px] text-orange-200/80 mt-0.5">
                  Confirmo que verifiquei as regras obrigatórias de abatimento (Welcon com desconto judicial, Cemas com Nota de Débito e Adiantamentos com Carta de Garantia).
                </p>
              </div>
            </label>
          </div>

          {/* Summary Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
              <span>Resumo & Observações do Fechamento Semanal</span>
            </label>
            <textarea
              rows={3}
              required
              value={summaryNotes}
              onChange={e => setSummaryNotes(e.target.value)}
              placeholder="Descreva as principais ocorrências, pagamentos expressivos, aprovações da diretoria e saldo de execução..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 leading-relaxed transition-all"
            />
          </div>

          {/* Pending items for next week */}
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Pendências / Observações para a Próxima Semana (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={pendingItemsNotes}
              onChange={e => setPendingItemsNotes(e.target.value)}
              placeholder="Ex: Aguardando NF corrigida de fornecedor X; Boleto Y reagendado para a próxima quarta-feira..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 leading-relaxed transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-medium text-zinc-400 hover:text-white rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>{existingClosure ? 'Salvar Alterações' : 'Concluir & Salvar Semana'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
