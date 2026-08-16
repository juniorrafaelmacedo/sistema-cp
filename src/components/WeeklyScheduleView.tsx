import React, { useState, useMemo } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Send,
  CreditCard,
  RotateCcw,
  Plus,
  Trash2,
  ArrowRight,
  FileCheck2,
  ChevronLeft,
  ChevronRight,
  Layers,
  CalendarDays,
  Sparkles,
  Check,
} from 'lucide-react';
import { WeeklyScheduleItem, WeeklyClosureRecord, DayOfWeekKey } from '../types';
import { getISOWeekNumber, getWeekPeriodInfo, getAllWeeksOfYear, WeekPeriodInfo } from '../utils/weekUtils';

interface WeeklyScheduleViewProps {
  weeklySchedules: WeeklyScheduleItem[];
  completedWeeklyIds: string[];
  currentDayKey: DayOfWeekKey;
  weeklyClosures?: WeeklyClosureRecord[];
  onToggleWeeklyItem: (id: string) => void;
  onResetWeeklyChecklist: () => void;
  onAddWeeklySchedule: (item: Omit<WeeklyScheduleItem, 'id'>) => void;
  onDeleteWeeklySchedule: (id: string) => void;
  onAddWeeklyGuideline?: (scheduleId: string, guidelineText: string) => void;
  onRemoveWeeklyGuideline?: (scheduleId: string, stepIndex: number) => void;
  onUpdateWeeklySchedule?: (id: string, updated: Partial<WeeklyScheduleItem>) => void;
  onOpenClosureModal?: (weekNum: number) => void;
  onNavigateToClosures?: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  weeklySchedules,
  completedWeeklyIds,
  currentDayKey,
  weeklyClosures = [],
  onToggleWeeklyItem,
  onResetWeeklyChecklist,
  onAddWeeklySchedule,
  onDeleteWeeklySchedule,
  onAddWeeklyGuideline,
  onRemoveWeeklyGuideline,
  onUpdateWeeklySchedule,
  onOpenClosureModal,
  onNavigateToClosures,
}) => {
  const [filterDay, setFilterDay] = useState<DayOfWeekKey | 'all'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeekKey>('qua');
  const [criticalRule, setCriticalRule] = useState('');
  const [dueTime, setDueTime] = useState('14:00');
  const [badgeText, setBadgeText] = useState('Semanal');

  // Week of the year state
  const currentISO = useMemo(() => getISOWeekNumber(new Date()), []);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(currentISO.weekNumber);
  const selectedYear = currentISO.year;

  // Calculate selected week details
  const selectedWeekInfo: WeekPeriodInfo = useMemo(() => {
    return getWeekPeriodInfo(selectedWeekNumber, selectedYear);
  }, [selectedWeekNumber, selectedYear]);

  // List of all weeks of the year for selector
  const allWeeks = useMemo(() => getAllWeeksOfYear(selectedYear), [selectedYear]);

  // Inline orientation states for weekly items
  const [inlineGuidelineInputs, setInlineGuidelineInputs] = useState<Record<string, string>>({});
  const [activeInlineFormId, setActiveInlineFormId] = useState<string | null>(null);

  const daysList: { key: DayOfWeekKey; name: string; short: string; dateFormatted?: string }[] = [
    { key: 'seg', name: 'Segunda-feira', short: 'SEG', dateFormatted: selectedWeekInfo.mondayFormatted },
    { key: 'ter', name: 'Terça-feira', short: 'TER' },
    { key: 'qua', name: 'Quarta-feira', short: 'QUA', dateFormatted: selectedWeekInfo.wednesdayFormatted },
    { key: 'qui', name: 'Quinta-feira', short: 'QUI' },
    { key: 'sex', name: 'Sexta-feira', short: 'SEX', dateFormatted: selectedWeekInfo.fridayFormatted },
  ];

  const handlePrevWeek = () => {
    setSelectedWeekNumber(prev => (prev > 1 ? prev - 1 : 52));
  };

  const handleNextWeek = () => {
    setSelectedWeekNumber(prev => (prev < 52 ? prev + 1 : 1));
  };

  const handleSetCurrentWeek = () => {
    setSelectedWeekNumber(currentISO.weekNumber);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const dayObj = daysList.find(d => d.key === dayOfWeek) || { name: 'Semanal' };

    onAddWeeklySchedule({
      title: title.trim(),
      description: description.trim() || 'Tarefa semanal',
      dayOfWeek,
      dayName: dayObj.name,
      category: 'fornecedores',
      status: 'pending',
      criticalRule: criticalRule.trim() || undefined,
      badgeText: badgeText.trim() || undefined,
      dueTime: dueTime.trim() || undefined,
    });

    setTitle('');
    setDescription('');
    setCriticalRule('');
    setIsAdding(false);
  };

  const handleInlineAddGuideline = (scheduleId: string) => {
    const text = inlineGuidelineInputs[scheduleId]?.trim();
    if (!text || !onAddWeeklyGuideline) return;
    onAddWeeklyGuideline(scheduleId, text);
    setInlineGuidelineInputs(prev => ({ ...prev, [scheduleId]: '' }));
    setActiveInlineFormId(null);
  };

  const filteredItems = weeklySchedules.filter(item => {
    if (filterDay === 'all') return true;
    return item.dayOfWeek === filterDay;
  });

  // Check if selected week is already closed
  const existingClosureForSelectedWeek = useMemo(() => {
    return weeklyClosures.find(
      c => c.year === selectedYear && c.weekNumber === selectedWeekNumber
    );
  }, [weeklyClosures, selectedYear, selectedWeekNumber]);

  return (
    <div className="space-y-6">
      {/* Week Selector / Período de Pagamento Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#141414] via-[#161918] to-[#141414] border border-teal-900/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-mono">
                📅 SEMANA DO ANO SENDO PAGA
              </span>
              {selectedWeekInfo.isCurrentWeek ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Semana Vigente / Atual
                </span>
              ) : selectedWeekNumber < currentISO.weekNumber ? (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Semana Anterior ({currentISO.weekNumber - selectedWeekNumber} atrás)
                </span>
              ) : (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-950/60 text-sky-300 border border-sky-800/50">
                  Semana Futura (+{selectedWeekNumber - currentISO.weekNumber})
                </span>
              )}

              {existingClosureForSelectedWeek ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" />
                  Semana Arquivada / Fechada
                </span>
              ) : (
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-zinc-400 border border-[#2e2e2e]">
                  Não arquivada
                </span>
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Semana {selectedWeekInfo.weekNumber} <span className="text-teal-400 text-lg font-medium">de {selectedYear}</span>
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 mt-1">
              <strong className="text-teal-300 font-medium">Período de Vencimento dos Fornecedores:</strong>{' '}
              <span className="font-mono text-white bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#2a2a2a]">
                Segunda-feira ({selectedWeekInfo.mondayFormatted}) até Domingo ({selectedWeekInfo.sundayFormatted})
              </span>
            </p>
          </div>

          {/* Week Navigator Controls & Closure Action */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#181818] border border-[#2c2c2c] rounded-xl p-1 shadow-xs">
              <button
                onClick={handlePrevWeek}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                title="Semana Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={selectedWeekNumber}
                onChange={e => setSelectedWeekNumber(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-teal-300 px-2 py-1 focus:outline-none cursor-pointer"
              >
                {allWeeks.map(w => (
                  <option key={w.weekNumber} value={w.weekNumber} className="bg-[#181818] text-white">
                    Semana {w.weekNumber} ({w.formattedShortRange})
                  </option>
                ))}
              </select>

              <button
                onClick={handleNextWeek}
                className="p-1.5 text-zinc-300 hover:text-white hover:bg-[#262626] rounded-lg transition-colors"
                title="Próxima Semana"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {onOpenClosureModal && (
              <button
                onClick={() => onOpenClosureModal(selectedWeekNumber)}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                title="Salvar ou atualizar o fechamento desta semana com anotações e status"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>
                  {existingClosureForSelectedWeek
                    ? `Atualizar Fechamento Sem. ${selectedWeekNumber}`
                    : `Fechar / Salvar Sem. ${selectedWeekNumber}`}
                </span>
              </button>
            )}

            {onNavigateToClosures && (
              <button
                onClick={onNavigateToClosures}
                className="px-3 py-2 text-xs font-semibold text-zinc-300 hover:text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#2e2e2e] rounded-xl transition-colors flex items-center gap-1"
                title="Ver histórico de semanas fechadas"
              >
                <Layers className="w-3.5 h-3.5 text-teal-400" />
                <span>Histórico</span>
              </button>
            )}

            {!selectedWeekInfo.isCurrentWeek && (
              <button
                onClick={handleSetCurrentWeek}
                className="px-3 py-2 text-xs font-semibold text-teal-300 hover:text-white bg-teal-950/60 hover:bg-teal-900/60 border border-teal-800/40 rounded-xl transition-colors"
              >
                Semana Atual ({currentISO.weekNumber})
              </button>
            )}
          </div>
        </div>

        {/* Highlight Key Milestones for the Selected Week */}
        <div className="mt-4 pt-4 border-t border-teal-900/30 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              <span>1. Envio para Aprovação (Diretoria)</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Quarta-feira • {selectedWeekInfo.wednesdayFormatted}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Enviar relação consolidada de seg a dom até às 14:00.
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111] border border-[#222]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>2. Execução Bancária & Pagamentos</span>
            </div>
            <div className="text-sm font-semibold text-white mt-1">
              Sexta-feira • {selectedWeekInfo.fridayFormatted}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Lançamento e envio aos aprovadores bancários (Itaú 16h, Bradesco 17h).
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#111] border border-[#222] sm:col-span-2 lg:col-span-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-zinc-300" />
              <span>3. Abrangência dos Vencimentos</span>
            </div>
            <div className="text-sm font-semibold text-zinc-200 mt-1">
              {selectedWeekInfo.mondayFormatted} a {selectedWeekInfo.sundayFormatted}
            </div>
            <div className="text-[11px] text-zinc-400 mt-0.5">
              Todos os títulos de fornecedores que vencem nesta semana.
            </div>
          </div>
        </div>
      </div>

      {/* Existing Closure Status Banner for the Selected Week */}
      {existingClosureForSelectedWeek && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1d16] border border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-emerald-950 border border-emerald-700/60 text-emerald-400 rounded-xl mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white">
                  Fechamento da Semana {selectedWeekInfo.weekNumber}/{selectedYear} Registrado
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold">
                  {existingClosureForSelectedWeek.completedTasksCount}/{existingClosureForSelectedWeek.totalTasksCount} Tarefas (
                  {Math.round(
                    (existingClosureForSelectedWeek.completedTasksCount /
                      (existingClosureForSelectedWeek.totalTasksCount || 1)) *
                      100
                  )}
                  %)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-700">
                  {new Date(existingClosureForSelectedWeek.closedAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-1">
                Responsável pelo registro: <strong className="text-white">{existingClosureForSelectedWeek.closedBy}</strong>
              </p>
              {existingClosureForSelectedWeek.summaryNotes && (
                <p className="text-xs text-zinc-300 mt-1 bg-[#0b1410] p-2 rounded-lg border border-emerald-950 line-clamp-2">
                  &ldquo;{existingClosureForSelectedWeek.summaryNotes}&rdquo;
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            {onNavigateToClosures && (
              <button
                onClick={onNavigateToClosures}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-900/80 hover:bg-emerald-800 text-emerald-100 border border-emerald-700/70 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ver na Aba Fechamentos</span>
              </button>
            )}
            {onOpenClosureModal && (
              <button
                onClick={() => onOpenClosureModal(selectedWeekNumber)}
                className="px-3.5 py-2 text-xs font-semibold bg-[#1a1a1a] hover:bg-[#262626] text-white border border-[#333] rounded-xl transition-all flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                <span>Editar Fechamento</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Weekly Flow Header Card */}
      <div className="bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#222] shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Fluxo Diário do Ciclo Semanal
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950/40 text-teal-300 border border-teal-900/40 font-mono font-medium">
                {weeklySchedules.length} Tarefas Cadastradas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-3xl">
              Acompanhe as rotinas específicas de cada dia da semana para garantir que nenhuma aprovação ou pagamento expire.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetWeeklyChecklist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#aaa] hover:text-white bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Resetar Semana</span>
            </button>

            <button
              onClick={() => setIsAdding(!isAdding)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Incluir Compromisso Semanal</span>
            </button>
          </div>
        </div>

        {/* Day Pills Filter */}
        <div className="mt-5 pt-4 border-t border-[#222] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filterDay === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
            }`}
          >
            Semana Completa
          </button>
          {daysList.map(d => {
            const isToday = d.key === currentDayKey;
            const isSelected = filterDay === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setFilterDay(d.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white'
                    : isToday
                    ? 'bg-[#1e1e1e] text-teal-400 border border-teal-900/40 hover:bg-[#252525]'
                    : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
                }`}
              >
                <span>{d.name}</span>
                {d.dateFormatted && (
                  <span className="text-[10px] opacity-75 font-mono">({d.dateFormatted.slice(0, 5)})</span>
                )}
                {isToday && <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Add Custom Schedule Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-[#141414] p-5 rounded-2xl border border-teal-900/40 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-teal-300">Novo Compromisso Semanal</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-[#666] hover:text-white"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Título do Compromisso *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Auditoria de notas de débito"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Dia da Semana</label>
              <select
                value={dayOfWeek}
                onChange={e => setDayOfWeek(e.target.value as DayOfWeekKey)}
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white focus:border-teal-500 focus:outline-none"
              >
                {daysList.map(d => (
                  <option key={d.key} value={d.key}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Instruções de como executar..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Regra Crítica / Alerta</label>
              <input
                type="text"
                value={criticalRule}
                onChange={e => setCriticalRule(e.target.value)}
                placeholder="Ex: Prazo limite 14:00"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Horário Limite</label>
              <input
                type="text"
                value={dueTime}
                onChange={e => setDueTime(e.target.value)}
                placeholder="Ex: Até 14:00"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 text-xs text-[#888] hover:text-white rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-xs"
            >
              Salvar
            </button>
          </div>
        </form>
      )}

      {/* Visual Timeline / Pipeline Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.map(item => {
          const isDone = completedWeeklyIds.includes(item.id);
          const isToday = item.dayOfWeek === currentDayKey;
          const isCritical = item.id === 'weekly-3' || item.id === 'weekly-5';
          const isInlineFormOpen = activeInlineFormId === item.id;
          const steps = item.actionableSteps || [];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-[#101010] border-[#1e1e1e] opacity-70'
                  : isToday
                  ? 'bg-[#161616] border-teal-700/80 ring-1 ring-teal-900/40 shadow-sm'
                  : isCritical
                  ? 'bg-[#151210] border-orange-900/40 hover:border-orange-800/60'
                  : 'bg-[#141414] border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleWeeklyItem(item.id)}
                  className="mt-0.5 text-[#666] hover:text-teal-400 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-teal-400 fill-teal-950/40" />
                  ) : (
                    <Circle className="w-6 h-6 hover:stroke-teal-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-md bg-[#1e1e1e] text-zinc-200 border border-[#2a2a2a]">
                        {item.dayName}
                      </span>
                      {isToday && (
                        <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-teal-950/60 text-teal-300 border border-teal-800/50">
                          HOJE
                        </span>
                      )}
                      {item.badgeText && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#181818] text-[#888] border border-[#262626]">
                          {item.badgeText}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {item.dueTime && (
                        <span className="text-xs text-[#888] font-mono flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          {item.dueTime}
                        </span>
                      )}
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir o compromisso semanal "${item.title}"?`)) {
                            onDeleteWeeklySchedule(item.id);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#2a2a2a] hover:border-rose-900/50 rounded-lg transition-colors"
                        title="Excluir compromisso semanal"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </div>

                  <h4 className={`text-base font-semibold text-white mt-2 ${isDone ? 'line-through text-[#666]' : ''}`}>
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#aaa] mt-1">
                    {item.description}
                  </p>

                  {/* Orientações & Steps for Weekly Item */}
                  <div className="mt-3 p-3 rounded-xl bg-[#0e0e0e] border border-[#202020] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Orientações & Diretrizes ({steps.length})</span>
                      </div>

                      {!isInlineFormOpen && onAddWeeklyGuideline && (
                        <button
                          onClick={() => {
                            setActiveInlineFormId(item.id);
                            setInlineGuidelineInputs(prev => ({ ...prev, [item.id]: '' }));
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-400 hover:text-teal-300 hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Adicionar Orientação</span>
                        </button>
                      )}
                    </div>

                    {steps.length > 0 && (
                      <div className="space-y-1">
                        {steps.map((step, sIdx) => (
                          <div
                            key={sIdx}
                            className="group/step flex items-start gap-2 p-1.5 rounded-lg bg-[#141414] hover:bg-[#181818] border border-[#222]"
                          >
                            <ArrowRight className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                            <span className="text-xs text-zinc-200 flex-1">{step}</span>
                            {onRemoveWeeklyGuideline && (
                              <button
                                type="button"
                                onClick={() => onRemoveWeeklyGuideline(item.id, sIdx)}
                                className="opacity-0 group-hover/step:opacity-100 text-[#777] hover:text-rose-400 p-0.5 transition-opacity"
                                title="Remover orientação"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {isInlineFormOpen && onAddWeeklyGuideline && (
                      <div className="pt-2 border-t border-[#1e1e1e] flex items-center gap-2">
                        <input
                          type="text"
                          autoFocus
                          value={inlineGuidelineInputs[item.id] || ''}
                          onChange={e =>
                            setInlineGuidelineInputs(prev => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleInlineAddGuideline(item.id);
                            }
                            if (e.key === 'Escape') setActiveInlineFormId(null);
                          }}
                          placeholder="Adicionar orientação para esta tarefa semanal..."
                          className="flex-1 px-3 py-1.5 text-xs bg-[#161616] border border-teal-900/60 rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleInlineAddGuideline(item.id)}
                          disabled={!inlineGuidelineInputs[item.id]?.trim()}
                          className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveInlineFormId(null)}
                          className="px-2.5 py-1.5 text-xs text-[#888] hover:text-white"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>

                  {item.criticalRule && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-900/30 text-orange-200 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{item.criticalRule}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
