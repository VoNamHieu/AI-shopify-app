type View = "demo" | "prd";

export function TopTabBar({ view, setView }: { view: View; setView: (v: View) => void }) {
  return (
    <div className="bg-paper border-b border-white/10 px-10 py-2 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-paper/95">
      <div className="flex items-center gap-3">
        <span className="w-3 h-3 bg-amber" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300">store_auditor</span>
        <span className="font-mono text-[10px] text-neutral-500">v0.1</span>
      </div>

      <nav className="flex items-center">
        <Tab label="prd" symbol="01" active={view === "prd"} onClick={() => setView("prd")} />
        <Tab label="app demo" symbol="02" active={view === "demo"} onClick={() => setView("demo")} />
      </nav>

      <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
        <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
        <span>system_ready</span>
      </div>
    </div>
  );
}

function Tab({ label, symbol, active, onClick }: { label: string; symbol: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-baseline gap-2 px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] border-b-2 transition-colors ${
        active
          ? "border-amber text-amber"
          : "border-transparent text-neutral-500 hover:text-ink"
      }`}
    >
      <span className={`text-[9px] ${active ? "text-amber" : "text-neutral-600"}`}>{symbol}</span>
      <span>{label}</span>
    </button>
  );
}
