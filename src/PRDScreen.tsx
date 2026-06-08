import { useMemo, useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import prdContent from "../data/prd.md?raw";

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

type TocEntry = { id: string; title: string; depth: 2 | 3 };

function extractToc(markdown: string): TocEntry[] {
  const lines = markdown.split("\n");
  const entries: TocEntry[] = [];
  let inCodeBlock = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;
    const h2 = line.match(/^## (.+)/);
    if (h2) {
      entries.push({ id: slugify(h2[1]), title: h2[1], depth: 2 });
      continue;
    }
    const h3 = line.match(/^### (.+)/);
    if (h3) {
      entries.push({ id: slugify(h3[1]), title: h3[1], depth: 3 });
    }
  }
  return entries;
}

function flatText(children: React.ReactNode): string {
  if (typeof children === "string") return children;
  if (typeof children === "number") return String(children);
  if (Array.isArray(children)) return children.map(flatText).join("");
  if (children && typeof children === "object" && "props" in children) {
    return flatText((children as { props: { children?: React.ReactNode } }).props.children);
  }
  return "";
}

export function PRDScreen() {
  const toc = useMemo(() => extractToc(prdContent), []);
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  const h2Numbers = useMemo(() => {
    const map: Record<string, string> = {};
    let n = 0;
    toc.forEach(e => {
      if (e.depth === 2) {
        n++;
        map[e.id] = String(n).padStart(2, "0");
      }
    });
    return map;
  }, [toc]);

  const stats = useMemo(() => {
    const h2Count = toc.filter(e => e.depth === 2).length;
    const words = prdContent.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 220));
    return { sections: h2Count, words, minutes };
  }, [toc]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(e => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0.1 }
    );
    const headings = document.querySelectorAll("[data-prd-heading]");
    headings.forEach(h => observer.observe(h));

    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const ratio = max > 0 ? (doc.scrollTop || document.body.scrollTop) / max : 0;
      setProgress(Math.min(Math.max(ratio, 0), 1) * 100);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen relative">
      <div className="sticky top-[37px] z-10 h-px bg-transparent">
        <div
          className="h-px bg-amber transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <main className="px-12 max-w-[1320px] mx-auto w-full">
        <header className="pt-20 pb-14 mb-16 border-b border-white/10">
          <div className="flex items-center gap-2 mb-10">
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-amber bg-amber/[0.08] border border-amber/30 px-2.5 py-1">
              PRD
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-300 bg-paper-2 border border-white/10 px-2.5 py-1">
              DRAFT · v0.1
            </span>
            <span className="font-mono text-[10px] text-neutral-500 ml-auto flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-forest animate-pulse" />
              <span>open for review</span>
            </span>
          </div>

          <h1 className="font-display text-7xl text-ink leading-[0.95] mb-8 tracking-tight">
            store_auditor<span className="text-amber">.</span>
            <br />
            <span className="text-neutral-500">product requirements</span>
          </h1>

          <p className="font-body text-lg text-neutral-300 leading-[1.65] max-w-2xl mb-12">
            Internal product spec for the diagnostic CRO audit — the full product reasoning,
            agent architecture, pricing model, and near-term roadmap.
          </p>

          <div className="grid grid-cols-4 gap-x-10 gap-y-4 pt-8 border-t border-white/10">
            <HeroStat label="sections" value={String(stats.sections).padStart(2, "0")} />
            <HeroStat label="words" value={stats.words.toLocaleString()} />
            <HeroStat label="read time" value={`${stats.minutes} min`} />
            <HeroStat label="updated" value="2026-06-08" mono />
          </div>
        </header>

        <div className="grid grid-cols-12 gap-14">
          <aside className="col-span-3">
            <div className="sticky top-20">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-5 flex items-center gap-3">
                <span className="w-4 h-px bg-neutral-700" />
                <span>contents</span>
              </div>
              <nav className="space-y-px max-h-[calc(100vh-160px)] overflow-y-auto pr-2 -ml-3">
                {toc.map(entry => {
                  const isActive = activeId === entry.id;
                  if (entry.depth === 2) {
                    return (
                      <a
                        key={entry.id}
                        href={`#${entry.id}`}
                        className={`group flex items-baseline gap-3 py-2 pl-3 border-l transition-all ${
                          isActive
                            ? "border-amber bg-amber/[0.04]"
                            : "border-transparent hover:border-white/20"
                        }`}
                      >
                        <span
                          className={`font-mono text-[9px] tabular-nums ${
                            isActive ? "text-amber" : "text-neutral-600"
                          }`}
                        >
                          {h2Numbers[entry.id]}
                        </span>
                        <span
                          className={`font-mono text-[11px] leading-tight ${
                            isActive ? "text-amber" : "text-neutral-300 group-hover:text-ink"
                          }`}
                        >
                          {entry.title}
                        </span>
                      </a>
                    );
                  }
                  return (
                    <a
                      key={entry.id}
                      href={`#${entry.id}`}
                      className={`group flex items-baseline gap-2 py-1 pl-9 border-l border-transparent transition-colors ${
                        isActive ? "text-amber" : "text-neutral-500 hover:text-neutral-200"
                      }`}
                    >
                      <span className="text-[10px] opacity-60">·</span>
                      <span className="font-mono text-[10px] leading-tight">{entry.title}</span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          <article className="col-span-9 prd-content pb-24" ref={contentRef}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: () => null,
                h2: ({ children }) => {
                  const text = flatText(children);
                  const id = slugify(text);
                  const number = h2Numbers[id];
                  return (
                    <div className="mt-24 mb-8 first:mt-0 scroll-mt-28" id={id} data-prd-heading>
                      <div className="flex items-baseline gap-5">
                        <span className="font-mono text-sm text-amber tabular-nums tracking-wider">
                          {number}
                        </span>
                        <span className="flex-1 h-px bg-white/10 translate-y-[-6px]" />
                      </div>
                      <h2 className="font-display text-[40px] text-ink leading-[1.05] mt-3 tracking-tight">
                        {children}
                      </h2>
                    </div>
                  );
                },
                h3: ({ children }) => {
                  const text = flatText(children);
                  const id = slugify(text);
                  return (
                    <h3
                      id={id}
                      data-prd-heading
                      className="font-display text-xl text-amber mt-14 mb-5 scroll-mt-28 flex items-center gap-3 max-w-3xl"
                    >
                      <span className="w-5 h-px bg-amber/50" />
                      <span>{children}</span>
                    </h3>
                  );
                },
                h4: ({ children }) => (
                  <h4 className="font-mono text-[11px] uppercase tracking-[0.22em] text-neutral-300 mt-8 mb-3 max-w-3xl">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="font-body text-[15.5px] text-neutral-300 leading-[1.78] mb-5 max-w-3xl">
                    {children}
                  </p>
                ),
                ul: ({ children }) => <ul className="space-y-2.5 mb-6 max-w-3xl">{children}</ul>,
                ol: ({ children }) => (
                  <ol className="space-y-2.5 mb-6 max-w-3xl list-decimal marker:text-amber marker:font-mono marker:text-xs pl-6">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="font-body text-[15px] text-neutral-300 leading-[1.7] flex gap-3">
                    <span className="text-amber mt-[8px] flex-shrink-0 w-1 h-1 bg-amber rounded-full" />
                    <span className="flex-1">{children}</span>
                  </li>
                ),
                table: ({ children }) => (
                  <div className="mb-8 max-w-3xl border border-white/10 bg-paper-2/40 overflow-x-auto">
                    <table className="w-full border-collapse">{children}</table>
                  </div>
                ),
                thead: ({ children }) => (
                  <thead className="border-b border-white/15 bg-paper-2">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="divide-y divide-white/[0.06]">{children}</tbody>
                ),
                tr: ({ children }) => (
                  <tr className="transition-colors hover:bg-white/[0.02]">{children}</tr>
                ),
                th: ({ children }) => (
                  <th className="font-mono text-[10px] uppercase tracking-[0.22em] text-neutral-400 text-left px-4 py-3">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="font-body text-[14px] text-neutral-200 px-4 py-3.5 align-top leading-relaxed">
                    {children}
                  </td>
                ),
                code: ({ children, className }) => {
                  if (!className) {
                    return (
                      <code className="font-mono text-[12.5px] bg-paper-2 px-1.5 py-0.5 text-amber border border-white/10 rounded-[2px]">
                        {children}
                      </code>
                    );
                  }
                  return <code className={className}>{children}</code>;
                },
                pre: ({ children }) => (
                  <pre className="bg-paper-2 border border-white/10 p-5 overflow-x-auto mb-6 font-mono text-xs text-neutral-200 leading-relaxed max-w-3xl">
                    {children}
                  </pre>
                ),
                strong: ({ children }) => (
                  <strong className="text-ink font-semibold">{children}</strong>
                ),
                em: ({ children }) => (
                  <em className="text-neutral-100 not-italic font-medium">{children}</em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="relative my-7 max-w-3xl pl-6 pr-5 py-4 bg-amber/[0.04] border-l-2 border-amber [&>p]:!text-[16px] [&>p]:!text-neutral-100 [&>p]:!mb-0 [&>p]:!leading-relaxed">
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <div className="my-14 flex items-center gap-4 max-w-3xl">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-600">
                      § § §
                    </span>
                    <div className="flex-1 h-px bg-white/10" />
                  </div>
                ),
                a: ({ children, href }) => (
                  <a
                    href={href}
                    className="text-amber underline decoration-amber/40 underline-offset-2 hover:decoration-amber transition-colors"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {prdContent}
            </ReactMarkdown>
          </article>
        </div>

        <footer className="mt-12 py-10 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-neutral-500">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-forest animate-pulse" />
            <span>store_auditor / PRD · draft</span>
          </div>
          <div className="flex items-center gap-6">
            <span>contact · charles@ergoflex.example</span>
            <a href="#top" className="text-neutral-400 hover:text-amber transition-colors">
              ↑ back to top
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}

function HeroStat({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-neutral-500 mb-2">
        {label}
      </div>
      <div
        className={`tabular-nums text-ink ${
          mono ? "font-mono text-base" : "font-display text-2xl"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
