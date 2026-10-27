/**
 * KOM-G: KomKostra Executive Cockpit & BI Portal
 * Dynamic Power BI Cross-Filtering Engine & Slicer Reactive Architecture
 */

// Global Filter State (Mirroring Power BI Slicer Context)
const activeFilters = {
  sector: "all",
  function: "all",
  month: "ytd",
  category: "all"
};

let currentChartMode = "scurve"; // "scurve" or "monthly"
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

// Helper: Formatter tall på norsk standard (f.eks. -2 229,6 kNOK)
function formatNok(val, decimals = 1) {
  if (val === undefined || val === null || isNaN(val)) return "0,0";
  const parts = Math.abs(val).toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const formatted = parts.join(",");
  return val < 0 ? `-${formatted}` : formatted;
}

// 1. Initialiser Slicer-valg fra dimensjoner
function initSlicers() {
  if (typeof KOSTRA_DIMENSIONS === "undefined") return;

  // Funksjoner
  const funcSelect = document.getElementById("slicer-function");
  if (funcSelect) {
    funcSelect.innerHTML = `<option value="all">Alle KOSTRA-Funksjoner</option>` + 
      KOSTRA_DIMENSIONS.functions.map(f => `<option value="${f.func_code}">${f.func_name}</option>`).join("");
  }

  // Kategorier
  const catSelect = document.getElementById("slicer-category");
  if (catSelect) {
    catSelect.innerHTML = `<option value="all">Alle Kontokategorier</option>` + 
      KOSTRA_DIMENSIONS.categories.map(c => `<option value="${c}">${c}</option>`).join("");
  }
}

// 2. Filtrer rådata basert på aktiv slicer-kontekst
// Rådata-format: [0:m, 1:sector, 2:func_code, 3:func_name, 4:account_code, 5:account_name, 6:cat_name, 7:b_knok, 8:a_knok]
function getFilteredRecords() {
  if (typeof KOSTRA_RECORDS === "undefined") return [];

  return KOSTRA_RECORDS.filter(r => {
    // Sektor
    if (activeFilters.sector !== "all" && r[1] !== activeFilters.sector) {
      return false;
    }
    // Funksjon
    if (activeFilters.function !== "all" && r[2] !== parseInt(activeFilters.function)) {
      return false;
    }
    // Kategori
    if (activeFilters.category !== "all" && r[6] !== activeFilters.category) {
      return false;
    }
    // Måned / Periode
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

  // Måneder 1..8
  const monthMap = {};
  for (let m = 1; m <= 8; m++) {
    monthMap[m] = { budget: 0, actual: 0 };
  }

  // Kontokoder (drivere)
  const accountMap = {};
  // KOSTRA-funksjoner
  const funcMap = {};

  let vikarbyraMonthlyBase = 0; // Art 127040
  let overtidMonthlyBase = 0;   // Art 104000

  records.forEach(r => {
    const m = r[0];
    const sector = r[1];
    const funcCode = r[2];
    const funcName = r[3];
    const accCode = r[4];
    const accName = r[5];
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
      accountMap[accCode] = { code: accCode, name: accName, sector: sector, budget: 0, actual: 0, m01: 0, m08: 0, cat: r[6] };
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

    // Simulator baser (siste måned m=8 eller gjennomsnitt)
    if (accCode === 127040 && (activeFilters.month === "ytd" ? m === 8 : true)) {
      vikarbyraMonthlyBase += a;
    }
    if (accCode === 104000 && (activeFilters.month === "ytd" ? m === 8 : true)) {
      overtidMonthlyBase += a;
    }
  });

  const totalVariance = totalBudget - totalActual;
  const totalSpendPct = totalBudget > 0 ? (totalActual / totalBudget) * 100 : 0;

  // Monthly array
  const monthNames = ["Jan (01)", "Feb (02)", "Mar (03)", "Apr (04)", "Mai (05)", "Jun (06)", "Jul (07)", "Aug (08)"];
  const monthly = Object.keys(monthMap).sort((a,b) => a-b).map(m => {
    const d = monthMap[m];
    return {
      month: monthNames[m - 1],
      budget: d.budget,
      actual: d.actual,
      variance: d.budget - d.actual
    };
  });

  // Top Drivers sorted by largest negative variance (merforbruk)
  const drivers = Object.values(accountMap).map(d => ({
    ...d,
    variance: d.budget - d.actual
  })).sort((a, b) => a.variance - b.variance).slice(0, 8);

  // Functions sorted by variance
  const functions = Object.values(funcMap).map(f => ({
    ...f,
    variance: f.budget - f.actual
  })).sort((a, b) => a.variance - b.variance);

  // Time 08: Slope Data (Januar M01 vs August M08)
  const slopeData = Object.values(funcMap)
    .filter(f => (f.m01 > 0 || f.m08 > 0))
    .map(f => {
      const diff = f.m08 - f.m01;
      const pct = f.m01 > 0 ? (diff / f.m01) * 100 : (f.m08 > 0 ? 100 : 0);
      return { ...f, diff, pct };
    })
    .sort((a, b) => b.m08 - a.m08)
    .slice(0, 6);

  // Time 10: Financial Waterfall Steps (Budget -> Variance Drivers -> Actual)
  const fastlonnVar = (accountMap[101000]?.budget || 0) - (accountMap[101000]?.actual || 0);
  const vikarbyraVar = (accountMap[127040]?.budget || 0) - (accountMap[127040]?.actual || 0);
  const overtidVar = (accountMap[104000]?.budget || 0) - (accountMap[104000]?.actual || 0);
  const vikarKortVar = (accountMap[102013]?.budget || 0) - (accountMap[102013]?.actual || 0);
  
  let refVar = 0;
  records.forEach(r => {
    if (r[6] === "Refusjoner") refVar += (r[7] - r[8]);
  });

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

  // Bind clear chip events
  container.querySelectorAll(".filter-chip-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const toClear = btn.getAttribute("data-clear");
      if (toClear) {
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
      }
    });
  });
}

// 5. Oppdater KPI-Kortene dynamisk
function updateKpiCards(aggs) {
  // Top nav indicator
  const topIndicator = document.getElementById("top-status-indicator");
  if (topIndicator) {
    const isPos = aggs.totalVariance >= 0;
    topIndicator.className = isPos ? "status-indicator pos" : "status-indicator";
    topIndicator.innerHTML = `
      <span class="pulse-dot"></span>
      <span>${activeFilters.month === 'ytd' ? 'YTD' : 'M' + activeFilters.month} Avvik: ${formatNok(aggs.totalVariance)} kNOK (${aggs.totalSpendPct.toFixed(1)} %)</span>
    `;
  }

  // KPI 1: Aktivt Utvalg Total
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
    const isNeg = aggs.totalVariance < 0;
    kpi1Var.className = `variance-pill ${isNeg ? 'neg' : 'pos'}`;
    kpi1Var.innerText = `${formatNok(aggs.totalVariance)} k (${aggs.totalSpendPct.toFixed(1)} %)`;
  }

  // KPI 2: Oppvekst
  const kpi2Val = document.getElementById("kpi2-value");
  const kpi2Budget = document.getElementById("kpi2-budget");
  const kpi2Var = document.getElementById("kpi2-variance");
  if (kpi2Val) kpi2Val.innerText = formatNok(aggs.oppvekstActual);
  if (kpi2Budget) kpi2Budget.innerHTML = `Budsjett: <strong>${formatNok(aggs.oppvekstBudget)} k</strong>`;
  if (kpi2Var) {
    const pct = aggs.oppvekstBudget > 0 ? (aggs.oppvekstActual / aggs.oppvekstBudget * 100).toFixed(1) : 0;
    const isNeg = aggs.oppvekstVariance < 0;
    kpi2Var.className = `variance-pill ${isNeg ? 'neg' : 'pos'}`;
    kpi2Var.innerText = aggs.oppvekstActual > 0 ? `${formatNok(aggs.oppvekstVariance)} k (${pct} %)` : "Ikke i utvalg";
  }

  // KPI 3: Helse
  const kpi3Val = document.getElementById("kpi3-value");
  const kpi3Budget = document.getElementById("kpi3-budget");
  const kpi3Var = document.getElementById("kpi3-variance");
  if (kpi3Val) kpi3Val.innerText = formatNok(aggs.helseActual);
  if (kpi3Budget) kpi3Budget.innerHTML = `Budsjett: <strong>${formatNok(aggs.helseBudget)} k</strong>`;
  if (kpi3Var) {
    const pct = aggs.helseBudget > 0 ? (aggs.helseActual / aggs.helseBudget * 100).toFixed(1) : 0;
    const isNeg = aggs.helseVariance < 0;
    kpi3Var.className = `variance-pill ${isNeg ? 'neg' : 'pos'}`;
    kpi3Var.innerText = aggs.helseActual > 0 ? `${formatNok(aggs.helseVariance)} k (${pct} %)` : "Ikke i utvalg";
  }

  // KPI 4: Måned 08 eller valgt måned
  const kpi4Title = document.getElementById("kpi4-title");
  const kpi4Tag = document.getElementById("kpi4-tag");
  const kpi4Val = document.getElementById("kpi4-value");
  const kpi4Budget = document.getElementById("kpi4-budget");
  const kpi4Var = document.getElementById("kpi4-variance");

  const targetM = activeFilters.month === "ytd" ? 8 : parseInt(activeFilters.month);
  const mData = aggs.monthly[targetM - 1] || { budget: 0, actual: 0, variance: 0 };
  const mPct = mData.budget > 0 ? (mData.actual / mData.budget * 100).toFixed(1) : 0;

  if (kpi4Title) kpi4Title.innerText = activeFilters.month === "ytd" ? "Siste Måned (M08)" : `Valgt Måned (M0${targetM})`;
  if (kpi4Tag) kpi4Tag.innerText = `Måned 0${targetM}`;
  if (kpi4Val) kpi4Val.innerText = formatNok(mData.actual);
  if (kpi4Budget) kpi4Budget.innerHTML = `Budsjett: <strong>${formatNok(mData.budget)} k</strong>`;
  if (kpi4Var) {
    const isNeg = mData.variance < 0;
    kpi4Var.className = `variance-pill ${isNeg ? 'neg' : 'pos'}`;
    kpi4Var.innerText = `${formatNok(mData.variance)} k (${mPct} %)`;
  }
}

// 6. Rendrer valgt Tufte/FT Visual dynamisk
function renderSvgChart() {
  const container = document.getElementById("tufte-chart-container");
  if (!container || !latestAggregates) return;

  // Dynamisk tittel, undertittel og tegnforklaring
  updateChartHeadersAndLegend();

  const width = container.clientWidth || 700;
  const isTall = currentChartMode === "diverging" || currentChartMode === "lollipop" || currentChartMode === "waterfall";
  const height = isTall ? 320 : 280;
  const padding = { top: 38, right: 140, bottom: 35, left: 60 };

  if (currentChartMode === "scurve") {
    renderScurveChart(container, latestAggregates, width, height, padding);
  } else if (currentChartMode === "monthly") {
    renderMonthlyChart(container, latestAggregates, width, height, padding);
  } else if (currentChartMode === "diverging") {
    renderDivergingChart(container, latestAggregates, width, height, padding);
  } else if (currentChartMode === "lollipop") {
    renderLollipopChart(container, latestAggregates, width, height, padding);
  } else if (currentChartMode === "waterfall") {
    renderWaterfallChart(container, latestAggregates, width, height, padding);
  } else if (currentChartMode === "slope") {
    renderSlopegraphChart(container, latestAggregates, width, height, padding);
  }
}

// 6a. Oppdater tittel, undertittel og direkte tegnforklaring
function updateChartHeadersAndLegend() {
  const titleEl = document.getElementById("chart-main-title");
  const subEl = document.getElementById("chart-main-subtitle");
  const legendEl = document.getElementById("chart-legend-container");

  const meta = {
    scurve: {
      title: "📈 Tufte S-Kurve & Akkumulert Forbruk (Time 05)",
      sub: "Direkte etiketter på endepunkter, null vertikale gitterlinjer, kNOK akkumulert Jan–Aug 2024",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap (${formatNok(latestAggregates.totalActual)} k)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#64748b; border:1px dashed #64748b;"></div><span>Budsjettramme (${formatNok(latestAggregates.totalBudget)} k)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:rgba(244,63,94,0.4);"></div><span>Areal: Merforbruk (${formatNok(Math.abs(Math.min(0, latestAggregates.totalVariance)))} k)</span></div>
      `
    },
    monthly: {
      title: "📊 Månedlig Forbruk & Avvik (Time 06)",
      sub: "Grupperte månedskolonner: Budsjett vs. Faktisk regnskap isolert per måned (kNOK)",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Regnskap (Innen ramme)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Regnskap (Merforbruk)</span></div>
      `
    },
    diverging: {
      title: "⚖️ FT 01: Divergerende Avviksstolper (Deviation / Avvik mot null)",
      sub: "Sentrert rundt 0 kNOK: Røde stolper til venstre viser merforbruk, grønne til høyre viser mindreforbruk",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk (Overskridelse)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk (Innsparing)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:var(--border-prominent);"></div><span>0-Aksen (Balanse)</span></div>
      `
    },
    lollipop: {
      title: "🍭 Time 07: Lollipop Chart & Toleranseterskler (Ranking & Limits)",
      sub: "Forbruksgrad i % av budsjett for sentrale kostnadsdrivere med stiplede referanselinjer for risikonivå",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Under 100 % (OK)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>100–110 % (Varsel)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Over 110 % (Kritisk)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e; border-top:1px dashed #f43f5e;"></div><span>110% Terskel</span></div>
      `
    },
    waterfall: {
      title: "🌊 Time 10: Avviksvannfall & EAC Bridge (Budget to Actuals)",
      sub: "Trinnvis forklaring av avviksbroen fra opprinnelig budsjettramme til faktisk regnskap og prognosert årsslutt",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (Start)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Kostnadsøkning (Merforbruk)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Innsparing / Refusjon</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap YTD</span></div>
      `
    },
    slope: {
      title: "📐 Time 08: Slopegraph / Hellingsgraf (M01 vs M08 Endringsanalyse)",
      sub: "Tufte hellingsanalyse: Sammenligner Januar (M01) mot August (M08) for å avsløre kostnadsakselerasjon",
      legend: `
        <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Kraftig akselerasjon (> +15 %)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Moderat vekst (0 til +15 %)</span></div>
        <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Reduksjon / Innsparing (< 0 %)</span></div>
      `
    }
  };

  const curr = meta[currentChartMode] || meta.scurve;
  if (titleEl) titleEl.innerText = curr.title;
  if (subEl) subEl.innerText = curr.sub;
  if (legendEl) legendEl.innerHTML = curr.legend;
}

// 6b. Visual 1: S-Kurve (Time 05 Running Totals)
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

// 6c. Visual 2: Månedlig (Time 06 Bars & Columns)
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

// 6d. Visual 3: FT 01 Diverging Bar Chart (Deviation mot 0-aksen)
function renderDivergingChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Bruk funksjoner (eller drivere hvis kun én funksjon er valgt)
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
      <!-- Zero Axis Header -->
      <text x="${zeroX - 12}" y="${padding.top - 10}" fill="#f43f5e" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="end">← Merforbruk</text>
      <text x="${zeroX + 12}" y="${padding.top - 10}" fill="#10b981" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="start">Mindreforbruk →</text>
      
      <!-- Zero Axis Line -->
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

// 6e. Visual 4: Time 07 Lollipop Chart med Toleranseterskler
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

  // Beregn % for hver
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
      <!-- Threshold Reference Lines -->
      <line x1="${x80}" y1="${padding.top}" x2="${x80}" y2="${padding.top + chartH}" stroke="#64748b" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${x80}" y="${padding.top - 8}" fill="#64748b" font-size="10" font-family="var(--font-mono)" text-anchor="middle">80% Buffer</text>

      <line x1="${x100}" y1="${padding.top}" x2="${x100}" y2="${padding.top + chartH}" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
      <text x="${x100}" y="${padding.top - 8}" fill="#94a3b8" font-size="10" font-family="var(--font-mono)" text-anchor="middle">100% Budsjett</text>

      <line x1="${x110}" y1="${padding.top}" x2="${x110}" y2="${padding.top + chartH}" stroke="#f43f5e" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${x110}" y="${padding.top - 8}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" text-anchor="middle">110% Varsel</text>

      <!-- Rows -->
      ${itemsWithPct.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const dotX = getX(item.pct);
        const color = item.pct > 110 ? "#f43f5e" : item.pct > 100 ? "#f59e0b" : "#10b981";
        const shortName = item.name.length > 20 ? item.name.substring(0, 19) + ".." : item.name;

        return `
          <!-- Label on left -->
          <text x="${padding.left + labelMargin - 10}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">
            ${shortName} (${item.code})
          </text>

          <!-- Stem -->
          <line x1="${padding.left + labelMargin}" y1="${yCenter}" x2="${dotX}" y2="${yCenter}" stroke="#475569" stroke-width="2" />

          <!-- Circle Dot -->
          <circle cx="${dotX}" cy="${yCenter}" r="6" fill="${color}" stroke="#0f172a" stroke-width="1.5" />

          <!-- Value label -->
          <text x="${dotX + 10}" y="${yCenter + 4}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600">
            ${item.budget > 0 ? item.pct.toFixed(1) + ' %' : 'Ubudsjettert'} (${formatNok(item.actual)} k)
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 6f. Visual 5: Time 10 Avviksvannfall (Waterfall Bridge Budsjett -> Regnskap -> EAC)
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
      running += Math.abs(step.delta); // Kostnadsøkning (merforbruk) legger seg på toppen av budsjett for å nå faktisk regnskap
      const topVal = Math.max(prevRunning, running);
      const botVal = Math.min(prevRunning, running);
      const y = getY(topVal);
      const h = Math.max(4, getY(botVal) - y);
      return { ...step, x, y, h, topY: y, bottomY: getY(botVal), running };
    }
  });

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <!-- Connectors between steps -->
      ${renderedSteps.map((s, i) => {
        if (i === 0) return "";
        const prev = renderedSteps[i - 1];
        const lineY = prev.isAnchor ? prev.y : prev.topY;
        return `<line x1="${prev.x + colW}" y1="${lineY}" x2="${s.x}" y2="${lineY}" stroke="#64748b" stroke-dasharray="2,2" stroke-width="1" />`;
      }).join("")}

      <!-- Columns & Labels -->
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

// 6g. Visual 6: Time 08 Slopegraph / Hellingsgraf (M01 vs M08)
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
      <!-- Rail Headers -->
      <text x="${x1}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">Januar (M01)</text>
      <text x="${x2}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">August (M08)</text>

      <!-- Vertical Rails -->
      <line x1="${x1}" y1="${padding.top}" x2="${x1}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="2" />
      <line x1="${x2}" y1="${padding.top}" x2="${x2}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="2" />

      <!-- Slopes -->
      ${items.map(item => {
        const y1 = getY(item.m01);
        const y2 = getY(item.m08);
        const color = item.pct > 15 ? "#f43f5e" : item.pct >= 0 ? "#38bdf8" : "#10b981";
        const shortName = item.name.length > 22 ? item.name.substring(0, 20) + ".." : item.name;

        return `
          <!-- Connecting Slope Line -->
          <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="2.5" />

          <!-- Left Point & Label -->
          <circle cx="${x1}" cy="${y1}" r="4" fill="${color}" />
          <text x="${x1 - 10}" y="${y1 + 4}" fill="var(--text-secondary)" font-size="11" font-family="var(--font-mono)" text-anchor="end">
            ${shortName} (${formatNok(item.m01)} k)
          </text>

          <!-- Right Point & Label -->
          <circle cx="${x2}" cy="${y2}" r="4" fill="${color}" />
          <text x="${x2 + 10}" y="${y2 + 4}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="start">
            ${formatNok(item.m08)} k (${item.pct >= 0 ? '+' : ''}${item.pct.toFixed(0)}%)
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7. Rendrer Kostnadsdrivere i tabell dynamisk
function renderDriversTable() {
  const tbody = document.getElementById("drivers-table-body");
  if (!tbody || !latestAggregates) return;

  const drivers = latestAggregates.drivers;
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

// 8. Rendrer KOSTRA-Funksjoner i tabell dynamisk
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

// 9. Reaktiv What-If Scenariosimulator
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

  // Baser tilpasset aktivt filter
  const monthlyVikarBase = latestAggregates.vikarbyraMonthlyBase || 253.2;
  const monthlyOvertidBase = latestAggregates.overtidMonthlyBase || 52.4;
  const monthlyBudgetBase = (latestAggregates.totalBudget / 8) || 3770.1;

  const vikarMonthlySave = (vikarPct / 100) * monthlyVikarBase;
  const overtidMonthlySave = (overtidPct / 100) * monthlyOvertidBase;
  const omdispMonthlySave = (omdispPct / 100) * monthlyBudgetBase;

  const totalMonthlySavings = vikarMonthlySave + overtidMonthlySave + omdispMonthlySave;
  
  // 4 gjenværende måneder (Sep–Des)
  const remainingMonths = 4;
  const totalRestarSavings = totalMonthlySavings * remainingMonths;

  // Baseline projected avvik for aktivt utvalg
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

// 10. Hovedfunksjon for å anvende aktive filtre og trigge tverrgående oppdatering
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

// Mapping fra Power BI rapportside til aktiv visualiseringsmodus
const PAGE_TO_MODE = {
  "p04": "scurve",
  "p_time05": "scurve",
  "p_time06": "monthly",
  "p_ft01": "diverging",
  "p_ft03": "lollipop",
  "p_time07": "lollipop",
  "p06": "waterfall",
  "p_time10": "waterfall",
  "p_time08": "slope"
};

// 10b. Skift aktiv visualisering
function setChartMode(mode) {
  currentChartMode = mode;
  document.querySelectorAll("#chart-view-selector button").forEach(b => {
    if (b.getAttribute("data-mode") === mode) {
      b.classList.add("active");
    } else {
      b.classList.remove("active");
    }
  });
  renderSvgChart();
}

// 11. Power BI 25-Siders Rapportkatalog Filter & Render
function renderCatalog(filterCat = "all") {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const filtered = filterCat === "all" 
    ? REPORT_PAGES 
    : REPORT_PAGES.filter(p => p.cat === filterCat);

  grid.innerHTML = filtered.map(p => {
    const targetMode = PAGE_TO_MODE[p.id];
    const openBtn = targetMode 
      ? `<button class="card-open-visual-btn" data-target-mode="${targetMode}">👁️ Vis i graf</button>` 
      : "";

    return `
      <div class="report-page-card">
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
        ${openBtn}
      </div>
    `;
  }).join("");

  // Bind klikk på åpne-knapper i kortene
  grid.querySelectorAll(".card-open-visual-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-target-mode");
      if (mode) {
        setChartMode(mode);
        const chartEl = document.getElementById("tufte-chart-container");
        if (chartEl) chartEl.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  });
}

// 12. Theme Switcher (Dark / Light)
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

// 13. Copy CLI Commands
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

// 14. Event Listeners og DOM Oppstart
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSlicers();
  renderCatalog("all");
  initCopyButtons();

  // Kjør første gangs filter og rendering
  applyFilters();

  // Slicer endringer (Reaktiv kryssfiltrering)
  const sectorSelect = document.getElementById("slicer-sector");
  const funcSelect = document.getElementById("slicer-function");
  const monthSelect = document.getElementById("slicer-month");
  const catSelect = document.getElementById("slicer-category");

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

  // Nullstill Filtre Knapp
  const resetBtn = document.getElementById("btn-reset-slicers");
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

  // Vindu-skalering for SVG responsivitet
  window.addEventListener("resize", renderSvgChart);

  // Alle 6 Chart Toggle Knapper
  document.querySelectorAll("#chart-view-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (mode) setChartMode(mode);
    });
  });

  // Slider Events for What-If Simulator
  ["slider-vikar", "slider-overtid", "slider-omdisp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateWhatIfSimulator);
    }
  });

  // FAQ Accordion Listeners
  initFaqAccordion();

  // AI Chatbot Initialization
  initChatbot();
});

// ==========================================================================
// FAQ Accordion Interactivity
// ==========================================================================
function initFaqAccordion() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const isOpen = item.classList.contains("open");

      // Close other open items for clean Tufte presentation
      document.querySelectorAll(".faq-item.open").forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove("open");
          openItem.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
        }
      });

      if (isOpen) {
        item.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      } else {
        item.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
}

// ==========================================================================
// AI Controller Chatbot Engine
// ==========================================================================
function initChatbot() {
  const toggleBtn = document.getElementById("chatbot-toggle-btn");
  const closeBtn = document.getElementById("chatbot-close-btn");
  const chatWindow = document.getElementById("chatbot-window");
  const form = document.getElementById("chatbot-form");
  const input = document.getElementById("chatbot-input");
  const messages = document.getElementById("chatbot-messages");

  if (!chatWindow) return;

  // Toggle Window
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      chatWindow.classList.toggle("hidden");
      if (!chatWindow.classList.contains("hidden") && input) {
        input.focus();
      }
    });
  }

  // Close Window
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      chatWindow.classList.add("hidden");
    });
  }

  // Prompt Pills Click
  document.querySelectorAll(".chat-prompt-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const prompt = pill.getAttribute("data-prompt");
      if (prompt && input) {
        input.value = prompt;
        form.dispatchEvent(new Event("submit"));
      }
    });
  });

  // Handle Send Message
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const query = input.value.trim();
      if (!query) return;

      // 1. Add User Message
      appendChatMessage("user", query);
      input.value = "";

      // 2. Generate Intelligent Controller Reply
      setTimeout(() => {
        const reply = generateControllerResponse(query);
        appendChatMessage("bot", reply);
      }, 300);
    });
  }

  function appendChatMessage(sender, htmlContent) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    msgDiv.innerHTML = `<div class="chat-bubble">${htmlContent}</div>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }
}

// Knowledge-driven Municipal Controller Response Generator
function generateControllerResponse(query) {
  const q = query.toLowerCase();
  const aggs = latestAggregates || { totalActual: 31524.9, totalBudget: 29295.2, totalVariance: -2229.6 };

  if (q.includes("hvorfor") || q.includes("avvik") || q.includes("august") || q.includes("stort")) {
    return `
      <strong>Controller-vurdering av avviket:</strong><br>
      Per august 2024 er samlet avvik <strong>-2 229,6 kNOK</strong> (107,6 % forbruk).<br><br>
      De to viktigste årsakene er:
      <ol style="margin-left:1.2rem; margin-top:0.3rem;">
        <li><strong>Helårsvirkning av lønnsoppgjøret (Art 101000):</strong> Utgjør -1 888,9 kNOK samlet (-1 414,0 kNOK i Oppvekst og -474,9 kNOK i Helse).</li>
        <li><strong>Ekstern innleie av vikarbyrå (Art 127040):</strong> Pleie og omsorg (2540) har hatt et ubudsjettert overforbruk på 382,7 kNOK YTD (253,2 kNOK kom i august).</li>
      </ol>
      <br><em>Anbefaling:</em> Juster periodiseringen i tertial 2 og iverksett godkjenningskrav for vikarbyråinnleie.
    `;
  }

  if (q.includes("vikar") || q.includes("innleie") || q.includes("127040")) {
    return `
      <strong>Status for Vikarbyråinnleie (Art 127040):</strong><br>
      • Budsjett: <strong>0,0 kNOK</strong> (ubudsjettert)<br>
      • Faktisk regnskap YTD: <strong>382,7 kNOK</strong><br>
      • August isolert: <strong>253,2 kNOK</strong> (Helse og omsorg, funksjon 2540)<br><br>
      <strong>Risikovurdering:</strong> Lineær run-rate peker mot over 1 400 kNOK ved årsslutt dersom innleie fortsetter. 
      <br><br>
      Bruk <em>What-If simulatorens</em> glidebryter for å se effekten av f.eks. 80 % reduksjon i innleie (sparer ca. 202 kNOK/mnd).
    `;
  }

  if (q.includes("arbeidsmiljø") || q.includes("lov") || q.includes("overtid") || q.includes("norm")) {
    return `
      <strong>Juridiske rammer & Bemanningsnormer:</strong><br>
      Når vi vurderer budsjettkutt i Oppvekst og Helse, gjelder følgende ufravikelige regler:
      <ul style="margin-left:1.2rem; margin-top:0.3rem;">
        <li><strong>Opplæringsloven § 8-2 (Lærernormen):</strong> Maks 15 elever per lærer på 1.–4. trinn, og 20 på 5.–10. trinn. Vikarkutt kan ikke bryte denne normen.</li>
        <li><strong>Helse- og omsorgstjenesteloven § 4-1:</strong> Krav om forsvarlige helsetjenester 24/7. Total innleiestopp uten intern omdisponering er uforsvarlig.</li>
        <li><strong>Arbeidsmiljøloven § 10-6:</strong> Maksimalt 10 timer overtid per 7 dager (25 timer over 4 uker). Overtidspress øker sykefraværsrisikoen.</li>
      </ul>
    `;
  }

  if (q.includes("eac") || q.includes("prognose") || q.includes("årsslutt") || q.includes("balanse")) {
    return `
      <strong>Prognose ved årsslutt (EAC):</strong><br>
      • <strong>Lineær run-rate:</strong> Fremskriver et samlet underskudd på ca. <strong>-3 344,4 kNOK</strong>.<br>
      • <strong>ML Random Forest modell:</strong> Fanger opp at skolesektoren normalt har lavere vikarkostnader i september–november, men helsesektoren opplever etterslep.<br><br>
      For å gjenopprette balanse kreves en månedlig innsparing på ca. <strong>836 kNOK</strong> over de resterende 4 månedene (Sep–Des).
    `;
  }

  if (q.includes("helse") || q.includes("pleie") || q.includes("bomiljø")) {
    return `
      <strong>Sektorstatus: Helse og Omsorg (Bomiljø):</strong><br>
      • Budsjett YTD: <strong>11 337,2 kNOK</strong><br>
      • Regnskap YTD: <strong>12 622,9 kNOK</strong><br>
      • Avvik YTD: <span style="color:var(--variance-neg);font-weight:600;">-1 285,6 kNOK</span> (111,3 % forbruk)<br>
      • Største avvik: Vikarbyrå (-382,7 k), Fastlønn (-474,9 k) og Vikar kveldstillegg (-45,9 k).
    `;
  }

  if (q.includes("skole") || q.includes("oppvekst") || q.includes("utdanning")) {
    return `
      <strong>Sektorstatus: Oppvekst og Utdanning (KomSkole):</strong><br>
      • Budsjett YTD: <strong>17 958,0 kNOK</strong><br>
      • Regnskap YTD: <strong>18 902,0 kNOK</strong><br>
      • Avvik YTD: <span style="color:var(--variance-neg);font-weight:600;">-944,0 kNOK</span> (105,3 % forbruk)<br>
      • Største avvik: Fastlønn ordinære (-1 414,0 k) og Korttidsfravær (-49,2 k).
    `;
  }

  // Generelt svar basert på aktiv filterkontekst
  return `
    <strong>Aktivt Filterutvalg:</strong><br>
    • Budsjett: <strong>${formatNok(aggs.totalBudget)} kNOK</strong><br>
    • Regnskap: <strong>${formatNok(aggs.totalActual)} kNOK</strong><br>
    • Avvik: <strong style="color:${aggs.totalVariance < 0 ? 'var(--variance-neg)' : 'var(--variance-pos)'};">${formatNok(aggs.totalVariance)} kNOK</strong> (${aggs.totalSpendPct.toFixed(1)} %)<br><br>
    Du kan stille meg spesifikke spørsmål om <em>vikarbyråkostnader</em>, <em>arbeidsmiljøloven</em>, <em>årssluttprognose (EAC)</em> eller <em>hovedårsakene til august-avviket</em>.
  `;
}
