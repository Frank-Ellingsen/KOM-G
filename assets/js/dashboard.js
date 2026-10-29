/**
 * KOM-G: KomKostra Executive Cockpit & BI Portal
 * Dynamic Power BI Cross-Filtering Engine & Slicer Reactive Architecture
 * Supporting all 25 specialized catalog pages with dynamic SVG visuals, KPI sparklines,
 * dynamic Early Warnings, What-If Simulator, interactive Tables, FAQ, and AI Controller.
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
let currentCatalogFilter = "all";

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
  "p01": "executive",
  "p02": "oppvekst",
  "p03": "helse",
  "p04": "scurve",
  "p05": "pareto",
  "p06": "waterfall",
  "p_ft01": "diverging",
  "p_ft02": "correlation",
  "p_ft03": "lollipop",
  "p_ft04": "distribution",
  "p_ft05": "stepped",
  "p_ft06": "magnitude",
  "p_ft07": "treemap",
  "p_ft08": "spatial",
  "p_ft09": "flow",
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

const MONTH_NAMES_SHORT = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug"];
const MONTH_NAMES_FULL = [
  "Januar (01)", "Februar (02)", "Mars (03)", "April (04)",
  "Mai (05)", "Juni (06)", "Juli (07)", "August (08)"
];

// Formater tall på norsk standard (f.eks. -2 229,6 kNOK)
function formatNok(val, decimals = 1) {
  if (val === undefined || val === null || isNaN(val)) return "0,0";
  const parts = Math.abs(val).toFixed(decimals).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const formatted = parts.join(",");
  return val < 0 ? `-${formatted}` : formatted;
}

function getActivePeriodLabel() {
  if (activeFilters.month === "ytd") return "YTD M01–M08";
  const m = parseInt(activeFilters.month);
  return `Måned 0${m} (${MONTH_NAMES_SHORT[m - 1]})`;
}

function getActiveContextSummary() {
  const parts = [];
  parts.push(activeFilters.sector === "all" ? "Konsolidert" : activeFilters.sector);
  if (activeFilters.function !== "all") {
    const fObj = typeof KOSTRA_DIMENSIONS !== "undefined"
      ? KOSTRA_DIMENSIONS.functions.find(f => String(f.func_code) === String(activeFilters.function))
      : null;
    parts.push(fObj ? fObj.func_name : `Funksjon ${activeFilters.function}`);
  }
  if (activeFilters.category !== "all") {
    parts.push(activeFilters.category);
  }
  parts.push(getActivePeriodLabel());
  return parts.join(" • ");
}

// 1. Initialiser og kryssfiltrer Slicere (Power BI Cross-Filtering)
function initSlicers() {
  syncSlicerOptions();
}

function syncSlicerOptions() {
  if (typeof KOSTRA_DIMENSIONS === "undefined" || typeof KOSTRA_RECORDS === "undefined") return;

  const targetM = activeFilters.month === "ytd" ? null : parseInt(activeFilters.month);

  const funcTotals = {};
  KOSTRA_RECORDS.forEach(r => {
    if (targetM !== null && r[0] !== targetM) return;
    if (activeFilters.sector !== "all" && r[1] !== activeFilters.sector) return;
    if (activeFilters.category !== "all" && r[6] !== activeFilters.category) return;
    const fCode = r[2];
    funcTotals[fCode] = (funcTotals[fCode] || 0) + r[8];
  });

  const funcSelect = document.getElementById("slicer-function");
  if (funcSelect) {
    const validFunctions = KOSTRA_DIMENSIONS.functions.filter(f => {
      if (activeFilters.sector === "all") return true;
      return KOSTRA_RECORDS.some(r => r[2] === f.func_code && r[1] === activeFilters.sector);
    });

    if (activeFilters.function !== "all" && !validFunctions.some(f => String(f.func_code) === String(activeFilters.function))) {
      activeFilters.function = "all";
    }

    funcSelect.innerHTML = `<option value="all">Alle Funksjoner (${validFunctions.length})</option>` +
      validFunctions.map(f => {
        const amt = funcTotals[f.func_code] || 0;
        return `<option value="${f.func_code}">${f.func_name} (${formatNok(amt, 0)} k)</option>`;
      }).join("");
    funcSelect.value = String(activeFilters.function);
  }

  const catTotals = {};
  KOSTRA_RECORDS.forEach(r => {
    if (targetM !== null && r[0] !== targetM) return;
    if (activeFilters.sector !== "all" && r[1] !== activeFilters.sector) return;
    if (activeFilters.function !== "all" && r[2] !== parseInt(activeFilters.function)) return;
    const cat = r[6];
    catTotals[cat] = (catTotals[cat] || 0) + r[8];
  });

  const catSelect = document.getElementById("slicer-category");
  if (catSelect) {
    const validCats = KOSTRA_DIMENSIONS.categories.filter(c => {
      return KOSTRA_RECORDS.some(r =>
        r[6] === c &&
        (activeFilters.sector === "all" || r[1] === activeFilters.sector) &&
        (activeFilters.function === "all" || r[2] === parseInt(activeFilters.function))
      );
    });

    if (activeFilters.category !== "all" && !validCats.includes(activeFilters.category)) {
      activeFilters.category = "all";
    }

    catSelect.innerHTML = `<option value="all">Alle Kategorier (${validCats.length})</option>` +
      validCats.map(c => {
        const amt = catTotals[c] || 0;
        return `<option value="${c}">${c} (${formatNok(amt, 0)} k)</option>`;
      }).join("");
    catSelect.value = activeFilters.category;
  }
}

// 2. Filtrer rådata basert på aktiv slicer-kontekst
function getDimensionFilteredRecords() {
  if (typeof KOSTRA_RECORDS === "undefined") return [];
  return KOSTRA_RECORDS.filter(r => {
    if (activeFilters.sector !== "all" && r[1] !== activeFilters.sector) return false;
    if (activeFilters.function !== "all" && r[2] !== parseInt(activeFilters.function)) return false;
    if (activeFilters.category !== "all" && r[6] !== activeFilters.category) return false;
    return true;
  });
}

function getFilteredRecords() {
  const dimRecords = getDimensionFilteredRecords();
  if (activeFilters.month === "ytd") return dimRecords;
  const targetM = parseInt(activeFilters.month);
  return dimRecords.filter(r => r[0] === targetM);
}

// 3. Beregn dynamiske aggregater fra filtrerte rader (både valgt periode og YTD tidsserie)
function calculateAggregates(periodRecords) {
  const dimRecords = getDimensionFilteredRecords();
  const targetM = activeFilters.month === "ytd" ? 8 : parseInt(activeFilters.month);
  const prevM = targetM > 1 ? targetM - 1 : 1;

  let globalPeriodBudget = 0;
  let globalPeriodActual = 0;
  if (typeof KOSTRA_RECORDS !== "undefined") {
    KOSTRA_RECORDS.forEach(r => {
      if (activeFilters.month === "ytd" || r[0] === targetM) {
        globalPeriodBudget += r[7];
        globalPeriodActual += r[8];
      }
    });
  }

  let totalBudget = 0;
  let totalActual = 0;
  let oppvekstBudget = 0, oppvekstActual = 0;
  let helseBudget = 0, helseActual = 0;

  const accountMap = {};
  const funcMap = {};
  const catMap = {};

  periodRecords.forEach(r => {
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

    if (!accountMap[accCode]) {
      accountMap[accCode] = {
        code: accCode, name: accName, sector: sector, cat: catName,
        budget: 0, actual: 0, ytdBudget: 0, ytdActual: 0,
        m01: 0, mTarget: 0, mPrev: 0, monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    accountMap[accCode].budget += b;
    accountMap[accCode].actual += a;

    if (!funcMap[funcCode]) {
      funcMap[funcCode] = {
        code: funcCode, name: funcName, sector: sector,
        budget: 0, actual: 0, ytdBudget: 0, ytdActual: 0,
        m01: 0, m08: 0, mTarget: 0, mPrev: 0,
        monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0],
        monthlyVariances: [0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    funcMap[funcCode].budget += b;
    funcMap[funcCode].actual += a;

    if (!catMap[catName]) {
      catMap[catName] = { name: catName, budget: 0, actual: 0 };
    }
    catMap[catName].budget += b;
    catMap[catName].actual += a;
  });

  const monthMap = {};
  for (let m = 1; m <= 8; m++) {
    monthMap[m] = {
      budget: 0, actual: 0,
      oppvekstActual: 0, helseActual: 0,
      oppvekstBudget: 0, helseBudget: 0,
      overtidActual: 0, vikarActual: 0
    };
  }

  let ytdBudget = 0;
  let ytdActual = 0;

  dimRecords.forEach(r => {
    const m = r[0];
    const sector = r[1];
    const funcCode = r[2];
    const funcName = r[3];
    const accCode = r[4];
    const accName = r[5];
    const catName = r[6];
    const b = r[7];
    const a = r[8];

    if (monthMap[m]) {
      monthMap[m].budget += b;
      monthMap[m].actual += a;
      if (sector === "Oppvekst og Utdanning") {
        monthMap[m].oppvekstActual += a;
        monthMap[m].oppvekstBudget += b;
      } else if (sector === "Helse og Omsorg") {
        monthMap[m].helseActual += a;
        monthMap[m].helseBudget += b;
      }
      if (accCode === 104000) monthMap[m].overtidActual += a;
      if (accCode === 127040 || accCode === 102013 || accCode === 102000 || accCode === 102011) {
        monthMap[m].vikarActual += a;
      }
    }

    if (m <= targetM) {
      ytdBudget += b;
      ytdActual += a;
    }

    if (!accountMap[accCode]) {
      accountMap[accCode] = {
        code: accCode, name: accName, sector: sector, cat: catName,
        budget: 0, actual: 0, ytdBudget: 0, ytdActual: 0,
        m01: 0, mTarget: 0, mPrev: 0, monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    if (m <= targetM) {
      accountMap[accCode].ytdBudget += b;
      accountMap[accCode].ytdActual += a;
    }
    accountMap[accCode].monthlyActuals[m - 1] += a;
    if (m === 1) accountMap[accCode].m01 += a;
    if (m === targetM) accountMap[accCode].mTarget += a;
    if (m === prevM) accountMap[accCode].mPrev += a;

    if (!funcMap[funcCode]) {
      funcMap[funcCode] = {
        code: funcCode, name: funcName, sector: sector,
        budget: 0, actual: 0, ytdBudget: 0, ytdActual: 0,
        m01: 0, m08: 0, mTarget: 0, mPrev: 0,
        monthlyActuals: [0, 0, 0, 0, 0, 0, 0, 0],
        monthlyVariances: [0, 0, 0, 0, 0, 0, 0, 0]
      };
    }
    if (m <= targetM) {
      funcMap[funcCode].ytdBudget += b;
      funcMap[funcCode].ytdActual += a;
    }
    funcMap[funcCode].monthlyActuals[m - 1] += a;
    funcMap[funcCode].monthlyVariances[m - 1] += (b - a);
    if (m === 1) funcMap[funcCode].m01 += a;
    if (m === 8) funcMap[funcCode].m08 += a;
    if (m === targetM) funcMap[funcCode].mTarget += a;
    if (m === prevM) funcMap[funcCode].mPrev += a;
  });

  const totalVariance = totalBudget - totalActual;
  const totalSpendPct = totalBudget !== 0 ? (totalActual / totalBudget) * 100 : (totalActual > 0 ? 100 : 0);
  const ytdVariance = ytdBudget - ytdActual;
  const ytdSpendPct = ytdBudget !== 0 ? (ytdActual / ytdBudget) * 100 : (ytdActual > 0 ? 100 : 0);

  const monthNames = ["Jan (01)", "Feb (02)", "Mar (03)", "Apr (04)", "Mai (05)", "Jun (06)", "Jul (07)", "Aug (08)"];
  let cumB = 0;
  let cumA = 0;
  const allMonthly = Object.keys(monthMap).sort((a, b) => a - b).map(m => {
    const d = monthMap[m];
    const mNum = parseInt(m);
    cumB += d.budget;
    cumA += d.actual;
    return {
      month: monthNames[mNum - 1],
      mNum,
      budget: d.budget,
      actual: d.actual,
      variance: d.budget - d.actual,
      cumBudget: cumB,
      cumActual: cumA,
      cumVariance: cumB - cumA,
      oppvekstActual: d.oppvekstActual,
      helseActual: d.helseActual,
      oppvekstBudget: d.oppvekstBudget,
      helseBudget: d.helseBudget,
      overtidActual: d.overtidActual,
      vikarActual: d.vikarActual
    };
  });

  const monthly = allMonthly.filter(m => m.mNum <= targetM);

  const targetMData = allMonthly.find(m => m.mNum === targetM) || allMonthly[allMonthly.length - 1];
  const prevMData = allMonthly.find(m => m.mNum === prevM) || allMonthly[0];

  const lastMonthBudget = targetMData ? targetMData.budget : 0;
  const lastMonthActual = targetMData ? targetMData.actual : 0;
  const lastMonthVariance = targetMData ? targetMData.variance : 0;

  const prevMonthActual = prevMData ? prevMData.actual : 0;
  const prevMonthVariance = prevMData ? prevMData.variance : 0;

  const momActualDelta = targetM > 1 ? (lastMonthActual - prevMonthActual) : 0;
  const momActualPct = (targetM > 1 && Math.abs(prevMonthActual) > 0.01)
    ? ((lastMonthActual - prevMonthActual) / Math.abs(prevMonthActual)) * 100
    : 0;
  const momVarianceDelta = targetM > 1 ? (lastMonthVariance - prevMonthVariance) : 0;

  const drivers = Object.values(accountMap)
    .filter(d => Math.abs(d.budget) > 0.01 || Math.abs(d.actual) > 0.01)
    .map(d => ({
      ...d,
      variance: d.budget - d.actual,
      ytdVariance: d.ytdBudget - d.ytdActual,
      momDelta: targetM > 1 ? (d.mTarget - d.mPrev) : 0
    }))
    .sort((a, b) => a.variance - b.variance);

  const functions = Object.values(funcMap)
    .filter(f => Math.abs(f.budget) > 0.01 || Math.abs(f.actual) > 0.01)
    .map(f => ({
      ...f,
      variance: f.budget - f.actual,
      ytdVariance: f.ytdBudget - f.ytdActual,
      momDelta: targetM > 1 ? (f.mTarget - f.mPrev) : 0
    }))
    .sort((a, b) => a.variance - b.variance);

  const categories = Object.values(catMap)
    .filter(c => Math.abs(c.budget) > 0.01 || Math.abs(c.actual) > 0.01)
    .map(c => ({
      ...c,
      variance: c.budget - c.actual
    }))
    .sort((a, b) => Math.abs(b.actual) - Math.abs(a.actual));

  const slopeSource = Object.values(funcMap).length > 1 ? Object.values(funcMap) : Object.values(accountMap);
  const slopeData = slopeSource
    .filter(item => (Math.abs(item.m01) > 0.01 || Math.abs(item.mTarget) > 0.01))
    .map(item => {
      const endVal = item.mTarget;
      const diff = endVal - item.m01;
      const pct = Math.abs(item.m01) > 0.01 ? (diff / Math.abs(item.m01)) * 100 : (Math.abs(endVal) > 0.01 ? 100 : 0);
      return { ...item, m08: endVal, diff, pct };
    })
    .sort((a, b) => Math.abs(b.m08) - Math.abs(a.m08))
    .slice(0, 6);

  const topOverruns = drivers.slice(0, 5);
  let capturedVar = 0;
  const dynamicWaterfallMiddle = topOverruns.map(d => {
    capturedVar += d.variance;
    const shortLabel = d.name.split(" ")[0].replace(/[^a-zA-ZæøåÆØÅ0-9-]/g, "");
    return {
      name: `${shortLabel} (${d.code})`,
      amount: d.variance,
      delta: d.variance,
      isAnchor: false,
      color: d.variance < 0 ? "#f43f5e" : "#10b981"
    };
  });
  const ovrigVar = totalVariance - capturedVar;
  if (Math.abs(ovrigVar) > 0.05) {
    dynamicWaterfallMiddle.push({
      name: "Øvrige poster",
      amount: ovrigVar,
      delta: ovrigVar,
      isAnchor: false,
      color: ovrigVar < 0 ? "#f43f5e" : "#10b981"
    });
  }

  const periodSuffix = activeFilters.month === "ytd" ? "YTD" : `M0${targetM}`;
  const waterfallSteps = [
    { name: `Budsjett ${periodSuffix}`, amount: totalBudget, delta: totalBudget, isAnchor: true, color: "#64748b" },
    ...dynamicWaterfallMiddle,
    { name: `Regnskap ${periodSuffix}`, amount: totalActual, delta: totalActual, isAnchor: true, color: "#38bdf8" }
  ];

  const primarySimDriver = drivers.find(d => d.code === 127040 && d.actual > 0)
    || drivers.find(d => d.variance < 0 && d.actual > 0)
    || drivers[0]
    || { code: 127040, name: "Vikarbyråtjenester", actual: 0, mTarget: 0 };

  const secondarySimDriver = drivers.find(d => d.code === 104000 && d.code !== primarySimDriver.code && d.actual > 0)
    || drivers.find(d => d.code !== primarySimDriver.code && d.variance < 0 && d.actual > 0)
    || drivers[1]
    || { code: 104000, name: "Overtidslønn", actual: 0, mTarget: 0 };

  const primaryMonthlyBase = activeFilters.month === "ytd"
    ? (primarySimDriver.mTarget || (primarySimDriver.actual / targetM))
    : primarySimDriver.actual;

  const secondaryMonthlyBase = activeFilters.month === "ytd"
    ? (secondarySimDriver.mTarget || (secondarySimDriver.actual / targetM))
    : secondarySimDriver.actual;

  const monthsCount = activeFilters.month === "ytd" ? targetM : 1;
  const projectedEoyVariance = (ytdVariance / Math.max(1, targetM)) * 12;

  return {
    targetM,
    prevM,
    monthsCount,
    globalPeriodBudget,
    globalPeriodActual,
    totalBudget,
    totalActual,
    totalVariance,
    totalSpendPct,
    ytdBudget,
    ytdActual,
    ytdVariance,
    ytdSpendPct,
    projectedEoyVariance,
    lastMonthBudget,
    lastMonthActual,
    lastMonthVariance,
    prevMonthActual,
    prevMonthVariance,
    momActualDelta,
    momActualPct,
    momVarianceDelta,
    oppvekstBudget,
    oppvekstActual,
    oppvekstVariance: oppvekstBudget - oppvekstActual,
    helseBudget,
    helseActual,
    helseVariance: helseBudget - helseActual,
    monthly,
    allMonthly,
    drivers,
    functions,
    categories,
    slopeData,
    waterfallSteps,
    primarySimDriver,
    secondarySimDriver,
    vikarbyraMonthlyBase: Math.max(0, primaryMonthlyBase),
    overtidMonthlyBase: Math.max(0, secondaryMonthlyBase),
    recordCount: periodRecords.length,
    dimRecordCount: dimRecords.length
  };
}

// 4. Oppdater Aktiv Filter Context Breadcrumbs
function updateFilterContextBar(totalRecords, matchingRecords) {
  const container = document.getElementById("active-filters-container");
  const countEl = document.getElementById("filter-record-count");

  if (countEl) {
    const pct = totalRecords > 0 ? ((matchingRecords / totalRecords) * 100).toFixed(1) : "0.0";
    countEl.innerText = `Viser ${matchingRecords} av ${totalRecords} rader (${pct} %)`;
  }

  if (!container) return;
  const chips = [];

  if (activeFilters.sector !== "all") {
    chips.push(`<span class="filter-chip">Sektor: <strong>${activeFilters.sector}</strong> <span class="filter-chip-remove" data-clear="sector" title="Fjern sektorfilter">✕</span></span>`);
  }
  if (activeFilters.function !== "all") {
    const fObj = KOSTRA_DIMENSIONS.functions.find(f => String(f.func_code) === String(activeFilters.function));
    const label = fObj ? fObj.func_name : activeFilters.function;
    chips.push(`<span class="filter-chip">Funksjon: <strong>${label}</strong> <span class="filter-chip-remove" data-clear="function" title="Fjern funksjonsfilter">✕</span></span>`);
  }
  if (activeFilters.month !== "ytd") {
    const m = parseInt(activeFilters.month);
    chips.push(`<span class="filter-chip">Periode: <strong>Måned 0${m} (${MONTH_NAMES_SHORT[m - 1]})</strong> <span class="filter-chip-remove" data-clear="month" title="Tilbakestill til YTD">✕</span></span>`);
  } else {
    chips.push(`<span class="filter-chip">Periode: <strong>Akkumulert YTD (01–08)</strong></span>`);
  }
  if (activeFilters.category !== "all") {
    chips.push(`<span class="filter-chip">Kategori: <strong>${activeFilters.category}</strong> <span class="filter-chip-remove" data-clear="category" title="Fjern kategorifilter">✕</span></span>`);
  }

  if (activeFilters.sector === "all" && activeFilters.function === "all" && activeFilters.month === "ytd" && activeFilters.category === "all") {
    container.innerHTML = `<span style="color:var(--text-muted);">Aktiv kontekst:</span> <span class="filter-chip">Konsolidert Total (Alle sektorer, funksjoner og kategorier • YTD M01–M08)</span>`;
  } else {
    container.innerHTML = `<span style="color:var(--text-muted);">Aktiv kontekst:</span> ` + chips.join(" ");
  }

  container.querySelectorAll(".filter-chip-remove").forEach(btn => {
    btn.addEventListener("click", () => {
      const toClear = btn.getAttribute("data-clear");
      if (toClear === "sector") {
        activeFilters.sector = "all";
        const el = document.getElementById("slicer-sector");
        if (el) el.value = "all";
      } else if (toClear === "function") {
        activeFilters.function = "all";
        const el = document.getElementById("slicer-function");
        if (el) el.value = "all";
      } else if (toClear === "month") {
        activeFilters.month = "ytd";
        const el = document.getElementById("slicer-month");
        if (el) el.value = "ytd";
      } else if (toClear === "category") {
        activeFilters.category = "all";
        const el = document.getElementById("slicer-category");
        if (el) el.value = "all";
      }
      applyFilters();
    });
  });
}

// 5a. Tufte SVG Sparkline Generator for KPI Cards
function renderTufteSparkline(containerId, values, options = {}) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!values || values.length === 0) {
    el.innerHTML = "";
    return;
  }

  const width = 220;
  const height = 34;
  const padLeft = 6;
  const padRight = options.endLabel ? 68 : 10;
  const padTop = 5;
  const padBot = 5;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBot;

  const minVal = options.includeZero ? Math.min(0, ...values) : Math.min(...values);
  const maxVal = options.includeZero ? Math.max(0, ...values) : Math.max(...values);
  const span = Math.max(1, maxVal - minVal);

  const getX = (i) => padLeft + (values.length === 1 ? plotW / 2 : (i / (values.length - 1)) * plotW);
  const getY = (v) => padTop + plotH - ((v - minVal) / span) * plotH;

  const pts = values.map((v, i) => `${getX(i).toFixed(1)},${getY(v).toFixed(1)}`).join(" ");
  const lastIdx = values.length - 1;
  const lastVal = values[lastIdx];
  const lastX = getX(lastIdx);
  const lastY = getY(lastVal);
  const firstX = getX(0);
  const firstY = getY(values[0]);

  const strokeColor = options.color || "#38bdf8";
  const zeroY = getY(0);

  let areaPolygon = "";
  if (options.fillArea) {
    const baseY = options.includeZero ? zeroY : (padTop + plotH);
    const polyPts = `${firstX.toFixed(1)},${baseY.toFixed(1)} ${pts} ${lastX.toFixed(1)},${baseY.toFixed(1)}`;
    areaPolygon = `<polygon points="${polyPts}" fill="${options.fillColor || 'rgba(244, 63, 94, 0.14)'}" />`;
  }

  const zeroLine = options.includeZero ? `
    <line x1="${padLeft}" y1="${zeroY.toFixed(1)}" x2="${padLeft + plotW}" y2="${zeroY.toFixed(1)}" stroke="var(--border-prominent)" stroke-dasharray="2,2" stroke-width="1" />
  ` : "";

  const endLabelSvg = options.endLabel ? `
    <text x="${lastX + 6}" y="${Math.min(height - 4, Math.max(10, lastY + 3)).toFixed(1)}" fill="${strokeColor}" font-size="9.5" font-family="var(--font-mono)" font-weight="600">
      ${options.endLabel}
    </text>
  ` : "";

  el.innerHTML = `
    <svg class="kpi-sparkline-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      ${zeroLine}
      ${areaPolygon}
      <polyline points="${pts}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="${firstX.toFixed(1)}" cy="${firstY.toFixed(1)}" r="2" fill="var(--text-muted)" />
      <circle cx="${lastX.toFixed(1)}" cy="${lastY.toFixed(1)}" r="3" fill="${strokeColor}" />
      ${endLabelSvg}
    </svg>
  `;
}

// 5b. Oppdater KPI-Kortene (Card 1: Budsjett, Card 2: Regnskap, Card 3: Avvik, Card 4: MoM & Sparkline Avvik YTD)
function updateKpiCards(aggs) {
  const periodLabel = getActivePeriodLabel();
  const contextLabel = getActiveContextSummary();
  const isYtd = activeFilters.month === "ytd";
  const targetM = aggs.targetM;
  const prevM = aggs.prevM;

  const brandSub = document.getElementById("brand-subtitle");
  if (brandSub) {
    brandSub.innerText = `Finansiell Virksomhetsstyring • ${contextLabel}`;
  }

  const topIndicator = document.getElementById("top-status-indicator");
  if (topIndicator) {
    const isPos = aggs.totalVariance >= 0;
    topIndicator.className = isPos ? "status-indicator pos" : "status-indicator";
    topIndicator.innerHTML = `
      <span class="pulse-dot"></span>
      <span>${isYtd ? "YTD" : "M0" + targetM} Avvik: ${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)} kNOK (${aggs.totalSpendPct.toFixed(1)} %)</span>
    `;
  }

  const footerSummary = document.getElementById("footer-dynamic-summary");
  if (footerSummary) {
    footerSummary.innerHTML = `<strong>Kristiansand Kommune</strong> – KOSTRA Virksomhetsstyring 2024 • Aktivt utvalg: <strong>${contextLabel}</strong> (${aggs.recordCount} rader).`;
  }

  const scopeShort = activeFilters.function !== "all"
    ? `Funksjon ${activeFilters.function}`
    : (activeFilters.sector === "all" ? "Konsolidert" : (activeFilters.sector.startsWith("Oppvekst") ? "Oppvekst" : "Helse"));

  // KPI CARD 1: BUDSJETT
  const kpi1Title = document.getElementById("kpi1-title");
  const kpi1Tag = document.getElementById("kpi1-tag");
  const kpi1Val = document.getElementById("kpi1-value");
  const kpi1Sub = document.getElementById("kpi1-subtext");
  const kpi1Pill = document.getElementById("kpi1-pill");

  if (kpi1Title) kpi1Title.innerText = isYtd ? "Budsjett (YTD)" : `Budsjett (Måned 0${targetM})`;
  if (kpi1Tag) kpi1Tag.innerText = `${periodLabel} • ${scopeShort}`;
  if (kpi1Val) kpi1Val.innerText = formatNok(aggs.totalBudget);

  const avgMonthlyBudget = aggs.ytdBudget / Math.max(1, targetM);
  const budgetSharePct = aggs.globalPeriodBudget > 0
    ? (aggs.totalBudget / aggs.globalPeriodBudget) * 100
    : 100;

  if (kpi1Sub) {
    kpi1Sub.innerHTML = isYtd
      ? `Snitt/mnd: <strong>${formatNok(avgMonthlyBudget)} k</strong>`
      : `YTD Budsjett: <strong>${formatNok(aggs.ytdBudget)} k</strong>`;
  }
  if (kpi1Pill) {
    kpi1Pill.className = "variance-pill neutral";
    kpi1Pill.innerText = `${budgetSharePct.toFixed(1)} % av totalramme`;
  }

  const budgetSeries = aggs.monthly.map(m => m.budget);
  renderTufteSparkline("kpi1-sparkline", budgetSeries, {
    color: "#94a3b8",
    includeZero: false,
    endLabel: `M0${targetM}: ${formatNok(aggs.lastMonthBudget, 0)}k`
  });

  // KPI CARD 2: REGNSKAP
  const kpi2Title = document.getElementById("kpi2-title");
  const kpi2Tag = document.getElementById("kpi2-tag");
  const kpi2Val = document.getElementById("kpi2-value");
  const kpi2Sub = document.getElementById("kpi2-subtext");
  const kpi2Pill = document.getElementById("kpi2-pill");

  if (kpi2Title) kpi2Title.innerText = isYtd ? "Regnskap (YTD)" : `Regnskap (Måned 0${targetM})`;
  if (kpi2Tag) kpi2Tag.innerText = activeFilters.category !== "all" ? activeFilters.category : scopeShort;
  if (kpi2Val) kpi2Val.innerText = formatNok(aggs.totalActual);

  const avgMonthlyActual = aggs.ytdActual / Math.max(1, targetM);
  if (kpi2Sub) {
    kpi2Sub.innerHTML = isYtd
      ? `Snitt/mnd: <strong>${formatNok(avgMonthlyActual)} k</strong>`
      : `YTD Regnskap: <strong>${formatNok(aggs.ytdActual)} k</strong>`;
  }
  if (kpi2Pill) {
    const isUnderBudget = aggs.totalVariance >= 0;
    kpi2Pill.className = isUnderBudget ? "variance-pill pos" : "variance-pill neg";
    kpi2Pill.innerText = `${aggs.totalSpendPct.toFixed(1)} % av budsjett`;
  }

  const actualSeries = aggs.monthly.map(m => m.actual);
  renderTufteSparkline("kpi2-sparkline", actualSeries, {
    color: "#38bdf8",
    includeZero: false,
    endLabel: `M0${targetM}: ${formatNok(aggs.lastMonthActual, 0)}k`
  });

  // KPI CARD 3: AVVIK (Budsjett − Regnskap)
  const kpi3Title = document.getElementById("kpi3-title");
  const kpi3Tag = document.getElementById("kpi3-tag");
  const kpi3Val = document.getElementById("kpi3-value");
  const kpi3Sub = document.getElementById("kpi3-subtext");
  const kpi3Pill = document.getElementById("kpi3-pill");

  const isVarPos = aggs.totalVariance >= 0;
  const varPct = aggs.totalBudget !== 0
    ? ((aggs.totalBudget - aggs.totalActual) / Math.abs(aggs.totalBudget)) * 100
    : (aggs.totalActual > 0 ? -100 : 0);

  if (kpi3Title) kpi3Title.innerText = isYtd ? "Avvik (YTD)" : `Avvik (Måned 0${targetM})`;
  if (kpi3Tag) kpi3Tag.innerText = isVarPos ? "Mindreforbruk" : "Merforbruk";
  if (kpi3Val) {
    kpi3Val.innerText = `${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)}`;
    kpi3Val.style.color = isVarPos ? "var(--variance-pos)" : "var(--variance-neg)";
  }
  if (kpi3Sub) {
    kpi3Sub.innerHTML = `Prognose EAC: <strong>${aggs.projectedEoyVariance > 0 ? "+" : ""}${formatNok(aggs.projectedEoyVariance)} k</strong>`;
  }
  if (kpi3Pill) {
    kpi3Pill.className = isVarPos ? "variance-pill pos" : "variance-pill neg";
    kpi3Pill.innerText = `${varPct > 0 ? "+" : ""}${varPct.toFixed(1)} % avvik`;
  }

  const monthlyVarSeries = aggs.monthly.map(m => m.variance);
  renderTufteSparkline("kpi3-sparkline", monthlyVarSeries, {
    color: isVarPos ? "#10b981" : "#f43f5e",
    includeZero: true,
    fillArea: true,
    fillColor: isVarPos ? "rgba(16, 185, 129, 0.14)" : "rgba(244, 63, 94, 0.14)",
    endLabel: `M0${targetM}: ${aggs.lastMonthVariance > 0 ? "+" : ""}${formatNok(aggs.lastMonthVariance, 0)}k`
  });

  // KPI CARD 4: MoM (Siste Måned Endring) & SPARKLINE AVVIK YTD
  const kpi4Title = document.getElementById("kpi4-title");
  const kpi4Tag = document.getElementById("kpi4-tag");
  const kpi4Val = document.getElementById("kpi4-value");
  const kpi4Unit = document.getElementById("kpi4-unit");
  const kpi4Sub = document.getElementById("kpi4-subtext");
  const kpi4Pill = document.getElementById("kpi4-pill");

  if (kpi4Title) kpi4Title.innerText = `MoM Endring & Avvik YTD`;
  if (kpi4Tag) {
    kpi4Tag.innerText = targetM > 1
      ? `M0${targetM} vs M0${prevM} • YTD`
      : `M01 (Start) • YTD`;
  }

  const momDelta = aggs.momActualDelta;
  const isCostReduced = momDelta <= 0;
  if (kpi4Val) {
    if (targetM > 1) {
      kpi4Val.innerText = `${momDelta > 0 ? "+" : ""}${formatNok(momDelta)}`;
      kpi4Val.style.color = isCostReduced ? "var(--variance-pos)" : "var(--variance-neg)";
    } else {
      kpi4Val.innerText = `${formatNok(aggs.lastMonthActual)}`;
      kpi4Val.style.color = "var(--text-primary)";
    }
  }
  if (kpi4Unit) {
    kpi4Unit.innerText = targetM > 1
      ? `kNOK (${aggs.momActualPct >= 0 ? "+" : ""}${aggs.momActualPct.toFixed(1)} %)`
      : `kNOK (M01)`;
  }

  const ytdCumVarSeries = aggs.monthly.map(m => m.cumVariance);
  const isYtdVarPos = aggs.ytdVariance >= 0;
  renderTufteSparkline("kpi4-sparkline", ytdCumVarSeries, {
    color: isYtdVarPos ? "#10b981" : "#f43f5e",
    includeZero: true,
    fillArea: true,
    fillColor: isYtdVarPos ? "rgba(16, 185, 129, 0.16)" : "rgba(244, 63, 94, 0.16)",
    endLabel: `YTD: ${aggs.ytdVariance > 0 ? "+" : ""}${formatNok(aggs.ytdVariance, 0)}k`
  });

  if (kpi4Sub) {
    const momVarSign = aggs.momVarianceDelta > 0 ? "+" : "";
    kpi4Sub.innerHTML = targetM > 1
      ? `MoM Δ Avvik: <strong>${momVarSign}${formatNok(aggs.momVarianceDelta)} k</strong>`
      : `M01 Avvik: <strong>${formatNok(aggs.lastMonthVariance)} k</strong>`;
  }
  if (kpi4Pill) {
    kpi4Pill.className = isYtdVarPos ? "variance-pill pos" : "variance-pill neg";
    kpi4Pill.innerText = `Avvik YTD: ${aggs.ytdVariance > 0 ? "+" : ""}${formatNok(aggs.ytdVariance)} k`;
  }
}

// 5c. Dynamiske Tidligvarsler & Risikoalarmer (Early Warnings) basert på Slicere
function getAccountActionRecommendation(code, cat, sector) {
  if (code === 127040) {
    return "Iverksett administrativ godkjenningsplikt for ekstern vikarbyråinnleie over avdelingsledernivå og mobiliser intern bemanning.";
  }
  if (code === 101000) {
    return "Juster periodisert ramme i tertialrapporten for å hensynta tariffoppgjøret per 01.05 uten å svekke lovpålagt grunnbemanning.";
  }
  if (code === 104000 || code === 102031 || code === 102030) {
    return "Revider vaktplaner og turnus for høstsemesteret for å redusere overtidstillegg og unngå brudd på AML § 10-6 (200-timers grensen).";
  }
  if (code === 102013 || code === 102000 || code === 102011) {
    return "Stram inn bruk av korttidsvikarer ved fravær under 3 dager gjennom intern omdisponering på tvers av avdelinger/trinn.";
  }
  if (code === 109000 || code === 109999) {
    return "Avstem pensjons- og arbeidsgiveravgiftsgrunnlag mot lønnsreserven ved tertialrapportering.";
  }
  if (cat === "Refusjoner") {
    return "Følg opp åpne sykepenge- og foreldrepengerefusjoner mot NAV for å sikre rettidig innbetaling og periodisering.";
  }
  if (cat === "Kjøp av varer og tjenester") {
    return "Innfør skjerpet bestillingskontroll og behovsprøving av løpende materiell- og tjenestekjøp ut året.";
  }
  return `Gjennomfør målrettet avviksoppfølging med enhetsleder i ${sector} for å bringe konto ${code} i balanse før årsslutt.`;
}

function renderEarlyWarnings(aggs) {
  const grid = document.getElementById("warnings-grid");
  const titleEl = document.getElementById("warnings-main-title");
  const subEl = document.getElementById("warnings-main-subtitle");
  const badgeEl = document.getElementById("warnings-status-badge");
  const panelEl = document.getElementById("warning-panel-section");
  if (!grid) return;

  const periodLabel = getActivePeriodLabel();
  const contextLabel = getActiveContextSummary();

  if (titleEl) {
    titleEl.innerText = `🚨 Tidligvarsler & Risikoalarmer (${periodLabel})`;
  }
  if (subEl) {
    subEl.innerText = `Automatisk avviksdeteksjon for aktivt filter: ${contextLabel} (Klikk kort for å filtrere kategori)`;
  }

  const overruns = aggs.drivers.filter(d => d.variance < -0.5);

  if (overruns.length === 0) {
    if (badgeEl) {
      badgeEl.className = "status-indicator pos";
      badgeEl.innerHTML = `<span class="pulse-dot"></span> 0 Kritiske Risikovarsler (I Balanse)`;
    }
    if (panelEl) panelEl.style.borderLeftColor = "var(--variance-pos)";

    const topSavers = aggs.drivers.slice().sort((a, b) => b.variance - a.variance).slice(0, 3);
    grid.innerHTML = topSavers.length > 0 ? topSavers.map(d => `
      <article class="warning-card pos" data-cat="${d.cat}" style="cursor:pointer;" title="Klikk for å filtrere på ${d.cat}">
        <div class="warning-header">
          <span class="warning-badge pos">I BALANSE / MINDREFORBRUK</span>
          <span class="warning-code">Art ${d.code} • ${d.sector}</span>
        </div>
        <h3 class="warning-title">${d.name}</h3>
        <p class="warning-text">
          Kontoen viser et positivt mindreforbruk på <strong>+${formatNok(d.variance)} kNOK</strong> i valgt periode (Regnskap: <strong>${formatNok(d.actual)} k</strong> mot Budsjett: <strong>${formatNok(d.budget)} k</strong>).
        </p>
        <div class="warning-action">
          <strong>Controller-vurdering:</strong> Vurder om mindreforbruket skyldes etterslep i fakturering/refusjon eller reell innsparing som kan omdisponeres.
        </div>
      </article>
    `).join("") : `
      <article class="warning-card pos">
        <div class="warning-header">
          <span class="warning-badge pos">INGEN AVVIK</span>
          <span class="warning-code">${periodLabel}</span>
        </div>
        <h3 class="warning-title">Ingen registrerte kostnadsoverskridelser i valgt filter</h3>
        <p class="warning-text">Det valgte utvalget har ingen poster med merforbruk.</p>
      </article>
    `;
    return;
  }

  if (panelEl) panelEl.style.borderLeftColor = "var(--variance-neg)";
  const top3 = overruns.slice(0, 3);
  if (badgeEl) {
    badgeEl.className = "status-indicator";
    badgeEl.innerHTML = `<span class="pulse-dot"></span> ${overruns.length} Aktive Risikovarsler (Viser topp ${top3.length})`;
  }

  grid.innerHTML = top3.map((d, idx) => {
    const overrunAmt = Math.abs(d.variance);
    const pctOver = d.budget > 0 ? ((d.actual - d.budget) / d.budget) * 100 : 100;
    const isCrit = idx === 0 || pctOver > 25 || overrunAmt > 300;
    const badgeClass = isCrit ? "crit" : "warn";
    const badgeText = isCrit ? "KRITISK RISIKO" : (idx === 1 ? "BETYDELIG AVVIK" : "MODERAT RISIKO");
    const eacRunRate = (Math.abs(d.ytdVariance) / Math.max(1, aggs.targetM)) * 12;
    const momText = aggs.targetM > 1
      ? `Siste mnd (M0${aggs.targetM}): <strong>${formatNok(d.mTarget)} kNOK</strong> (${d.momDelta >= 0 ? "+" : ""}${formatNok(d.momDelta)} k MoM).`
      : `M01 Regnskap: <strong>${formatNok(d.actual)} kNOK</strong>.`;

    return `
      <article class="warning-card ${badgeClass}" data-cat="${d.cat}" style="cursor:pointer;" title="Klikk for å filtrere på kostnadskategori: ${d.cat}">
        <div class="warning-header">
          <span class="warning-badge ${badgeClass}">${badgeText}</span>
          <span class="warning-code">Art ${d.code} • ${d.sector}</span>
        </div>
        <h3 class="warning-title">${d.name}</h3>
        <p class="warning-text">
          Merforbruk på <strong>${formatNok(d.variance)} kNOK</strong> i ${periodLabel} (Regnskap <strong>${formatNok(d.actual)} k</strong> vs. Budsjett <strong>${formatNok(d.budget)} k</strong>). ${momText} Uten tiltak estimeres årssluttavviket (EAC) på posten til <strong>-${formatNok(eacRunRate)} kNOK</strong>.
        </p>
        <div class="warning-action">
          <strong>Anbefalt Controller-tiltak:</strong> ${getAccountActionRecommendation(d.code, d.cat, d.sector)}
        </div>
      </article>
    `;
  }).join("");

  grid.querySelectorAll(".warning-card[data-cat]").forEach(card => {
    card.addEventListener("click", () => {
      const cat = card.getAttribute("data-cat");
      if (!cat) return;
      activeFilters.category = activeFilters.category === cat ? "all" : cat;
      const catSel = document.getElementById("slicer-category");
      if (catSel) catSel.value = activeFilters.category;
      applyFilters();
    });
  });
}

// 6. Metadata ordbok for alle visuelle moduser
const CHART_META = {
  executive: {
    title: "🏛️ 01. Hovedrapport: Konsolidert Kommuneøkonomi 2024 (Executive Status)",
    sub: "Politisk og administrativ ledelsesstatus: Budsjett, regnskap og avvik per sektor",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Faktisk Regnskap</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
    `
  },
  oppvekst: {
    title: "🏫 02. Sektor: Oppvekst og Utdanning (KomSkole Dypdykk)",
    sub: "Analyse av skolesektoren: Grunnskole, SFO, PPT og største avviksposter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Regnskap (Merforbruk)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Regnskap (Mindreforbruk)</span></div>
    `
  },
  helse: {
    title: "🏥 03. Sektor: Helse og Mestring (Pleie & Omsorg / Bomiljø)",
    sub: "24/7 døgnturnus og institusjonstjenester: Kostnadsdrivere og avviksanalyse",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#be123c;"></div><span>Vikarbyrå / Kritisk post</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk</span></div>
    `
  },
  scurve: {
    title: "📈 04 / Time 05: Tufte S-Kurve & Akkumulert Forbruk (Running Totals)",
    sub: "Direkte etiketter på endepunkter, null vertikale gitterlinjer, akkumulert kNOK",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Akkumulert Regnskap</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b; border:1px dashed #64748b;"></div><span>Akkumulert Budsjett</span></div>
      <div class="legend-item"><div class="legend-line" style="background:rgba(244,63,94,0.4);"></div><span>Areal: Akkumulert Avvik</span></div>
    `
  },
  pareto: {
    title: "📊 05: KOSTRA Struktur & Pareto 80/20 Driverfordeling",
    sub: "Akkumulert avviksbidrag for de største merforbrukspostene i aktivt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Avvik per art (kNOK)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Kumulativ andel %</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b; border-top:1px dashed #f59e0b;"></div><span>80% Pareto-grense</span></div>
    `
  },
  waterfall: {
    title: "🌊 06 / Time 10: Budsjett til Regnskap Avviksvannfall (Variance Bridge)",
    sub: "Trinnvis forklaring av avviksbroen fra budsjettramme via toppdrivere til regnskap",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (Start)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk / Refusjon</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap</span></div>
    `
  },
  diverging: {
    title: "⚖️ FT 01: Divergerende Avviksstolper (Deviation / Avvik mot 0-aksen)",
    sub: "Sentrert rundt 0 kNOK: Røde stolper til venstre viser merforbruk, grønne til høyre viser mindreforbruk",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk (Negativt avvik)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk (Positivt avvik)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:var(--border-prominent);"></div><span>0-Aksen (Balanse)</span></div>
    `
  },
  correlation: {
    title: "🔬 FT 02: Korrelasjon (Månedlig Budsjett vs. Faktisk Regnskap / Vikar & Overtid)",
    sub: "Scatterplot og regresjonstrendlinje for månedsobservasjoner i valgt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Månedsobservasjon</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e; border-top:1px dashed #f43f5e;"></div><span>Lineær trendlinje</span></div>
    `
  },
  lollipop: {
    title: "🍭 FT 03 / Time 07: Lollipop Chart & Toleranseterskler (Ranking & Limits)",
    sub: "Forbruksgrad i % av budsjett for de største kostnadsdriverne i aktivt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Under 100 % (OK)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>100–110 % (Varsel)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Over 110 % (Kritisk)</span></div>
    `
  },
  distribution: {
    title: "📦 FT 04: Fordeling & Spredning i Månedlige Driftsutgifter (Boxplot)",
    sub: "Månedlig spredning (Min, Kvartiler, Median, Maks) per funksjon/konto i valgt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Interkvartilbredde (Q1–Q3)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Median månedskostnad</span></div>
    `
  },
  stepped: {
    title: "🪜 FT 05: Tidsutvikling med Trappetrinn (Stepped Lines)",
    sub: "Trappetrinn (diskrete kumulative budsjett-trinn) mot kontinuerlig regnskapslinje",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme (Trappetrinn)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Faktisk Regnskap (Kontinuerlig)</span></div>
    `
  },
  magnitude: {
    title: "📊 FT 06: Størrelsessammenligning (Magnitude: Budsjett vs Regnskap)",
    sub: "Grupperte stolper skalert etter driftsvolum i valgt filterkontekst",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjett</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Regnskap (Merforbruk)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Regnskap (Mindreforbruk)</span></div>
    `
  },
  treemap: {
    title: "🗺️ FT 07: Del av Helhet (KOSTRA Kategori Treemap)",
    sub: "Proporsjonal fordeling av utgiftsvolum per kostnadskategori/art i aktivt utvalg",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Største kategori</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Nest største</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Øvrige kategorier</span></div>
    `
  },
  spatial: {
    title: "📍 FT 08: Geografisk Sonefordeling (Kristiansand Kommunesoner)",
    sub: "Estimert ressursfordeling og avvik fordelt på kommunens 4 tjenestesonene for valgt utvalg",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Vågsbygd</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Grim & Lund</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Randesund</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>Torridal</span></div>
    `
  },
  flow: {
    title: "🔀 FT 09: Ressursallokeringsflyt (Sankey Flow / Allokeringsvannfall)",
    sub: "Flyt fra budsjettramme til sektorer og største kostnadskategorier i valgt utvalg",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Rammebevilgning</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Oppvekst</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Helse</span></div>
    `
  },
  lines_multi: {
    title: "📈 Time 01: Multi-Series Kontinuerlige Linjediagrammer",
    sub: "Månedlig kostnadsutvikling for de 3 største kostnadsdriverne i aktivt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Driver #1</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Driver #2</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f59e0b;"></div><span>Driver #3</span></div>
    `
  },
  moving_avg: {
    title: "📉 Time 02: 3-Måneders Glidende Snitt & Bånd (3M Moving Average)",
    sub: "Utjevnede kostnadstrender og månedlig utvikling for aktivt utvalg",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#94a3b8; border-top:1px dashed #94a3b8;"></div><span>Faktisk månedskostnad</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>3M Glidende Snitt</span></div>
    `
  },
  area_stream: {
    title: "🌊 Time 03: Stablet Areal & Sektorsammensetning (Trend Streams)",
    sub: "Relativ månedlig kostnadsandel mellom sektorer / funksjoner i valgt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#0284c7;"></div><span>Oppvekst & Utdanning</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Helse & Omsorg</span></div>
    `
  },
  indexed_mom: {
    title: "📊 Time 04: Indeksert Kostnadsvekst (Januar M01 = 100)",
    sub: "Normalisert vekstkurve relativt til M01 for totalt regnskap og toppdrivere i utvalget",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Topp avvikspost (Indeks)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Samlet Regnskap (Indeks)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#64748b; border-top:1px dashed #64748b;"></div><span>Januar Basislinje (100)</span></div>
    `
  },
  monthly: {
    title: "📊 Time 06: Månedlig Forbruk & Avvik (Grouped Benchmark Columns)",
    sub: "Grupperte kolonner: Budsjett vs. Faktisk regnskap isolert per måned (kNOK)",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#64748b;"></div><span>Budsjettramme</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Regnskap (Innen ramme)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Regnskap (Merforbruk)</span></div>
    `
  },
  slope: {
    title: "📐 Time 08: Slopegraph / Hellingsgraf (M01 vs Siste Måned Endringsanalyse)",
    sub: "Tufte hellingsanalyse: Sammenligner Januar (M01) mot valgt sluttmåned for å avsløre akselerasjon",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Kraftig vekst (> +15 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Moderat endring (0 til +15 %)</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Reduksjon (< 0 %)</span></div>
    `
  },
  sparklines: {
    title: "✨ Time 09: Sparkline KPI-Grid & Tidsindikatorer",
    sub: "Tufte mikro-grafer: Viser månedlig miniatyrtrend for funksjoner/drivere i aktivt filter",
    legend: `
      <div class="legend-item"><div class="legend-line" style="background:#38bdf8;"></div><span>Månedstrend M01–M08</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#f43f5e;"></div><span>Merforbruk</span></div>
      <div class="legend-item"><div class="legend-line" style="background:#10b981;"></div><span>Mindreforbruk</span></div>
    `
  }
};

// 6b. Oppdater tittel, undertittel, direkte tegnforklaring og dynamisk Controller Insight Box
function updateChartHeadersAndLegend() {
  const titleEl = document.getElementById("chart-main-title");
  const subEl = document.getElementById("chart-main-subtitle");
  const legendEl = document.getElementById("chart-legend-container");

  const meta = CHART_META[currentChartMode] || CHART_META.scurve;
  const contextLabel = getActiveContextSummary();
  const periodLabel = getActivePeriodLabel();

  if (titleEl) titleEl.innerText = meta.title;
  if (subEl) subEl.innerText = `${meta.sub} • Aktiv kontekst: ${contextLabel}`;
  if (legendEl) legendEl.innerHTML = meta.legend;

  if (!latestAggregates) return;
  const aggs = latestAggregates;

  const sectorTag = document.getElementById("insight-sector-tag");
  const rootCauseEl = document.getElementById("insight-root-cause");
  const recEl = document.getElementById("insight-recommendations");
  const legalEl = document.getElementById("insight-legal-tag");
  const impactEl = document.getElementById("insight-impact-tag");

  if (sectorTag) {
    sectorTag.innerText = contextLabel;
  }

  const d1 = aggs.drivers[0];
  const d2 = aggs.drivers[1];
  const f1 = aggs.functions[0];
  const isPos = aggs.totalVariance >= 0;

  if (rootCauseEl) {
    if (!d1) {
      rootCauseEl.innerHTML = "Ingen regnskapsrader i gjeldende filterkombinasjon.";
    } else if (isPos) {
      rootCauseEl.innerHTML = `Utvalget (<strong>${contextLabel}</strong>) viser et samlet mindreforbruk på <strong>+${formatNok(aggs.totalVariance)} kNOK</strong> (${aggs.totalSpendPct.toFixed(1)} % forbruk av budsjett på ${formatNok(aggs.totalBudget)} kNOK). MoM-endring siste måned er <strong>${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK</strong>.`;
    } else {
      const d1Text = `${d1.name} (Art ${d1.code}: ${formatNok(d1.variance)} kNOK)`;
      const d2Text = d2 && d2.variance < 0 ? ` og ${d2.name} (Art ${d2.code}: ${formatNok(d2.variance)} kNOK)` : "";
      const fText = f1 ? ` Største funksjonsavvik ligger på <strong>${f1.name}</strong> (${formatNok(f1.variance)} kNOK).` : "";
      rootCauseEl.innerHTML = `I <strong>${periodLabel}</strong> har valgt utvalg et netto merforbruk på <strong>${formatNok(aggs.totalVariance)} kNOK</strong> (${aggs.totalSpendPct.toFixed(1)} % av budsjett). Hoveddriverne er <strong>${d1Text}</strong>${d2Text}.${fText} Siste måned (M0${aggs.targetM}) endret regnskapet seg med <strong>${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK</strong> MoM.`;
    }
  }

  if (recEl) {
    if (!d1) {
      recEl.innerHTML = "Nullstill ett eller flere filtre for å se tiltaksanbefalinger.";
    } else if (isPos) {
      recEl.innerHTML = `1) Verifiser at alle inngående fakturaer og refusjonskrav i ${periodLabel} er korrekt periodisert. 2) Vurder om mindreforbruket på +${formatNok(aggs.totalVariance)} kNOK kan omdisponeres til utsatte tjenesteområder innen samme sektor.`;
    } else {
      const rec1 = getAccountActionRecommendation(d1.code, d1.cat, d1.sector);
      const rec2 = d2 && d2.variance < 0
        ? ` Kombiner med tiltak på Art ${d2.code} (${d2.name.substring(0, 24)}) for å redusere månedlig run-rate fra M0${aggs.targetM}.`
        : " Følg opp månedlig run-rate mot revidert prognose (EAC) i kommende tertialrapportering.";
      recEl.innerHTML = `${rec1}${rec2}`;
    }
  }

  if (legalEl) {
    if (activeFilters.sector === "Oppvekst og Utdanning") {
      legalEl.innerText = "⚖️ Lovmessig ramme: Opplæringsloven § 8-2 (lærernorm) / Kommuneloven § 14-4 (økonomisk balanse)";
    } else if (activeFilters.sector === "Helse og Omsorg") {
      legalEl.innerText = "⚖️ Lovmessig ramme: Helse- og omsorgstjenesteloven § 4-1 (forsvarlighet) / AML § 10-6 (overtidsgrenser)";
    } else {
      legalEl.innerText = "⚖️ Lovmessig ramme: Kommuneloven § 14-4 / Opplæringsloven § 8-2 / Helse- og omsorgstjenesteloven § 4-1 / AML § 10-6";
    }
  }

  if (impactEl) {
    const remMonths = Math.max(1, 12 - aggs.targetM);
    const potentialSave = Math.max(15, Math.abs(aggs.ytdVariance) * 0.18 * (remMonths / 4));
    impactEl.innerText = isPos
      ? `Akkumulert buffer YTD: +${formatNok(aggs.ytdVariance)} kNOK`
      : `Potensiell restårsgevinst (${remMonths} mnd): ${formatNok(potentialSave * 0.75, 0)}–${formatNok(potentialSave * 1.25, 0)} kNOK`;
  }
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

  const allVals = cumData.flatMap(d => [d.cumActual, d.cumBudget]);
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(100, ...allVals) * 1.15;
  const span = Math.max(100, maxVal - minVal);

  const getX = (i) => padding.left + (cumData.length === 1 ? chartW / 2 : (i / Math.max(1, cumData.length - 1)) * chartW);
  const getY = (val) => padding.top + chartH - ((val - minVal) / span) * chartH;

  const budgetPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumBudget)}`).join(" ");
  const actualPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ");
  const areaPoints = `${cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ")} ` +
                     `${cumData.slice().reverse().map((d, i) => `${getX(cumData.length - 1 - i)},${getY(d.cumBudget)}`).join(" ")}`;

  const last = cumData[cumData.length - 1] || { cumBudget: 0, cumActual: 0 };
  const lastX = getX(cumData.length - 1);
  const lastY_B = getY(last.cumBudget);
  const lastY_A = getY(last.cumActual);

  const gridStep = span > 20000 ? 10000 : span > 10000 ? 5000 : span > 2000 ? 1000 : 250;
  const gridLines = [];
  for (let g = Math.ceil(minVal / gridStep) * gridStep; g < maxVal; g += gridStep) {
    gridLines.push(`
      <line x1="${padding.left}" y1="${getY(g)}" x2="${padding.left + chartW}" y2="${getY(g)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
      <text x="${padding.left - 8}" y="${getY(g) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">${formatNok(g, 0)}</text>
    `);
  }

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${gridLines.join("")}
      <polygon points="${areaPoints}" fill="${last.cumActual > last.cumBudget ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)'}" />
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
      <text x="${lastX + 10}" y="${Math.abs(lastY_B - lastY_A) < 14 ? lastY_A + 17 : lastY_B + 4}" fill="#94a3b8" font-size="11" font-family="var(--font-mono)">
        Budsjett: ${formatNok(last.cumBudget)} k
      </text>
    </svg>
  `;
}

// 7b. Visual 2: Månedlig (Time 06 Bars & Columns)
function renderMonthlyChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.allMonthly;
  const targetM = aggs.targetM;
  const isSingleMonth = activeFilters.month !== "ytd";

  const maxBar = Math.max(10, ...monthly.map(m => Math.max(Math.abs(m.budget), Math.abs(m.actual)))) * 1.15;
  const barGroupW = chartW / monthly.length;
  const barW = Math.max(8, (barGroupW - 14) / 2);
  const getY = (val) => padding.top + chartH - (Math.abs(val) / maxBar) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${monthly.map((m, i) => {
        const groupX = padding.left + i * barGroupW + 7;
        const hBudget = Math.max(2, chartH - (getY(m.budget) - padding.top));
        const hActual = Math.max(2, chartH - (getY(m.actual) - padding.top));
        const isOver = m.actual > m.budget;
        const actualColor = isOver ? "var(--variance-neg)" : "var(--accent-cyan)";
        const opacity = (isSingleMonth && m.mNum !== targetM) ? 0.3 : 1;

        return `
          <g opacity="${opacity}">
            <rect x="${groupX}" y="${getY(m.budget)}" width="${barW}" height="${hBudget}" fill="#64748b" opacity="0.65" rx="2" />
            <rect x="${groupX + barW + 2}" y="${getY(m.actual)}" width="${barW}" height="${hActual}" fill="${actualColor}" rx="2" />
            <text x="${groupX + barW}" y="${height - 12}" fill="${m.mNum === targetM ? 'var(--text-primary)' : 'var(--text-muted)'}" font-weight="${m.mNum === targetM ? '700' : '400'}" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
            <text x="${groupX + barW + 2 + barW/2}" y="${getY(m.actual) - 4}" fill="${actualColor}" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(m.actual, 0)}</text>
          </g>
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

  const maxNeg = Math.max(20, Math.abs(Math.min(0, ...items.map(d => d.variance))));
  const maxPos = Math.max(20, Math.max(0, ...items.map(d => d.variance)));
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
  const getX = (p) => padding.left + labelMargin + (Math.min(maxPct, Math.max(0, p)) / maxPct) * plotW;

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

  const maxVal = Math.max(100, Math.abs(aggs.totalBudget), Math.abs(aggs.totalActual)) * 1.25;
  const getY = (val) => padding.top + chartH - (Math.max(0, val) / maxVal) * chartH;

  const N = steps.length;
  const colGap = 8;
  const colW = Math.max(18, (chartW - (N - 1) * colGap) / N);

  let running = aggs.totalBudget;
  const renderedSteps = steps.map((step, i) => {
    const x = padding.left + i * (colW + colGap);
    if (step.isAnchor) {
      const y = getY(Math.abs(step.amount));
      const h = Math.max(4, (padding.top + chartH) - y);
      running = Math.abs(step.amount);
      return { ...step, x, y, h, topY: y, bottomY: padding.top + chartH, running };
    } else {
      const prevRunning = running;
      // Negativt avvik (merforbruk) øker kostnadsbroen fra budsjett til regnskap
      running = prevRunning - step.delta;
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
        const lineY = getY(prev.running);
        return `<line x1="${prev.x + colW}" y1="${lineY}" x2="${s.x}" y2="${lineY}" stroke="#64748b" stroke-dasharray="2,2" stroke-width="1" />`;
      }).join("")}

      ${renderedSteps.map((s) => `
        <rect x="${s.x}" y="${s.y}" width="${colW}" height="${s.h}" fill="${s.color}" rx="2" />
        <text x="${s.x + colW / 2}" y="${s.y - 6}" fill="${s.color}" font-size="10" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">
          ${s.isAnchor ? formatNok(s.amount, 0) : (s.delta < 0 ? formatNok(s.delta, 0) : '+' + formatNok(s.delta, 0))}
        </text>
        <text x="${s.x + colW / 2}" y="${height - 12}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">
          ${s.name.substring(0, 12)}
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
    container.innerHTML = `<div style="text-align:center; padding:3rem; color:var(--text-muted);">Ingen tidsrekkedata for valgt utvalg.</div>`;
    return;
  }

  const x1 = padding.left + 150;
  const x2 = width - padding.right - 110;
  const maxVal = Math.max(50, ...items.map(d => Math.max(Math.abs(d.m01), Math.abs(d.m08)))) * 1.25;
  const getY = (val) => padding.top + chartH - (Math.abs(val) / maxVal) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <text x="${x1}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">Januar (M01)</text>
      <text x="${x2}" y="${padding.top - 14}" fill="var(--text-secondary)" font-size="12" font-family="var(--font-mono)" text-anchor="middle" font-weight="600">${MONTH_NAMES_FULL[aggs.targetM - 1]}</text>
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

  const sectors = activeFilters.sector === "all" ? [
    { name: "Oppvekst & Utdanning", b: aggs.oppvekstBudget, a: aggs.oppvekstActual, v: aggs.oppvekstVariance },
    { name: "Helse & Omsorg", b: aggs.helseBudget, a: aggs.helseActual, v: aggs.helseVariance }
  ] : aggs.functions.slice(0, 4).map(f => ({
    name: f.name, b: f.budget, a: f.actual, v: f.variance
  }));

  if (sectors.length === 0) return;

  const maxVal = Math.max(50, ...sectors.map(s => Math.max(Math.abs(s.b), Math.abs(s.a)))) * 1.25;
  const rowH = chartH / sectors.length;
  const barH = Math.min(22, Math.max(10, (rowH - 28) / 2));

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${sectors.map((s, i) => {
        const yTop = padding.top + i * rowH + 15;
        const bW = (Math.abs(s.b) / maxVal) * (chartW - 120);
        const aW = (Math.abs(s.a) / maxVal) * (chartW - 120);
        const pct = s.b > 0 ? (s.a / s.b) * 100 : 0;
        const color = s.v < 0 ? "#f43f5e" : "#10b981";

        return `
          <text x="${padding.left}" y="${yTop - 6}" fill="var(--text-primary)" font-size="12" font-weight="600">${s.name}</text>
          <text x="${padding.left + chartW}" y="${yTop - 6}" fill="${color}" font-size="11" font-family="var(--font-mono)" font-weight="600" text-anchor="end">
            Avvik: ${s.v > 0 ? '+' : ''}${formatNok(s.v)} k (${pct.toFixed(1)} %)
          </text>
          <rect x="${padding.left}" y="${yTop}" width="${bW}" height="${barH}" fill="#64748b" opacity="0.6" rx="3" />
          <text x="${padding.left + bW + 8}" y="${yTop + barH - 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)">Budsjett: ${formatNok(s.b)} k</text>
          <rect x="${padding.left}" y="${yTop + barH + 4}" width="${aW}" height="${barH}" fill="${color}" rx="3" />
          <text x="${padding.left + aW + 8}" y="${yTop + barH * 2}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">Regnskap: ${formatNok(s.a)} k</text>
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
  if (items.length === 0) return;

  const rowH = chartH / items.length;
  const maxA = Math.max(50, ...items.map(d => Math.max(Math.abs(d.budget), Math.abs(d.actual)))) * 1.2;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${items.map((item, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const bW = (Math.abs(item.budget) / maxA) * (chartW - 140);
        const aW = (Math.abs(item.actual) / maxA) * (chartW - 140);
        const color = item.variance < 0 ? "#f43f5e" : "#10b981";

        return `
          <text x="${padding.left + 140}" y="${yCenter - 2}" fill="var(--text-primary)" font-size="11" text-anchor="end">
            ${item.name.substring(0, 20)} (${item.code})
          </text>
          <rect x="${padding.left + 150}" y="${yCenter - 9}" width="${bW}" height="7" fill="#64748b" opacity="0.6" rx="2" />
          <rect x="${padding.left + 150}" y="${yCenter}" width="${aW}" height="9" fill="${color}" rx="2" />
          <text x="${padding.left + 150 + Math.max(bW, aW) + 10}" y="${yCenter + 6}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">
            ${item.variance > 0 ? '+' : ''}${formatNok(item.variance)} k
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
  if (items.length === 0) return;

  const rowH = chartH / items.length;
  const maxV = Math.max(10, ...items.map(d => Math.abs(d.variance))) * 1.15;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <text x="${padding.left}" y="${padding.top - 8}" fill="#f43f5e" font-size="11" font-weight="600">Topp Avviksposter (${getActiveContextSummary()})</text>
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
            ${item.variance > 0 ? '+' : ''}${formatNok(item.variance)} k ${isVikar ? '⚠️ KRITISK' : ''}
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
  const sourceDrivers = negDrivers.length > 0 ? negDrivers : aggs.drivers.slice(0, 6);
  if (sourceDrivers.length === 0) return;

  const totalAbsVar = sourceDrivers.reduce((sum, d) => sum + Math.abs(d.variance), 0);
  let cumSum = 0;
  const paretoData = sourceDrivers.map(d => {
    cumSum += Math.abs(d.variance);
    const cumPct = totalAbsVar > 0 ? (cumSum / totalAbsVar) * 100 : 0;
    return { ...d, absVar: Math.abs(d.variance), cumPct };
  });

  const maxBar = Math.max(10, ...paretoData.map(d => d.absVar)) * 1.15;
  const colW = (chartW - 60) / paretoData.length;
  const getYBar = (v) => padding.top + chartH - (v / maxBar) * chartH;
  const getYPct = (p) => padding.top + chartH - (p / 100) * chartH;
  const y80 = getYPct(80);

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <line x1="${padding.left}" y1="${y80}" x2="${padding.left + chartW}" y2="${y80}" stroke="#f59e0b" stroke-dasharray="4,4" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${y80 - 4}" fill="#f59e0b" font-size="10" font-family="var(--font-mono)" text-anchor="end">80 % Terskel</text>

      ${paretoData.map((d, i) => {
        const x = padding.left + i * colW + 6;
        const bH = Math.max(2, chartH - (getYBar(d.absVar) - padding.top));
        const barColor = d.variance < 0 ? "#f43f5e" : "#10b981";
        return `
          <rect x="${x}" y="${getYBar(d.absVar)}" width="${colW - 12}" height="${bH}" fill="${barColor}" opacity="0.8" rx="2" />
          <text x="${x + (colW - 12)/2}" y="${height - 12}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${d.code}</text>
          <text x="${x + (colW - 12)/2}" y="${getYBar(d.absVar) - 4}" fill="${barColor}" font-size="9" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">${formatNok(d.absVar, 0)}</text>
        `;
      }).join("")}

      <polyline points="${paretoData.map((d, i) => `${padding.left + i * colW + colW/2},${getYPct(d.cumPct)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2.5" />
      ${paretoData.map((d, i) => `
        <circle cx="${padding.left + i * colW + colW/2}" cy="${getYPct(d.cumPct)}" r="4" fill="#38bdf8" />
        <text x="${padding.left + i * colW + colW/2}" y="${getYPct(d.cumPct) - 6}" fill="#38bdf8" font-size="9" font-family="var(--font-mono)" font-weight="600" text-anchor="middle">${d.cumPct.toFixed(0)}%</text>
      `).join("")}
    </svg>
  `;
}

// 7k. Visual 11: Korrelasjon (p_ft02) – 100 % dynamisk fra filtrerte månedsdata
function renderCorrelationChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const hasVikarOvertid = aggs.monthly.some(m => m.overtidActual > 0 || m.vikarActual > 0);
  const points = aggs.monthly.map(m => ({
    m: m.month.split(" ")[0],
    xVal: hasVikarOvertid ? m.overtidActual : Math.abs(m.budget),
    yVal: hasVikarOvertid ? m.vikarActual : Math.abs(m.actual)
  }));

  const xAxisLabel = hasVikarOvertid ? "Overtid Art 104000 (kNOK) →" : "Månedlig Budsjett (kNOK) →";
  const yAxisLabel = hasVikarOvertid ? "↑ Vikar & Innleie (kNOK)" : "↑ Månedlig Regnskap (kNOK)";

  const maxX = Math.max(10, ...points.map(p => p.xVal)) * 1.15;
  const maxY = Math.max(10, ...points.map(p => p.yVal)) * 1.15;
  const getX = (x) => padding.left + (x / maxX) * chartW;
  const getY = (y) => padding.top + chartH - (y / maxY) * chartH;

  // Lineær regresjon på de faktiske punktene
  const n = points.length;
  const meanX = points.reduce((s, p) => s + p.xVal, 0) / Math.max(1, n);
  const meanY = points.reduce((s, p) => s + p.yVal, 0) / Math.max(1, n);
  let num = 0, denX = 0, denY = 0;
  points.forEach(p => {
    num += (p.xVal - meanX) * (p.yVal - meanY);
    denX += (p.xVal - meanX) ** 2;
    denY += (p.yVal - meanY) ** 2;
  });
  const slope = denX > 0 ? num / denX : 0;
  const intercept = meanY - slope * meanX;
  const r2 = (denX > 0 && denY > 0) ? (num ** 2) / (denX * denY) : 0;

  const xMin = Math.min(...points.map(p => p.xVal));
  const xMax = Math.max(...points.map(p => p.xVal));
  const yStart = Math.max(0, Math.min(maxY, intercept + slope * xMin));
  const yEnd = Math.max(0, Math.min(maxY, intercept + slope * xMax));

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <line x1="${padding.left}" y1="${padding.top + chartH}" x2="${padding.left + chartW}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="1.5" />
      <line x1="${padding.left}" y1="${padding.top}" x2="${padding.left}" y2="${padding.top + chartH}" stroke="var(--border-prominent)" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${padding.top + chartH + 24}" fill="var(--text-secondary)" font-size="10" font-family="var(--font-mono)" text-anchor="end">${xAxisLabel}</text>
      <text x="${padding.left}" y="${padding.top - 10}" fill="var(--text-secondary)" font-size="10" font-family="var(--font-mono)">${yAxisLabel}</text>

      <line x1="${getX(xMin)}" y1="${getY(yStart)}" x2="${getX(xMax)}" y2="${getY(yEnd)}" stroke="#f43f5e" stroke-dasharray="4,4" stroke-width="2" />
      <text x="${getX(xMax) + 8}" y="${getY(yEnd)}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" font-weight="600">R² = ${r2.toFixed(2)}</text>

      ${points.map(p => `
        <circle cx="${getX(p.xVal)}" cy="${getY(p.yVal)}" r="5.5" fill="#38bdf8" stroke="#0f172a" stroke-width="1.5" />
        <text x="${getX(p.xVal) + 8}" y="${getY(p.yVal) + 4}" fill="var(--text-muted)" font-size="9" font-family="var(--font-mono)">${p.m} (${formatNok(p.yVal, 0)}k)</text>
      `).join("")}
    </svg>
  `;
}

// 7l. Visual 12: Fordeling & Spredning Boxplot (p_ft04) – Beregnet fra faktiske månedstall
function renderDistributionChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = (aggs.functions.length > 1 ? aggs.functions : aggs.drivers).slice(0, 5);
  if (items.length === 0) return;

  const statsList = items.map(item => {
    const vals = item.monthlyActuals.slice(0, aggs.targetM).map(v => Math.abs(v)).sort((a, b) => a - b);
    const min = vals[0] || 0;
    const max = vals[vals.length - 1] || 0;
    const q1 = vals[Math.floor((vals.length - 1) * 0.25)] || min;
    const med = vals[Math.floor((vals.length - 1) * 0.5)] || min;
    const q3 = vals[Math.floor((vals.length - 1) * 0.75)] || max;
    return { name: item.name, code: item.code, min, q1, med, q3, max };
  });

  const globalMax = Math.max(50, ...statsList.map(s => s.max)) * 1.15;
  const leftAxis = padding.left + 145;
  const plotW = chartW - 145;
  const getX = (v) => leftAxis + (v / globalMax) * plotW;
  const rowH = chartH / statsList.length;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${statsList.map((s, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const xMin = getX(s.min);
        const xQ1 = getX(s.q1);
        const xMed = getX(s.med);
        const xQ3 = Math.max(xQ1 + 4, getX(s.q3));
        const xMax = Math.max(xQ3, getX(s.max));

        return `
          <text x="${leftAxis - 10}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">${s.name.substring(0, 18)}</text>
          <line x1="${xMin}" y1="${yCenter}" x2="${xMax}" y2="${yCenter}" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="${xMin}" y1="${yCenter - 6}" x2="${xMin}" y2="${yCenter + 6}" stroke="#94a3b8" stroke-width="1.5" />
          <line x1="${xMax}" y1="${yCenter - 6}" x2="${xMax}" y2="${yCenter + 6}" stroke="#94a3b8" stroke-width="1.5" />
          <rect x="${xQ1}" y="${yCenter - 10}" width="${xQ3 - xQ1}" height="20" fill="rgba(56, 189, 248, 0.22)" stroke="#38bdf8" stroke-width="1.5" rx="2" />
          <line x1="${xMed}" y1="${yCenter - 10}" x2="${xMed}" y2="${yCenter + 10}" stroke="#f43f5e" stroke-width="2.5" />
          <text x="${xMax + 8}" y="${yCenter + 4}" fill="var(--text-muted)" font-size="9.5" font-family="var(--font-mono)">Med: ${formatNok(s.med, 0)}k</text>
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

  const maxVal = Math.max(100, ...data.map(d => Math.max(Math.abs(d.b), Math.abs(d.a)))) * 1.15;
  const getX = (i) => padding.left + (data.length === 1 ? chartW / 2 : (i / Math.max(1, data.length - 1)) * chartW);
  const getY = (v) => padding.top + chartH - (Math.abs(v) / maxVal) * chartH;

  let steppedPts = "";
  data.forEach((d, i) => {
    const x = getX(i);
    const y = getY(d.b);
    if (i === 0) {
      steppedPts += `${x},${y}`;
    } else {
      const prevY = getY(data[i - 1].b);
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
  const items = (aggs.functions.length > 1 ? aggs.functions : aggs.drivers).slice(0, 5);
  if (items.length === 0) return;

  const rowH = chartH / items.length;
  const maxVal = Math.max(50, ...items.map(f => Math.max(Math.abs(f.budget), Math.abs(f.actual)))) * 1.2;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${items.map((f, i) => {
        const yTop = padding.top + i * rowH + 6;
        const bW = (Math.abs(f.budget) / maxVal) * (chartW - 140);
        const aW = (Math.abs(f.actual) / maxVal) * (chartW - 140);
        const color = f.variance < 0 ? "#f43f5e" : "#10b981";

        return `
          <text x="${padding.left + 130}" y="${yTop + 12}" fill="var(--text-primary)" font-size="11" text-anchor="end">${f.name.substring(0, 18)}</text>
          <rect x="${padding.left + 140}" y="${yTop}" width="${bW}" height="9" fill="#64748b" opacity="0.6" rx="2" />
          <rect x="${padding.left + 140}" y="${yTop + 11}" width="${aW}" height="9" fill="${color}" rx="2" />
          <text x="${padding.left + 140 + Math.max(bW, aW) + 8}" y="${yTop + 15}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600">${formatNok(f.actual, 0)} k</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7o. Visual 15: Treemap (p_ft07)
function renderTreemapChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = (aggs.categories.length > 1 ? aggs.categories : aggs.drivers).slice(0, 4);
  if (items.length === 0) return;

  const totalA = Math.max(1, items.reduce((s, c) => s + Math.abs(c.actual), 0));
  const colorsList = ["#0284c7", "#38bdf8", "#f43f5e", "#10b981"];

  let curX = padding.left;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${items.map((c, i) => {
        const w = Math.max(28, (Math.abs(c.actual) / totalA) * chartW);
        const pct = ((Math.abs(c.actual) / totalA) * 100).toFixed(1);
        const x = curX;
        curX += w;

        return `
          <rect x="${x}" y="${padding.top}" width="${Math.max(4, w - 4)}" height="${chartH}" fill="${colorsList[i % colorsList.length]}" opacity="0.85" rx="3" />
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

  // Vekting tilpasset sektor (Helse har høyere tyngde i Vågsbygd/Grim omsorgsboliger, Oppvekst mer jevnt etter elevtall)
  const weights = activeFilters.sector === "Helse og Omsorg"
    ? [35, 30, 19, 16]
    : activeFilters.sector === "Oppvekst og Utdanning"
      ? [30, 26, 25, 19]
      : [32, 28, 22, 18];

  const zones = [
    { name: "Vågsbygd Sone", pct: weights[0], k: aggs.totalActual * (weights[0] / 100), v: aggs.totalVariance * (weights[0] / 100) },
    { name: "Grim & Lund Sone", pct: weights[1], k: aggs.totalActual * (weights[1] / 100), v: aggs.totalVariance * (weights[1] / 100) },
    { name: "Randesund Sone", pct: weights[2], k: aggs.totalActual * (weights[2] / 100), v: aggs.totalVariance * (weights[2] / 100) },
    { name: "Torridal Sone", pct: weights[3], k: aggs.totalActual * (weights[3] / 100), v: aggs.totalVariance * (weights[3] / 100) }
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
          <text x="${padding.left + 130 + barW + 8}" y="${y + 4}" fill="#38bdf8" font-size="10" font-family="var(--font-mono)" font-weight="600">${z.pct} % (${formatNok(z.k, 0)} k • Avvik: ${formatNok(z.v, 0)} k)</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7q. Visual 17: Ressursallokeringsflyt (p_ft09) – Dynamisk basert på aktive filtre
function renderFlowChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const x1 = padding.left + 20;
  const x2 = padding.left + chartW * 0.45;
  const x3 = padding.left + chartW - 50;

  const totalA = Math.max(1, Math.abs(aggs.totalActual));
  const oppPct = Math.round((Math.abs(aggs.oppvekstActual) / totalA) * 100);
  const helPct = Math.round((Math.abs(aggs.helseActual) / totalA) * 100);
  const topCats = aggs.categories.slice(0, 3);

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <rect x="${x1}" y="${padding.top + 20}" width="90" height="95" fill="#64748b" rx="4" />
      <text x="${x1 + 45}" y="${padding.top + 58}" fill="#ffffff" font-size="10" font-weight="600" text-anchor="middle">Budsjettramme</text>
      <text x="${x1 + 45}" y="${padding.top + 76}" fill="#e2e8f0" font-size="9.5" font-family="var(--font-mono)" text-anchor="middle">${formatNok(aggs.totalBudget, 0)} k</text>

      <path d="M ${x1 + 90} ${padding.top + 50} C ${x2 - 30} ${padding.top + 50}, ${x2 - 30} ${padding.top + 25}, ${x2} ${padding.top + 25}" fill="none" stroke="#0284c7" stroke-width="${Math.max(2, oppPct / 10)}" opacity="0.7" />
      <path d="M ${x1 + 90} ${padding.top + 85} C ${x2 - 30} ${padding.top + 85}, ${x2 - 30} ${padding.top + 105}, ${x2} ${padding.top + 105}" fill="none" stroke="#38bdf8" stroke-width="${Math.max(2, helPct / 10)}" opacity="0.7" />

      <rect x="${x2}" y="${padding.top + 5}" width="105" height="42" fill="#0284c7" rx="3" />
      <text x="${x2 + 52}" y="${padding.top + 23}" fill="#ffffff" font-size="10" font-weight="600" text-anchor="middle">Oppvekst (${oppPct}%)</text>
      <text x="${x2 + 52}" y="${padding.top + 38}" fill="#e2e8f0" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(aggs.oppvekstActual, 0)} k</text>

      <rect x="${x2}" y="${padding.top + 85}" width="105" height="42" fill="#38bdf8" rx="3" />
      <text x="${x2 + 52}" y="${padding.top + 103}" fill="#0f172a" font-size="10" font-weight="600" text-anchor="middle">Helse (${helPct}%)</text>
      <text x="${x2 + 52}" y="${padding.top + 118}" fill="#1e293b" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${formatNok(aggs.helseActual, 0)} k</text>

      ${topCats.map((c, idx) => {
        const yNode = padding.top + idx * 45 + 5;
        return `
          <path d="M ${x2 + 105} ${padding.top + 60} C ${x3 - 30} ${padding.top + 60}, ${x3 - 30} ${yNode + 16}, ${x3} ${yNode + 16}" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.45" />
          <rect x="${x3}" y="${yNode}" width="125" height="32" fill="var(--bg-surface-elevated)" stroke="var(--border-prominent)" rx="3" />
          <text x="${x3 + 62}" y="${yNode + 14}" fill="var(--text-primary)" font-size="9" font-weight="600" text-anchor="middle">${c.name.substring(0, 18)}</text>
          <text x="${x3 + 62}" y="${yNode + 26}" fill="var(--accent-cyan)" font-size="8.5" font-family="var(--font-mono)" text-anchor="middle">${formatNok(c.actual, 0)} k</text>
        `;
      }).join("")}
    </svg>
  `;
}

// 7r. Visual 18: Multi-Series Lines (p_time01) – 100 % dynamisk fra topp 3 drivere i utvalget
function renderLinesMultiChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const top3 = aggs.drivers.slice(0, 3);
  if (top3.length === 0) return;

  const N = aggs.monthly.length;
  const getX = (i) => padding.left + (N === 1 ? chartW / 2 : (i / Math.max(1, N - 1)) * chartW);
  const allVals = top3.flatMap(d => d.monthlyActuals.slice(0, aggs.targetM).map(v => Math.abs(v)));
  const maxVal = Math.max(10, ...allVals) * 1.15;
  const getY = (v) => padding.top + chartH - (Math.abs(v) / maxVal) * chartH;
  const colors = ["#38bdf8", "#f43f5e", "#f59e0b"];

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${top3.map((d, idx) => {
        const series = d.monthlyActuals.slice(0, aggs.targetM);
        const pts = series.map((v, i) => `${getX(i)},${getY(v)}`).join(" ");
        const lastVal = series[series.length - 1] || 0;
        const color = colors[idx % colors.length];
        return `
          <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.5" ${idx === 2 ? 'stroke-dasharray="3,3"' : ''} />
          <text x="${getX(N - 1) + 8}" y="${getY(lastVal) + 4}" fill="${color}" font-size="9.5" font-family="var(--font-mono)" font-weight="600">
            ${d.code}: ${formatNok(lastVal, 0)}k
          </text>
        `;
      }).join("")}

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

  const actuals = monthly.map(m => Math.abs(m.actual));
  const ma = actuals.map((v, i) => {
    if (i === 0) return v;
    if (i === 1) return (actuals[0] + actuals[1]) / 2;
    return (actuals[i] + actuals[i - 1] + actuals[i - 2]) / 3;
  });

  const maxVal = Math.max(10, ...actuals) * 1.2;
  const getX = (i) => padding.left + (actuals.length === 1 ? chartW / 2 : (i / Math.max(1, actuals.length - 1)) * chartW);
  const getY = (v) => padding.top + chartH - (v / maxVal) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <polyline points="${actuals.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,3" />
      <polyline points="${ma.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#0284c7" stroke-width="3" />
      ${ma.map((v, i) => `
        <circle cx="${getX(i)}" cy="${getY(v)}" r="4.5" fill="#0284c7" />
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${monthly[i].month.split(" ")[0]}</text>
      `).join("")}
      <text x="${getX(ma.length - 1) + 8}" y="${getY(ma[ma.length - 1]) + 4}" fill="#0284c7" font-size="10" font-family="var(--font-mono)" font-weight="600">
        3M MA: ${formatNok(ma[ma.length - 1])} k
      </text>
    </svg>
  `;
}

// 7t. Visual 20: Area Stream (p_time03) – 100 % dynamisk fra faktiske månedstall
function renderAreaStreamChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;
  const N = monthly.length;

  const getX = (i) => padding.left + (N === 1 ? chartW / 2 : (i / Math.max(1, N - 1)) * chartW);
  const oppvekstPct = monthly.map(m => {
    const tot = Math.abs(m.oppvekstActual) + Math.abs(m.helseActual);
    return tot > 0 ? (Math.abs(m.oppvekstActual) / tot) * 100 : (activeFilters.sector === "Oppvekst og Utdanning" ? 100 : 0);
  });

  let pathOppvekst = "";
  oppvekstPct.forEach((p, i) => {
    const x = getX(i);
    const y = padding.top + (1 - p / 100) * chartH;
    pathOppvekst += (i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`);
  });
  pathOppvekst += ` L ${getX(N - 1)} ${padding.top + chartH} L ${getX(0)} ${padding.top + chartH} Z`;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <rect x="${padding.left}" y="${padding.top}" width="${chartW}" height="${chartH}" fill="#38bdf8" opacity="0.35" />
      <path d="${pathOppvekst}" fill="#0284c7" opacity="0.82" />
      ${monthly.map((m, i) => `
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
        <text x="${getX(i)}" y="${padding.top + (1 - oppvekstPct[i] / 100) * chartH - 5}" fill="#ffffff" font-size="9" font-family="var(--font-mono)" text-anchor="middle">${oppvekstPct[i].toFixed(0)}%</text>
      `).join("")}
    </svg>
  `;
}

// 7u. Visual 21: Indexed Baseline Jan=100 (p_time04) – 100 % dynamisk fra filtrerte månedstall
function renderIndexedMomChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const monthly = aggs.monthly;
  const N = monthly.length;

  const baseTotal = Math.max(1, Math.abs(monthly[0]?.actual || 100));
  const totalIdx = monthly.map(m => (Math.abs(m.actual) / baseTotal) * 100);

  const topDriver = aggs.drivers[0];
  const driverRaw = topDriver ? topDriver.monthlyActuals.slice(0, aggs.targetM).map(v => Math.abs(v)) : totalIdx;
  const firstNonZero = driverRaw.find(v => v > 0.1) || 1;
  const driverIdx = driverRaw.map(v => (v / firstNonZero) * 100);

  const allIdx = [...totalIdx, ...driverIdx, 100];
  const minIdx = Math.max(0, Math.min(...allIdx) * 0.85);
  const maxIdx = Math.max(130, ...allIdx) * 1.1;
  const span = Math.max(20, maxIdx - minIdx);

  const getX = (i) => padding.left + (N === 1 ? chartW / 2 : (i / Math.max(1, N - 1)) * chartW);
  const getY = (v) => padding.top + chartH - ((v - minIdx) / span) * chartH;

  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      <line x1="${padding.left}" y1="${getY(100)}" x2="${padding.left + chartW}" y2="${getY(100)}" stroke="#64748b" stroke-dasharray="3,3" stroke-width="1.5" />
      <text x="${padding.left + chartW}" y="${getY(100) - 4}" fill="#64748b" font-size="10" font-family="var(--font-mono)" text-anchor="end">Basis = 100</text>

      <polyline points="${driverIdx.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#f43f5e" stroke-width="2.5" />
      <polyline points="${totalIdx.map((v, i) => `${getX(i)},${getY(v)}`).join(" ")}" fill="none" stroke="#38bdf8" stroke-width="2.5" />

      <text x="${getX(N - 1) + 6}" y="${getY(driverIdx[N - 1]) + 4}" fill="#f43f5e" font-size="10" font-family="var(--font-mono)" font-weight="600">
        Art ${topDriver ? topDriver.code : ''}: ${driverIdx[N - 1].toFixed(0)}
      </text>
      <text x="${getX(N - 1) + 6}" y="${getY(totalIdx[N - 1]) + 4}" fill="#38bdf8" font-size="10" font-family="var(--font-mono)">
        Total: ${totalIdx[N - 1].toFixed(0)}
      </text>
      ${monthly.map((m, i) => `
        <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
      `).join("")}
    </svg>
  `;
}

// 7v. Visual 22: Sparklines Grid (p_time09) – 100 % dynamisk fra faktiske månedstall per funksjon/konto
function renderSparklinesChart(container, aggs, width, height, padding) {
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const items = (aggs.functions.length > 1 ? aggs.functions : aggs.drivers).slice(0, 6);
  if (items.length === 0) return;

  const rowH = chartH / items.length;
  container.innerHTML = `
    <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
      ${items.map((f, i) => {
        const yCenter = padding.top + i * rowH + rowH / 2;
        const sparkW = 150;
        const sparkX = padding.left + chartW - sparkW - 110;
        const series = f.monthlyActuals.slice(0, aggs.targetM);
        const minV = Math.min(...series);
        const maxV = Math.max(...series);
        const span = Math.max(1, maxV - minV);

        const pts = series.map((v, idx) => {
          const px = sparkX + (series.length === 1 ? sparkW / 2 : (idx / (series.length - 1)) * sparkW);
          const py = yCenter + 9 - ((v - minV) / span) * 18;
          return `${px.toFixed(1)},${py.toFixed(1)}`;
        }).join(" ");

        const color = f.variance < 0 ? "#f43f5e" : "#10b981";
        return `
          <text x="${padding.left + 170}" y="${yCenter + 4}" fill="var(--text-primary)" font-size="11" text-anchor="end">${f.name.substring(0, 24)}</text>
          <polyline points="${pts}" fill="none" stroke="#38bdf8" stroke-width="2" />
          <text x="${padding.left + chartW}" y="${yCenter + 4}" fill="${color}" font-size="10" font-family="var(--font-mono)" font-weight="600" text-anchor="end">
            ${f.variance > 0 ? '+' : ''}${formatNok(f.variance)} k
          </text>
        `;
      }).join("")}
    </svg>
  `;
}

// 8. Rendrer Kostnadsdrivere i tabell (med dynamiske overskrifter, tfoot-totaler og klikk-for-å-filtrere)
function renderDriversTable() {
  const tbody = document.getElementById("drivers-table-body");
  const tfoot = document.getElementById("drivers-table-foot");
  const titleEl = document.getElementById("drivers-table-title");
  const subEl = document.getElementById("drivers-table-subtitle");
  if (!tbody || !latestAggregates) return;

  const periodLabel = getActivePeriodLabel();
  if (titleEl) {
    titleEl.innerText = `⚠️ Topp Kostnadsdrivere (${periodLabel})`;
  }
  if (subEl) {
    subEl.innerText = `De 8 største avvikspostene i ${getActiveContextSummary()} (kNOK) – Klikk rad for å filtrere kostnadskategori`;
  }

  const drivers = latestAggregates.drivers.slice(0, 8);
  if (drivers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Ingen avviksposter funnet for valgt utvalg.</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  const maxVar = Math.max(1, ...drivers.map(d => Math.abs(d.variance)));
  tbody.innerHTML = drivers.map(d => {
    const barWidth = Math.min(90, (Math.abs(d.variance) / maxVar) * 75);
    const isNeg = d.variance < 0;
    const color = isNeg ? "var(--variance-neg)" : "var(--variance-pos)";
    const sign = d.variance > 0 ? "+" : "";
    const isSelectedCat = activeFilters.category === d.cat;

    return `
      <tr class="clickable-row ${isSelectedCat ? 'active-filter-row' : ''}" data-cat="${d.cat}" title="Klikk for å filtrere på kategori: ${d.cat}">
        <td class="code">${d.code}</td>
        <td>
          <strong>${d.name}</strong>
          <div style="font-size:0.7rem; color:var(--text-muted);">${d.cat}</div>
        </td>
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

  if (tfoot) {
    const sumB = drivers.reduce((s, d) => s + d.budget, 0);
    const sumA = drivers.reduce((s, d) => s + d.actual, 0);
    const sumV = sumB - sumA;
    const vColor = sumV < 0 ? "var(--variance-neg)" : "var(--variance-pos)";
    tfoot.innerHTML = `
      <tr>
        <td colspan="3">Sum topp ${drivers.length} drivere (av totalt ${latestAggregates.drivers.length} kontoer)</td>
        <td class="num">${formatNok(sumB)}</td>
        <td class="num">${formatNok(sumA)}</td>
        <td class="num" style="color:${vColor};">${sumV > 0 ? '+' : ''}${formatNok(sumV)}</td>
      </tr>
    `;
  }

  tbody.querySelectorAll("tr.clickable-row").forEach(row => {
    row.addEventListener("click", () => {
      const cat = row.getAttribute("data-cat");
      if (!cat) return;
      activeFilters.category = activeFilters.category === cat ? "all" : cat;
      const catSel = document.getElementById("slicer-category");
      if (catSel) catSel.value = activeFilters.category;
      applyFilters();
    });
  });
}

// 9. Rendrer KOSTRA-Funksjoner i tabell (med dynamiske overskrifter, tfoot-totaler og klikk-for-å-filtrere)
function renderFunctionsTable() {
  const tbody = document.getElementById("functions-table-body");
  const tfoot = document.getElementById("functions-table-foot");
  const titleEl = document.getElementById("functions-table-title");
  const subEl = document.getElementById("functions-table-subtitle");
  if (!tbody || !latestAggregates) return;

  const periodLabel = getActivePeriodLabel();
  if (titleEl) {
    titleEl.innerText = `🏛️ KOSTRA Funksjonsfordeling (${periodLabel})`;
  }
  if (subEl) {
    subEl.innerText = `Driftsresultat per KOSTRA-funksjon 4-siffer i ${getActiveContextSummary()} (kNOK) – Klikk rad for å filtrere funksjon`;
  }

  const funcs = latestAggregates.functions;
  if (funcs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">Ingen funksjoner i aktivt filter.</td></tr>`;
    if (tfoot) tfoot.innerHTML = "";
    return;
  }

  tbody.innerHTML = funcs.map(f => {
    const isNeg = f.variance < 0;
    const color = isNeg ? "var(--variance-neg)" : "var(--variance-pos)";
    const sign = f.variance > 0 ? "+" : "";
    const isSelectedFunc = String(activeFilters.function) === String(f.code);

    return `
      <tr class="clickable-row ${isSelectedFunc ? 'active-filter-row' : ''}" data-func="${f.code}" title="Klikk for å filtrere på funksjon ${f.code}">
        <td class="code">${f.code}</td>
        <td><strong>${f.name}</strong></td>
        <td><span class="kpi-tag">${f.sector}</span></td>
        <td class="num">${formatNok(f.budget)}</td>
        <td class="num">${formatNok(f.actual)}</td>
        <td class="num" style="color:${color}; font-weight:600;">${sign}${formatNok(f.variance)}</td>
      </tr>
    `;
  }).join("");

  if (tfoot) {
    const sumB = latestAggregates.totalBudget;
    const sumA = latestAggregates.totalActual;
    const sumV = latestAggregates.totalVariance;
    const vColor = sumV < 0 ? "var(--variance-neg)" : "var(--variance-pos)";
    tfoot.innerHTML = `
      <tr>
        <td colspan="3">Totalt i aktivt utvalg (${funcs.length} funksjoner)</td>
        <td class="num">${formatNok(sumB)}</td>
        <td class="num">${formatNok(sumA)}</td>
        <td class="num" style="color:${vColor};">${sumV > 0 ? '+' : ''}${formatNok(sumV)}</td>
      </tr>
    `;
  }

  tbody.querySelectorAll("tr.clickable-row").forEach(row => {
    row.addEventListener("click", () => {
      const funcCode = row.getAttribute("data-func");
      if (!funcCode) return;
      activeFilters.function = String(activeFilters.function) === String(funcCode) ? "all" : String(funcCode);
      const funcSel = document.getElementById("slicer-function");
      if (funcSel) funcSel.value = activeFilters.function;
      applyFilters();
    });
  });
}

// 10. Reaktiv What-If Scenariosimulator basert på aktive Slicere
function updateWhatIfSimulator() {
  if (!latestAggregates) return;
  const aggs = latestAggregates;

  const vikarPct = parseFloat(document.getElementById("slider-vikar")?.value || 0);
  const overtidPct = parseFloat(document.getElementById("slider-overtid")?.value || 0);
  const omdispPct = parseFloat(document.getElementById("slider-omdisp")?.value || 0);

  const badgeVikar = document.getElementById("val-vikar");
  const badgeOvertid = document.getElementById("val-overtid");
  const badgeOmdisp = document.getElementById("val-omdisp");

  if (badgeVikar) badgeVikar.innerText = `${vikarPct} %`;
  if (badgeOvertid) badgeOvertid.innerText = `${overtidPct} %`;
  if (badgeOmdisp) badgeOmdisp.innerText = `${omdispPct} %`;

  const simSub = document.getElementById("sim-main-subtitle");
  if (simSub) {
    simSub.innerText = `Simuler tiltak for ${getActiveContextSummary()} før 31.12.2024`;
  }

  const d1 = aggs.primarySimDriver;
  const d2 = aggs.secondarySimDriver;
  const monthlyBase1 = aggs.vikarbyraMonthlyBase;
  const monthlyBase2 = aggs.overtidMonthlyBase;
  const monthlyBudgetBase = Math.max(0, aggs.ytdBudget / Math.max(1, aggs.targetM));

  const label1 = document.getElementById("sim-label-1");
  const label2 = document.getElementById("sim-label-2");
  const label3 = document.getElementById("sim-label-3");

  if (label1) {
    label1.innerText = `Reduksjon ${d1.name.substring(0, 22)} (Art ${d1.code} • ${formatNok(monthlyBase1, 1)} k/mnd)`;
  }
  if (label2) {
    label2.innerText = `Reduksjon ${d2.name.substring(0, 22)} (Art ${d2.code} • ${formatNok(monthlyBase2, 1)} k/mnd)`;
  }
  if (label3) {
    label3.innerText = `Generelt Rammekutt / Omdisponering (Ramme: ${formatNok(monthlyBudgetBase, 0)} k/mnd)`;
  }

  const save1 = (vikarPct / 100) * monthlyBase1;
  const save2 = (overtidPct / 100) * monthlyBase2;
  const save3 = (omdispPct / 100) * monthlyBudgetBase;

  const totalMonthlySavings = save1 + save2 + save3;
  const remainingMonths = Math.max(1, 12 - aggs.targetM);
  const totalRestarSavings = totalMonthlySavings * remainingMonths;

  const baselineEoyAvvik = aggs.projectedEoyVariance;
  const adjustedEoyAvvik = baselineEoyAvvik + totalRestarSavings;

  const elRestarLabel = document.getElementById("sim-restar-label");
  const elMonthlySave = document.getElementById("sim-monthly-save");
  const elRestarSave = document.getElementById("sim-restar-save");
  const elEoyResult = document.getElementById("sim-eoy-result");
  const elStatusBadge = document.getElementById("sim-status-badge");

  if (elRestarLabel) {
    elRestarLabel.innerText = `Restårsgevinst (${remainingMonths} gjenværende mnd):`;
  }
  if (elMonthlySave) elMonthlySave.innerText = `${formatNok(totalMonthlySavings)} kNOK`;
  if (elRestarSave) elRestarSave.innerText = `+${formatNok(totalRestarSavings)} kNOK`;

  if (elEoyResult) {
    const isPositive = adjustedEoyAvvik >= 0;
    elEoyResult.innerText = `${isPositive ? "+" : ""}${formatNok(adjustedEoyAvvik)} kNOK`;
    elEoyResult.style.color = isPositive ? "var(--variance-pos)" : "var(--variance-neg)";
  }

  if (elStatusBadge) {
    if (adjustedEoyAvvik >= 0) {
      elStatusBadge.className = "status-indicator pos";
      elStatusBadge.style.color = "";
      elStatusBadge.style.borderColor = "";
      elStatusBadge.innerHTML = `<span class="pulse-dot"></span> Balanse Gjenopprettet`;
    } else if (adjustedEoyAvvik > -Math.max(150, Math.abs(aggs.ytdBudget) * 0.03)) {
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

// 11. Dynamisk FAQ Accordion basert på aktivt filterutvalg
function renderFaqAccordion(aggs) {
  const container = document.getElementById("faq-list-container");
  const subEl = document.getElementById("faq-main-subtitle");
  if (!container || !aggs) return;

  const contextLabel = getActiveContextSummary();
  const periodLabel = getActivePeriodLabel();
  if (subEl) {
    subEl.innerText = `Dynamisk nøkkelinnsikt, KOSTRA-regler og prognoser oppdatert for: ${contextLabel}`;
  }

  const d1 = aggs.drivers[0] || { code: 101000, name: "Fastlønn - ordinære", variance: 0, actual: 0, budget: 0 };
  const d2 = aggs.drivers[1] || { code: 127040, name: "Kjøp av vikarbyråtjenester", variance: 0, actual: 0, budget: 0 };
  const f1 = aggs.functions[0] || { code: 2020, name: "Grunnskoler", variance: 0, actual: 0 };
  const isPos = aggs.totalVariance >= 0;

  const faqItems = [
    {
      q: `1. Hva forklarer ${isPos ? "mindreforbruket" : "merforbruket"} på ${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)} kNOK i ${contextLabel}?`,
      a: `
        <p>I <strong>${periodLabel}</strong> er periodisert budsjett <strong>${formatNok(aggs.totalBudget)} kNOK</strong> og faktisk regnskap <strong>${formatNok(aggs.totalActual)} kNOK</strong> (${aggs.totalSpendPct.toFixed(1)} % forbruksgrad). Hoveddriverne i utvalget er:</p>
        <ul>
          <li><strong>${d1.name} (Art ${d1.code}):</strong> Utgjør et avvik på <strong>${d1.variance > 0 ? "+" : ""}${formatNok(d1.variance)} kNOK</strong> (Regnskap: ${formatNok(d1.actual)} kNOK vs. Budsjett: ${formatNok(d1.budget)} kNOK).</li>
          <li><strong>${d2.name} (Art ${d2.code}):</strong> Utgjør <strong>${d2.variance > 0 ? "+" : ""}${formatNok(d2.variance)} kNOK</strong> i valgt periode, med størst utslag under <strong>${f1.name}</strong> (${formatNok(f1.variance)} kNOK).</li>
        </ul>
      `
    },
    {
      q: `2. Hvordan utvikler kostnadene seg måned-over-måned (MoM) og akkumulert YTD i dette utvalget?`,
      a: `
        <p><strong>MoM Endring (M0${aggs.targetM} vs M0${aggs.prevM}):</strong> Regnskapet i måned 0${aggs.targetM} utgjorde <strong>${formatNok(aggs.lastMonthActual)} kNOK</strong> mot <strong>${formatNok(aggs.prevMonthActual)} kNOK</strong> i forrige måned – en endring på <strong>${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK (${aggs.momActualPct >= 0 ? "+" : ""}${aggs.momActualPct.toFixed(1)} %)</strong>.</p>
        <p><strong>Akkumulert YTD (M01–M0${aggs.targetM}):</strong> Akkumulert avvik YTD er <strong>${aggs.ytdVariance > 0 ? "+" : ""}${formatNok(aggs.ytdVariance)} kNOK</strong> (${aggs.ytdSpendPct.toFixed(1)} % av YTD-budsjett på ${formatNok(aggs.ytdBudget)} kNOK).</p>
      `
    },
    {
      q: `3. Hva er forskjellen i forbruksmønster mellom Oppvekst og Helse i valgt periode (${periodLabel})?`,
      a: `
        <p><strong>Oppvekst og Utdanning:</strong> Regnskap <strong>${formatNok(aggs.oppvekstActual)} kNOK</strong> mot budsjett <strong>${formatNok(aggs.oppvekstBudget)} kNOK</strong> (Avvik: <strong>${aggs.oppvekstVariance > 0 ? "+" : ""}${formatNok(aggs.oppvekstVariance)} kNOK</strong>). Styres primært av fastlønnsoppgjør og sesongvariasjon rundt skoleåret.</p>
        <p><strong>Helse og Omsorg:</strong> Regnskap <strong>${formatNok(aggs.helseActual)} kNOK</strong> mot budsjett <strong>${formatNok(aggs.helseBudget)} kNOK</strong> (Avvik: <strong>${aggs.helseVariance > 0 ? "+" : ""}${formatNok(aggs.helseVariance)} kNOK</strong>). Drives av kontinuerlig 24/7 døgnturnus, vikarbyrå og turnustillegg.</p>
      `
    },
    {
      q: `4. Hva sier lovverket ved innsparingstiltak på ${d1.name.toLowerCase()} og vikar/overtid?`,
      a: `
        <p>Ethvert tiltak i <strong>${activeFilters.sector === "all" ? "kommunens sektorer" : activeFilters.sector}</strong> må skje innenfor tre ufravikelige juridiske rammer:</p>
        <ul>
          <li><strong>Opplæringsloven § 8-2 (Lærernorm):</strong> Setter absolutte krav til lærertetthet på 1.–4. trinn (maks 15 elever) og 5.–10. trinn (maks 20 elever).</li>
          <li><strong>Helse- og omsorgstjenesteloven § 4-1:</strong> Pålegger kommunen forsvarlige helse- og omsorgstjenester ved vikarreduksjon i institusjon (funksjon 2540).</li>
          <li><strong>Arbeidsmiljøloven § 10-6:</strong> Begrenser overtidsarbeid til maks 10 timer pr. 7 dager / 200 timer pr. år.</li>
        </ul>
      `
    },
    {
      q: `5. Hva er prognosert årssluttavvik (EAC) for utvalget, og hvordan kobles dataene til Power BI / Excel?`,
      a: `
        <p>Basert på gjeldende run-rate fra M01–M0${aggs.targetM} er prognosert årssluttavvik (EAC) for <strong>${contextLabel}</strong> beregnet til <strong>${aggs.projectedEoyVariance > 0 ? "+" : ""}${formatNok(aggs.projectedEoyVariance)} kNOK</strong> før nye tiltak i What-If simulatoren.</p>
        <ul>
          <li><strong>Power BI Prosjekt:</strong> Åpne <code>pbi-rep-project.pbip</code> for direkte tilgang til TMDL-modellen og DAX-måltallene.</li>
          <li><strong>DuckDB & Excel:</strong> Kjør <code>.\\run.ps1 -BuildDB</code> og <code>.\\run.ps1 -ExportExcel</code> for å oppdatere OLAP-kuben med de ${aggs.recordCount} filtrerte radene.</li>
        </ul>
      `
    }
  ];

  container.innerHTML = faqItems.map((item, idx) => `
    <div class="faq-item ${idx === 0 ? 'open' : ''}">
      <button class="faq-question" aria-expanded="${idx === 0 ? 'true' : 'false'}">
        <span>${item.q}</span>
        <span class="faq-chevron">+</span>
      </button>
      <div class="faq-answer">
        ${item.a}
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const parent = btn.closest(".faq-item");
      if (!parent) return;
      const isOpen = parent.classList.toggle("open");
      btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  });
}

// 12. Power BI 25-Siders Rapportkatalog Filter & Render (med live nøkkeltall fra aktivt filter)
function getPageLiveMetricText(pageId, aggs) {
  if (!aggs) return "";
  const d1 = aggs.drivers[0];
  switch (pageId) {
    case "p01": return `Avvik: ${aggs.totalVariance > 0 ? '+' : ''}${formatNok(aggs.totalVariance)} k (${aggs.totalSpendPct.toFixed(1)}%)`;
    case "p02": return `Oppvekst: ${formatNok(aggs.oppvekstActual, 0)} k (Avvik ${formatNok(aggs.oppvekstVariance, 0)} k)`;
    case "p03": return `Helse: ${formatNok(aggs.helseActual, 0)} k (Avvik ${formatNok(aggs.helseVariance, 0)} k)`;
    case "p04": return `YTD Regnskap: ${formatNok(aggs.ytdActual, 0)} k vs Bud ${formatNok(aggs.ytdBudget, 0)} k`;
    case "p05": return d1 ? `Toppdriver: Art ${d1.code} (${formatNok(d1.variance, 0)} k)` : `Kontoer: ${aggs.drivers.length}`;
    case "p06": return `EAC Prognose: ${formatNok(aggs.projectedEoyVariance, 0)} kNOK`;
    default:
      return `${getActivePeriodLabel()} • Regnskap: ${formatNok(aggs.totalActual, 0)} k (${aggs.recordCount} rader)`;
  }
}

function renderCatalog(filterCat = currentCatalogFilter) {
  currentCatalogFilter = filterCat;
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const filtered = filterCat === "all"
    ? REPORT_PAGES
    : REPORT_PAGES.filter(p => p.cat === filterCat);

  grid.innerHTML = filtered.map(p => {
    const targetMode = PAGE_TO_MODE[p.id] || "scurve";
    const isActive = p.id === activePageId;
    const liveMetric = getPageLiveMetricText(p.id, latestAggregates);

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
        <div class="card-live-metric">
          <span>⚡ Live filter:</span>
          <strong>${liveMetric}</strong>
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

  grid.querySelectorAll(".report-page-card").forEach(card => {
    card.addEventListener("click", () => {
      const mode = card.getAttribute("data-target-mode");
      const pageId = card.getAttribute("data-page-id");
      if (mode) {
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

// 13. Skift aktiv visualisering
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

  document.querySelectorAll(".report-page-card").forEach(card => {
    if (card.getAttribute("data-page-id") === activePageId) {
      card.classList.add("active-visual");
    } else {
      card.classList.remove("active-visual");
    }
  });

  renderSvgChart();
}

// 14. Hovedfunksjon for å anvende aktive filtre og trigge tverrgående oppdatering på hele siden
function applyFilters() {
  syncSlicerOptions();
  const filtered = getFilteredRecords();
  latestAggregates = calculateAggregates(filtered);

  const totalRecords = typeof KOSTRA_RECORDS !== "undefined" ? KOSTRA_RECORDS.length : 827;
  updateFilterContextBar(totalRecords, latestAggregates.recordCount);
  updateKpiCards(latestAggregates);
  renderEarlyWarnings(latestAggregates);
  renderSvgChart();
  renderDriversTable();
  renderFunctionsTable();
  updateWhatIfSimulator();
  renderCatalog(currentCatalogFilter);
  renderFaqAccordion(latestAggregates);
  updateChatbotContextWelcome(latestAggregates);
}

// 15. Theme Switcher (Dark / Light)
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
      if (latestAggregates) updateKpiCards(latestAggregates);
    });
  }
}

// 16. Copy CLI Commands
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

// 17. Event Listeners og DOM Oppstart
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSlicers();
  initCopyButtons();

  // Kjør første gangs filter og full dynamisk rendering
  applyFilters();

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

  document.querySelectorAll(".catalog-tabs .tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".catalog-tabs .tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter") || "all";
      renderCatalog(filter);
    });
  });

  document.querySelectorAll("#chart-view-selector button").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.getAttribute("data-mode");
      if (mode) setChartMode(mode);
    });
  });

  ["slider-vikar", "slider-overtid", "slider-omdisp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateWhatIfSimulator);
  });

  window.addEventListener("resize", () => {
    if (latestAggregates) renderSvgChart();
  });

  initAiProviderManager();
  initChatbot();
});

// ==========================================================================
// 18. AI Provider Configuration & Multi-LLM Integration Engine
// ==========================================================================

const AI_PROVIDERS = {
  gemini: {
    name: "Google Gemini",
    defaultModel: "gemini-1.5-flash",
    type: "cloud",
    typeLabel: "Skytjeneste (Google AI)",
    keyPlaceholder: "AIzaSy...",
    keyLink: "https://aistudio.google.com/app/apikey",
    hint: "Google Gemini 1.5 Flash gir lynrask, kostnadseffektiv og presis analyse.",
    requiresKey: true
  },
  openai: {
    name: "OpenAI",
    defaultModel: "gpt-4o-mini",
    type: "cloud",
    typeLabel: "Skytjeneste (OpenAI)",
    keyPlaceholder: "sk-proj-...",
    keyLink: "https://platform.openai.com/api-keys",
    hint: "GPT-4o-mini eller GPT-4o for avansert resonnering og analyse.",
    requiresKey: true
  },
  anthropic: {
    name: "Anthropic Claude",
    defaultModel: "claude-3-5-sonnet-20241022",
    type: "cloud",
    typeLabel: "Skytjeneste (Anthropic)",
    keyPlaceholder: "sk-ant-...",
    keyLink: "https://console.anthropic.com/settings/keys",
    hint: "Claude 3.5 Sonnet for dype forklaringer og controller-rapportering.",
    requiresKey: true
  },
  ollama: {
    name: "Ollama (Lokal LLM)",
    defaultModel: "llama3:latest",
    type: "local",
    typeLabel: "Lokal LLM (Privat & Gratis)",
    defaultEndpoint: "http://localhost:11434",
    hint: "100 % lokal inferens på maskinen din. Null data sendes ut. Krever ingen API-nøkkel.",
    requiresKey: false
  },
  groq: {
    name: "Groq",
    defaultModel: "llama-3.1-70b-versatile",
    type: "cloud",
    typeLabel: "Skytjeneste (Groq LPU)",
    keyPlaceholder: "gsk_...",
    keyLink: "https://console.groq.com/keys",
    hint: "Groq LPU leverer tilnærmet umiddelbare svar med Llama 3.1 70B.",
    requiresKey: true
  },
  mistral: {
    name: "Mistral AI",
    defaultModel: "mistral-large-latest",
    type: "cloud",
    typeLabel: "Skytjeneste (Mistral)",
    keyPlaceholder: "...",
    keyLink: "https://console.mistral.ai/api-keys",
    hint: "Europeisk AI-plattform med Mistral Large eller Codestral.",
    requiresKey: true
  },
  deepseek: {
    name: "DeepSeek",
    defaultModel: "deepseek-chat",
    type: "cloud",
    typeLabel: "Skytjeneste (DeepSeek)",
    keyPlaceholder: "sk-...",
    keyLink: "https://platform.deepseek.com/api_keys",
    hint: "DeepSeek-V3 for analytiske beregninger og resonnering.",
    requiresKey: true
  },
  offline: {
    name: "Innebygd Controller",
    defaultModel: "rule-based-v2",
    type: "offline",
    typeLabel: "Regelbasert (Offline)",
    hint: "Innebygd controller-logikk og KOSTRA-analyse uten eksterne API-kall.",
    requiresKey: false
  }
};

function getAiSettings() {
  const defaultSettings = {
    activeProvider: "gemini",
    providers: {
      gemini: { key: "", model: "gemini-1.5-flash", endpoint: "" },
      openai: { key: "", model: "gpt-4o-mini", endpoint: "" },
      anthropic: { key: "", model: "claude-3-5-sonnet-20241022", endpoint: "" },
      ollama: { key: "", model: "llama3:latest", endpoint: "http://localhost:11434" },
      groq: { key: "", model: "llama-3.1-70b-versatile", endpoint: "" },
      mistral: { key: "", model: "mistral-large-latest", endpoint: "" },
      deepseek: { key: "", model: "deepseek-chat", endpoint: "" },
      offline: { key: "", model: "rule-based-v2", endpoint: "" }
    }
  };

  try {
    const raw = localStorage.getItem("kostra_ai_settings");
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      activeProvider: parsed.activeProvider || defaultSettings.activeProvider,
      providers: { ...defaultSettings.providers, ...(parsed.providers || {}) }
    };
  } catch (e) {
    return defaultSettings;
  }
}

function saveAiSettings(settings) {
  try {
    localStorage.setItem("kostra_ai_settings", JSON.stringify(settings));
  } catch (e) {
    console.error("Feil ved lagring av AI-innstillinger", e);
  }
  updateAiUIState();
}

function updateAiUIState() {
  const settings = getAiSettings();
  const activeId = settings.activeProvider || "gemini";
  const providerMeta = AI_PROVIDERS[activeId] || AI_PROVIDERS.gemini;
  const currentProviderConfig = settings.providers[activeId] || {};
  const hasKey = !providerMeta.requiresKey || !!(currentProviderConfig.key && currentProviderConfig.key.trim().length > 0);

  const topLabel = document.getElementById("top-ai-provider-label");
  const topDot = document.getElementById("top-ai-dot");
  if (topLabel) {
    const shortName = activeId === "offline" ? "Offline" : providerMeta.name.replace("Google ", "").replace(" (Lokal LLM)", "");
    topLabel.innerText = `🤖 AI: ${shortName}`;
  }
  if (topDot) {
    topDot.className = "ai-provider-dot " + (hasKey ? "active" : "missing");
  }

  const chatQuickSelect = document.getElementById("chat-quick-provider");
  if (chatQuickSelect && chatQuickSelect.value !== activeId) {
    chatQuickSelect.value = activeId;
  }
  const chatStatusDot = document.getElementById("chat-provider-status-dot");
  const chatKeyBadge = document.getElementById("chat-key-badge-text");
  if (chatStatusDot && chatKeyBadge) {
    if (!providerMeta.requiresKey) {
      chatStatusDot.className = "provider-status-dot offline";
      chatKeyBadge.innerText = activeId === "ollama" ? "Lokal LLM" : "Offline";
    } else if (hasKey) {
      chatStatusDot.className = "provider-status-dot active";
      chatKeyBadge.innerText = "Aktiv nøkkel";
    } else {
      chatStatusDot.className = "provider-status-dot missing";
      chatKeyBadge.innerText = "Mangler nøkkel";
    }
  }

  const modalSelect = document.getElementById("modal-ai-provider-select");
  if (modalSelect && modalSelect.value !== activeId) {
    modalSelect.value = activeId;
  }
  syncModalFieldsToProvider(activeId);
}

function syncModalFieldsToProvider(providerId) {
  const settings = getAiSettings();
  const providerMeta = AI_PROVIDERS[providerId] || AI_PROVIDERS.gemini;
  const config = settings.providers[providerId] || {};

  const modelInput = document.getElementById("modal-ai-model-input");
  const keyInput = document.getElementById("modal-ai-key-input");
  const keyGroup = document.getElementById("modal-key-group");
  const endpointGroup = document.getElementById("modal-endpoint-group");
  const endpointInput = document.getElementById("modal-ai-endpoint-input");
  const tagPill = document.getElementById("modal-provider-tag");
  const keyLink = document.getElementById("modal-key-link");
  const keyHelp = document.getElementById("modal-key-help");

  if (modelInput) modelInput.value = config.model || providerMeta.defaultModel || "";
  if (keyInput) {
    keyInput.value = config.key || "";
    keyInput.placeholder = providerMeta.keyPlaceholder || "Skriv inn API-nøkkel...";
  }
  if (tagPill) tagPill.innerText = providerMeta.typeLabel;

  if (keyLink) {
    if (providerMeta.keyLink) {
      keyLink.href = providerMeta.keyLink;
      keyLink.style.display = "inline";
    } else {
      keyLink.style.display = "none";
    }
  }

  if (keyHelp) keyHelp.innerText = providerMeta.hint || "";

  if (providerId === "ollama") {
    if (keyGroup) keyGroup.style.display = "none";
    if (endpointGroup) endpointGroup.style.display = "flex";
    if (endpointInput) endpointInput.value = config.endpoint || providerMeta.defaultEndpoint || "http://localhost:11434";
  } else if (providerId === "offline") {
    if (keyGroup) keyGroup.style.display = "none";
    if (endpointGroup) endpointGroup.style.display = "none";
  } else {
    if (keyGroup) keyGroup.style.display = "flex";
    if (endpointGroup) endpointGroup.style.display = "none";
  }
}

function initAiProviderManager() {
  const openModalBtn = document.getElementById("btn-open-ai-modal");
  const chatOpenModalBtn = document.getElementById("chat-open-modal-btn");
  const closeModalBtn = document.getElementById("btn-close-ai-modal");
  const modal = document.getElementById("ai-settings-modal");
  const modalSelect = document.getElementById("modal-ai-provider-select");
  const modalSaveBtn = document.getElementById("btn-save-modal-config");
  const modalClearBtn = document.getElementById("btn-clear-modal-key");
  const modalTestBtn = document.getElementById("btn-test-modal-connection");
  const modalToggleEye = document.getElementById("modal-toggle-key-eye");
  const modalFeedback = document.getElementById("modal-test-feedback");

  const chatQuickSelect = document.getElementById("chat-quick-provider");
  const chatToggleKeyDrawer = document.getElementById("chat-toggle-key-drawer");
  const chatInlineDrawer = document.getElementById("chat-inline-key-drawer");
  const chatInlineInput = document.getElementById("chat-inline-key-input");
  const chatSaveKeyBtn = document.getElementById("chat-save-key-btn");
  const chatToggleEye = document.getElementById("chat-toggle-key-eye");

  const insightAiBtn = document.getElementById("btn-generate-ai-insight");

  const openModal = () => {
    if (!modal) return;
    const settings = getAiSettings();
    modal.classList.remove("hidden");
    if (modalSelect) modalSelect.value = settings.activeProvider;
    syncModalFieldsToProvider(settings.activeProvider);
    if (modalFeedback) {
      modalFeedback.className = "ai-feedback-box hidden";
      modalFeedback.innerText = "";
    }
  };

  const closeModal = () => {
    if (modal) modal.classList.add("hidden");
  };

  openModalBtn?.addEventListener("click", openModal);
  chatOpenModalBtn?.addEventListener("click", openModal);
  closeModalBtn?.addEventListener("click", closeModal);

  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  modalSelect?.addEventListener("change", (e) => {
    syncModalFieldsToProvider(e.target.value);
  });

  modalToggleEye?.addEventListener("click", () => {
    const keyInput = document.getElementById("modal-ai-key-input");
    if (!keyInput) return;
    keyInput.type = keyInput.type === "password" ? "text" : "password";
  });

  modalSaveBtn?.addEventListener("click", () => {
    const settings = getAiSettings();
    const providerId = modalSelect ? modalSelect.value : "gemini";
    const modelInput = document.getElementById("modal-ai-model-input");
    const keyInput = document.getElementById("modal-ai-key-input");
    const endpointInput = document.getElementById("modal-ai-endpoint-input");

    settings.activeProvider = providerId;
    if (!settings.providers[providerId]) settings.providers[providerId] = {};
    if (modelInput) settings.providers[providerId].model = modelInput.value.trim();
    if (keyInput) settings.providers[providerId].key = keyInput.value.trim();
    if (endpointInput) settings.providers[providerId].endpoint = endpointInput.value.trim();

    saveAiSettings(settings);

    if (modalFeedback) {
      modalFeedback.className = "ai-feedback-box success";
      modalFeedback.innerText = `✓ Innstillinger for ${AI_PROVIDERS[providerId]?.name || providerId} er lagret lokalt!`;
    }

    setTimeout(() => {
      closeModal();
    }, 900);
  });

  modalClearBtn?.addEventListener("click", () => {
    const settings = getAiSettings();
    const providerId = modalSelect ? modalSelect.value : "gemini";
    if (settings.providers[providerId]) {
      settings.providers[providerId].key = "";
    }
    const keyInput = document.getElementById("modal-ai-key-input");
    if (keyInput) keyInput.value = "";
    saveAiSettings(settings);

    if (modalFeedback) {
      modalFeedback.className = "ai-feedback-box success";
      modalFeedback.innerText = `✓ API-nøkkel for ${AI_PROVIDERS[providerId]?.name} ble slettet.`;
    }
  });

  modalTestBtn?.addEventListener("click", async () => {
    if (!modalFeedback) return;
    const providerId = modalSelect ? modalSelect.value : "gemini";
    const modelInput = document.getElementById("modal-ai-model-input");
    const keyInput = document.getElementById("modal-ai-key-input");
    const endpointInput = document.getElementById("modal-ai-endpoint-input");

    const key = keyInput ? keyInput.value.trim() : "";
    const model = modelInput ? modelInput.value.trim() : "";
    const endpoint = endpointInput ? endpointInput.value.trim() : "";

    modalFeedback.className = "ai-feedback-box loading";
    modalFeedback.innerText = `⏳ Tester tilkobling mot ${AI_PROVIDERS[providerId]?.name}...`;

    try {
      const reply = await executeAiCall({
        provider: providerId,
        key: key,
        model: model,
        endpoint: endpoint,
        prompt: "Svar med nøyaktig ett ord: 'Tilkobling_OK'",
        contextText: "Testkall"
      });
      modalFeedback.className = "ai-feedback-box success";
      modalFeedback.innerText = `✓ Tilkobling vellykket mot ${AI_PROVIDERS[providerId]?.name}! Respons: ${reply.slice(0, 80)}`;
    } catch (err) {
      modalFeedback.className = "ai-feedback-box error";
      modalFeedback.innerText = `✕ Kunne ikke koble til ${AI_PROVIDERS[providerId]?.name}: ${err.message}`;
    }
  });

  chatQuickSelect?.addEventListener("change", (e) => {
    const settings = getAiSettings();
    settings.activeProvider = e.target.value;
    saveAiSettings(settings);

    if (chatInlineInput) {
      const provConfig = settings.providers[e.target.value] || {};
      chatInlineInput.value = provConfig.key || "";
    }
  });

  chatToggleKeyDrawer?.addEventListener("click", () => {
    if (!chatInlineDrawer) return;
    chatInlineDrawer.classList.toggle("hidden");
    if (!chatInlineDrawer.classList.contains("hidden") && chatInlineInput) {
      const settings = getAiSettings();
      const currentConfig = settings.providers[settings.activeProvider] || {};
      chatInlineInput.value = currentConfig.key || "";
      chatInlineInput.placeholder = AI_PROVIDERS[settings.activeProvider]?.keyPlaceholder || "Skriv inn API-nøkkel...";
      chatInlineInput.focus();
    }
  });

  chatToggleEye?.addEventListener("click", () => {
    if (!chatInlineInput) return;
    chatInlineInput.type = chatInlineInput.type === "password" ? "text" : "password";
  });

  chatSaveKeyBtn?.addEventListener("click", () => {
    if (!chatInlineInput) return;
    const settings = getAiSettings();
    const activeId = settings.activeProvider;
    if (!settings.providers[activeId]) settings.providers[activeId] = {};
    settings.providers[activeId].key = chatInlineInput.value.trim();
    saveAiSettings(settings);
    chatInlineDrawer?.classList.add("hidden");
  });

  insightAiBtn?.addEventListener("click", async () => {
    const rootEl = document.getElementById("insight-root-cause");
    const recEl = document.getElementById("insight-recommendations");
    const sectorTag = document.getElementById("insight-sector-tag");
    const origRoot = rootEl ? rootEl.innerHTML : "";
    const origRec = recEl ? recEl.innerHTML : "";

    if (rootEl) rootEl.innerHTML = `<span class="chat-typing"><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span> Analyserer rotårsak med AI...</span>`;
    if (recEl) recEl.innerHTML = `<span class="chat-typing"><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span> Utarbeider controller-tiltak...</span>`;

    const settings = getAiSettings();
    const activeId = settings.activeProvider;
    const cfg = settings.providers[activeId] || {};
    const contextLabel = getActiveContextSummary();

    const prompt = `Gjør en konsis controller-analyse for ${contextLabel} i Kristiansand kommune.
Strukturer svaret NØYAKTIG i to deler adskilt med '---':
FØRSTE DEL (Rotårsak): Maks 3 setninger om de underliggende årsakene til avviket i gjeldende filterutvalg.
ANDRE DEL (Tiltak): Maks 3 kulepunkter med konkrete controller-tiltak iht. Kommuneloven § 14-4, Opplæringsloven § 8-2, Helse- og omsorgstjenesteloven § 4-1 og AML § 10-6.`;

    try {
      const response = await executeAiCall({
        provider: activeId,
        key: cfg.key,
        model: cfg.model,
        endpoint: cfg.endpoint,
        prompt: prompt,
        contextText: buildControllerContext()
      });

      const parts = response.split("---");
      if (parts.length >= 2) {
        if (rootEl) rootEl.innerHTML = formatMarkdownToHtml(parts[0].trim());
        if (recEl) recEl.innerHTML = formatMarkdownToHtml(parts[1].trim());
      } else {
        if (rootEl) rootEl.innerHTML = formatMarkdownToHtml(response);
        if (recEl) recEl.innerHTML = origRec;
      }
      if (sectorTag) sectorTag.innerText = `${contextLabel} (⚡ ${AI_PROVIDERS[activeId]?.name || 'AI'})`;
    } catch (e) {
      if (rootEl) rootEl.innerHTML = origRoot;
      if (recEl) recEl.innerHTML = origRec;
    }
  });

  updateAiUIState();
}

// Oppdater Chatbot velkomstboble med levende tall fra aktive slicere
function updateChatbotContextWelcome(aggs) {
  const welcomeEl = document.getElementById("chatbot-welcome-bubble");
  if (!welcomeEl || !aggs) return;
  const contextLabel = getActiveContextSummary();
  welcomeEl.innerHTML = `
    Hei Frank! Jeg er din <strong>AI Project Controller</strong>. Aktivt filterutvalg er nå <strong>${contextLabel}</strong> (${aggs.recordCount} rader):
    <br>• <strong>Budsjett:</strong> ${formatNok(aggs.totalBudget)} kNOK | <strong>Regnskap:</strong> ${formatNok(aggs.totalActual)} kNOK
    <br>• <strong>Avvik:</strong> ${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)} kNOK | <strong>MoM Δ:</strong> ${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK
    <br><br>Hva vil du analysere i dette utvalget?
  `;
}

// Build live KOSTRA financial context string for LLM prompts based on active slicers
function buildControllerContext() {
  if (!latestAggregates) return "Ingen data lastet.";
  const aggs = latestAggregates;
  const contextLabel = getActiveContextSummary();
  const topDriversText = aggs.drivers.slice(0, 4).map((d, i) =>
    `  ${i + 1}. Art ${d.code} (${d.name}): Budsjett ${formatNok(d.budget)} k, Regnskap ${formatNok(d.actual)} k, Avvik ${formatNok(d.variance)} k`
  ).join("\n");

  return `KRISTIANSAND KOMMUNE – KOSTRA VIRKSOMHETSSTYRING 2024 (AKTIVT FILTER: ${contextLabel}):
• Budsjett i valgt periode: ${formatNok(aggs.totalBudget)} kNOK
• Regnskap i valgt periode: ${formatNok(aggs.totalActual)} kNOK (${aggs.totalSpendPct.toFixed(1)} % forbruk)
• Netto Avvik i valgt periode: ${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)} kNOK
• MoM Endring (M0${aggs.targetM} vs M0${aggs.prevM}): ${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK (${aggs.momActualPct.toFixed(1)} %)
• Akkumulert Avvik YTD (M01–M0${aggs.targetM}): ${aggs.ytdVariance > 0 ? "+" : ""}${formatNok(aggs.ytdVariance)} kNOK
• Prognosert Årssluttavvik (EAC): ${aggs.projectedEoyVariance > 0 ? "+" : ""}${formatNok(aggs.projectedEoyVariance)} kNOK
• Største avviksdrivere i gjeldende utvalg:
${topDriversText}`;
}

// Innebygd (Offline) regelbasert AI Project Controller som bruker 100 % live filtrerte tall
function generateControllerAiResponse(prompt) {
  if (!latestAggregates) return "Laster regnskapsdata...";
  const aggs = latestAggregates;
  const q = (prompt || "").toLowerCase();
  const contextLabel = getActiveContextSummary();
  const d1 = aggs.drivers[0] || { code: 101000, name: "Fastlønn", variance: 0, actual: 0, budget: 0 };
  const d2 = aggs.drivers[1] || { code: 127040, name: "Vikarbyrå", variance: 0, actual: 0, budget: 0 };

  if (prompt && prompt.includes("---")) {
    return `I **${contextLabel}** er samlet avvik **${formatNok(aggs.totalVariance)} kNOK** (${aggs.totalSpendPct.toFixed(1)} % av budsjett på ${formatNok(aggs.totalBudget)} kNOK). Hoveddriveren er **${d1.name} (Art ${d1.code})** med **${formatNok(d1.variance)} kNOK** og **${d2.name} (Art ${d2.code})** med **${formatNok(d2.variance)} kNOK**. Siste måned (M0${aggs.targetM}) viste en MoM-endring på **${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK**.
---
- **Tiltak 1 (Art ${d1.code}):** ${getAccountActionRecommendation(d1.code, d1.cat, d1.sector)}
- **Tiltak 2 (Art ${d2.code}):** Stram inn fullmakter og følg opp månedlig run-rate mot EAC (${formatNok(aggs.projectedEoyVariance)} kNOK).
- **Tiltak 3 (Lovkrav):** Sikre at tiltakene gjennomføres innenfor Opplæringsloven § 8-2, Helse- og omsorgstjenesteloven § 4-1 og AML § 10-6.`;
  }

  if (q.includes("eac") || q.includes("prognose") || q.includes("årsslutt")) {
    return `**Prognose (EAC) for ${contextLabel}:**<br>• **Akkumulert Avvik YTD (M01–M0${aggs.targetM}):** ${formatNok(aggs.ytdVariance)} kNOK<br>• **Prognosert Årssluttavvik (EAC):** **${formatNok(aggs.projectedEoyVariance)} kNOK** dersom nåværende run-rate fortsetter ut året.<br>• **Anbefaling:** Benytt What-If simulatoren til å kombinere kutt på Art ${aggs.primarySimDriver.code} og Art ${aggs.secondarySimDriver.code} over de gjenværende ${12 - aggs.targetM} månedene.`;
  }

  if (q.includes("arbeidsmiljølov") || q.includes("lov") || q.includes("overtid")) {
    return `**Juridiske rammer ved kostnadskutt (${contextLabel}):**<br>• **Arbeidsmiljøloven § 10-6:** Maks 10 timer overtid pr. uke / 200 timer pr. år. Overtidskutt må derfor kombineres med turnusrevisjon.<br>• **Opplæringsloven § 8-2:** Lærernormen krever maks 15 elever pr. lærer (1.–4. trinn).<br>• **Helse- og omsorgstjenesteloven § 4-1:** Krav om forsvarlig bemanning i døgninstitusjon.`;
  }

  return `**Controller-status for ${contextLabel}:**<br>• **Budsjett:** ${formatNok(aggs.totalBudget)} kNOK | **Regnskap:** ${formatNok(aggs.totalActual)} kNOK<br>• **Avvik:** **${aggs.totalVariance > 0 ? "+" : ""}${formatNok(aggs.totalVariance)} kNOK** (${aggs.totalSpendPct.toFixed(1)} % forbruk)<br>• **MoM Endring (M0${aggs.targetM} vs M0${aggs.prevM}):** ${aggs.momActualDelta > 0 ? "+" : ""}${formatNok(aggs.momActualDelta)} kNOK (${aggs.momActualPct.toFixed(1)} %)<br>• **Største driver:** Art ${d1.code} (${d1.name}) med ${formatNok(d1.variance)} kNOK.<br>• **Anbefalt tiltak:** ${getAccountActionRecommendation(d1.code, d1.cat, d1.sector)}`;
}

// Low-level API Dispatcher for Multi-Provider
async function executeAiCall({ provider, key, model, endpoint, prompt, contextText }) {
  const systemPrompt = `Du er Frank Ellingsens AI Project Controller for Kristiansand kommune.
Du har dyp ekspertise i KOSTRA, kommunal økonomistyring, Framsikt, DuckDB og Edward Tufte datavisualisering.
Svar presist, profesjonelt og velbegrunnet på norsk.
Benytt formelle finansielle begreper (EAC, ETC, periodisering, run-rate, rammekutt, vikarstopp).

${contextText || buildControllerContext()}`;

  if (provider === "offline") {
    return generateControllerAiResponse(prompt);
  }

  if (provider === "gemini") {
    if (!key) throw new Error("API-nøkkel mangler for Google Gemini. Legg inn nøkkel i AI-oppsettet.");
    const modelName = model || "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent?key=${encodeURIComponent(key)}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${systemPrompt}\n\nSpørsmål fra controller:\n${prompt}` }] }],
        generationConfig: { temperature: 0.25, maxOutputTokens: 800 }
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Feil fra Gemini API");
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!reply) throw new Error("Mottok tomt svar fra Gemini");
    return reply;
  }

  if (["openai", "groq", "mistral", "deepseek"].includes(provider)) {
    if (!key) throw new Error(`API-nøkkel mangler for ${AI_PROVIDERS[provider]?.name}. Legg inn nøkkel i AI-oppsettet.`);

    let endpointUrl = "https://api.openai.com/v1/chat/completions";
    let defaultModel = "gpt-4o-mini";

    if (provider === "groq") {
      endpointUrl = "https://api.groq.com/openai/v1/chat/completions";
      defaultModel = "llama-3.1-70b-versatile";
    } else if (provider === "mistral") {
      endpointUrl = "https://api.mistral.ai/v1/chat/completions";
      defaultModel = "mistral-large-latest";
    } else if (provider === "deepseek") {
      endpointUrl = "https://api.deepseek.com/chat/completions";
      defaultModel = "deepseek-chat";
    }

    const res = await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${key}`
      },
      body: JSON.stringify({
        model: model || defaultModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.25
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || `Feil fra ${provider}`);
    const reply = data.choices?.[0]?.message?.content;
    if (!reply) throw new Error(`Tomt svar fra ${provider}`);
    return reply;
  }

  if (provider === "ollama") {
    const base = (endpoint || "http://localhost:11434").replace(/\/$/, "");
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "llama3:latest",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        stream: false
      })
    });

    if (!res.ok) {
      throw new Error(`Ollama svarte med status ${res.status}. Sjekk at Ollama kjører på ${base}`);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.message?.content || "Tomt svar fra Ollama";
  }

  if (provider === "anthropic") {
    if (!key) throw new Error("API-nøkkel mangler for Anthropic Claude.");
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "dangerously-allow-browser": "true"
      },
      body: JSON.stringify({
        model: model || "claude-3-5-sonnet-20241022",
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800
      })
    });

    const data = await res.json();
    if (data.error) throw new Error(data.error.message || "Anthropic API feil");
    return data.content?.[0]?.text || "Tomt svar fra Claude";
  }

  return generateControllerAiResponse(prompt);
}

function formatMarkdownToHtml(mdText) {
  if (!mdText) return "";
  let html = mdText
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  const lines = html.split("\n");
  let inList = false;
  let formatted = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("• ") || trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
      if (!inList) {
        formatted.push("<ul style='margin:0.35rem 0 0.35rem 1.2rem; padding:0;'>");
        inList = true;
      }
      formatted.push(`<li>${trimmed.substring(2)}</li>`);
    } else {
      if (inList) {
        formatted.push("</ul>");
        inList = false;
      }
      if (trimmed.length > 0) {
        formatted.push(trimmed);
      }
    }
  }
  if (inList) formatted.push("</ul>");

  return formatted.join("<br>");
}

// 19. Floating AI Controller Chatbot Logic
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

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    appendChatMessage("user", query);
    input.value = "";

    const typingId = "typing-" + Date.now();
    appendChatMessage("bot", `<span class="chat-typing"><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span><span class="chat-typing-dot"></span> Tenker...</span>`, typingId);

    const settings = getAiSettings();
    const activeId = settings.activeProvider || "gemini";
    const cfg = settings.providers[activeId] || {};

    try {
      let responseText = "";
      if (activeId === "offline") {
        responseText = generateControllerAiResponse(query);
      } else if (!cfg.key && activeId !== "ollama") {
        const mockResp = generateControllerAiResponse(query);
        responseText = `<div style="font-size:0.75rem; color:var(--accent-amber); margin-bottom:0.35rem; padding:0.25rem 0.45rem; background:rgba(245,158,11,0.1); border-radius:3px; border:1px solid rgba(245,158,11,0.25);">
          ℹ️ <strong>Live Slicer-analyse (Offline):</strong> Legg inn API-nøkkel for <em>${AI_PROVIDERS[activeId]?.name}</em> ved behov.
        </div>${mockResp}`;
      } else {
        const aiResult = await executeAiCall({
          provider: activeId,
          key: cfg.key,
          model: cfg.model,
          endpoint: cfg.endpoint,
          prompt: query,
          contextText: buildControllerContext()
        });
        responseText = `<div style="font-size:0.72rem; color:var(--accent-cyan); margin-bottom:0.35rem;">⚡ Generert av ${AI_PROVIDERS[activeId]?.name} (${cfg.model || AI_PROVIDERS[activeId]?.defaultModel})</div>` + formatMarkdownToHtml(aiResult);
      }

      removeChatMessage(typingId);
      appendChatMessage("bot", responseText);
    } catch (err) {
      removeChatMessage(typingId);
      const fallback = generateControllerAiResponse(query);
      appendChatMessage("bot", `<div style="font-size:0.75rem; color:var(--variance-neg); margin-bottom:0.35rem; padding:0.25rem 0.45rem; background:var(--variance-neg-bg); border-radius:3px; border:1px solid var(--variance-neg-border);">
        ⚠️ <strong>${AI_PROVIDERS[activeId]?.name || 'AI'}-feil:</strong> ${err.message}<br>
        <em>Viser innebygd controller-innsikt for aktivt filter:</em>
      </div>${fallback}`);
    }
  });

  function appendChatMessage(sender, htmlText, messageId) {
    if (!messages) return;
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${sender}`;
    if (messageId) msgDiv.id = messageId;
    msgDiv.innerHTML = `<div class="chat-bubble">${htmlText}</div>`;
    messages.appendChild(msgDiv);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeChatMessage(messageId) {
    if (!messages) return;
    const el = document.getElementById(messageId);
    if (el) el.remove();
  }
}
