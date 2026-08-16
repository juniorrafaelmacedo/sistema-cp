import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  FileText,
  UserCheck,
  Search,
  Plus,
  Trash2,
  Tag,
  Zap,
  FileCheck2,
} from 'lucide-react';
import { SpecialRuleItem } from '../types';

interface SpecialRulesViewProps {
  specialRules: SpecialRuleItem[];
  onAddSpecialRule: (rule: Omit<SpecialRuleItem, 'id'>) => void;
  onRemoveSpecialRule: (id: string) => void;
}

export const SpecialRulesView: React.FC<SpecialRulesViewProps> = ({
  specialRules,
  onAddSpecialRule,
  onRemoveSpecialRule,
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [entityName, setEntityName] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [actionRequired, setActionRequired] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [severity, setSeverity] = useState<'high' | 'medium' | 'low'>('high');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entityName.trim() || !title.trim()) return;

    onAddSpecialRule({
      entityName: entityName.trim(),
      title: title.trim(),
      description: description.trim() || 'Regra de pagamento especial',
      actionRequired: actionRequired.trim() || 'Verificar antes de pagar',
      severity,
      contactPerson: contactPerson.trim() || undefined,
      category: 'outros',
      tags: [entityName.trim(), 'Regra Especial'],
    });

    setEntityName('');
    setTitle('');
    setDescription('');
    setActionRequired('');
    setContactPerson('');
    setIsAdding(false);
  };

  const filteredRules = specialRules.filter(r => {
    const q = searchFilter.toLowerCase();
    return (
      r.entityName.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.tags.some(t => t.toLowerCase().includes(q)) ||
      (r.contactPerson && r.contactPerson.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#141414] p-5 sm:p-6 rounded-2xl border border-[#222] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white tracking-tight">
              Manual de Regras & Fornecedores Especiais
            </h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950/40 text-rose-300 border border-rose-900/40 font-mono font-medium flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" />
              {specialRules.length} Regras Cadastradas
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#888] mt-1 max-w-3xl">
            Consulte sempre antes de programar ou liberar qualquer pagamento para evitar erros fiscais, pagamentos indevidos de NFs com ND aberta ou sem carta de garantia.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Incluir Nova Regra</span>
        </button>
      </div>

      {/* Search Input for Rules */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#666]" />
        <input
          type="text"
          placeholder="Pesquisar por fornecedor (Welcon, Cemas, Kauan, Adiantamento, Boletos...)"
          value={searchFilter}
          onChange={e => setSearchFilter(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#141414] border border-[#222] rounded-xl text-white placeholder-[#666] focus:outline-none focus:border-teal-500"
        />
      </div>

      {/* Add New Rule Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="bg-[#141414] p-5 rounded-2xl border border-teal-900/40 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-teal-300">Cadastrar Nova Regra de Fornecedor / Pagamento</h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-xs text-[#666] hover:text-white"
            >
              ✕ Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Fornecedor / Entidade *</label>
              <input
                type="text"
                required
                value={entityName}
                onChange={e => setEntityName(e.target.value)}
                placeholder="Ex: Fornecedor XYZ"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Regra *</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ex: Exigir retenção de ISS ou aprovação do gestor"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição Completa</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explique detalhadamente o porquê desta regra..."
              rows={2}
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-300 mb-1">Ação Obrigatória do Operador</label>
              <input
                type="text"
                value={actionRequired}
                onChange={e => setActionRequired(e.target.value)}
                placeholder="Ex: Não pagar sem conferir planilha de deduções"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Contato Responsável (Se houver)</label>
              <input
                type="text"
                value={contactPerson}
                onChange={e => setContactPerson(e.target.value)}
                placeholder="Ex: Kauan, Emerson"
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
              Salvar Regra
            </button>
          </div>
        </form>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map(rule => {
          const isHigh = rule.severity === 'high';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all ${
                isHigh
                  ? 'bg-[#151210] border-orange-900/40 shadow-sm hover:border-orange-800/60'
                  : 'bg-[#141414] border-[#222] hover:border-[#333]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-xs font-mono font-medium rounded-lg ${
                      isHigh
                        ? 'bg-orange-950/50 text-orange-300 border border-orange-900/40'
                        : 'bg-[#1e1e1e] text-zinc-200 border border-[#2a2a2a]'
                    }`}
                  >
                    {rule.entityName}
                  </span>
                  {rule.contactPerson && (
                    <span className="px-2 py-0.5 text-xs font-medium rounded-md bg-[#1a1a1a] text-teal-400 border border-[#262626] flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-teal-400" />
                      {rule.contactPerson}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Deseja excluir a regra "${rule.title}" de ${rule.entityName}?`)) {
                      onRemoveSpecialRule(rule.id);
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 border border-[#2a2a2a] hover:border-rose-900/50 rounded-lg transition-colors"
                  title="Excluir regra"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Excluir</span>
                </button>
              </div>

              <h4 className="text-base font-semibold text-white leading-snug">
                {rule.title}
              </h4>

              <p className="text-xs sm:text-sm text-[#aaa] mt-2">
                {rule.description}
              </p>

              {/* Action Required Box */}
              <div className="mt-3 p-3 rounded-xl bg-[#0f0f0f] border border-[#222] text-xs">
                <div className="font-semibold text-zinc-300 flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span>Ação Obrigatória do Operador:</span>
                </div>
                <p className="text-orange-200/90 font-medium">{rule.actionRequired}</p>
              </div>

              {/* Tags */}
              {rule.tags && rule.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {rule.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="px-2 py-0.5 text-xs rounded-md bg-[#1a1a1a] text-[#888] font-medium border border-[#262626]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
