import { useEffect, useState, type ReactNode } from "react";
import { Activity, ArrowRight, CheckCircle2, Database, ExternalLink, FileSpreadsheet, LayoutDashboard, LockKeyhole, Menu, RefreshCw, ShieldCheck, Sparkles, Users, X } from "lucide-react";
import { Toaster, toast } from "sonner";
import { GEDEP_BUILD, GEDEP_NAV, isGedepRoute, type GedepRoute } from "@/lib/gedep-config";
import { GedepAuthProvider, useGedepAuth } from "@/contexts/GedepAuthContext";
import { GedepStateProvider, useGedepState } from "@/contexts/GedepStateContext";
import Home, { ArchitecturePage, CargosPage, FichaPage, FcpePage, GenericModulePage, ImportacoesPage, LoginScreen, RamaisPage, ReportsPage, SeiPage, ServerPage, SettingsPage } from "@/pages/Home";

function useHashRoute(): [GedepRoute, (route: GedepRoute) => void] {
  const getRoute = () => { const value = window.location.hash.replace(/^#\/?/, ""); return isGedepRoute(value) ? value : "dashboard"; };
  const [route, setRoute] = useState<GedepRoute>(getRoute);
  useEffect(() => { const onHash = () => setRoute(getRoute()); window.addEventListener("hashchange", onHash); return () => window.removeEventListener("hashchange", onHash); }, []);
  return [route, (next) => { window.location.hash = `/${next}`; }];
}

function LoadingScreen() {
  return <div className="min-h-screen bg-[#f5f7f8] grid place-items-center"><div className="flex items-center gap-3 text-sm font-semibold text-[#52616b]"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#d5dee2] border-t-[#117c8a]" /> Preparando o ambiente seguro...</div></div>;
}

function RouteView({ route, onNavigate }: { route: GedepRoute; onNavigate: (route: GedepRoute) => void }) {
  if (route === "dashboard") return <Home onNavigate={onNavigate} />;
  if (route === "servidores") return <ServerPage onNavigate={onNavigate} />;
  if (route === "configuracoes") return <SettingsPage />;
  if (route === "ficha") return <FichaPage onNavigate={onNavigate} />;
  if (route === "cargos") return <CargosPage onNavigate={onNavigate} />;
  if (route === "fcpe") return <FcpePage onNavigate={onNavigate} />;
  if (route === "sei") return <SeiPage onNavigate={onNavigate} />;
  if (route === "ramais") return <RamaisPage onNavigate={onNavigate} />;
  if (route === "importacoes") return <ImportacoesPage onNavigate={onNavigate} />;
  if (route === "relatorios") return <ReportsPage />;
  const nav = GEDEP_NAV.find((item) => item.id === route);
  return <GenericModulePage title={nav?.label ?? "Módulo"} route={route} />;
}

function Sidebar({ route, onNavigate, mobileOpen, onClose }: { route: GedepRoute; onNavigate: (route: GedepRoute) => void; mobileOpen: boolean; onClose: () => void }) {
  const groups = [{ id: "visao", label: "Visão geral" }, { id: "operacao", label: "Operação" }, { id: "gestao", label: "Gestão" }];
  return <><div className={`fixed inset-0 z-30 bg-[#102127]/35 backdrop-blur-sm lg:hidden ${mobileOpen ? "block" : "hidden"}`} onClick={onClose} /><aside className={`fixed inset-y-0 left-0 z-40 flex w-[282px] flex-col border-r border-[#dce5e7] bg-[#fbfcfc] px-4 py-5 shadow-2xl shadow-[#153c4214] transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
    <div className="flex items-center justify-between px-3"><button className="flex items-center gap-3 text-left" onClick={() => { onNavigate("dashboard"); onClose(); }}><span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[#0d6574] text-white shadow-lg shadow-[#0d657426]"><Sparkles size={19} /></span><span><span className="block text-[15px] font-extrabold tracking-[-.03em] text-[#12323b]">GEDEP</span><span className="block text-[10px] font-bold uppercase tracking-[.16em] text-[#76909a]">Gestão integrada</span></span></button><button className="rounded-lg p-2 text-[#81969d] hover:bg-[#edf3f3] lg:hidden" onClick={onClose}><X size={18} /></button></div>
    <div className="mt-8 space-y-6 overflow-y-auto pb-4">{groups.map((group) => <div key={group.id}><div className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[.17em] text-[#9aabb0]">{group.label}</div><nav className="space-y-1">{GEDEP_NAV.filter((item) => item.group === group.id).map((item) => { const active = item.id === route; const Icon = item.id === "dashboard" ? LayoutDashboard : item.id === "servidores" ? Users : item.id === "ficha" ? FileSpreadsheet : item.id === "configuracoes" ? LockKeyhole : Activity; return <button key={item.id} className={`group flex w-full items-center gap-3 rounded-[11px] px-3 py-2.5 text-left text-[13px] font-semibold transition ${active ? "bg-[#e4f2f1] text-[#0b6a78] shadow-sm" : "text-[#60747b] hover:bg-[#f0f5f5] hover:text-[#123f49]"}`} onClick={() => { onNavigate(item.id); onClose(); }}><Icon size={17} strokeWidth={active ? 2.4 : 1.9} /><span className="flex-1">{item.label}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-[#13a2a0]" />}</button>; })}</nav></div>)}</div>
    <div className="mt-auto rounded-[16px] border border-[#d9e8e8] bg-[#eff8f7] p-3.5"><div className="flex items-start gap-2.5"><ShieldCheck size={17} className="mt-0.5 text-[#0b7c83]" /><div><p className="text-xs font-bold text-[#155964]">Dados sob controle</p><p className="mt-1 text-[11px] leading-4 text-[#66878b]">A planilha permanece privada e cada módulo terá campos autorizados.</p></div></div></div>
  </aside></>;
}

function Header({ route, onMenu, onNavigate }: { route: GedepRoute; onMenu: () => void; onNavigate: (route: GedepRoute) => void }) {
  const auth = useGedepAuth();
  const nav = GEDEP_NAV.find((item) => item.id === route);
  return <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-4 border-b border-[#dfe7e8]/80 bg-[#f8faf9]/90 px-4 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button className="rounded-xl border border-[#dce6e7] bg-white p-2.5 text-[#557179] shadow-sm lg:hidden" onClick={onMenu}><Menu size={19} /></button><div><div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#8ba0a5]"><span>GEDEP</span><span className="text-[#b8c4c7]">/</span><span>{nav?.label}</span></div><h1 className="mt-1 text-[19px] font-extrabold tracking-[-.035em] text-[#17343d] sm:text-[21px]">{nav?.label ?? "Início"}</h1></div></div><div className="flex items-center gap-2.5"><div className={`hidden items-center gap-2 rounded-full border px-3 py-2 text-[11px] font-bold sm:flex ${auth.isPreview ? "border-[#eadbb9] bg-[#fff8e9] text-[#9a7327]" : "border-[#cde5dd] bg-[#effaf5] text-[#28745a]"}`}><span className={`h-1.5 w-1.5 rounded-full ${auth.isPreview ? "bg-[#d9a63b]" : "bg-[#36a275]"}`} />{auth.isPreview ? "Modo demonstração" : "Sessão protegida"}</div><div className="hidden h-9 w-px bg-[#e0e7e8] sm:block" /><div className="flex items-center gap-2.5"><div className="grid h-9 w-9 place-items-center rounded-full bg-[#d8ecec] text-xs font-extrabold text-[#0b6874]">{auth.user?.email?.slice(0, 1).toUpperCase() ?? "D"}</div><div className="hidden max-w-[180px] sm:block"><p className="truncate text-xs font-bold text-[#28444b]">{auth.user?.name ?? (auth.isPreview ? "Visitante" : "Usuário")}</p><p className="truncate text-[11px] text-[#83969b]">{auth.user?.email ?? "Visualização sem conexão"}</p></div><button className="rounded-lg p-2 text-[#71868c] hover:bg-white hover:text-[#b34b4b]" title="Sair" onClick={auth.logout}><ArrowRight size={16} /></button></div></div></header>;
}

function Shell() {
  const [route, onNavigate] = useHashRoute();
  const [mobileOpen, setMobileOpen] = useState(false);
  const auth = useGedepAuth();
  return <div className="min-h-screen bg-[#f5f7f8] text-[#17343d]"><Sidebar route={route} onNavigate={onNavigate} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} /><div className="lg:pl-[282px]"><Header route={route} onMenu={() => setMobileOpen(true)} onNavigate={onNavigate} /><main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-8 sm:py-8"><div className="mb-6 flex items-center justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-[.16em] text-[#8da0a5]">Ambiente administrativo</p><p className="mt-1 text-sm text-[#71868c]">{auth.isPreview ? "Explore a estrutura enquanto a planilha não está conectada." : "Uma única sessão para todas as áreas do sistema."}</p></div>{auth.isPreview && <button className="hidden items-center gap-2 rounded-xl bg-[#0d6875] px-3.5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[#0d687520] transition hover:-translate-y-0.5 sm:flex" onClick={auth.login}><RefreshCw size={14} /> Conectar Google</button>}</div><RouteView route={route} onNavigate={onNavigate} /></main><footer className="px-4 pb-8 pt-2 text-center text-[11px] text-[#9aabad] sm:px-8">GEDEP {GEDEP_BUILD.version} · {GEDEP_BUILD.phase} · Base legada preservada para migração segura</footer></div></div>;
}

function AppGate() {
  const auth = useGedepAuth();
  if (auth.status === "loading") return <LoadingScreen />;
  if ((auth.status === "signed_out" || auth.status === "error") && !auth.isPreview) return <LoginScreen />;
  return <Shell />;
}

export default function App() {
  return <GedepAuthProvider><GedepStateProvider><AppGate /><Toaster position="top-right" richColors /></GedepStateProvider></GedepAuthProvider>;
}
