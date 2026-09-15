export const GEDEP_CONFIG = {
  clientId: "747581420442-rkcu9ohb5llcd9g8uirqdnssgisund0u.apps.googleusercontent.com",
  spreadsheetId: "1N-v2Cd-V0TEnfq0GwtYhW_m5N8_QMNbn6nr4u0iH4_E",
  scope: "openid email profile https://www.googleapis.com/auth/spreadsheets",
  requiredTabs: [
    "servidores",
    "cargos",
    "fcpe",
    "historico_fcpe",
    "lancamentos",
    "processos",
    "ramais",
    "auditoria",
    "configuracoes",
  ],
} as const;

export const GEDEP_BUILD = {
  phase: "Fase 8",
  version: "0.8.0",
  legacyBaseline: "gedep-integrado-ultima-versao-rh2",
} as const;

export const GEDEP_NAV = [
  { id: "dashboard", label: "Início", group: "visao" },
  { id: "servidores", label: "Servidores", group: "operacao" },
  { id: "ficha", label: "Ficha pessoal", group: "operacao" },
  { id: "cargos", label: "Cargos", group: "operacao" },
  { id: "fcpe", label: "FCPE", group: "operacao" },
  { id: "sei", label: "Processos SEI", group: "operacao" },
  { id: "ramais", label: "Ramais", group: "operacao" },
  { id: "importacoes", label: "Importações", group: "gestao" },
  { id: "relatorios", label: "Relatórios", group: "gestao" },
  { id: "configuracoes", label: "Configurações", group: "gestao" },
] as const;

export type GedepRoute = (typeof GEDEP_NAV)[number]["id"];
export type GedepTab = (typeof GEDEP_CONFIG.requiredTabs)[number];

export const TAB_LABELS: Record<GedepTab, string> = {
  servidores: "Servidores",
  cargos: "Cargos",
  fcpe: "FCPE",
  historico_fcpe: "Histórico FCPE",
  lancamentos: "Lançamentos",
  processos: "Processos",
  ramais: "Ramais",
  auditoria: "Auditoria",
  configuracoes: "Configurações",
};

export const isGedepRoute = (value: string): value is GedepRoute =>
  GEDEP_NAV.some((item) => item.id === value);
