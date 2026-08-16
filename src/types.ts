export type TaskFrequency = 'daily' | 'weekly' | 'monthly' | 'on_demand';

export type DayOfWeekKey = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom';

export interface DailyRoutineItem {
  id: string;
  order: number;
  title: string;
  description: string;
  category: 'extratos' | 'planilha' | 'pastas' | 'contas' | 'geral';
  timing?: string;
  completed?: boolean;
  actionableSteps?: string[];
  alert?: string;
  quickLinkOrPath?: string;
}

export interface WeeklyScheduleItem {
  id: string;
  dayOfWeek: DayOfWeekKey;
  dayName: string;
  title: string;
  description: string;
  category: 'fornecedores' | 'aprovacao' | 'pagamentos' | 'auditoria' | 'geral';
  status: 'pending' | 'in_progress' | 'completed' | 'deferred';
  criticalRule?: string;
  badgeText?: string;
  dueTime?: string;
  actionableSteps?: string[];
}

export interface MonthlyDueItem {
  id: string;
  dueRule: 'inicio_mes' | '5o_dia_util' | 'dia_20' | 'data_vencimento' | 'custom';
  dueDisplay: string;
  title: string;
  beneficiary: string;
  paymentMethod: 'boleto' | 'transferencia' | 'debito_automatico' | 'conforme_solicitacao';
  description: string;
  status: 'pending' | 'completed';
  alert?: string;
  responsibleContact?: string;
  actionableSteps?: string[];
}

export interface SpecialRuleItem {
  id: string;
  entityName: string;
  category: 'desconto_judicial' | 'nota_debito' | 'carta_garantia' | 'boleto' | 'data_solicitacao' | 'energia_extra' | 'outros';
  title: string;
  description: string;
  actionRequired: string;
  severity: 'high' | 'medium' | 'low';
  contactPerson?: string;
  tags: string[];
}

export interface ContactItem {
  id: string;
  name: string;
  role: string;
  unitOrArea: string;
  scope: string;
  notes?: string;
}

export interface BankAccountItem {
  id: string;
  bank: string;
  unit: string;
  accountNumber: string;
  agency?: string;
  purpose: string;
  alert?: string;
}

export interface FolderPathItem {
  id: string;
  name: string;
  path: string;
  purpose: string;
  parentFolder?: string;
}

export interface CustomNoteItem {
  id: string;
  createdAt: string;
  rawText: string;
  title: string;
  category: string;
  tags: string[];
  isProcessed: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarText: string;
  department: string;
}

export interface ExpenseTypeItem {
  id: string;
  categoryEn: string;
  categoryPt: string;
  description: string;
  macroGroup?: string;
  notes?: string;
}

export interface WeeklyClosureRecord {
  id: string;
  year: number;
  weekNumber: number;
  periodLabel: string;
  startDateFormatted: string;
  endDateFormatted: string;
  wednesdayFormatted?: string;
  fridayFormatted?: string;
  closedAt: string; // ISO date string
  closedBy: string; // Name or role of user
  summaryNotes: string;
  pendingItemsNotes?: string;
  criticalRulesChecked?: boolean;
  totalTasksCount: number;
  completedTasksCount: number;
  completedTaskIds: string[];
  tasksSnapshot: {
    id: string;
    title: string;
    dayOfWeek: DayOfWeekKey;
    dayName: string;
    completed: boolean;
    dueTime?: string;
    criticalRule?: string;
  }[];
  customNotesSnapshot?: CustomNoteItem[];
  status: 'closed' | 'audited' | 'in_progress';
}

export interface FinancialAssistantState {
  dailyRoutines: DailyRoutineItem[];
  weeklySchedules: WeeklyScheduleItem[];
  monthlyDues: MonthlyDueItem[];
  specialRules: SpecialRuleItem[];
  contacts: ContactItem[];
  bankAccounts: BankAccountItem[];
  folderPaths: FolderPathItem[];
  customNotes: CustomNoteItem[];
  expenseTypes: ExpenseTypeItem[];
  weeklyClosures: WeeklyClosureRecord[];
  completedDailyIds: string[];
  completedWeeklyIds: string[];
  completedMonthlyIds: string[];
  lastCompletedDate: string; // YYYY-MM-DD
}
