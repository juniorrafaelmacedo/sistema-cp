import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  AlertTriangle,
  CreditCard,
  Building,
  ShieldCheck,
  RotateCcw,
  Plus,
  Trash2,
  FileCheck,
  ArrowRight,
  FileCheck2,
  X,
} from 'lucide-react';
import { MonthlyDueItem } from '../types';

interface MonthlyDuesViewProps {
  monthlyDues: MonthlyDueItem[];
  completedMonthlyIds: string[];
  currentDayOfMonth: number;
  onToggleMonthlyItem: (id: string) => void;
  onResetMonthlyChecklist: () => void;
  onAddMonthlyDue?: (item: Omit<MonthlyDueItem, 'id'>) => void;
  onRemoveMonthlyDue?: (id: string) => void;
  onAddMonthlyGuideline?: (dueId: string, guidelineText: string) => void;
  onRemoveMonthlyGuideline?: (dueId: string, stepIndex: number) => void;
}

export const MonthlyDuesView: React.FC<MonthlyDuesViewProps> = ({
  monthlyDues,
  completedMonthlyIds,
  currentDayOfMonth,
  onToggleMonthlyItem,
  onResetMonthlyChecklist,
  onAddMonthlyDue,
  onRemoveMonthlyDue,
  onAddMonthlyGuideline,
  onRemoveMonthlyGuideline,
}) => {
  const [filterRule, setFilterRule] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [inlineGuidelineInputs, setInlineGuidelineInputs] = useState<Record<string, string>>({});
  const [activeInlineFormId, setActiveInlineFormId] = useState<string | null>(null);

  // New Monthly Due Form
  const [newTitle, setNewTitle] = useState('');
  const [newBeneficiary, setNewBeneficiary] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDueRule, setNewDueRule] = useState<'inicio_mes' | '5o_dia_util' | 'dia_20' | 'data_vencimento' | 'custom'>('dia_20');
  const [newDueDisplay, setNewDueDisplay] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState<'boleto' | 'transferencia' | 'debito' | 'outros'>('boleto');
  const [newAlert, setNewAlert] = useState('');
  const [newGuidelines, setNewGuidelines] = useState('');

  const filteredItems = monthlyDues.filter(item => {
    if (filterRule === 'all') return true;
    return item.dueRule === filterRule;
  });

  const handleInlineAddGuideline = (dueId: string) => {
    const text = inlineGuidelineInputs[dueId]?.trim();
    if (!text || !onAddMonthlyGuideline) return;
    onAddMonthlyGuideline(dueId, text);
    setInlineGuidelineInputs(prev => ({ ...prev, [dueId]: '' }));
    setActiveInlineFormId(null);
  };

  const handleCreateDue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !onAddMonthlyDue) return;

    const parsedSteps = newGuidelines
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    onAddMonthlyDue({
      title: newTitle.trim(),
      beneficiary: newBeneficiary.trim() || newTitle.trim(),
      description: newDescription.trim() || 'Vencimento mensal programado',
      dueRule: newDueRule,
      dueDisplay: newDueDisplay.trim() || (newDueRule === 'dia_20' ? 'Dia 20 de cada mês' : 'Data de Vencimento'),
      category: 'outros',
      paymentMethod: newPaymentMethod,
      alert: newAlert.trim() || undefined,
      actionableSteps: parsedSteps.length > 0 ? parsedSteps : ['Conferir valor e lançar no banco para pagamento'],
    });

    setNewTitle('');
    setNewBeneficiary('');
    setNewDescription('');
    setNewDueDisplay('');
    setNewAlert('');
    setNewGuidelines('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#222] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Vencimentos Mensais & Datas Fixas
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-teal-400 border border-teal-900/40 font-mono font-medium">
              Dia atual: {currentDayOfMonth}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950/60 text-teal-300 border border-teal-800/40 font-mono font-medium">
              {monthlyDues.length} Vencimentos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-2xl">
            Acompanhe as datas críticas de vencimento do mês (Início do mês, 5º dia útil, Dia 20 e datas de vencimento).
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onAddMonthlyDue && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Incluir Vencimento</span>
            </button>
          )}

          <button
            onClick={onResetMonthlyChecklist}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#aaa] hover:text-white bg-[#1c1c1c] hover:bg-[#242424] border border-[#2a2a2a] rounded-xl transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Resetar Mês</span>
          </button>
        </div>
      </div>

      {/* Add New Monthly Due Form */}
      {showAddForm && (
        <form
          onSubmit={handleCreateDue}
          className="p-5 sm:p-6 rounded-2xl bg-[#141414] border border-teal-900/50 shadow-md space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-teal-300">Incluir Novo Vencimento Mensal</h4>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#888] hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Obrigação / Despesa *</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="Ex: Condomínio Edifício Matriz"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Beneficiário / Favorecido</label>
              <input
                type="text"
                value={newBeneficiary}
                onChange={e => setNewBeneficiary(e.target.value)}
                placeholder="Ex: Administradora de Imóveis"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Regra de Vencimento</label>
              <select
                value={newDueRule}
                onChange={e => setNewDueRule(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="dia_20">Todo Dia 20</option>
                <option value="5o_dia_util">5º Dia Útil</option>
                <option value="inicio_mes">Início do Mês (1º a 5)</option>
                <option value="data_vencimento">Data Específica de Vencimento</option>
                <option value="custom">Outra Regra</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Exibição da Data / Prazos</label>
              <input
                type="text"
                value={newDueDisplay}
                onChange={e => setNewDueDisplay(e.target.value)}
                placeholder="Ex: Todo dia 20 até 16h"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Forma de Pagamento</label>
              <select
                value={newPaymentMethod}
                onChange={e => setNewPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="boleto">Boleto Bancário</option>
                <option value="transferencia">Transferência / PIX / TED</option>
                <option value="debito">Débito Automático</option>
                <option value="outros">Outros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição</label>
            <textarea
              rows={2}
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              placeholder="Descreva detalhes de conferência, deduções ou particularidades..."
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Alerta Crítico (Opcional)</label>
            <input
              type="text"
              value={newAlert}
              onChange={e => setNewAlert(e.target.value)}
              placeholder="Ex: Requer envio do comprovante na pasta da rede imediatamente"
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">
              Orientações Operacionais (1 por linha)
            </label>
            <textarea
              rows={2}
              value={newGuidelines}
              onChange={e => setNewGuidelines(e.target.value)}
              placeholder="Passo 1: Baixar fatura no portal&#10;Passo 2: Conferir rateio&#10;Passo 3: Salvar comprovante"
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-[#888] hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
            >
              Salvar Vencimento
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setFilterRule('all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterRule === 'all'
              ? 'bg-teal-600 text-white'
              : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
          }`}
        >
          Todos os Vencimentos
        </button>
        <button
          onClick={() => setFilterRule('dia_20')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
            filterRule === 'dia_20'
              ? 'bg-teal-600 text-white'
              : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
          }`}
        >
          <span>Dia 20 (Folha, Condomínio, Serasa)</span>
          {currentDayOfMonth === 20 && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
        </button>
        <button
          onClick={() => setFilterRule('5o_dia_util')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterRule === '5o_dia_util'
              ? 'bg-teal-600 text-white'
              : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
          }`}
        >
          5º Dia Útil (Aluguel Visteon)
        </button>
        <button
          onClick={() => setFilterRule('inicio_mes')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterRule === 'inicio_mes'
              ? 'bg-teal-600 text-white'
              : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
          }`}
        >
          Início do Mês (Cartórios Asterisco)
        </button>
        <button
          onClick={() => setFilterRule('data_vencimento')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filterRule === 'data_vencimento'
              ? 'bg-teal-600 text-white'
              : 'bg-[#181818] text-[#888] hover:text-white hover:bg-[#222]'
          }`}
        >
          Demais Aluguéis, Impostos & Saúde
        </button>
      </div>

      {/* Grid of Monthly Dues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map(item => {
          const isDone = completedMonthlyIds.includes(item.id);
          const isHighlight = item.dueRule === 'dia_20' && currentDayOfMonth === 20;
          const isInlineFormOpen = activeInlineFormId === item.id;
          const steps = item.actionableSteps || [];

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isDone
                  ? 'bg-[#101010] border-[#1e1e1e] opacity-70'
                  : isHighlight
                  ? 'bg-[#191512] border-orange-800/80 ring-1 ring-orange-900/40 shadow-sm'
                  : 'bg-[#141414] border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggleMonthlyItem(item.id)}
                  className="mt-0.5 text-[#666] hover:text-teal-400 shrink-0"
                >
                  {isDone ? (
                    <CheckCircle2 className="w-6 h-6 text-teal-400 fill-teal-950/40" />
                  ) : (
                    <Circle className="w-6 h-6 hover:stroke-teal-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
                    <span className="px-2.5 py-0.5 text-xs font-mono font-medium rounded-lg bg-[#1e1e1e] text-teal-400 border border-teal-900/40">
                      {item.dueDisplay}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#181818] text-[#888] border border-[#262626]">
                        {item.paymentMethod === 'boleto'
                          ? '📄 Boleto Bancário'
                          : item.paymentMethod === 'transferencia'
                          ? '🏦 Transferência'
                          : '💳 Débito / Pagamento'}
                      </span>

                      {onRemoveMonthlyDue && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja excluir o vencimento "${item.title}"?`)) {
                              onRemoveMonthlyDue(item.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
                          title="Excluir Vencimento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className={`text-base font-semibold text-white ${isDone ? 'line-through text-[#666]' : ''}`}>
                    {item.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-[#aaa] mt-1">
                    {item.description}
                  </p>

                  {/* Orientações & Steps for Monthly Item */}
                  <div className="mt-3 p-3 rounded-xl bg-[#0e0e0e] border border-[#202020] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold uppercase tracking-wider text-teal-400/90 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
                        <span>Orientações & Diretrizes ({steps.length})</span>
                      </div>

                      {!isInlineFormOpen && onAddMonthlyGuideline && (
                        <button
                          onClick={() => {
                            setActiveInlineFormId(item.id);
                            setInlineGuidelineInputs(prev => ({ ...prev, [item.id]: '' }));
                          }}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-400 hover:text-teal-300 hover:underline"
                        >
                          <Plus className="w-3 h-3" />
                          <span>+ Incluir Orientação</span>
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
                            {onRemoveMonthlyGuideline && (
                              <button
                                type="button"
                                onClick={() => onRemoveMonthlyGuideline(item.id, sIdx)}
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

                    {isInlineFormOpen && onAddMonthlyGuideline && (
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
                          placeholder="Adicionar orientação para este vencimento mensal..."
                          className="flex-1 px-3 py-1.5 text-xs bg-[#161616] border border-teal-900/60 rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleInlineAddGuideline(item.id)}
                          disabled={!inlineGuidelineInputs[item.id]?.trim()}
                          className="px-3 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-lg"
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

                  {item.alert && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/30 border border-orange-900/30 text-orange-200 text-xs font-medium">
                      <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
                      <span>{item.alert}</span>
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
