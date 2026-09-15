import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readAllRequiredTables, testConnection, updateFields, writeAudit, type GedepTable } from "@/lib/gedep-api";
import type { GedepTab } from "@/lib/gedep-config";
import { useGedepAuth } from "./GedepAuthContext";

type Connection = { status: "idle" | "checking" | "connected" | "error"; message: string; checkedAt?: string; counts?: Partial<Record<GedepTab, number>> };
type StateValue = { connection: Connection; tables: Partial<Record<GedepTab, GedepTable>>; selectedServidorId: string | null; checkConnection: () => Promise<void>; loadAll: () => Promise<void>; updateServidor: (rowNumber: number, idServidor: string, fields: Record<string, string>, before: Record<string, string>) => Promise<void>; selectServidor: (id: string | null) => void };
const Context = createContext<StateValue | null>(null);

export function GedepStateProvider({ children }: { children: ReactNode }) {
  const auth = useGedepAuth();
  const [connection, setConnection] = useState<Connection>({ status: "idle", message: "Aguardando teste de conexão." });
  const [tables, setTables] = useState<Partial<Record<GedepTab, GedepTable>>>({});
  const [selectedServidorId, setSelectedServidorId] = useState<string | null>(null);

  const checkConnection = useCallback(async () => {
    setConnection({ status: "checking", message: "Validando acesso à planilha..." });
    try {
      const result = await testConnection(auth.getAccessToken());
      setConnection({ status: "connected", message: `Conexão confirmada: ${result.rows} registros em servidores.`, checkedAt: new Date().toISOString(), counts: { servidores: result.rows } });
    } catch (reason) {
      setConnection({ status: "error", message: reason instanceof Error ? reason.message : "Não foi possível testar a conexão." });
      throw reason;
    }
  }, [auth]);

  const loadAll = useCallback(async () => {
    setConnection({ status: "checking", message: "Carregando tabelas autorizadas..." });
    try {
      const result = await readAllRequiredTables(auth.getAccessToken());
      setTables(result);
      const counts = Object.fromEntries(Object.entries(result).map(([key, value]) => [key, value.rows.length])) as Partial<Record<GedepTab, number>>;
      setConnection({ status: "connected", message: "Dados carregados para esta sessão.", checkedAt: new Date().toISOString(), counts });
    } catch (reason) {
      setConnection({ status: "error", message: reason instanceof Error ? reason.message : "Não foi possível carregar os dados." });
      throw reason;
    }
  }, [auth]);

  const updateServidor = useCallback(async (rowNumber: number, idServidor: string, fields: Record<string, string>, before: Record<string, string>) => {
    const token = auth.getAccessToken();
    const allowedFields = ["nome", "cpf", "cargoEfetivo", "lotacao", "unidade", "situacaoFuncional", "dataNascimento", "dataAdmissao", "ativo", "email", "telefone"];
    await updateFields({ tabName: "servidores", rowNumber, fields, allowedFields, token });
    await writeAudit({ modulo: "servidores", acao: "ATUALIZAR_CAMPOS", entidade: "servidor", idRegistro: idServidor, resumo: `Atualização parcial de ${Object.keys(fields).join(", ")}`, antes: before, depois: fields }, token);
    setTables((current) => { const table = current.servidores; if (!table) return current; const rows = table.rows.map((row) => row.__row === String(rowNumber) ? { ...row, ...fields } : row); return { ...current, servidores: { ...table, rows } }; });
  }, [auth]);

  const value = useMemo(() => ({ connection, tables, selectedServidorId, checkConnection, loadAll, updateServidor, selectServidor: setSelectedServidorId }), [connection, tables, selectedServidorId, checkConnection, loadAll, updateServidor]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useGedepState() {
  const context = useContext(Context);
  if (!context) throw new Error("useGedepState deve ser usado dentro de GedepStateProvider.");
  return context;
}
