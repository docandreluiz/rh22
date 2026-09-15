import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type GedepProfile = "Consulta" | "Operação" | "Gestão" | "Administração";
type Permission = "consulta" | "editar" | "importar" | "auditar";
export type GedepAuditEvent = { id: string; timestamp: string; profile: GedepProfile; action: string; area: string; outcome: "bloqueado" | "permitido"; detail: string };
type AccessContextValue = { profile: GedepProfile; setProfile: (profile: GedepProfile) => void; can: (permission: Permission, area?: string) => boolean; events: GedepAuditEvent[]; record: (event: Omit<GedepAuditEvent, "id" | "timestamp" | "profile">) => void; clearEvents: () => void };
const AccessContext = createContext<AccessContextValue | null>(null);
const PROFILE_KEY = "gedep.active.profile";
const AUDIT_KEY = "gedep.audit.events";

export function GedepAccessProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<GedepProfile>(() => { try { return (sessionStorage.getItem(PROFILE_KEY) as GedepProfile) || "Consulta"; } catch { return "Consulta"; } });
  const [events, setEvents] = useState<GedepAuditEvent[]>(() => { try { const raw = sessionStorage.getItem(AUDIT_KEY); return raw ? JSON.parse(raw) as GedepAuditEvent[] : []; } catch { return []; } });
  useEffect(() => { try { sessionStorage.setItem(AUDIT_KEY, JSON.stringify(events)); } catch { /* sessão pode estar indisponível */ } }, [events]);
  useEffect(() => { try { sessionStorage.setItem(PROFILE_KEY, profile); } catch { /* sessão pode estar indisponível */ } }, [profile]);
  const record = (event: Omit<GedepAuditEvent, "id" | "timestamp" | "profile">) => setEvents((current) => [{ ...event, id: `${Date.now()}-${current.length}`, timestamp: new Date().toISOString(), profile }, ...current].slice(0, 100));
  const clearEvents = () => setEvents([]);
  const setProfile = (next: GedepProfile) => { if (next !== profile) { setEvents((current) => [{ id: `${Date.now()}-${current.length}`, timestamp: new Date().toISOString(), profile, action: "troca_perfil", area: "Configurações", outcome: "permitido" as const, detail: `Perfil alterado de ${profile} para ${next}.` }, ...current].slice(0, 100)); setProfileState(next); } };
  const can = (permission: Permission, area = "") => { if (permission === "consulta") return area !== "Importações" || profile !== "Consulta"; if (permission === "editar") return profile !== "Consulta" && area !== "Relatórios e auditoria"; if (permission === "importar") return profile === "Gestão" || profile === "Administração"; return profile === "Administração"; };
  const value = useMemo(() => ({ profile, setProfile, can, events, record, clearEvents }), [profile, events]);
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>;
}
export function useGedepAccess() { const context = useContext(AccessContext); if (!context) throw new Error("useGedepAccess must be used within GedepAccessProvider"); return context; }
