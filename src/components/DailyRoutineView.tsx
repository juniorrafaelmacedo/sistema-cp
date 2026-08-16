import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Folder,
  Copy,
  Check,
  Plus,
  Trash2,
  RotateCcw,
  Edit2,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck2,
} from 'lucide-react';
import { DailyRoutineItem } from '../types';
import { EditDailyActionModal } from './EditActionModal';

interface DailyRoutineViewProps {
  dailyRoutines: DailyRoutineItem[];
  completedDailyIds: string[];
  onToggleItem: (id: string) => void;
  onResetChecklist: () => void;
  onAddNewDailyItem: (item: Omit<DailyRoutineItem, 'id' | 'order'>) => void;
  onDeleteItem: (id: string) => void;
  onAddGuideline: (routineId: string, guidelineText: string) => void;
  onRemoveGuideline: (routineId: string, stepIndex: number) => void;
  onEditGuideline: (routineId: string, stepIndex: number, newText: string) => void;
  onUpdateRoutine: (id: string, updated: Partial<DailyRoutineItem>) => void;
}

export const DailyRoutineView: React.FC<DailyRoutineViewProps> = ({
  dailyRoutines,
  completedDailyIds,
  onToggleItem,
  onResetChecklist,
  onAddNewDailyItem,
  onDeleteItem,
  onAddGuideline,
  onRemoveGuideline,
  onEditGuideline,
  onUpdateRoutine,
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTiming, setNewTiming] = useState('Manhã (08:00)');
  const [newCategory, setNewCategory] = useState<'extratos' | 'planilha' | 'pastas' | 'contas' | 'geral'>('geral');
  const [newAlert, setNewAlert] = useState('');
  const [newPath, setNewPath] = useState('');
  const [customSteps, setCustomSteps] = useState<string[]>([]);
  const [customStepInput, setCustomStepInput] = useState('');

  // Active inline guideline inputs per card: { [routineId]: string }
  const [inlineGuidelineInputs, setInlineGuidelineInputs] = useState<Record<string, string>>({});
  const [activeInlineFormId, setActiveInlineFormId] = useState<string | null>(null);

  // Active editing guideline: { routineId: string, stepIndex: number, text: string } | null
  const [editingGuideline, setEditingGuideline] = useState<{
    routineId: string;
    stepIndex: number;
    text: string;
  } | null>(null);

  // Full action edit modal state
  const [editingItem, setEditingItem] = useState<DailyRoutineItem | null>(null);

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleAddCustomStep = () => {
    if (!customStepInput.trim()) return;
    setCustomSteps(prev => [...prev, customStepInput.trim()]);
    setCustomStepInput('');
  };

  const handleRemoveCustomStep = (idxToRemove: number) => {
    setCustomSteps(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddNewDailyItem({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Tarefa da rotina matinal',
      timing: newTiming.trim() || 'Manhã',
      category: newCategory,
      alert: newAlert.trim() || undefined,
      quickLinkOrPath: newPath.trim() || undefined,
      actionableSteps: customSteps.length > 0 ? customSteps : undefined,
    });

    setNewTitle('');
    setNewDesc('');
    setNewAlert('');
    setNewPath('');
    setCustomSteps([]);
    setCustomStepInput('');
    setIsAddingCustom(false);
  };

  const handleInlineAddGuideline = (routineId: string) => {
    const text = inlineGuidelineInputs[routineId]?.trim();
    if (!text) return;
    onAddGuideline(routineId, text);
    setInlineGuidelineInputs(prev => ({ ...prev, [routineId]: '' }));
    setActiveInlineFormId(null);
  };

  const handleSaveEditedGuideline = () => {
    if (!editingGuideline || !editingGuideline.text.trim()) return;
    onEditGuideline(editingGuideline.routineId, editingGuideline.stepIndex, editingGuideline.text.trim());
    setEditingGuideline(null);
  };

  const completedCount = completedDailyIds.length;
  const totalCount = dailyRoutines.length;

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-[#141414] p-5 rounded-2xl border border-[#222] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Rotina Matinal & Passo a Passo Diário
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-[#1e1e1e] text-teal-400 border border-teal-900/40">
              {completedCount} de {totalCount} concluídos
            </span>
          </div>
          <p className="text-xs text-[#888] mt-1">
            Execute estas tarefas todos os dias na sequência recomendada. Você pode incluir novas orientações detalhadas em qualquer ação a qualquer momento.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onResetChecklist}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#aaa] hover:text-white bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] rounded-xl transition-colors"
            title="Desmarcar todas as tarefas diárias para recomeçar o dia"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Dia</span>
          </button>

          <button
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Incluir Tarefa Diária</span>
          </button>
        </div>
      </div>

      {/* Form to add custom daily task */}
      {isAddingCustom && (
        <form
          onSubmit={handleCreateSubmit}
          className="bg-[#141414] p-5 sm:p-6 rounded-2xl border border-teal-900/40 shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-teal-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Adicionar Nova Tarefa à Rotina Diária</span>
            </h4>
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="text-xs text-[#666] hover:text-white"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Tarefa *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Salvar comprovantes Itaú e emitir extratos"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Horário / Momento</label>
              <input
                type="text"
                value={newTiming}
                onChange={e => setNewTiming(e.target.value)}
                placeholder="Ex: 08:30 - Manhã"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Instruções / Descrição Geral</label>
            <textarea
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              placeholder="Descreva o propósito geral da tarefa..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* New custom task - Orientações / Steps list */}
          <div className="p-3.5 rounded-xl bg-[#181818] border border-[#262626] space-y-2.5">
            <label className="block text-xs font-semibold text-teal-400">
              Orientações & Passos Operacionais Desta Tarefa
            </label>
            
            {customSteps.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {customSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-[#202020] px-3 py-1.5 rounded-lg border border-[#2e2e2e]">
                    <span className="text-teal-400 font-mono text-[11px] font-bold">{idx + 1}.</span>
                    <span className="text-xs text-zinc-200 flex-1">{step}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomStep(idx)}
                      className="text-[#666] hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customStepInput}
                onChange={e => setCustomStepInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomStep();
                  }
                }}
                placeholder="Adicionar orientação (ex: Salvar os comprovantes de pagamento do Itaú)..."
                className="flex-1 px-3 py-1.5 text-xs bg-[#121212] border border-[#2e2e2e] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomStep}
                disabled={!customStepInput.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg transition-colors"
              >
                + Adicionar Passo
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Categoria</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="extratos">Extratos Bancários</option>
                <option value="planilha">Planilhas & Conciliação</option>
                <option value="contas">Contas & Energia</option>
                <option value="pastas">Pastas & Arquivos</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Alerta Especial (Opcional)</label>
              <input
                type="text"
                value={newAlert}
                onChange={e => setNewAlert(e.target.value)}
                placeholder="Ex: Não fechar sem autorização"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-3 py-1.5 text-xs text-[#888] hover:text-white rounded-lg font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-lg shadow-xs"
            >
              Salvar Tarefa Diária
            </button>
          </div>
        </form>
      )}

      {/* Routine Cards List (Step by Step) */}
      <div className="space-y-4">
        {dailyRoutines
          .sort((a, b) => a.order - b.order)
          .map((item, index) => {
            const isCompleted = completedDailyIds.includes(item.id);
            const isInlineFormOpen = activeInlineFormId === item.id;
            const steps = item.actionableSteps || [];

            return (
              <div
                key={item.id}
                className={`group p-5 rounded-2xl border transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#101010] border-[#1e1e1e] opacity-75'
                    : 'bg-[#141414] border-[#222] hover:border-teal-800/50 hover:bg-[#161616]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Checkbox button */}
                  <button
                    onClick={() => onToggleItem(item.id)}
                    className="mt-0.5 shrink-0 text-[#666] hover:text-teal-400 focus:outline-none transition-colors"
                    title={isCompleted ? 'Desmarcar tarefa concluída' : 'Marcar tarefa como concluída'}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-teal-400 fill-teal-950/40" />
                    ) : (
                      <Circle className="w-6 h-6 hover:stroke-teal-400" />
                    )}
                  </button>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-[#1e1e1e] text-teal-400 text-xs font-mono font-bold flex items-center justify-center border border-teal-900/30">
                          {index + 1}
                        </span>
                        <h4
                          className={`text-sm sm:text-base font-semibold text-white ${
                            isCompleted ? 'line-through text-[#666]' : ''
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.timing && (
                          <span className="text-xs px-2.5 py-1 rounded-md bg-[#1a1a1a] text-zinc-300 font-mono font-medium flex items-center gap-1 border border-[#262626]">
                            <Clock className="w-3 h-3 text-teal-400" />
                            {item.timing}
                          </span>
                        )}

                        {/* Edit Action Button */}
                        <button
                          onClick={() => setEditingItem(item)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-300 hover:text-white bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] rounded-lg transition-colors"
                          title="Editar ação e detalhes"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja excluir a tarefa "${item.title}" da sua rotina?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#2a2a2a] hover:border-rose-900/50 rounded-lg transition-colors"
                          title="Excluir tarefa"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Excluir</span>
                        </button>
                      </div>
                    </div>

                    <p className={`text-xs sm:text-sm text-[#aaa] mt-1.5 ${isCompleted ? 'text-[#555]' : ''}`}>
                      {item.description}
                    </p>

                    {/* Actionable Steps / Orientações section */}
                    <div className="mt-3.5 p-3.5 rounded-xl bg-[#0e0e0e] border border-[#202020] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center gap-1.5">
                          <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                          <span>Orientações & Diretrizes ({steps.length})</span>
                        </div>

                        {!isInlineFormOpen && (
                          <button
                            onClick={() => {
                              setActiveInlineFormId(item.id);
                              setInlineGuidelineInputs(prev => ({ ...prev, [item.id]: '' }));
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-400 hover:text-teal-300 hover:underline transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                            <span>+ Adicionar Orientação</span>
                          </button>
                        )}
                      </div>

                      {/* Steps List */}
                      {steps.length > 0 ? (
                        <div className="space-y-1.5">
                          {steps.map((step, sIdx) => {
                            const isEditingThis =
                              editingGuideline?.routineId === item.id &&
                              editingGuideline?.stepIndex === sIdx;

                            return (
                              <div
                                key={sIdx}
                                className="group/step flex items-start gap-2.5 p-2 rounded-lg bg-[#141414] hover:bg-[#181818] border border-[#222] transition-colors"
                              >
                                <span className="text-teal-400/70 font-mono text-[11px] font-bold mt-0.5 shrink-0">
                                  {sIdx + 1}.
                                </span>

                                {isEditingThis ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      autoFocus
                                      value={editingGuideline.text}
                                      onChange={e =>
                                        setEditingGuideline(prev =>
                                          prev ? { ...prev, text: e.target.value } : null
                                        )
                                      }
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') handleSaveEditedGuideline();
                                        if (e.key === 'Escape') setEditingGuideline(null);
                                      }}
                                      className="flex-1 px-2 py-1 text-xs bg-[#0d0d0d] border border-teal-600 rounded text-white focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={handleSaveEditedGuideline}
                                      className="px-2 py-1 text-[11px] font-medium bg-teal-600 text-white rounded hover:bg-teal-500"
                                    >
                                      Salvar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingGuideline(null)}
                                      className="px-2 py-1 text-[11px] text-[#888] hover:text-white"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs text-zinc-200 flex-1 leading-relaxed">
                                      {step}
                                    </span>
                                    <div className="opacity-0 group-hover/step:opacity-100 flex items-center gap-1 shrink-0 transition-opacity">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setEditingGuideline({
                                            routineId: item.id,
                                            stepIndex: sIdx,
                                            text: step,
                                          })
                                        }
                                        className="text-[#777] hover:text-teal-400 p-1 transition-colors"
                                        title="Editar esta orientação"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => onRemoveGuideline(item.id, sIdx)}
                                        className="text-[#777] hover:text-rose-400 p-1 transition-colors"
                                        title="Remover esta orientação"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#666] italic py-0.5">
                          Nenhuma orientação detalhada ainda. Clique em "+ Adicionar Orientação" para incluir.
                        </p>
                      )}

                      {/* Inline quick-add form */}
                      {isInlineFormOpen && (
                        <div className="pt-2 border-t border-[#1e1e1e] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
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
                              if (e.key === 'Escape') {
                                setActiveInlineFormId(null);
                              }
                            }}
                            placeholder="Ex: Salvar os comprovantes de pagamento do Itaú na pasta da rede..."
                            className="flex-1 px-3 py-1.5 text-xs bg-[#161616] border border-teal-900/60 rounded-xl text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              type="button"
                              onClick={() => handleInlineAddGuideline(item.id)}
                              disabled={!inlineGuidelineInputs[item.id]?.trim()}
                              className="px-3 py-1.5 text-xs font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl transition-colors shadow-xs"
                            >
                              Adicionar
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveInlineFormId(null)}
                              className="px-2.5 py-1.5 text-xs font-medium text-[#888] hover:text-white rounded-xl transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Alert pill if exists */}
                    {item.alert && (
                      <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-900/30 text-orange-300 text-xs font-medium">
                        <AlertCircle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                        <span>{item.alert}</span>
                      </div>
                    )}

                    {/* Quick copy path */}
                    {item.quickLinkOrPath && (
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#181818] border border-[#282828] text-zinc-200 text-xs font-mono">
                          <Folder className="w-3 h-3 text-teal-400" />
                          <span>{item.quickLinkOrPath}</span>
                        </div>
                        <button
                          onClick={() => handleCopyPath(item.quickLinkOrPath!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-teal-400 hover:bg-[#202020] rounded-md transition-colors"
                        >
                          {copiedPath === item.quickLinkOrPath ? (
                            <>
                              <Check className="w-3 h-3 text-teal-400" />
                              <span className="text-teal-400">Copiado</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copiar Caminho</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Full edit modal for any daily routine item */}
      <EditDailyActionModal
        isOpen={!!editingItem}
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={(id, updated) => {
          onUpdateRoutine(id, updated);
        }}
      />
    </div>
  );
};
