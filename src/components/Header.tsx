import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  Search,
  Download,
  Upload,
  RotateCcw,
  Clock,
  ShieldCheck,
  FileText,
  LogOut,
  User,
  ChevronDown,
  Building,
  CalendarDays,
  Languages,
  FileCheck2,
} from 'lucide-react';
import { DayOfWeekKey, UserProfile } from '../types';
import { getISOWeekNumber, getWeekPeriodInfo } from '../utils/weekUtils';

interface HeaderProps {
  todayFormatted: string;
  currentDayKey: DayOfWeekKey;
  currentDayOfMonth: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAiNotesModal: () => void;
  onOpenAiAssistant: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onResetDefaults: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  closureCount?: number;
  currentUser?: UserProfile | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  todayFormatted,
  currentDayKey,
  currentDayOfMonth,
  searchQuery,
  setSearchQuery,
  onOpenAiNotesModal,
  onOpenAiAssistant,
  onExport,
  onImportClick,
  onResetDefaults,
  activeTab,
  setActiveTab,
  closureCount = 0,
  currentUser,
  onLogout,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const currentWeek = useMemo(() => {
    const { weekNumber, year } = getISOWeekNumber(new Date());
    return getWeekPeriodInfo(weekNumber, year);
  }, []);

  const getDayBadge = () => {
    const map: Record<DayOfWeekKey, { label: string; bg: string; text: string }> = {
      seg: { label: 'Segunda-feira • Início da Relação Semanal', bg: 'bg-[#161d24] border-sky-900/40', text: 'text-sky-400' },
      ter: { label: 'Terça-feira • Auditoria Serasa', bg: 'bg-[#14231f] border-teal-900/40', text: 'text-teal-400' },
      qua: { label: 'Quarta-feira • CRÍTICO: Enviar Aprovação de Fornecedores', bg: 'bg-[#261c12] border-orange-900/40', text: 'text-orange-400' },
      qui: { label: 'Quinta-feira • Conferência e Agendamento', bg: 'bg-[#1d192b] border-indigo-900/40', text: 'text-indigo-400' },
      sex: { label: 'Sexta-feira • CRÍTICO: Executar Pagamentos de Fornecedores', bg: 'bg-[#14231f] border-emerald-900/40', text: 'text-emerald-400' },
      sab: { label: 'Sábado • Fechamento de Ciclo', bg: 'bg-[#181818] border-[#2a2a2a]', text: 'text-[#999]' },
      dom: { label: 'Domingo • Fechamento de Ciclo', bg: 'bg-[#181818] border-[#2a2a2a]', text: 'text-[#999]' },
    };
    return map[currentDayKey] || map.seg;
  };

  const dayInfo = getDayBadge();

  return (
    <header className="border-b border-[#222] bg-[#121212] sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              T
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  TreasuryAssist <span className="text-teal-500 font-light text-sm">v1.0</span>
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/50 font-mono font-medium flex items-center gap-1">
                  <CalendarDays className="w-3 h-3 text-teal-400" />
                  Semana {currentWeek.weekNumber} / {currentWeek.year}
                </span>
              </div>
              <p className="text-xs text-[#888] flex items-center gap-1.5 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#666]" />
                <span className="capitalize">{todayFormatted}</span>
                <span className="text-[#444]">•</span>
                <span className="font-mono text-zinc-300">Dia {currentDayOfMonth}</span>
                <span className="text-[#444]">•</span>
                <span className="text-teal-400 font-mono">Ciclo: {currentWeek.formattedShortRange}</span>
              </p>
            </div>
          </div>

          {/* Quick status pill & action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <div className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 ${dayInfo.bg} ${dayInfo.text}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
              {dayInfo.label}
            </div>

            <button
              onClick={onOpenAiNotesModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-500 transition-colors shadow-xs"
              title="Colar novas anotações para o Gemini organizar automaticamente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Inserir com IA</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-[#1a1a1a] text-zinc-200 hover:bg-[#242424] hover:text-white border border-[#2a2a2a] transition-colors"
              title="Tirar dúvidas sobre a rotina e regras"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>Dúvidas / Assistente</span>
            </button>

            {/* User Profile & Logout */}
            {currentUser && (
              <div className="relative border-l border-[#262626] pl-2">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-xl bg-[#181818] hover:bg-[#222] border border-[#2a2a2a] transition-colors text-left"
                  title="Perfil do usuário"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-950 text-teal-300 font-bold flex items-center justify-center text-xs border border-teal-800/40">
                    {currentUser.avatarText || 'US'}
                  </div>
                  <div className="hidden sm:block text-left pr-1">
                    <div className="text-xs font-semibold text-white leading-tight truncate max-w-[130px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-zinc-400 leading-tight truncate max-w-[130px]">
                      {currentUser.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#161616] border border-[#2c2c2c] shadow-2xl p-3 z-50 space-y-2">
                    <div className="p-2 rounded-xl bg-[#1c1c1c] border border-[#282828]">
                      <div className="text-xs font-bold text-white">{currentUser.name}</div>
                      <div className="text-[11px] text-teal-400 truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-zinc-400 mt-1">{currentUser.department}</div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout?.();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium text-rose-300 hover:text-white bg-rose-950/20 hover:bg-rose-900/40 border border-rose-900/30 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sair da Sessão / Trocar</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-1 border-l border-[#262626] pl-2">
              <button
                onClick={onExport}
                className="p-2 text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                title="Fazer Backup / Exportar JSON"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={onImportClick}
                className="p-2 text-[#888] hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
                title="Restaurar / Importar JSON"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={onResetDefaults}
                className="p-2 text-[#888] hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
                title="Restaurar valores padrão originais da empresa"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Navigation Tabs */}
        <div className="pt-2.5 pb-1 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border-t border-[#1f1f1f]">
          <div className="flex items-center flex-wrap gap-1.5 py-1">
            <button
              onClick={() => setActiveTab('hoje')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'hoje'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-teal-400" />
              <span>Painel de Hoje</span>
            </button>

            <button
              onClick={() => setActiveTab('semanal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'semanal'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>Semanal</span>
            </button>

            <button
              onClick={() => setActiveTab('fechamento')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'fechamento'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5 text-teal-400" />
              <span>Fechamentos Semanais</span>
              {closureCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-teal-900 text-teal-200 font-bold border border-teal-700/50">
                  {closureCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('mensal')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'mensal'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
              <span>Vencimentos Mensais</span>
            </button>

            <button
              onClick={() => setActiveTab('regras')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'regras'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Regras & Fornecedores</span>
            </button>

            <button
              onClick={() => setActiveTab('diretorio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'diretorio'
                  ? 'bg-teal-950/80 text-teal-300 border border-teal-600/60 shadow-xs ring-1 ring-teal-500/20'
                  : 'bg-[#151515] text-[#999] hover:bg-[#1f1f1f] hover:text-[#eee] border border-[#252525]'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-teal-400" />
              <span>Pastas & Bancos</span>
            </button>

            <button
              onClick={() => setActiveTab('tipos_despesas')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'tipos_despesas'
                  ? 'bg-gradient-to-r from-teal-950 to-emerald-950 text-teal-200 border border-teal-500 shadow-md ring-1 ring-teal-400/30'
                  : 'bg-[#181d1b] text-teal-300 hover:bg-[#1e2623] hover:text-white border border-teal-900/60'
              }`}
            >
              <Languages className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span>Tipos de Despesas (PT/EN)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-teal-800/80 text-teal-200 font-bold border border-teal-600/40">
                74
              </span>
            </button>
          </div>

          {/* Quick search */}
          <div className="relative w-full xl:w-72 pb-1 xl:pb-0">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666]" />
            <input
              type="text"
              placeholder="Buscar regra, banco, despesa..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#161616] border border-[#282828] rounded-xl text-[#e0e0e0] placeholder-[#666] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-xs text-[#666] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
