import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useFinancialStore } from './hooks/useFinancialStore';
import { Header } from './components/Header';
import { TodayFocusBanner } from './components/TodayFocusBanner';
import { DailyRoutineView } from './components/DailyRoutineView';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { MonthlyDuesView } from './components/MonthlyDuesView';
import { SpecialRulesView } from './components/SpecialRulesView';
import { DirectoryAndBanksView } from './components/DirectoryAndBanksView';
import { ExpenseTypesView } from './components/ExpenseTypesView';
import { WeeklyClosuresView } from './components/WeeklyClosuresView';
import { WeeklyClosureModal } from './components/WeeklyClosureModal';
import { AddNotesModal } from './components/AddNotesModal';
import { AiAssistantDrawer } from './components/AiAssistantDrawer';
import { LoginScreen } from './components/LoginScreen';
import { UserProfile } from './types';
import { getISOWeekNumber, getWeekPeriodInfo } from './utils/weekUtils';
import { Search, Sparkles, Folder, CreditCard, Users, ShieldAlert, CheckCircle2, X, Check, ArrowRight } from 'lucide-react';

const USER_STORAGE_KEY = 'treasury_current_user_v1';

export default function App() {
  const {
    state,
    today,
    todayDateStr,
    currentDayKey,
    currentDayOfMonth,
    toggleDailyItem,
    toggleWeeklyItem,
    toggleMonthlyItem,
    resetDailyChecklist,
    resetWeeklyChecklist,
    resetMonthlyChecklist,
    addDailyRoutine,
    addDailyRoutineGuideline,
    removeDailyRoutineGuideline,
    editDailyRoutineGuideline,
    updateDailyRoutine,
    addWeeklySchedule,
    addWeeklyScheduleGuideline,
    removeWeeklyScheduleGuideline,
    updateWeeklySchedule,
    addMonthlyDue,
    removeMonthlyDue,
    addMonthlyDueGuideline,
    removeMonthlyDueGuideline,
    updateMonthlyDue,
    addSpecialRule,
    updateSpecialRule,
    addContact,
    addBankAccount,
    addFolderPath,
    removeSpecialRule,
    removeDailyRoutine,
    removeWeeklySchedule,
    removeContact,
    removeBankAccount,
    removeFolderPath,
    updateBankAccount,
    updateFolderPath,
    updateContact,
    addExpenseType,
    updateExpenseType,
    removeExpenseType,
    resetExpenseTypesToDefault,
    saveWeeklyClosure,
    updateWeeklyClosure,
    deleteWeeklyClosure,
    resetToFactoryDefaults,
    exportDataJson,
    importDataJson,
    syncStatus,
    lastSyncTime,
    forceSyncCloud,
  } = useFinancialStore();

  const [activeTab, setActiveTab] = useState<string>('hoje');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiNotesModalOpen, setIsAiNotesModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [closureModalWeekNumber, setClosureModalWeekNumber] = useState<number>(() => {
    return getISOWeekNumber(new Date()).weekNumber;
  });

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    id: string;
    title: string;
    description: string;
    actionText?: string;
    onAction?: () => void;
  } | null>(null);

  const showToast = (title: string, description: string, actionText?: string, onAction?: () => void) => {
    const id = 'toast-' + Date.now();
    setToastMessage({ id, title, description, actionText, onAction });
    setTimeout(() => {
      setToastMessage(curr => (curr?.id === id ? null : curr));
    }, 6000);
  };

  const handleSaveClosureFromModal = (closureData: any) => {
    saveWeeklyClosure(closureData);
    showToast(
      `Fechamento da Semana ${closureData.weekNumber}/${closureData.year} Salvo!`,
      `O registro foi arquivado com sucesso no histórico da tesouraria.`,
      'Ver Fechamentos',
      () => setActiveTab('fechamento')
    );
  };

  const closureWeekInfo = useMemo(() => {
    return getWeekPeriodInfo(closureModalWeekNumber, new Date().getFullYear());
  }, [closureModalWeekNumber]);

  const existingClosureForModal = useMemo(() => {
    return (state.weeklyClosures || []).find(
      c => c.year === closureWeekInfo.year && c.weekNumber === closureModalWeekNumber
    ) || null;
  }, [state.weeklyClosures, closureWeekInfo.year, closureModalWeekNumber]);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user in storage', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear user from storage', e);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Format today's date in pt-BR
  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(today);
  }, [today]);

  // Handle file import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        const res = importDataJson(text);
        alert(res.message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Global search filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    return {
      daily: state.dailyRoutines.filter(
        d =>
          d.title.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q) ||
          (d.alert && d.alert.toLowerCase().includes(q))
      ),
      weekly: state.weeklySchedules.filter(
        w =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          (w.criticalRule && w.criticalRule.toLowerCase().includes(q))
      ),
      monthly: state.monthlyDues.filter(
        m =>
          m.title.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q) ||
          m.beneficiary.toLowerCase().includes(q)
      ),
      rules: state.specialRules.filter(
        r =>
          r.entityName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags.some(t => t.toLowerCase().includes(q))
      ),
      banks: state.bankAccounts.filter(
        b =>
          b.bank.toLowerCase().includes(q) ||
          b.accountNumber.toLowerCase().includes(q) ||
          b.unit.toLowerCase().includes(q)
      ),
      contacts: state.contacts.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.scope.toLowerCase().includes(q)
      ),
      folders: state.folderPaths.filter(
        f =>
          f.name.toLowerCase().includes(q) ||
          f.path.toLowerCase().includes(q) ||
          f.purpose.toLowerCase().includes(q)
      ),
      expenseTypes: (state.expenseTypes || []).filter(
        e =>
          e.categoryEn.toLowerCase().includes(q) ||
          e.categoryPt.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.macroGroup && e.macroGroup.toLowerCase().includes(q))
      ),
    };
  }, [searchQuery, state]);

  // If user is not logged in, render the Login Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-[#e0e0e0] flex flex-col font-sans selection:bg-teal-600 selection:text-white">
      {/* Hidden File Input for JSON restore */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".json"
        className="hidden"
      />

      {/* Main Header */}
      <Header
        todayFormatted={todayFormatted}
        currentDayKey={currentDayKey}
        currentDayOfMonth={currentDayOfMonth}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAiNotesModal={() => setIsAiNotesModalOpen(true)}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onExport={exportDataJson}
        onImportClick={() => fileInputRef.current?.click()}
        onResetDefaults={resetToFactoryDefaults}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        closureCount={(state.weeklyClosures || []).length}
        currentUser={currentUser}
        onLogout={handleLogout}
        syncStatus={syncStatus}
        lastSyncTime={lastSyncTime}
        onForceSync={() => {
          forceSyncCloud();
          showToast('Nuvem Sincronizada', 'Dados do financeiro sincronizados com o Firebase!');
        }}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Global Search Results view if active search */}
        {searchResults ? (
          <div className="space-y-6">
            <div className="bg-[#141414] p-4 sm:p-5 rounded-2xl border border-[#222] shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">
                  Resultados da busca para: &quot;{searchQuery}&quot;
                </h3>
                <p className="text-xs text-[#888]">
                  Exibindo itens encontrados em todas as categorias de rotina e cadastro.
                </p>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
              >
                Limpar busca
              </button>
            </div>

            {/* Rules Results */}
            {searchResults.rules.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  Regras Especiais de Pagamento ({searchResults.rules.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {searchResults.rules.map(rule => (
                    <div key={rule.id} className="p-4 bg-[#161616] rounded-xl border border-[#222]">
                      <div className="text-xs font-bold text-teal-400">{rule.entityName}</div>
                      <div className="text-sm font-semibold text-white mt-0.5">{rule.title}</div>
                      <div className="text-xs text-[#aaa] mt-1">{rule.description}</div>
                      <div className="text-xs text-orange-300 bg-orange-950/40 border border-orange-900/40 p-2.5 rounded-lg mt-2 font-medium">
                        ⚠️ {rule.actionRequired}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Routine Results */}
            {searchResults.daily.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  Rotina Diária Matinal ({searchResults.daily.length})
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {searchResults.daily.map(item => (
                    <div key={item.id} className="p-4 bg-[#161616] rounded-xl border border-[#222]">
                      <div className="text-sm font-semibold text-white">{item.title}</div>
                      <div className="text-xs text-[#aaa] mt-1">{item.description}</div>
                      {item.alert && <div className="text-xs text-orange-400 mt-1">⚠️ {item.alert}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bank Accounts & Folders Results */}
            {(searchResults.banks.length > 0 || searchResults.folders.length > 0 || searchResults.contacts.length > 0) && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  Bancos, Pastas & Contatos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {searchResults.banks.map(b => (
                    <div key={b.id} className="p-3 bg-[#161616] rounded-xl border border-[#222] text-xs">
                      <div className="font-bold text-white">{b.bank} - {b.unit}</div>
                      <div className="font-mono font-bold text-teal-400 mt-1">Conta: {b.accountNumber}</div>
                      <div className="text-[#888] mt-0.5">{b.purpose}</div>
                    </div>
                  ))}
                  {searchResults.folders.map(f => (
                    <div key={f.id} className="p-3 bg-[#161616] rounded-xl border border-[#222] text-xs">
                      <div className="font-bold text-white">{f.name}</div>
                      <div className="font-mono text-zinc-300 bg-[#121212] p-1 rounded-sm mt-1 border border-[#262626]">{f.path}</div>
                      <div className="text-[#888] mt-0.5">{f.purpose}</div>
                    </div>
                  ))}
                  {searchResults.contacts.map(c => (
                    <div key={c.id} className="p-3 bg-[#161616] rounded-xl border border-[#222] text-xs">
                      <div className="font-bold text-white">{c.name} ({c.unitOrArea})</div>
                      <div className="text-teal-400 font-medium">{c.role}</div>
                      <div className="text-[#888] mt-0.5">{c.scope}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expense Types Results */}
            {searchResults.expenseTypes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#666]">
                  Tipos de Despesas ({searchResults.expenseTypes.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.expenseTypes.map(e => (
                    <div key={e.id} className="p-3.5 bg-[#161616] rounded-xl border border-[#222] text-xs space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-white font-mono">{e.categoryEn}</span>
                        {e.macroGroup && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#202020] text-zinc-400 border border-[#2e2e2e]">
                            {e.macroGroup}
                          </span>
                        )}
                      </div>
                      <div className="font-semibold text-teal-300">{e.categoryPt}</div>
                      <div className="text-[#888] text-[11px] leading-relaxed">{e.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Today Focus Banner on top */}
            <TodayFocusBanner
              currentDayKey={currentDayKey}
              currentDayOfMonth={currentDayOfMonth}
              dailyRoutines={state.dailyRoutines}
              weeklySchedules={state.weeklySchedules}
              monthlyDues={state.monthlyDues}
              specialRules={state.specialRules}
              completedDailyIds={state.completedDailyIds}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              onNavigateToTab={setActiveTab}
            />

            {/* Tab Views */}
            {activeTab === 'hoje' && (
              <DailyRoutineView
                dailyRoutines={state.dailyRoutines}
                completedDailyIds={state.completedDailyIds}
                onToggleItem={toggleDailyItem}
                onResetChecklist={resetDailyChecklist}
                onAddNewDailyItem={addDailyRoutine}
                onDeleteItem={removeDailyRoutine}
                onAddGuideline={addDailyRoutineGuideline}
                onRemoveGuideline={removeDailyRoutineGuideline}
                onEditGuideline={editDailyRoutineGuideline}
                onUpdateRoutine={updateDailyRoutine}
              />
            )}

            {activeTab === 'semanal' && (
              <WeeklyScheduleView
                weeklySchedules={state.weeklySchedules}
                completedWeeklyIds={state.completedWeeklyIds}
                currentDayKey={currentDayKey}
                weeklyClosures={state.weeklyClosures || []}
                onToggleWeeklyItem={toggleWeeklyItem}
                onResetWeeklyChecklist={resetWeeklyChecklist}
                onAddWeeklySchedule={addWeeklySchedule}
                onDeleteWeeklySchedule={removeWeeklySchedule}
                onAddWeeklyGuideline={addWeeklyScheduleGuideline}
                onRemoveWeeklyGuideline={removeWeeklyScheduleGuideline}
                onUpdateWeeklySchedule={updateWeeklySchedule}
                onOpenClosureModal={weekNum => {
                  setClosureModalWeekNumber(weekNum);
                  setIsClosureModalOpen(true);
                }}
                onNavigateToClosures={() => setActiveTab('fechamento')}
              />
            )}

            {activeTab === 'fechamento' && (
              <WeeklyClosuresView
                weeklyClosures={state.weeklyClosures || []}
                weeklySchedules={state.weeklySchedules}
                completedWeeklyIds={state.completedWeeklyIds}
                customNotes={state.customNotes || []}
                currentUser={currentUser}
                onSaveClosure={handleSaveClosureFromModal}
                onUpdateClosure={(id, updated) => {
                  updateWeeklyClosure(id, updated);
                  showToast('Fechamento Atualizado!', 'As alterações do fechamento foram salvas com sucesso.');
                }}
                onDeleteClosure={(id) => {
                  deleteWeeklyClosure(id);
                  showToast('Fechamento Excluído', 'O registro foi removido com sucesso.');
                }}
                onNavigateToSchedule={() => setActiveTab('semanal')}
              />
            )}

            {activeTab === 'mensal' && (
              <MonthlyDuesView
                monthlyDues={state.monthlyDues}
                completedMonthlyIds={state.completedMonthlyIds}
                currentDayOfMonth={currentDayOfMonth}
                onToggleMonthlyItem={toggleMonthlyItem}
                onResetMonthlyChecklist={resetMonthlyChecklist}
                onAddMonthlyDue={addMonthlyDue}
                onRemoveMonthlyDue={removeMonthlyDue}
                onAddMonthlyGuideline={addMonthlyDueGuideline}
                onRemoveMonthlyGuideline={removeMonthlyDueGuideline}
              />
            )}

            {activeTab === 'regras' && (
              <SpecialRulesView
                specialRules={state.specialRules}
                onAddSpecialRule={addSpecialRule}
                onRemoveSpecialRule={removeSpecialRule}
              />
            )}

            {activeTab === 'diretorio' && (
              <DirectoryAndBanksView
                bankAccounts={state.bankAccounts}
                folderPaths={state.folderPaths}
                contacts={state.contacts}
                onAddBankAccount={addBankAccount}
                onAddFolderPath={addFolderPath}
                onAddContact={addContact}
                onRemoveContact={removeContact}
                onRemoveBankAccount={removeBankAccount}
                onRemoveFolderPath={removeFolderPath}
                onUpdateBankAccount={updateBankAccount}
                onUpdateFolderPath={updateFolderPath}
                onUpdateContact={updateContact}
              />
            )}

            {activeTab === 'tipos_despesas' && (
              <ExpenseTypesView
                expenseTypes={state.expenseTypes || []}
                onAddExpenseType={addExpenseType}
                onUpdateExpenseType={updateExpenseType}
                onRemoveExpenseType={removeExpenseType}
                onResetToDefault={resetExpenseTypesToDefault}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#222] bg-[#0a0a0a] py-3.5 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#555] uppercase tracking-widest gap-2">
          <span>Usuário ativo: {currentUser.name} ({currentUser.role})</span>
          <span>Sistema de Monitoramento Financeiro Centralizado - 2026</span>
        </div>
      </footer>

      {/* AI Modals */}
      <AddNotesModal
        isOpen={isAiNotesModalOpen}
        onClose={() => setIsAiNotesModalOpen(false)}
        onAddDailyRoutine={addDailyRoutine}
        onAddWeeklySchedule={addWeeklySchedule}
        onAddSpecialRule={addSpecialRule}
      />

      {/* Weekly Closure Modal */}
      <WeeklyClosureModal
        isOpen={isClosureModalOpen}
        onClose={() => setIsClosureModalOpen(false)}
        selectedWeekInfo={closureWeekInfo}
        weeklySchedules={state.weeklySchedules}
        completedWeeklyIds={state.completedWeeklyIds}
        customNotes={state.customNotes || []}
        existingClosure={existingClosureForModal}
        currentUser={currentUser}
        onSaveClosure={handleSaveClosureFromModal}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md w-full p-4 bg-[#141414] border border-teal-600/70 rounded-2xl shadow-2xl flex items-start gap-3.5 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="p-2 bg-teal-950 text-teal-400 border border-teal-700/60 rounded-xl mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">{toastMessage.title}</h4>
            <p className="text-xs text-zinc-300 mt-0.5">{toastMessage.description}</p>
            {toastMessage.actionText && toastMessage.onAction && (
              <button
                onClick={() => {
                  toastMessage.onAction?.();
                  setToastMessage(null);
                }}
                className="mt-2 text-xs font-semibold text-teal-300 hover:text-white inline-flex items-center gap-1 bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-700/50 hover:bg-teal-900 transition-colors"
              >
                <span>{toastMessage.actionText}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-500 hover:text-white p-1 rounded-lg hover:bg-[#222] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <AiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        state={state}
      />
    </div>
  );
}
