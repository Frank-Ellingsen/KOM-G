/**
 * KOM-G: KomKostra Executive Cockpit & BI Portal
 * Logic, Interactive S-Curve SVG, What-If Simulator, and Catalog Navigation
 */

// 1. Data Extracted Directly from DuckDB (fact_data & dimensions)
const KOSTRA_DATA = {
  summary: {
    ytd_budget_knok: 29295.2,
    ytd_actual_knok: 31524.9,
    ytd_variance_knok: -2229.6,
    ytd_spend_pct: 107.61,
    m08_budget_knok: 3770.1,
    m08_actual_knok: 4120.8,
    m08_variance_knok: -350.7,
    m08_spend_pct: 109.30,
    oppvekst_ytd_actual: 18902.0,
    oppvekst_ytd_budget: 17958.0,
    oppvekst_ytd_variance: -944.0,
    helse_ytd_actual: 12622.9,
    helse_ytd_budget: 11337.2,
    helse_ytd_variance: -1285.6
  },
  monthly: [
    { month: "Jan (01)", budget: 19361.3, actual: 19916.8, variance: -555.4 },
    { month: "Feb (02)", budget: 1410.9, actual: 2082.1, variance: -671.2 },
    { month: "Mar (03)", budget: 1342.4, actual: 1541.2, variance: -198.9 },
    { month: "Apr (04)", budget: 2357.4, actual: 2256.7, variance: 100.6 },
    { month: "Mai (05)", budget: 1544.2, actual: 1613.4, variance: -69.2 },
    { month: "Jun (06)", budget: 241.7, actual: 519.3, variance: -277.7 },
    { month: "Jul (07)", budget: 1512.2, actual: 1837.5, variance: -325.3 },
    { month: "Aug (08)", budget: 1525.2, actual: 1757.7, variance: -232.6 }
  ],
  top_drivers_m08: [
    { code: "127040", name: "Kjøp av vikarbyråtjenester", sector: "Helse", budget: 0.0, actual: 253.2, variance: -253.2, cause: "Ubudsjettert ekstern innleie sommermåneder" },
    { code: "101000", name: "Fastlønn ordinære", sector: "Begge", budget: 2333.5, actual: 2530.3, variance: -196.8, cause: "Lønnsoppgjørsvirkning og høyere bemanning" },
    { code: "102013", name: "Vikarer ved korttidsfravær", sector: "Begge", budget: 12.7, actual: 61.9, variance: -49.2, cause: "Dekning av akutt fravær ved skolestart" },
    { code: "102031", name: "Vikar kvelds-/nattillegg", sector: "Helse", budget: 0.0, actual: 45.9, variance: -45.9, cause: "Turnustillegg for innleide vikarer" },
    { code: "104000", name: "Overtid", sector: "Begge", budget: 9.4, actual: 52.4, variance: -43.0, cause: "Ekstraarbeid turnus og skolestart" },
    { code: "102000", name: "Vikarer ordinære", sector: "Begge", budget: 16.7, actual: 49.3, variance: -32.7, cause: "Vikardekning ved permisjoner" }
  ],
  functions_m08: [
    { code: "2020", name: "Grunnskoleundervisning", sector: "Oppvekst", budget: 1702.8, actual: 1809.2, variance: -106.4 },
    { code: "2140", name: "Skolefritidsordning (SFO)", sector: "Oppvekst", budget: 311.9, actual: 345.2, variance: -33.3 },
    { code: "2210", name: "PPT og pedagogisk oppfølging", sector: "Oppvekst", budget: 101.7, actual: 122.9, variance: -21.3 },
    { code: "2150", name: "Skoleskyss / Leirskole", sector: "Oppvekst", budget: 0.0, actual: 4.0, variance: -4.0 },
    { code: "2130", name: "Voksenopplæring", sector: "Oppvekst", budget: 64.1, actual: 61.4, variance: 2.7 },
    { code: "2230", name: "Spesialpedagogiske tiltak", sector: "Oppvekst", budget: 64.5, actual: 58.7, variance: 5.8 },
    { code: "2040", name: "Statlige refusjoner", sector: "Oppvekst", budget: 0.0, actual: -38.4, variance: 38.4 },
    { code: "2540", name: "Pleie og omsorg i institusjon/bolig", sector: "Helse", budget: 1525.2, actual: 1757.7, variance: -232.6 }
  ]
};

// 2. Power BI 25-Siders Rapportkatalog
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

// 3. Initialize Top Variance Driver Table
function renderDriversTable() {
  const tbody = document.getElementById("drivers-table-body");
  if (!tbody) return;

  const maxVar = Math.max(...KOSTRA_DATA.top_drivers_m08.map(d => Math.abs(d.variance)));

  tbody.innerHTML = KOSTRA_DATA.top_drivers_m08.map(d => {
    const barWidth = Math.min(100, (Math.abs(d.variance) / maxVar) * 80);
    return `
      <tr>
        <td class="code">${d.code}</td>
        <td><strong>${d.name}</strong><br><span style="color:var(--text-muted);font-size:0.75rem">${d.cause}</span></td>
        <td><span class="kpi-tag">${d.sector}</span></td>
        <td class="num">${formatNok(d.budget)}</td>
        <td class="num">${formatNok(d.actual)}</td>
        <td class="num">
          <div class="variance-bar-cell">
            <div class="mini-bar" style="width: ${barWidth}px;"></div>
            <span style="color: var(--variance-neg); font-weight: 600;">${formatNok(d.variance)}</span>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// 4. Initialize KOSTRA Functions Table
function renderFunctionsTable() {
  const tbody = document.getElementById("functions-table-body");
  if (!tbody) return;

  tbody.innerHTML = KOSTRA_DATA.functions_m08.map(f => {
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

// 5. Render S-Curve (Pure SVG with Tufte Direct Labels)
let currentChartMode = "scurve"; // "scurve" or "monthly"

function renderSvgChart() {
  const container = document.getElementById("tufte-chart-container");
  if (!container) return;

  const width = container.clientWidth || 700;
  const height = 280;
  const padding = { top: 35, right: 130, bottom: 35, left: 55 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (currentChartMode === "scurve") {
    // Cumulative sums
    let cumB = 0, cumA = 0;
    const cumData = KOSTRA_DATA.monthly.map(m => {
      cumB += m.budget;
      cumA += m.actual;
      return { month: m.month, cumBudget: cumB, cumActual: cumA };
    });

    const maxVal = Math.max(...cumData.map(d => d.cumActual)) * 1.12;

    const getX = (i) => padding.left + (i / (cumData.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - (val / maxVal) * chartH;

    // Build SVG paths
    const budgetPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumBudget)}`).join(" ");
    const actualPoints = cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ");

    // Variance area path
    const areaPoints = `${cumData.map((d, i) => `${getX(i)},${getY(d.cumActual)}`).join(" ")} ` +
                       `${cumData.slice().reverse().map((d, i) => `${getX(cumData.length - 1 - i)},${getY(d.cumBudget)}`).join(" ")}`;

    const lastB = cumData[cumData.length - 1];
    const lastX = getX(cumData.length - 1);
    const lastY_B = getY(lastB.cumBudget);
    const lastY_A = getY(lastB.cumActual);

    container.innerHTML = `
      <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
        <!-- Horizontal Reference Gridlines (Hairlines only, no vertical lines) -->
        <line x1="${padding.left}" y1="${getY(10000)}" x2="${padding.left + chartW}" y2="${getY(10000)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${getY(10000) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">10k</text>

        <line x1="${padding.left}" y1="${getY(20000)}" x2="${padding.left + chartW}" y2="${getY(20000)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${getY(20000) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">20k</text>

        <line x1="${padding.left}" y1="${getY(30000)}" x2="${padding.left + chartW}" y2="${getY(30000)}" stroke="var(--border-subtle)" stroke-dasharray="3,3" />
        <text x="${padding.left - 8}" y="${getY(30000) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">30k</text>

        <!-- Variance Ribbon (Merforbruk shaded soft crimson) -->
        <polygon points="${areaPoints}" fill="rgba(244, 63, 94, 0.12)" />

        <!-- Budsjett Curve (Dotted Muted Blue) -->
        <polyline points="${budgetPoints}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />

        <!-- Faktisk Regnskap Curve (Solid Cyan) -->
        <polyline points="${actualPoints}" fill="none" stroke="#38bdf8" stroke-width="3" />

        <!-- Data points on Actuals -->
        ${cumData.map((d, i) => `
          <circle cx="${getX(i)}" cy="${getY(d.cumActual)}" r="4" fill="#38bdf8" />
        `).join("")}

        <!-- X-Axis Labels -->
        ${cumData.map((d, i) => `
          <text x="${getX(i)}" y="${height - 12}" fill="var(--text-muted)" font-size="11" font-family="var(--font-mono)" text-anchor="middle">${d.month}</text>
        `).join("")}

        <!-- Tufte Direct Labels on Endpoints -->
        <text x="${lastX + 10}" y="${lastY_A + 3}" fill="#38bdf8" font-size="11" font-family="var(--font-mono)" font-weight="600">
          Regnskap: ${formatNok(lastB.cumActual)} k
        </text>
        <text x="${lastX + 10}" y="${lastY_B + 14}" fill="#94a3b8" font-size="11" font-family="var(--font-mono)">
          Budsjett: ${formatNok(lastB.cumBudget)} k
        </text>
      </svg>
    `;
  } else {
    // Monthly Isolated Bars
    const maxBar = Math.max(...KOSTRA_DATA.monthly.map(m => Math.max(m.budget, m.actual))) * 1.1;
    const barGroupW = chartW / KOSTRA_DATA.monthly.length;
    const barW = Math.max(6, (barGroupW - 14) / 2);

    const getY = (val) => padding.top + chartH - (val / maxBar) * chartH;

    container.innerHTML = `
      <svg class="tufte-svg" viewBox="0 0 ${width} ${height}">
        <!-- Horizontal Reference lines -->
        <line x1="${padding.left}" y1="${getY(2000)}" x2="${padding.left + chartW}" y2="${getY(2000)}" stroke="var(--border-subtle)" stroke-dasharray="2,2" />
        <text x="${padding.left - 8}" y="${getY(2000) + 4}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="end">2k</text>

        <!-- Bars per month -->
        ${KOSTRA_DATA.monthly.map((m, i) => {
          const groupX = padding.left + i * barGroupW + 7;
          const hBudget = chartH - (getY(m.budget) - padding.top);
          const hActual = chartH - (getY(m.actual) - padding.top);
          const isOver = m.actual > m.budget;
          const actualColor = isOver ? "var(--variance-neg)" : "var(--accent-cyan)";

          return `
            <rect x="${groupX}" y="${getY(m.budget)}" width="${barW}" height="${hBudget}" fill="#64748b" opacity="0.6" rx="2" />
            <rect x="${groupX + barW + 2}" y="${getY(m.actual)}" width="${barW}" height="${hActual}" fill="${actualColor}" rx="2" />
            <text x="${groupX + barW}" y="${height - 12}" fill="var(--text-muted)" font-size="10" font-family="var(--font-mono)" text-anchor="middle">${m.month.split(" ")[0]}</text>
          `;
        }).join("")}
      </svg>
    `;
  }
}

// 6. Interactive What-If Scenario Calculation
function updateWhatIfSimulator() {
  const vikarPct = parseFloat(document.getElementById("slider-vikar")?.value || 0);
  const overtidPct = parseFloat(document.getElementById("slider-overtid")?.value || 0);
  const omdispPct = parseFloat(document.getElementById("slider-omdisp")?.value || 0);

  // Update slider badges
  const badgeVikar = document.getElementById("val-vikar");
  const badgeOvertid = document.getElementById("val-overtid");
  const badgeOmdisp = document.getElementById("val-omdisp");

  if (badgeVikar) badgeVikar.innerText = `${vikarPct} %`;
  if (badgeOvertid) badgeOvertid.innerText = `${overtidPct} %`;
  if (badgeOmdisp) badgeOmdisp.innerText = `${omdispPct} %`;

  // Financial parameters (kNOK per month baseline based on August)
  const monthlyVikarBase = 253.2;  // Art 127040
  const monthlyOvertidBase = 52.4; // Art 104000
  const monthlyBudgetBase = 3770.1; // Total consolidated monthly budget

  const vikarMonthlySave = (vikarPct / 100) * monthlyVikarBase;
  const overtidMonthlySave = (overtidPct / 100) * monthlyOvertidBase;
  const omdispMonthlySave = (omdispPct / 100) * monthlyBudgetBase;

  const totalMonthlySavings = vikarMonthlySave + overtidMonthlySave + omdispMonthlySave;
  
  // Remaining period: September through December = 4 months
  const remainingMonths = 4;
  const totalRestarSavings = totalMonthlySavings * remainingMonths;

  // Baseline projected year-end avvik (linear run-rate extrapolation from YTD -2 229,6 over 8 months):
  // -2 229,6 / 8 * 12 = -3 344,4 kNOK
  const baselineEoyAvvik = -3344.4;
  const adjustedEoyAvvik = baselineEoyAvvik + totalRestarSavings;

  // DOM Updates
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
    } else if (adjustedEoyAvvik > -1000) {
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

// 7. Power BI 25-Siders Rapportkatalog Filter & Render
function renderCatalog(filterCat = "all") {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  const filtered = filterCat === "all" 
    ? REPORT_PAGES 
    : REPORT_PAGES.filter(p => p.cat === filterCat);

  grid.innerHTML = filtered.map(p => `
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
    </div>
  `).join("");
}

// 8. Theme Switcher (Dark / Light)
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

// 9. Copy CLI Commands
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

// Initialization on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderDriversTable();
  renderFunctionsTable();
  renderSvgChart();
  renderCatalog("all");
  updateWhatIfSimulator();
  initCopyButtons();

  // Resize listener for SVG responsiveness
  window.addEventListener("resize", renderSvgChart);

  // Chart Toggle Buttons
  const btnScurve = document.getElementById("btn-chart-scurve");
  const btnMonthly = document.getElementById("btn-chart-monthly");

  if (btnScurve && btnMonthly) {
    btnScurve.addEventListener("click", () => {
      currentChartMode = "scurve";
      btnScurve.classList.add("active");
      btnMonthly.classList.remove("active");
      renderSvgChart();
    });

    btnMonthly.addEventListener("click", () => {
      currentChartMode = "monthly";
      btnMonthly.classList.add("active");
      btnScurve.classList.remove("active");
      renderSvgChart();
    });
  }

  // Slider Events
  ["slider-vikar", "slider-overtid", "slider-omdisp"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", updateWhatIfSimulator);
    }
  });

  // Catalog Tab Buttons
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      renderCatalog(filter);
    });
  });
});
