import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  Check,
  Languages,
  BookOpen,
  Filter,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { ExpenseTypeItem } from '../types';

interface ExpenseTypesViewProps {
  expenseTypes: ExpenseTypeItem[];
  onAddExpenseType: (item: Omit<ExpenseTypeItem, 'id'>) => void;
  onUpdateExpenseType: (id: string, updated: Partial<ExpenseTypeItem>) => void;
  onRemoveExpenseType: (id: string) => void;
  onResetToDefault: () => void;
}

export const ExpenseTypesView: React.FC<ExpenseTypesViewProps> = ({
  expenseTypes = [],
  onAddExpenseType,
  onUpdateExpenseType,
  onRemoveExpenseType,
  onResetToDefault,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [copiedId, setCopiedId] = useState<{ id: string; lang: 'en' | 'pt' } | null>(null);

  // Add / Edit Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseTypeItem | null>(null);

  // Form State
  const [formCategoryEn, setFormCategoryEn] = useState('');
  const [formCategoryPt, setFormCategoryPt] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formMacroGroup, setFormMacroGroup] = useState('Fornecedores & Materiais');

  // Extract unique macro groups
  const macroGroups = useMemo(() => {
    const groups = new Set<string>();
    expenseTypes.forEach(e => {
      if (e.macroGroup) groups.add(e.macroGroup);
    });
    return Array.from(groups).sort();
  }, [expenseTypes]);

  // Filtered expense types
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return expenseTypes.filter(item => {
      const matchSearch =
        !term ||
        item.categoryEn.toLowerCase().includes(term) ||
        item.categoryPt.toLowerCase().includes(term) ||
        item.description.toLowerCase().includes(term) ||
        (item.macroGroup && item.macroGroup.toLowerCase().includes(term));

      const matchGroup = selectedGroup === 'all' || item.macroGroup === selectedGroup;

      return matchSearch && matchGroup;
    });
  }, [expenseTypes, searchTerm, selectedGroup]);

  // Copy to clipboard helper
  const handleCopy = (id: string, text: string, lang: 'en' | 'pt') => {
    navigator.clipboard.writeText(text);
    setCopiedId({ id, lang });
    setTimeout(() => {
      setCopiedId(null);
    }, 1800);
  };

  // Open Edit
  const handleStartEdit = (item: ExpenseTypeItem) => {
    setEditingItem(item);
    setFormCategoryEn(item.categoryEn);
    setFormCategoryPt(item.categoryPt);
    setFormDescription(item.description);
    setFormMacroGroup(item.macroGroup || 'Outros');
    setIsAddModalOpen(true);
  };

  // Open Add
  const handleStartAdd = () => {
    setEditingItem(null);
    setFormCategoryEn('');
    setFormCategoryPt('');
    setFormDescription('');
    setFormMacroGroup('Fornecedores & Materiais');
    setIsAddModalOpen(true);
  };

  // Save Add/Edit
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategoryEn.trim() || !formCategoryPt.trim()) return;

    if (editingItem) {
      onUpdateExpenseType(editingItem.id, {
        categoryEn: formCategoryEn.trim(),
        categoryPt: formCategoryPt.trim(),
        description: formDescription.trim(),
        macroGroup: formMacroGroup.trim() || undefined,
      });
    } else {
      onAddExpenseType({
        categoryEn: formCategoryEn.trim(),
        categoryPt: formCategoryPt.trim(),
        description: formDescription.trim(),
        macroGroup: formMacroGroup.trim() || 'Outros',
      });
    }

    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Categoria em Inglês', 'Português', 'Descrição', 'Macro-Grupo'];
    const rows = filteredList.map(item => [
      `"${item.categoryEn.replace(/"/g, '""')}"`,
      `"${item.categoryPt.replace(/"/g, '""')}"`,
      `"${item.description.replace(/"/g, '""')}"`,
      `"${(item.macroGroup || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tipos_de_despesas_pt_en_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#141414] via-[#161a18] to-[#141414] border border-teal-900/50 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/60 font-mono flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-teal-400" />
                GLOSSÁRIO & PLANO DE CONTAS BILÍNGUE
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-zinc-300 border border-[#333]">
                {expenseTypes.length} Categorias Cadastradas
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Tipos de Despesas <span className="text-teal-400 text-lg font-medium">(Inglês & Português)</span>
            </h2>

            <p className="text-xs sm:text-sm text-zinc-300 mt-1 max-w-3xl">
              Consulte, pesquise, edite e copie com 1 clique a categorização contábil e de contas a pagar para conciliação bancária, lançamento de provisão e relatórios executivos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:text-white bg-[#1a1a1a] hover:bg-[#242424] border border-[#2e2e2e] rounded-xl transition-colors shadow-xs"
              title="Exportar tabela atual para CSV / Excel"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={onResetToDefault}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 bg-[#161616] hover:bg-[#202020] border border-[#282828] rounded-xl transition-colors"
              title="Restaurar os 74 tipos de despesas padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              onClick={handleStartAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Nova Categoria</span>
            </button>
          </div>
        </div>

        {/* Quick Search & Filters Bar */}
        <div className="mt-5 pt-4 border-t border-teal-900/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar em inglês, português ou descrição (ex: Utilities, Locação, Cloud)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#111] border border-[#2a2a2a] focus:border-teal-500 rounded-xl text-white placeholder-zinc-500 focus:outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-200"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <span className="text-xs text-zinc-400">Exibição:</span>
            <div className="flex items-center bg-[#111] border border-[#2a2a2a] p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-teal-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Tabela
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-teal-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Cartões
              </button>
            </div>
          </div>
        </div>

        {/* Macro Group Filter Pills */}
        <div className="mt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedGroup === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            Todos ({expenseTypes.length})
          </button>
          {macroGroups.map(group => {
            const count = expenseTypes.filter(e => e.macroGroup === group).length;
            const isSelected = selectedGroup === group;
            return (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-[#181818] text-zinc-400 hover:text-white hover:bg-[#222]'
                }`}
              >
                <span>{group}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                  isSelected ? 'bg-teal-700 text-white' : 'bg-[#262626] text-zinc-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Feedback */}
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <div>
          Mostrando <strong className="text-white font-mono">{filteredList.length}</strong> de {expenseTypes.length} categorias
          {searchTerm && (
            <span> correspondentes ao termo &quot;{searchTerm}&quot;</span>
          )}
          {selectedGroup !== 'all' && (
            <span> no grupo &quot;{selectedGroup}&quot;</span>
          )}
        </div>
      </div>

      {/* View: Table */}
      {viewMode === 'table' ? (
        <div className="bg-[#141414] rounded-2xl border border-[#242424] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#181818] text-zinc-400 font-semibold border-b border-[#242424] uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 font-mono">Categoria em Inglês (EN)</th>
                  <th className="py-3.5 px-4 font-mono">Português (PT-BR)</th>
                  <th className="py-3.5 px-4">Descrição / Aplicação Prática</th>
                  <th className="py-3.5 px-4">Grupo</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f1f]">
                {filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-500">
                      Nenhuma categoria de despesa encontrada para os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => {
                    const isCopiedEn = copiedId?.id === item.id && copiedId?.lang === 'en';
                    const isCopiedPt = copiedId?.id === item.id && copiedId?.lang === 'pt';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-[#181818]/70 transition-colors group"
                      >
                        {/* English Category */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <span className="font-semibold text-white font-mono tracking-tight block">
                                {item.categoryEn}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(item.id, item.categoryEn, 'en')}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-teal-300 hover:bg-[#252525] rounded transition-all"
                              title="Copiar nome em inglês"
                            >
                              {isCopiedEn ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {isCopiedEn && (
                            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                              Copiado EN!
                            </span>
                          )}
                        </td>

                        {/* Portuguese Category */}
                        <td className="py-3.5 px-4 align-top">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              <span className="font-semibold text-teal-300 block">
                                {item.categoryPt}
                              </span>
                            </div>
                            <button
                              onClick={() => handleCopy(item.id, item.categoryPt, 'pt')}
                              className="opacity-0 group-hover:opacity-100 p-1 text-zinc-400 hover:text-teal-300 hover:bg-[#252525] rounded transition-all"
                              title="Copiar nome em português"
                            >
                              {isCopiedPt ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {isCopiedPt && (
                            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
                              Copiado PT!
                            </span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="py-3.5 px-4 text-zinc-300 text-xs align-top leading-relaxed max-w-md">
                          {item.description}
                        </td>

                        {/* Macro Group Badge */}
                        <td className="py-3.5 px-4 align-top whitespace-nowrap">
                          {item.macroGroup && (
                            <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#1e1e1e] text-zinc-300 border border-[#2b2b2b]">
                              {item.macroGroup}
                            </span>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 text-zinc-400 hover:text-teal-300 hover:bg-[#222] rounded-lg transition-colors"
                              title="Editar Categoria"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Deseja remover a categoria "${item.categoryPt} / ${item.categoryEn}"?`)) {
                                  onRemoveExpenseType(item.id);
                                }
                              }}
                              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="Remover Categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* View: Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500 bg-[#141414] rounded-2xl border border-[#242424]">
              Nenhuma categoria de despesa encontrada.
            </div>
          ) : (
            filteredList.map(item => {
              const isCopiedEn = copiedId?.id === item.id && copiedId?.lang === 'en';
              const isCopiedPt = copiedId?.id === item.id && copiedId?.lang === 'pt';

              return (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl bg-[#141414] border border-[#242424] hover:border-[#333] transition-all flex flex-col justify-between group shadow-xs space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      {item.macroGroup && (
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-medium bg-[#1e1e1e] text-zinc-300 border border-[#2e2e2e]">
                          {item.macroGroup}
                        </span>
                      )}

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStartEdit(item)}
                          className="p-1 text-zinc-400 hover:text-teal-300 hover:bg-[#222] rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Deseja remover a categoria "${item.categoryPt}"?`)) {
                              onRemoveExpenseType(item.id);
                            }
                          }}
                          className="p-1 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded transition-colors"
                          title="Remover"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Titles */}
                    <div>
                      <div className="text-[11px] uppercase font-bold tracking-wider text-teal-400">
                        Português (PT-BR)
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <h4 className="text-base font-semibold text-white">
                          {item.categoryPt}
                        </h4>
                        <button
                          onClick={() => handleCopy(item.id, item.categoryPt, 'pt')}
                          className="px-2 py-0.5 text-[10px] font-medium text-teal-300 hover:text-white bg-teal-950/40 hover:bg-teal-900/50 border border-teal-800/40 rounded transition-all flex items-center gap-1"
                        >
                          {isCopiedPt ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedPt ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#1e1e1e]">
                      <div className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 font-mono">
                        English (EN)
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <div className="text-sm font-medium text-zinc-200 font-mono">
                          {item.categoryEn}
                        </div>
                        <button
                          onClick={() => handleCopy(item.id, item.categoryEn, 'en')}
                          className="px-2 py-0.5 text-[10px] font-medium text-zinc-300 hover:text-white bg-[#1a1a1a] hover:bg-[#252525] border border-[#2e2e2e] rounded transition-all flex items-center gap-1"
                        >
                          {isCopiedEn ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopiedEn ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="pt-2 border-t border-[#1e1e1e]">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-6 relative">
            <div className="flex items-center justify-between border-b border-[#222] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingItem ? 'Editar Tipo de Despesa' : 'Novo Tipo de Despesa'}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure o termo em inglês, português e a descrição de lançamento.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Categoria em Inglês (EN) *
                </label>
                <input
                  type="text"
                  required
                  value={formCategoryEn}
                  onChange={e => setFormCategoryEn(e.target.value)}
                  placeholder="Ex: Cloud Services / Software Licenses"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Português (PT-BR) *
                </label>
                <input
                  type="text"
                  required
                  value={formCategoryPt}
                  onChange={e => setFormCategoryPt(e.target.value)}
                  placeholder="Ex: Serviços de computação em nuvem"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Macro-Grupo Contábil / Operacional
                </label>
                <input
                  type="text"
                  value={formMacroGroup}
                  onChange={e => setFormMacroGroup(e.target.value)}
                  placeholder="Ex: Tecnologia & TI, Fornecedores & Materiais, etc."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Descrição & Exemplos de Lançamento
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Descreva o que deve ser lançado nesta categoria para orientar a equipe..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1a1a1a] border border-[#2e2e2e] rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition-colors"
                >
                  {editingItem ? 'Salvar Alterações' : 'Cadastrar Categoria'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
