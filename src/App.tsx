import { useState, useEffect, useRef, useCallback } from "react";
import { TopTabBar } from "./TopTabBar";
import { PRDScreen } from "./PRDScreen";

// ============================================================================
// DATA
// ============================================================================

const store = {
  name: "ErgoFlex",
  url: "ergoflex.demo.shop",
  vertical: "Home office furniture",
  skuCount: 47,
  monthlyTraffic: 84000,
  currentCR: 1.8,
  aov: 84,
  monthlyRevenue: 127000,
  verticalBenchmarks: { median: 1.8, topQuartile: 2.5, topDecile: 3.0 },
};

type Thought = { at: number; text: string };
type Agent = {
  id: string;
  name: string;
  symbol: string;
  tier: 1 | 2 | 3;
  startDelay: number;
  duration: number;
  findingsCount: number;
  thoughts: Thought[];
};

type Tier = { id: 1 | 2 | 3; label: string; description: string };

const tiers: Tier[] = [
  { id: 1, label: "research", description: "market context · competitive landscape" },
  { id: 2, label: "strategy", description: "catalog gap analysis · expansion candidates" },
  { id: 3, label: "optimization", description: "tactical fixes · current store surface" },
];

const agents: Agent[] = [
  // TIER 1 — RESEARCH
  {
    id: "market",
    name: "Market Research",
    symbol: "01",
    tier: 1,
    startDelay: 0,
    duration: 10000,
    findingsCount: 8,
    thoughts: [
      { at: 400, text: "scanning category · home office furniture" },
      { at: 2000, text: "indexed 12 competitor stores" },
      { at: 3800, text: "price band · $180-$520, median $310" },
      { at: 5400, text: "trending search · 'back pain office chair' +47% YoY" },
      { at: 7100, text: "competitor weakness · 8/12 lack warranty above fold" },
      { at: 8900, text: "FLAG · middle-of-pack pricing, no defensible angle" },
    ],
  },

  // TIER 2 — STRATEGY
  {
    id: "catalog",
    name: "Catalog Strategy",
    symbol: "02",
    tier: 2,
    startDelay: 3000,
    duration: 11000,
    findingsCount: 6,
    thoughts: [
      { at: 500, text: "cross-referencing 47 SKUs vs market demand" },
      { at: 2400, text: "demand gap · ergonomic standing mat (no SKU)" },
      { at: 4400, text: "demand gap · monitor riser bundle (no SKU)" },
      { at: 6300, text: "expansion candidate · pro chair XL (size variant)" },
      { at: 8200, text: "projected TAM uplift · ~$120k / yr" },
      { at: 10100, text: "FLAG · 3 unserved high-demand categories" },
    ],
  },

  // TIER 3 — OPTIMIZATION (3 agents, run in parallel)
  {
    id: "page",
    name: "Page Optimization",
    symbol: "03",
    tier: 3,
    startDelay: 6000,
    duration: 12000,
    findingsCount: 14,
    thoughts: [
      { at: 500, text: "scanning homepage · 47 SKUs across 6 sections" },
      { at: 2200, text: "revenue concentration · 8 SKUs = 73%" },
      { at: 4100, text: "top performers buried below fold" },
      { at: 6000, text: "PDP hero · 'premium ergonomic seating'" },
      { at: 8000, text: "social proof · 3/247 reviews visible" },
      { at: 10500, text: "FLAG · hero weak fit · placement inverted" },
    ],
  },
  {
    id: "trust",
    name: "Trust Signals",
    symbol: "04",
    tier: 3,
    startDelay: 6500,
    duration: 10500,
    findingsCount: 5,
    thoughts: [
      { at: 600, text: "auditing trust layer on PDP" },
      { at: 2400, text: "present · SSL, payment badges" },
      { at: 4500, text: "missing · warranty terms" },
      { at: 6400, text: "missing · return policy details" },
      { at: 8200, text: "missing · assembly support info" },
      { at: 9800, text: "FLAG · 3/5 anxiety triggers unresolved" },
    ],
  },
  {
    id: "funnel",
    name: "Ad ↔ Page",
    symbol: "05",
    tier: 3,
    startDelay: 7200,
    duration: 10500,
    findingsCount: 3,
    thoughts: [
      { at: 400, text: "pulling active ad creatives" },
      { at: 2300, text: "top ad · 'back pain relief from $299'" },
      { at: 4400, text: "comparing ad copy → hero copy" },
      { at: 6700, text: "mismatch · 'pain relief' vs 'premium seating'" },
      { at: 9000, text: "FLAG · 30%+ bounce on paid traffic" },
    ],
  },
];

const ANALYSIS_DURATION = 18000;

const audit = {
  scores: {
    overall: 51,
    dimensions: [
      { key: "catalog-strategy", label: "Catalog Strategy", value: 38 },
      { key: "funnel", label: "Ad ↔ Page Coherence", value: 41 },
      { key: "market", label: "Market Position", value: 45 },
      { key: "trust", label: "Trust", value: 49 },
      { key: "page", label: "Page Optimization", value: 56 },
    ],
  },
  marketContext: {
    competitorsIndexed: 12,
    priceMedian: 310,
    priceBand: { low: 180, high: 520 },
    pricePosition: "middle · undifferentiated",
    demandTrend: { label: "back pain office chair", change: 47 },
    competitorWeaknesses: [
      "8/12 lack warranty visible above fold",
      "11/12 do not mention assembly support",
      "5/12 missing return policy on PDP",
    ],
    gaps: [
      { name: "Ergonomic standing mat", segment: "$180-$220", signal: "+47% search YoY", projected: 50000 },
      { name: "Monitor riser bundle", segment: "$120-$180", signal: "78% co-purchase rate", projected: 42000 },
      { name: "Pro Chair XL (size variant)", segment: "$329-$359", signal: "12% inquiry volume unserved", projected: 28000 },
    ],
  },
  narrative:
    "ErgoFlex sits at the furniture vertical median (1.8% CR — ECDB 2024). Top quartile reaches ~2.5%; the CRO ceiling in furniture hovers near 3% (Wayfair itself runs 1.5–2.0% US currently per Grips Intelligence). The proposed fix stack lifts the store from median toward top quartile — meaningful but bounded by vertical reality. Three catalog gaps map directly to competitor traffic. The top-performing PDP misses 3 of 5 trust signals standard for the vertical. The highest-spend ad creative pulls audiences with a pain-relief promise the hero never honors. Top-performing SKUs are buried below fold on the homepage.",
  estimatedBlendedLift: {
    crLiftRelative: 26,
    crAbsoluteAfter: 2.3,
    revenueLiftFromCR: 315000,
    revenueLiftFromCatalog: 120000,
    revenue: 435000,
  },
};

type PRDCandidate = {
  name: string;
  kind: string;
  targetPrice: string;
  marketSignal: string;
  projectedRevenue: number;
  reasoning: string;
};

type HeroRefinement = { trigger: string; agentResponse: string; afterCopy: string };
type TrustRefinement = { trigger: string; agentResponse: string; after: string[] };
type HomepageRefinement = { trigger: string; agentResponse: string; promoted: string[]; archived: string[] };
type PRDRefinement = { trigger: string; agentResponse: string; candidates: PRDCandidate[] };

type Issue = {
  id: string;
  severity: "critical" | "high" | "medium";
  dimension: string;
  title: string;
  reasoning: string;
  impact: {
    kind: "cr" | "tam";
    crLift: number;
    revenueLift: number;
    confidence: "high" | "medium-high" | "medium";
    breakdown: { source: string; value: number }[];
  };
  fix:
    | { type: "homepage"; promoted: string[]; archived: string[]; kept: string[]; refinements: HomepageRefinement[] }
    | { type: "trust"; before: string[]; after: string[]; refinements: TrustRefinement[] }
    | { type: "hero"; beforeCopy: string; afterCopy: string; diffSegments: { kind: "remove" | "add" | "keep"; text: string }[]; refinements: HeroRefinement[] }
    | { type: "prd"; gaps: { name: string; segment: string; competitorCount: number }[]; candidates: PRDCandidate[]; refinements: PRDRefinement[] };
};

const issues: Issue[] = [
  {
    id: "ad-page-mismatch",
    severity: "critical",
    dimension: "Ad ↔ Page Coherence",
    title: "Top-spend ad promises 'back pain relief'. Hero says 'premium seating'.",
    reasoning:
      "Ad audience clicks expecting health framing. Hero pivots to luxury framing. Cognitive mismatch drives bounce. $18.5k/mo ad spend pulls 412k impressions; conservative 30% mismatch-bounce ≈ $5.5k wasted monthly.",
    impact: {
      kind: "cr",
      crLift: 13,
      revenueLift: 175000,
      confidence: "medium-high",
      breakdown: [
        { source: "Message-match restoration", value: 70 },
        { source: "Price anchor visibility", value: 20 },
        { source: "Pain-point reinforcement", value: 10 },
      ],
    },
    fix: {
      type: "hero",
      beforeCopy: "Premium ergonomic seating, redefined",
      afterCopy: "Engineered for back pain relief — ergonomic seating from $299",
      diffSegments: [
        { kind: "remove", text: "Premium ergonomic seating, redefined" },
        { kind: "add", text: "Engineered for back pain relief — ergonomic seating from $299" },
      ],
      refinements: [
        {
          trigger: "less clinical tone",
          agentResponse: "Softened framing — 'designed for' is less prescriptive than 'engineered for'. Keeps pain match, reads warmer.",
          afterCopy: "Designed for back pain — ergonomic chairs from $299",
        },
        {
          trigger: "try a question hook",
          agentResponse: "Reframed as a direct question — addresses anxiety conversationally. Question format typically lifts engagement on health-framed traffic.",
          afterCopy: "Tired of back pain? Ergonomic chairs from $299.",
        },
        {
          trigger: "emphasize value & warranty",
          agentResponse: "Added warranty as trust amplifier on hero. Slightly longer but front-loads three trust signals at once.",
          afterCopy: "End back pain · Ergonomic chair from $299 · 5-year warranty",
        },
      ],
    },
  },
  {
    id: "catalog-expansion",
    severity: "high",
    dimension: "Catalog Strategy",
    title: "3 high-demand categories unserved · ~$120k/yr in net-new revenue",
    reasoning:
      "Market analysis identified 3 product gaps with strong demand signals and existing customer co-purchase patterns. Each gap maps to traffic currently flowing to competitors. Launching these SKUs creates net-new TAM plus cross-sell paths on existing traffic.",
    impact: {
      kind: "tam",
      crLift: 3,
      revenueLift: 120000,
      confidence: "medium-high",
      breakdown: [
        { source: "Captured search demand", value: 45 },
        { source: "Cross-sell on existing traffic", value: 35 },
        { source: "AOV lift from bundling", value: 20 },
      ],
    },
    fix: {
      type: "prd",
      gaps: [
        { name: "Ergonomic standing mat", segment: "$180-$220", competitorCount: 9 },
        { name: "Monitor riser bundle", segment: "$120-$180", competitorCount: 7 },
        { name: "Pro Chair XL · size variant", segment: "$329-$359", competitorCount: 4 },
      ],
      candidates: [
        {
          name: "Standing Mat Pro",
          kind: "mat",
          targetPrice: "$199",
          marketSignal: "+47% search YoY",
          projectedRevenue: 50000,
          reasoning: "Captures search demand currently routed to 9 competitors. Pairs with Standing Desk M2 as natural bundle.",
        },
        {
          name: "Monitor Riser Bundle",
          kind: "monitor",
          targetPrice: "$149",
          marketSignal: "78% co-purchase rate",
          projectedRevenue: 42000,
          reasoning: "Existing customers buy from competitors after Pro Chair purchase. Bundling captures the next cart natively.",
        },
        {
          name: "Pro Chair XL",
          kind: "chair",
          targetPrice: "$349",
          marketSignal: "12% inquiry volume unserved",
          projectedRevenue: 28000,
          reasoning: "Support team logs 12% of inquiries for larger size. Variant-only launch, minimal manufacturing change.",
        },
      ],
      refinements: [
        {
          trigger: "more conservative scope",
          agentResponse: "Stripped to Pro Chair XL only — variant launch, no supplier risk, no new SKU complexity. Lower TAM but near-zero execution risk.",
          candidates: [
            {
              name: "Pro Chair XL",
              kind: "chair",
              targetPrice: "$349",
              marketSignal: "12% inquiry volume unserved",
              projectedRevenue: 28000,
              reasoning: "Variant-only launch. No new supplier, no new SKU class. Captures the smallest verified demand pocket with minimal product risk.",
            },
          ],
        },
        {
          trigger: "reframe as bundles",
          agentResponse: "Restructured as bundle-only plays. AOV lift becomes the primary lever vs new-SKU TAM. Lower margin per SKU but faster to ship.",
          candidates: [
            {
              name: "Standing Desk + Mat Bundle",
              kind: "desk",
              targetPrice: "$729",
              marketSignal: "Bundle uplift +18%",
              projectedRevenue: 60000,
              reasoning: "Bundle Standing Desk M2 + new Standing Mat. Single SKU launch, cross-sell baked in at checkout.",
            },
            {
              name: "Pro Chair + Monitor Riser",
              kind: "chair",
              targetPrice: "$399",
              marketSignal: "78% co-purchase",
              projectedRevenue: 45000,
              reasoning: "Pre-bundle the natural next purchase. Captures cart immediately vs returning visit.",
            },
          ],
        },
        {
          trigger: "add a subscription play",
          agentResponse: "Added a recurring revenue line — chair refresh subscription. Furniture rarely fits subscription model, but ergonomic accessories (cushions/mats) wear out and need replacement.",
          candidates: [
            {
              name: "Standing Mat Pro",
              kind: "mat",
              targetPrice: "$199",
              marketSignal: "+47% search YoY",
              projectedRevenue: 50000,
              reasoning: "Net-new SKU capturing unserved search demand.",
            },
            {
              name: "ErgoFlex Refresh (subscription)",
              kind: "cushion",
              targetPrice: "$29/mo",
              marketSignal: "Net-new revenue model",
              projectedRevenue: 60000,
              reasoning: "Quarterly cushion + lumbar pad refresh. Subscription LTV multiplier vs one-time furniture purchase.",
            },
            {
              name: "Pro Chair XL",
              kind: "chair",
              targetPrice: "$349",
              marketSignal: "12% inquiry unserved",
              projectedRevenue: 28000,
              reasoning: "Size variant launch, minimal manufacturing change.",
            },
          ],
        },
      ],
    },
  },
  {
    id: "trust-signals-pdp",
    severity: "high",
    dimension: "Trust",
    title: "PDP missing 3 of 5 trust signals for furniture vertical",
    reasoning:
      "Furniture buyers face high purchase anxiety: large ticket, can't physically test, assembly uncertainty. Industry benchmark uses 5 trust signals (warranty, return, assembly, shipping, payment). ErgoFlex shows 2/5.",
    impact: {
      kind: "cr",
      crLift: 7,
      revenueLift: 90000,
      confidence: "high",
      breakdown: [
        { source: "Warranty anxiety resolution", value: 40 },
        { source: "Return risk resolution", value: 35 },
        { source: "Assembly anxiety resolution", value: 25 },
      ],
    },
    fix: {
      type: "trust",
      before: ["SSL secure", "Visa / Mastercard / PayPal"],
      after: [
        "SSL secure",
        "Visa / Mastercard / PayPal",
        "5-year structural warranty",
        "90-day free return shipping",
        "Free assembly video + live chat",
      ],
      refinements: [
        {
          trigger: "add financing option",
          agentResponse: "Added 0% APR financing — reduces price-anxiety for $299+ ticket. Affirm or Klarna integration typically takes 2 days.",
          after: [
            "SSL secure",
            "Visa / Mastercard / PayPal",
            "0% APR financing · 12 months",
            "5-year structural warranty",
            "90-day free return shipping",
            "Free assembly video + live chat",
          ],
        },
        {
          trigger: "shorter labels",
          agentResponse: "Compressed labels for scannability. Same 5 signals, half the vertical space on PDP. Tradeoff: less reassuring per signal.",
          after: [
            "SSL · secure checkout",
            "Visa · MC · PayPal",
            "5yr warranty",
            "90d free returns",
            "Assembly help · video + chat",
          ],
        },
        {
          trigger: "lead with returns",
          agentResponse: "Reordered so 90-day returns is first — return risk is the #1 anxiety per Baymard for furniture vertical, not warranty.",
          after: [
            "90-day free return shipping",
            "5-year structural warranty",
            "Free assembly video + live chat",
            "SSL secure",
            "Visa / Mastercard / PayPal",
          ],
        },
      ],
    },
  },
  {
    id: "homepage-restructure",
    severity: "high",
    dimension: "Page Optimization",
    title: "73% of revenue from 8 SKUs — none featured on homepage",
    reasoning:
      "Top performers buried below fold. 14 dead-stock SKUs (zero sales / 60d) consume navigation attention. Visitor lands on slow-movers first, bounces before reaching converters.",
    impact: {
      kind: "cr",
      crLift: 4,
      revenueLift: 50000,
      confidence: "high",
      breakdown: [
        { source: "Top-performer surface lift", value: 55 },
        { source: "Reduced dead-stock distraction", value: 30 },
        { source: "Category clarity gain", value: 15 },
      ],
    },
    fix: {
      type: "homepage",
      promoted: ["Pro Chair", "Standing Desk M2", "Lumbar Cushion", "Monitor Arm Dual", "Footrest Pro", "Cable Tray", "Desk Lamp Warm", "Keyboard Tray"],
      archived: ["Vintage Stool", "Floor Mat Beige", "Plant Stand", "Wire Basket"],
      kept: ["Accessories Bundle", "Office Starter Kit", "Premium Collection"],
      refinements: [
        {
          trigger: "more conservative · only top 4",
          agentResponse: "Reduced promoted set to top 4 SKUs. Less disruptive change for risk-averse merchants. Archives stay the same.",
          promoted: ["Pro Chair", "Standing Desk M2", "Lumbar Cushion", "Monitor Arm Dual"],
          archived: ["Vintage Stool", "Floor Mat Beige", "Plant Stand", "Wire Basket"],
        },
        {
          trigger: "keep more · don't archive",
          agentResponse: "Kept dead-stock visible but moved below promoted. Reduces archival risk if merchant has emotional ties to slow SKUs.",
          promoted: ["Pro Chair", "Standing Desk M2", "Lumbar Cushion", "Monitor Arm Dual", "Footrest Pro", "Cable Tray", "Desk Lamp Warm", "Keyboard Tray"],
          archived: [],
        },
        {
          trigger: "single hero focus",
          agentResponse: "Focused homepage on Pro Chair alone (top revenue SKU). Other top performers move to a 'Complete the setup' row below. Risky if Pro Chair sells out.",
          promoted: ["Pro Chair"],
          archived: ["Vintage Stool", "Floor Mat Beige", "Plant Stand", "Wire Basket"],
        },
      ],
    },
  },
];

// ============================================================================
// UTILITIES
// ============================================================================

const fmtMoney = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;

const fmtMoneyFull = (n: number) =>
  `$${n.toLocaleString("en-US")}`;

function useCountUp(target: number, duration = 1200, trigger: unknown = null) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let frame: number;
    const animate = (t: number) => {
      if (start === null) start = t;
      const elapsed = t - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, trigger]);
  return value;
}

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

function Severity({ s }: { s: Issue["severity"] }) {
  const map = {
    critical: { label: "critical", cls: "text-coral border-coral/40 bg-coral/5" },
    high: { label: "high", cls: "text-amber border-amber/40 bg-amber/5" },
    medium: { label: "medium", cls: "text-neutral-400 border-neutral-600/40 bg-neutral-800/50" },
  } as const;
  const m = map[s];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] font-mono ${m.cls}`}>
      <span className="w-1 h-1 bg-current rounded-full" />
      {m.label}
    </span>
  );
}

function ScoreRing({ value, size = 120 }: { value: number; size?: number }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const animated = useCountUp(value, 1400);
  const offset = c - (animated / 100) * c;
  const color = value >= 70 ? "stroke-forest" : value >= 50 ? "stroke-amber" : "stroke-coral";
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-neutral-800" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          className={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="square"
          style={{ transition: "stroke-dashoffset 0.05s linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className="font-display text-4xl leading-none text-ink">{Math.round(animated)}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-1">score</span>
      </div>
    </div>
  );
}

// ============================================================================
// LANDING
// ============================================================================

function LandingScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col grid-bg">
      <header className="flex items-center justify-between px-10 py-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-amber" />
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-ink">store_auditor / v0.1</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
          <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
          <span>system_ready</span>
        </div>
      </header>

      <main className="flex-1 flex items-center px-10">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber">[ AI CRO AGENT ]</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500">diagnostic_audit</span>
          </div>
          <h1 className="font-display text-6xl leading-[0.98] text-ink mb-6">
            Audit a Shopify store like<br />
            a $10k/mo CRO agency.<br />
            <span className="text-amber">In 60 seconds.</span>
          </h1>
          <p className="font-body text-lg text-neutral-300 leading-relaxed max-w-2xl mb-12">
            Five specialist agents analyze market position, catalog strategy, page CRO, trust signals, and ad-funnel coherence — in parallel. Outputs a prioritized fix list with predicted conversion lift per change.
          </p>

          <div className="border border-white/10 bg-paper-2 p-5 mb-8 max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">› selected_store</span>
              <span className="font-mono text-[10px] text-neutral-500">{store.url}</span>
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="font-display text-2xl text-ink">{store.name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-amber">[ demo ]</span>
            </div>
            <div className="grid grid-cols-4 gap-6 font-mono text-xs border-t border-white/8 pt-4">
              <Stat label="vertical" value={store.vertical} />
              <Stat label="skus" value={store.skuCount.toString()} />
              <Stat label="traffic / mo" value={`${(store.monthlyTraffic / 1000).toFixed(0)}k`} />
              <Stat label="current CR" value={`${store.currentCR}%`} />
            </div>
          </div>

          <button
            onClick={onStart}
            className="group inline-flex items-center gap-4 bg-amber text-paper px-8 py-3.5 font-mono text-sm uppercase tracking-[0.2em] hover:bg-ink transition-colors"
          >
            <span>Run audit</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </div>
      </main>

      <footer className="px-10 py-5 border-t border-white/8 flex items-center justify-between font-mono text-xs text-neutral-500">
        <div className="flex items-center gap-4">
          <span>5_agents</span>
          <span className="text-neutral-700">/</span>
          <span>5_dimensions</span>
          <span className="text-neutral-700">/</span>
          <span>36_checks</span>
        </div>
        <span>est_duration · 18s</span>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-1">{label}</div>
      <div className="text-ink">{value}</div>
    </div>
  );
}

// ============================================================================
// ANALYSIS
// ============================================================================

type AgentState = {
  thoughtLog: string[];
  currentThought: string;
  findings: number;
  progress: number;
  status: "queued" | "running" | "done";
};

function AnalysisScreen({ onComplete }: { onComplete: () => void }) {
  const initial: Record<string, AgentState> = Object.fromEntries(
    agents.map(a => [a.id, { thoughtLog: [], currentThought: "", findings: 0, progress: 0, status: "queued" }])
  );
  const [state, setState] = useState<Record<string, AgentState>>(initial);
  const [allDone, setAllDone] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    agents.forEach(agent => {
      timers.push(setTimeout(() => {
        setState(s => ({ ...s, [agent.id]: { ...s[agent.id], status: "running" } }));
      }, agent.startDelay));

      agent.thoughts.forEach((thought, i) => {
        timers.push(setTimeout(() => {
          setState(s => ({
            ...s,
            [agent.id]: {
              ...s[agent.id],
              currentThought: thought.text,
              thoughtLog: [...s[agent.id].thoughtLog, thought.text],
              findings: Math.round(((i + 1) / agent.thoughts.length) * agent.findingsCount),
            }
          }));
        }, agent.startDelay + thought.at));
      });

      timers.push(setTimeout(() => {
        setState(s => ({
          ...s,
          [agent.id]: { ...s[agent.id], status: "done", progress: 100 }
        }));
      }, agent.startDelay + agent.duration));
    });

    timers.push(setTimeout(() => setAllDone(true), ANALYSIS_DURATION + 400));

    const progressInterval = setInterval(() => {
      const now = Date.now() - startTime.current;
      setState(s => {
        const next: Record<string, AgentState> = { ...s };
        agents.forEach(a => {
          if (now < a.startDelay) {
            next[a.id] = { ...next[a.id], progress: 0 };
          } else if (now > a.startDelay + a.duration) {
            next[a.id] = { ...next[a.id], progress: 100 };
          } else {
            next[a.id] = { ...next[a.id], progress: ((now - a.startDelay) / a.duration) * 100 };
          }
        });
        return next;
      });
    }, 60);

    return () => {
      timers.forEach(t => clearTimeout(t));
      clearInterval(progressInterval);
    };
  }, []);

  const totalFindings = agents.reduce((sum, a) => sum + state[a.id].findings, 0);
  const overallProgress = agents.reduce((sum, a) => sum + state[a.id].progress, 0) / agents.length;

  const tier1 = agents.filter(a => a.tier === 1);
  const tier2 = agents.filter(a => a.tier === 2);
  const tier3 = agents.filter(a => a.tier === 3);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-10 py-6 border-b border-ink/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-mono text-xs uppercase tracking-[0.25em]">auditing · {store.name}</span>
          <span className="inline-block w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
        </div>
        <div className="font-mono text-xs text-neutral-500">
          {totalFindings} findings · {Math.round(overallProgress)}% complete
        </div>
      </header>

      <main className="flex-1 px-10 py-6 flex flex-col max-w-[1400px] mx-auto w-full">
        <TierBlock tier={tiers[0]} agents={tier1} state={state} wide />
        <TierConnector />
        <TierBlock tier={tiers[1]} agents={tier2} state={state} wide />
        <TierConnector />
        <TierBlock tier={tiers[2]} agents={tier3} state={state} />

        <div className="mt-auto pt-6 flex items-center justify-between border-t border-ink/10">
          <div className="flex items-center gap-3 font-mono text-xs text-neutral-500">
            <div className="w-64 h-px bg-neutral-800 relative">
              <div
                className="absolute top-0 left-0 h-px bg-ink transition-all duration-100"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <span>{Math.round(overallProgress)}%</span>
          </div>

          {allDone && (
            <button
              onClick={onComplete}
              className="group inline-flex items-center gap-3 bg-ink text-paper px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-amber hover:text-paper transition-colors fade-in"
            >
              <span>View audit report</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

function TierBlock({
  tier,
  agents,
  state,
  wide = false,
}: {
  tier: Tier;
  agents: Agent[];
  state: Record<string, AgentState>;
  wide?: boolean;
}) {
  const totalProgress = agents.reduce((s, a) => s + state[a.id].progress, 0) / agents.length;
  const allDone = agents.every(a => state[a.id].status === "done");
  return (
    <div className="mb-2">
      <div className="flex items-baseline justify-between mb-2.5">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-500">
            layer {String(tier.id).padStart(2, "0")}
          </span>
          <span className="font-display text-lg text-ink">{tier.label}</span>
          <span className="font-mono text-[10px] text-neutral-500">· {tier.description}</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500">
          <div className="w-20 h-px bg-neutral-800 relative">
            <div className="absolute top-0 left-0 h-px bg-ink transition-all duration-100" style={{ width: `${totalProgress}%` }} />
          </div>
          <span className={allDone ? "text-forest" : ""}>{allDone ? "done" : `${Math.round(totalProgress)}%`}</span>
        </div>
      </div>
      <div className={wide ? "" : "grid grid-cols-3 gap-4"}>
        {agents.map(agent => (
          <AgentPanel key={agent.id} agent={agent} state={state[agent.id]} compact={!wide} />
        ))}
      </div>
    </div>
  );
}

function TierConnector() {
  return (
    <div className="flex items-center gap-2 my-2 pl-4">
      <span className="font-mono text-neutral-300 text-sm">↓</span>
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-neutral-400">feeds into</span>
    </div>
  );
}

function AgentPanel({ agent, state, compact = false }: { agent: Agent; state: AgentState; compact?: boolean }) {
  const recent = state.thoughtLog.slice(compact ? -2 : -3);
  const isFlag = state.currentThought.startsWith("FLAG");
  const dotColor = state.status === "done" ? "bg-forest" : state.status === "running" ? "bg-amber animate-pulse" : "bg-neutral-700";

  if (compact) {
    return (
      <div className={`border bg-paper-2 px-4 py-3.5 transition-colors ${isFlag ? "border-coral/40" : "border-ink/10"}`}>
        <div className="flex items-baseline justify-between mb-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-[9px] text-neutral-400">{agent.symbol}</span>
            <span className="font-display text-base text-ink leading-tight">{agent.name}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
          </div>
        </div>

        <div className="h-px bg-neutral-800 mb-2.5 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-px bg-amber transition-all duration-100" style={{ width: `${state.progress}%` }} />
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-display text-xl text-ink tabular-nums">{state.findings}</span>
          <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500">findings</span>
        </div>

        <div className="font-mono text-[10px] leading-relaxed min-h-[40px]">
          {recent.length === 0 ? (
            <span className="text-neutral-400">waiting…</span>
          ) : (
            <div className="space-y-0.5">
              {recent.slice(0, -1).map((t, i) => (
                <div key={i} className="text-neutral-400 truncate">{t}</div>
              ))}
              <div className={`${isFlag ? "text-coral" : "text-ink"} fade-in-line truncate`} key={state.currentThought}>
                <span className="text-neutral-400">› </span>{state.currentThought}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Wide mode (tier 1 + tier 2): show extra stats based on agent type
  return (
    <div className={`border bg-paper-2 px-5 py-4 transition-colors ${isFlag ? "border-coral/40" : "border-ink/10"}`}>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-3">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] text-neutral-400">{agent.symbol}</span>
              <span className="font-display text-xl text-ink">{agent.name}</span>
            </div>
          </div>
          <div className="font-mono text-[10px] text-neutral-400 mb-3">agent / {agent.id}</div>

          <div className="h-px bg-neutral-800 mb-3 relative overflow-hidden">
            <div className="absolute top-0 left-0 h-px bg-amber transition-all duration-100" style={{ width: `${state.progress}%` }} />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl text-ink tabular-nums">{state.findings}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500">findings</span>
          </div>

          <div className="flex items-center gap-1.5 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500">{state.status}</span>
          </div>
        </div>

        <div className="col-span-9 border-l border-ink/10 pl-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-2">thought stream</div>
          <div className="font-mono text-xs leading-relaxed min-h-[88px]">
            {recent.length === 0 ? (
              <span className="text-neutral-400">waiting for trigger…</span>
            ) : (
              <div className="space-y-1">
                {recent.slice(0, -1).map((t, i) => (
                  <div key={i} className="text-neutral-400">{t}</div>
                ))}
                <div className={`${isFlag ? "text-coral" : "text-ink"} fade-in-line`} key={state.currentThought}>
                  <span className="text-neutral-400">› </span>{state.currentThought}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// AUDIT REPORT
// ============================================================================

function AuditReportScreen({ onOpenFix }: { onOpenFix: (id: string) => void }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-10 py-6 border-b border-ink/10 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em]">
          <span>audit report</span>
          <span className="text-neutral-400">·</span>
          <span className="text-neutral-500">{store.name}</span>
        </div>
        <span className="font-mono text-xs text-neutral-500">36 / 36 checks · 5 agents complete</span>
      </header>

      <main className="flex-1 px-10 py-6 max-w-[1400px] mx-auto w-full">
        <div className="grid grid-cols-12 gap-8 mb-6">
          <div className="col-span-3 flex flex-col items-center">
            <ScoreRing value={audit.scores.overall} size={130} />
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mt-3">
              ergoflex overall
            </div>
          </div>

          <div className="col-span-9">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
              dimension breakdown
            </div>
            <div className="space-y-2">
              {audit.scores.dimensions.map((d, i) => (
                <DimensionBar key={d.key} dimension={d} delay={i * 120} />
              ))}
            </div>
          </div>
        </div>

        <MarketContextPanel />

        <div className="mb-6 max-w-5xl border-l-2 border-amber pl-5 fade-in" style={{ animationDelay: "1.4s" }}>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">synthesis</span>
            <span className="font-mono text-[10px] text-neutral-500">
              · est. blended lift ·{" "}
              <span className="text-forest">+{audit.estimatedBlendedLift.crLiftRelative}% relative</span>{" "}
              <span className="text-neutral-400">({store.currentCR}% → {audit.estimatedBlendedLift.crAbsoluteAfter}%)</span>{" "}
              ·{" "}
              <span className="text-forest">{fmtMoneyFull(audit.estimatedBlendedLift.revenue)}/yr</span>
            </span>
          </div>
          <p className="font-body text-base leading-relaxed text-neutral-200">{audit.narrative}</p>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-4">
            <span className="font-display text-2xl text-ink">prioritized_fixes</span>
            <span className="font-mono text-xs text-neutral-500">{issues.length} issues · ranked by predicted impact</span>
          </div>

          <div className="space-y-2">
            {issues.map((issue, i) => (
              <IssueRow key={issue.id} issue={issue} index={i + 1} onClick={() => onOpenFix(issue.id)} delay={1.6 + i * 0.15} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function MarketContextPanel() {
  const m = audit.marketContext;
  return (
    <div className="mb-6 bg-paper-2 border border-white/8 px-5 py-4 fade-in" style={{ animationDelay: "1.0s" }}>
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-neutral-400">market context</span>
          <span className="font-display text-base text-ink">competitive_landscape</span>
        </div>
        <span className="font-mono text-[10px] text-neutral-500">layer.01/research</span>
      </div>

      <div className="grid grid-cols-12 gap-4 mb-3 pb-3 border-b border-white/8">
        <div className="col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-0.5">competitors</div>
          <div className="font-display text-xl text-ink tabular-nums">{m.competitorsIndexed}</div>
        </div>
        <div className="col-span-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-0.5">median price</div>
          <div className="font-display text-xl text-ink tabular-nums">${m.priceMedian}</div>
          <div className="font-mono text-[9px] text-neutral-500">${m.priceBand.low}–${m.priceBand.high}</div>
        </div>
        <div className="col-span-3">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-0.5">position</div>
          <div className="font-body text-sm text-coral">{m.pricePosition}</div>
        </div>
        <div className="col-span-4">
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-0.5">demand trend</div>
          <div className="flex items-baseline gap-2">
            <span className="font-body text-sm text-ink italic">"{m.demandTrend.label}"</span>
            <span className="font-mono text-xs text-forest">+{m.demandTrend.change}% YoY</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">competitor weaknesses</div>
          <ul className="space-y-0.5">
            {m.competitorWeaknesses.map(w => (
              <li key={w} className="font-body text-xs text-neutral-300 flex gap-2">
                <span className="text-forest">+</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500 mb-1.5">unserved demand · catalog gaps</div>
          <ul className="space-y-0.5">
            {m.gaps.map(g => (
              <li key={g.name} className="font-body text-xs text-neutral-300 flex items-baseline justify-between gap-2">
                <span><span className="text-coral">·</span> {g.name} <span className="text-neutral-500">({g.segment})</span></span>
                <span className="font-mono text-[11px] text-forest tabular-nums">{fmtMoney(g.projected)}/yr</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DimensionBar({ dimension, delay }: { dimension: { key: string; label: string; value: number }; delay: number }) {
  const v = useCountUp(dimension.value, 1100);
  const color = dimension.value >= 70 ? "bg-forest" : dimension.value >= 50 ? "bg-amber" : "bg-coral";

  return (
    <div className="grid grid-cols-12 items-center gap-4 fade-in" style={{ animationDelay: `${delay}ms` }}>
      <div className="col-span-3 font-body text-sm text-neutral-300">{dimension.label}</div>
      <div className="col-span-7 h-1.5 bg-neutral-800 relative overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-full ${color} transition-all`}
          style={{ width: `${v}%`, transitionDuration: "1.1s" }}
        />
      </div>
      <div className="col-span-2 font-mono text-sm tabular-nums text-ink text-right">{Math.round(v)}<span className="text-neutral-400">/100</span></div>
    </div>
  );
}

function IssueRow({ issue, index, onClick, delay }: { issue: Issue; index: number; onClick: () => void; delay: number }) {
  return (
    <div
      className="group bg-paper-2 border border-white/8 hover:border-white/20 px-5 py-4 flex items-start gap-5 fade-in transition-colors"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="font-mono text-xs text-neutral-500 pt-1 w-6 tabular-nums">{String(index).padStart(2, "0")}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <Severity s={issue.severity} />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{issue.dimension}</span>
        </div>
        <div className="font-display text-lg text-ink leading-snug mb-1.5">{issue.title}</div>
        <div className="font-body text-sm text-neutral-400 leading-relaxed max-w-3xl">{issue.reasoning}</div>
      </div>

      <div className="flex flex-col items-end gap-0.5 min-w-[110px] pt-1">
        <div className="font-display text-2xl text-forest tabular-nums leading-none">+{issue.impact.crLift}%</div>
        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-neutral-500">est. relative lift</div>
        <div className="font-mono text-xs text-neutral-400 mt-1.5">{fmtMoney(issue.impact.revenueLift)} / yr</div>
      </div>

      <button
        onClick={onClick}
        className="self-center bg-amber text-paper px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] hover:bg-ink hover:text-paper transition-colors whitespace-nowrap"
      >
        Review change →
      </button>
    </div>
  );
}


// ============================================================================
// MOCK STOREFRONT — used by fix screens to show actual UI before/after
// ============================================================================

function ChairSVG({ size = 200 }: { size?: number }) {
  return (
    <svg viewBox="0 0 200 240" style={{ width: size, height: (size * 240) / 200 }}>
      {/* shadow */}
      <ellipse cx="100" cy="225" rx="65" ry="6" fill="#000" opacity="0.08" />
      {/* backrest */}
      <path
        d="M55,28 Q55,12 78,12 L122,12 Q145,12 145,28 L145,135 Q145,142 138,142 L62,142 Q55,142 55,135 Z"
        fill="#2a5d63"
      />
      <path
        d="M62,28 Q62,20 78,20 L122,20 Q138,20 138,28 L138,128 L62,128 Z"
        fill="#3a7d83"
      />
      {/* lumbar curve */}
      <path d="M62,75 L138,75" stroke="#1a3f44" strokeWidth="2" />
      <path d="M62,95 L138,95" stroke="#1a3f44" strokeWidth="2" opacity="0.5" />
      {/* armrests */}
      <rect x="38" y="60" width="20" height="48" rx="2" fill="#1a3f44" />
      <rect x="142" y="60" width="20" height="48" rx="2" fill="#1a3f44" />
      <rect x="36" y="58" width="24" height="6" rx="2" fill="#2a5d63" />
      <rect x="140" y="58" width="24" height="6" rx="2" fill="#2a5d63" />
      {/* seat */}
      <ellipse cx="100" cy="148" rx="62" ry="14" fill="#1a3f44" />
      <ellipse cx="100" cy="144" rx="62" ry="14" fill="#2a5d63" />
      {/* pedestal */}
      <rect x="94" y="156" width="12" height="48" fill="#666" />
      {/* base */}
      <ellipse cx="100" cy="208" rx="62" ry="6" fill="#444" />
      <path d="M40,208 L160,208" stroke="#333" strokeWidth="2" />
      {/* wheels */}
      <circle cx="48" cy="212" r="6" fill="#222" />
      <circle cx="100" cy="216" r="6" fill="#222" />
      <circle cx="152" cy="212" r="6" fill="#222" />
    </svg>
  );
}

function ProductIcon({ kind, color }: { kind: string; color: string }) {
  const c = color;
  const stroke = "#0009";
  const variants: Record<string, JSX.Element> = {
    chair: (
      <g>
        <rect x="8" y="6" width="18" height="14" rx="2" fill={c} />
        <rect x="10" y="20" width="14" height="2" fill={stroke} />
        <rect x="12" y="22" width="2" height="8" fill={stroke} />
        <rect x="20" y="22" width="2" height="8" fill={stroke} />
      </g>
    ),
    desk: (
      <g>
        <rect x="4" y="14" width="26" height="3" fill={c} />
        <rect x="6" y="17" width="2" height="14" fill={stroke} />
        <rect x="26" y="17" width="2" height="14" fill={stroke} />
      </g>
    ),
    cushion: (
      <g>
        <ellipse cx="17" cy="18" rx="12" ry="6" fill={c} />
        <ellipse cx="17" cy="16" rx="12" ry="6" fill="#3a7d83" />
      </g>
    ),
    monitor: (
      <g>
        <rect x="5" y="5" width="22" height="14" rx="1" fill={c} />
        <rect x="14" y="19" width="4" height="6" fill={stroke} />
        <rect x="10" y="25" width="12" height="2" fill={stroke} />
      </g>
    ),
    foot: (
      <g>
        <rect x="6" y="14" width="20" height="10" rx="3" fill={c} />
        <rect x="8" y="24" width="3" height="4" fill={stroke} />
        <rect x="21" y="24" width="3" height="4" fill={stroke} />
      </g>
    ),
    cable: (
      <g>
        <rect x="5" y="12" width="22" height="8" rx="1" fill={c} />
        <circle cx="10" cy="16" r="1.5" fill={stroke} />
        <circle cx="16" cy="16" r="1.5" fill={stroke} />
        <circle cx="22" cy="16" r="1.5" fill={stroke} />
      </g>
    ),
    lamp: (
      <g>
        <path d="M16 4 L22 12 L10 12 Z" fill={c} />
        <rect x="15" y="12" width="2" height="14" fill={stroke} />
        <rect x="10" y="26" width="12" height="2" fill={stroke} />
      </g>
    ),
    keyboard: (
      <g>
        <rect x="3" y="12" width="26" height="8" rx="1" fill={c} />
        <rect x="6" y="14" width="2" height="2" fill={stroke} />
        <rect x="10" y="14" width="2" height="2" fill={stroke} />
        <rect x="14" y="14" width="2" height="2" fill={stroke} />
        <rect x="18" y="14" width="2" height="2" fill={stroke} />
        <rect x="22" y="14" width="2" height="2" fill={stroke} />
      </g>
    ),
    stool: (
      <g>
        <ellipse cx="17" cy="13" rx="10" ry="3" fill={c} />
        <path d="M9 14 L13 26 M25 14 L21 26 M14 14 L15 26 M20 14 L19 26" stroke={stroke} strokeWidth="1.5" />
      </g>
    ),
    mat: (
      <g>
        <rect x="3" y="10" width="26" height="14" rx="1" fill={c} />
      </g>
    ),
    plant: (
      <g>
        <path d="M16 6 Q10 10 12 18 Q14 14 16 14 Q18 14 20 18 Q22 10 16 6" fill={c} />
        <path d="M12 18 L20 18 L19 26 L13 26 Z" fill={stroke} />
      </g>
    ),
    basket: (
      <g>
        <path d="M6 14 L26 14 L23 26 L9 26 Z" fill={c} />
        <path d="M6 14 L26 14" stroke={stroke} strokeWidth="1" />
        <path d="M11 14 L11 26 M16 14 L16 26 M21 14 L21 26" stroke={stroke} strokeWidth="0.5" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 32 32" className="w-full h-full">
      {variants[kind] || variants.chair}
    </svg>
  );
}

type ProductCard = { name: string; price: string; kind: string; color: string; status?: "dead" | "top" };

const productCards: Record<string, ProductCard> = {
  "Pro Chair":         { name: "Pro Chair",          price: "$299", kind: "chair",    color: "#2a5d63", status: "top" },
  "Standing Desk M2":  { name: "Standing Desk M2",   price: "$549", kind: "desk",     color: "#3a4a5a", status: "top" },
  "Lumbar Cushion":    { name: "Lumbar Cushion",     price: "$49",  kind: "cushion",  color: "#8b3a3a", status: "top" },
  "Monitor Arm Dual":  { name: "Monitor Arm Dual",   price: "$179", kind: "monitor",  color: "#444",    status: "top" },
  "Footrest Pro":      { name: "Footrest Pro",       price: "$79",  kind: "foot",     color: "#5a4a3a", status: "top" },
  "Cable Tray":        { name: "Cable Tray",         price: "$39",  kind: "cable",    color: "#666",    status: "top" },
  "Desk Lamp Warm":    { name: "Desk Lamp Warm",     price: "$89",  kind: "lamp",     color: "#c87a1a", status: "top" },
  "Keyboard Tray":     { name: "Keyboard Tray",      price: "$119", kind: "keyboard", color: "#3a4a5a", status: "top" },
  "Vintage Stool":     { name: "Vintage Stool",      price: "$89",  kind: "stool",    color: "#8b6a4a", status: "dead" },
  "Floor Mat Beige":   { name: "Floor Mat Beige",    price: "$49",  kind: "mat",      color: "#c8b89a", status: "dead" },
  "Plant Stand":       { name: "Plant Stand",        price: "$59",  kind: "plant",    color: "#5a7a5a", status: "dead" },
  "Wire Basket":       { name: "Wire Basket",        price: "$29",  kind: "basket",   color: "#777",    status: "dead" },
  "Floor Mat":         { name: "Floor Mat",          price: "$49",  kind: "mat",      color: "#c8b89a", status: "dead" },
  "Footrest":          { name: "Footrest Pro",       price: "$79",  kind: "foot",     color: "#5a4a3a", status: "top" },
};

function ProductTile({ name, dimmed = false, highlight = "none", small = false }: { name: string; dimmed?: boolean; highlight?: "none" | "promote" | "archive"; small?: boolean }) {
  const p = productCards[name] || { name, price: "$—", kind: "chair", color: "#888" };
  const highlightCls =
    highlight === "promote" ? "ring-2 ring-forest/40 ring-offset-0" :
    highlight === "archive" ? "opacity-50 grayscale" : "";
  return (
    <div className={`relative bg-white border border-neutral-200 transition-all ${highlightCls} ${dimmed ? "opacity-60" : ""}`}>
      <div className={`bg-neutral-50 ${small ? "h-12" : "h-20"} flex items-center justify-center`}>
        <div className={small ? "w-6 h-6" : "w-10 h-10"}>
          <ProductIcon kind={p.kind} color={p.color} />
        </div>
      </div>
      <div className={`${small ? "px-1.5 py-1" : "px-2 py-1.5"} bg-white`}>
        <div className={`font-body ${small ? "text-[8px]" : "text-[10px]"} text-neutral-900 truncate leading-tight`}>{p.name}</div>
        <div className={`font-body ${small ? "text-[8px]" : "text-[9px]"} text-neutral-500 leading-tight`}>{p.price}</div>
      </div>
      {p.status === "dead" && !small && (
        <div className="absolute top-0 right-0 bg-coral text-white text-[7px] uppercase tracking-wider px-1 py-0.5">0 sales</div>
      )}
      {highlight === "promote" && (
        <div className="absolute -top-1.5 -right-1.5 bg-forest text-white text-[7px] uppercase tracking-wider px-1 py-0.5">promoted</div>
      )}
    </div>
  );
}

function StoreChrome({ children, currentPage }: { children: React.ReactNode; currentPage: "pdp" | "home" }) {
  return (
    <div className="bg-white border border-neutral-300 shadow-sm overflow-hidden">
      {/* Browser chrome */}
      <div className="bg-neutral-100 border-b border-neutral-300 px-2 py-1.5 flex items-center gap-1.5">
        <div className="flex gap-1">
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
          <span className="w-2 h-2 rounded-full bg-neutral-300" />
        </div>
        <div className="flex-1 bg-white px-2 py-0.5 text-[9px] text-neutral-500 font-mono">
          ergoflex.shop{currentPage === "pdp" ? "/products/pro-chair" : ""}
        </div>
      </div>
      {/* Store nav */}
      <div className="bg-white border-b border-neutral-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-body font-semibold text-sm tracking-tight text-neutral-900">ErgoFlex</span>
        </div>
        <div className="flex items-center gap-3 font-body text-[10px] text-neutral-700">
          {currentPage === "home" ? (
            <>
              <span>Chairs</span><span>Desks</span><span>Accessories</span>
            </>
          ) : (
            <>
              <span>Shop</span><span>Sale</span><span>About</span>
            </>
          )}
          <span className="text-neutral-400">·</span>
          <span>🔍</span>
          <span>👤</span>
          <span>🛒</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// ----- Mock PDP -----

type PDPState = "hero-before" | "hero-after" | "trust-before" | "trust-after";

function TrustSignalCard({ signal }: { signal: string }) {
  // Auto-detect icon from signal text
  const lower = signal.toLowerCase();
  const icon =
    lower.includes("warranty") ? "🛡" :
    lower.includes("return") || lower.includes("refund") ? "📦" :
    lower.includes("assembly") ? "🔧" :
    lower.includes("financing") || lower.includes("apr") ? "💳" :
    lower.includes("ssl") || lower.includes("secure") ? "🔒" :
    lower.includes("visa") || lower.includes("paypal") || lower.includes("mastercard") || lower.includes("mc") ? "💰" :
    "✓";

  // Split at first separator for label/sublabel
  const splitMatch = signal.match(/^([^·.,—]+)([·.,—]\s*.+)?$/);
  const label = splitMatch?.[1]?.trim() || signal;
  const sublabel = splitMatch?.[2]?.replace(/^[·.,—]\s*/, "").trim() || "";

  return (
    <div className="bg-white border border-neutral-200 px-1.5 py-1">
      <div className="text-sm mb-0.5 leading-none">{icon}</div>
      <div className="font-body text-[9px] font-semibold text-neutral-900 leading-tight">{label}</div>
      {sublabel && <div className="font-body text-[8px] text-neutral-500 leading-tight mt-0.5">{sublabel}</div>}
    </div>
  );
}

function MockPDP({ state, customHeroCopy, customSignals }: { state: PDPState; customHeroCopy?: string; customSignals?: string[] }) {
  const showAfterHero = state === "hero-after";
  const showAfterTrust = state === "trust-after";
  const heroIsFocus = state.startsWith("hero");
  const trustIsFocus = state.startsWith("trust");
  const afterHeroText = customHeroCopy ?? "Engineered for back pain relief — ergonomic seating from $299";
  const trustSignals = customSignals ?? [
    "5-year structural warranty",
    "90-day free return shipping",
    "Free assembly video + live chat",
  ];

  return (
    <StoreChrome currentPage="pdp">
      {/* Breadcrumb */}
      <div className="px-4 py-1.5 bg-white border-b border-neutral-100 font-body text-[9px] text-neutral-500">
        Home / Chairs / Pro Chair
      </div>

      {/* Product main */}
      <div className="px-4 py-3 bg-white grid grid-cols-2 gap-3">
        {/* Image col */}
        <div className="bg-neutral-50 border border-neutral-200 flex items-center justify-center py-2">
          <ChairSVG size={130} />
        </div>

        {/* Info col */}
        <div className="flex flex-col">
          {/* Reviews */}
          <div className="flex items-center gap-1 font-body text-[9px] text-neutral-600 mb-1">
            <span className="text-amber">★★★★☆</span>
            <span>247 reviews</span>
          </div>

          {/* Title */}
          <div className="font-body font-semibold text-sm text-neutral-900 leading-tight mb-1.5">
            ErgoFlex Pro Chair
          </div>

          {/* HERO COPY — this is what changes for hero fix */}
          <div
            className={`relative ${heroIsFocus ? (showAfterHero ? "bg-forest/5 border border-forest/40" : "bg-coral/5 border border-coral/40") : "border border-transparent"} px-1.5 py-1 mb-2 transition-all`}
          >
            <div className={`font-body text-[11px] leading-snug ${heroIsFocus && !showAfterHero ? "text-neutral-700" : "text-neutral-900"}`}>
              {showAfterHero
                ? afterHeroText
                : "Premium ergonomic seating, redefined"}
            </div>
            {heroIsFocus && (
              <div className={`absolute -top-3 right-0 ${showAfterHero ? "bg-forest" : "bg-coral"} text-white text-[7px] uppercase tracking-wider px-1 py-0.5`}>
                {showAfterHero ? "after" : "before"}
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="font-body font-semibold text-base text-neutral-900">$299</span>
            <span className="font-body text-[9px] text-neutral-500">Free shipping over $99</span>
          </div>

          {/* Color picker */}
          <div className="flex items-center gap-1.5 mb-2">
            <span className="font-body text-[9px] text-neutral-600">Color:</span>
            <span className="w-3 h-3 rounded-full bg-[#2a5d63] border border-neutral-900/30" />
            <span className="w-3 h-3 rounded-full bg-neutral-700 border border-neutral-300" />
            <span className="w-3 h-3 rounded-full bg-neutral-200 border border-neutral-300" />
          </div>

          {/* CTA */}
          <button className="bg-neutral-900 text-white py-1.5 font-body text-[10px] uppercase tracking-wider mb-2">
            Add to Cart
          </button>

          {/* Always-visible trust strip */}
          <div className="flex items-center gap-2 text-[8px] text-neutral-500 font-body border-t border-neutral-100 pt-1.5">
            <span>✓ SSL secure</span>
            <span className="text-neutral-300">·</span>
            <span>Visa · MC · PayPal</span>
          </div>
        </div>
      </div>

      {/* TRUST SECTION — only appears in trust-after */}
      {trustIsFocus && (
        <div
          className={`mx-4 my-2 ${showAfterTrust ? "bg-forest/5 border border-forest/40" : "bg-neutral-50 border border-coral/30 border-dashed"} px-3 py-2 relative transition-all`}
        >
          <div className={`absolute -top-2 right-2 ${showAfterTrust ? "bg-forest" : "bg-coral"} text-white text-[7px] uppercase tracking-wider px-1 py-0.5`}>
            {showAfterTrust ? `${trustSignals.length} trust signals added` : "missing trust section"}
          </div>
          {showAfterTrust ? (
            <div className={`grid ${trustSignals.length <= 3 ? "grid-cols-3" : trustSignals.length === 4 ? "grid-cols-4" : trustSignals.length === 5 ? "grid-cols-5" : "grid-cols-6"} gap-1.5 mt-1`}>
              {trustSignals.map(signal => (
                <TrustSignalCard key={signal} signal={signal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-2 font-body text-[10px] text-neutral-400 italic">
              no warranty · no return policy · no assembly info
            </div>
          )}
        </div>
      )}

      {/* Tabs below */}
      <div className="px-4 py-1.5 bg-white border-t border-neutral-200 flex gap-3 font-body text-[9px] text-neutral-600">
        <span className="text-neutral-900 border-b border-neutral-900 pb-0.5">Description</span>
        <span>Specs</span>
        <span>Reviews (247)</span>
      </div>
      <div className="px-4 py-2 bg-white">
        <div className="h-1 bg-neutral-100 mb-1 w-full" />
        <div className="h-1 bg-neutral-100 mb-1 w-11/12" />
        <div className="h-1 bg-neutral-100 mb-1 w-10/12" />
        <div className="h-1 bg-neutral-100 w-9/12" />
      </div>
    </StoreChrome>
  );
}

// ----- Mock Homepage -----

function MockHomepage({ state, customPromoted, customArchived }: { state: "before" | "after"; customPromoted?: string[]; customArchived?: string[] }) {
  const isAfter = state === "after";

  // Before: 8 products in single grid, with 4 dead-stock prominently above
  const beforeGrid = ["Vintage Stool", "Floor Mat", "Plant Stand", "Wire Basket", "Pro Chair", "Standing Desk M2", "Lumbar Cushion", "Monitor Arm Dual"];

  // After: derive promoted top + more from customPromoted (or default)
  const allPromoted = customPromoted ?? ["Pro Chair", "Standing Desk M2", "Lumbar Cushion", "Monitor Arm Dual", "Footrest", "Cable Tray", "Desk Lamp Warm", "Keyboard Tray"];
  const promotedTop = allPromoted.slice(0, 4);
  const promotedMore = allPromoted.slice(4);
  const archivedRow = customArchived ?? ["Vintage Stool", "Floor Mat", "Plant Stand", "Wire Basket"];

  return (
    <StoreChrome currentPage="home">
      {/* Hero banner */}
      <div className={`relative ${isAfter ? "bg-gradient-to-r from-[#2a5d63] to-[#3a7d83]" : "bg-neutral-100"} px-4 py-4 transition-all`}>
        {isAfter ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="font-body text-[9px] text-white/80 uppercase tracking-wider mb-0.5">Bestseller</div>
              <div className="font-body font-semibold text-sm text-white leading-tight">ErgoFlex Pro Chair</div>
              <div className="font-body text-[10px] text-white/90 mb-1">Engineered for back pain relief — from $299</div>
              <div className="inline-block bg-white text-neutral-900 px-2 py-0.5 font-body text-[9px] uppercase tracking-wider">Shop now →</div>
            </div>
            <div className="opacity-90"><ChairSVG size={90} /></div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="font-body text-base text-neutral-700 mb-0.5">Welcome to ErgoFlex</div>
            <div className="font-body text-[10px] text-neutral-500">Premium home office furniture</div>
          </div>
        )}
      </div>

      {/* Before: cluttered nav strip with 7 categories */}
      {!isAfter && (
        <div className="px-4 py-1.5 bg-neutral-50 border-t border-b border-neutral-200 flex justify-between font-body text-[9px] text-neutral-600">
          <span>Chairs</span><span>Desks</span><span>Accessories</span>
          <span>Lighting</span><span>Storage</span><span>Sale</span>
          <span className="text-coral">+ 14 more</span>
        </div>
      )}

      {/* Product grid */}
      <div className="px-4 py-3 bg-white">
        {isAfter ? (
          <>
            <div className="flex items-baseline justify-between mb-1.5">
              <div className="font-body font-semibold text-[10px] uppercase tracking-wider text-neutral-900">⭐ Bestsellers</div>
              <div className="font-body text-[8px] text-neutral-500">73% of revenue</div>
            </div>
            <div className={`grid ${promotedTop.length === 1 ? "grid-cols-1" : promotedTop.length === 2 ? "grid-cols-2" : "grid-cols-4"} gap-1.5 mb-3`}>
              {promotedTop.map(p => (
                <ProductTile key={p} name={p} highlight="promote" />
              ))}
            </div>
            {promotedMore.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {promotedMore.map(p => <ProductTile key={p} name={p} small />)}
              </div>
            )}

            {archivedRow.length > 0 ? (
              <>
                <div className="flex items-baseline justify-between mb-1.5 pt-2 border-t border-neutral-100">
                  <div className="font-body font-semibold text-[10px] uppercase tracking-wider text-neutral-500">Clearance</div>
                  <div className="font-body text-[8px] text-neutral-400">archived</div>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {archivedRow.map(p => <ProductTile key={p} name={p} small dimmed />)}
                </div>
              </>
            ) : (
              <div className="pt-2 border-t border-neutral-100 font-body text-[8px] text-neutral-500 italic">
                ↪ all SKUs retained · dead-stock kept visible per merchant preference
              </div>
            )}
          </>
        ) : (
          <>
            <div className="font-body font-semibold text-[10px] uppercase tracking-wider text-neutral-600 mb-1.5">Our Collection</div>
            <div className="grid grid-cols-4 gap-1.5">
              {beforeGrid.map((p, i) => (
                <ProductTile key={p} name={p} highlight={i < 4 && productCards[p]?.status === "dead" ? "archive" : "none"} />
              ))}
            </div>
            <div className="mt-2 font-body text-[8px] text-coral italic">
              ⚠ 4 dead-stock SKUs above fold · top performers buried below
            </div>
          </>
        )}
      </div>
    </StoreChrome>
  );
}

// ============================================================================
// FIX SCREEN
// ============================================================================

type HistoryEntry = {
  ts: string;
  role: "agent" | "you";
  text: string;
};

function FixScreen({
  issue,
  index,
  total,
  onDecide,
}: {
  issue: Issue;
  index: number;
  total: number;
  onDecide: (decision: "approve" | "reject") => void;
}) {
  // currentIteration: -1 = baseline; 0+ = refinement index
  const [currentIteration, setCurrentIteration] = useState<number>(-1);
  const [thinking, setThinking] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>(() => [
    { ts: tsNow(), role: "agent", text: getBaselineAgentSummary(issue) },
  ]);

  // Reset state when issue changes (when navigating between fixes)
  useEffect(() => {
    setCurrentIteration(-1);
    setThinking(false);
    setCustomInput("");
    setHistory([{ ts: tsNow(), role: "agent", text: getBaselineAgentSummary(issue) }]);
  }, [issue.id]);

  const refinements = (issue.fix as any).refinements as Array<{ trigger: string; agentResponse: string }>;

  function applyRefinement(idx: number, triggerLabel?: string) {
    if (thinking) return;
    const refinement = refinements[idx];
    const label = triggerLabel ?? refinement.trigger;

    setHistory(h => [...h, { ts: tsNow(), role: "you", text: label }]);
    setThinking(true);

    setTimeout(() => {
      setCurrentIteration(idx);
      setThinking(false);
      setHistory(h => [...h, { ts: tsNow(), role: "agent", text: refinement.agentResponse }]);
    }, 1500);
  }

  function applyCustomFeedback() {
    if (thinking || !customInput.trim()) return;
    // Pick the first refinement that hasn't been used recently, or cycle
    const lastUsed = currentIteration;
    const nextIdx = (lastUsed + 1) % refinements.length;
    applyRefinement(nextIdx, customInput.trim());
    setCustomInput("");
  }

  function revertToBaseline() {
    if (thinking) return;
    setHistory(h => [...h, { ts: tsNow(), role: "you", text: "revert to initial proposal" }]);
    setThinking(true);
    setTimeout(() => {
      setCurrentIteration(-1);
      setThinking(false);
      setHistory(h => [...h, { ts: tsNow(), role: "agent", text: "reverted to initial proposal." }]);
    }, 800);
  }

  // Compute current iteration data for mock rendering
  const iter = currentIteration >= 0 ? refinements[currentIteration] : null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-10 py-5 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.25em]">
          <span className="text-ink">fix_review</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-500">{index} of {total}</span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-500">{issue.dimension}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-neutral-500">
            iteration {currentIteration + 1}/{refinements.length + 1}
          </span>
          <Severity s={issue.severity} />
        </div>
      </header>

      <main className="flex-1 px-10 py-6 max-w-[1400px] mx-auto w-full">
        {/* Title + reasoning */}
        <div className="mb-5 max-w-4xl">
          <h2 className="font-display text-3xl leading-tight text-ink mb-2">{issue.title}</h2>
          <p className="font-body text-sm text-neutral-300 leading-relaxed">{issue.reasoning}</p>
        </div>

        {/* Impact bar */}
        <div className="border-y border-white/8 py-3 mb-5 flex items-center justify-between gap-8">
          <div className="flex items-baseline gap-8 flex-wrap">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-0.5">est. relative lift</div>
              <div className="font-display text-2xl text-forest tabular-nums">+{issue.impact.crLift}%</div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-0.5">est. revenue lift</div>
              <div className="font-display text-2xl text-ink tabular-nums">{fmtMoney(issue.impact.revenueLift)}<span className="text-sm text-neutral-500"> / yr</span></div>
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-0.5">confidence</div>
              <div className="font-body text-sm text-ink">{issue.impact.confidence}</div>
            </div>
            <div className="border-l border-white/10 pl-6">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-1">drivers · share of lift</div>
              <div className="flex flex-col gap-0.5">
                {issue.impact.breakdown.map(b => (
                  <div key={b.source} className="flex items-baseline gap-3 font-mono text-[11px]">
                    <span className="text-forest tabular-nums w-10">~{b.value}%</span>
                    <span className="text-neutral-300">{b.source}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Before / After side-by-side mocks */}
        <div className={`grid grid-cols-2 gap-6 mb-5 transition-opacity ${thinking ? "opacity-60" : "opacity-100"}`}>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-coral">before</span>
              <span className="font-mono text-[10px] text-neutral-500">current state</span>
            </div>
            {issue.fix.type === "hero" && <MockPDP state="hero-before" />}
            {issue.fix.type === "trust" && <MockPDP state="trust-before" />}
            {issue.fix.type === "homepage" && <MockHomepage state="before" />}
            {issue.fix.type === "prd" && <MockMarketGaps gaps={issue.fix.gaps} />}
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-forest">after</span>
              <span className="font-mono text-[10px] text-neutral-500">
                {currentIteration >= 0 ? `iteration ${currentIteration + 2} · ${refinements[currentIteration].trigger}` : "agent-proposed · initial"}
              </span>
            </div>
            {/* render after-mock with optional iter overrides */}
            {issue.fix.type === "hero" && (
              <MockPDP state="hero-after" customHeroCopy={iter ? (iter as HeroRefinement).afterCopy : issue.fix.afterCopy} />
            )}
            {issue.fix.type === "trust" && (() => {
              const trustFix = issue.fix;
              const trustIter = iter as TrustRefinement | null;
              const signals = (trustIter?.after ?? trustFix.after).filter(s => !trustFix.before.includes(s));
              return <MockPDP state="trust-after" customSignals={signals} />;
            })()}
            {issue.fix.type === "homepage" && (
              <MockHomepage state="after"
                customPromoted={iter ? (iter as HomepageRefinement).promoted : issue.fix.promoted}
                customArchived={iter ? (iter as HomepageRefinement).archived : issue.fix.archived}
              />
            )}
            {issue.fix.type === "prd" && (
              <MockPRDCandidates candidates={iter ? (iter as PRDRefinement).candidates : issue.fix.candidates} />
            )}
          </div>
        </div>

        {/* FEEDBACK LOOP PANEL */}
        <FeedbackPanel
          refinements={refinements}
          history={history}
          thinking={thinking}
          currentIteration={currentIteration}
          customInput={customInput}
          setCustomInput={setCustomInput}
          onRefine={applyRefinement}
          onCustom={applyCustomFeedback}
          onRevert={revertToBaseline}
        />

        {/* Decision bar */}
        <div className="flex items-center gap-3 border-t border-white/8 pt-5">
          <button
            onClick={() => onDecide("approve")}
            disabled={thinking}
            className="bg-amber text-paper px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:bg-ink transition-colors disabled:opacity-50"
          >
            Approve {currentIteration >= 0 ? `iteration ${currentIteration + 2}` : "fix"} →
          </button>
          <button
            onClick={() => onDecide("reject")}
            disabled={thinking}
            className="bg-paper border border-white/15 text-neutral-300 px-8 py-3 font-mono text-xs uppercase tracking-[0.2em] hover:border-coral hover:text-coral transition-colors disabled:opacity-50"
          >
            Reject
          </button>
          <div className="ml-auto font-mono text-xs text-neutral-500">
            issue {index} of {total}
          </div>
        </div>
      </main>
    </div>
  );
}

function tsNow() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

function getBaselineAgentSummary(issue: Issue): string {
  switch (issue.fix.type) {
    case "hero":
      return `proposed: rewrite hero to '${issue.fix.afterCopy}'. restores message-match with active ad creative.`;
    case "trust":
      return `proposed: add ${issue.fix.after.length - issue.fix.before.length} new trust signals to PDP. closes 3/5 furniture-vertical anxiety triggers.`;
    case "homepage":
      return `proposed: promote ${issue.fix.promoted.length} top SKUs above fold, archive ${issue.fix.archived.length} dead-stock to clearance.`;
    case "prd":
      return `proposed: launch ${issue.fix.candidates.length} new SKUs covering identified market gaps. projected ${fmtMoney(issue.impact.revenueLift)}/yr net-new revenue.`;
  }
}

function FeedbackPanel({
  refinements,
  history,
  thinking,
  currentIteration,
  customInput,
  setCustomInput,
  onRefine,
  onCustom,
  onRevert,
}: {
  refinements: Array<{ trigger: string; agentResponse: string }>;
  history: HistoryEntry[];
  thinking: boolean;
  currentIteration: number;
  customInput: string;
  setCustomInput: (s: string) => void;
  onRefine: (idx: number) => void;
  onCustom: () => void;
  onRevert: () => void;
}) {
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history, thinking]);

  return (
    <div className="border border-amber/30 bg-paper-2 mb-5 relative">
      <div className="absolute -top-2.5 left-4 bg-paper px-2 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-amber">[ refine ]</span>
        <span className="font-mono text-[10px] text-neutral-500">agent_feedback_loop</span>
        {thinking && (
          <span className="font-mono text-[10px] text-amber flex items-center gap-1.5 pulse-glow ml-1 px-1.5">
            <span className="w-1 h-1 rounded-full bg-amber animate-pulse" />
            thinking
          </span>
        )}
      </div>

      <div className="grid grid-cols-12 gap-0 pt-4">
        {/* Left: refinement chips + custom input */}
        <div className="col-span-7 px-5 pb-4 border-r border-white/8">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">› quick refinements</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {refinements.map((r, i) => {
              const isActive = i === currentIteration;
              return (
                <button
                  key={i}
                  disabled={thinking || isActive}
                  onClick={() => onRefine(i)}
                  className={`border px-3 py-1.5 font-mono text-[11px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                    isActive
                      ? "border-amber bg-amber/10 text-amber"
                      : "border-white/15 hover:border-amber text-neutral-300 hover:text-amber"
                  }`}
                >
                  {isActive ? "✓ " : ""}{r.trigger}
                </button>
              );
            })}
            {currentIteration >= 0 && (
              <button
                onClick={onRevert}
                disabled={thinking}
                className="font-mono text-[11px] text-neutral-500 hover:text-ink px-2 py-1.5 disabled:opacity-50"
              >
                ↺ revert to initial
              </button>
            )}
          </div>

          <div className="border border-white/15 bg-paper px-3 py-2 flex items-center gap-2">
            <span className="text-amber font-mono text-xs">›</span>
            <input
              disabled={thinking}
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") onCustom(); }}
              type="text"
              placeholder="or type custom feedback..."
              className="flex-1 bg-transparent border-none outline-none font-body text-sm text-ink placeholder:text-neutral-600 disabled:opacity-50"
            />
            <button
              onClick={onCustom}
              disabled={thinking || !customInput.trim()}
              className="font-mono text-[10px] uppercase tracking-[0.15em] text-neutral-500 hover:text-amber px-2 py-0.5 disabled:opacity-30"
            >
              send →
            </button>
          </div>
        </div>

        {/* Right: history */}
        <div className="col-span-5 px-5 pb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 mb-2">› conversation_log</div>
          <div
            ref={historyRef}
            className="bg-paper border border-white/8 max-h-[160px] overflow-y-auto"
          >
            {history.map((h, i) => (
              <HistoryRow key={i} entry={h} />
            ))}
            {thinking && (
              <div className="px-3 py-2 font-mono text-[11px] text-amber flex items-center gap-2 border-t border-white/5">
                <span className="w-1 h-1 rounded-full bg-amber animate-pulse" />
                <span>agent is iterating...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const isAgent = entry.role === "agent";
  return (
    <div className={`px-3 py-1.5 border-b border-white/5 last:border-b-0 ${isAgent ? "bg-amber/[0.03]" : ""}`}>
      <div className="flex items-baseline gap-2 mb-0.5">
        <span className="font-mono text-[9px] text-neutral-500 tabular-nums">{entry.ts}</span>
        <span className={`font-mono text-[9px] uppercase tracking-wider ${isAgent ? "text-amber" : "text-electric"}`}>
          {isAgent ? "agent" : "you"}
        </span>
      </div>
      <div className="font-body text-xs text-neutral-300 leading-relaxed">{entry.text}</div>
    </div>
  );
}

function HeroReasoning() {
  return (
    <div className="font-body text-sm text-neutral-300 leading-relaxed space-y-2 max-w-4xl">
      <p>· Active ad headline reads <span className="font-mono text-ink">"back pain relief from $299"</span>. Visitor expects pain framing within 2 seconds of landing.</p>
      <p>· Original hero pivots to luxury framing — cognitive mismatch increases bounce on paid traffic. Estimated 30%+ bounce lift on the highest-spend audience.</p>
      <p>· Proposed hero restores message-match, surfaces price anchor ($299) above the fold, and retains "ergonomic" as secondary benefit.</p>
    </div>
  );
}

function TrustReasoning() {
  return (
    <div className="font-body text-sm text-neutral-300 leading-relaxed space-y-2 max-w-4xl">
      <p>· Furniture buyers exhibit high purchase anxiety. Five trust signals are standard for the vertical (Baymard benchmark).</p>
      <p>· Three missing signals each map to a distinct anxiety: warranty (long-term durability), return policy (purchase risk), assembly support (post-purchase friction).</p>
      <p>· Each resolved trigger compounds incrementally — full stack closes the gap to category benchmark.</p>
    </div>
  );
}

function HomepageReasoning() {
  return (
    <div className="font-body text-sm text-neutral-300 leading-relaxed space-y-2 max-w-4xl">
      <p>· Catalog revenue distribution is steep — 8 SKUs drive 73% of revenue. Surface ratio (homepage placement / revenue contribution) is inverted.</p>
      <p>· 14 SKUs show zero sales in 60 days. Each consumes navigation attention, slot inventory, and category browse time without contributing.</p>
      <p>· Proposed restructure: promote top 8 to dedicated bestsellers row, archive dead-stock to clearance, reduce primary navigation to 3 categories.</p>
    </div>
  );
}

function PRDReasoning() {
  return (
    <div className="font-body text-sm text-neutral-300 leading-relaxed space-y-2 max-w-4xl">
      <p>· Market research surfaced 3 distinct demand pockets where ErgoFlex has no SKU. Each pocket has competitor presence (signal: real money flowing).</p>
      <p>· Two of three candidates are bundle/variant plays — minimal manufacturing risk vs new product line. Standing Mat Pro is the largest TAM but requires new supplier.</p>
      <p>· Projected revenue is conservative · assumes 30% capture rate of unserved demand + cross-sell uplift on existing 84k monthly traffic.</p>
      <p>· Each candidate ships as a PRD draft (not auto-launch). Approve here generates PRD doc for product team review.</p>
    </div>
  );
}

function MockMarketGaps({ gaps }: { gaps: { name: string; segment: string; competitorCount: number }[] }) {
  return (
    <div className="bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="bg-neutral-100 border-b border-neutral-300 px-3 py-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">ergoflex catalog · gap analysis</div>
        <div className="font-body text-xs text-neutral-700 mt-0.5">47 SKUs · 3 high-demand categories unserved</div>
      </div>

      <div className="px-3 py-3 space-y-2 bg-neutral-50">
        {gaps.map((g, i) => (
          <div key={g.name} className="bg-white border-2 border-dashed border-coral/40 px-3 py-2.5 relative">
            <div className="absolute -top-1.5 right-2 bg-coral text-white text-[8px] uppercase tracking-wider px-1 py-0.5">
              gap · no SKU
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <div className="font-body font-semibold text-xs text-neutral-900">{g.name}</div>
              <div className="font-mono text-[9px] text-neutral-500">{g.segment}</div>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="font-mono text-[9px] text-neutral-600">competitors filling this:</div>
              <div className="flex gap-0.5">
                {Array.from({ length: g.competitorCount }).map((_, j) => (
                  <span key={j} className="inline-block w-1.5 h-3 bg-coral/40" />
                ))}
              </div>
              <div className="font-mono text-[9px] text-coral">{g.competitorCount} / 12</div>
            </div>
            <div className="font-mono text-[8px] text-neutral-500 italic mt-1">— traffic flowing to competitors —</div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 bg-neutral-50 border-t border-neutral-200 font-mono text-[9px] text-neutral-500">
        ⚠ catalog cannot absorb organic demand for these queries
      </div>
    </div>
  );
}

function MockPRDCandidates({ candidates }: { candidates: PRDCandidate[] }) {
  return (
    <div className="bg-white border border-neutral-300 shadow-sm overflow-hidden">
      <div className="bg-forest/5 border-b border-forest/30 px-3 py-2">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-forest">proposed catalog expansion · 3 PRDs</div>
        <div className="font-body text-xs text-neutral-700 mt-0.5">47 → 50 SKUs · estimated +$120k/yr new revenue</div>
      </div>

      <div className="px-3 py-3 space-y-2 bg-white">
        {candidates.map(c => (
          <div key={c.name} className="border border-forest/30 bg-forest/5 px-2.5 py-2 relative">
            <div className="absolute -top-1.5 right-2 bg-forest text-white text-[8px] uppercase tracking-wider px-1 py-0.5">
              new SKU · PRD draft
            </div>
            <div className="grid grid-cols-12 gap-2 items-start">
              <div className="col-span-2 bg-white border border-neutral-200">
                <div className="bg-neutral-50 h-14 flex items-center justify-center">
                  <div className="w-8 h-8"><ProductIcon kind={c.kind} color="#2a5d63" /></div>
                </div>
              </div>
              <div className="col-span-7">
                <div className="font-body font-semibold text-xs text-neutral-900 mb-0.5">{c.name}</div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-body text-xs font-semibold text-ink">{c.targetPrice}</span>
                  <span className="inline-block bg-amber/15 text-amber px-1 py-0 font-mono text-[8px] uppercase tracking-wider">{c.marketSignal}</span>
                </div>
                <div className="font-body text-[10px] text-neutral-600 leading-snug">{c.reasoning}</div>
              </div>
              <div className="col-span-3 border-l border-forest/20 pl-2">
                <div className="font-mono text-[8px] uppercase tracking-wider text-neutral-500">projected yr 1</div>
                <div className="font-display text-base text-forest tabular-nums">{fmtMoney(c.projectedRevenue)}</div>
                <div className="font-mono text-[8px] text-neutral-500 mt-1">launch · q+1</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-2 bg-neutral-50 border-t border-neutral-200 font-mono text-[9px] text-neutral-500">
        approve → generate PRD docs for product team review
      </div>
    </div>
  );
}


// ============================================================================
// IMPACT SUMMARY
// ============================================================================

function ImpactSummary({
  decisions,
  onReset,
}: {
  decisions: Record<string, "approve" | "reject">;
  onReset: () => void;
}) {
  const approved = issues.filter(i => decisions[i.id] === "approve");

  // CR fixes compound multiplicatively; TAM fixes (catalog expansion) sit outside the CR compound.
  const crApproved = approved.filter(i => i.impact.kind === "cr");
  const compoundedMultiplier = crApproved.reduce((m, i) => m * (1 + i.impact.crLift / 100), 1);
  const newCR = store.currentCR * compoundedMultiplier;
  const relativeLift = (compoundedMultiplier - 1) * 100;
  const totalRev = approved.reduce((s, i) => s + i.impact.revenueLift, 0);

  const newCRAnim = useCountUp(newCR, 1600, newCR);
  const relAnim = useCountUp(relativeLift, 1600, relativeLift);
  const revAnim = useCountUp(totalRev, 1600, totalRev);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-10 py-6 border-b border-ink/10 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-[0.25em]">audit complete</span>
        <span className="font-mono text-xs text-neutral-500">{issues.length} / {issues.length} reviewed</span>
      </header>

      <main className="flex-1 px-10 py-12 flex flex-col">
        <div className="max-w-5xl">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-neutral-500 mb-6">
            estimated production lift
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <div className="font-display text-8xl text-forest leading-none tabular-nums">{newCRAnim.toFixed(1)}%</div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mt-3">projected conversion rate</div>
              <div className="font-mono text-xs text-neutral-500 mt-1">
                {store.currentCR}% → ~{newCR.toFixed(1)}% ·{" "}
                <span className="text-forest">+{relAnim.toFixed(0)}% relative lift</span>
              </div>
            </div>
            <div>
              <div className="font-display text-8xl text-ink leading-none tabular-nums">{fmtMoney(Math.round(revAnim))}</div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 mt-3">annual revenue lift</div>
              <div className="font-mono text-xs text-neutral-500 mt-1">on current traffic · {(store.monthlyTraffic / 1000).toFixed(0)}k / mo</div>
            </div>
          </div>

          <BenchmarkBar
            currentCR={store.currentCR}
            projectedCR={newCR}
            benchmarks={store.verticalBenchmarks}
          />

          <div className="border-t border-ink/10 pt-6 mb-10">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500 mb-4">decisions</div>
            <div className="space-y-2">
              {issues.map(issue => {
                const d = decisions[issue.id];
                return (
                  <div key={issue.id} className="flex items-center gap-4 py-2 border-b border-ink/5 last:border-0">
                    <span className={`font-mono text-xs uppercase tracking-[0.15em] w-20 ${d === "approve" ? "text-forest" : "text-coral"}`}>
                      {d === "approve" ? "approved" : "rejected"}
                    </span>
                    <span className="font-body text-sm text-ink flex-1">{issue.title}</span>
                    <span className="font-mono text-xs text-neutral-500 w-24 text-right">+{issue.impact.crLift}% rel.</span>
                    <span className={`font-mono text-xs w-24 text-right ${d === "approve" ? "text-forest" : "text-neutral-400 line-through"}`}>
                      {fmtMoney(issue.impact.revenueLift)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-ink text-paper px-8 py-4 font-mono text-sm uppercase tracking-[0.2em] hover:bg-amber hover:text-paper transition-colors">
              Deploy to production
            </button>
            <button
              onClick={onReset}
              className="font-mono text-xs uppercase tracking-[0.2em] text-neutral-500 hover:text-ink transition-colors"
            >
              ↻ reset demo
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function BenchmarkBar({
  currentCR,
  projectedCR,
  benchmarks,
}: {
  currentCR: number;
  projectedCR: number;
  benchmarks: { median: number; topQuartile: number; topDecile: number };
}) {
  const [animProgress, setAnimProgress] = useState(0);
  useEffect(() => {
    setAnimProgress(0);
    let start: number | null = null;
    let frame: number;
    const animate = (t: number) => {
      if (start === null) start = t;
      const elapsed = t - start;
      const progress = Math.min(elapsed / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimProgress(eased);
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [currentCR, projectedCR]);

  const maxCR = 3.5;
  const projectedAnim = currentCR + (projectedCR - currentCR) * animProgress;
  const pct = (v: number) => (v / maxCR) * 100;

  return (
    <div className="mb-12 max-w-4xl">
      <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-1 flex items-baseline justify-between">
        <span>vertical benchmark · home & furniture</span>
        <span className="font-mono text-[10px] normal-case tracking-normal text-neutral-600">
          source · ECDB, IRP, Dynamic Yield 2024-25
        </span>
      </div>
      <div className="font-mono text-[10px] text-neutral-500 mb-8">
        where the store sits in the vertical distribution
      </div>

      <div className="relative h-32">
        {/* axis track */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/20 -translate-y-1/2" />
        <div
          className="absolute top-1/2 h-px bg-forest/40 -translate-y-1/2 transition-all"
          style={{ left: `${pct(currentCR)}%`, width: `${pct(projectedAnim) - pct(currentCR)}%` }}
        />

        {/* benchmark markers (ABOVE the axis) */}
        <BenchmarkMarker pct={pct(benchmarks.median)} label="median" value={benchmarks.median} />
        <BenchmarkMarker pct={pct(benchmarks.topQuartile)} label="top quartile" value={benchmarks.topQuartile} />
        <BenchmarkMarker pct={pct(benchmarks.topDecile)} label="top decile" value={benchmarks.topDecile} />

        {/* position dots (ON the axis, labels BELOW) */}
        <PositionDot pct={pct(currentCR)} color="coral" value={currentCR} label="current" />
        <PositionDot pct={pct(projectedAnim)} color="forest" value={projectedAnim} label="projected" big />

        {/* axis end labels */}
        <div className="absolute bottom-0 left-0 font-mono text-[9px] text-neutral-600 tabular-nums">0.0%</div>
        <div className="absolute bottom-0 right-0 font-mono text-[9px] text-neutral-600 tabular-nums">{maxCR.toFixed(1)}%</div>
      </div>
    </div>
  );
}

function BenchmarkMarker({ pct, label, value }: { pct: number; label: string; value: number }) {
  return (
    <div className="absolute top-0 -translate-x-1/2 flex flex-col items-center" style={{ left: `${pct}%` }}>
      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-400 whitespace-nowrap">
        {label}
      </div>
      <div className="font-mono text-[10px] text-neutral-300 tabular-nums mt-0.5">{value.toFixed(1)}%</div>
      <div className="w-px h-4 bg-neutral-500/70 mt-1" />
    </div>
  );
}

function PositionDot({
  pct,
  color,
  value,
  label,
  big = false,
}: {
  pct: number;
  color: "coral" | "forest";
  value: number;
  label: string;
  big?: boolean;
}) {
  const dotCls = color === "coral" ? "bg-coral" : "bg-forest";
  const ringCls = color === "coral" ? "ring-coral/25" : "ring-forest/30";
  const textCls = color === "coral" ? "text-coral" : "text-forest";
  const size = big ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
  return (
    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${pct}%` }}>
      <div className={`${size} ${dotCls} rounded-full ring-4 ${ringCls}`} />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex flex-col items-center whitespace-nowrap pt-1">
        <div className={`font-mono text-[11px] tabular-nums font-semibold ${textCls}`}>{value.toFixed(2)}%</div>
        <div className={`font-mono text-[9px] uppercase tracking-[0.15em] ${textCls} opacity-80 mt-0.5`}>{label}</div>
      </div>
    </div>
  );
}

// ============================================================================
// APP
// ============================================================================

type Screen = "landing" | "analysis" | "report" | "fix" | "summary";

export default function App() {
  const [view, setView] = useState<"demo" | "prd">("prd");
  const [screen, setScreen] = useState<Screen>("landing");
  const [currentFixIndex, setCurrentFixIndex] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, "approve" | "reject">>({});

  const startAnalysis = useCallback(() => setScreen("analysis"), []);
  const analysisComplete = useCallback(() => setScreen("report"), []);

  const openFix = useCallback((id: string) => {
    const idx = issues.findIndex(i => i.id === id);
    if (idx === -1) return;
    setCurrentFixIndex(idx);
    setScreen("fix");
  }, []);

  const decideFix = useCallback((decision: "approve" | "reject") => {
    const current = issues[currentFixIndex];
    const newDecisions = { ...decisions, [current.id]: decision };
    setDecisions(newDecisions);

    const nextUndecided = issues.findIndex((iss, idx) => idx > currentFixIndex && !newDecisions[iss.id]);
    if (nextUndecided !== -1) {
      setCurrentFixIndex(nextUndecided);
    } else {
      const anyUndecided = issues.findIndex(iss => !newDecisions[iss.id]);
      if (anyUndecided !== -1) {
        setCurrentFixIndex(anyUndecided);
      } else {
        setScreen("summary");
      }
    }
  }, [currentFixIndex, decisions]);

  const reset = useCallback(() => {
    setScreen("landing");
    setCurrentFixIndex(0);
    setDecisions({});
  }, []);

  return (
    <div className="bg-paper text-ink font-body antialiased">
      <TopTabBar view={view} setView={setView} />

      {view === "prd" && <PRDScreen />}

      {view === "demo" && (
        <>
          {screen === "landing" && <LandingScreen onStart={startAnalysis} />}
          {screen === "analysis" && <AnalysisScreen onComplete={analysisComplete} />}
          {screen === "report" && <AuditReportScreen onOpenFix={openFix} />}
          {screen === "fix" && (
            <FixScreen
              issue={issues[currentFixIndex]}
              index={currentFixIndex + 1}
              total={issues.length}
              onDecide={decideFix}
            />
          )}
          {screen === "summary" && <ImpactSummary decisions={decisions} onReset={reset} />}

          {screen !== "landing" && screen !== "summary" && (
            <button
              onClick={reset}
              className="fixed bottom-6 right-6 font-mono text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-ink transition-colors bg-paper border border-ink/15 px-3 py-2"
            >
              ↻ reset
            </button>
          )}
        </>
      )}
    </div>
  );
}
