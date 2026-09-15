import { GEDEP_CONFIG, type GedepTab } from "./gedep-config";

export type GedepRow = Record<string, string> & { __row: string };
export type GedepTable = { tabName: GedepTab; headers: string[]; rows: GedepRow[] };
export type AuditEntry = { modulo: string; acao: string; entidade: string; idRegistro?: string; resumo: string; antes?: unknown; depois?: unknown };
export type UpdateResult = { tabName: GedepTab; rowNumber: number; fields: string[] };
type SheetsValuesResponse = { result?: { values?: string[][] } };
type GapiClient = {
  client: {
    init: (options: { discoveryDocs: string[] }) => Promise<void>;
    setToken: (token: { access_token: string } | null) => void;
    sheets: {
      spreadsheets: {
        values: {
          get: (params: unknown) => Promise<SheetsValuesResponse>;
          batchUpdate: (params: unknown) => Promise<unknown>;
          append: (params: unknown) => Promise<unknown>;
        };
      };
    };
  };
};

const normalize = (value: unknown) => String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const columnName = (index: number) => { let number = index + 1; let result = ""; while (number > 0) { const remainder = (number - 1) % 26; result = String.fromCharCode(65 + remainder) + result; number = Math.floor((number - 1) / 26); } return result; };

function gapi() {
  const api = (window as unknown as { gapi?: GapiClient }).gapi;
  if (!api?.client?.sheets) throw new Error("A API Google Sheets ainda não está pronta.");
  return api;
}

async function prepare(token: string) { const api = gapi(); api.client.setToken({ access_token: token }); return api; }

export async function readTable(tabName: GedepTab, token: string | null): Promise<GedepTable> {
  if (!token) throw new Error("Faça login com o Google antes de acessar a planilha.");
  if (!GEDEP_CONFIG.requiredTabs.includes(tabName)) throw new Error(`Aba não autorizada: ${tabName}`);
  const api = await prepare(token);
  const response = await api.client.sheets.spreadsheets.values.get({ spreadsheetId: GEDEP_CONFIG.spreadsheetId, range: `${tabName}!A:ZZ` });
  const values = response.result?.values ?? [];
  const headers = (values[0] ?? []).map(String);
  return { tabName, headers, rows: values.slice(1).map((row, index) => { const item = { __row: String(index + 2) } as GedepRow; headers.forEach((header, column) => { if (header) item[header] = String(row[column] ?? ""); }); return item; }) };
}

export async function readAllRequiredTables(token: string | null) { const tables = await Promise.all(GEDEP_CONFIG.requiredTabs.map((tab) => readTable(tab, token))); return Object.fromEntries(tables.map((table) => [table.tabName, table])) as Record<GedepTab, GedepTable>; }
export async function testConnection(token: string | null) { const table = await readTable("servidores", token); if (!table.headers.length) throw new Error("A aba servidores está vazia ou sem cabeçalho."); return { tab: table.tabName, columns: table.headers.length, rows: table.rows.length }; }

export async function updateFields(params: { tabName: GedepTab; rowNumber: number; fields: Record<string, string>; allowedFields: string[]; token: string | null }): Promise<UpdateResult> {
  if (!params.rowNumber || !params.allowedFields.length) throw new Error("A atualização precisa de uma linha e campos autorizados.");
  if (!params.token) throw new Error("Faça login com o Google antes de gravar.");
  if (params.tabName !== "servidores") throw new Error("A edição está liberada somente para a aba servidores nesta fase.");
  if (Object.keys(params.fields).some((field) => normalize(field) === normalize("idServidor"))) throw new Error("O idServidor é permanente e não pode ser alterado.");
  const table = await readTable(params.tabName, params.token);
  const unauthorized = Object.keys(params.fields).filter((field) => !params.allowedFields.some((allowed) => normalize(allowed) === normalize(field)));
  if (unauthorized.length) throw new Error(`Campos não autorizados: ${unauthorized.join(", ")}`);
  const updates = Object.entries(params.fields).flatMap(([field, value]) => { const index = table.headers.findIndex((header) => normalize(header) === normalize(field)); return index < 0 ? [] : [{ range: `${params.tabName}!${columnName(index)}${params.rowNumber}`, values: [[value]] }]; });
  if (!updates.length) throw new Error(`Nenhum campo autorizado foi encontrado no cabeçalho de ${params.tabName}.`);
  const api = await prepare(params.token);
  await api.client.sheets.spreadsheets.values.batchUpdate({ spreadsheetId: GEDEP_CONFIG.spreadsheetId, resource: { valueInputOption: "USER_ENTERED", data: updates } });
  return { tabName: params.tabName, rowNumber: params.rowNumber, fields: updates.map((update) => update.range.split("!")[1].replace(/[0-9]/g, "")) };
}

export async function appendRows(tabName: GedepTab, rows: Array<Record<string, string>>, token: string | null) {
  if (!token) throw new Error("Faça login com o Google antes de gravar.");
  const table = await readTable(tabName, token);
  const values = rows.map((row) => table.headers.map((header) => row[header] ?? row[Object.keys(row).find((key) => normalize(key) === normalize(header)) ?? ""] ?? ""));
  if (!values.length) return null;
  const api = await prepare(token);
  return api.client.sheets.spreadsheets.values.append({ spreadsheetId: GEDEP_CONFIG.spreadsheetId, range: `${tabName}!A:${columnName(Math.max(table.headers.length - 1, 0))}`, valueInputOption: "USER_ENTERED", insertDataOption: "INSERT_ROWS", resource: { values } });
}

export function writeAudit(entry: AuditEntry, token: string | null) { return appendRows("auditoria", [{ idAuditoria: `aud_${Date.now()}`, dataHora: new Date().toISOString(), usuario: "", modulo: entry.modulo, acao: entry.acao, entidade: entry.entidade, idRegistro: entry.idRegistro ?? "", resumo: entry.resumo, antes: JSON.stringify(entry.antes ?? ""), depois: JSON.stringify(entry.depois ?? "") }], token); }
export { normalize as normalizeHeader };
