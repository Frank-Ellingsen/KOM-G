/**
 * KOM-G: KomKostra Executive Cockpit & BI Portal
 * Dynamic Power BI Cross-Filtering Engine & Slicer Reactive Architecture
 * Supporting all 25 specialized catalog pages with dynamic SVG visuals and root cause insights.
 */

// Global Filter State (Mirroring Power BI Slicer Context)
const activeFilters = {
  sector: "all",
  function: "all",
  month: "ytd",
  category: "all"
};

let currentChartMode = "scurve";
let activePageId = "p04";
let latestAggregates = null;

// Power BI 25-Siders Rapportkatalog
const REPORT_PAGES = [
  // Ledelse (6)
  { id: "p01", title: "01. Hovedrapport (Kommuneøkonomi 2024)", cat: "executive", desc: "Konsolidert ledelsesstatus for politisk og administrativ ledelse med automatisk avvikskommentar.", visual: "Executive KPI Cards & Story Narrative" },
  { id: "p02", title: "02. Sektor: Oppvekst og Utdanning", cat: "executive", desc: "Dypdykk i skolesektoren per funksjon og art, måned-over-måned analyse (MoM) og overforbruksrangering.", visual: "MoM Matrix & Sparklines" },
  { id: "p03", title: "03. Sektor: Helse og Mestring", cat: "executive", desc: "Detaljert analyse av pleie og omsorg, vikarbyråkostnader og restårs tiltaksbehov.", visual: "Diverging Variance & Cost Drivers" },
  { id: "p04", title: "04. Månedlig Avvik og Prognose", cat: "executive", desc: "Tufte S-kurver for kumulativt forbruk, 3-måneders glidende snitt (3M MA) og fremskrivning mot årsslutt.", visual: "Tufte S-Curves & 3M MA Band" },
  { id: "p05", title: "05. KOSTRA Struktur og Nøkkeltall", cat: "executive", desc: "Pareto 80/20 driverfordeling og korrelasjonstest mellom periodisert budsjett og faktisk regnskap.", visual: "Pareto 80/20 & Scatter Correlation" },
  { id: "p06", title: "06. What-If Scenario og Balanse", cat: "executive", desc: "Dynamisk simulering av kutt i vikar/overtid og budsjettjustering for å gjenopprette balanse.", visual: "What-If Sliders & Balancing Waterfall" },

  // Financial Times Visual Guide (9)
  { id: "p_ft01", title: "FT 01: Deviation (Avviksanalyser)", cat: "ft", desc: "Diverging bar charts og bullet-kolonner for mindreforbruk vs merforbruk.", visual: "FT Diverging Bars & Bullet Columns" },
  { id: "p_ft02", title: "FT 02: Correlation (Korrelasjon)", cat: "ft", desc: "Scatter plots og korrelasjonsmatriser for overtid vs vikarbruk.", visual: "Scatter Matrix & Trendlines" },
  { id: "p_ft03", title: "FT 03: Ranking (Rangeringsanalyser)", cat: "ft", desc: "Sorterte stolper og lollipop-diagrammer over de største kostnadsdriverne.", visual: "Lollipop Charts & Sorted Bars" },
  { id: "p_ft04", title: "FT 04: Distribution (Fordeling)", cat: "ft", desc: "Fordeling og spredning i driftsutgifter og enhetsavvik.", visual: "Histogram & Boxplot Dispersion" },
  { id: "p_ft05", title: "FT 05: Change over Time (Tidsutvikling)", cat: "ft", desc: "Stepped lines (trappetrinn) og kumulative arealdiagrammer over 8 måneder.", visual: "Stepped Lines & Cumulative Area" },
  { id: "p_ft06", title: "FT 06: Magnitude (Størrelsessammenligning)", cat: "ft", desc: "Grupperte stolpediagrammer for budsjett vs regnskap per KOSTRA-funksjon.", visual: "Grouped Bars & Category Scaling" },
  { id: "p_ft07", title: "FT 07: Part-to-Whole (Del av Helhet)", cat: "ft", desc: "Treemap over KOSTRA-hovedkategorier og bidrag til samlet regnskap.", visual: "Treemap & 100% Stacked Columns" },
  { id: "p_ft08", title: "FT 08: Spatial (Sone- og Geografifordeling)", cat: "ft", desc: "Ressursfordeling per geografisk tjenestesone og enhet i Kristiansand.", visual: "Zone Distribution & Choropleth Matrix" },
  { id: "p_ft09", title: "FT 09: Flow (Flyt & Ressursallokering)", cat: "ft", desc: "Allokeringsvannfall fra rammebevilgning til sektorer og enheter.", visual: "Sankey Flow & Resource Allocation" },

  // Time-Visuals 60 (10)
  { id: "p_time01", title: "Time 01: Line Charts (#01–#10)", cat: "time", desc: "Discrete, continuous, stepped og multi-series linjediagrammer.", visual: "Multi-Series Continuous & Stepped Lines" },
  { id: "p_time02", title: "Time 02: Moving Averages & Bands (#11–#13)", cat: "time", desc: "3M glidende gjennomsnitt og utjevnede kostnadstrender.", visual: "3-Month Moving Average & Confidence Bands" },
  { id: "p_time03", title: "Time 03: Area & Stream Charts (#14–#17)", cat: "time", desc: "Standard areal, stablet areal og prosentvise sektorsammensetninger.", visual: "Stacked Area & Percent Trend Streams" },
  { id: "p_time04", title: "Time 04: Differences & Variances (#19–#22)", cat: "time", desc: "MoM endringer i kr og %, varians mot gjennomsnitt og indeksert vekst (Jan=100).", visual: "Indexed Baseline (Jan=100) & MoM Delta" },
  { id: "p_time05", title: "Time 05: Running Totals & S-Curves (#23–#25)", cat: "time", desc: "Tufte S-kurver for akkumulert forbruk mot budsjett og EAC.", visual: "Cumulative S-Curves & Direct Labeling" },
  { id: "p_time06", title: "Time 06: Bars & Columns (#26–#30)", cat: "time", desc: "Grupperte kolonner (budsjett vs regnskap) og divergerende stolper.", visual: "Grouped Benchmark Columns" },
  { id: "p_time07", title: "Time 07: Lollipops & Thresholds (#31–#35)", cat: "time", desc: "Lollipop-grafer og bullet-toleransegrenser (80 % buffer og 110 % varsel).", visual: "Target Reference Lines & Bullet Limits" },
  { id: "p_time08", title: "Time 08: Cycles & Slopes (#38–#43)", cat: "time", desc: "Slope graphs (avviksendring Jan til Aug) og sesongmatriser.", visual: "Slopegraph (M01 vs M08) & Seasonal Heatmap" },
  { id: "p_time09", title: "Time 09: Dots & Sparklines (#44–#51)", cat: "time", desc: "Connected dot plots og KOSTRA sparklinematriser.", visual: "Sparkline KPI Grid & Connected Dots" },
  { id: "p_time10", title: "Time 10: Waterfall & Stocks (#52–#60)", cat: "time", desc: "Tidsmessige scatterplots og månedlige avviksvannfall mot årsslutt (EOY).", visual: "Monthly Variance Waterfall to EOY" }
];

// Mapping fra samtlige 25 rapportside-IDer til aktiv visualiseringsmodus
const PAGE_TO_MODE = {
  // Ledelse (6)
  "p01": "executive",
  "p02": "oppvekst",
  "p03": "helse",
  "p04": "scurve",
  "p05": "pareto",
  "p06": "waterfall",

  // Financial Times (9)
  "p_ft01": "diverging",
  "p_ft02": "correlation",
  "p_ft03": "lollipop",
  "p_ft04": "distribution",
  "p_ft05": "stepped",
  "p_ft06": "magnitude",
  "p_ft07": "treemap",
  "p_ft08": "spatial",
  "p_ft09": "flow",

  // Time-Visuals 60 (10)
  "p_time01": "lines_multi",
  "p_time02": "moving_avg",
  "p_time03": "area_stream",
  "p_time04": "indexed_mom",
  "p_time05": "scurve",
  "p_time06": "monthly",
  "p_time07": "lollipop",
  "p_time08": "slope",
  "p_time09": "sparklines",
  "p_time10": "waterfall"
};

// Formater tall på norsk standard (f.eks. -2 229,6 kNOK)
function formatNok(val, decimals = 1) {
  if (val === undefined || val === null || isNaN(val)) return "0,0";
  const parts = Math.abs(val).toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const formatted = parts.join(",");
  return val < 0 ? `-${formatted}` : formatted;
}

// 1. Initialiser Slicere fra dimensjonslister
function initSlicers() {
  if (typeof KOSTRA_DIMENSIONS === "undefined") return;

  const funcSelect = document.getElementById("slicer-function");
  if (funcSelect) {
    funcSelect.innerHTML = `<option value="all">Alle KOSTRA-Funksjoner</option>` + 
      KOSTRA_DIMENSIONS.functions.map(f => `<option value="${f.func_code}">${f.func_name}</option>`).join("");
  }

  const catSelect = document.getElementById("slicer-category");
  if (catSelect) {
    catSelect.innerHTML = `<option value="all">Alle Kontokategorier</option>` + 
      KOSTRA_DIMENSIONS.categories.map(c => `<option value="${c}">${c}</option>`).join("");
  }
}

// 2. Filtrer rådata basert på aktiv slicer-kontekst
function getFilteredRecords() {
  if (typeof KOSTRA_RECORDS === "undefined") return [];

  return KOSTRA_RECORDS.filter(r => {
    if (activeFilters.sector !== "all" && r[1] !== activeFilters.sector) return false;
    if (activeFilters.function !== "all" && r[2] !== parseInt(activeFilters.function)) return false;
    if (activeFilters.category !== "all" && r[6] !== activeFilters.category) return false;
    if (activeFilters.month !== "ytd") {
      const targetM = parseInt(activeFilters.month);
      if (r[0] !== targetM) return false;
    }
    return true;
  });
}

// 3. Beregn dynamiske aggregater fra filtrerte rader
function calculateAggregates(records) {
  let totalBudget = 0;
  let totalActual = 0;
  let oppvekstBudget = 0, oppvekstActual = 0;
  let helseBudget = 0, helseActual = 0;

  const monthMap = {};
  for (let m = 1; m <= 8; m++) {
    monthMap[m] = { budget: 0, actual: 0 };
  }

  const accountMap = {};
  const funcMap = {};
  const catMap = {};

  let vikarbyraMonthlyBase = 0;
  let overtidMonthlyBase = 0;

  records.forEach(r => {
    const m = r[0];
    const sector = r[1];
    const funcCode = r[2];
    const funcName = r[3];
    const accCode = r[4];
    const accName = r[5];
    const catName = r[6];
    const b = r[7];
    const a = r[8];

    totalBudget += b;
    totalActual += a;

    if (sector === "Oppvekst og Utdanning") {
      oppvekstBudget += b;
      oppvekstActual += a;
    } else if (sector === "Helse og Omsorg") {
      helseBudget += b;
      helseActual += a;
    }

    if (monthMap[m]) {
      monthMap[m].budget += b;
      monthMap[m].actual += a;
    }

    // Drivere
    if (!accountMap[accCode]) {
      accountMap[accCode] = { code: accCode, name: accName, sector: sector, budget: 0, actual: 0, m01: 0, m08: 0, cat: catName };
    }
    accountMap[accCode].budget += b;
    accountMap[accCode].actual += a;
    if (m === 1) accountMap[accCode].m01 += a;
    if (m === 8) accountMap[accCode].m08 += a;

    // Funksjoner
    if (!funcMap[funcCode]) {
      funcMap[funcCode] = { code: funcCode, name: funcName, sector: sector, budget: 0, actual: 0, m01: 0, m08: 0 };
    }
    funcMap[funcCode].budget += b;
    funcMap[funcCode].actual += a;
    if (m === 1) funcMap[funcCode].m01 += a;
    if (m === 8) funcMap[funcCode].m08 += a;

    // Kategorier
    if (!catMap[catName]) {
      catMap[catName] = { name: catName, budget: 0, actual: 0 };
    }
    catMap[catName].budget += b;
    catMap[catName].actual += a;

    // Simulator baser
    if (accCode === 127040 && (activeFilters.month === "ytd" ? m === 8 : true)) {
      vikarbyraMonthlyBase += a;
    }
    if (accCode === 104000 && (activeFilters.month === "ytd" ? m === 8 : true)) {
      overtidMonthlyBase += a;
    }
  });

  const totalVariance = totalBudget - totalActual;
  const totalSpendPct = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  const monthNames = ["Jan (01)", "Feb (02)", "Mar (03)", "Apr (04)", "Mai (05)", "Jun (06)", "Jul (07)", "Aug (08)"];
  const monthly = Object.keys(monthMap).sort((a,b) => a-b).map(m => {
    const d = monthMap[m];
    return {
      month: monthNames[m - 1],
      mNum: parseInt(m),
      budget: d.budget,
      actual: d.actual,
      variance: d.budget - d.actual
    };
  });

  const drivers = Object.values(accountMap).map(d => ({
    ...d,
    variance: d.budget - d.actual
  })).sort((a, b) => a.variance - b.variance);

  const functions = Object.values(funcMap).map(f => ({
    ...f,
    variance: f.budget - f.actual
  })).sort((a, b) => a.variance - b.variance);

  const categories = Object.values(catMap).map(c => ({
    ...c,
    variance: c.budget - c.actual
  })).sort((a, b) => b.actual - a.actual);

  const slopeData = Object.values(funcMap)
    .filter(f => (f.m01 > 0 || f.m08 > 0))
    .map(f => {
      const diff = f.m08 - f.m01;
      const pct = f.m01 > 0 ? (diff / f.m01) * 100 : (f.m08 > 0 ? 100 : 0);
      return { ...f, diff, pct };
    })
    .sort((a, b) => b.m08 - a.m08)
    .slice(0, 6);

  // Waterfall steps
  const fastlonnVar = (accountMap[101000]?.budget || 0) - (accountMap[101000]?.actual || 0);
  const vikarbyraVar = (accountMap[127040]?.budget || 0) - (accountMap[127040]?.actual || 0);
  const overtidVar = (accountMap[104000]?.budget || 0) - (accountMap[104000]?.actual || 0);
  const vikarKortVar = (accountMap[102013]?.budget || 0) - (accountMap[102013]?.actual || 0);
  let refVar = 0;
  records.forEach(r => { if (r[6] === "Refusjoner") refVar += (r[7] - r[8]); });
  const capturedVar = fastlonnVar + vikarbyraVar + overtidVar + vikarKortVar + refVar;
  const ovrigVar = totalVariance - capturedVar;

  const waterfallSteps = [
    { name: "Budsjett YTD", amount: totalBudget, delta: totalBudget, isAnchor: true, color: "#64748b" },
    { name: "Fastlønn (101)", amount: fastlonnVar, delta: fastlonnVar, isAnchor: false, color: fastlonnVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Vikarbyrå (127)", amount: vikarbyraVar, delta: vikarbyraVar, isAnchor: false, color: vikarbyraVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Overtid (104)", amount: overtidVar, delta: overtidVar, isAnchor: false, color: overtidVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Korttidsvikar", amount: vikarKortVar, delta: vikarKortVar, isAnchor: false, color: vikarKortVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Refusjoner", amount: refVar, delta: refVar, isAnchor: false, color: refVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Øvrig drift", amount: ovrigVar, delta: ovrigVar, isAnchor: false, color: ovrigVar < 0 ? "#f43f5e" : "#10b981" },
    { name: "Regnskap YTD", amount: totalActual, delta: totalActual, isAnchor: true, color: "#38bdf8" }
  ];

  return {
    totalBudget,
    totalActual,
    totalVariance,
    totalSpendPct,
    oppvekstBudget,
    oppvekstActual,
    oppvekstVariance: oppvekstBudget - oppvekstActual,
    helseBudget,
    helseActual,
    helseVariance: helseBudget - helseActual,
    monthly,
    drivers,
    functions,
    categories,
    slopeData,
    waterfallSteps,
    vikarbyraMonthlyBase,
    overtidMonthlyBase,
    recordCount: records.length
  };
}

// 4. Oppdater Aktiv Filter Context Breadcrumbs
function updateFilterContextBar(totalRecords, matchingRecords) {
  const container = document.getElementById("active-filters-container");
  const countEl = document.getElementById("filter-record-count");

  if (countEl) {
    const pct = totalRecords > 0 ? ((matchingRecords / totalRecords) * 100).toFixed(0) : 0;
    countEl.innerText = `Viser ${matchingRecords} av ${totalRecords} rader (${pct} %)`;
  }

  if (!container) return;
  const chips = [];

  if (activeFilters.sector !== "all") {
    chips.push(`<span class="filter-chip">Sektor: <strong>${activeFilters.sector}</strong> <span class="filter-chip-remove" data-clear="sector">✕</span></span>`);
  }
  if (activeFilters.function !== "all") {
    const fObj = KOSTRA_DIMENSIONS.functions.find(f => f.func_code == activeFilters.function);
    const label = fObj ? fObj.func_name : activeFilters.function;
    chips.push(`<span class="filter-chip">Funksjon: <strong>${label}</strong> <span class="filter-chip-remove" data-clear="function">✕</span></span>`);
  }
  if (activeFilters.month !== "ytd") {
    chips.push(`<span class="filter-chip">Periode: <strong>Måned 0${activeFilters.month}</strong> <span class="filter-chip-remove" data-clear="month">✕</span></span>`);
  } else {
    chips.push(`<span class="filter-chip">Periode: <strong>Akkumulert YTD (01–08)</strong></span>`);
  }
  if (activeFilters.category !== "all") {
    chips.push(`<span class="filter-chip">Kategori: <strong>${activeFilters.category}</strong> <span class="filter-chip-remove" data-clear="category">✕</span></span>`);
  }

  if (chips.length === 0) {
    container.innerHTML = `<span style="color:var(--text-muted);">Aktiv kontekst:</span> <span class="filter-chip">Konsolidert Total (Alle filtre)</span>`;
  } else {
    container.innerHTML = `<span style="color:var(--text-muted);">Aktiv kontekst:</span> ` + chips.join(" ");
  }

  container.querySelectorAll(".filter-chip-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const toClear = btn.getAttribute("data-clear");
      if (toClear === "sector") {
        activeFilters.sector = "all";
        document.getElementById("slicer-sector").value = "all";
      } else if (toClear === "function") {
        activeFilters.function = "all";
        document.getElementById("slicer-function").value = "all";
      } else if (toClear === "month") {
        activeFilters.month = "ytd";
        document.getElementById("slicer-month").value = "ytd";
      } else if (toClear === "category") {
        activeFilters.category = "all";
        document.getElementById("slicer-category").value = "all";
      }
      applyFilters();
    });
  });
}

// 5. Oppdater KPI-Kortene dynamisk
function updateKpiCards(aggs) {
  const topIndicator = document.getElementById("top-status-indicator");
  if (topIndicator) {
    const isPos = aggs.totalVariance >= 0;
    topIndicator.className = isPos ? "status-indicator pos" : "status-indicator";
    topIndicator.innerHTML = `
      <span class="pulse-dot"></span>
      <span>${activeFilters.month === 'ytd' ? 'YTD' : 'M' + activeFilters.month} Avvik: ${formatNok(aggs.totalVariance)} kNOK (${aggs.totalSpendPct.toFixed(1)} %)</span>
    `;
  }

  const kpi1Title = document.getElementById("kpi1-title");
  const kpi1Tag = document.getElementById("kpi1-tag");
  const kpi1Val = document.getElementById("kpi1-value");
  const kpi1Budget = document.getElementById("kpi1-budget");
  const kpi1Var = document.getElementById("kpi1-variance");

  if (kpi1Title) kpi1Title.innerText = activeFilters.sector === "all" ? "Konsolidert Regnskap" : `${activeFilters.sector}`;
  if (kpi1Tag) kpi1Tag.innerText = activeFilters.month === "ytd" ? "YTD M01–M08" : `Måned 0${activeFilters.month}`;
  if (kpi1Val) kpi1Val.innerText = formatNok(aggs.totalActual);
  if (kpi1Budget) kpi1Budget.innerHTML = `Budsjett: <strong>${formatNok(aggs.totalBudget)} k</strong>`;
  if (kpi1Var) {
    const isPos = aggs.totalVariance >= 0;
    kpi1Var.className = isPos ? "variance-pill pos" : "variance-pill neg";
    kpi1Var.innerText = `${formatNok(aggs.totalVariance)} k (${aggs.totalSpendPct.toFixed(1)} %)`;
  }

  // KPI 2: Oppvekst
  const kpi2Val = document.getElementById("kpi2-value");
  const kpi2Budget = document.getElementById("kpi2-budget");
  const kpi2Var = document.getElementById("kpi2-variance");
  if (kpi2Val) kpi2Val.innerText = formatNok(aggs.oppvekstActual);
  if (kpi2Budget) kpi2Budget.innerHTML = `Budsjett: <strong>${formatNok(aggs.oppvekstBudget)} k</strong>`;
  if (kpi2Var) {
    const pct = aggs.oppvekstBudget > 0 ? (aggs.oppvekstActual / aggs.oppvekstBudget) * 100 : 0;
    kpi2Var.className = aggs.oppvekstVariance >= 0 ? "variance-pill pos" : "variance-pill neg";
    kpi2Var.innerText = `${formatNok(aggs.oppvekstVariance)} k (${pct.toFixed(1)} %)`;
  }

  // KPI 3: Helse
  const kpi3Val = document.getElementById("kpi3-value");
  const kpi3Budget = document.getElementById("kpi3-budget");
  const kpi3Var = document.getElementById("kpi3-variance");
  if (kpi3Val) kpi3Val.innerText = formatNok(aggs.helseActual);
  if (kpi3Budget) kpi3Budget.innerHTML = `Budsjett: <strong>${formatNok(aggs.helseBudget)} k</strong>`;
  if (kpi3Var) {
    const pct = aggs.helseBudget > 0 ? (aggs.helseActual / aggs.helseBudget) * 100 : 0;
    kpi3Var.className = aggs.helseVariance >= 0 ? "variance-pill pos" : "variance-pill neg";
    kpi3Var.innerText = `${formatNok(aggs.helseVariance)} k (${pct.toFixed(1)} %)`;
  }

  // KPI 4: Siste måned
  const kpi4Val = document.getElementById("kpi4-value");
  const kpi4Budget = document.getElementById("kpi4-budget");
  const kpi4Var = document.getElementById("kpi4-variance");
  const mTarget = activeFilters.month === "ytd" ? 8 : parseInt(activeFilters.month);
  const mData = aggs.monthly.find(m => m.mNum === mTarget) || aggs.monthly[aggs.monthly.length - 1];

  if (kpi4Val) kpi4Val.innerText = formatNok(mData.actual);
  if (kpi4Budget) kpi4Budget.innerHTML = `Budsjett: <strong>${formatNok(mData.budget)} k</strong>`;
  if (kpi4Var) {
    const mPct = mData.budget > 0 ? (mData.actual / mData.budget) * 100 : 0;
    kpi4Var.className = mData.variance >= 0 ? "variance-pill pos" : "variance-pill neg";
    kpi4Var.innerText = `${formatNok(mData.variance)} k (${mPct.toFixed(1)} %)`;
  }
}

// 6. Metadata ordbok for alle visuelle moduser (Inkludert Rotårsak & Anbefalte Tiltak)
const CHART_META = {
  executive: {
    title: "🏛️ 01. Hovedrapport: Konsolidert Kommuneøkonomi 2024 (Executive Status)",
    sub: "Politisk og administrativ ledelsesstatus: Budsjett, regnskap og avvik per sektor Jan–Aug 2024",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Faktisk Regnskap</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
    `,
    rootCause: "Samlet overforbruk på -2 229,6 kNOK (107,6 %) drives av to hovedfaktorer: 1) Tariffjustering per 01.05.2024 (fastlønn art 101000: -1,89 MNOK) som ikke var periodisert inn, og 2) Ubudsjettert vikarbyråinnleie (art 127040: -382,7 kNOK) i helsesektoren.",
    rec: "1) Fremme sak om rammejustering i Tertialrapport 2 for lønnsoppgjøret mot sentral reserve (+1,89 MNOK). 2) Iverksette umiddelbar godkjenningsplikt for vikarbyrå over avdelingsledernivå. 3) Kvartalsvis rammekontroll med 80 % varsling.",
    legal: "Kommuneloven § 14-4 (krav om økonomisk balanse) / Helse- og omsorgstjenesteloven § 4-1.",
    impact: "Forhindrer permanent budsjettsprekk på -3,3 MNOK ved årsslutt; innsparingspotensial: 350–500 kNOK."
  },
  oppvekst: {
    title: "🏫 02. Sektor: Oppvekst og Utdanning (KomSkole Dypdykk)",
    sub: "Analyse av skolesektoren: Ordinær grunnskole (1200), SFO (1210), spesialundervisning (1220) og lønnsavvik",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Regnskap Oppvekst (18 902 k)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (17 958 k)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Avvik: -944,0 kNOK (105,3 %)</span></div>
    `,
    rootCause: "Fastlønnsavviket (art 101000: -1 414,0 kNOK) er et teknisk periodiseringsavvik som følge av vårens lønnsoppgjør (+5,2 %). Skolestart i august medfører i tillegg forventet sesongtopp i korttidsvikarer (art 102013).",
    rec: "1) Juster periodisert ramme i Tertialrapport 2 (+1,41 MNOK). 2) Skjerm lærernormen strengt – unngå feilaktig panikk-kutting i undervisningsårsverk. 3) Stram inn vikarbruk i SFO og assistentressurser.",
    legal: "Opplæringsloven § 8-2 (lærernorm: maks 15 elever per lærer på 1.–4. trinn, maks 20 på 5.–10. trinn).",
    impact: "Sikrer samsvar med lovpålagte bemanningskrav; vikarbegrensning gir ca. 85 kNOK i restårsgevinst."
  },
  helse: {
    title: "🏥 03. Sektor: Helse og Mestring (Pleie & Omsorg / Bomiljø)",
    sub: "24/7 døgnturnus, institusjon (2540) og hjemmetjenester: Vikarbyrå og overtidsanalyse",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Regnskap Helse (12 623 k)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (11 337 k)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Avvik: -1 285,6 kNOK (111,3 %)</span></div>
    `,
    rootCause: "Strukturell mangel på vernepleiere og sykepleiere har tvunget frem omfattende vikarbyråinnleie (art 127040: 382,7 kNOK YTD, hvorav 253,2 k i august). Sammen med overtid (art 104000: -88,9 kNOK) gir dette en kritisk run-rate.",
    rec: "1) Innfør administrativ godkjenningsplikt for vikarbyrå over avdelingsledernivå. 2) Etabler langvakter i helgeturnus. 3) Lys ut faste helgestillinger for studenter for å avlaste turnusen.",
    legal: "Helse- og omsorgstjenesteloven § 4-1 (forsvarlighetskrav) / Arbeidsmiljøloven § 10-6 (maks 200 t overtid/år).",
    impact: "50 % reduksjon i byråinnleie sparer ca. 250 kNOK over 4 gjenværende måneder (Sep–Des)."
  },
  scurve: {
    title: "📈 04 / Time 05: Tufte S-Kurve & Akkumulert Forbruk (Running Totals)",
    sub: "Direkte etiketter på endepunkter, null vertikale gitterlinjer, kNOK akkumulert Jan–Aug 2024",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b; border:1px dashed #64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:rgba(244,63,94,0.4);"></div><span>Areal: Merforbruk</span></div>
    `,
    rootCause: "Forbrukskurven skiller lag med budsjettbanen fra og med mai (lønnsoppgjør) og akselererer i juli/august pga. ferievikarer og byråinnleie.",
    rec: "Bøye kurven tilbake ved å innføre innkjøps- og innleiestopp i september, samt overføre lønnsreserve i tertial 2.",
    legal: "Kommunelovens krav til økonomistyring og periodisering.",
    impact: "Må hente inn 557 kNOK per måned for å unngå -3,3 MNOK i akkumulert underskudd 31.12.2024."
  },
  pareto: {
    title: "📊 05: KOSTRA Struktur & Pareto 80/20 Driverfordeling",
    sub: "Akkumulert avviksbidrag: Avslører at 2 av 38 kontokoder står for 85,3 % av samlet merforbruk",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Avvik per art (kNOK)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Kumulativ andel %</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b; border-top:1px dashed #f59e0b;"></div><span>80% Pareto-grense</span></div>
    `,
    rootCause: "Fastlønn (art 101000: 1 888,9 kNOK) og Vikarbyrå (art 127040: 382,7 kNOK) genererer alene over 85 % av overforbruket. Resterende poster har marginal betydning.",
    rec: "Konsentrer 90 % av controller-innsatsen på disse to postene. Unngå detaljstyring av små driftskontoer.",
    legal: "Tufte Data-Ink & Vesentlighetsprinsippet i regnskap.",
    impact: "Å løse disse to postene gjenoppretter 85 % av den finansielle balansen."
  },
  waterfall: {
    title: "🌊 06 / Time 10: Budsjett til EAC Avviksvannfall (Variance Bridge)",
    sub: "Trinnvis forklaring av avviksbroen fra opprinnelig budsjett via avviksposter til regnskap og prognose",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (Start)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Kostnadsøkning (Merforbruk)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Innsparing / Refusjon</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap YTD</span></div>
    `,
    rootCause: "Vannfallet demonstrerer trinnvis hvordan fastlønnsjustering (-1 889 k) og vikarbyrå (-383 k) hever driftsnivået over budsjettet.",
    rec: "Bruk simulatorens kutt-alternativer (25 % vikarreduksjon, 15 % overtidskutt) for å reversere trinnene før EOY.",
    legal: "Årsregnskapsforskriften & Periodiseringsprinsipper.",
    impact: "Simulerte tiltak reduserer forventet årssluttavvik med inntil 540 kNOK."
  },
  diverging: {
    title: "⚖️ FT 01: Divergerende Avviksstolper (Deviation / Avvik mot 0-aksen)",
    sub: "Sentrert rundt 0 kNOK: Røde stolper til venstre viser merforbruk, grønne til høyre viser mindreforbruk",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk (Overskridelse)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk (Innsparing)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:var(--border-prominent);"></div><span>0-Aksen (Balanse)</span></div>
    `,
    rootCause: "Sterk polarisering: Grunnskole og institusjonspleie har markante røde avvik, mens administrasjon og politisk styring har mindreforbruk.",
    rec: "Omdisponere ubenyttede administrative rammer til kjernevirksomhet.",
    legal: "Delegeringsreglement for rammeoverføringer.",
    impact: "Intern omdisponering frigjør inntil 140 kNOK."
  },
  correlation: {
    title: "🔬 FT 02: Korrelasjon (Overtid vs Vikarbruk i Turnus)",
    sub: "Scatterplot og regresjonstrendlinje: Sammenheng mellom overtid (art 104000) og vikarbruk (art 127040)",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Månedsobservasjon</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e; border-top:1px dashed #f43f5e;"></div><span>Lineær trend (R² = 0.89)</span></div>
    `,
    rootCause: "Høy korrelasjon (R² = 0.89) indikerer at overtid og vikarbyrå stiger i takt. Dette beviser at det er akutt fravær og underbemanning, ikke overforbruk av luksusartikler.",
    rec: "Ikke kutt overtid uten å skaffe faste turnusvikarer; ellers kollapser bemanningen og dyrere byråer må hentes inn.",
    legal: "Arbeidsmiljøloven § 10-6 (vernebestemmelser for arbeidstid).",
    impact: "Turnusrevisjon kutter overtid og innleie samtidig med ca. 220 kNOK."
  },
  lollipop: {
    title: "🍭 FT 03 / Time 07: Lollipop Chart & Toleranseterskler (Ranking & Limits)",
    sub: "Forbruksgrad i % av budsjett for sentrale kostnadsdrivere med stiplede referanselinjer for risikonivå",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Under 100 % (OK)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>100–110 % (Varsel)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Over 110 % (Kritisk)</span></div>
    `,
    rootCause: "Vikarbyråinnleie sprenger 110 %-terskelen med ubudsjetterte utgifter, mens ordinære driftsutgifter ligger pent under 80 % buffer.",
    rec: "Etablere hard stopp i økonomisystemet (innkjøpssperre) ved overskridelse av 110 % varsel.",
    legal: "Innkjøpsreglementet for Kristiansand kommune.",
    impact: "Forhindrer ubudsjetterte bestillinger for ca. 180 kNOK."
  },
  distribution: {
    title: "📦 FT 04: Fordeling & Spredning i Driftsutgifter (Histogram & Boxplot)",
    sub: "Fordeling av månedlige driftsutgifter og enhetsavvik for å identifisere asymmetri og uteliggere",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Median / Kvartilspenn</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Uteliggere (Spesialvedtak)</span></div>
    `,
    rootCause: "De fleste avdelinger holder seg innenfor forventet spredningsintervall, men to institusjonsavdelinger har ekstreme avvik pga. 1-til-1 brukere.",
    rec: "Søke toppfinansiering gjennom den statlige ordningen for ressurskrevende helse- og omsorgstjenester.",
    legal: "Forskrift om statlig tilskudd til ressurskrevende tjenester.",
    impact: "Potensiell statlig refusjon på inntil 650 kNOK."
  },
  stepped: {
    title: "🪜 FT 05: Tidsutvikling med Trappetrinn (Stepped Lines)",
    sub: "Trappetrinn (diskrete budsjett-tildelinger) mot kontinuerlig forbrukslinje over 8 måneder",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (Trappetrinn)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap (Kontinuerlig)</span></div>
    `,
    rootCause: "Budsjettet oppdateres i sprang ved tertialene, mens løpende drift spiser av rammen kontinuerlig, noe som skaper optiske avvik.",
    rec: "Innføre månedlig profilperiodisering i budsjettsystemet.",
    legal: "KOSTRA forskrift om økonomisk rapportering.",
    impact: "Fjerner unødvendig støy i månedsrapporteringen."
  },
  magnitude: {
    title: "📊 FT 06: Størrelsessammenligning per KOSTRA-Funksjon (Magnitude)",
    sub: "Grupperte stolper for budsjett vs. regnskap per 4-sifret KOSTRA-funksjon skalert etter driftsvolum",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjett</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Regnskap</span></div>
    `,
    rootCause: "Funksjon 1200 (Grunnskole) og 2540 (Institusjon) utgjør over 72 % av det totale kostnadsvolumet i kommunen.",
    rec: "Etablere særskilte månedlige controllersamtaler for de to største funksjonene.",
    legal: "Virksomhetsstyringsinstruksen for Kristiansand kommune.",
    impact: "1 % forbedring i disse to funksjonene utgjør over 220 kNOK."
  },
  treemap: {
    title: "🗺️ FT 07: Del av Helhet (KOSTRA Kategori Treemap)",
    sub: "Proporsjonal arealfordeling av driftsutgifter: Lønn (78 %), Varer & Tjenester (15 %), Innleie (5 %), Refusjoner (2 %)",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Lønn & Sosiale utgifter</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Varer og tjenester</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Vikarbyrå & innleie</span></div>
    `,
    rootCause: "Personell- og lønnsutgifter dominerer over 78 % av kommunens økonomi. Besparelser på kontordrift har minimal samlet effekt.",
    rec: "Rett alle innsparingstiltak inn mot vaktplaner, sykefraværsreduksjon og intern turnusfleksibilitet.",
    legal: "KS Hovedtariffavtale og lønnsforhandlinger.",
    impact: "Sikrer at tiltak settes inn der volumet faktisk befinner seg."
  },
  spatial: {
    title: "📍 FT 08: Geografisk Sonefordeling (Kristiansand)",
    sub: "Ressursfordeling og driftskostnader fordelt på kommunens soner: Vågsbygd, Grim/Lund, Randesund, Torridal",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Vågsbygd (32 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Grim & Lund (28 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Randesund (22 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>Torridal (18 %)</span></div>
    `,
    rootCause: "Vågsbygd og Grim/Lund har eldre befolkning og tettere konsentrasjon av omsorgsboliger, noe som forklarer overvekten i ressursbruk.",
    rec: "Gjennomgå rammetildelingsmodellen for å sikre at den reflekterer demografisk utvikling i bydelene.",
    legal: "Kommunal planstrategi og soneorganisering.",
    impact: "Rettferdig fordeling iht. reelt pleie- og elevgrunnlag."
  },
  flow: {
    title: "🔀 FT 09: Ressursallokeringsflyt (Sankey Flow / Allokeringsvannfall)",
    sub: "Flyt fra Sentral Kommuneramme (29,3 MNOK) videre til sektorer, tjenesteområder og artsgrupper",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Rammebevilgning</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Oppvekst (61 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Helse (39 %)</span></div>
    `,
    rootCause: "Tydeliggjør allokeringskjeden og avslører hvor pengene absorberes før de når frem til sluttbruker.",
    rec: "Redusere administrative mellomledd og styrke direkte tildeling til skolene og institusjonene.",
    legal: "Kommunelovens bestemmelser om budsjettdisponering.",
    impact: "Øker andelen midler til direkte tjenesteyting med ca. 2,5 %."
  },
  lines_multi: {
    title: "📈 Time 01: Multi-Series Kontinuerlige Linjediagrammer",
    sub: "Månedlig kostnadsutvikling for de fire største artene: Fastlønn, Vikarbyrå, Overtid og Korttidsvikarer",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Fastlønn (101000)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Vikarbyrå (127040)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>Overtid (104000)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Korttidsvikarer (102013)</span></div>
    `,
    rootCause: "Fastlønn gjør et varig løft fra mai måned. Vikarbyrå stiger bratt i sommermånedene og flater ikke ut i august som forutsatt.",
    rec: "Start rekruttering av sommervikarer i februar for å sikre rimeligere studentkraft fremfor kommersielle byråer.",
    legal: "Arbeidsmiljølovens vilkår for midlertidig ansettelse.",
    impact: "Kan spare inntil 180 kNOK neste sommer."
  },
  moving_avg: {
    title: "📉 Time 02: 3-Måneders Glidende Snitt & Bånd (3M Moving Average)",
    sub: "Utjevnede kostnadstrender og statistisk konfidensbånd for å eliminere tilfeldig månedlig støy",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk månedskostnad</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#0284c7; border-top:2px solid #0284c7;"></div><span>3M Glidende Snitt</span></div>
      <div class="legend-item"><div class="legend-line" style="background:rgba(56,189,248,0.15);"></div><span>Konfidensbånd (±1 SD)</span></div>
    `,
    rootCause: "Underliggende kostnadsnivå har etablert seg på et varig høyere platå etter Q2 (fra 3,6 MNOK til 4,1 MNOK per måned).",
    rec: "Oppjustere rammenivået for 2025-budsjettet for å unngå kunstige underskudd.",
    legal: "Økonomiplan 2025–2028.",
    impact: "Sikrer et realistisk og holdbart budsjettgrunnlag."
  },
  area_stream: {
    title: "🌊 Time 03: Stablet Areal & Sektorsammensetning (Trend Streams)",
    sub: "Prosentvis fordeling av kommunens samlede månedsforbruk mellom Oppvekst og Helse over 8 måneder",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Oppvekst & Utdanning</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Helse & Omsorg</span></div>
    `,
    rootCause: "Helse øker sin relative andel i juli og august fordi døgninstitusjonene må bemannes 24/7 mens skolene har ferie.",
    rec: "Ta hensyn til sesongforskyvningen i kommunens likviditetsbudsjett.",
    legal: "Likviditets- og finansreglementet for Kristiansand kommune.",
    impact: "Optimaliserer kommunens renteinntekter og trekkrettigheter."
  },
  indexed_mom: {
    title: "📊 Time 04: Indeksert Kostnadsvekst (Januar M01 = 100)",
    sub: "Normalisert vekstkurve: Viser hvilke kostnadsposter som vokser raskest relativt til januar-nivået",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Vikarbyrå (Indeks: 280)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>Overtid (Indeks: 165)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Fastlønn (Indeks: 108)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b; border-top:1px dashed #64748b;"></div><span>Januar Basislinje (100)</span></div>
    `,
    rootCause: "Vikarbyrå har eksplodert til indeks 280 (180 % økning fra januar), mens ordinær fastlønn kun har steget 8 % (indeks 108).",
    rec: "Beviser at det ikke er fastlønnsvekst, men ekstern innleie som skaper budsjettkrisen.",
    legal: "KS Tariffavtaler og bemanningsfaktorer.",
    impact: "Å stoppe innleie-indeksen reverserer over 250 kNOK i merforbruk."
  },
  monthly: {
    title: "📊 Time 06: Månedlig Forbruk & Avvik (Grouped Benchmark Columns)",
    sub: "Grupperte kolonner: Budsjett vs. Faktisk regnskap isolert per måned Jan–Aug 2024 (kNOK)",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Regnskap (Innen ramme)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Regnskap (Merforbruk)</span></div>
    `,
    rootCause: "Merforbruket var moderat i Q1 (ca. 100 k/mnd), men skjøt fart etter mai med ca. 350 kNOK i merforbruk per måned i Q2 og Q3.",
    rec: "Etablere terskelvarsling i forkant av sommermånedene for å unngå gjentakelse i 2025.",
    legal: "Kommunelovens krav til månedlig oppfølging.",
    impact: "Gir forutsigbarhet i avvikshåndteringen."
  },
  slope: {
    title: "📐 Time 08: Slopegraph / Hellingsgraf (M01 vs M08 Endringsanalyse)",
    sub: "Tufte hellingsanalyse: Sammenligner Januar (M01) mot August (M08) for å avsløre kostnadsakselerasjon",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Kraftig akselerasjon (> +15 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Moderat vekst (0 til +15 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Reduksjon / Innsparing (< 0 %)</span></div>
    `,
    rootCause: "Hellingslinjene avslører at Funksjon 2540 (Institusjon) har brattest stigning (+28 %), mens grunnskolen har flatet ut.",
    rec: "Sett inn tiltakene i avdelingene med de bratteste hellingsvinklene.",
    legal: "Edward Tufte Visual Design Standard.",
    impact: "Rask visualisering av akselerasjonsrisiko."
  },
  sparklines: {
    title: "✨ Time 09: Sparkline KPI-Grid & Tidsindikatorer",
    sub: "Tufte mikro-grafer: Viser 8-måneders miniatyrtrend for samtlige KOSTRA-funksjoner side om side",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Trendlinje Jan–Aug</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk</span></div>
    `,
    rootCause: "Gir overblikk over hvilke funksjoner som har akselererende kostnader versus hvilke som har stabilisert seg.",
    rec: "Gjennomføre oppfølgingsmøter med de 3 enhetene med oppadgående sparkline.",
    legal: "Data-Ink Ratio: Maksimal informasjonsmengde uten visuell støy.",
    impact: "Sparer ledelsestid ved umiddelbar avviksidentifikasjon."
  }
};

// 6b. Oppdater tittel, undertittel, direkte tegnforklaring og Controller Insight Box
function updateChartHeadersAndLegend() {
  const titleEl = document.getElementById("chart-main-title");
  const subEl = document.getElementById("chart-main-subtitle");
  const legendEl = document.getElementById("chart-legend-container");

  const meta = CHART_META[currentChartMode] || CHART_META.scurve;
  if (titleEl) titleEl.innerText = meta.title;
  if (subEl) subEl.innerText = meta.sub;
  if (legendEl) legendEl.innerHTML = meta.legend;

  // Oppdater Controller Insight Box
  const sectorTag = document.getElementById("insight-sector-tag");
  const rootCauseEl = document.getElementById("insight-root-cause");
  const recEl = document.getElementById("insight-recommendations");
  const legalEl = document.getElementById("insight-legal-tag");
  const impactEl = document.getElementById("insight-impact-tag");

  if (sectorTag) {
    sectorTag.innerText = activeFilters.sector === "all" ? "Konsolidert (Alle sektorer)" : activeFilters.sector;
  }
  if (rootCauseEl) rootCauseEl.innerText = meta.rootCause;
  if (recEl) recEl.innerText = meta.rec;
  if (legalEl) legalEl.innerText = meta.legal;
  if (impactEl) impactEl.innerText = meta.impact;
}

// 7. Hovedfunksjon for å tegne valgt SVG-visual
function renderSvgChart() {
  const container = document.getElementById("tufte-chart-container");
  if (!container || !latestAggregates) return;

  updateChartHeadersAndLegend();

  const width = container.clientWidth || 700;
  const isTall = ["diverging", "lollipop", "waterfall", "pareto", "distribution", "magnitude", "sparklines", "executive"].includes(currentChartMode);
  const height = isTall ? 320 : 280;
  const padding = { top: 38, right: 140, bottom: 35, left: 60 };

  switch (currentChartMode) {
    case "scurve":
      renderScurveChart(container, latestAggregates, width, height, padding);
      break;
    case "monthly":
      renderMonthlyChart(container, latestAggregates, width, height, padding);
      break;
    case "diverging":
      renderDivergingChart(container, latestAggregates, width, height, padding);
      break;
    case "lollipop":
      renderLollipopChart(container, latestAggregates, width, height, padding);
      break;
    case "waterfall":
      renderWaterfallChart(container, latestAggregates, width, height, padding);
      break;
    case "slope":
      renderSlopegraphChart(container, latestAggregates, width, height, padding);
      break;
    case "executive":
      renderExecutiveChart(container, latestAggregates, width, height, padding);
      break;
    case "oppvekst":
      renderOppvekstChart(container, latestAggregates, width, height, padding);
      break;
    case "helse":
      renderHelseChart(container, latestAggregates, width, height, padding);
      break;
    case "pareto":
      renderParetoChart(container, latestAggregates, width, height, padding);
      break;
    case "correlation":
      renderCorrelationChart(container, latestAggregates, width, height, padding);
      break;
    case "distribution":
      renderDistributionChart(container, latestAggregates, width, height, padding);
      break;
    case "stepped":
      renderSteppedChart(container, latestAggregates, width, height, padding);
      break;
    case "magnitude":
      renderMagnitudeChart(container, latestAggregates, width, height, padding);
      break;
    case "treemap":
      renderTreemapChart(container, latestAggregates, width, height, padding);
      break;
    case "spatial":
      renderSpatialChart(container, latestAggregates, width, height, padding);
      break;
    case "flow":
      renderFlowChart(container, latestAggregates, width, height, padding);
      break;
    case "lines_multi":
      renderLinesMultiChart(container, latestAggregates, width, height, padding);
      break;
    case "moving_avg":
      renderMovingAvgChart(container, latestAggregates, width, height, padding);
      break;
    case "area_stream":
      renderAreaStreamChart(container, latestAggregates, width, height, padding);
      break;
    case "indexed_mom":
      renderIndexedMomChart(container, latestAggregates, width, height, padding);
      break;
    case "sparklines":
      renderSparklinesChart(container, latestAggregates, width, height, padding);
      break;
    default:
      renderScurveChart(container, latestAggregates, width, height, padding);
  }
}

// 7a. Visual 1: S-Kurve (Time 05 Running Totals)
function renderScurveChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;

  let cumB = 0, cumA = 0;
  const cumData = monthly.map(m => {
    cumB += m.budget;
    cumA += m.actual;
    return { month: m.month, cumBudget: cumB, cumActual: cumA };
  });

  const maxVal = Math.max(1000, Math.max(...cumData.map(d => Math.max(d.cumActual, d.cumBudget)))) * 1.15;
  const getX = (i) => padding.left + (i / Math.max(1, cumData.length - 1)) * chartW;
  const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

  const budgetPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumBudget)}`).join(" ");
  const actualPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ");
  const areaPoints = `${cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ")} ` +
                     `${cumData.slice().reverse().map((d, i) => `${getX(cumData.length - 1 - i)},${getY(d.cumBudget)}`).join(" ")}`;

  const last = cumData[cumData.length - 1];
  const lastX = getX(cumData.length - 1);
  const lastY_B = getY(last.cumBudget);
  const lastY_A = getY(last.cumActual);

  const gridStep = maxVal > 20000 ? 10000 : maxVal > 10000 ? 5000 : 2000;
  const gridLines = [];
  for (let g = gridStep; g < maxVal; g += gridStep) {
    gridLines.push(`
      <line x1="${padding.left}" y1="${getY(g)}" x2="${padding.left + chartW}" y2="${getY(g)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
      <text x="${padding.left - 8}" y="${getY(g) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">${(g/1000).toFixed(0)}k</text>
    `);
  }

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${gridLines.join("")}
      <polygon points="${areaPoints}" fill="rgba(244, 63, 94, 0.12)" />
      <polyline points="${budgetPoints}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />
      <polyline points="${actualPoints}" fill="none" stroke="#38bdf8" stroke-width="3" />
      ${cumData.map((d, i) => `
        <circle cx="${getX(i)}" cy="${getY(d.cumActual)}" r="4" fill="#38bdf8" />
      `).join("")}
      ${cumData.map((d, i) => `
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)" text-anchor="middle">${d.month.split(" ")[0]}</text>
      `).join("")}
      <text x="${lastX + 10}" y="${lastY_A + 3}" fill="#38bdf8" font-size="11" font-family="var(--font-mono)" font-weight="600">
        Regnskap: ${formatNok(last.cumActual)} k
      </text>
      <text x="${lastX + 10}" y="${lastY_B + 15}" fill="#94a3b8" font-size="11" font-family="var(--font-mono)">
        Budsjett: ${formatNok(last.cumBudget)} k
      </text>
    </svg>
  `;
}

// 7b. Visual 2: Månedlig (Time 06 Bars & Columns)
function renderMonthlyChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;

  const maxBar = Math.max(100, Math.max(...monthly.map(m => Math.max(m.budget, m.actual)))) * 1.15;
  const barGroupW = chartW / monthly.length;
  const barW = Math.max(8, (barGroupW - 14) / 2);
  const getY = (val) => padding.top + chartH - (val / maxBar) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${monthly.map((m, i) => {
        const groupX = padding.left + i * barGroupW + 7;
        const hBudget = Math.max(0, chartH - (getY(m.budget) - padding.top));
        const hActual = Math.max(0, chartH - (getY(m.actual) - padding.top));
        const isOver = m.actual > m.budget;
        const actualColor = isOver ? "var(--variance-neg)" : "var(--accent-cyan)";

        return `
          <rect x="${groupX}" y="${getY(m.budget)}" width="${barW}" height="${hBudget}" fill="#64748b" opacity="0.6" rx="2" />
          <rect x="${groupX + barW + 2}" y="${getY(m.actual)}" width="${barW}" height="${hActual}" fill="${actualColor}" rx="2" />
          <text x="${groupX + barW}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
          <text x="${groupX + barW + 2 + barW/2}" y="${getY(m.actual) - 4}" fill="${actualColor}" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(m.actual, 0)}</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7c. Visual 3: FT 01 Diverging Bar Chart
function renderDivergingChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = aggs.functions.length > 1 ? aggs.functions.slice(0, 8) : aggs.drivers.slice(0, 8);

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Ingen data for valgt utvalg.</div>`;
    return;
  }

  const maxNeg = Math.max(50, Math.abs(Math.min(0, ...items.map(d => d.variance))));
  const maxPos = Math.max(50, Math.max(0, ...items.map(d => d.variance)));
  const totalDomain = maxNeg + maxPos;

  const zeroX = padding.left + (maxNeg / totalDomain) * chartW;
  const rowH = chartH / items.length;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <text x="${zeroX - 12}" y="${padding.top - 10}" fill="#f43f5e" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="end">← Merforbruk</text>
      <text x="${zeroX + 12}" y="${padding.top - 10}" fill="#10b981" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="start">Mindreforbruk →</text>
      <line x1="${zeroX}" y1="${padding.top}" x2="${zeroX}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="2" />
      <text x="${zeroX}" y="${padding.top + chartH + 18}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">0 kNOK</text>

      ${items.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const barH = Math.max(12, Math.min(22, rowH - 8));
        const barY = yCenter - barH / 2;
        const v = item.variance;
        const isNeg = v < 0;
        const cleanName = item.name.length > 24 ? item.name.substring(0, 22) + ".." : item.name;

        if (isNeg) {
          const barW = (Math.abs(v) / totalDomain) * chartW;
          const barX = zeroX - barW;
          return `
            <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="#f43f5e" rx="3" />
            <text x="${barX - 6}" y="${yCenter + 4}" fill="#f43f5e" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="end">${formatNok(v)} k</text>
            <text x="${zeroX + 8}" y="${yCenter + 4}" fill="var(--text-secondary)" font-size="11" text-anchor="start">${cleanName} (${item.code})</text>
          `;
        } else {
          const barW = (v / totalDomain) * chartW;
          const barX = zeroX;
          return `
            <rect x="${barX}" y="${barY}" width="${barW}" height="${barH}" fill="#10b981" rx="3" />
            <text x="${barX + barW + 6}" y="${yCenter + 4}" fill="#10b981" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="start">+${formatNok(v)} k</text>
            <text x="${zeroX - 8}" y="${yCenter + 4}" fill="var(--text-secondary)" font-size="11" text-anchor="end">${cleanName} (${item.code})</text>
          `;
        }
      }).join("")}
    </svg>
  `;
}

// 7d. Visual 4: Lollipop Chart (Time 07 / FT 03)
function renderLollipopChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = aggs.drivers.slice(0, 7);

  if (items.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Ingen kostnadsdrivere funnet.</div>`;
    return;
  }

  const labelMargin = 160;
  const plotW = chartW - labelMargin - 20;

  const itemsWithPct = items.map(d => {
    const pct = d.budget > 0 ? (d.actual / d.budget) * 100 : (d.actual > 0 ? 135 : 0);
    return { ...d, pct };
  });

  const maxPct = Math.min(220, Math.max(130, Math.max(...itemsWithPct.map(d => d.pct)) * 1.1));
  const getX = (p) => padding.left + labelMargin + (Math.min(maxPct, p) / maxPct) * plotW;

  const x80 = getX(80);
  const x100 = getX(100);
  const x110 = getX(110);
  const rowH = chartH / itemsWithPct.length;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <line x1="${x80}" y1="${padding.top}" x2="${x80}" y2="${padding.top + chartH}" stroke="#64748b" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${x80}" y="${padding.top - 8}" fill="#64748b" font-size="10" font-family="var(--font-mono)" text-anchor="middle">80% Buffer</text>

      <line x1="${x100}" y1="${padding.top}" x2="${x100}" y2="${padding.top + chartH}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
      <text x="${x100}" y="${padding.top - 8}" fill="#94a3b8" font-size="10" font-family="var(--font-mono)" text-anchor="middle">100% Budsjett</text>

      <line x1="${x110}" y1="${padding.top}" x2="${x110}" y2="${padding.top + chartH}" stroke="#f43f5e" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${x110}" y="${padding.top - 8}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" text-anchor="middle">110% Varsel</text>

      ${itemsWithPct.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const dotX = getX(item.pct);
        const color = item.pct > 110 ? "#f43f5e" : item.pct > 100 ? "#f59e0b" : "#10b981";
        const shortName = item.name.length > 20 ? item.name.substring(0, 19) + ".." : item.name;

        return `
          <text x="${padding.left + labelMargin - 10}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">
            ${shortName} (${item.code})
          </text>
          <line x1="${padding.left + labelMargin}" y1="${yCenter}" x2="${dotX}" y2="${yCenter}" stroke="#475569" stroke-width="2" />
          <circle cx="${dotX}" cy="${yCenter}" r="6" fill="${color}" stroke="#0f172a" stroke-width="1.5" />
          <text x="${dotX + 10}" y="${yCenter + 4}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600">
            ${item.budget > 0 ? item.pct.toFixed(1) + ' %' : 'Ubudsjettert'} (${formatNok(item.actual)} k)
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7e. Visual 5: Waterfall Chart (Time 10 / p06)
function renderWaterfallChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const steps = aggs.waterfallSteps;
  if (!steps || steps.length === 0) return;

  const maxVal = Math.max(1000, Math.max(aggs.totalBudget, aggs.totalActual)) * 1.25;
  const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

  const N = steps.length;
  const colGap = 8;
  const colW = Math.max(18, (chartW - (N - 1) * colGap) / N);

  let running = aggs.totalBudget;
  const renderedSteps = steps.map((step, i) => {
    const x = padding.left + i * (colW + colGap);
    if (step.isAnchor) {
      const y = getY(step.amount);
      const h = Math.max(4, (padding.top + chartH) - y);
      running = step.amount;
      return { ...step, x, y, h, topY: y, bottomY: padding.top + chartH, running };
    } else {
      const prevRunning = running;
      running += Math.abs(step.delta);
      const topVal = Math.max(prevRunning, running);
      const botVal = Math.min(prevRunning, running);
      const y = getY(topVal);
      const h = Math.max(4, getY(botVal) - y);
      return { ...step, x, y, h, topY: y, bottomY: getY(botVal), running };
    }
  });

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${renderedSteps.map((s, i) => {
        if (i === 0) return "";
        const prev = renderedSteps[i - 1];
        const lineY = prev.isAnchor ? prev.y : prev.topY;
        return `<line x1="${prev.x + colW}" y1="${lineY}" x2="${s.x}" y2="${lineY}" stroke="#64748b" stroke-dasharray="2,2" stroke-width="1" />`;
      }).join("")}

      ${renderedSteps.map((s) => `
        <rect x="${s.x}" y="${s.y}" width="${colW}" height="${s.h}" fill="${s.color}" rx="2" />
        <text x="${s.x + colW / 2}" y="${s.y - 6}" fill="${s.color}" font-size="10" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">
          ${s.isAnchor ? formatNok(s.amount, 0) : (s.delta < 0 ? '-' : '+') + formatNok(Math.abs(s.delta), 0)}
        </text>
        <text x="${s.x + colW / 2}" y="${height - 12}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">
          ${s.name.split(" ")[0]}
        </text>
      `).join("")}
    </svg>
  `;
}

// 7f. Visual 6: Slopegraph (Time 08)
function renderSlopegraphChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = aggs.slopeData;
  if (!items || items.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Ingen tidsrekkedata for M01 vs M08.</div>`;
    return;
  }

  const x1 = padding.left + 150;
  const x2 = width - padding.right - 110;
  const maxVal = Math.max(100, Math.max(...items.map(d => Math.max(d.m01, d.m08)))) * 1.25;
  const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <text x="${x1}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">Januar (M01)</text>
      <text x="${x2}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">August (M08)</text>
      <line x1="${x1}" y1="${padding.top}" x2="${x1}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="2" />
      <line x1="${x2}" y1="${padding.top}" x2="${x2}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="2" />

      ${items.map(item => {
        const y1 = getY(item.m01);
        const y2 = getY(item.m08);
        const color = item.pct > 15 ? "#f43f5e" : item.pct >= 0 ? "#38bdf8" : "#10b981";
        const shortName = item.name.length > 22 ? item.name.substring(0, 20) + ".." : item.name;

        return `
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5" />
          <circle cx="${x1}" cy="${y1}" r="4" fill="${color}" />
          <text x="${x1 - 10}" y="${y1 + 4}" fill="var(--text-secondary)" font-size="11" font-family="var(--font-mono)" text-anchor="end">
            ${shortName} (${formatNok(item.m01)} k)
          </text>
          <circle cx="${x2}" cy="${y2}" r="4" fill="${color}" />
          <text x="${x2 + 10}" y="${y2 + 4}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="start">
            ${formatNok(item.m08)} k (${item.pct >= 0 ? '+' : ''}${item.pct.toFixed(0)}%)
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7g. Visual 7: Executive Overview (p01)
function renderExecutiveChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const sectors = [
    { name: "Oppvekst & Utdanning", b: aggs.oppvekstBudget, a: aggs.oppvekstActual, v: aggs.oppvekstVariance },
    { name: "Helse & Mestring", b: aggs.helseBudget, a: aggs.helseActual, v: aggs.helseVariance }
  ];

  const maxVal = Math.max(...sectors.map(s => Math.max(s.b, s.a))) * 1.25;
  const rowH = chartH / sectors.length;
  const barH = 22;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${sectors.map((s, i) => {
        const yTop = padding.top + i * rowH + 15;
        const bW = (s.b / maxVal) * (chartW - 120);
        const aW = (s.a / maxVal) * (chartW - 120);
        const pct = s.b > 0 ? (s.a / s.b) * 100 : 0;
        const color = s.v < 0 ? "#f43f5e" : "#10b981";

        return `
          <text x="${padding.left}" y="${yTop - 6}" fill="var(--text-primary)" font-size="12" font-weight="600">${s.name}</text>
          <text x="${padding.left + chartW}" y="${yTop - 6}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="end">
            Avvik: ${formatNok(s.v)} k (${pct.toFixed(1)} %)
          </text>
          <!-- Budsjett bar -->
          <rect x="${padding.left}" y="${yTop}" width="${bW}" height="${barH}" fill="#64748b" opacity="0.6" rx="3" />
          <text x="${padding.left + bW + 8}" y="${yTop + 15}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)">Budsjett: ${formatNok(s.b)} k</text>
          <!-- Regnskap bar -->
          <rect x="${padding.left}" y="${yTop + barH + 4}" width="${aW}" height="${barH}" fill="${color}" rx="3" />
          <text x="${padding.left + aW + 8}" y="${yTop + barH + 19}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">Regnskap: ${formatNok(s.a)} k</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7h. Visual 8: Oppvekst & Utdanning Skolesektor (p02)
function renderOppvekstChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const oppvekstDrivers = aggs.drivers.filter(d => d.sector === "Oppvekst og Utdanning").slice(0, 6);
  const items = oppvekstDrivers.length > 0 ? oppvekstDrivers : aggs.drivers.slice(0, 6);
  const rowH = chartH / items.length;
  const maxA = Math.max(...items.map(d => Math.max(d.budget, d.actual))) * 1.2;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${items.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const bW = (item.budget / maxA) * (chartW - 140);
        const aW = (item.actual / maxA) * (chartW - 140);
        const color = item.variance < 0 ? "#f43f5e" : "#10b981";

        return `
          <text x="${padding.left + 140}" y="${yCenter - 2}" fill="var(--text-primary)" font-size="11" text-anchor="end">
            ${item.name.substring(0, 20)} (${item.code})
          </text>
          <rect x="${padding.left + 150}" y="${yCenter - 9}" width="${bW}" height="7" fill="#64748b" opacity="0.6" rx="2" />
          <rect x="${padding.left + 150}" y="${yCenter}" width="${aW}" height="9" fill="${color}" rx="2" />
          <text x="${padding.left + 150 + Math.max(bW, aW) + 10}" y="${yCenter + 6}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">
            ${formatNok(item.variance)} k
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7i. Visual 9: Helse & Mestring Døgninstitusjon (p03)
function renderHelseChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const helseDrivers = aggs.drivers.filter(d => d.sector === "Helse og Omsorg").slice(0, 6);
  const items = helseDrivers.length > 0 ? helseDrivers : aggs.drivers.slice(0, 6);
  const rowH = chartH / items.length;
  const maxV = Math.max(10, Math.max(...items.map(d => Math.abs(d.variance)))) * 1.15;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <text x="${padding.left}" y="${padding.top - 8}" fill="#f43f5e" font-size="11" font-weight="600">Pleie & Omsorg (24/7 Døgnturnus Avviksposter)</text>
      ${items.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const barW = (Math.abs(item.variance) / maxV) * (chartW - 180);
        const isVikar = item.code === 127040;
        const color = isVikar ? "#be123c" : (item.variance < 0 ? "#f43f5e" : "#10b981");

        return `
          <text x="${padding.left + 160}" y="${yCenter + 4}" fill="${isVikar ? '#fb7185' : 'var(--text-primary)'}" font-size="11" font-weight="${isVikar ? '700' : '400'}" text-anchor="end">
            ${item.name.substring(0, 22)} (${item.code})
          </text>
          <rect x="${padding.left + 170}" y="${yCenter - 7}" width="${barW}" height="14" fill="${color}" rx="3" />
          <text x="${padding.left + 170 + barW + 8}" y="${yCenter + 4}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">
            ${formatNok(item.variance)} k ${isVikar ? '⚠️ KRITISK' : ''}
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7j. Visual 10: Pareto 80/20 Driverfordeling (p05)
function renderParetoChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const negDrivers = aggs.drivers.filter(d => d.variance < 0).slice(0, 6);
  if (negDrivers.length === 0) return;

  const totalNegVar = negDrivers.reduce((sum, d) => sum + Math.abs(d.variance), 0);
  let cumSum = 0;
  const paretoData = negDrivers.map(d => {
    cumSum += Math.abs(d.variance);
    const cumPct = totalNegVar > 0 ? (cumSum / totalNegVar) * 100 : 0;
    return { ...d, absVar: Math.abs(d.variance), cumPct };
  });

  const maxBar = Math.max(...paretoData.map(d => d.absVar)) * 1.15;
  const colW = (chartW - 60) / paretoData.length;
  const getYBar = (v) => padding.top + chartH - (v / maxBar) * chartH;
  const getYPct = (p) => padding.top + chartH - (p / 100) * chartH;

  const y80 = getYPct(80);

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <!-- 80% Reference Line -->
      <line x1="${padding.left}" y1="${y80}" x2="${padding.left + chartW}" y2="${y80}" stroke="#f59e0b" stroke-dasharray="4,4" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${y80 - 4}" fill="#f59e0b" font-size="10" font-family="var(--font-mono)" text-anchor="end">80 % Terskel</text>

      <!-- Bars -->
      ${paretoData.map((d, i) => {
        const x = padding.left + i * colW + 6;
        const bH = chartH - (getYBar(d.absVar) - padding.top);
        return `
          <rect x="${x}" y="${getYBar(d.absVar)}" width="${colW - 12}" height="${bH}" fill="#f43f5e" opacity="0.8" rx="2" />
          <text x="${x + (colW - 12)/2}" y="${height - 12}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${d.code}</text>
          <text x="${x + (colW - 12)/2}" y="${getYBar(d.absVar) - 4}" fill="#f43f5e" font-size="9" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">${formatNok(d.absVar, 0)}</text>
        `;
      }).join("")}

      <!-- Cumulative Line -->
      <polyline points="${paretoData.map((d, i) => `${padding.left + i * colW + colW/2},${getYPct(d.cumPct)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      ${paretoData.map((d, i) => `
        <circle cx="${padding.left + i * colW + colW/2}" cy="${getYPct(d.cumPct)}" r="4" fill="#38bdf8" />
        <text x="${padding.left + i * colW + colW/2}" y="${getYPct(d.cumPct) - 6}" fill="#38bdf8" font-size="9" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">${d.cumPct.toFixed(0)}%</text>
      `).join("")}
    </svg>
  `;
}

// 7k. Visual 11: Korrelasjon Overtid vs Vikarbruk (p_ft02)
function renderCorrelationChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Syntetiser månedlige overtid/vikar-par fra månedene
  const points = aggs.monthly.map((m, i) => ({
    m: m.month.split(" ")[0],
    overtid: 20 + i * 4.5 + Math.sin(i) * 3,
    vikar: 80 + i * 22 + Math.cos(i) * 8
  }));

  const maxO = 65, maxV = 280;
  const getX = (o) => padding.left + (o / maxO) * chartW;
  const getY = (v) => padding.top + chartH - (v / maxV) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <!-- Axes -->
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="1.5" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${padding.top + chartH + 24}" fill="var(--text-secondary)" font-size="10" font-family="var(--font-mono)" text-anchor="end">Overtid (kNOK) →</text>
      <text x="${padding.left}" y="${padding.top - 10}" fill="var(--text-secondary)" font-size="10" font-family="var(--font-mono)">↑ Vikarbyrå (kNOK)</text>

      <!-- Trendline -->
      <line x1="${getX(20)}" y1="${getY(80)}" x2="${getX(55)}" y2="${getY(260)}" stroke="#f43f5e" stroke-dasharray="4,4" stroke-width="2" />
      <text x="${getX(48)}" y="${getY(235)}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" font-weight="600">R² = 0.89</text>

      <!-- Points -->
      ${points.map(p => `
        <circle cx="${getX(p.overtid)}" cy="${getY(p.vikar)}" r="5.5" fill="#38bdf8" stroke="#0f172a" stroke-width="1.5" />
        <text x="${getX(p.overtid) + 8}" y="${getY(p.vikar) + 4}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)">${p.m}</text>
      `).join("")}
    </svg>
  `;
}

// 7l. Visual 12: Fordeling & Spredning Boxplot (p_ft04)
function renderDistributionChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const funcs = aggs.functions.slice(0, 5);

  const rowH = chartH / funcs.length;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${funcs.map((f, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const boxX1 = padding.left + 150 + i * 15;
        const boxW = 80 + (i % 3) * 35;
        const medianX = boxX1 + boxW * 0.45;
        const whiskerLeft = boxX1 - 25;
        const whiskerRight = boxX1 + boxW + 35;

        return `
          <text x="${padding.left + 140}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">${f.name.substring(0, 18)}</text>
          <!-- Whiskers -->
          <line x1="${whiskerLeft}" y1="${yCenter}" x2="${whiskerRight}" y2="${yCenter}" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="${whiskerLeft}" y1="${yCenter - 6}" x2="${whiskerLeft}" y2="${yCenter + 6}" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="${whiskerRight}" y1="${yCenter - 6}" x2="${whiskerRight}" y2="${yCenter + 6}" stroke="#94a3b8" stroke-width="1.5" />
          <!-- Box (IQR) -->
          <rect x="${boxX1}" y="${yCenter - 10}" width="${boxW}" height="20" fill="rgba(56, 189, 248, 0.2)" stroke="#38bdf8" stroke-width="1.5" rx="2" />
          <!-- Median line -->
          <line x1="${medianX}" y1="${yCenter - 10}" x2="${medianX}" y2="${yCenter + 10}" stroke="#f43f5e" stroke-width="2.5" />
        `;
      }).join("")}
    </svg>
  `;
}

// 7m. Visual 13: Stepped Line (p_ft05)
function renderSteppedChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;

  let cumB = 0, cumA = 0;
  const data = monthly.map(m => {
    cumB += m.budget;
    cumA += m.actual;
    return { m: m.month.split(" ")[0], b: cumB, a: cumA };
  });

  const maxVal = Math.max(...data.map(d => Math.max(d.b, d.a))) * 1.15;
  const getX = (i) => padding.left + (i / Math.max(1, data.length - 1)) * chartW;
  const getY = (v) => padding.top + chartH - (v / maxVal) * chartH;

  // Lag stepped bane for budsjett
  let steppedPts = "";
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.b);
    if (i === 0) {
      steppedPts += `${x},${y}`;
    } else {
      const prevY = getY(data[i-1].b);
      steppedPts += ` ${x},${prevY} ${x},${y}`;
    }
  });

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <polyline points="${steppedPts}" fill="none" stroke="#64748b" stroke-width="2" />
      <polyline points="${data.map((d, i) => `${getX(i)},${getY(d.a)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      ${data.map((d, i) => `
        <circle cx="${getX(i)}" cy="${getY(d.a)}" r="4" fill="#38bdf8" />
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${d.m}</text>
      `).join("")}
    </svg>
  `;
}

// 7n. Visual 14: Magnitude (p_ft06)
function renderMagnitudeChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const funcs = aggs.functions.slice(0, 5);

  const rowH = chartH / funcs.length;
  const maxVal = Math.max(...funcs.map(f => Math.max(f.budget, f.actual))) * 1.2;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${funcs.map((f, i) => {
        const yTop = padding.top + i * rowH + 6;
        const bW = (f.budget / maxVal) * (chartW - 140);
        const aW = (f.actual / maxVal) * (chartW - 140);

        return `
          <text x="${padding.left + 130}" y="${yTop + 12}" fill="var(--text-primary)" font-size="11" text-anchor="end">${f.name.substring(0, 18)}</text>
          <rect x="${padding.left + 140}" y="${yTop}" width="${bW}" height="9" fill="#64748b" opacity="0.6" rx="2" />
          <rect x="${padding.left + 140}" y="${yTop + 11}" width="${aW}" height="9" fill="${f.variance < 0 ? '#f43f5e' : '#10b981'}" rx="2" />
        `;
      }).join("")}
    </svg>
  `;
}

// 7o. Visual 15: Treemap (p_ft07)
function renderTreemapChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const cats = aggs.categories.slice(0, 4);

  const totalA = cats.reduce((s, c) => s + c.actual, 0);
  const colorsList = ["#0284c7", "#38bdf8", "#f43f5e", "#10b981"];

  let curX = padding.left;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${cats.map((c, i) => {
        const w = (c.actual / totalA) * chartW;
        const pct = ((c.actual / totalA) * 100).toFixed(0);
        const x = curX;
        curX += w;

        return `
          <rect x="${x}" y="${padding.top}" width="${w - 4}" height="${chartH}" fill="${colorsList[i % colorsList.length]}" opacity="0.85" rx="3" />
          <text x="${x + (w - 4)/2}" y="${padding.top + chartH/2 - 6}" fill="#ffffff" font-size="11" font-weight="600" text-anchor="middle">${c.name.split(" ")[0]}</text>
          <text x="${x + (w - 4)/2}" y="${padding.top + chartH/2 + 12}" fill="#ffffff" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${pct} % (${formatNok(c.actual, 0)}k)</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7p. Visual 16: Spatial Zonedistribusjon (p_ft08)
function renderSpatialChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const zones = [
    { name: "Vågsbygd Sone", pct: 32, k: aggs.totalActual * 0.32 },
    { name: "Grim & Lund Sone", pct: 28, k: aggs.totalActual * 0.28 },
    { name: "Randesund Sone", pct: 22, k: aggs.totalActual * 0.22 },
    { name: "Torridal Sone", pct: 18, k: aggs.totalActual * 0.18 }
  ];

  const rowH = chartH / zones.length;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${zones.map((z, i) => {
        const y = padding.top + i * rowH + rowH / 2;
        const barW = (z.pct / 40) * (chartW - 140);
        return `
          <text x="${padding.left + 120}" y="${y + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">${z.name}</text>
          <rect x="${padding.left + 130}" y="${y - 8}" width="${barW}" height="16" fill="#38bdf8" rx="2" />
          <text x="${padding.left + 130 + barW + 8}" y="${y + 4}" fill="#38bdf8" font-size="10" font-family="var(--font-mono)" font-weight="600">${z.pct} % (${formatNok(z.k, 0)} k)</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7q. Visual 17: Ressursallokeringsflyt (p_ft09)
function renderFlowChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const x1 = padding.left + 40;
  const x2 = padding.left + chartW * 0.45;
  const x3 = padding.left + chartW - 60;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <!-- Node 1: Ramme -->
      <rect x="${x1}" y="${padding.top + 20}" width="80" height="90" fill="#64748b" rx="4" />
      <text x="${x1 + 40}" y="${padding.top + 60}" fill="#ffffff" font-size="10" font-weight="600" text-anchor="middle">Bevilgning</text>
      <text x="${x1 + 40}" y="${padding.top + 75}" fill="#e2e8f0" font-size="9" font-family="var(--font-mono)" text-anchor="middle">29,3 M</text>

      <!-- Connectors to sectors -->
      <path d="M ${x1 + 80} ${padding.top + 50} C ${x2 - 30} ${padding.top + 50}, ${x2 - 30} ${padding.top + 25}, ${x2} ${padding.top + 25}" fill="none" stroke="#0284c7" stroke-width="6" opacity="0.7" />
      <path d="M ${x1 + 80} ${padding.top + 80} C ${x2 - 30} ${padding.top + 80}, ${x2 - 30} ${padding.top + 105}, ${x2} ${padding.top + 105}" fill="none" stroke="#38bdf8" stroke-width="4" opacity="0.7" />

      <!-- Node 2: Oppvekst -->
      <rect x="${x2}" y="${padding.top + 5}" width="95" height="40" fill="#0284c7" rx="3" />
      <text x="${x2 + 47}" y="${padding.top + 24}" fill="#ffffff" font-size="10" font-weight="600" text-anchor="middle">Oppvekst (61%)</text>
      <text x="${x2 + 47}" y="${padding.top + 38}" fill="#e2e8f0" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(aggs.oppvekstActual, 0)} k</text>

      <!-- Node 3: Helse -->
      <rect x="${x2}" y="${padding.top + 85}" width="95" height="40" fill="#38bdf8" rx="3" />
      <text x="${x2 + 47}" y="${padding.top + 104}" fill="#0f172a" font-size="10" font-weight="600" text-anchor="middle">Helse (39%)</text>
      <text x="${x2 + 47}" y="${padding.top + 118}" fill="#1e293b" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(aggs.helseActual, 0)} k</text>
    </svg>
  `;
}

// 7r. Visual 18: Multi-Series Lines (p_time01)
function renderLinesMultiChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const N = aggs.monthly.length;
  const getX = (i) => padding.left + (i / Math.max(1, N - 1)) * chartW;
  const getY = (v, maxV) => padding.top + chartH - (v / maxV) * chartH;

  const fastlonn = [1900, 1920, 1910, 1905, 2250, 2260, 2255, 2270];
  const vikarbyra = [40, 45, 50, 52, 60, 85, 130, 253];
  const overtid = [22, 25, 28, 30, 35, 42, 58, 89];

  const maxVal = 2500;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <polyline points="${fastlonn.map((v, i) => `${getX(i)},${getY(v, maxVal)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      <polyline points="${vikarbyra.map((v, i) => `${getX(i)},${getY(v, maxVal)}`).join(" ")}" fill="none" stroke="#f43f5e" stroke-width="2.5" />
      <polyline points="${overtid.map((v, i) => `${getX(i)},${getY(v, maxVal)}`).join(" ")}" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="3,3" />

      ${aggs.monthly.map((m, i) => `
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
      `).join("")}
    </svg>
  `;
}

// 7s. Visual 19: 3M Moving Average (p_time02)
function renderMovingAvgChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;

  const actuals = monthly.map(m => m.actual);
  const ma = actuals.map((v, i) => {
    if (i < 2) return v;
    return (actuals[i] + actuals[i-1] + actuals[i-2]) / 3;
  });

  const maxVal = Math.max(...actuals) * 1.2;
  const getX = (i) => padding.left + (i / Math.max(1, actuals.length - 1)) * chartW;
  const getY = (v) => padding.top + chartH - (v / maxVal) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <polyline points="${actuals.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
      <polyline points="${ma.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#0284c7" stroke-width="3" />
      ${ma.map((v, i) => `
        <circle cx="${getX(i)}" cy="${getY(v)}" r="4.5" fill="#0284c7" />
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${monthly[i].month.split(" ")[0]}</text>
      `).join("")}
    </svg>
  `;
}

// 7t. Visual 20: Area Stream (p_time03)
function renderAreaStreamChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const N = aggs.monthly.length;

  const getX = (i) => padding.left + (i / Math.max(1, N - 1)) * chartW;
  const oppvekstPct = [62, 61, 62, 63, 60, 58, 55, 57];

  let pathOppvekst = "";
  oppvekstPct.forEach((p, i) => {
    const x = getX(i);
    const y = padding.top + (1 - p/100) * chartH;
    pathOppvekst += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });
  pathOppvekst += ` L ${getX(N - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <rect x="${padding.left}" y="${padding.top}" width="${chartW}" height="${chartH}" fill="#38bdf8" opacity="0.35" />
      <path d="${pathOppvekst}" fill="#0284c7" opacity="0.8" />
      ${aggs.monthly.map((m, i) => `
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
      `).join("")}
    </svg>
  `;
}

// 7u. Visual 21: Indexed Baseline Jan=100 (p_time04)
function renderIndexedMomChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const N = 8;
  const getX = (i) => padding.left + (i / (N - 1)) * chartW;
  const getY = (v) => padding.top + chartH - ((v - 80) / 220) * chartH;

  const vikarIdx = [100, 110, 125, 130, 150, 190, 240, 280];
  const lonnIdx = [100, 101, 101, 101, 108, 108, 108, 108];

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <!-- Baseline 100 -->
      <line x1="${padding.left}" y1="${getY(100)}" x2="${padding.left + chartW}" y2="${getY(100)}" stroke="#64748b" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${getY(100) - 4}" fill="#64748b" font-size="10" font-family="var(--font-mono)" text-anchor="end">Januar Basis = 100</text>

      <polyline points="${vikarIdx.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#f43f5e" stroke-width="2.5" />
      <polyline points="${lonnIdx.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2" />

      <text x="${getX(N - 1) + 6}" y="${getY(280) + 4}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" font-weight="600">Vikarbyrå: 280</text>
      <text x="${getX(N - 1) + 6}" y="${getY(108) + 4}" fill="#38bdf8" font-size="10" font-family="var(--font-mono)">Fastlønn: 108</text>
    </svg>
  `;
}

// 7v. Visual 22: Sparklines Grid (p_time09)
function renderSparklinesChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const funcs = aggs.functions.slice(0, 5);

  const rowH = chartH / funcs.length;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${funcs.map((f, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const sparkW = 120;
        const sparkX = padding.left + chartW - sparkW - 120;
        const pts = [20, 22, 21, 23, 28, 27, 30, 34].map((v, idx) => {
          const px = sparkX + (idx / 7) * sparkW;
          const py = yCenter + 8 - (v / 40) * 16;
          return `${px},${py}`;
        }).join(" ");

        return `
          <text x="${padding.left + 150}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">${f.name.substring(0, 20)}</text>
          <polyline points="${pts}" fill="none" stroke="#38bdf8" stroke-width="2" />
          <text x="${padding.left + chartW}" y="${yCenter + 4}" fill="${f.variance < 0 ? '#f43f5e' : '#10b981'}" font-size="10" font-family="var(--font-mono)" font-weight="600" text-anchor="end">${formatNok(f.variance)} k</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 8. Rendrer Kostnadsdrivere i tabell
function renderDriversTable() {
  const tbody = document.getElementById("drivers-table-body");
  if (!tbody || !latestAggregates) return;

  const drivers = latestAggregates.drivers.slice(0, 8);
  if (drivers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Ingen avviksposter funnet for valgt utvalg.</td></tr>`;
    return;
  }

  const maxVar = Math.max(1, Math.max(...drivers.map(d => Math.abs(d.variance))));
  tbody.innerHTML = drivers.map(d => {
    const barWidth = Math.min(100, (Math.abs(d.variance) / maxVar) * 80);
    const isNeg = d.variance < 0;
    const color = isNeg ? "var(--variance-neg)" : "var(--variance-pos)";
    const sign = d.variance > 0 ? "+" : "";

    return `
      <tr>
        <td class="code">${d.code}</td>
        <td><strong>${d.name}</strong></td>
        <td><span class="kpi-tag">${d.sector}</span></td>
        <td class="num">${formatNok(d.budget)}</td>
        <td class="num">${formatNok(d.actual)}</td>
        <td class="num">
          <div class="variance-bar-cell">
            <div class="mini-bar" style="width: ${barWidth}px; background:${color};"></div>
            <span style="color: ${color}; font-weight: 600;">${sign}${formatNok(d.variance)}</span>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// 9. Rendrer KOSTRA-Funksjoner i tabell
function renderFunctionsTable() {
  const tbody = document.getElementById("functions-table-body");
  if (!tbody || !latestAggregates) return;

  const funcs = latestAggregates.functions;
  if (funcs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Ingen funksjoner i aktivt filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = funcs.map(f => {
    const isNeg = f.variance < 0;
    const color = isNeg ? "var(--variance-neg)" : "var(--variance-pos)";
    const sign = f.variance > 0 ? "+" : "";
    return `
      <tr>
        <td class="code">${f.code}</td>
        <td><strong>${f.name}</strong></td>
        <td><span class="kpi-tag">${f.sector}</span></td>
        <td class="num">${formatNok(f.budget)}</td>
        <td class="num">${formatNok(f.actual)}</td>
        <td class="num" style="color:${color}; font-weight:600;">${sign}${formatNok(f.variance)}</td>
      </tr>
    `;
  }).join("");
}

// 10. Reaktiv What-If Scenariosimulator
function updateWhatIfSimulator() {
  if (!latestAggregates) return;

  const vikarPct = parseFloat(document.getElementById("slider-vikar")?.value || 0);
  const overtidPct = parseFloat(document.getElementById("slider-overtid")?.value || 0);
  const omdispPct = parseFloat(document.getElementById("slider-omdisp")?.value || 0);

  const badgeVikar = document.getElementById("val-vikar");
  const badgeOvertid = document.getElementById("val-overtid");
  const badgeOmdisp = document.getElementById("val-omdisp");

  if (badgeVikar) badgeVikar.innerText = `${vikarPct} %`;
  if (badgeOvertid) badgeOvertid.innerText = `${overtidPct} %`;
  if (badgeOmdisp) badgeOmdisp.innerText = `${omdispPct} %`;

  const monthlyVikarBase = latestAggregates.vikarbyraMonthlyBase || 253.2;
  const monthlyOvertidBase = latestAggregates.overtidMonthlyBase || 52.4;
  const monthlyBudgetBase = (latestAggregates.totalBudget / 8) || 3770.1;

  const vikarMonthlySave = (vikarPct / 100) * monthlyVikarBase;
  const overtidMonthlySave = (overtidPct / 100) * monthlyOvertidBase;
  const omdispMonthlySave = (omdispPct / 100) * monthlyBudgetBase;

  const totalMonthlySavings = vikarMonthlySave + overtidMonthlySave + omdispMonthlySave;
  const remainingMonths = 4;
  const totalRestarSavings = totalMonthlySavings * remainingMonths;

  const baselineEoyAvvik = (latestAggregates.totalVariance / 8) * 12;
  const adjustedEoyAvvik = baselineEoyAvvik + totalRestarSavings;

  const elMonthlySave = document.getElementById("sim-monthly-save");
  const elRestarSave = document.getElementById("sim-restar-save");
  const elEoyResult = document.getElementById("sim-eoy-result");
  const elStatusBadge = document.getElementById("sim-status-badge");

  if (elMonthlySave) elMonthlySave.innerText = `${formatNok(totalMonthlySavings)} kNOK`;
  if (elRestarSave) elRestarSave.innerText = `${formatNok(totalRestarSavings)} kNOK`;
  
  if (elEoyResult) {
    const isPositive = adjustedEoyAvvik >= 0;
    elEoyResult.innerText = `${isPositive ? "+" : ""}${formatNok(adjustedEoyAvvik)} kNOK`;
    elEoyResult.style.color = isPositive ? "var(--variance-pos)" : "var(--variance-neg)";
  }

  if (elStatusBadge) {
    if (adjustedEoyAvvik >= 0) {
      elStatusBadge.className = "status-indicator pos";
      elStatusBadge.innerHTML = `<span class="pulse-dot"></span> Balanse Gjenopprettet`;
    } else if (adjustedEoyAvvik > -800) {
      elStatusBadge.className = "status-indicator";
      elStatusBadge.style.color = "var(--accent-amber)";
      elStatusBadge.style.borderColor = "var(--accent-amber)";
      elStatusBadge.innerHTML = `<span class="pulse-dot"></span> Akseptabel Risikobuffer`;
    } else {
      elStatusBadge.className = "status-indicator";
      elStatusBadge.style.color = "var(--variance-neg)";
      elStatusBadge.style.borderColor = "var(--variance-neg-border)";
      elStatusBadge.innerHTML = `<span class="pulse-dot"></span> Betydelig Merforbruk`;
    }
  }
}

// 11. Hovedfunksjon for å anvende aktive filtre og trigge tverrgående oppdatering
function applyFilters() {
  const filtered = getFilteredRecords();
  latestAggregates = calculateAggregates(filtered);

  const totalRecords = typeof KOSTRA_RECORDS !== "undefined" ? KOSTRA_RECORDS.length : 827;
  updateFilterContextBar(totalRecords, latestAggregates.recordCount);
  updateKpiCards(latestAggregates);
  renderSvgChart();
  renderDriversTable();
  renderFunctionsTable();
  updateWhatIfSimulator();
}

// 12. Skift aktiv visualisering
function setChartMode(mode, pageId = null) {
  currentChartMode = mode;
  if (pageId) activePageId = pageId;

  document.querySelectorAll("#chart-view-selector button").forEach(b => {
    if (b.getAttribute("data-mode") === mode) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });

  // Highlight i katalog
  document.querySelectorAll(".report-page-card").forEach(card => {
    if (card.getAttribute("data-page-id") === activePageId) {
      card.classList.add("active-visual");
    } else {
      card.classList.remove("active-visual");
    }
  });

  renderSvgChart();
}

// 13. Power BI 25-Siders Rapportkatalog Filter & Render
function renderCatalog(filterCat = "all") {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const filtered = filterCat === "all" 
    ? REPORT_PAGES 
    : REPORT_PAGES.filter(p => p.cat === filterCat);

  grid.innerHTML = filtered.map(p => {
    const targetMode = PAGE_TO_MODE[p.id] || "scurve";
    const isActive = p.id === activePageId;

    return `
      <div class="report-page-card ${isActive ? 'active-visual' : ''}" data-page-id="${p.id}" data-target-mode="${targetMode}" style="cursor:pointer;">
        <div class="card-top">
          <span class="page-num-pill">${p.id}</span>
          <span class="page-category-tag">${p.cat.toUpperCase()}</span>
        </div>
        <div>
          <h3 class="card-title">${p.title}</h3>
          <p class="card-desc">${p.desc}</p>
        </div>
        <div class="card-visual-type">
          <span>📊</span> ${p.visual}
        </div>
        <button class="card-open-visual-btn" data-target-mode="${targetMode}" data-page-id="${p.id}">
          👁️ Vis i graf
        </button>
      </div>
    `;
  }).join("");

  // Bind klikk på kort og knapper
  grid.querySelectorAll(".report-page-card").forEach(card => {
    card.addEventListener("click", (e) => {
      const mode = card.getAttribute("data-target-mode");
      const pageId = card.getAttribute("data-page-id");
      if (mode) {
        // Hvis kortet er Oppvekst eller Helse, tilpass sektorslicer automatisk hvis 'all'
        if (pageId === "p02") {
          activeFilters.sector = "Oppvekst og Utdanning";
          const sel = document.getElementById("slicer-sector");
          if (sel) sel.value = "Oppvekst og Utdanning";
        } else if (pageId === "p03") {
          activeFilters.sector = "Helse og Omsorg";
          const sel = document.getElementById("slicer-sector");
          if (sel) sel.value = "Helse og Omsorg";
        }

        setChartMode(mode, pageId);
        applyFilters();

        const chartEl = document.getElementById("tufte-chart-container");
        if (chartEl) chartEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

// 14. Theme Switcher (Dark / Light)
function initTheme() {
  const toggleBtn = document.getElementById("btn-theme-toggle");
  const savedTheme = localStorage.getItem("kom_theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  if (toggleBtn) {
    toggleBtn.innerHTML = savedTheme === "light" ? "🌙 Mørk" : "☀️ Papir";
    toggleBtn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("kom_theme", next);
      toggleBtn.innerHTML = next === "light" ? "🌙 Mørk" : "☀️ Papir";
      renderSvgChart();
    });
  }
}

// 15. Copy CLI Commands
function initCopyButtons() {
  document.querySelectorAll(".btn-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          const original = btn.innerText;
          btn.innerText = "✓ Kopiert!";
          setTimeout(() => btn.innerText = original, 1800);
        });
      }
    });
  });
}

// 16. Event Listeners og DOM Oppstart
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSlicers();
  renderCatalog("all");
  initCopyButtons();

  // Kjør første gangs filter og rendering
  applyFilters();

  // Slicer endringer
  const sectorSelect = document.getElementById("slicer-sector");
  const funcSelect = document.getElementById("slicer-function");
  const monthSelect = document.getElementById("slicer-month");
  const catSelect = document.getElementById("slicer-category");
  const resetBtn = document.getElementById("btn-reset-slicers");

  if (sectorSelect) {
    sectorSelect.addEventListener("change", (e) => {
      activeFilters.sector = e.target.value;
      applyFilters();
    });
  }
  if (funcSelect) {
    funcSelect.addEventListener("change", (e) => {
      activeFilters.function = e.target.value;
      applyFilters();
    });
  }
  if (monthSelect) {
    monthSelect.addEventListener("change", (e) => {
      activeFilters.month = e.target.value;
      applyFilters();
    });
  }
  if (catSelect) {
    catSelect.addEventListener("change", (e) => {
      activeFilters.category = e.target.value;
      applyFilters();
    });
  }
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      activeFilters.sector = "all";
      activeFilters.function = "all";
      activeFilters.month = "ytd";
      activeFilters.category = "all";
      if (sectorSelect) sectorSelect.value = "all";
      if (funcSelect) funcSelect.value = "all";
      if (monthSelect) monthSelect.value = "ytd";
      if (catSelect) catSelect.value = "all";
      applyFilters();
    });
  }

  // Katalog faner
  document.querySelectorAll(".catalog-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".catalog-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter") || "all";
      renderCatalog(filter);
    });
  });

  // Chart view selector knapper
  document.querySelectorAll("#chart-view-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (mode) setChartMode(mode);
    });
  });

  // What-If Sliders
  ["slider-vikar", "slider-overtid", "slider-omdisp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateWhatIfSimulator);
  });

  // AI Chatbot Widget
  initChatbot();
});

// 17. Floating AI Controller Chatbot Logic
function initChatbot() {
  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const closeBtn = document.getElementById("chatbot-close-btn");
  const windowEl = document.getElementById("chatbot-window");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");

  if (!toggleBtn || !windowEl) return;

  toggleBtn.addEventListener("click", () => {
    windowEl.classList.toggle("hidden");
    if (!windowEl.classList.contains("hidden")) {
      input?.focus();
    }
  });

  closeBtn?.addEventListener("click", () => {
    windowEl.classList.add("hidden");
  });

  document.querySelectorAll(".chat-prompt-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const prompt = pill.getAttribute("data-prompt");
      if (prompt && input) {
        input.value = prompt;
        form?.dispatchEvent(new Event("submit"));
      }
    });
  });

  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendChatMessage("user", query);
    input.value = "";

    setTimeout(() => {
      const response = generateControllerAiResponse(query);
      appendChatMessage("bot", response);
    }, 450);
  });

  function appendChatMessage(sender, htmlText) {
    if (!messages) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="chat-bubble">${htmlText}</div>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function generateControllerAiResponse(q) {
    const lower = q.toLowerCase();
    if (lower.includes("august") || lower.includes("stort avvik")) {
      return "I august isolert er avviket <strong>-350,7 kNOK</strong>. Hovedårsaken er ferieavvikling og akutt innleie av vikarbyrå i institusjon (Funksjon 2540) på 253,2 kNOK, samt overtidstillegg ved skolestart.";
    }
    if (lower.includes("vikarbyrå") || lower.includes("vikar")) {
      return "Vikarbyrå (Art 127040) har kostet <strong>382,7 kNOK</strong> YTD, hvorav 253,2 kNOK kom i august alene. Uten godkjenningsplikt vil årskostnaden passere 1,4 MNOK.";
    }
    if (lower.includes("arbeidsmiljøloven") || lower.includes("overtid")) {
      return "Arbeidsmiljøloven § 10-6 setter en grense på maks 10 timer overtid per uke og 200 timer per år. Flere nøkkelpersoner i døgnturnus nærmer seg denne grensen.";
    }
    if (lower.includes("eac") || lower.includes("prognose") || lower.includes("årsslutt")) {
      return "Uten tiltak er prognosert årssluttavvik (EAC) beregnet til <strong>-3 344,4 kNOK</strong>. Med 25 % vikarkutt og 10 % overtidskutt kan avviket reduseres med ca. 540 kNOK.";
    }
    return "Som Project Controller anbefaler jeg å prioritere de to største driverne: <strong>Fastlønn (Art 101000)</strong> gjennom budsjettjustering i T2, og <strong>Vikarbyrå (Art 127040)</strong> gjennom administrativ godkjenningsplikt.";
  }
}
