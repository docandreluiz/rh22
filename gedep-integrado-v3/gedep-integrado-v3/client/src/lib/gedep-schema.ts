import { normalizeHeader, type GedepRow } from "./gedep-api";

export const FIELD_ALIASES = {
  idServidor: ["idServidor", "ID", "id"],
  nome: ["nome", "NOME SERVIDOR", "Nome"],
  cpf: ["cpf", "CPF"],
  cargoEfetivo: ["cargoEfetivo", "cargo", "CARGO EFETIVO", "DESC CARGO EFETIVO"],
  lotacao: ["lotacao", "LOTAÇÃO", "UNID ADM DE LOTAÇÃO", "NOME ÓRGÃO", "NOME ORGÃO"],
  unidade: ["unidade", "UNIDADE", "SIGLA"],
  situacaoFuncional: ["situacaoFuncional", "SITUAÇÃO FUNCIONAL", "SITUACAO FUNCIONAL", "SITUAÇÃO"],
  dataNascimento: ["dataNascimento", "DATA NASCIMENTO"],
  dataAdmissao: ["dataAdmissao", "DATA ADMISSÃO", "DATA ADMISSAO"],
  ativo: ["ativo", "ATIVO"],
  fotoUrl: ["fotoUrl", "FOTO URL"],
  processoSei: ["processoSei", "PROCESSO SEI", "processo"],
  interessado: ["interessado", "interessados", "INTERESSADO", "INTERESSADOS", "Interessados"],
  status: ["status", "STATUS", "SITUAÇÃO"],
  prazoLimite: ["prazoLimite", "PRAZO LIMITE", "PRAZO LIMITE PARA ENVIO"],
  ramal: ["ramal", "RAMAL"],
  nivel: ["nivel", "NÍVEL", "FCPE"],
  valor: ["valor", "VALOR"],
  cargoId: ["cargoId", "ID CARGO", "idCargo"],
  descricaoCargo: ["descricaoCargo", "DESCRIÇÃO CARGO", "DESC CARGO", "cargo"],
  tipoCargo: ["tipoCargo", "TIPO CARGO", "TIPO"],
  dataInicio: ["dataInicio", "DATA INÍCIO", "DATA INICIO", "INÍCIO"],
  dataFim: ["dataFim", "DATA FIM", "DATA FINAL", "FIM"],
  remuneracao: ["remuneracao", "REMUNERAÇÃO", "REMUNERACAO", "VALOR"],
  competencia: ["competencia", "COMPETÊNCIA", "COMPETENCIA", "MÊS REFERÊNCIA"],
  referencia: ["referencia", "REFERÊNCIA", "REFERENCIA"],
  dataLancamento: ["dataLancamento", "DATA LANÇAMENTO", "DATA LANCAMENTO"],
  tipoLancamento: ["tipoLancamento", "TIPO LANÇAMENTO", "TIPO LANCAMENTO", "TIPO"],
  parcela: ["parcela", "PARCELA"],
  observacao: ["observacao", "OBSERVAÇÃO", "OBSERVACAO"],
  numeroProcesso: ["numeroProcesso", "NÚMERO PROCESSO", "NUMERO PROCESSO", "PROCESSO SEI", "NÚMERO SEI"],
  assunto: ["assunto", "ASSUNTO", "DESCRIÇÃO", "DESCRICAO"],
  unidadeResponsavel: ["unidadeResponsavel", "UNIDADE RESPONSÁVEL", "UNIDADE RESPONSAVEL", "UNIDADE"],
  responsavel: ["responsavel", "RESPONSÁVEL", "RESPONSAVEL"],
  dataAbertura: ["dataAbertura", "DATA ABERTURA", "DATA DE ABERTURA"],
  prioridade: ["prioridade", "PRIORIDADE"],
  telefone: ["telefone", "TELEFONE", "CELULAR", "FONE"],
  email: ["email", "E-MAIL", "EMAIL"],
  sala: ["sala", "SALA", "LOCALIZAÇÃO", "LOCALIZACAO"],
  tipoContato: ["tipoContato", "TIPO CONTATO", "TIPO"],
  observacaoContato: ["observacaoContato", "OBSERVAÇÃO", "OBSERVACAO"],
  dataHora: ["dataHora", "DATA/HORA", "DATA HORA", "TIMESTAMP"],
  usuario: ["usuario", "USUÁRIO", "USUARIO", "E-MAIL"],
  modulo: ["modulo", "MÓDULO", "MODULO"],
  acao: ["acao", "AÇÃO", "ACAO"],
  entidade: ["entidade", "ENTIDADE"],
  idRegistro: ["idRegistro", "ID REGISTRO", "REGISTRO"],
  resumo: ["resumo", "RESUMO", "DESCRIÇÃO", "DESCRICAO"],
} as const;

export type CanonicalField = keyof typeof FIELD_ALIASES;

export function readField(row: GedepRow | Record<string, string> | undefined, field: CanonicalField | string) {
  if (!row) return "";
  const aliases = FIELD_ALIASES[field as CanonicalField] ?? [field];
  const key = Object.keys(row).find((candidate) => aliases.some((alias) => normalizeHeader(alias) === normalizeHeader(candidate)));
  return key ? String(row[key] ?? "").trim() : "";
}

export function sameId(left: unknown, right: unknown) {
  return String(left ?? "").trim() !== "" && String(left ?? "").trim() === String(right ?? "").trim();
}

export function normalizeCpf(value: unknown) { return String(value ?? "").replace(/\D/g, ""); }

export function displayValue(value: unknown, fallback = "Não informado") { const text = String(value ?? "").trim(); return text || fallback; }
