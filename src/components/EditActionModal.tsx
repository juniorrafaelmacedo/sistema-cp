import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit3, Sparkles } from 'lucide-react';
import { DailyRoutineItem } from '../types';

interface EditDailyActionModalProps {
  isOpen: boolean;
  item: DailyRoutineItem | null;
  onClose: () => void;
  onSave: (id: string, updated: Partial<DailyRoutineItem>) => void;
}

export const EditDailyActionModal: React.FC<EditDailyActionModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timing, setTiming] = useState('');
  const [category, setCategory] = useState<'extratos' | 'planilha' | 'pastas' | 'contas' | 'geral'>('geral');
  const [alert, setAlert] = useState('');
  const [quickLinkOrPath, setQuickLinkOrPath] = useState('');
  const [steps, setSteps] = useState<string[]>([]);
  const [newStepText, setNewStepText] = useState('');

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description);
      setTiming(item.timing || '');
      setCategory(item.category || 'geral');
      setAlert(item.alert || '');
      setQuickLinkOrPath(item.quickLinkOrPath || '');
      setSteps(item.actionableSteps ? [...item.actionableSteps] : []);
      setNewStepText('');
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleAddStep = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newStepText.trim()) return;
    setSteps(prev => [...prev, newStepText.trim()]);
    setNewStepText('');
  };

  const handleRemoveStep = (idxToRemove: number) => {
    setSteps(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleStepChange = (idxToChange: number, val: string) => {
    setSteps(prev => prev.map((s, idx) => (idx === idxToChange ? val : s)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave(item.id, {
      title: title.trim(),
      description: description.trim(),
      timing: timing.trim() || undefined,
      category,
      alert: alert.trim() || undefined,
      quickLinkOrPath: quickLinkOrPath.trim() || undefined,
      actionableSteps: steps.filter(s => s.trim().length > 0),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#141414] rounded-3xl max-w-2xl w-full border border-[#262626] shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-[#121212] border-b border-[#222] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-950/60 text-teal-400 border border-teal-900/40">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Editar Ação & Orientações da Rotina
              </h3>
              <p className="text-xs text-[#888]">
                Personalize os passos operacionais, horários e instruções para esta tarefa.
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Título da Ação *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Buscar Extratos & Salvar Comprovantes de Pagamento"
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#181818] border border-[#2a2a2a] rounded-xl text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Horário / Momento</label>
              <input
                type="text"
                value={timing}
                onChange={e => setTiming(e.target.value)}
                placeholder="Ex: Início da manhã (08:00 - 09:00)"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Categoria</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="extratos">Extratos Bancários</option>
                <option value="planilha">Planilhas & Conciliação</option>
                <option value="contas">Contas & Energia</option>
                <option value="pastas">Pastas & Arquivos</option>
                <option value="geral">Geral</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Descrição Geral da Ação</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Explicação do propósito desta ação na rotina..."
              className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
            />
          </div>

          {/* Actionable Steps / Orientações section */}
          <div className="pt-2 border-t border-[#222]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-teal-400">
                Orientações & Passos Operacionais ({steps.length})
              </label>
              <span className="text-[11px] text-[#888]">
                Instruções passo a passo que você precisa seguir
              </span>
            </div>

            {/* Existing Steps List */}
            <div className="space-y-2 mb-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#181818] p-2 rounded-xl border border-[#262626]">
                  <span className="w-5 h-5 rounded-md bg-[#222] text-[#888] text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <input
                    type="text"
                    value={step}
                    onChange={e => handleStepChange(idx, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="text-[#666] hover:text-rose-400 p-1 shrink-0 transition-colors"
                    title="Remover orientação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {steps.length === 0 && (
                <p className="text-xs text-[#666] italic py-1">
                  Nenhuma orientação detalhada cadastrada. Adicione abaixo.
                </p>
              )}
            </div>

            {/* Add New Step Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newStepText}
                onChange={e => setNewStepText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddStep();
                  }
                }}
                placeholder="Ex: Salvar os comprovantes de pagamento do Itaú na pasta da rede..."
                className="flex-1 px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-xl text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleAddStep()}
                disabled={!newStepText.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#222]">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Alerta Especial (Opcional)</label>
              <input
                type="text"
                value={alert}
                onChange={e => setAlert(e.target.value)}
                placeholder="Ex: Ação diária e prioritária"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Caminho / Pasta de Rede</label>
              <input
                type="text"
                value={quickLinkOrPath}
                onChange={e => setQuickLinkOrPath(e.target.value)}
                placeholder="Ex: Contas a Pagar / 2026 / Comprovantes"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666] focus:border-teal-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#222]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#888] hover:text-white rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs sm:text-sm font-medium bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-xs transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
