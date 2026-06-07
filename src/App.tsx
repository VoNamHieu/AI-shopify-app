import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDotDashed,
  Download,
  Loader2,
  ShoppingBag,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";

type GenerationStatus =
  | "idle"
  | "analyzing"
  | "analysisReady"
  | "processing"
  | "complete";

type Product = {
  name: string;
  description: string;
  targetMarket: string;
};

type Competitor = {
  name: string;
  price: string;
  positioning: string;
  keywords: string[];
  reviewThemes: string[];
  cta: string;
};

type LandingPageOption = {
  id: string;
  layout: "editorial" | "studio" | "conversion";
  name: string;
  label: string;
  angle: string;
  ghost: string;
  bg: string;
  panel: string;
  accent: string;
  dark: string;
  headline: string;
  subheadline: string;
  note: string;
  cta: string;
  price: string;
  benefits: [string, string][];
  comparison: [string, string, string][];
  chips: string[];
  finalCta: string;
};

const demoProduct: Product = {
  name: "ErgoFlex Chair",
  description:
    "An ergonomic office chair designed for remote workers who sit for long hours and want better posture, comfort, and productivity.",
  targetMarket: "Remote workers and home office professionals.",
};

const competitors: Competitor[] = [
  {
    name: "ComfortPro",
    price: "$39",
    positioning: "Ergonomic comfort for long workdays",
    keywords: ["ergonomic", "comfort", "back support", "posture"],
    reviewThemes: ["back pain relief", "comfortable seat", "easy setup"],
    cta: "Work comfortably longer",
  },
  {
    name: "WorkNest",
    price: "$45",
    positioning: "Premium workspace upgrade",
    keywords: ["premium", "productivity", "home office", "focus"],
    reviewThemes: ["productivity", "premium look", "durable materials"],
    cta: "Upgrade your workspace",
  },
  {
    name: "SitWell",
    price: "$29",
    positioning: "Affordable daily comfort",
    keywords: ["affordable", "daily comfort", "simple setup"],
    reviewThemes: ["budget-friendly", "practical", "good value"],
    cta: "Better comfort for less",
  },
];

const processingSteps = [
  "Analyzing competitor signals",
  "Extracting keyword gaps",
  "Generating positioning strategy",
  "Preparing AI recommendations",
];

const storefrontSteps = [
  "Reading generated analysis",
  "Selecting storefront template",
  "Creating store sections",
  "Storefront preview ready",
];

const landingPageOptions: LandingPageOption[] = [
  {
    id: "comfort-productivity",
    layout: "editorial",
    name: "Comfort + Productivity",
    label: "Recommended",
    angle: "Best fit for remote workers who want posture support and focus.",
    ghost: "SIT BETTER",
    bg: "#78B893",
    panel: "#93C9A7",
    accent: "#047857",
    dark: "#10241C",
    headline: "Sit Better. Work Better.",
    subheadline:
      "ErgoFlex helps remote workers stay comfortable, focused, and supported through long workdays.",
    note: "Designed for posture, comfort, and daily productivity.",
    cta: "Shop ErgoFlex",
    price: "$36",
    benefits: [
      ["Posture Support", "Built to support your back through long focus sessions."],
      ["All-Day Comfort", "Soft, breathable comfort for remote work routines."],
      ["Productivity Ready", "Stay focused longer with a workspace built around comfort."],
    ],
    comparison: [
      ["Price", "$36", "$29-$45"],
      ["Positioning", "Comfort + productivity", "Comfort or affordability"],
      ["Best For", "Remote workers", "General office use"],
    ],
    chips: [
      "Back pain relief",
      "Comfortable seat",
      "Productivity",
      "Home office setup",
      "Good value",
    ],
    finalCta: "Upgrade your workday comfort",
  },
  {
    id: "premium-workspace",
    layout: "studio",
    name: "Premium Workspace",
    label: "Upsell angle",
    angle: "A polished page for merchants who want a premium workspace story.",
    ghost: "FOCUS MODE",
    bg: "#6EB5FF",
    panel: "#8DC4FF",
    accent: "#2563eb",
    dark: "#0C1B33",
    headline: "Build a Better Home Office.",
    subheadline:
      "ErgoFlex turns long workdays into a cleaner, calmer workspace experience with supportive comfort and a premium look.",
    note: "Premium-feeling support without premium pricing.",
    cta: "Upgrade Your Chair",
    price: "$36",
    benefits: [
      ["Workspace Upgrade", "A refined silhouette that makes any desk setup feel intentional."],
      ["Focus Support", "Comfort cues that help reduce distractions during deep work."],
      ["Durable Daily Build", "Made for repeated remote-work routines and long meetings."],
    ],
    comparison: [
      ["Price", "$36", "$39-$45 premium peers"],
      ["Positioning", "Premium feel + accessible price", "Premium price first"],
      ["Best For", "Home-office professionals", "Style-led shoppers"],
    ],
    chips: [
      "Premium look",
      "Productivity",
      "Durable materials",
      "Focus",
      "Home office setup",
    ],
    finalCta: "Make your workspace feel complete",
  },
  {
    id: "value-comfort",
    layout: "conversion",
    name: "Accessible Comfort",
    label: "Value angle",
    angle: "A direct-response page for price-sensitive comfort shoppers.",
    ghost: "GOOD VALUE",
    bg: "#F4845F",
    panel: "#F79B7F",
    accent: "#ea580c",
    dark: "#35180D",
    headline: "Daily Comfort, Fair Price.",
    subheadline:
      "ErgoFlex gives remote workers the posture support they need without pushing into premium chair pricing.",
    note: "Smart comfort for the home office budget.",
    cta: "Get Better Comfort",
    price: "$36",
    benefits: [
      ["Fair Pricing", "Positioned below premium competitors while keeping a quality feel."],
      ["Simple Setup", "Easy to place into an existing home-office routine."],
      ["Practical Support", "Comfort-first details for everyday work, calls, and focus blocks."],
    ],
    comparison: [
      ["Price", "$36", "$29 budget to $45 premium"],
      ["Positioning", "Accessible ergonomic comfort", "Cheap comfort or premium upgrades"],
      ["Best For", "Budget-aware remote workers", "General office use"],
    ],
    chips: [
      "Budget-friendly",
      "Good value",
      "Simple setup",
      "Comfortable seat",
      "Practical",
    ],
    finalCta: "Start sitting better for less",
  },
];

function App() {
  const [product, setProduct] = useState<Product>(demoProduct);
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [ideaFound, setIdeaFound] = useState(false);
  const [isFindingIdea, setIsFindingIdea] = useState(false);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [selectedPage, setSelectedPage] = useState(0);
  const [uploadedPreviewImage, setUploadedPreviewImage] = useState<string | null>(
    null,
  );
  const [exportMessage, setExportMessage] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => {
    return () => timers.current.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (!exportMessage) {
      return;
    }

    const timer = window.setTimeout(() => setExportMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [exportMessage]);

  const findTrendingProduct = () => {
    if (ideaFound || isFindingIdea) {
      return;
    }

    setIsFindingIdea(true);
    const timer = window.setTimeout(() => {
      setIdeaFound(true);
      setIsFindingIdea(false);
    }, 1400);
    timers.current.push(timer);
  };

  const generateAnalysis = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setStatus("analyzing");
    setCompletedSteps([]);
    setActiveStep(0);
    setSelectedPage(0);

    processingSteps.forEach((_, index) => {
      const timer = window.setTimeout(
        () => {
          setCompletedSteps((current) =>
            current.includes(index) ? current : [...current, index],
          );

          if (index === processingSteps.length - 1) {
            setActiveStep(null);
            setStatus("analysisReady");
          } else {
            setActiveStep(index + 1);
          }
        },
        650 + index * 650,
      );
      timers.current.push(timer);
    });
  };

  const generateStorefront = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    setStatus("processing");
    setCompletedSteps([]);
    setActiveStep(0);

    storefrontSteps.forEach((_, index) => {
      const timer = window.setTimeout(
        () => {
          setCompletedSteps((current) =>
            current.includes(index) ? current : [...current, index],
          );

          if (index === storefrontSteps.length - 1) {
            setActiveStep(null);
            setStatus("complete");
          } else {
            setActiveStep(index + 1);
          }
        },
        650 + index * 650,
      );
      timers.current.push(timer);
    });
  };

  return (
    <AppLayout
      left={
        <LeftPanel
          product={product}
          setProduct={setProduct}
          status={status}
          ideaFound={ideaFound}
          isFindingIdea={isFindingIdea}
          activeStep={activeStep}
          completedSteps={completedSteps}
          onFindIdea={findTrendingProduct}
          onAnalyze={generateAnalysis}
          onGenerateStorefront={generateStorefront}
          onExport={() =>
            setExportMessage("Draft page exported to Shopify successfully.")
          }
        />
      }
      right={
        <RightPanel
          status={status}
          completedSteps={completedSteps}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          uploadedPreviewImage={uploadedPreviewImage}
          setUploadedPreviewImage={setUploadedPreviewImage}
        />
      }
      toast={<Toast message={exportMessage} />}
    />
  );
}

function AppLayout({
  left,
  right,
  toast,
}: {
  left: ReactNode;
  right: ReactNode;
  toast: ReactNode;
}) {
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState(false);

  return (
    <main className="h-screen overflow-hidden bg-[#f5f6f8] text-slate-950">
      <div className="relative flex h-full">
        <aside
          className={[
            "h-full overflow-x-hidden overflow-y-auto border-r border-slate-200 bg-white transition-[width,min-width,opacity] duration-300 ease-in-out",
            isWorkspaceCollapsed
              ? "w-0 min-w-0 border-r-0 opacity-0"
              : "w-[38%] min-w-[430px] opacity-100",
          ].join(" ")}
          aria-hidden={isWorkspaceCollapsed}
        >
          {left}
        </aside>
        <button
          type="button"
          onClick={() => setIsWorkspaceCollapsed((current) => !current)}
          className={[
            "absolute top-1/2 z-30 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-lg transition-all duration-300 hover:bg-slate-50",
            isWorkspaceCollapsed ? "left-4" : "left-[calc(38%_-_22px)]",
          ].join(" ")}
          aria-label={
            isWorkspaceCollapsed
              ? "Show AI processing workspace"
              : "Collapse AI processing workspace"
          }
          title={
            isWorkspaceCollapsed
              ? "Show AI processing workspace"
              : "Full-screen preview"
          }
        >
          {isWorkspaceCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
        <section
          className={[
            "h-full overflow-y-auto bg-[#eef1f4] transition-[width] duration-300 ease-in-out",
            isWorkspaceCollapsed ? "w-full" : "w-[62%]",
          ].join(" ")}
        >
          {right}
        </section>
      </div>
      {toast}
    </main>
  );
}

function LeftPanel({
  product,
  setProduct,
  status,
  ideaFound,
  isFindingIdea,
  activeStep,
  completedSteps,
  onFindIdea,
  onAnalyze,
  onGenerateStorefront,
  onExport,
}: {
  product: Product;
  setProduct: (product: Product) => void;
  status: GenerationStatus;
  ideaFound: boolean;
  isFindingIdea: boolean;
  activeStep: number | null;
  completedSteps: number[];
  onFindIdea: () => void;
  onAnalyze: () => void;
  onGenerateStorefront: () => void;
  onExport: () => void;
}) {
  const hasAnalysis = status === "analysisReady" || status === "complete";
  const isAnalyzing = status === "analyzing";
  const isGeneratingStorefront = status === "processing";

  return (
    <div className="space-y-5 p-6">
      <header className="space-y-2 border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <Sparkles size={14} />
          AI Idea Workspace
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">
            AI Store Designer
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Start from a trending product idea, then generate analysis and a storefront.
          </p>
        </div>
      </header>

      <IdeaDiscoveryCard
        ideaFound={ideaFound}
        isFindingIdea={isFindingIdea}
        onFindIdea={onFindIdea}
      />
      {ideaFound && (
        <ProductInputCard
          product={product}
          setProduct={setProduct}
          isProcessing={isAnalyzing}
          isAnalysisReady={hasAnalysis}
          onAnalyze={onAnalyze}
        />
      )}
      {(isAnalyzing || hasAnalysis || isGeneratingStorefront) && (
        <ProcessingTimeline
          status={status}
          activeStep={activeStep}
          completedSteps={completedSteps}
        />
      )}
      {hasAnalysis && (
        <>
          <CompetitorDatasetCard competitors={competitors} />
          <MarketSignalSummary />
          <RecommendationCard />
          <ActionButtons
            isProcessing={isGeneratingStorefront}
            canExport={status === "complete"}
            canGenerateStorefront={status === "analysisReady"}
            onGenerateStorefront={onGenerateStorefront}
            onExport={onExport}
          />
        </>
      )}
    </div>
  );
}

function IdeaDiscoveryCard({
  ideaFound,
  isFindingIdea,
  onFindIdea,
}: {
  ideaFound: boolean;
  isFindingIdea: boolean;
  onFindIdea: () => void;
}) {
  return (
    <Card
      label="Idea discovery"
      title="Trending product category"
      icon={<Sparkles size={16} />}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
                Category
              </p>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">
                Home Office Essentials
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Remote workers continue buying ergonomic comfort products that
                improve daily productivity and home-office setup quality.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
              Trending
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onFindIdea}
          disabled={ideaFound || isFindingIdea}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-default disabled:bg-emerald-500"
        >
          {isFindingIdea ? (
            <Loader2 className="animate-spin" size={16} />
          ) : ideaFound ? (
            <Check size={16} />
          ) : (
            <Sparkles size={16} />
          )}
          {isFindingIdea
            ? "Finding Trending Product..."
            : ideaFound
              ? "Trending Product Found"
              : "Find Trending Product"}
        </button>

        {isFindingIdea && (
          <div className="rounded-lg border border-dashed border-emerald-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-50 text-emerald-700">
                <Loader2 className="animate-spin" size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  AI is scanning product ideas
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Checking category demand, competitor density, keyword signals,
                  and pricing opportunities.
                </p>
              </div>
            </div>
          </div>
        )}

        {ideaFound && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                  Product selector
                </p>
                <select
                  value="ErgoFlex Chair"
                  onChange={() => undefined}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                >
                  <option>ErgoFlex Chair</option>
                </select>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Fixed demo option. Marked trending because competitor signals
                  show demand for posture support, comfort, productivity, and
                  accessible pricing.
                </p>
              </div>
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <Check size={15} />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                "Remote work",
                "Ergonomics",
                "Productivity",
                "Accessible price",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function ProductInputCard({
  product,
  setProduct,
  isProcessing,
  isAnalysisReady,
  onAnalyze,
}: {
  product: Product;
  setProduct: (product: Product) => void;
  isProcessing: boolean;
  isAnalysisReady: boolean;
  onAnalyze: () => void;
}) {
  return (
    <Card
      label="Selected idea"
      title="Product context"
      icon={<ShoppingBag size={16} />}
    >
      <div className="space-y-4">
        <Field label="Product Name">
          <input
            value={product.name}
            onChange={(event) =>
              setProduct({ ...product, name: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </Field>
        <Field label="Product Description">
          <textarea
            value={product.description}
            rows={4}
            onChange={(event) =>
              setProduct({ ...product, description: event.target.value })
            }
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </Field>
        <Field label="Target Market">
          <input
            value={product.targetMarket}
            onChange={(event) =>
              setProduct({ ...product, targetMarket: event.target.value })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
          />
        </Field>
        <button
          type="button"
          onClick={onAnalyze}
          disabled={isProcessing || isAnalysisReady}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
          {isAnalysisReady ? "Analysis Generated" : "Generate Analysis"}
        </button>
      </div>
    </Card>
  );
}

function CompetitorDatasetCard({ competitors }: { competitors: Competitor[] }) {
  return (
    <Card
      label="Generated analysis data"
      title="Competitor signal dataset"
      icon={<TrendingUp size={16} />}
    >
      <div className="space-y-3">
        {competitors.map((competitor) => (
          <div
            key={competitor.name}
            className="rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-950">
                    {competitor.name}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                    {competitor.price}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {competitor.positioning}
                </p>
              </div>
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                <Check size={14} />
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {competitor.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ProcessingTimeline({
  status,
  activeStep,
  completedSteps,
}: {
  status: GenerationStatus;
  activeStep: number | null;
  completedSteps: number[];
}) {
  const steps = status === "processing" ? storefrontSteps : processingSteps;

  return (
    <Card
      label="AI reasoning"
      title="Generation timeline"
      icon={<CircleDotDashed size={16} />}
    >
      {status === "idle" ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-500">
          Ready to generate storefront and analysis
        </div>
      ) : (
        <ol className="space-y-3">
          {steps.map((step, index) => {
            const isComplete = completedSteps.includes(index);
            const isActive = activeStep === index;

            return (
              <li key={step} className="flex items-center gap-3">
                <span
                  className={[
                    "grid h-7 w-7 shrink-0 place-items-center rounded-full border",
                    isComplete
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : isActive
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-300",
                  ].join(" ")}
                >
                  {isComplete ? (
                    <Check size={15} />
                  ) : isActive ? (
                    <Loader2 className="animate-spin" size={15} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-current" />
                  )}
                </span>
                <span
                  className={[
                    "text-sm",
                    isComplete || isActive
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-400",
                  ].join(" ")}
                >
                  {step}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}

function MarketSignalSummary() {
  return (
    <Card label="Generated analysis" title="Market signal summary" icon={<Target size={16} />}>
      <div className="space-y-4 text-sm">
        <InfoRow label="Selected category" value="Home Office Essentials" />
        <InfoRow label="Trending product" value="ErgoFlex Chair" />
        <InfoRow
          label="Most common keywords"
          value="ergonomic, comfort, posture, productivity"
        />
        <InfoRow label="Average competitor price" value="$37.67" />
        <InfoRow
          label="Dominant market angle"
          value="Comfort + productivity for long workdays"
        />
        <div className="rounded-lg bg-emerald-50 p-3 text-emerald-950 ring-1 ring-emerald-100">
          <p className="text-xs font-semibold uppercase tracking-normal text-emerald-700">
            Detected opportunity
          </p>
          <p className="mt-1 leading-6">
            Competitors talk about comfort, but few connect posture improvement
            with productivity. Position ErgoFlex around “work better by sitting
            better”.
          </p>
        </div>
      </div>
    </Card>
  );
}

function RecommendationCard() {
  return (
    <Card
      label="AI recommendation"
      title="Storefront strategy"
      icon={<BadgeCheck size={16} />}
    >
      <div className="space-y-4 text-sm">
        <InfoRow label="Suggested segment" value="Remote workers aged 25-40" />
        <InfoRow
          label="Recommended positioning"
          value="Improve posture and productivity during long workdays"
        />
        <InfoRow
          label="Suggested differentiator"
          value="Ergonomic comfort without premium pricing"
        />
        <InfoRow label="Confidence" value="High" />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            Reasoning
          </p>
          <p className="mt-1 leading-6 text-slate-700">
            2 of 3 competitors focus on comfort. Only 1 competitor strongly owns
            productivity. Average competitor price is $37.67, so ErgoFlex can
            position as premium-feeling but accessible.
          </p>
        </div>
      </div>
    </Card>
  );
}

function ActionButtons({
  isProcessing,
  canExport,
  canGenerateStorefront,
  onGenerateStorefront,
  onExport,
}: {
  isProcessing: boolean;
  canExport: boolean;
  canGenerateStorefront: boolean;
  onGenerateStorefront: () => void;
  onExport: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      <button
        type="button"
        disabled={isProcessing}
        onClick={onGenerateStorefront}
        className={[
          "flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed",
          canGenerateStorefront
            ? "bg-slate-950 text-white hover:bg-slate-800"
            : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:text-slate-400",
        ].join(" ")}
      >
        {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
        {canGenerateStorefront ? "Generate Storefront" : "Regenerate Storefront"}
      </button>
      <button
        type="button"
        disabled={!canExport}
        onClick={onExport}
        className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        <Download size={16} />
        Export to Shopify
      </button>
    </div>
  );
}

function RightPanel({
  status,
  completedSteps,
  selectedPage,
  setSelectedPage,
  uploadedPreviewImage,
  setUploadedPreviewImage,
}: {
  status: GenerationStatus;
  completedSteps: number[];
  selectedPage: number;
  setSelectedPage: (index: number) => void;
  uploadedPreviewImage: string | null;
  setUploadedPreviewImage: (image: string | null) => void;
}) {
  const progress = useMemo(
    () => {
      const totalSteps =
        status === "processing" ? storefrontSteps.length : processingSteps.length;
      return Math.round((completedSteps.length / totalSteps) * 100);
    },
    [completedSteps.length, status],
  );

  return (
    <div className="min-h-full p-4 xl:p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            Live preview
          </p>
          <h2 className="text-xl font-semibold text-slate-950">
            Generated Shopify page
          </h2>
        </div>
        <div className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
          {status === "complete"
            ? `${landingPageOptions[selectedPage].name} ready`
            : status === "processing"
              ? `${progress}% generated`
              : status === "analysisReady"
                ? "Analysis ready"
                : status === "analyzing"
                  ? `${progress}% analyzed`
              : "Waiting for input"}
        </div>
      </div>
      {status !== "idle" && (
        <LandingPageSelector
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          disabled={status !== "complete"}
        />
      )}
      <StorePreview
        status={status}
        selectedPage={selectedPage}
        uploadedPreviewImage={uploadedPreviewImage}
        setUploadedPreviewImage={setUploadedPreviewImage}
      />
    </div>
  );
}

function LandingPageSelector({
  selectedPage,
  setSelectedPage,
  disabled,
}: {
  selectedPage: number;
  setSelectedPage: (index: number) => void;
  disabled: boolean;
}) {
  const navigateOption = (direction: "prev" | "next") => {
    setSelectedPage(
      direction === "next"
        ? (selectedPage + 1) % landingPageOptions.length
        : (selectedPage + landingPageOptions.length - 1) %
            landingPageOptions.length,
    );
  };

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
          {landingPageOptions.map((option, index) => {
            const isSelected = selectedPage === index;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => setSelectedPage(index)}
                className={[
                  "min-w-0 flex-1 rounded-lg border px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-60",
                  isSelected
                    ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white",
                ].join(" ")}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: option.accent }}
                  />
                  <span className="truncate text-sm font-semibold">
                    {option.name}
                  </span>
                </div>
                <p
                  className={[
                    "mt-1 truncate text-xs",
                    isSelected ? "text-white/70" : "text-slate-500",
                  ].join(" ")}
                >
                  {option.label}
                </p>
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => navigateOption("prev")}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous landing page option"
          >
            <ArrowLeft size={18} />
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => navigateOption("next")}
            className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next landing page option"
          >
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function StorePreview({
  status,
  selectedPage,
  uploadedPreviewImage,
  setUploadedPreviewImage,
}: {
  status: GenerationStatus;
  selectedPage: number;
  uploadedPreviewImage: string | null;
  setUploadedPreviewImage: (image: string | null) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const enableInlineEdit = (element: HTMLElement) => {
    element.setAttribute("contenteditable", "true");
    element.setAttribute("spellcheck", "false");
    element.classList.add("preview-text-editing");
    element.focus();

    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection?.removeAllRanges();
    selection?.addRange(range);

    const finishEditing = () => {
      element.removeAttribute("contenteditable");
      element.removeAttribute("spellcheck");
      element.classList.remove("preview-text-editing");
      element.removeEventListener("blur", finishEditing);
      element.removeEventListener("keydown", handleKeyDown);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        element.blur();
      }

      if (event.key === "Escape") {
        element.blur();
      }
    };

    element.addEventListener("blur", finishEditing);
    element.addEventListener("keydown", handleKeyDown);
  };

  const handlePreviewClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("[data-image-upload-target]")) {
      event.preventDefault();
      fileInputRef.current?.click();
      return;
    }

    if (target.closest("button,input,textarea,select,option")) {
      return;
    }

    const editableTarget = target.closest<HTMLElement>(
      "h1,h2,h3,h4,p,a,span,strong,em,small,summary,li",
    );

    if (!editableTarget || editableTarget.isContentEditable) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    enableInlineEdit(editableTarget);
  };

  const handlePreviewImageUpload = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setUploadedPreviewImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  if (status === "idle" || status === "analyzing" || status === "analysisReady") {
    return (
      <div className="grid min-h-[calc(100vh-112px)] place-items-center rounded-lg border border-dashed border-slate-300 bg-white shadow-sm">
        <div className="max-w-sm text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-500">
            <Sparkles size={24} />
          </div>
          <p className="mt-4 text-base font-semibold text-slate-800">
            {status === "analysisReady"
              ? "Analysis is ready. Generate storefront to preview the page."
              : "Generated storefront preview will appear here."}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {status === "analyzing"
              ? "AI is generating competitor analysis before building the storefront."
              : "Find the trending ErgoFlex idea, generate analysis, then generate the storefront preview."}
          </p>
        </div>
      </div>
    );
  }

  if (status === "processing") {
    return <PreviewSkeleton />;
  }

  return (
    <div className="store-preview-shell" onClick={handlePreviewClick}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePreviewImageUpload}
      />
      <GeneratedLandingPage
        option={landingPageOptions[selectedPage]}
        uploadedPreviewImage={uploadedPreviewImage}
      />
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="h-9 bg-slate-950" />
      <div className="space-y-8 p-8">
        <div className="grid grid-cols-[1.1fr_0.9fr] gap-8">
          <div className="space-y-4">
            <div className="skeleton h-5 w-28 rounded bg-slate-200" />
            <div className="skeleton h-12 w-3/4 rounded bg-slate-200" />
            <div className="skeleton h-4 w-full rounded bg-slate-200" />
            <div className="skeleton h-4 w-4/5 rounded bg-slate-200" />
            <div className="skeleton h-11 w-36 rounded-lg bg-slate-200" />
          </div>
          <div className="skeleton h-72 rounded-lg bg-slate-200" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="skeleton h-32 rounded-lg bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function GeneratedLandingPage({
  option,
  uploadedPreviewImage,
}: {
  option: LandingPageOption;
  uploadedPreviewImage: string | null;
}) {
  if (option.layout === "studio") {
    return (
      <PomeloPreview option={option} uploadedPreviewImage={uploadedPreviewImage} />
    );
  }

  if (option.layout === "conversion") {
    return (
      <MatierePreview
        option={option}
        uploadedPreviewImage={uploadedPreviewImage}
      />
    );
  }

  return (
    <LuxuryEditorialPreview
      option={option}
      uploadedPreviewImage={uploadedPreviewImage}
    />
  );
}

function LuxuryEditorialPreview({
  option,
  uploadedPreviewImage,
}: {
  option: LandingPageOption;
  uploadedPreviewImage: string | null;
}) {
  const products = [
    ["Lumbar", "$36", "Posture support for long focus sessions.", "Support module"],
    ["Breath", "$36", "Soft daily comfort with breathable seating.", "Comfort build"],
    ["Focus", "$36", "A quiet workspace upgrade for deep work.", "Productivity chair"],
    ["Settle", "$36", "Simple setup for home office routines.", "Home office"],
    ["Align", "$36", "Designed to improve sitting habits.", "Posture system"],
    ["Value", "$36", "Premium-feeling comfort without premium pricing.", "Accessible comfort"],
  ];

  return (
    <div className="vespre-preview overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="vespre-announcement">
        <div className="vespre-marquee-track">
          {[
            "Free shipping on all home office essentials today",
            "Generated from competitor market signals",
            `${option.name} landing page concept`,
            "Draft ready for Shopify export",
            "Free shipping on all home office essentials today",
            "Generated from competitor market signals",
            `${option.name} landing page concept`,
            "Draft ready for Shopify export",
          ].map((item, index) => (
            <div className="vespre-marquee-item" key={`${item}-${index}`}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <nav className="vespre-nav">
        <div className="vespre-nav-inner">
          <ul className="vespre-nav-links">
            <li>
              <a href="#vespre-benefits">Benefits</a>
            </li>
            <li>
              <a href="#vespre-proof">Proof</a>
            </li>
            <li>
              <a href="#vespre-faq">FAQ</a>
            </li>
          </ul>
          <a href="#vespre-hero" className="vespre-wordmark">
            ERGOFLEX
          </a>
          <div className="vespre-nav-right">
            <a href="#vespre-proof">Signals</a>
            <a href="#vespre-faq">Support</a>
            <a href="#vespre-cart" className="vespre-cart-pill">
              <span className="vespre-cart-dot" />
              Bag (1)
            </a>
          </div>
        </div>
      </nav>

      <section className="vespre-hero" id="vespre-hero">
        <div className="vespre-hero-inner">
          <div className="vespre-hero-left">
            <div className="vespre-hero-eyebrow vespre-eyebrow">
              AI Generated · {option.label}
            </div>
            <h1>
              A chair for <span>slow</span>
              <br />
              posture &amp; quiet
              <br />
              focus.
              <small>
                Built for remote workers.
                <br />
                Designed to make long days feel lighter.
              </small>
            </h1>
            <p className="vespre-hero-body">{option.subheadline}</p>
            <div className="vespre-hero-cta-row">
              <a href="#vespre-benefits" className="vespre-btn vespre-btn-primary">
                {option.cta} <span>→</span>
              </a>
              <a href="#vespre-proof" className="vespre-btn vespre-btn-ghost">
                Read the Signals
              </a>
            </div>
          </div>

          <div className="vespre-hero-feature">
            <div className="vespre-feature-tag">
              Featured · <span>{option.name}</span>
            </div>
            <LuxuryChairSvg uploadedImage={uploadedPreviewImage} />
            <div className="vespre-feature-caption">
              <div>ErgoFlex Chair</div>
              <span>{option.price} · Home office edition</span>
            </div>
          </div>
        </div>
        <div className="vespre-scroll-cue">Scroll</div>
      </section>

      <section className="vespre-statement">
        <div className="vespre-statement-inner">
          <div className="vespre-statement-label">
            AI
            <br />
            Insight
            <span>§</span>
          </div>
          <div>
            <p className="vespre-statement-text">
              Competitors talk about <em>comfort</em>, but few connect posture
              improvement with productivity. ErgoFlex owns the more memorable
              idea: work better by <em>sitting better</em>.
            </p>
            <div className="vespre-statement-sig">
              Generated from ComfortPro, WorkNest and SitWell
            </div>
          </div>
        </div>
      </section>

      <section className="vespre-collection" id="vespre-benefits">
        <div className="vespre-section-head">
          <h2>
            The <span>{option.name}</span>
            <br />
            page system
          </h2>
          <p>{option.angle}</p>
        </div>

        <div className="vespre-featured-strip">
          {option.benefits.slice(0, 2).map(([title, description], index) => (
            <a href="#vespre-cart" className="vespre-featured-card" key={title}>
              <div className={`vespre-featured-visual vespre-fv-${index + 1}`}>
                <div className="vespre-featured-tag">
                  {index === 0 ? "Hero benefit" : "Conversion signal"}
                </div>
                <div className="vespre-featured-num">0{index + 1}</div>
                <div className="vespre-featured-visual-inner">
                  <LuxuryChairSvg compact uploadedImage={uploadedPreviewImage} />
                </div>
              </div>
              <div className="vespre-featured-meta">
                <div>
                  <div className="vespre-featured-name">{title}</div>
                  <div className="vespre-featured-notes">{description}</div>
                </div>
                <div className="vespre-featured-price">{option.price}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="vespre-pullquote">
        <div className="vespre-pullquote-inner">
          <div className="vespre-pullquote-mark">"</div>
          <blockquote>
            A better chair is not office furniture. It is a way of declaring
            the workday can feel <em>supported</em>, focused and sustainable.
          </blockquote>
          <div className="vespre-pullquote-cite">AI reasoning · Market signal summary</div>
        </div>
      </section>

      <section className="vespre-grid-section" id="vespre-proof">
        <div className="vespre-section-head">
          <h2>
            The <span>complete</span>
            <br />
            landing story
          </h2>
          <p>Every section maps back to a fixed competitor signal.</p>
        </div>

        <div className="vespre-product-grid">
          {products.map(([name, price, description, type], index) => (
            <a href="#vespre-cart" className="vespre-product-card" key={name}>
              <div className="vespre-product-num">No. 0{index + 1}</div>
              <div className={`vespre-product-visual vespre-pv-${(index % 6) + 1}`}>
                <LuxuryChairSvg compact uploadedImage={uploadedPreviewImage} />
              </div>
              <div className="vespre-product-info">
                <div className="vespre-product-name">{name}</div>
                <div className="vespre-product-price">{price}</div>
              </div>
              <p className="vespre-product-desc">{description}</p>
              <span className="vespre-product-type">{type}</span>
            </a>
          ))}
        </div>
      </section>

      <section className="vespre-story">
        <div className="vespre-story-inner">
          <div className="vespre-story-image">
            <LuxuryChairSvg uploadedImage={uploadedPreviewImage} />
            <div className="vespre-story-caption">
              Built for long days
              <span>Remote work edition</span>
            </div>
          </div>
          <div className="vespre-story-content">
            <div className="vespre-eyebrow">Why it works</div>
            <h2>
              Founded on <span>comfort</span>
              <br />
              and measurable intent.
            </h2>
            <p>
              The generated page positions ErgoFlex between low-cost comfort
              chairs and premium workspace upgrades. It speaks to practical
              remote workers who want better posture without overpaying.
            </p>
            <p>
              The page combines the strongest market signals: back pain relief,
              daily comfort, home-office productivity and accessible value.
            </p>
            <div className="vespre-credentials">
              {[
                ["3", "Competitors analyzed"],
                ["$37.67", "Average market price"],
                ["High", "AI confidence"],
              ].map(([num, label]) => (
                <div className="vespre-cred-item" key={label}>
                  <span>{num}</span>
                  <p>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="vespre-journal" id="vespre-faq">
        <div className="vespre-journal-inner">
          <div className="vespre-journal-eyebrow vespre-eyebrow">FAQ</div>
          <h2>
            Questions before <span>checkout</span>.
          </h2>
          <div className="vespre-faq-list">
            {[
              "Is ErgoFlex suitable for long workdays?",
              "Does it help with posture?",
              "Is it easy to set up?",
            ].map((question) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>
                  Yes. ErgoFlex is positioned for home-office routines, daily
                  support and simple setup.
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="vespre-footer" id="vespre-cart">
        <div className="vespre-footer-top">
          <div>
            <div className="vespre-footer-brand">ErgoFlex</div>
            <p>
              A conversion-focused Shopify landing page generated from fixed
              competitor signals and AI recommendations.
            </p>
          </div>
          <div>
            <h4>Market</h4>
            <a href="#vespre-proof">Competitor signals</a>
            <a href="#vespre-benefits">Benefits</a>
            <a href="#vespre-faq">FAQ</a>
          </div>
          <div>
            <h4>Offer</h4>
            <a href="#vespre-cart">{option.price}</a>
            <a href="#vespre-cart">{option.name}</a>
            <a href="#vespre-cart">Buy Now</a>
          </div>
        </div>
        <div className="vespre-footer-bottom">
          <span>Draft Shopify page · AI Store Designer</span>
          <span>✦ ERGOFLEX ✦</span>
          <span>{option.finalCta}</span>
        </div>
      </footer>
    </div>
  );
}

function LuxuryChairSvg({
  compact = false,
  uploadedImage,
}: {
  compact?: boolean;
  uploadedImage?: string | null;
}) {
  if (uploadedImage) {
    return (
      <img
        src={uploadedImage}
        alt="Uploaded product preview"
        className={compact ? "preview-uploaded-image compact" : "preview-uploaded-image"}
        data-image-upload-target
      />
    );
  }

  return (
    <svg
      className={compact ? "vespre-chair-svg compact" : "vespre-chair-svg"}
      viewBox="0 0 240 320"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      data-image-upload-target
    >
      <defs>
        <linearGradient id="chairSeat" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F7F3EA" />
          <stop offset="55%" stopColor="#D9CFBC" />
          <stop offset="100%" stopColor="#B5B49A" />
        </linearGradient>
        <linearGradient id="chairFrame" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1C1814" />
          <stop offset="100%" stopColor="#5C1F1C" />
        </linearGradient>
      </defs>
      <path
        d="M82 34h76c20 0 34 15 32 35l-13 112c-2 18-16 31-34 31H97c-18 0-32-13-34-31L50 69c-2-20 12-35 32-35Z"
        fill="url(#chairSeat)"
        stroke="url(#chairFrame)"
        strokeWidth="9"
      />
      <path
        d="M76 154h88c24 0 42 18 42 42v8c0 16-13 29-29 29H63c-16 0-29-13-29-29v-8c0-24 18-42 42-42Z"
        fill="#F2EDE3"
        stroke="url(#chairFrame)"
        strokeWidth="9"
      />
      <path d="M120 228v58" stroke="url(#chairFrame)" strokeWidth="12" strokeLinecap="round" />
      <path d="M64 292h112" stroke="url(#chairFrame)" strokeWidth="12" strokeLinecap="round" />
      <path d="M72 292l-20 18" stroke="url(#chairFrame)" strokeWidth="9" strokeLinecap="round" />
      <path d="M168 292l20 18" stroke="url(#chairFrame)" strokeWidth="9" strokeLinecap="round" />
      <path d="M75 72c12-13 78-13 90 0" stroke="#B08A45" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <path d="M70 116c24 11 76 11 100 0" stroke="#7A2A26" strokeWidth="3" strokeLinecap="round" opacity="0.42" />
    </svg>
  );
}

function PomeloPreview({
  option,
  uploadedPreviewImage,
}: {
  option: LandingPageOption;
  uploadedPreviewImage: string | null;
}) {
  return (
    <div className="pomelo-preview overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <SunMark className="pomelo-sun-bg" />
      <div className="pomelo-announcement">
        <div className="pomelo-announce-track">
          {[
            "Free shipping on all home office essentials",
            "New: AI-generated workspace page",
            "ErgoFlex Chair · remote-work comfort",
            "Posture support without premium pricing",
            "Free shipping on all home office essentials",
            "New: AI-generated workspace page",
          ].map((item, index) => (
            <div className="pomelo-announce-item" key={`${item}-${index}`}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <nav className="pomelo-nav">
        <div className="pomelo-nav-inner">
          <a className="pomelo-brand" href="#pomelo-hero">
            <SunMark className="pomelo-brand-icon" />
            <div className="pomelo-brand-name">
              ErgoFlex <em>Co.</em>
            </div>
          </a>
          <ul className="pomelo-nav-links">
            <li><a href="#pomelo-shop">Benefits</a></li>
            <li><a href="#pomelo-story">Story</a></li>
            <li><a href="#pomelo-reviews">Reviews</a></li>
            <li><a href="#pomelo-faq">FAQ</a></li>
          </ul>
          <div className="pomelo-nav-right">
            <a href="#pomelo-shop" className="pomelo-nav-pill">Search</a>
            <a href="#pomelo-cart" className="pomelo-nav-pill pomelo-nav-cart">
              Bag <span>1</span>
            </a>
          </div>
        </div>
      </nav>

      <section className="pomelo-hero" id="pomelo-hero">
        <div className="pomelo-hero-inner">
          <div>
            <div className="pomelo-eyebrow pomelo-hero-eyebrow">
              Small chair · big workdays
            </div>
            <h1>
              Daily comfort
              <br />
              for <em>better</em>
              <br />
              <span>work.</span>
            </h1>
            <p className="pomelo-hero-body">
              {option.subheadline} This page leans into approachable value,
              friendly proof, and practical home-office benefits.
            </p>
            <div className="pomelo-hero-cta-row">
              <a href="#pomelo-shop" className="pomelo-btn">
                {option.cta} <span>→</span>
              </a>
              <a href="#pomelo-story" className="pomelo-btn pomelo-btn-ghost">
                Meet ErgoFlex
              </a>
              <span className="pomelo-hero-tag">8 draft sections ready</span>
            </div>
          </div>

          <div className="pomelo-hero-art">
            <div className="pomelo-hero-sticker">
              <span>AI PICK</span>
              {option.name}
            </div>
            <SunMark className="pomelo-float-citrus" />
            <LuxuryChairSvg uploadedImage={uploadedPreviewImage} />
          </div>
        </div>
      </section>

      <section className="pomelo-statement">
        <div className="pomelo-statement-inner">
          <div className="pomelo-eyebrow">A small note</div>
          <p>
            Competitors make comfort feel generic. This version makes ErgoFlex
            feel <em>friendly</em>, practical, and easy to buy for a real home
            office.
          </p>
          <div className="pomelo-statement-sig">AI Store Designer</div>
        </div>
      </section>

      <section className="pomelo-collection" id="pomelo-shop">
        <div className="pomelo-collection-head">
          <div className="pomelo-eyebrow">Generated catalogue</div>
          <h2>
            Things that <em>help work</em>.
          </h2>
          <p>{option.angle}</p>
        </div>
        <div className="pomelo-products">
          {option.benefits.concat([["Good Value", "Premium-feeling comfort without premium pricing."]]).map(
            ([title, description], index) => (
              <a href="#pomelo-cart" className="pomelo-product" key={title}>
                {index === 0 && <span className="pomelo-product-badge">Best fit</span>}
                {index === 1 && <span className="pomelo-product-badge new">New</span>}
                <div className={`pomelo-product-visual pomelo-pv-${index + 1}`}>
                  <LuxuryChairSvg compact uploadedImage={uploadedPreviewImage} />
                </div>
                <div className="pomelo-product-info">
                  <div className="pomelo-product-name">{title}</div>
                  <div className="pomelo-product-price">{option.price}</div>
                </div>
                <p>{description}</p>
                <div className="pomelo-product-foot">
                  <span>Remote work · daily use</span>
                  <strong>Add +</strong>
                </div>
              </a>
            ),
          )}
        </div>
      </section>

      <section className="pomelo-banner">
        <div className="pomelo-banner-inner">
          <div>
            <div className="pomelo-eyebrow">Value angle</div>
            <h2>
              Comfort without the <em>premium chair</em> tax.
            </h2>
            <p>
              Average competitor price is $37.67. ErgoFlex anchors at {option.price}
              while still feeling polished, supportive, and workday-ready.
            </p>
            <a href="#pomelo-cart" className="pomelo-btn">Buy Now →</a>
          </div>
          <div className="pomelo-banner-art">
            <SunMark />
            <LuxuryChairSvg compact uploadedImage={uploadedPreviewImage} />
          </div>
        </div>
      </section>

      <section className="pomelo-story" id="pomelo-story">
        <div className="pomelo-story-inner">
          <div className="pomelo-story-art">
            <SunMark />
          </div>
          <div>
            <div className="pomelo-eyebrow">Why this layout</div>
            <h2>
              Warm, direct, <em>easy</em> to understand.
            </h2>
            <p>
              This template is best for a merchant who wants the product to feel
              accessible and low-friction. It makes the chair feel approachable,
              not clinical or luxury.
            </p>
            <p>
              The copy highlights comfort, value, simple setup, and daily remote
              work habits.
            </p>
            <div className="pomelo-story-creds">
              <div><strong>3</strong><span>competitors</span></div>
              <div><strong>{option.price}</strong><span>generated price</span></div>
              <div><strong>High</strong><span>confidence</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="pomelo-testimonials" id="pomelo-reviews">
        <div className="pomelo-testimonials-head">
          <div>
            <div className="pomelo-eyebrow">Review signals</div>
            <h2>
              Seen, clicked, <em>remembered</em>.
            </h2>
          </div>
          <div>★ ★ ★ ★ ★<span>4.9 · mock review score</span></div>
        </div>
        <div className="pomelo-test-grid">
          {option.chips.slice(0, 3).map((chip, index) => (
            <div className="pomelo-test" key={chip}>
              <p>“{chip} is exactly the phrase this page should make shoppers remember.”</p>
              <div><span>{["R", "M", "A"][index]}</span> Verified signal</div>
            </div>
          ))}
        </div>
      </section>

      <section className="pomelo-news" id="pomelo-faq">
        <SunMark />
        <div className="pomelo-eyebrow">Final CTA</div>
        <h2>
          Upgrade your <em>workday</em>.
        </h2>
        <p>{option.finalCta}</p>
        <a href="#pomelo-cart" className="pomelo-btn">Buy Now ✿</a>
      </section>

      <footer className="pomelo-footer" id="pomelo-cart">
        <div>
          <div className="pomelo-footer-mark">
            <SunMark />
            <span>ErgoFlex <em>Co.</em></span>
          </div>
          <p>Sunny, friendly landing page draft generated from fixed market signals.</p>
        </div>
        <div>
          <h4>Page</h4>
          <a href="#pomelo-shop">Benefits</a>
          <a href="#pomelo-story">Story</a>
          <a href="#pomelo-reviews">Reviews</a>
        </div>
        <div>
          <h4>Offer</h4>
          <a href="#pomelo-cart">{option.price}</a>
          <a href="#pomelo-cart">{option.name}</a>
          <a href="#pomelo-cart">Buy Now</a>
        </div>
      </footer>
    </div>
  );
}

function SunMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="50" r="28" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="4" strokeLinecap="round">
        <line x1="50" y1="8" x2="50" y2="22" />
        <line x1="50" y1="78" x2="50" y2="92" />
        <line x1="8" y1="50" x2="22" y2="50" />
        <line x1="78" y1="50" x2="92" y2="50" />
        <line x1="20" y1="20" x2="30" y2="30" />
        <line x1="70" y1="70" x2="80" y2="80" />
        <line x1="80" y1="20" x2="70" y2="30" />
        <line x1="30" y1="70" x2="20" y2="80" />
      </g>
      <circle cx="50" cy="50" r="10" fill="#F9EFDB" />
    </svg>
  );
}

function MatierePreview({
  option,
  uploadedPreviewImage,
}: {
  option: LandingPageOption;
  uploadedPreviewImage: string | null;
}) {
  const formulas = [
    ["01 · POSTURE", "Lumbar support 42%, pressure relief 22%, focus retention 18%"],
    ["02 · COMFORT", "Breathable seat 36%, soft contact 28%, long-day use 21%"],
    ["03 · SETUP", "Simple assembly 48%, daily routine fit 26%, home office 19%"],
    ["04 · VALUE", "Accessible pricing 40%, premium feel 31%, conversion lift 16%"],
    ["05 · FOCUS", "Productivity cue 34%, fewer breaks 24%, deep work 18%"],
    ["06 · PROOF", "Review signal match 52%, keyword gap 29%, CTA clarity 17%"],
  ];

  return (
    <div className="matiere-preview overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="matiere-ticker">
        <div className="matiere-ticker-track">
          {[
            "LIVE · AI Store Designer draft generated",
            "Competitor matrix: ComfortPro / WorkNest / SitWell",
            "Average market price: $37.67",
            "Opportunity: posture + productivity",
            "LIVE · AI Store Designer draft generated",
            "Competitor matrix: ComfortPro / WorkNest / SitWell",
          ].map((item, index) => (
            <div className="matiere-ticker-item" key={`${item}-${index}`}>
              {item}
            </div>
          ))}
        </div>
      </div>

      <nav className="matiere-nav">
        <div className="matiere-nav-inner">
          <a className="matiere-brand" href="#matiere-hero">
            <span>ERGO/FLEX</span>
            <em>AI PAGE · V.03</em>
          </a>
          <ul>
            <li><a className="active" href="#matiere-formulas">Signals</a></li>
            <li><a href="#matiere-process">Process</a></li>
            <li><a href="#matiere-lab">Export</a></li>
          </ul>
          <div>
            <a href="#matiere-lab">EN/US</a>
            <a href="#matiere-cart" className="matiere-cart">Draft <span>01</span></a>
          </div>
        </div>
      </nav>

      <main>
        <section className="matiere-hero" id="matiere-hero">
          <div className="matiere-hero-inner">
            <div className="matiere-hero-left">
              <div className="matiere-hero-meta">
                <div>
                  <span>SYS / MARKET.SIGNAL</span>
                  <strong>{option.name.toUpperCase()}</strong>
                </div>
                <div>
                  <span className="pulse">SYNTHESIS COMPLETE</span>
                  <strong>CONFIDENCE · HIGH</strong>
                </div>
              </div>
              <h1>
                Conversion
                <br />
                <span>architecture</span> for
                <br />
                <em>remote</em>
                <br />
                work.
              </h1>
              <div className="matiere-hero-bottom">
                <p>
                  <strong>ErgoFlex</strong> is positioned as ergonomic comfort
                  without premium pricing. This template exposes the reasoning
                  like a product spec: direct, analytical, and built for proof.
                </p>
                <div>
                  <a href="#matiere-formulas" className="matiere-btn acid">Browse Signals →</a>
                  <a href="#matiere-process" className="matiere-btn">Read Matrix</a>
                </div>
              </div>
            </div>
            <div className="matiere-hero-right">
              <TechnicalChairSvg uploadedImage={uploadedPreviewImage} />
            </div>
          </div>
        </section>

        <section className="matiere-stats">
          {[
            ["3", "Competitors analyzed", "fixed dataset"],
            ["100%", "Mock data only", "deterministic"],
            ["$37.67", "Avg. competitor price", "market anchor"],
            ["High", "Recommendation confidence", "AI reasoning"],
          ].map(([value, label, sub]) => (
            <div className="matiere-stat" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <p>{sub}</p>
            </div>
          ))}
        </section>

        <section className="matiere-statement">
          <div className="matiere-statement-inner">
            <div>
              DISCLOSURE NOTE
              <span>01</span>
            </div>
            <div>
              <p>
                Most chair pages are built on <s>generic comfort</s> <em>undifferentiated claims</em>.
                This draft publishes the logic: posture support, productivity
                ownership, average price, and keyword gaps.
              </p>
              <div className="matiere-statement-footer">
                <div>Input<span>ErgoFlex Chair</span></div>
                <div>Segment<span>Remote workers 25-40</span></div>
                <div>Position<span>{option.name}</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="matiere-formulas" id="matiere-formulas">
          <div className="matiere-section-head">
            <div>
              <span>SECTION 02 / SIGNAL CATALOGUE</span>
              <h2>
                The <mark>signals</mark>
              </h2>
            </div>
            <p>
              Six generated storefront modules. Each one maps to competitor
              keywords, review themes, price logic, or CTA positioning.
            </p>
          </div>

          <div className="matiere-formula-grid">
            {formulas.map(([name, description], index) => (
              <a href="#matiere-cart" className="matiere-formula" key={name}>
                <div className="matiere-formula-top">
                  <span>NO. {name}</span>
                  <span><i />IN DRAFT</span>
                </div>
                <div className="matiere-formula-visual">
                  <TechnicalChairSvg
                    compact
                    uploadedImage={uploadedPreviewImage}
                  />
                </div>
                <h3>{name.split(" · ")[1]}</h3>
                <p>{description}</p>
                <div className="matiere-formula-data">
                  <div><span>Type</span><strong>Section</strong></div>
                  <div><span>CTA</span><strong>{index % 2 ? "Soft" : "Direct"}</strong></div>
                  <div><span>Use</span><strong>Preview</strong></div>
                  <div><span>Price</span><strong>{option.price}</strong></div>
                </div>
                <div className="matiere-formula-foot">
                  <strong>{option.price}</strong>
                  <span>Add →</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="matiere-process" id="matiere-process">
          <div className="matiere-section-head">
            <div>
              <span>SECTION 03 / METHODOLOGY</span>
              <h2>
                How it's <mark>made</mark>
              </h2>
            </div>
            <p>{option.angle}</p>
          </div>
          <div className="matiere-process-grid">
            {[
              ["01", "Read product", "Product description and target market become the source document."],
              ["02", "Analyze signals", "Competitor price, positioning, keywords and review themes are normalized."],
              ["03", "Generate sections", "Hero, benefits, comparison, proof, FAQ and CTA are assembled."],
              ["04", "Export draft", "The mock Shopify export confirms the interview demo journey."],
            ].map(([num, title, description]) => (
              <div className="matiere-process-step" key={num}>
                <span>PHASE / {num}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <em>Mock only · no backend</em>
              </div>
            ))}
          </div>
        </section>

        <section className="matiere-lab" id="matiere-lab">
          <span>EXPORT / MOCK</span>
          <h2>
            Send the <mark>draft</mark>.
          </h2>
          <p>{option.finalCta}. The export button in the left panel triggers the mock Shopify success toast.</p>
          <a className="matiere-btn acid" href="#matiere-cart">Buy Now →</a>
        </section>
      </main>

      <footer className="matiere-footer" id="matiere-cart">
        <div>
          <div className="matiere-footer-mark">ERGO/FLEX</div>
          <p>Clinical, proof-led landing page draft generated by AI Store Designer.</p>
        </div>
        <div>
          <h4>Signals</h4>
          <a href="#matiere-formulas">Formulas</a>
          <a href="#matiere-process">Methodology</a>
          <a href="#matiere-lab">Export</a>
        </div>
        <div>
          <h4>Offer</h4>
          <a href="#matiere-cart">{option.price}</a>
          <a href="#matiere-cart">{option.name}</a>
          <a href="#matiere-cart">Buy Now</a>
        </div>
      </footer>
    </div>
  );
}

function TechnicalChairSvg({
  compact = false,
  uploadedImage,
}: {
  compact?: boolean;
  uploadedImage?: string | null;
}) {
  if (uploadedImage) {
    return (
      <img
        src={uploadedImage}
        alt="Uploaded product preview"
        className={compact ? "matiere-uploaded-image compact" : "matiere-uploaded-image"}
        data-image-upload-target
      />
    );
  }

  return (
    <svg
      className={compact ? "matiere-tech compact" : "matiere-tech"}
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
      data-image-upload-target
    >
      <line x1="200" y1="0" x2="200" y2="500" strokeDasharray="2 4" opacity="0.3" />
      <line x1="0" y1="250" x2="400" y2="250" strokeDasharray="2 4" opacity="0.3" />
      <path d="M130 55h140c28 0 46 22 41 50l-29 170c-4 25-25 43-51 43h-62c-26 0-47-18-51-43L89 105c-5-28 13-50 41-50Z" />
      <path d="M105 270h190c33 0 58 25 58 58v12c0 24-19 43-43 43H90c-24 0-43-19-43-43v-12c0-33 25-58 58-58Z" />
      <path d="M200 382v72" strokeWidth="3" />
      <path d="M112 460h176" strokeWidth="3" />
      <path d="M125 460l-36 30M275 460l36 30" strokeWidth="2" />
      <rect x="134" y="300" width="132" height="54" fill="rgba(212, 242, 94, 0.45)" stroke="none" />
      <text x="200" y="322" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="12" fill="currentColor">
        ERGOFLEX
      </text>
      <text x="200" y="340" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill="currentColor">
        POSTURE / PRODUCTIVITY
      </text>
      <line x1="270" y1="95" x2="350" y2="95" />
      <circle cx="270" cy="95" r="3" fill="currentColor" stroke="none" />
      <text x="355" y="91" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor">
        A · BACK SUPPORT
      </text>
      <line x1="300" y1="300" x2="360" y2="300" />
      <circle cx="300" cy="300" r="3" fill="currentColor" stroke="none" />
      <text x="365" y="296" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor">
        B · COMFORT SEAT
      </text>
      <line x1="54" y1="55" x2="54" y2="382" />
      <text x="42" y="230" fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" transform="rotate(-90 42 230)">
        LONG DAY SUPPORT
      </text>
    </svg>
  );
}

function EditorialLandingPage({ option }: { option: LandingPageOption }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="px-6 py-2 text-center text-xs font-semibold text-white"
        style={{ backgroundColor: option.dark }}
      >
        Free shipping on all home office essentials today
      </div>

      <section
        className="relative min-h-[620px] overflow-hidden px-9 py-10 text-white transition-colors duration-500"
        style={{ backgroundColor: option.bg }}
      >
        <GrainOverlay />
        <div
          className="pointer-events-none absolute inset-x-0 top-[10%] z-0 flex select-none justify-center whitespace-nowrap text-center font-['Anton'] text-[clamp(88px,13vw,210px)] uppercase leading-none tracking-normal text-white"
          style={{ opacity: 0.22 }}
        >
          {option.ghost}
        </div>
        <div className="relative z-10 grid min-h-[540px] grid-cols-[0.92fr_1.08fr] gap-8">
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
              {option.label}
            </p>
            <h3 className="mt-4 max-w-lg text-6xl font-semibold leading-[0.95] tracking-normal text-white">
              {option.headline}
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/82">
              {option.subheadline}
            </p>
            <div className="mt-7 flex items-center gap-4">
              <button
                className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold shadow-sm transition hover:scale-[1.02]"
                style={{ color: option.dark }}
              >
                {option.cta}
                <ArrowRight size={16} />
              </button>
              <span className="max-w-[220px] text-sm font-medium text-white/78">
                {option.note}
              </span>
            </div>
          </div>
          <ProductVisual option={option} />
        </div>
        <div className="absolute bottom-6 right-8 z-20 flex items-center gap-2 font-['Anton'] text-[clamp(26px,4vw,58px)] uppercase leading-none tracking-normal text-white/95">
          Discover It
          <ArrowRight className="h-7 w-7" strokeWidth={2.25} />
        </div>
      </section>

      <section className="border-y border-slate-200 bg-[#f8fafc] px-9 py-8">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Generated angle
            </p>
            <h4 className="mt-1 text-2xl font-semibold text-slate-950">
              {option.name}
            </h4>
          </div>
          <p className="max-w-md text-sm leading-6 text-slate-600">
            {option.angle}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {option.benefits.map(([title, description]) => (
            <div
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span
                className="grid h-9 w-9 place-items-center rounded-lg text-white"
                style={{ backgroundColor: option.accent }}
              >
                <CheckCircle2 size={19} />
              </span>
              <h4 className="mt-4 text-base font-semibold text-slate-950">
                {title}
              </h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-9 py-9">
        <div className="grid grid-cols-[0.82fr_1.18fr] gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Comparison
            </p>
            <h4 className="mt-1 text-2xl font-semibold text-slate-950">
              Why ErgoFlex stands out
            </h4>
          </div>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            {option.comparison.map(([label, ergoFlex, competitor]) => (
              <div
                key={label}
                className="grid grid-cols-[0.75fr_1fr_1fr] border-b border-slate-200 last:border-b-0"
              >
                <div className="bg-slate-50 px-4 py-4 text-sm font-semibold text-slate-700">
                  {label}
                </div>
                <div
                  className="px-4 py-4 text-sm font-semibold"
                  style={{ color: option.accent }}
                >
                  ErgoFlex: {ergoFlex}
                </div>
                <div className="px-4 py-4 text-sm text-slate-600">
                  Competitors: {competitor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="px-9 py-9"
        style={{ backgroundColor: `${option.panel}30` }}
      >
        <h4 className="text-2xl font-semibold text-slate-950">
          Built from what customers already care about
        </h4>
        <div className="mt-5 flex flex-wrap gap-2">
          {option.chips.map((chip) => (
            <span
              key={chip}
              className="rounded-full border bg-white px-3 py-1.5 text-sm font-semibold"
              style={{ borderColor: `${option.accent}40`, color: option.dark }}
            >
              {chip}
            </span>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-[0.8fr_1fr] gap-8 px-9 py-9">
        <h4 className="text-2xl font-semibold text-slate-950">FAQ</h4>
        <div className="space-y-3">
          {[
            "Is ErgoFlex suitable for long workdays?",
            "Does it help with posture?",
            "Is it easy to set up?",
          ].map((question) => (
            <details
              key={question}
              className="rounded-lg border border-slate-200 px-4 py-3"
            >
              <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                {question}
              </summary>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Yes. ErgoFlex is designed around daily home-office routines,
                supportive comfort, and simple setup.
              </p>
            </details>
          ))}
        </div>
      </section>

      <section
        className="flex items-center justify-between px-9 py-8 text-white"
        style={{ backgroundColor: option.dark }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-white/60">
            Final CTA
          </p>
          <h4 className="mt-2 text-2xl font-semibold">{option.finalCta}</h4>
        </div>
        <button
          className="rounded-lg bg-white px-5 py-3 text-sm font-semibold transition hover:opacity-90"
          style={{ color: option.dark }}
        >
          Buy Now
        </button>
      </section>
    </div>
  );
}

function StudioLandingPage({ option }: { option: LandingPageOption }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="flex items-center justify-between px-7 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
        style={{ backgroundColor: option.dark }}
      >
        <span>ErgoFlex Studio</span>
        <span>Free shipping today</span>
      </div>

      <section
        className="relative grid min-h-[640px] grid-cols-[0.82fr_1.18fr] overflow-hidden text-white"
        style={{ backgroundColor: option.bg }}
      >
        <GrainOverlay />
        <aside
          className="relative z-10 flex flex-col justify-between p-9"
          style={{ backgroundColor: option.dark }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              {option.label}
            </p>
            <h3 className="mt-5 text-5xl font-semibold leading-none tracking-normal">
              {option.headline}
            </h3>
            <p className="mt-5 text-sm leading-7 text-white/72">
              {option.subheadline}
            </p>
          </div>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {option.comparison.slice(0, 2).map(([label, value]) => (
                <div key={label} className="border-t border-white/20 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-normal text-white/45">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90">
              {option.cta}
              <ArrowRight size={16} />
            </button>
          </div>
        </aside>

        <div className="relative z-10 flex flex-col justify-between p-9">
          <div className="flex justify-end">
            <div className="max-w-[230px] rounded-lg border border-white/25 bg-white/12 p-4 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-normal text-white/60">
                Market angle
              </p>
              <p className="mt-2 text-sm leading-6 text-white/90">
                {option.angle}
              </p>
            </div>
          </div>
          <div className="absolute inset-x-0 top-[12%] text-center font-['Anton'] text-[clamp(92px,14vw,220px)] uppercase leading-none tracking-normal text-white/20">
            {option.ghost}
          </div>
          <div className="relative mx-auto mt-8 w-[72%] min-w-[360px]">
            <ProductVisual option={option} variant="studio" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {option.benefits.map(([title, description]) => (
              <div
                key={title}
                className="rounded-lg border border-white/25 bg-white/14 p-4 backdrop-blur"
              >
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-2 text-xs leading-5 text-white/72">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[1fr_1fr] gap-0">
        <div className="p-9">
          <h4 className="text-2xl font-semibold text-slate-950">
            Built from what customers already care about
          </h4>
          <div className="mt-5 flex flex-wrap gap-2">
            {option.chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border px-3 py-1.5 text-sm font-semibold"
                style={{
                  borderColor: `${option.accent}35`,
                  color: option.dark,
                  backgroundColor: `${option.panel}20`,
                }}
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="border-l border-slate-200 bg-slate-50 p-9">
          <h4 className="text-2xl font-semibold text-slate-950">
            Why ErgoFlex stands out
          </h4>
          <div className="mt-5 space-y-3">
            {option.comparison.map(([label, ergoFlex, competitor]) => (
              <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-semibold" style={{ color: option.accent }}>
                  ErgoFlex: {ergoFlex}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  Competitors: {competitor}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FinalCta option={option} />
    </div>
  );
}

function ConversionLandingPage({ option }: { option: LandingPageOption }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div
        className="px-6 py-2 text-center text-xs font-bold uppercase tracking-[0.14em] text-white"
        style={{ backgroundColor: option.accent }}
      >
        Free shipping on all home office essentials today
      </div>

      <section className="grid min-h-[610px] grid-cols-[1fr_0.9fr] bg-[#fffaf7]">
        <div className="flex flex-col justify-between p-9">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-normal shadow-sm ring-1 ring-orange-100">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: option.accent }}
              />
              {option.label}
            </div>
            <h3 className="mt-5 max-w-xl text-6xl font-semibold leading-[0.95] tracking-normal text-slate-950">
              {option.headline}
            </h3>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              {option.subheadline}
            </p>
            <div className="mt-7 flex items-center gap-3">
              <button
                className="flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:scale-[1.02]"
                style={{ backgroundColor: option.dark }}
              >
                {option.cta}
                <ArrowRight size={16} />
              </button>
              <div className="rounded-lg bg-white px-4 py-2 shadow-sm ring-1 ring-orange-100">
                <p className="text-[11px] font-semibold uppercase tracking-normal text-slate-500">
                  Generated price
                </p>
                <p className="text-lg font-bold" style={{ color: option.accent }}>
                  {option.price}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {option.benefits.map(([title, description]) => (
              <div key={title} className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-orange-100">
                <p className="text-sm font-semibold text-slate-950">{title}</p>
                <p className="mt-2 text-xs leading-5 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="relative overflow-hidden p-8"
          style={{ backgroundColor: option.bg }}
        >
          <GrainOverlay />
          <div className="absolute inset-x-0 top-12 text-center font-['Anton'] text-[clamp(80px,11vw,165px)] uppercase leading-none tracking-normal text-white/24">
            {option.ghost}
          </div>
          <ProductVisual option={option} variant="conversion" />
          <div className="absolute bottom-8 left-8 right-8 rounded-lg bg-white/92 p-4 shadow-xl backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
              Detected opportunity
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {option.angle}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-[0.9fr_1.1fr] border-y border-slate-200">
        <div className="bg-slate-950 p-9 text-white">
          <p className="text-xs font-semibold uppercase tracking-normal text-white/50">
            Review insights
          </p>
          <h4 className="mt-2 text-2xl font-semibold">
            Customers already care about these signals
          </h4>
          <div className="mt-5 flex flex-wrap gap-2">
            {option.chips.map((chip) => (
              <span key={chip} className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold">
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="p-9">
          <h4 className="text-2xl font-semibold text-slate-950">
            Direct comparison
          </h4>
          <div className="mt-5 grid gap-3">
            {option.comparison.map(([label, ergoFlex, competitor]) => (
              <div key={label} className="grid grid-cols-[0.75fr_1fr_1fr] rounded-lg border border-slate-200 bg-white">
                <div className="px-4 py-4 text-sm font-semibold text-slate-700">
                  {label}
                </div>
                <div className="px-4 py-4 text-sm font-semibold" style={{ color: option.accent }}>
                  {ergoFlex}
                </div>
                <div className="px-4 py-4 text-sm text-slate-600">
                  {competitor}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FaqSection />
      <FinalCta option={option} />
    </div>
  );
}

function GrainOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 opacity-40"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\")",
        backgroundRepeat: "repeat",
        backgroundSize: "200px 200px",
      }}
    />
  );
}

function FaqSection() {
  return (
    <section className="grid grid-cols-[0.8fr_1fr] gap-8 px-9 py-9">
      <h4 className="text-2xl font-semibold text-slate-950">FAQ</h4>
      <div className="space-y-3">
        {[
          "Is ErgoFlex suitable for long workdays?",
          "Does it help with posture?",
          "Is it easy to set up?",
        ].map((question) => (
          <details
            key={question}
            className="rounded-lg border border-slate-200 px-4 py-3"
          >
            <summary className="cursor-pointer text-sm font-semibold text-slate-800">
              {question}
            </summary>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Yes. ErgoFlex is designed around daily home-office routines,
              supportive comfort, and simple setup.
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCta({ option }: { option: LandingPageOption }) {
  return (
    <section
      className="flex items-center justify-between px-9 py-8 text-white"
      style={{ backgroundColor: option.dark }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-normal text-white/60">
          Final CTA
        </p>
        <h4 className="mt-2 text-2xl font-semibold">{option.finalCta}</h4>
      </div>
      <button
        className="rounded-lg bg-white px-5 py-3 text-sm font-semibold transition hover:opacity-90"
        style={{ color: option.dark }}
      >
        Buy Now
      </button>
    </section>
  );
}

function ProductVisual({
  option,
  variant = "editorial",
}: {
  option: LandingPageOption;
  variant?: "editorial" | "studio" | "conversion";
}) {
  const shellClass =
    variant === "studio"
      ? "relative flex h-[430px] items-end justify-center overflow-hidden pb-0"
      : variant === "conversion"
        ? "relative flex h-full min-h-[560px] items-end justify-center overflow-hidden pb-20"
        : "relative flex items-end justify-center overflow-hidden pb-8";
  const chairClass =
    variant === "studio"
      ? "relative z-10 h-[430px] w-[310px]"
      : "relative z-10 h-[500px] w-[360px]";

  return (
    <div className={shellClass}>
      <div
        className="absolute bottom-9 left-1/2 h-[58%] w-[76%] -translate-x-1/2 rounded-[40px]"
        style={{ backgroundColor: option.panel, opacity: 0.9 }}
      />
      <div className="absolute left-[18%] top-[21%] h-24 w-24 rounded-full bg-white/18 blur-2xl" />
      <div className="absolute right-[16%] top-[13%] h-32 w-32 rounded-full bg-white/14 blur-3xl" />
      <div className={chairClass}>
        <div
          className="absolute left-1/2 top-3 h-[255px] w-[230px] -translate-x-1/2 rounded-[54px] border-[10px] bg-white shadow-2xl"
          style={{ borderColor: option.dark }}
        />
        <div
          className="absolute left-1/2 top-[210px] h-[110px] w-[285px] -translate-x-1/2 rounded-[48px] border-[10px] bg-white shadow-2xl"
          style={{ borderColor: option.dark }}
        />
        <div
          className="absolute left-1/2 top-[300px] h-[118px] w-8 -translate-x-1/2 rounded-full"
          style={{ backgroundColor: option.dark }}
        />
        <div
          className="absolute bottom-[62px] left-1/2 h-8 w-[230px] -translate-x-1/2 rounded-full"
          style={{ backgroundColor: option.dark }}
        />
        <div
          className="absolute bottom-9 left-[78px] h-14 w-5 rotate-12 rounded-full"
          style={{ backgroundColor: option.dark }}
        />
        <div
          className="absolute bottom-9 right-[78px] h-14 w-5 -rotate-12 rounded-full"
          style={{ backgroundColor: option.dark }}
        />
        <div
          className="absolute right-8 top-12 rounded-full bg-white/90 px-4 py-2 text-sm font-bold shadow-lg"
          style={{ color: option.dark }}
        >
          {option.price}
        </div>
      </div>
    </div>
  );
}

function Card({
  label,
  title,
  icon,
  children,
}: {
  label: string;
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">
            {label}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-950">{title}</h2>
        </div>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
          {icon}
        </span>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[150px_1fr] gap-3">
      <dt className="text-xs font-semibold uppercase tracking-normal text-slate-500">
        {label}
      </dt>
      <dd className="font-semibold leading-6 text-slate-800">{value}</dd>
    </div>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div
      className={[
        "fixed bottom-6 right-6 z-20 flex items-center gap-3 rounded-lg border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-xl transition",
        message
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <Check size={16} />
      </span>
      {message}
    </div>
  );
}

export default App;
