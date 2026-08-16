import React, { useState } from 'react';
import {
  Folder,
  CreditCard,
  Users,
  Copy,
  Check,
  Building,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
} from 'lucide-react';
import { BankAccountItem, FolderPathItem, ContactItem } from '../types';

interface DirectoryAndBanksViewProps {
  bankAccounts: BankAccountItem[];
  folderPaths: FolderPathItem[];
  contacts: ContactItem[];
  onAddBankAccount: (item: Omit<BankAccountItem, 'id'>) => void;
  onAddFolderPath: (item: Omit<FolderPathItem, 'id'>) => void;
  onAddContact: (item: Omit<ContactItem, 'id'>) => void;
  onRemoveContact: (id: string) => void;
  onRemoveBankAccount?: (id: string) => void;
  onRemoveFolderPath?: (id: string) => void;
}

export const DirectoryAndBanksView: React.FC<DirectoryAndBanksViewProps> = ({
  bankAccounts,
  folderPaths,
  contacts,
  onAddBankAccount,
  onAddFolderPath,
  onAddContact,
  onRemoveContact,
  onRemoveBankAccount,
  onRemoveFolderPath,
}) => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  // Form toggles
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);

  // Folder form state
  const [folderName, setFolderName] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [folderPurpose, setFolderPurpose] = useState('');
  const [folderParent, setFolderParent] = useState('');

  // Bank form state
  const [bankName, setBankName] = useState('');
  const [bankUnit, setBankUnit] = useState('');
  const [bankAccountNum, setBankAccountNum] = useState('');
  const [bankAgency, setBankAgency] = useState('');
  const [bankPurpose, setBankPurpose] = useState('');
  const [bankAlert, setBankAlert] = useState('');

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [contactUnit, setContactUnit] = useState('');
  const [contactScope, setContactScope] = useState('');
  const [contactNotes, setContactNotes] = useState('');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const handleFolderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim() || !folderPath.trim()) return;
    onAddFolderPath({
      name: folderName.trim(),
      path: folderPath.trim(),
      purpose: folderPurpose.trim() || 'Armazenamento de arquivos da tesouraria',
      parentFolder: folderParent.trim() || 'Rede Principal',
    });
    setFolderName('');
    setFolderPath('');
    setFolderPurpose('');
    setFolderParent('');
    setShowAddFolder(false);
  };

  const handleBankSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !bankAccountNum.trim()) return;
    onAddBankAccount({
      bank: bankName.trim(),
      unit: bankUnit.trim() || 'Matriz / Geral',
      accountNumber: bankAccountNum.trim(),
      agency: bankAgency.trim() || undefined,
      purpose: bankPurpose.trim() || 'Movimentação financeira',
      alert: bankAlert.trim() || undefined,
    });
    setBankName('');
    setBankUnit('');
    setBankAccountNum('');
    setBankAgency('');
    setBankPurpose('');
    setBankAlert('');
    setShowAddBank(false);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactRole.trim()) return;
    onAddContact({
      name: contactName.trim(),
      role: contactRole.trim(),
      unitOrArea: contactUnit.trim() || 'Geral',
      scope: contactScope.trim() || 'Aprovação e alinhamento de pagamentos',
      notes: contactNotes.trim() || undefined,
    });
    setContactName('');
    setContactRole('');
    setContactUnit('');
    setContactScope('');
    setContactNotes('');
    setShowAddContact(false);
  };

  return (
    <div className="space-y-10">
      {/* 1. Network Folders */}
      <section className="space-y-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Pastas Compartilhadas & Estrutura de Rede
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-teal-400 border border-teal-900/40 font-mono font-medium">
                {folderPaths.length} Pastas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#888] mt-1">
              Diretórios oficiais de comprovantes Itaú/Bradesco, notas fiscais, extratos e conciliações.
            </p>
          </div>

          <button
            onClick={() => setShowAddFolder(!showAddFolder)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Incluir Pasta de Rede</span>
          </button>
        </div>

        {/* Add Folder Form */}
        {showAddFolder && (
          <form
            onSubmit={handleFolderSubmit}
            className="p-5 rounded-2xl bg-[#141414] border border-teal-900/50 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-teal-300">Incluir Nova Pasta da Rede</h4>
              <button
                type="button"
                onClick={() => setShowAddFolder(false)}
                className="text-xs text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nome da Pasta *</label>
                <input
                  type="text"
                  required
                  value={folderName}
                  onChange={e => setFolderName(e.target.value)}
                  placeholder="Ex: Comprovantes Itaú 2026"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Área / Pasta Pai</label>
                <input
                  type="text"
                  value={folderParent}
                  onChange={e => setFolderParent(e.target.value)}
                  placeholder="Ex: Contas a Pagar / 2026"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Caminho da Rede (Path) *</label>
              <input
                type="text"
                required
                value={folderPath}
                onChange={e => setFolderPath(e.target.value)}
                placeholder="Ex: \\servidor\financeiro\contas_a_pagar\2026\comprovantes_itau"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white font-mono focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Finalidade / Observações</label>
              <input
                type="text"
                value={folderPurpose}
                onChange={e => setFolderPurpose(e.target.value)}
                placeholder="Ex: Armazenar comprovantes de pagamento diários do Itaú"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFolder(false)}
                className="px-3 py-1.5 text-xs text-[#888] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
              >
                Salvar Pasta
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {folderPaths.map(f => (
            <div
              key={f.id}
              className="p-5 rounded-2xl bg-[#141414] border border-[#222] shadow-sm hover:border-teal-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#1e1e1e] text-zinc-300 border border-[#2a2a2a]">
                    {f.parentFolder || 'Rede'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onRemoveFolderPath && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir a pasta "${f.name}"?`)) {
                            onRemoveFolderPath(f.id);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
                        title="Excluir Pasta"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Folder className="w-4 h-4 text-teal-400" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">{f.name}</h4>
                <p className="text-xs text-[#888] mt-1">{f.purpose}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                <div className="text-xs font-mono text-zinc-200 truncate bg-[#0f0f0f] px-2.5 py-1.5 rounded-lg border border-[#262626] flex-1">
                  {f.path}
                </div>
                <button
                  onClick={() => handleCopy(f.path, f.id)}
                  className="p-2 rounded-lg bg-[#1c1c1c] text-teal-400 hover:bg-[#252525] border border-[#2a2a2a] transition-colors shrink-0"
                  title="Copiar caminho da pasta"
                >
                  {copiedItem === f.id ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Bank Accounts */}
      <section className="space-y-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Contas Bancárias & Dados de Movimentação
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-teal-400 border border-teal-900/40 font-mono font-medium">
                {bankAccounts.length} Contas
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#888] mt-1">
              Contas oficiais de Gravataí, Guarulhos, Bradesco, Itaú e regras de autorização de pagamentos.
            </p>
          </div>

          <button
            onClick={() => setShowAddBank(!showAddBank)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Incluir Conta Bancária</span>
          </button>
        </div>

        {/* Add Bank Form */}
        {showAddBank && (
          <form
            onSubmit={handleBankSubmit}
            className="p-5 rounded-2xl bg-[#141414] border border-teal-900/50 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-teal-300">Incluir Nova Conta Bancária</h4>
              <button
                type="button"
                onClick={() => setShowAddBank(false)}
                className="text-xs text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Banco *</label>
                <input
                  type="text"
                  required
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="Ex: Itaú, Bradesco, Santander"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Unidade / Empresa *</label>
                <input
                  type="text"
                  required
                  value={bankUnit}
                  onChange={e => setBankUnit(e.target.value)}
                  placeholder="Ex: Gravataí, Guarulhos, Holding"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Número da Conta *</label>
                <input
                  type="text"
                  required
                  value={bankAccountNum}
                  onChange={e => setBankAccountNum(e.target.value)}
                  placeholder="Ex: CC 12345-6"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white font-mono focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Finalidade da Conta</label>
                <input
                  type="text"
                  value={bankPurpose}
                  onChange={e => setBankPurpose(e.target.value)}
                  placeholder="Ex: Pagamento exclusivo de folha e tributos"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Alerta Operacional (Opcional)</label>
                <input
                  type="text"
                  value={bankAlert}
                  onChange={e => setBankAlert(e.target.value)}
                  placeholder="Ex: Enviar comprovante até às 16h para Emerson aprovar"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddBank(false)}
                className="px-3 py-1.5 text-xs text-[#888] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
              >
                Salvar Conta
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankAccounts.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-[#141414] border border-[#222] shadow-sm hover:border-teal-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-[#1e1e1e] text-teal-400 border border-teal-900/40">
                    {b.bank}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {onRemoveBankAccount && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja excluir a conta "${b.bank} - ${b.unit}"?`)) {
                            onRemoveBankAccount(b.id);
                          }
                        }}
                        className="p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition-colors"
                        title="Excluir Conta Bancária"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <Building className="w-4 h-4 text-[#666]" />
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white">{b.unit}</h4>
                <p className="text-xs text-[#888] mt-1">{b.purpose}</p>
                {b.alert && (
                  <p className="text-xs text-orange-200 font-medium mt-2 bg-orange-950/30 p-2 rounded-lg border border-orange-900/30">
                    ⚠️ {b.alert}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] text-[#888] uppercase font-mono font-medium">Conta Corrente</div>
                  <div className="text-sm font-mono font-semibold text-white">{b.accountNumber}</div>
                </div>
                <button
                  onClick={() => handleCopy(b.accountNumber, b.id)}
                  className="p-2 rounded-lg bg-[#1c1c1c] text-teal-400 hover:bg-[#252525] border border-[#2a2a2a] transition-colors"
                  title="Copiar número da conta"
                >
                  {copiedItem === b.id ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Operational Key Contacts */}
      <section className="space-y-4">
        <div className="bg-[#141414] p-5 rounded-2xl border border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-400" />
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Responsáveis & Contatos Operacionais
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-teal-400 border border-teal-900/40 font-mono font-medium">
                {contacts.length} Contatos
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#888] mt-1">
              Pessoas-chave para aprovação de contas de consumo, validação de débitos e aprovações de notas fiscais.
            </p>
          </div>

          <button
            onClick={() => setShowAddContact(!showAddContact)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Incluir Novo Contato</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {showAddContact && (
          <form
            onSubmit={handleContactSubmit}
            className="p-5 rounded-2xl bg-[#141414] border border-teal-900/50 shadow-md space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-teal-300">Incluir Novo Contato Operacional</h4>
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="text-xs text-[#888] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Nome do Responsável *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Ex: Kauan, Julia, Emerson"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Cargo / Função *</label>
                <input
                  type="text"
                  required
                  value={contactRole}
                  onChange={e => setContactRole(e.target.value)}
                  placeholder="Ex: Analista de Fornecedores"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">Unidade / Setor</label>
                <input
                  type="text"
                  value={contactUnit}
                  onChange={e => setContactUnit(e.target.value)}
                  placeholder="Ex: Contas a Pagar / Gravataí"
                  className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Escopo de Atuação / Atribuições</label>
              <input
                type="text"
                value={contactScope}
                onChange={e => setContactScope(e.target.value)}
                placeholder="Ex: Alinhamento de notas com deduções e fornecedores com retenção"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Observações ou Ramal / E-mail</label>
              <input
                type="text"
                value={contactNotes}
                onChange={e => setContactNotes(e.target.value)}
                placeholder="Ex: Sempre avisar antes das 15h para liberação no mesmo dia"
                className="w-full px-3 py-2 text-xs bg-[#181818] border border-[#2c2c2c] rounded-xl text-white focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddContact(false)}
                className="px-3 py-1.5 text-xs text-[#888] hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-lg"
              >
                Salvar Contato
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contacts.map(c => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#141414] border border-[#222] shadow-sm hover:border-teal-800/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-full bg-teal-950/50 text-teal-300 font-bold flex items-center justify-center text-sm mb-3 border border-teal-800/50">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm(`Deseja excluir o contato "${c.name}"?`)) {
                        onRemoveContact(c.id);
                      }
                    }}
                    className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Excluir Contato"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
                <h4 className="text-base font-semibold text-white">{c.name}</h4>
                <div className="text-xs font-medium text-teal-400 mt-0.5">{c.role}</div>
                <div className="text-xs text-[#aaa] mt-2">
                  <strong className="text-zinc-200">Escopo:</strong> {c.scope}
                </div>
                {c.notes && (
                  <p className="text-xs text-[#aaa] mt-2 bg-[#0f0f0f] p-2.5 rounded-xl border border-[#222]">
                    💡 {c.notes}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-[#222] flex items-center justify-between">
                <span className="text-xs font-medium text-[#888]">{c.unitOrArea}</span>
                <button
                  onClick={() => handleCopy(`${c.name} - ${c.role}`, c.id)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium inline-flex items-center gap-1"
                >
                  {copiedItem === c.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedItem === c.id ? 'Copiado' : 'Copiar Info'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
