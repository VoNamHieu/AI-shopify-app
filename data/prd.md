# store_auditor — product requirements

Internal product spec for `store_auditor` v0.1. Captures the product reasoning, agent architecture, pricing model, and near-term roadmap.

## Problem

Shopify merchants in the $50k–$500k MRR band consistently lose 20–40% of potential revenue to fixable CRO issues: weak ad↔page coherence, missing trust signals, buried hero SKUs, unserved demand pockets. Hiring a CRO agency to surface these issues costs $8k–$15k/mo and takes 4–6 weeks for a first deliverable.

The work itself is mostly diagnostic — heuristic checks against a known playbook, paired with category-specific benchmarks. It is the kind of work that an agent network can do in 60 seconds for a fraction of the cost, with no loss of fidelity for the diagnostic phase.

### Why now

- Shopify's catalog and analytics APIs expose enough surface area to run the diagnostic agentically.
- Frontier-model agents are now reliable enough to produce a prioritized, defensible fix list — not just generic advice.
- Merchant willingness to pay for "CRO-as-a-button" is validated by recent traction in tools like Triple Whale and Lifesight.

## Target user

Primary persona: **operator-led DTC brand**, 5–25 employees, $50k–$500k MRR, no in-house CRO specialist. The buyer is usually the founder or head of growth. They run paid acquisition, they know their numbers, and they suspect they are leaving money on the table — but cannot articulate exactly where.

Secondary persona: agencies offering CRO as a service. `store_auditor` becomes a first-pass diagnostic that frees their consultants to focus on implementation rather than discovery.

## Solution

A diagnostic-only audit product. Five specialist agents analyze a connected Shopify store in parallel and produce a ranked list of fixes with predicted CR lift and revenue impact per fix.

The audit is the wedge. Implementation (writing the new hero copy, adding the trust block, archiving SKUs) is handled by the merchant — or by a future paid implementation tier.

### Agent architecture

The audit runs across three layers. Each layer's output feeds the next.

| Layer | Agents | Output |
|-------|--------|--------|
| `01 / research` | Market Research | Competitive landscape, price band, demand trends |
| `02 / strategy` | Catalog Strategy | Gap analysis, expansion candidates |
| `03 / optimization` | Page Opt · Trust Signals · Ad↔Page Coherence | Tactical fixes on the current store surface |

Layer 1 and 2 run sequentially (strategy depends on market context). Layer 3 runs in parallel across three agents (independent surfaces).

### Output

Each fix surfaces with:
- **Severity** — critical, high, medium
- **Predicted CR lift** — point estimate with a breakdown by contributing factor
- **Revenue impact** — annualized, based on current traffic and AOV
- **Before / after** — concrete change to ship, not generic advice
- **Refinements** — three alternative phrasings the merchant can pivot to with one click

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Audit | $99 one-time | Single full audit, all 5 agents, exportable PDF |
| Growth | $249 / mo | Monthly re-audit, trend tracking, fix changelog |
| Implementation | $999 / mo | Audit + automated implementation of approved fixes via Shopify API |

The $99 wedge undercuts the cheapest agency engagement by ~99% while still feeling priced like a real product (not a freemium toy).

### Unit economics

- COGS per audit ≈ $4 (model inference, Shopify API calls, storage)
- Gross margin on audit tier: ~96%
- Gross margin on growth tier: ~92% (monthly re-runs)
- Implementation tier margin TBD — depends on action complexity

## Roadmap

### v0.1 — current
- 5 agents, diagnostic only
- Manual approval flow for each fix
- Demo store (ErgoFlex) hardcoded

### v0.2 — connect real stores
- Shopify OAuth + read scopes
- Real catalog, real traffic, real ad spend
- Persistence: audit history per store

### v0.3 — implementation tier
- Write scopes for theme + product catalog
- One-click apply for hero copy, trust blocks, homepage ordering
- Rollback per fix

### v0.4 — multi-channel
- Pull Klaviyo flow data into ad↔page coherence checks
- Pull Meta + Google ad creatives via official APIs
- Replace placeholder ad-creative analysis with live data

## Risks

- **Model drift on CR predictions.** Predicted lift is the most defensible claim in the product. If predictions miss reality by more than 30% on average, merchants will churn. Mitigation: backtest predictions against approved fixes, publish accuracy bands.
- **Shopify API rate limits.** Full audit makes ~80 API calls. Bulk audit operations across an agency's portfolio could hit limits. Mitigation: batch + cache aggressively.
- **Race against Shopify-native tooling.** If Shopify ships a first-party "Magic CRO" agent, our wedge erodes. Mitigation: ship faster, focus on multi-channel signals Shopify cannot see.

## Success metrics

- **Activation:** % of signups that complete a first audit (target: 80%+)
- **Approval rate:** average % of recommended fixes a merchant approves (target: 40%+)
- **Prediction accuracy:** rolling 90-day MAPE on CR lift predictions (target: <25%)
- **Revenue retention:** monthly gross dollar retention on growth tier (target: >95%)

## Open questions

1. Should the implementation tier be opt-in per-fix or auto-apply with rollback?
2. Do we expose agent thought streams in the final product, or is the analysis screen demo-only?
3. How much of the audit narrative should be model-generated vs templated? Templated is cheaper and more consistent; generated is more compelling.

## Research foundations

The CR lift predictions surfaced by `store_auditor` are bounded by what the vertical itself permits. Every recommendation is calibrated against published benchmarks so the demo never claims numbers that an experienced merchant would reject on sight.

### Conversion rate benchmarks by vertical

| Vertical | Typical CR | Source |
|----------|-----------|--------|
| Food & beverage | 5.5% | Dynamic Yield 2024 |
| Health & beauty | 4.2% | Dynamic Yield 2024 |
| Apparel | 2.4% | Dynamic Yield 2024 |
| Electronics | 1.8% | IRP 2024 |
| **Home & furniture** | **1.8%** | ECDB 2024 — *lowest major vertical* |
| Luxury | 0.85% | Dynamic Yield 2025 |

Realistic CRO lift expectations: **20–40% relative over 6 months** for a store sitting at the vertical median. Higher lifts are possible but require structural changes (pricing, supply, brand) outside what a diagnostic audit can recommend.

### Vertical ceiling reality check

Older benchmark posts cite Wayfair at ~2.9% and Overstock at ~3.1%. Those numbers are stale and recycled. Current data (Grips Intelligence, April 2026) puts wayfair.com at **1.5–2.0%** — converging with the vertical median. Overstock no longer operates as a standalone storefront.

The implication: dedicated CRO teams at category leaders do not produce structural CR advantages over the vertical median in furniture. The CRO ceiling sits closer to **~2.5% (top quartile)** than the often-cited 3%+.

`store_auditor` predictions are bounded by this reality. A median furniture store (1.8% CR) can credibly approach top quartile (~2.5%) with a strong fix stack. Sustained 3%+ requires structural advantages — supply, pricing, brand — beyond what CRO alone delivers.

## Demo scope · realistic numbers

The ErgoFlex demo is calibrated against the vertical ceiling. Baseline:

- **CR:** 1.8% (matches ECDB US furniture median)
- **Traffic:** 84k monthly visits
- **AOV:** $300 (mid-tier ergonomic furniture, consistent with $180–$520 category band)
- **Baseline revenue:** ~$454k/mo · ~$5.44M/yr

Per-fix lifts on CR fixes derive revenue from `traffic × baseline CR × relative lift × AOV × 12`. Catalog expansion is modeled separately as TAM expansion (orders the existing funnel cannot produce).

| Fix | Lift type | Annual revenue lift |
|-----|-----------|---------------------|
| Ad ↔ Page coherence | +13% rel. CR | $708k |
| Trust signals on PDP | +7% rel. CR | $381k |
| Homepage restructure | +4% rel. CR | $218k |
| Catalog expansion | TAM (net-new orders) | $120k |

Per-fix CR lifts are **relative** percentages, not absolute percentage points. They compound multiplicatively in the impact summary — `(1 + L₁) × (1 + L₂) × …` — so two stacked fixes of +10% each yield +21%, not +20%. This is the correct treatment for sequential CR improvements.

Catalog expansion does not lift CR on existing traffic — it adds new SKUs that capture demand currently flowing to competitors. Tracked as TAM, not folded into the CR compound.

### Blended outcome

Compounded across the three CR fixes: `1.13 × 1.07 × 1.04 = 1.2575`.

- **1.8% → ~2.26% absolute CR**
- **+25.7% relative lift (CR side)**
- **$1.40M/yr from CR fixes + $120k/yr from catalog TAM = ~$1.52M/yr total revenue impact**

Moves the store from the vertical median (1.8%) toward the top quartile (~2.5%). Top-decile territory (3%+) remains aspirational and is not promised by the audit.
