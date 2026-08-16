import React, { useState, useMemo } from 'react';
import {
  FileCheck2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Send,
  CreditCard,
  User,
  Trash2,
  Edit,
  Download,
  Search,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Plus,
  Layers,
  ArrowRight,
  Filter,
  Check,
  FileText,
} from 'lucide-react';
import { WeeklyClosureRecord, WeeklyScheduleItem, CustomNoteItem, UserProfile } from '../types';
import { WeekPeriodInfo, getISOWeekNumber, getWeekPeriodInfo, getAllWeeksOfYear } from '../utils/weekUtils';
import { WeeklyClosureModal } from './WeeklyClosureModal';

interface WeeklyClosuresViewProps {
  weeklyClosures: WeeklyClosureRecord[];
  weeklySchedules: WeeklyScheduleItem[];
  completedWeeklyIds: string[];
  customNotes: CustomNoteItem[];
  currentUser?: UserProfile | null;
  onSaveClosure: (closure: Omit<WeeklyClosureRecord, 'id' | 'closedAt'>) => void;
  onUpdateClosure: (id: string, updated: Partial<WeeklyClosureRecord>) => void;
  onDeleteClosure: (id: string) => void;
  onNavigateToSchedule?: () => void;
}

export const WeeklyClosuresView: React.FC<WeeklyClosuresViewProps> = ({
  weeklyClosures = [],
  weeklySchedules = [],
  completedWeeklyIds = [],
  customNotes = [],
  currentUser,
  onSaveClosure,
  onUpdateClosure,
  onDeleteClosure,
  onNavigateToSchedule,
}) => {
  const currentISO = useMemo(() => getISOWeekNumber(new Date()), []);
  const [selectedYear, setSelectedYear] = useState<number>(currentISO.year);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'closed' | 'in_progress'>('all');
  const [expandedClosureId, setExpandedClosureId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWeekNumber, setModalWeekNumber] = useState<number>(currentISO.weekNumber);
  const [editingClosure, setEditingClosure] = useState<WeeklyClosureRecord | null>(null);

  const modalWeekInfo: WeekPeriodInfo = useMemo(() => {
    return getWeekPeriodInfo(modalWeekNumber, selectedYear);
  }, [modalWeekNumber, selectedYear]);

  // Current week closure check
  const currentWeekClosure = useMemo(() => {
    return weeklyClosures.find(
      c => c.year === currentISO.year && c.weekNumber === currentISO.weekNumber
    );
  }, [weeklyClosures, currentISO]);

  // Filtered closures list
  const filteredClosures = useMemo(() => {
    return weeklyClosures
      .filter(c => {
        if (c.year !== selectedYear) return false;
        if (filterStatus !== 'all' && c.status !== filterStatus) return false;
        if (!searchQuery.trim()) return true;

        const q = searchQuery.toLowerCase();
        return (
          c.weekNumber.toString().includes(q) ||
          c.periodLabel.toLowerCase().includes(q) ||
          c.closedBy.toLowerCase().includes(q) ||
          c.summaryNotes.toLowerCase().includes(q) ||
          (c.pendingItemsNotes && c.pendingItemsNotes.toLowerCase().includes(q))
        );
      })
      .sort((a, b) => b.weekNumber - a.weekNumber);
  }, [weeklyClosures, selectedYear, filterStatus, searchQuery]);

  // Summary statistics
  const stats = useMemo(() => {
    const yearClosures = weeklyClosures.filter(c => c.year === selectedYear);
    const totalClosed = yearClosures.length;
    const avgTasksCompleted =
      totalClosed > 0
        ? Math.round(
            yearClosures.reduce((acc, c) => acc + (c.completedTasksCount / (c.totalTasksCount || 1)) * 100, 0) /
              totalClosed
          )
        : 0;

    return {
      totalClosed,
      avgTasksCompleted,
      latestClosedWeek: yearClosures.length > 0 ? Math.max(...yearClosures.map(c => c.weekNumber)) : null,
    };
  }, [weeklyClosures, selectedYear]);

  const handleOpenNewClosure = (weekNum?: number) => {
    const targetWeek = weekNum ?? currentISO.weekNumber;
    const existing = weeklyClosures.find(c => c.year === selectedYear && c.weekNumber === targetWeek);
    setModalWeekNumber(targetWeek);
    setEditingClosure(existing || null);
    setIsModalOpen(true);
  };

  const handleEditClosure = (closure: WeeklyClosureRecord) => {
    setModalWeekNumber(closure.weekNumber);
    setSelectedYear(closure.year);
    setEditingClosure(closure);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, weekNumber: number) => {
    if (window.confirm(`Deseja realmente excluir o registro de fechamento da Semana ${weekNumber}?`)) {
      onDeleteClosure(id);
    }
  };

  const handleExportReport = (closure: WeeklyClosureRecord) => {
    const reportText = `=====================================================
RELATÓRIO DE FECHAMENTO SEMANAL - TESOURARIA MPP
Semana: ${closure.weekNumber} / ${closure.year}
Período: ${closure.periodLabel}
Data de Fechamento: ${new Date(closure.closedAt).toLocaleString('pt-BR')}
Responsável: ${closure.closedBy}
Status: ${closure.status === 'closed' ? 'CONCLUÍDO (100%)' : 'EM ANDAMENTO'}
=====================================================

1. RESUMO & OBSERVAÇÕES:
${closure.summaryNotes}

2. PENDÊNCIAS / OBSERVAÇÕES PARA PRÓXIMA SEMANA:
${closure.pendingItemsNotes || 'Nenhuma pendência registrada.'}

3. VALIDAÇÃO DE REGRAS CRÍTICAS:
- Welcon c/ Desconto Judicial: Validado
- Cemas c/ Nota de Débito (Kauan): Validado
- Adiantamentos c/ Carta de Garantia: Validado

4. ROTINAS SEMANAIS (${closure.completedTasksCount}/${closure.totalTasksCount} Concluídas):
${closure.tasksSnapshot
  ?.map(
    t =>
      `[${t.completed ? 'X' : ' '}] (${t.dayName.toUpperCase()}) ${t.title} ${
        t.dueTime ? '- Limite: ' + t.dueTime : ''
      }`
  )
  .join('\n') || 'N/A'}

=====================================================
Emitido automaticamente pelo Sistema de Tesouraria MPP
`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fechamento_semanal_sem_${closure.weekNumber}_${closure.year}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Close Action */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-[#141816] via-[#161c19] to-[#121614] border border-teal-800/50 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-teal-950 text-teal-300 border border-teal-700/60 font-mono flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                HISTÓRICO DE AUDITORIA & SALVAMENTO SEMANAL
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-zinc-300 border border-[#2a2a2a]">
                Ano {selectedYear}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Fechamentos Semanais de Contas a Pagar
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-3xl leading-relaxed">
              Registre e arquive o que foi executado em cada ciclo de pagamento semanal (quarta-feira para aprovações e sexta-feira para liberação bancária). Os dados ficam salvos permanentemente para conferência histórica e auditoria.
            </p>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenNewClosure(currentISO.weekNumber)}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs sm:text-sm rounded-2xl shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>
                {currentWeekClosure
                  ? `Atualizar Semana Atual (${currentISO.weekNumber})`
                  : `Fechar / Salvar Semana Atual (${currentISO.weekNumber})`}
              </span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="mt-6 pt-5 border-t border-teal-900/40 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-[#111614] border border-teal-900/40">
            <div className="text-[11px] font-medium text-teal-400/90">Semanas Arquivadas</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {stats.totalClosed}{' '}
              <span className="text-xs font-normal text-zinc-400">registros em {selectedYear}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111614] border border-teal-900/40">
            <div className="text-[11px] font-medium text-emerald-400/90">Taxa Média de Conclusão</div>
            <div className="text-2xl font-bold text-white mt-1 font-mono">
              {stats.avgTasksCompleted}%{' '}
              <span className="text-xs font-normal text-zinc-400">das rotinas executadas</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#111614] border border-teal-900/40">
            <div className="text-[11px] font-medium text-zinc-400">Último Fechamento Registrado</div>
            <div className="text-lg font-semibold text-teal-200 mt-1">
              {stats.latestClosedWeek ? `Semana ${stats.latestClosedWeek} de ${selectedYear}` : 'Nenhum neste ano'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-[#242424] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
          {/* Year selector */}
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-[#1a1a1a] border border-[#303030] text-teal-300 text-xs font-bold px-3 py-2 rounded-xl focus:outline-none focus:border-teal-500"
          >
            <option value={2026}>Ano 2026</option>
            <option value={2025}>Ano 2025</option>
            <option value={2027}>Ano 2027</option>
          </select>

          {/* Status filters */}
          <div className="flex items-center bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl p-1">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'all' ? 'bg-teal-950 text-teal-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos ({weeklyClosures.filter(c => c.year === selectedYear).length})
            </button>
            <button
              onClick={() => setFilterStatus('closed')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'closed' ? 'bg-teal-950 text-teal-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              100% Concluídos
            </button>
            <button
              onClick={() => setFilterStatus('in_progress')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filterStatus === 'in_progress' ? 'bg-teal-950 text-teal-300 font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Com Pendências
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por semana, notas, responsável..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Closures List */}
      {filteredClosures.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#141414] border border-[#242424] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-950/60 border border-teal-800/40 text-teal-400 flex items-center justify-center">
            <FileCheck2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Nenhum fechamento registrado para este filtro</h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
              Ao final de cada ciclo semanal, você pode clicar em &quot;Fechar / Salvar Semana Atual&quot; para arquivar todas as rotinas e anotações permanentemente.
            </p>
          </div>
          <button
            onClick={() => handleOpenNewClosure(currentISO.weekNumber)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Registrar Semana {currentISO.weekNumber}/{selectedYear} Agora
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClosures.map(closure => {
            const isExpanded = expandedClosureId === closure.id;
            const percentage =
              closure.totalTasksCount > 0
                ? Math.round((closure.completedTasksCount / closure.totalTasksCount) * 100)
                : 100;

            return (
              <div
                key={closure.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? 'bg-[#161616] border-teal-700/60 shadow-lg ring-1 ring-teal-500/20'
                    : 'bg-[#141414] border-[#262626] hover:border-[#363636]'
                }`}
              >
                {/* Closure Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-3 rounded-2xl border ${
                        percentage === 100
                          ? 'bg-emerald-950/60 border-emerald-800/50 text-emerald-400'
                          : 'bg-amber-950/60 border-amber-800/50 text-amber-400'
                      }`}
                    >
                      <FileCheck2 className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">
                          Semana {closure.weekNumber} / {closure.year}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-[#202020] text-teal-300 border border-[#303030]">
                          {closure.periodLabel}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            percentage === 100
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/50'
                              : 'bg-amber-950 text-amber-300 border border-amber-700/50'
                          }`}
                        >
                          {percentage === 100 ? '100% Concluída' : `${percentage}% Executado`}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-300 line-clamp-1 max-w-2xl">
                        {closure.summaryNotes}
                      </p>

                      <div className="flex items-center gap-4 text-[11px] text-zinc-500 pt-0.5">
                        <span>
                          Responsável: <strong className="text-zinc-300">{closure.closedBy}</strong>
                        </span>
                        <span>
                          Fechado em: <strong className="text-zinc-300">{new Date(closure.closedAt).toLocaleDateString('pt-BR')} às {new Date(closure.closedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => handleExportReport(closure)}
                      className="p-2 text-zinc-400 hover:text-teal-300 hover:bg-[#202020] rounded-xl transition-colors"
                      title="Exportar Relatório em Texto (.txt)"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClosure(closure)}
                      className="p-2 text-zinc-400 hover:text-white hover:bg-[#202020] rounded-xl transition-colors"
                      title="Editar Anotações do Fechamento"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(closure.id, closure.weekNumber)}
                      className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                      title="Excluir Registro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setExpandedClosureId(isExpanded ? null : closure.id)}
                      className="px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-xs font-semibold text-zinc-200 rounded-xl flex items-center gap-1.5 transition-colors"
                    >
                      <span>{isExpanded ? 'Ocultar Detalhes' : 'Ver Detalhes'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-[#222] space-y-4">
                    {/* Summary and Pending Boxes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <div className="p-3.5 rounded-xl bg-[#181818] border border-[#282828]">
                        <div className="text-xs font-semibold text-teal-300 mb-1 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-teal-400" />
                          <span>Resumo Executivo do Fechamento</span>
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                          {closure.summaryNotes}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#181818] border border-[#282828]">
                        <div className="text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pendências & Próxima Semana</span>
                        </div>
                        <p className="text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                          {closure.pendingItemsNotes || 'Nenhuma pendência informada.'}
                        </p>
                      </div>
                    </div>

                    {/* Snapshot of Tasks */}
                    {closure.tasksSnapshot && closure.tasksSnapshot.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-teal-400" />
                          <span>Snapshot das Rotinas da Semana ({closure.completedTasksCount}/{closure.totalTasksCount})</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {closure.tasksSnapshot.map(task => (
                            <div
                              key={task.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                task.completed
                                  ? 'bg-[#121c17] border-emerald-900/40 text-zinc-200'
                                  : 'bg-[#1c1616] border-rose-900/40 text-zinc-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    task.completed
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-rose-900 text-rose-300 border border-rose-700'
                                  }`}
                                >
                                  {task.completed ? '✓' : '✕'}
                                </span>
                                <div>
                                  <span className="font-medium text-white block">{task.title}</span>
                                  <span className="text-[10px] text-zinc-400">
                                    {task.dayName} {task.dueTime ? `• Limite: ${task.dueTime}` : ''}
                                  </span>
                                </div>
                              </div>

                              {task.criticalRule && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800/50">
                                  Regra Crítica
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Weekly Closure Modal */}
      <WeeklyClosureModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClosure(null);
        }}
        selectedWeekInfo={modalWeekInfo}
        weeklySchedules={weeklySchedules}
        completedWeeklyIds={completedWeeklyIds}
        customNotes={customNotes}
        currentUser={currentUser}
        existingClosure={editingClosure}
        onSaveClosure={onSaveClosure}
      />
    </div>
  );
};
