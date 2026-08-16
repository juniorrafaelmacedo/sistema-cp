import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json({ limit: "5mb" }));

// Lazy Gemini client helper
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// AI: Parse unstructured new work notes into structured items
app.post("/api/ai/parse-notes", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({ error: "Texto das anotações é obrigatório" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        items: [
          {
            type: "general_note",
            title: rawText.slice(0, 50),
            description: rawText,
            category: "Geral",
            importance: "media",
          },
        ],
      });
    }

    const prompt = `Você é um especialista em organização de processos de Contas a Pagar, Controladoria e Tesouraria corporativa.
Analise as anotações brutas que um funcionário recém-contratado recebeu sobre sua rotina e transforme em uma lista de itens estruturados para o sistema automatizado de lembretes e tarefas da semana.

Texto bruto recebido:
"""
${rawText}
"""

Extraia todos os itens identificáveis categorizando cada um no tipo mais adequado:
- "daily_routine": Tarefas diárias (ex: pegar extratos, atualizar planilha, conciliação matinal)
- "weekly_schedule": Tarefas de dias específicos da semana (ex: quarta enviar relação, sexta pagar, semanal verificar Serasa)
- "monthly_due": Vencimentos mensais fixos (ex: dia 20, 5º dia útil, início do mês)
- "special_rule": Regras críticas de fornecedores e pagamentos (ex: Welcon processo judicial, Cemas nota débito, adiantamento com carta de garantia, boletos, etc)
- "contact": Pessoas responsáveis ou contatos-chave (ex: Emerson GRU, Julia Gravataí, Kauan)
- "bank_account": Dados de contas bancárias (ex: Santander, Bradesco, Itaú)
- "folder_path": Caminhos de pastas e arquivos (ex: MPP Treasury, Provisão, Previsto)

Retorne em formato JSON rigoroso conforme o esquema especificado.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumo executivo do que foi compreendido" },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "daily_routine | weekly_schedule | monthly_due | special_rule | contact | bank_account | folder_path",
                  },
                  title: { type: Type.STRING, description: "Título claro e objetivo da tarefa/regra" },
                  description: { type: Type.STRING, description: "Instruções completas e detalhadas" },
                  timing: { type: Type.STRING, description: "Quando executar (ex: Diário 08:00, Quarta-feira, Dia 20, 5º dia útil)" },
                  daysOfWeek: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Dias da semana aplicáveis: ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom']",
                  },
                  dayOfMonth: { type: Type.STRING, description: "Dia do mês ou regra mensal (ex: '20', '5o_dia_util', 'inicio_mes')" },
                  category: { type: Type.STRING, description: "Categoria (ex: Bancos & Extratos, Fornecedores, Impostos/Folha, Benefícios, Pastas, Contatos)" },
                  importance: { type: Type.STRING, description: "alta | media | baixa" },
                  criticalAlert: { type: Type.STRING, description: "Aviso ou cuidado crítico se houver (ex: 'Verificar desconto de processo', 'Pedir carta de garantia')" },
                  actionableSteps: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Passos práticos sequenciais para executar a tarefa",
                  },
                  relatedEntity: { type: Type.STRING, description: "Nome do fornecedor, banco, pessoa ou pasta relacionada" },
                },
                required: ["type", "title", "description", "category", "importance"],
              },
            },
          },
          required: ["items"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json(parsed);
  } catch (error: any) {
    console.error("Erro ao analisar anotações:", error);
    return res.status(500).json({ error: error.message || "Falha ao processar anotações com IA" });
  }
});

// AI: Financial Assistant Chat / Q&A
app.post("/api/ai/ask-assistant", async (req, res) => {
  try {
    const { question, context } = req.body;
    if (!question) {
      return res.status(400).json({ error: "Pergunta é obrigatória" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        answer: "Aviso: Chave do Gemini não configurada. Consulte as abas da aplicação para encontrar as regras e cronogramas.",
      });
    }

    const prompt = `Você é um assistente virtual sênior de Contas a Pagar e Tesouraria da empresa.
O usuário é um novo colaborador no departamento financeiro.
Responda de forma rápida, precisa, amigável e profissional em português brasileiro, baseando-se estritamente nas regras e anotações cadastradas da empresa.

Contexto atual das anotações e procedimentos:
"""
${JSON.stringify(context || {}, null, 2)}
"""

Pergunta do usuário:
"${question}"

Dê orientações claras, destacando passos práticos, avisos de atenção (como cartas de garantia, descontos judiciais, notas de débito para abater, contas e datas limites).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "Você é um assistente sênior de tesouraria e contas a pagar prestativo e detalhista.",
      },
    });

    return res.json({ answer: response.text });
  } catch (error: any) {
    console.error("Erro no assistente de IA:", error);
    return res.status(500).json({ error: error.message || "Erro no assistente" });
  }
});

// AI: Smart Daily Briefing
app.post("/api/ai/daily-briefing", async (req, res) => {
  try {
    const { dayOfWeek, dayOfMonth, pendingTasks, rules } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.json({
        briefing: "Tenha um ótimo dia de trabalho! Revise sua lista matinal de extratos e previstos.",
        priorities: pendingTasks?.slice(0, 3)?.map((t: any) => t.title) || [],
      });
    }

    const prompt = `Gere um briefing matinal rápido e motivador em português para o operador financeiro.
Hoje é: ${dayOfWeek}, dia do mês: ${dayOfMonth}.

Tarefas para hoje:
${JSON.stringify(pendingTasks || [], null, 2)}

Regras de atenção:
${JSON.stringify(rules || [], null, 2)}

Forneça um JSON com:
- greeting: Saudação adequada ao dia
- summary: Resumo das prioridades críticas de hoje
- top3Priorities: Array com as 3 coisas mais importantes para não esquecer hoje
- tipsAndAlerts: Array com 1 ou 2 alertas de atenção importantes`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            greeting: { type: Type.STRING },
            summary: { type: Type.STRING },
            top3Priorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            tipsAndAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ["greeting", "summary", "top3Priorities", "tipsAndAlerts"],
        },
      },
    });

    return res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("Erro no briefing:", error);
    return res.status(500).json({ error: error.message || "Erro no briefing diário" });
  }
});

export default app;
