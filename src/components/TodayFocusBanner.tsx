import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Copy,
  Check,
  Info,
  Calendar,
  Layers,
  CalendarDays,
  Languages,
  ArrowRight,
} from 'lucide-react';
import { DayOfWeekKey, DailyRoutineItem, WeeklyScheduleItem, MonthlyDueItem, SpecialRuleItem } from '../types';
import { getISOWeekNumber, getWeekPeriodInfo } from '../utils/weekUtils';

interface TodayFocusBannerProps {
  currentDayKey: DayOfWeekKey;
  currentDayOfMonth: number;
  dailyRoutines: DailyRoutineItem[];
  weeklySchedules: WeeklyScheduleItem[];
  monthlyDues: MonthlyDueItem[];
  specialRules: SpecialRuleItem[];
  completedDailyIds: string[];
  onOpenAiAssistant: () => void;
  onNavigateToTab?: (tab: 'hoje' | 'semanal' | 'mensal' | 'regras' | 'diretorio' | 'tipos_despesas' | 'fechamento') => void;
}

export const TodayFocusBanner: React.FC<TodayFocusBannerProps> = ({
  currentDayKey,
  currentDayOfMonth,
  dailyRoutines,
  weeklySchedules,
  monthlyDues,
  specialRules,
  completedDailyIds,
  onOpenAiAssistant,
  onNavigateToTab,
}) => {
  const [copied, setCopied] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<{
    greeting?: string;
    summary?: string;
    top3Priorities?: string[];
    tipsAndAlerts?: string[];
  } | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);

  // Week of the year info
  const currentWeekInfo = useMemo(() => {
    const { weekNumber, year } = getISOWeekNumber(new Date());
    return getWeekPeriodInfo(weekNumber, year);
  }, []);

  // Daily progress
  const completedCount = completedDailyIds.length;
  const totalCount = dailyRoutines.length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filter tasks specific to today's day of week
  const todayWeeklyTasks = weeklySchedules.filter(item => item.dayOfWeek === currentDayKey);

  // Filter monthly dues that match today (e.g. dia 20, 1-5 for inicio do mes)
  const isDay20 = currentDayOfMonth === 20;
  const isEarlyMonth = currentDayOfMonth >= 1 && currentDayOfMonth <= 7;

  const relevantMonthlyAlerts = monthlyDues.filter(item => {
    if (isDay20 && item.dueRule === 'dia_20') return true;
    if (isEarlyMonth && (item.dueRule === 'inicio_mes' || item.dueRule === '5o_dia_util')) return true;
    return false;
  });

  // Handle generating smart AI briefing
  const handleGenerateBriefing = async () => {
    setIsLoadingBriefing(true);
    try {
      const response = await fetch('/api/ai/daily-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayOfWeek: currentDayKey,
          dayOfMonth: currentDayOfMonth,
          pendingTasks: [
            ...dailyRoutines.map(d => ({ title: d.title, timing: d.timing })),
            ...todayWeeklyTasks.map(w => ({ title: w.title, rule: w.criticalRule })),
          ],
          rules: specialRules.map(r => ({ entity: r.entityName, rule: r.title })),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setAiBriefing(data);
      }
    } catch (e) {
      console.error('Erro ao gerar briefing:', e);
    } finally {
      setIsLoadingBriefing(false);
    }
  };

  // Copy checklist text
  const handleCopyChecklist = () => {
    const lines = [
      `📌 *Checklist de Tesouraria & Contas a Pagar - ${new Date().toLocaleDateString('pt-BR')}*`,
      `Dia do Mês: ${currentDayOfMonth} | Progresso Matinal: ${completedCount}/${totalCount} (${percentComplete}%)`,
      '',
      '🌅 *ROTINA MATINAL:*',
      ...dailyRoutines.map(r => {
        const done = completedDailyIds.includes(r.id) ? '✅' : '⬜';
        return `${done} ${r.order}. ${r.title} (${r.timing || 'Manhã'})`;
      }),
      '',
      todayWeeklyTasks.length > 0 ? `📅 *FOCO DE HOJE (${todayWeeklyTasks[0].dayName.toUpperCase()}):*` : '',
      ...todayWeeklyTasks.map(t => `• ${t.title} - ${t.criticalRule || t.description}`),
      '',
      relevantMonthlyAlerts.length > 0 ? '⚠️ *VENCIMENTOS DO PERÍODO:*' : '',
      ...relevantMonthlyAlerts.map(m => `• [${m.dueDisplay}] ${m.title} (${m.paymentMethod})`),
      '',
      '🚨 *LEMBRETES CRÍTICOS:*',
      '• Welcon: Conferir desconto judicial antes de pagar.',
      '• Cemas: Validar com Kauan abatimento da Nota de Débito (ND).',
      '• Adiantamentos: Exigir Carta de Garantia.',
      '• Conta Bradesco: Monitorar e-mails para cobertura de energia extra.',
    ].filter(Boolean);

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="mb-6">
      {/* Banner Card */}
      <div className="bg-[#141414] rounded-2xl border border-[#222] shadow-sm overflow-hidden">
        {/* Top summary strip */}
        <div className="bg-[#121212] border-b border-[#222] text-[#e0e0e0] p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-teal-400 border border-teal-900/40">
                  Painel de Controle Diário
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800/50 font-mono flex items-center gap-1">
                  <CalendarDays className="w-3.5 h-3.5 text-teal-400" />
                  Semana {currentWeekInfo.weekNumber} do Ano ({currentWeekInfo.formattedShortRange})
                </span>
                {isDay20 && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-950/60 text-orange-300 border border-orange-800/50 animate-pulse">
                    ⚠️ HOJE É DIA 20 (Folha, Condomínio & Serasa)
                  </span>
                )}
                {currentDayKey === 'qua' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-950/50 text-orange-300 border border-orange-800/40">
                    📢 Quarta: Envio de Relação para Aprovação
                  </span>
                )}
                {currentDayKey === 'sex' && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-950/50 text-teal-300 border border-teal-800/40">
                    💳 Sexta: Execução de Pagamentos de Fornecedores
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                {currentDayKey === 'qua'
                  ? 'Quarta-feira: Dia de consolidar e enviar aprovação de fornecedores'
                  : currentDayKey === 'sex'
                  ? 'Sexta-feira: Dia de liquidação e pagamento de fornecedores'
                  : currentDayKey === 'ter'
                  ? 'Terça-feira: Auditoria semanal e verificação do Serasa'
                  : currentDayKey === 'seg'
                  ? 'Segunda-feira: Abertura do ciclo e conciliação bancária matinal'
                  : 'Rotina de Tesouraria: Não esqueça do Previsto e Extratos'}
              </h2>
              <p className="text-[#888] text-xs sm:text-sm mt-1 max-w-3xl">
                Comece buscando extratos nos bancos Itaú e Santander, cole na planilha e preencha o previsto do dia anterior.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleGenerateBriefing}
                disabled={isLoadingBriefing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium shadow-xs transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isLoadingBriefing ? 'Gerando Briefing...' : 'Gerar Briefing com IA'}</span>
              </button>

              <button
                onClick={handleCopyChecklist}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1c1c1c] hover:bg-[#252525] text-zinc-300 text-xs font-medium border border-[#2a2a2a] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar Checklist do Dia'}</span>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 pt-4 border-t border-[#222] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-xs font-medium text-[#888] whitespace-nowrap">
                Progresso Matinal ({completedCount}/{totalCount}):
              </div>
              <div className="w-full bg-[#202020] rounded-full h-2 overflow-hidden border border-[#282828]">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentComplete}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold text-teal-400 font-mono">{percentComplete}%</span>
            </div>
          </div>
        </div>

        {/* AI Briefing if generated */}
        {aiBriefing && (
          <div className="p-4 bg-[#181818] border-b border-[#262626]">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-teal-300 text-sm">{aiBriefing.greeting || 'Briefing do Dia'}</h4>
                  <button
                    onClick={() => setAiBriefing(null)}
                    className="text-[#888] hover:text-white text-xs"
                  >
                    ✕ Fechar
                  </button>
                </div>
                <p className="text-zinc-300 mt-1 font-normal">{aiBriefing.summary}</p>
                
                {aiBriefing.top3Priorities && aiBriefing.top3Priorities.length > 0 && (
                  <div className="mt-3 grid sm:grid-cols-3 gap-2">
                    {aiBriefing.top3Priorities.map((item, idx) => (
                      <div key={idx} className="bg-[#121212] p-2.5 rounded-lg border border-[#2a2a2a] text-zinc-300">
                        <span className="font-bold text-teal-400 mr-1 font-mono">#{idx + 1}</span> {item}
                      </div>
                    ))}
                  </div>
                )}

                {aiBriefing.tipsAndAlerts && aiBriefing.tipsAndAlerts.length > 0 && (
                  <div className="mt-2.5 text-orange-300 bg-orange-950/30 border border-orange-900/30 p-2 rounded-lg font-normal">
                    ⚠️ {aiBriefing.tipsAndAlerts.join(' • ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Operational Warnings Bar & Quick Access */}
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#111]">
          {/* Card 1: Critical Provider Alerts */}
          <div className="p-3.5 rounded-xl bg-[#191512] border border-orange-900/40 text-orange-200">
            <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs mb-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0" />
              <span>Regras Críticas</span>
            </div>
            <ul className="text-xs text-orange-200/90 space-y-1">
              <li>• <strong className="text-white">Welcon:</strong> Abater desc. judicial.</li>
              <li>• <strong className="text-white">Cemas:</strong> Tem ND (Kauan).</li>
              <li>• <strong className="text-white">Adiant.:</strong> Carta Garantia.</li>
            </ul>
          </div>

          {/* Card 2: Bank Routine & Energy */}
          <div className="p-3.5 rounded-xl bg-[#111d1a] border border-teal-900/40 text-teal-200">
            <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs mb-1.5">
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>Rotina Bancária</span>
            </div>
            <ul className="text-xs text-teal-200/90 space-y-1">
              <li>• <strong className="text-white">Bradesco:</strong> Checar energia.</li>
              <li>• <strong className="text-white">Santander GRU:</strong> 13028945-8.</li>
              <li>• <strong className="text-white">Santander Gravataí:</strong> 13001312-5.</li>
            </ul>
          </div>

          {/* Card 3: Due Dates & Method */}
          <div className="p-3.5 rounded-xl bg-[#161616] border border-[#262626]">
            <div className="flex items-center gap-2 text-zinc-200 font-semibold text-xs mb-1.5">
              <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
              <span>Vencimentos & Boletos</span>
            </div>
            <ul className="text-xs text-zinc-400 space-y-1">
              <li>• <strong className="text-zinc-200">Dia 20:</strong> Cond., Folha, Imp.</li>
              <li>• <strong className="text-zinc-200">5º Dia Útil:</strong> Aluguel Visteon.</li>
              <li>• <strong className="text-zinc-200">Boletos:</strong> Amil, Serasa, T-System.</li>
            </ul>
          </div>

          {/* Card 4: Expense Types Glossary Quick Access */}
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#121c19] to-[#0f1715] border border-teal-800/60 text-teal-100 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 text-teal-300 font-semibold text-xs">
                  <Languages className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>Tipos de Despesas</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-teal-900 text-teal-200 font-mono font-bold border border-teal-700/50">
                  74 ITENS
                </span>
              </div>
              <p className="text-[11px] text-teal-200/80 leading-snug">
                Plano de contas bilíngue (EN/PT) para provisões e conciliação bancária.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab?.('tipos_despesas')}
              className="mt-2.5 w-full py-1.5 px-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Abrir Catálogo PT/EN</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
