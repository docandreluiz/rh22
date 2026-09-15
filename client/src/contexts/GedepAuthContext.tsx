import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { GEDEP_CONFIG } from "@/lib/gedep-config";

type AuthStatus = "loading" | "signed_out" | "signed_in" | "error";
type User = { email: string; name?: string; picture?: string };
type AuthContextValue = { status: AuthStatus; user: User | null; error: string | null; isPreview: boolean; login: () => void; logout: () => void; enterPreview: () => void; exitPreview: () => void; getAccessToken: () => string | null };
type GoogleTokenResponse = { access_token?: string; expires_in?: number; error?: string };
type GoogleTokenClient = { requestAccessToken: (options?: { prompt?: string }) => void };
type GoogleOAuth2 = { initTokenClient: (options: { client_id: string; scope: string; callback: (response: GoogleTokenResponse) => void }) => GoogleTokenClient; revoke: (token: string) => void };
type GoogleRuntime = { accounts?: { oauth2?: GoogleOAuth2 } };
type GapiRuntime = { load: (name: string, callback: () => void) => void; client?: { init: (options: { discoveryDocs: string[] }) => Promise<void> } };

declare global { interface Window { gapi?: unknown; } }
const AuthContext = createContext<AuthContextValue | null>(null);
const GIS_URL = "https://accounts.google.com/gsi/client";
const GAPI_URL = "https://apis.google.com/js/api.js";
const googleRuntime = () => (window as unknown as { google?: GoogleRuntime }).google;
const gapiRuntime = () => (window as unknown as { gapi?: GapiRuntime }).gapi;

function loadExternalScript(src: string, isReady: () => boolean) {
  return new Promise<void>((resolve, reject) => {
    if (isReady()) { resolve(); return; }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (!script) { script = document.createElement("script"); script.src = src; script.async = true; script.defer = true; document.head.appendChild(script); }
    let elapsed = 0;
    const timer = window.setInterval(() => { elapsed += 50; if (isReady()) { window.clearInterval(timer); resolve(); } else if (elapsed > 15000) { window.clearInterval(timer); reject(new Error(`Não foi possível carregar a biblioteca Google: ${src}`)); } }, 50);
    script.addEventListener("error", () => { window.clearInterval(timer); reject(new Error(`Não foi possível carregar a biblioteca Google: ${src}`)); }, { once: true });
  });
}

async function initializeGoogleLibraries() {
  await Promise.all([loadExternalScript(GIS_URL, () => Boolean(googleRuntime()?.accounts?.oauth2)), loadExternalScript(GAPI_URL, () => Boolean(gapiRuntime()))]);
  const api = gapiRuntime();
  if (!api?.client) await new Promise<void>((resolve) => api?.load("client", resolve));
  if (!gapiRuntime()?.client) throw new Error("A API Google Sheets não ficou disponível.");
  await gapiRuntime()!.client!.init({ discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"] });
}

export function GedepAuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading"); const [user, setUser] = useState<User | null>(null); const [error, setError] = useState<string | null>(null); const [isPreview, setIsPreview] = useState(false);
  const tokenRef = useRef<string | null>(null); const expiryTimer = useRef<number | undefined>(undefined);
  useEffect(() => { initializeGoogleLibraries().then(() => setStatus("signed_out")).catch((reason: Error) => { setError(reason.message); setStatus("signed_out"); }); return () => { if (expiryTimer.current) window.clearTimeout(expiryTimer.current); }; }, []);

  const completeLogin = useCallback(async (response: GoogleTokenResponse) => {
    if (response.error || !response.access_token) { setError("Login cancelado ou não autorizado."); setStatus("error"); return; }
    tokenRef.current = response.access_token;
    try {
      const result = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${response.access_token}` } });
      if (!result.ok) throw new Error("Não foi possível confirmar a conta Google.");
      const profile = await result.json() as { email?: string; name?: string; picture?: string };
      if (!profile.email) throw new Error("A conta Google não retornou um e-mail.");
      setUser({ email: profile.email.toLowerCase(), name: profile.name, picture: profile.picture }); setIsPreview(false); setError(null); setStatus("signed_in");
      const expiresIn = Math.max((response.expires_in ?? 3600) - 60, 30) * 1000;
      expiryTimer.current = window.setTimeout(() => { setError("A sessão Google expirou. Faça uma renovação para continuar."); setStatus("error"); tokenRef.current = null; }, expiresIn);
    } catch (reason) { tokenRef.current = null; setError(reason instanceof Error ? reason.message : "Falha ao confirmar o login."); setStatus("error"); }
  }, []);

  const login = useCallback(() => {
    setError(null); setStatus("loading"); const oauth = googleRuntime()?.accounts?.oauth2;
    if (!oauth) { setError("O login Google ainda está carregando. Tente novamente em alguns segundos."); setStatus("error"); return; }
    const client = oauth.initTokenClient({ client_id: GEDEP_CONFIG.clientId, scope: GEDEP_CONFIG.scope, callback: completeLogin }); client.requestAccessToken({ prompt: user ? "" : "consent" });
  }, [completeLogin, user]);

  const logout = useCallback(() => { if (tokenRef.current && googleRuntime()?.accounts?.oauth2) googleRuntime()?.accounts?.oauth2?.revoke(tokenRef.current); if (expiryTimer.current) window.clearTimeout(expiryTimer.current); tokenRef.current = null; setUser(null); setIsPreview(false); setError(null); setStatus("signed_out"); }, []);
  const value = useMemo<AuthContextValue>(() => ({ status, user, error, isPreview, login, logout, enterPreview: () => { setIsPreview(true); setError(null); }, exitPreview: () => setIsPreview(false), getAccessToken: () => tokenRef.current }), [status, user, error, isPreview, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useGedepAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useGedepAuth deve ser usado dentro de GedepAuthProvider."); return context; }
