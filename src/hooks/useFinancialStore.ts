import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  FinancialAssistantState,
  DailyRoutineItem,
  WeeklyScheduleItem,
  MonthlyDueItem,
  SpecialRuleItem,
  ContactItem,
  BankAccountItem,
  FolderPathItem,
  ExpenseTypeItem,
  WeeklyClosureRecord,
  DayOfWeekKey,
} from '../types';
import { INITIAL_STATE } from '../data/initialData';
import { db, isFirebaseConfigured } from '../lib/firebase';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  deleteDoc,
} from 'firebase/firestore';

const STORAGE_KEY = 'mpp_treasury_financial_assistant_v1';
const WORKSPACE_DOC_ID = 'shared_main';

export function useFinancialStore() {
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>(
    isFirebaseConfigured ? 'connected' : 'offline'
  );
  const isRemoteUpdateRef = useRef(false);

  const [state, setState] = useState<FinancialAssistantState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...INITIAL_STATE,
          ...parsed,
          dailyRoutines: parsed.dailyRoutines?.length ? parsed.dailyRoutines : INITIAL_STATE.dailyRoutines,
          weeklySchedules: parsed.weeklySchedules?.length ? parsed.weeklySchedules : INITIAL_STATE.weeklySchedules,
          monthlyDues: parsed.monthlyDues?.length ? parsed.monthlyDues : INITIAL_STATE.monthlyDues,
          specialRules: parsed.specialRules?.length ? parsed.specialRules : INITIAL_STATE.specialRules,
          contacts: parsed.contacts?.length ? parsed.contacts : INITIAL_STATE.contacts,
          bankAccounts: parsed.bankAccounts?.length ? parsed.bankAccounts : INITIAL_STATE.bankAccounts,
          folderPaths: parsed.folderPaths?.length ? parsed.folderPaths : INITIAL_STATE.folderPaths,
          expenseTypes: parsed.expenseTypes?.length ? parsed.expenseTypes : INITIAL_STATE.expenseTypes,
          weeklyClosures: Array.isArray(parsed.weeklyClosures) ? parsed.weeklyClosures : INITIAL_STATE.weeklyClosures,
        };
      }
    } catch (e) {
      console.error('Falha ao carregar localStorage:', e);
    }
    return INITIAL_STATE;
  });

  // Helper to sync whole workspace to Firestore
  const syncToCloud = useCallback(async (stateToSync: FinancialAssistantState) => {
    if (!isFirebaseConfigured || isRemoteUpdateRef.current) return;
    try {
      setSyncStatus('syncing');
      const workspaceRef = doc(db, 'treasury_workspace', WORKSPACE_DOC_ID);
      await setDoc(workspaceRef, {
        dailyRoutines: stateToSync.dailyRoutines || [],
        weeklySchedules: stateToSync.weeklySchedules || [],
        monthlyDues: stateToSync.monthlyDues || [],
        specialRules: stateToSync.specialRules || [],
        contacts: stateToSync.contacts || [],
        bankAccounts: stateToSync.bankAccounts || [],
        folderPaths: stateToSync.folderPaths || [],
        expenseTypes: stateToSync.expenseTypes || [],
        completedDailyIds: stateToSync.completedDailyIds || [],
        completedWeeklyIds: stateToSync.completedWeeklyIds || [],
        completedMonthlyIds: stateToSync.completedMonthlyIds || [],
        customNotes: stateToSync.customNotes || [],
        weeklyClosures: stateToSync.weeklyClosures || [],
        lastUpdated: new Date().toISOString(),
      }, { merge: true });
      setSyncStatus('connected');
    } catch (error) {
      console.error('Erro ao sincronizar com Firestore:', error);
      setSyncStatus('connected');
    }
  }, []);

  // Real-time Firestore Listener
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const workspaceRef = doc(db, 'treasury_workspace', WORKSPACE_DOC_ID);

    const unsubscribe = onSnapshot(
      workspaceRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data();
          isRemoteUpdateRef.current = true;
          setState(prev => {
            const nextState: FinancialAssistantState = {
              ...prev,
              dailyRoutines: cloudData.dailyRoutines || prev.dailyRoutines,
              weeklySchedules: cloudData.weeklySchedules || prev.weeklySchedules,
              monthlyDues: cloudData.monthlyDues || prev.monthlyDues,
              specialRules: cloudData.specialRules || prev.specialRules,
              contacts: cloudData.contacts || prev.contacts,
              bankAccounts: cloudData.bankAccounts || prev.bankAccounts,
              folderPaths: cloudData.folderPaths || prev.folderPaths,
              expenseTypes: cloudData.expenseTypes || prev.expenseTypes,
              completedDailyIds: cloudData.completedDailyIds || prev.completedDailyIds,
              completedWeeklyIds: cloudData.completedWeeklyIds || prev.completedWeeklyIds,
              completedMonthlyIds: cloudData.completedMonthlyIds || prev.completedMonthlyIds,
              customNotes: cloudData.customNotes || prev.customNotes,
              weeklyClosures: Array.isArray(cloudData.weeklyClosures)
                ? cloudData.weeklyClosures
                : prev.weeklyClosures,
            };
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
            } catch (e) {
              console.error(e);
            }
            return nextState;
          });
          setTimeout(() => {
            isRemoteUpdateRef.current = false;
          }, 300);
          setSyncStatus('connected');
        } else {
          // Document does not exist in Firestore yet -> seed with current state
          syncToCloud(state);
        }
      },
      (error) => {
        console.error('Erro no listener do Firestore:', error);
        setSyncStatus('offline');
      }
    );

    return () => unsubscribe();
  }, [syncToCloud]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Falha ao salvar no localStorage:', e);
    }
  }, [state]);

  // Debounced Auto-sync local changes to Firestore Cloud
  useEffect(() => {
    if (!isFirebaseConfigured || isRemoteUpdateRef.current) return;
    const timer = setTimeout(() => {
      syncToCloud(state);
    }, 500);
    return () => clearTimeout(timer);
  }, [state, syncToCloud]);

  // Today's date calculations
  const today = useMemo(() => new Date(), []);
  const todayDateStr = useMemo(() => today.toISOString().split('T')[0], [today]);
  
  // Day of week key
  const currentDayKey = useMemo<DayOfWeekKey>(() => {
    const dayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const map: Record<number, DayOfWeekKey> = {
      0: 'dom',
      1: 'seg',
      2: 'ter',
      3: 'qua',
      4: 'qui',
      5: 'sex',
      6: 'sab',
    };
    return map[dayIndex] || 'seg';
  }, [today]);

  const currentDayOfMonth = useMemo(() => today.getDate(), [today]);

  // Auto reset daily checklist on a new calendar day
  useEffect(() => {
    if (state.lastCompletedDate !== todayDateStr) {
      setState(prev => ({
        ...prev,
        completedDailyIds: [],
        lastCompletedDate: todayDateStr,
      }));
    }
  }, [state.lastCompletedDate, todayDateStr]);

  // Actions for checklists
  const toggleDailyItem = useCallback((id: string) => {
    setState(prev => {
      const exists = prev.completedDailyIds.includes(id);
      return {
        ...prev,
        completedDailyIds: exists
          ? prev.completedDailyIds.filter(i => i !== id)
          : [...prev.completedDailyIds, id],
      };
    });
  }, []);

  const toggleWeeklyItem = useCallback((id: string) => {
    setState(prev => {
      const exists = prev.completedWeeklyIds.includes(id);
      return {
        ...prev,
        completedWeeklyIds: exists
          ? prev.completedWeeklyIds.filter(i => i !== id)
          : [...prev.completedWeeklyIds, id],
      };
    });
  }, []);

  const toggleMonthlyItem = useCallback((id: string) => {
    setState(prev => {
      const exists = prev.completedMonthlyIds.includes(id);
      return {
        ...prev,
        completedMonthlyIds: exists
          ? prev.completedMonthlyIds.filter(i => i !== id)
          : [...prev.completedMonthlyIds, id],
      };
    });
  }, []);

  const resetDailyChecklist = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedDailyIds: [],
    }));
  }, []);

  const resetWeeklyChecklist = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedWeeklyIds: [],
    }));
  }, []);

  const resetMonthlyChecklist = useCallback(() => {
    setState(prev => ({
      ...prev,
      completedMonthlyIds: [],
    }));
  }, []);

  // Add Item actions
  const addDailyRoutine = useCallback((item: Omit<DailyRoutineItem, 'id' | 'order'>) => {
    setState(prev => {
      const newItem: DailyRoutineItem = {
        ...item,
        id: 'daily-' + Date.now(),
        order: prev.dailyRoutines.length + 1,
      };
      return {
        ...prev,
        dailyRoutines: [...prev.dailyRoutines, newItem],
      };
    });
  }, []);

  const addWeeklySchedule = useCallback((item: Omit<WeeklyScheduleItem, 'id'>) => {
    setState(prev => {
      const newItem: WeeklyScheduleItem = {
        ...item,
        id: 'weekly-' + Date.now(),
      };
      return {
        ...prev,
        weeklySchedules: [...prev.weeklySchedules, newItem],
      };
    });
  }, []);

  const addSpecialRule = useCallback((item: Omit<SpecialRuleItem, 'id'>) => {
    setState(prev => {
      const newItem: SpecialRuleItem = {
        ...item,
        id: 'rule-' + Date.now(),
      };
      return {
        ...prev,
        specialRules: [newItem, ...prev.specialRules],
      };
    });
  }, []);

  const addContact = useCallback((item: Omit<ContactItem, 'id'>) => {
    setState(prev => {
      const newItem: ContactItem = {
        ...item,
        id: 'contact-' + Date.now(),
      };
      return {
        ...prev,
        contacts: [...prev.contacts, newItem],
      };
    });
  }, []);

  const addBankAccount = useCallback((item: Omit<BankAccountItem, 'id'>) => {
    setState(prev => {
      const newItem: BankAccountItem = {
        ...item,
        id: 'bank-' + Date.now(),
      };
      return {
        ...prev,
        bankAccounts: [...prev.bankAccounts, newItem],
      };
    });
  }, []);

  const addFolderPath = useCallback((item: Omit<FolderPathItem, 'id'>) => {
    setState(prev => {
      const newItem: FolderPathItem = {
        ...item,
        id: 'folder-' + Date.now(),
      };
      return {
        ...prev,
        folderPaths: [...prev.folderPaths, newItem],
      };
    });
  }, []);

  // Guideline / Step management for Daily Routines
  const addDailyRoutineGuideline = useCallback((routineId: string, guidelineText: string) => {
    if (!guidelineText.trim()) return;
    setState(prev => ({
      ...prev,
      dailyRoutines: prev.dailyRoutines.map(r => {
        if (r.id !== routineId) return r;
        const currentSteps = r.actionableSteps || [];
        return {
          ...r,
          actionableSteps: [...currentSteps, guidelineText.trim()],
        };
      }),
    }));
  }, []);

  const removeDailyRoutineGuideline = useCallback((routineId: string, stepIndex: number) => {
    setState(prev => ({
      ...prev,
      dailyRoutines: prev.dailyRoutines.map(r => {
        if (r.id !== routineId) return r;
        const currentSteps = r.actionableSteps || [];
        return {
          ...r,
          actionableSteps: currentSteps.filter((_, idx) => idx !== stepIndex),
        };
      }),
    }));
  }, []);

  const editDailyRoutineGuideline = useCallback((routineId: string, stepIndex: number, newText: string) => {
    if (!newText.trim()) return;
    setState(prev => ({
      ...prev,
      dailyRoutines: prev.dailyRoutines.map(r => {
        if (r.id !== routineId) return r;
        const currentSteps = r.actionableSteps || [];
        return {
          ...r,
          actionableSteps: currentSteps.map((step, idx) => (idx === stepIndex ? newText.trim() : step)),
        };
      }),
    }));
  }, []);

  const updateDailyRoutine = useCallback((id: string, updated: Partial<DailyRoutineItem>) => {
    setState(prev => ({
      ...prev,
      dailyRoutines: prev.dailyRoutines.map(r => (r.id === id ? { ...r, ...updated } : r)),
    }));
  }, []);

  // Guideline / Step management for Weekly Schedules
  const addWeeklyScheduleGuideline = useCallback((scheduleId: string, guidelineText: string) => {
    if (!guidelineText.trim()) return;
    setState(prev => ({
      ...prev,
      weeklySchedules: prev.weeklySchedules.map(w => {
        if (w.id !== scheduleId) return w;
        const currentSteps = w.actionableSteps || [];
        return {
          ...w,
          actionableSteps: [...currentSteps, guidelineText.trim()],
        };
      }),
    }));
  }, []);

  const removeWeeklyScheduleGuideline = useCallback((scheduleId: string, stepIndex: number) => {
    setState(prev => ({
      ...prev,
      weeklySchedules: prev.weeklySchedules.map(w => {
        if (w.id !== scheduleId) return w;
        const currentSteps = w.actionableSteps || [];
        return {
          ...w,
          actionableSteps: currentSteps.filter((_, idx) => idx !== stepIndex),
        };
      }),
    }));
  }, []);

  const updateWeeklySchedule = useCallback((id: string, updated: Partial<WeeklyScheduleItem>) => {
    setState(prev => ({
      ...prev,
      weeklySchedules: prev.weeklySchedules.map(w => (w.id === id ? { ...w, ...updated } : w)),
    }));
  }, []);

  // Guideline / Step management for Monthly Dues
  const addMonthlyDueGuideline = useCallback((dueId: string, guidelineText: string) => {
    if (!guidelineText.trim()) return;
    setState(prev => ({
      ...prev,
      monthlyDues: prev.monthlyDues.map(m => {
        if (m.id !== dueId) return m;
        const currentSteps = m.actionableSteps || [];
        return {
          ...m,
          actionableSteps: [...currentSteps, guidelineText.trim()],
        };
      }),
    }));
  }, []);

  const removeMonthlyDueGuideline = useCallback((dueId: string, stepIndex: number) => {
    setState(prev => ({
      ...prev,
      monthlyDues: prev.monthlyDues.map(m => {
        if (m.id !== dueId) return m;
        const currentSteps = m.actionableSteps || [];
        return {
          ...m,
          actionableSteps: currentSteps.filter((_, idx) => idx !== stepIndex),
        };
      }),
    }));
  }, []);

  const updateMonthlyDue = useCallback((id: string, updated: Partial<MonthlyDueItem>) => {
    setState(prev => ({
      ...prev,
      monthlyDues: prev.monthlyDues.map(m => (m.id === id ? { ...m, ...updated } : m)),
    }));
  }, []);

  const updateSpecialRule = useCallback((id: string, updated: Partial<SpecialRuleItem>) => {
    setState(prev => ({
      ...prev,
      specialRules: prev.specialRules.map(r => (r.id === id ? { ...r, ...updated } : r)),
    }));
  }, []);

  const addMonthlyDue = useCallback((item: Omit<MonthlyDueItem, 'id'>) => {
    setState(prev => {
      const newItem: MonthlyDueItem = {
        ...item,
        id: 'monthly-' + Date.now(),
      };
      return {
        ...prev,
        monthlyDues: [...prev.monthlyDues, newItem],
      };
    });
  }, []);

  const removeMonthlyDue = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      monthlyDues: prev.monthlyDues.filter(m => m.id !== id),
      completedMonthlyIds: prev.completedMonthlyIds.filter(i => i !== id),
    }));
  }, []);

  const removeBankAccount = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter(b => b.id !== id),
    }));
  }, []);

  const removeFolderPath = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      folderPaths: prev.folderPaths.filter(f => f.id !== id),
    }));
  }, []);

  const updateBankAccount = useCallback((id: string, updated: Partial<BankAccountItem>) => {
    setState(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.map(b => (b.id === id ? { ...b, ...updated } : b)),
    }));
  }, []);

  const updateFolderPath = useCallback((id: string, updated: Partial<FolderPathItem>) => {
    setState(prev => ({
      ...prev,
      folderPaths: prev.folderPaths.map(f => (f.id === id ? { ...f, ...updated } : f)),
    }));
  }, []);

  const updateContact = useCallback((id: string, updated: Partial<ContactItem>) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.map(c => (c.id === id ? { ...c, ...updated } : c)),
    }));
  }, []);

  // Remove actions
  const removeSpecialRule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      specialRules: prev.specialRules.filter(r => r.id !== id),
    }));
  }, []);

  const removeDailyRoutine = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      dailyRoutines: prev.dailyRoutines.filter(r => r.id !== id),
      completedDailyIds: prev.completedDailyIds.filter(i => i !== id),
    }));
  }, []);

  const removeWeeklySchedule = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      weeklySchedules: prev.weeklySchedules.filter(r => r.id !== id),
      completedWeeklyIds: prev.completedWeeklyIds.filter(i => i !== id),
    }));
  }, []);

  const removeContact = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      contacts: prev.contacts.filter(c => c.id !== id),
    }));
  }, []);

  // Expense Types Actions
  const addExpenseType = useCallback((item: Omit<ExpenseTypeItem, 'id'>) => {
    const newItem: ExpenseTypeItem = {
      ...item,
      id: `exp-custom-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      expenseTypes: [newItem, ...(prev.expenseTypes || [])],
    }));
  }, []);

  const updateExpenseType = useCallback((id: string, updated: Partial<ExpenseTypeItem>) => {
    setState(prev => ({
      ...prev,
      expenseTypes: (prev.expenseTypes || []).map(exp => (exp.id === id ? { ...exp, ...updated } : exp)),
    }));
  }, []);

  const removeExpenseType = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      expenseTypes: (prev.expenseTypes || []).filter(exp => exp.id !== id),
    }));
  }, []);

  const resetExpenseTypesToDefault = useCallback(() => {
    if (window.confirm('Deseja restaurar a lista original de 74 tipos de despesas corporativas (PT/EN)?')) {
      setState(prev => ({
        ...prev,
        expenseTypes: INITIAL_STATE.expenseTypes,
      }));
    }
  }, []);

  // Weekly Closures Actions
  const saveWeeklyClosure = useCallback(
    (closureData: Omit<WeeklyClosureRecord, 'id' | 'closedAt'>) => {
      const now = new Date().toISOString();
      const newRecord: WeeklyClosureRecord = {
        ...closureData,
        id: `closure-${closureData.year}-w${closureData.weekNumber}-${Date.now()}`,
        closedAt: now,
      };

      setState(prev => {
        const existingList = prev.weeklyClosures || [];
        // Replace existing closure for the same year and weekNumber or prepend new
        const filtered = existingList.filter(
          c => !(c.year === closureData.year && c.weekNumber === closureData.weekNumber)
        );
        const updatedClosures = [newRecord, ...filtered];
        const nextState = {
          ...prev,
          weeklyClosures: updatedClosures,
        };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        } catch (e) {
          console.error('Falha ao salvar fechamento no localStorage:', e);
        }
        return nextState;
      });
      return newRecord;
    },
    []
  );

  const updateWeeklyClosure = useCallback((id: string, updated: Partial<WeeklyClosureRecord>) => {
    setState(prev => {
      const updatedClosures = (prev.weeklyClosures || []).map(c =>
        c.id === id ? { ...c, ...updated } : c
      );
      const nextState = {
        ...prev,
        weeklyClosures: updatedClosures,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.error('Falha ao atualizar fechamento no localStorage:', e);
      }
      return nextState;
    });
  }, []);

  const deleteWeeklyClosure = useCallback((id: string) => {
    setState(prev => {
      const updatedClosures = (prev.weeklyClosures || []).filter(c => c.id !== id);
      const nextState = {
        ...prev,
        weeklyClosures: updatedClosures,
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      } catch (e) {
        console.error('Falha ao excluir fechamento no localStorage:', e);
      }
      return nextState;
    });
  }, []);

  // Reset to factory defaults
  const resetToFactoryDefaults = useCallback(() => {
    if (window.confirm('Tem certeza que deseja restaurar as anotações e rotinas padrão da empresa? Suas modificações manuais serão redefinidas.')) {
      setState(INITIAL_STATE);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Export / Import
  const exportDataJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rotina_financeira_mpp_treasury_${todayDateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [state, todayDateStr]);

  const importDataJson = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.dailyRoutines || parsed.specialRules) {
        setState(prev => ({
          ...prev,
          ...parsed,
        }));
        return { success: true, message: 'Dados importados com sucesso!' };
      }
      return { success: false, message: 'Arquivo JSON inválido para a estrutura de rotina financeira.' };
    } catch (e: any) {
      return { success: false, message: 'Erro ao analisar arquivo: ' + e.message };
    }
  }, []);

  return {
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
    updateContact,
    addBankAccount,
    updateBankAccount,
    addFolderPath,
    updateFolderPath,
    removeSpecialRule,
    removeDailyRoutine,
    removeWeeklySchedule,
    removeContact,
    removeBankAccount,
    removeFolderPath,
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
    forceSyncCloud: () => syncToCloud(state),
  };
}
