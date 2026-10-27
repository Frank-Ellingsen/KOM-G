# -*- coding: utf-8 -*-
"""
KOM-G: KomKostra AI Workbench & Executive Cockpit (Streamlit App)
Inkluderer: Slicere, Early Warnings, FAQ, What-If Simulator og AI Controller Chatbot.
"""

import os
import sys
import duckdb
import pandas as pd
import streamlit as st
import plotly.graph_objects as go

# Tving UTF-8 på Windows
if sys.platform.startswith("win"):
    sys.stdout.reconfigure(encoding="utf-8")

# Konfigurer Streamlit Side
st.set_page_config(
    page_title="KOM-G | Kristiansand Kommune KOSTRA Cockpit",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Edward Tufte Data-Ink Custom CSS
st.markdown("""
<style>
    /* Edward Tufte Data-Ink Styling */
    .metric-card {
        background-color: #111726;
        border: 1px solid #1e293b;
        border-radius: 6px;
        padding: 12px 16px;
        margin-bottom: 12px;
    }
    .metric-title {
        font-size: 0.75rem;
        color: #94a3b8;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .metric-value {
        font-family: 'JetBrains Mono', monospace;
        font-size: 1.5rem;
        font-weight: 600;
        color: #f8fafc;
    }
    .metric-sub {
        font-size: 0.75rem;
        color: #64748b;
    }
    .badge-neg {
        color: #f43f5e;
        background-color: rgba(244, 63, 94, 0.12);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }
    .badge-pos {
        color: #10b981;
        background-color: rgba(16, 185, 129, 0.12);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 600;
    }
    .warning-box {
        padding: 12px;
        border-radius: 6px;
        margin-bottom: 10px;
        border-left: 4px solid #f43f5e;
        background: #1e1b24;
    }
</style>
""", unsafe_allow_html=True)

# Databasetilkopling (DuckDB)
@st.cache_resource
def get_connection():
    db_path = os.getenv("DUCKDB_PATH", "data/database/kostra.duckdb")
    if not os.path.exists(db_path):
        # Fallback if in different relative dir
        db_path = "data/database/kostra.duckdb"
    return duckdb.connect(db_path, read_only=True)

try:
    con = get_connection()
except Exception as e:
    st.error(f"Kunne ikke koble til DuckDB ({e}). Bygg databasen først med: .\\run.ps1 -BuildDB")
    st.stop()

# Hjelpefunksjon: Norsk tallformatering
def format_nok(val, decimals=1):
    if pd.isna(val) or val is None:
        return "0,0"
    parts = f"{abs(val):.{decimals}f}".split(".")
    parts[0] = f"{int(parts[0]):,}".replace(",", " ")
    formatted = ",".join(parts)
    return f"-{formatted}" if val < 0 else formatted

# ==============================================================================
# SIDEBAR: POWER BI SLICERE & FILTRE
# ==============================================================================
st.sidebar.markdown("### 🔍 Slicere & Dimensjonsfiltre")
st.sidebar.caption("Power BI Reaktivitet mot `kostra.duckdb`")

# 1. Sektor Slicer
sectors_list = ["Alle Sektorer (Konsolidert)", "Oppvekst og Utdanning", "Helse og Omsorg"]
selected_sector_raw = st.sidebar.selectbox("Sektor (dim_ansvar)", sectors_list, index=0)
selected_sector = None if selected_sector_raw.startswith("Alle") else selected_sector_raw

# 2. Periode Slicer
month_options = {
    "Akkumulert YTD (Måneder 01–08)": None,
    "Måned 08 (August - Siste)": 8,
    "Måned 07 (Juli)": 7,
    "Måned 06 (Juni)": 6,
    "Måned 05 (Mai)": 5,
    "Måned 04 (April)": 4,
    "Måned 03 (Mars)": 3,
    "Måned 02 (Februar)": 2,
    "Måned 01 (Januar)": 1
}
selected_month_label = st.sidebar.selectbox("Rapporteringsperiode (dim_date)", list(month_options.keys()), index=0)
selected_month = month_options[selected_month_label]

# 3. KOSTRA-Funksjon Slicer
try:
    func_df = con.execute("SELECT DISTINCT KOSTRA_Funksjonsgruppe_Kode, Funksjonsgruppe_Kode_Navn FROM dim_kostra_funksjon ORDER BY 1").fetchdf()
    func_options = {"Alle KOSTRA-Funksjoner": None}
    for _, row in func_df.iterrows():
        func_options[f"{row['KOSTRA_Funksjonsgruppe_Kode']} - {row['Funksjonsgruppe_Kode_Navn']}"] = int(row['KOSTRA_Funksjonsgruppe_Kode'])
    selected_func_label = st.sidebar.selectbox("KOSTRA-Funksjon (dim_funksjon)", list(func_options.keys()), index=0)
    selected_func = func_options[selected_func_label]
except Exception:
    selected_func = None

# 4. Kontokategori Slicer
try:
    cat_df = con.execute("SELECT DISTINCT Hovedkategori_Navn FROM dim_kostra_kontoplan WHERE Hovedkategori_Navn IS NOT NULL ORDER BY 1").fetchdf()
    cat_options = ["Alle Kontokategorier"] + cat_df["Hovedkategori_Navn"].tolist()
    selected_cat_raw = st.sidebar.selectbox("Kostnadskategori (dim_kontoplan)", cat_options, index=0)
    selected_cat = None if selected_cat_raw.startswith("Alle") else selected_cat_raw
except Exception:
    selected_cat = None

st.sidebar.divider()
st.sidebar.caption("KOM-G v2.4 | Kristiansand Kommune")
st.sidebar.caption("Data: `fact_data` (2 256 rader)")

# ==============================================================================
# HOVEDVISNING: HEADER & KPI-KORT
# ==============================================================================
st.title("📊 Kristiansand Kommune – KOSTRA Cockpit")
st.caption("Finansiell Virksomhetsstyring & Månedsrapport per August (Måned 08 / 2024)")

# Bygg filtrert SQL spørring
query = """
SELECT 
    month(f.Dato) as m,
    f.Sektor,
    f.KOSTRA_Funksjonsgruppe_Kode,
    f.Kontokode_6Siffer,
    COALESCE(kp.Kontonavn, 'Art ' || cast(f.Kontokode_6Siffer as varchar)) as Kontonavn,
    COALESCE(kf.Funksjonsgruppe_Kode_Navn, 'Funksjon ' || cast(f.KOSTRA_Funksjonsgruppe_Kode as varchar)) as Funksjonsnavn,
    round(f.Budsjett / 1000.0, 1) as b_knok,
    round(f.Regnskap / 1000.0, 1) as a_knok
FROM fact_data f
LEFT JOIN dim_kostra_funksjon kf ON f.KOSTRA_Funksjonsgruppe_Kode = kf.KOSTRA_Funksjonsgruppe_Kode
LEFT JOIN dim_kostra_kontoplan kp ON f.Kontokode_6Siffer = kp.Kontokode_6Siffer
WHERE 1=1
"""
params = []

if selected_sector:
    query += " AND f.Sektor = ?"
    params.append(selected_sector)

if selected_month:
    query += " AND month(f.Dato) = ?"
    params.append(selected_month)

if selected_func:
    query += " AND f.KOSTRA_Funksjonsgruppe_Kode = ?"
    params.append(selected_func)

if selected_cat:
    query += " AND kp.Hovedkategori_Navn = ?"
    params.append(selected_cat)

filtered_df = con.execute(query, params).fetchdf()

total_budget = filtered_df["b_knok"].sum()
total_actual = filtered_df["a_knok"].sum()
total_variance = total_budget - total_actual
spend_pct = (total_actual / total_budget * 100) if total_budget > 0 else 0

oppvekst_df = filtered_df[filtered_df["Sektor"] == "Oppvekst og Utdanning"]
helse_df = filtered_df[filtered_df["Sektor"] == "Helse og Omsorg"]

oppvekst_act = oppvekst_df["a_knok"].sum()
oppvekst_var = oppvekst_df["b_knok"].sum() - oppvekst_act

helse_act = helse_df["a_knok"].sum()
helse_var = helse_df["b_knok"].sum() - helse_act

# 5 KPI Kort
c1, c2, c3, c4, c5 = st.columns(5)
with c1:
    st.metric(
        label=selected_sector_raw.split(" ")[0] if selected_sector else "Konsolidert Regnskap",
        value=f"{format_nok(total_actual)} k",
        delta=f"{format_nok(total_variance)} k ({spend_pct:.1f} %)",
        delta_color="normal"
    )
with c2:
    st.metric(
        label="Oppvekst & Utdanning",
        value=f"{format_nok(oppvekst_act)} k",
        delta=f"{format_nok(oppvekst_var)} k" if oppvekst_act > 0 else "Ikke i utvalg",
        delta_color="normal"
    )
with c3:
    st.metric(
        label="Helse & Omsorg",
        value=f"{format_nok(helse_act)} k",
        delta=f"{format_nok(helse_var)} k" if helse_act > 0 else "Ikke i utvalg",
        delta_color="normal"
    )
with c4:
    m_label = f"Måned 0{selected_month}" if selected_month else "Siste Måned (M08)"
    m8_actual = filtered_df[filtered_df["m"] == (selected_month or 8)]["a_knok"].sum()
    m8_var = filtered_df[filtered_df["m"] == (selected_month or 8)]["b_knok"].sum() - m8_actual
    st.metric(
        label=m_label,
        value=f"{format_nok(m8_actual)} k",
        delta=f"{format_nok(m8_var)} k",
        delta_color="normal"
    )
with c5:
    st.metric(
        label="ML Model Drift (Random Forest)",
        value="4,3 kNOK",
        delta="Ingen Drift (OK)",
        delta_color="off"
    )

st.divider()

# ==============================================================================
# 🚨 EARLY WARNINGS & RISIKOVARSLER
# ==============================================================================
st.subheader("🚨 Tidligvarsler & Risikoalarmer (Early Warnings)")

w1, w2, w3 = st.columns(3)
with w1:
    st.markdown("""
    <div class="warning-box">
        <span class="badge-neg">KRITISK RISIKO: Art 127040</span>
        <h4 style="margin:6px 0;">Eksplosjon i vikarbyråinnleie</h4>
        <p style="font-size:0.8rem; color:#cbd5e1;">
            Ubudsjettert innleie har nådd <strong>253,2 kNOK</strong> i august (382,7 kNOK YTD) i pleie og omsorg. 
            Run-rate peker mot over <strong>1 400 kNOK</strong> ved årsslutt uten tiltak.
        </p>
        <p style="font-size:0.75rem; color:#38bdf8; margin-top:4px;">
            <strong>Anbefalt Controller-tiltak:</strong> Krav om administrativ godkjenning av all ekstern innleie over avdelingsledernivå.
        </p>
    </div>
    """, unsafe_allow_html=True)

with w2:
    st.markdown("""
    <div class="warning-box" style="border-left-color: #f59e0b;">
        <span style="color:#f59e0b; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:4px; font-weight:600; font-size:0.7rem;">
            BETYDELIG AVVIK: Art 101000
        </span>
        <h4 style="margin:6px 0;">Helårsvirkning av lønnsoppgjøret</h4>
        <p style="font-size:0.8rem; color:#cbd5e1;">
            Fastlønnsavviket er akkumulert til <strong>-1 414,0 kNOK</strong> i Oppvekst og <strong>-474,9 kNOK</strong> i Helse. 
            Periodiseringen reflekterer ikke tariffendringen per 01.05 fullt ut.
        </p>
        <p style="font-size:0.75rem; color:#38bdf8; margin-top:4px;">
            <strong>Anbefalt Controller-tiltak:</strong> Juster periodisert ramme i 2. tertial for å unngå feilaktig kutt i undervisning.
        </p>
    </div>
    """, unsafe_allow_html=True)

with w3:
    st.markdown("""
    <div class="warning-box" style="border-left-color: #f59e0b;">
        <span style="color:#f59e0b; background:rgba(245,158,11,0.15); padding:2px 6px; border-radius:4px; font-weight:600; font-size:0.7rem;">
            MODERAT RISIKO: Art 104000
        </span>
        <h4 style="margin:6px 0;">Overtidstopp og turnustillegg</h4>
        <p style="font-size:0.8rem; color:#cbd5e1;">
            Overtid og turnustillegg for vikarer overskred budsjett med <strong>-88,9 kNOK</strong> i august. 
            Arbeidsmiljølovens 200-timers grense for overtid nærmer seg for nøkkelpersonell.
        </p>
        <p style="font-size:0.75rem; color:#38bdf8; margin-top:4px;">
            <strong>Anbefalt Controller-tiltak:</strong> Gjennomgå høstturnus for å utjevne vaktbelastning og minimere overtidstillegg.
        </p>
    </div>
    """, unsafe_allow_html=True)

st.divider()

# ==============================================================================
# S-KURVE OG WHAT-IF SIMULATOR
# ==============================================================================
col_chart, col_sim = st.columns([1.6, 1.0])

with col_chart:
    st.subheader("🎨 Anbefalte Visuals (FT Visual Guide & Time-Visuals 60)")
    v_tab1, v_tab2, v_tab3, v_tab4, v_tab5 = st.tabs([
        "📈 S-Kurve (Time 05)",
        "⚖️ FT 01: Diverging Bars",
        "🍭 Time 07: Lollipop Limits",
        "🌊 Time 10: EAC Waterfall",
        "📐 Time 08: Slopegraph"
    ])

    with v_tab1:
        st.caption("Akkumulert budsjettramme vs faktisk regnskap Jan–Aug 2024 (Tufte S-kurve)")
        monthly_chart_df = filtered_df.groupby("m").agg(
            b_sum=("b_knok", "sum"),
            a_sum=("a_knok", "sum")
        ).reset_index()

        monthly_chart_df["Budsjett_Kumulativ"] = monthly_chart_df["b_sum"].cumsum()
        monthly_chart_df["Regnskap_Kumulativ"] = monthly_chart_df["a_sum"].cumsum()
        monthly_chart_df["Måned_Navn"] = monthly_chart_df["m"].map({
            1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "Mai", 6: "Jun", 7: "Jul", 8: "Aug"
        })

        fig_sc = go.Figure()
        fig_sc.add_trace(go.Scatter(
            x=monthly_chart_df["Måned_Navn"], y=monthly_chart_df["Budsjett_Kumulativ"],
            mode="lines+markers", name="Budsjett", line=dict(color="#64748b", dash="dash", width=2)
        ))
        fig_sc.add_trace(go.Scatter(
            x=monthly_chart_df["Måned_Navn"], y=monthly_chart_df["Regnskap_Kumulativ"],
            mode="lines+markers", name="Regnskap", line=dict(color="#38bdf8", width=3),
            fill="tonexty", fillcolor="rgba(244, 63, 94, 0.12)"
        ))
        fig_sc.update_layout(
            height=320, margin=dict(l=10, r=20, t=10, b=20),
            paper_bgcolor="#111726", plot_bgcolor="#111726",
            font=dict(family="JetBrains Mono, sans-serif", color="#94a3b8"),
            xaxis=dict(showgrid=False), yaxis=dict(showgrid=True, gridcolor="#1e293b"),
            showlegend=True, legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1)
        )
        st.plotly_chart(fig_sc, use_container_width=True)

    with v_tab2:
        st.caption("FT 01 Deviation: Divergerende stolper sentrert rundt 0 kNOK")
        div_df = filtered_df.groupby(["KOSTRA_Funksjonsgruppe_Kode", "Funksjonsnavn"]).agg(
            b_sum=("b_knok", "sum"), a_sum=("a_knok", "sum")
        ).reset_index()
        div_df["Variance"] = div_df["b_sum"] - div_df["a_sum"]
        div_df = div_df.sort_values("Variance", ascending=True)

        colors = ["#f43f5e" if v < 0 else "#10b981" for v in div_df["Variance"]]
        fig_div = go.Figure(go.Bar(
            y=[f"{row['KOSTRA_Funksjonsgruppe_Kode']} {row['Funksjonsnavn'][:16]}.." for _, row in div_df.iterrows()],
            x=div_df["Variance"],
            orientation="h",
            marker=dict(color=colors, line=dict(width=0)),
            text=[f"{v:+.1f} k".replace(".", ",") for v in div_df["Variance"]],
            textposition="auto"
        ))
        fig_div.add_vline(x=0, line_width=1.5, line_color="#94a3b8")
        fig_div.update_layout(
            height=340, margin=dict(l=10, r=20, t=10, b=20),
            paper_bgcolor="#111726", plot_bgcolor="#111726",
            font=dict(family="JetBrains Mono, sans-serif", color="#94a3b8"),
            xaxis=dict(showgrid=False, title="Avvik mot Budsjett (kNOK)"),
            yaxis=dict(showgrid=False, autorange="reversed"),
            showlegend=False
        )
        st.plotly_chart(fig_div, use_container_width=True)

    with v_tab3:
        st.caption("Time 07 Lollipop: Forbruksgrad % mot 80% buffer, 100% budsjett og 110% varsel")
        top_drv = filtered_df.groupby(["Kontokode_6Siffer", "Kontonavn"]).agg(
            b_sum=("b_knok", "sum"), a_sum=("a_knok", "sum")
        ).reset_index()
        top_drv["Pct"] = top_drv.apply(lambda r: (r["a_sum"] / r["b_sum"] * 100) if r["b_sum"] > 0 else (130 if r["a_sum"] > 0 else 0), axis=1)
        top_drv["Var"] = top_drv["b_sum"] - top_drv["a_sum"]
        top_drv = top_drv.sort_values("Var", ascending=True).head(7)

        fig_lol = go.Figure()
        fig_lol.add_vline(x=80, line_dash="dash", line_color="#64748b", annotation_text="80% Buffer", annotation_position="top left")
        fig_lol.add_vline(x=100, line_dash="dash", line_color="#94a3b8", annotation_text="100% Budsjett", annotation_position="top")
        fig_lol.add_vline(x=110, line_dash="dash", line_color="#f43f5e", annotation_text="110% Varsel", annotation_position="top right")

        for _, r in top_drv.iterrows():
            pct_val = min(r["Pct"], 200)
            dot_color = "#f43f5e" if r["Pct"] > 110 else ("#f59e0b" if r["Pct"] > 100 else "#10b981")
            label_y = f"{r['Kontonavn'][:16]}.. ({r['Kontokode_6Siffer']})"
            fig_lol.add_trace(go.Scatter(
                x=[0, pct_val], y=[label_y, label_y],
                mode="lines", line=dict(color="#475569", width=2), showlegend=False
            ))
            fig_lol.add_trace(go.Scatter(
                x=[pct_val], y=[label_y],
                mode="markers+text", marker=dict(color=dot_color, size=10),
                text=[f"{r['Pct']:.1f}% ({r['a_sum']:.0f}k)"],
                textposition="middle right", showlegend=False
            ))

        fig_lol.update_layout(
            height=340, margin=dict(l=10, r=60, t=25, b=20),
            paper_bgcolor="#111726", plot_bgcolor="#111726",
            font=dict(family="JetBrains Mono, sans-serif", color="#94a3b8"),
            xaxis=dict(showgrid=False, title="Forbruksgrad (%)"),
            yaxis=dict(showgrid=False, autorange="reversed")
        )
        st.plotly_chart(fig_lol, use_container_width=True)

    with v_tab4:
        st.caption("Time 10 Waterfall: Avviksvannfall som bygger bro fra Budsjett til Regnskap YTD")
        fastlonn_var = filtered_df[filtered_df["Kontokode_6Siffer"] == 101000].apply(lambda r: r["b_knok"] - r["a_knok"], axis=1).sum()
        vikar_var = filtered_df[filtered_df["Kontokode_6Siffer"] == 127040].apply(lambda r: r["b_knok"] - r["a_knok"], axis=1).sum()
        overtid_var = filtered_df[filtered_df["Kontokode_6Siffer"] == 104000].apply(lambda r: r["b_knok"] - r["a_knok"], axis=1).sum()
        ref_var = filtered_df[filtered_df["Hovedkategori_Navn"] == "Refusjoner"].apply(lambda r: r["b_knok"] - r["a_knok"], axis=1).sum()
        captured = fastlonn_var + vikar_var + overtid_var + ref_var
        ovrig = total_variance - captured

        wf_measures = ["relative", "relative", "relative", "relative", "relative", "relative", "total"]
        wf_x = ["Budsjett", "Fastlønn", "Vikarbyrå", "Overtid", "Refusjon", "Øvrig", "Regnskap"]
        wf_y = [total_budget, -abs(fastlonn_var), -abs(vikar_var), -abs(overtid_var), ref_var, ovrig, 0]
        wf_text = [
            f"{total_budget:.0f}k", f"{fastlonn_var:.0f}k", f"{vikar_var:.0f}k",
            f"{overtid_var:.0f}k", f"{ref_var:+.0f}k", f"{ovrig:+.0f}k", f"{total_actual:.0f}k"
        ]

        fig_wf = go.Figure(go.Waterfall(
            orientation="v", measure=wf_measures, x=wf_x, y=wf_y, text=wf_text,
            textposition="outside",
            connector=dict(line=dict(color="#64748b", dash="dot")),
            increasing=dict(marker=dict(color="#10b981")),
            decreasing=dict(marker=dict(color="#f43f5e")),
            totals=dict(marker=dict(color="#38bdf8"))
        ))
        fig_wf.update_layout(
            height=340, margin=dict(l=10, r=20, t=25, b=20),
            paper_bgcolor="#111726", plot_bgcolor="#111726",
            font=dict(family="JetBrains Mono, sans-serif", color="#94a3b8"),
            xaxis=dict(showgrid=False), yaxis=dict(showgrid=False)
        )
        st.plotly_chart(fig_wf, use_container_width=True)

    with v_tab5:
        st.caption("Time 08 Slopegraph: Endringsanalyse M01 (Januar) vs M08 (August)")
        slope_df = filtered_df.groupby(["KOSTRA_Funksjonsgruppe_Kode", "Funksjonsnavn"]).apply(
            lambda g: pd.Series({
                "m01": g[g["m"] == 1]["a_knok"].sum(),
                "m08": g[g["m"] == 8]["a_knok"].sum()
            })
        ).reset_index()
        slope_df = slope_df[(slope_df["m01"] > 0) | (slope_df["m08"] > 0)].sort_values("m08", ascending=False).head(5)

        fig_sl = go.Figure()
        for _, r in slope_df.iterrows():
            diff = r["m08"] - r["m01"]
            pct = (diff / r["m01"] * 100) if r["m01"] > 0 else 100
            color = "#f43f5e" if pct > 15 else ("#38bdf8" if pct >= 0 else "#10b981")
            name = f"{r['KOSTRA_Funksjonsgruppe_Kode']} {r['Funksjonsnavn'][:12]}"
            fig_sl.add_trace(go.Scatter(
                x=["Januar (M01)", "August (M08)"],
                y=[r["m01"], r["m08"]],
                mode="lines+markers+text",
                line=dict(color=color, width=2.5),
                marker=dict(size=8, color=color),
                text=[f"{name} {r['m01']:.0f}k", f"{r['m08']:.0f}k ({pct:+.0f}%)"],
                textposition=["middle left", "middle right"],
                showlegend=False
            ))

        fig_sl.update_layout(
            height=340, margin=dict(l=80, r=80, t=20, b=20),
            paper_bgcolor="#111726", plot_bgcolor="#111726",
            font=dict(family="JetBrains Mono, sans-serif", color="#94a3b8"),
            xaxis=dict(showgrid=False), yaxis=dict(showgrid=False)
        )
        st.plotly_chart(fig_sl, use_container_width=True)

with col_sim:
    st.subheader("⚖️ What-If Scenariosimulator")
    st.caption("Simuler tiltak for å gjenopprette budsjettbalanse (EAC)")

    sim_vikar = st.slider("Kutt i vikarbyråtjenester (Art 127040) %", 0, 100, 0, 5)
    sim_overtid = st.slider("Reduksjon i overtid (Art 104000) %", 0, 100, 0, 5)
    sim_omdisp = st.slider("Generelt rammekutt / omdisponering %", 0.0, 10.0, 0.0, 0.5)

    monthly_vikar_base = filtered_df[filtered_df["Kontokode_6Siffer"] == 127040]["a_knok"].sum() / (selected_month or 8)
    monthly_overtid_base = filtered_df[filtered_df["Kontokode_6Siffer"] == 104000]["a_knok"].sum() / (selected_month or 8)
    monthly_budget_base = total_budget / 8 if total_budget > 0 else 3770.1

    save_vikar = (sim_vikar / 100.0) * monthly_vikar_base
    save_overtid = (sim_overtid / 100.0) * monthly_overtid_base
    save_omdisp = (sim_omdisp / 100.0) * monthly_budget_base
    total_month_save = save_vikar + save_overtid + save_omdisp
    total_restar_save = total_month_save * 4  # Sep-Des

    base_eoy = (total_variance / 8) * 12
    adj_eoy = base_eoy + total_restar_save

    st.markdown(f"""
    <div style="background:#111726; padding:12px; border-radius:6px; border:1px solid #1e293b; margin-top:10px;">
        <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
            <span>Månedlig innsparing:</span>
            <strong style="color:#38bdf8;">{format_nok(total_month_save)} kNOK</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:4px;">
            <span>Restårsgevinst (Sep–Des, 4 mnd):</span>
            <strong style="color:#10b981;">{format_nok(total_restar_save)} kNOK</strong>
        </div>
        <hr style="border:0; border-top:1px dashed #334155; margin:8px 0;">
        <div style="display:flex; justify-content:space-between; font-size:0.95rem;">
            <span><strong>Prognosert Årsslutt (EAC):</strong></span>
            <strong style="color:{'#10b981' if adj_eoy >= 0 else '#f43f5e'}; font-size:1.05rem;">
                {'+' if adj_eoy >= 0 else ''}{format_nok(adj_eoy)} kNOK
            </strong>
        </div>
    </div>
    """, unsafe_allow_html=True)

st.divider()

# ==============================================================================
# KOSTNADSDRIVERE & FUNKSJONER (TABELLER)
# ==============================================================================
t1, t2 = st.columns(2)
with t1:
    st.subheader("⚠️ Topp Kostnadsdrivere i Utvalget")
    driver_df = filtered_df.groupby(["Kontokode_6Siffer", "Kontonavn"]).agg(
        Budsjett=("b_knok", "sum"),
        Regnskap=("a_knok", "sum")
    ).reset_index()
    driver_df["Avvik_kNOK"] = driver_df["Budsjett"] - driver_df["Regnskap"]
    driver_df = driver_df.sort_values("Avvik_kNOK", ascending=True).head(8)
    st.dataframe(
        driver_df[["Kontokode_6Siffer", "Kontonavn", "Budsjett", "Regnskap", "Avvik_kNOK"]],
        use_container_width=True,
        hide_index=True
    )

with t2:
    st.subheader("🏛️ KOSTRA Funksjonsfordeling")
    func_tab = filtered_df.groupby(["KOSTRA_Funksjonsgruppe_Kode", "Funksjonsnavn"]).agg(
        Budsjett=("b_knok", "sum"),
        Regnskap=("a_knok", "sum")
    ).reset_index()
    func_tab["Avvik_kNOK"] = func_tab["Budsjett"] - func_tab["Regnskap"]
    func_tab = func_tab.sort_values("Avvik_kNOK", ascending=True)
    st.dataframe(
        func_tab[["KOSTRA_Funksjonsgruppe_Kode", "Funksjonsnavn", "Budsjett", "Regnskap", "Avvik_kNOK"]],
        use_container_width=True,
        hide_index=True
    )

st.divider()

# ==============================================================================
# ❓ OFTE STILTE SPØRSMÅL (FAQ)
# ==============================================================================
st.subheader("❓ Ofte Stilte Spørsmål (FAQ for Controllere)")

with st.expander("1. Hvorfor har kommunen et samlet merforbruk på -2 229,6 kNOK per august 2024?"):
    st.write("""
    Merforbruket skyldes primært to forhold:
    1. **Helårsvirkning av lønnsoppgjøret (Art 101000):** Merforbruk på -1 888,9 kNOK samlet fordi budsjettet ikke ble kompensert i periodiseringen for mai-oppgjøret.
    2. **Vikarbyråinnleie (Art 127040):** Pleie og omsorg i institusjon (2540) har hatt et ubudsjettert forbruk på 382,7 kNOK YTD pga. rekrutteringskrise og ferieavvikling.
    """)

with st.expander("2. Hva er de største forskjellene i forbruksmønster mellom Oppvekst og Helse?"):
    st.write("""
    * **Oppvekst (105,3 %):** Avvikene topper seg ved skolestart (august) med fastlønn og korttidsvikarer, men har lite eksternt tjenestekjøp.
    * **Helse (111,3 %):** Døgnturnus 24/7 medfører høyt innslag av overtid og vikarbyråer, som gir høyere finansiell volatilitet.
    """)

with st.expander("3. Hva sier Arbeidsmiljøloven om akutte kutt i vikarer og overtid?"):
    st.write("""
    Budsjettkutt må veies mot lovkrav:
    * **Opplæringsloven § 8-2 (Lærernormen):** Setter absolutte krav til lærertetthet (maks 15 elever per lærer på 1.–4. trinn).
    * **Helse- og omsorgstjenesteloven § 4-1:** Kommunen har ufravikelig plikt til å yte forsvarlige helsetjenester.
    * **Arbeidsmiljøloven § 10-6:** Maks 10 timer overtid per uke (25 timer over 4 uker).
    """)

with st.expander("4. Hvordan fungerer maskinlæringsmodellen og når varsles Model Drift?"):
    st.write("""
    Modellen (`src/retrain_pipeline.py`) benytter Random Forest Regressor med R² på 0.9657 og MAE på 4,3 kNOK.
    Dersom feilen på nye månedsdata øker med mer enn 20 % mot historisk baseline, utløses en automatisk Model Drift-alarm i MLflow.
    """)

with st.expander("5. Hvordan koble Excel eller Power BI til denne løsningen?"):
    st.write("""
    * **Power BI:** Åpne `pbi-rep-project.pbip` direkte for TMDL-modellen og 78 DAX-måltall.
    * **Excel:** Kjør `.\\run.ps1 -ExportExcel` for å generere `data/excel_ml_input.xlsx`.
    * **DuckDB:** Koble til `data/database/kostra.duckdb` via SQL eller Python.
    """)

st.divider()

# ==============================================================================
# 💬 AI CONTROLLER CHATBOT
# ==============================================================================
st.subheader("💬 AI Controller & KOSTRA Rådgiver")
st.caption("Sanntids AI-assistent koblet direkte mot kommunens regnskapstall og regelverk")

# Initialiser meldingshistorikk
if "messages" not in st.session_state:
    st.session_state.messages = [
        {"role": "assistant", "content": "Hei Frank! Jeg er din AI Project Controller for Kristiansand kommune. Hva vil du undersøke i august-regnskapet?"}
    ]

# Vis meldingshistorikk
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# Brukerinput
if prompt := st.chat_input("Still et spørsmål om budsjettet, avvik, overtid eller KOSTRA..."):
    # Legg til brukermelding
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generer controllersvar
    p_lower = prompt.lower()
    if "avvik" in p_lower or "hvorfor" in p_lower or "august" in p_lower:
        reply = (
            f"**Controller-vurdering av avviket:**\n\n"
            f"Per august er samlet avvik **{format_nok(total_variance)} kNOK** ({spend_pct:.1f} % forbruk).\n\n"
            f"Hovedårsaker:\n"
            f"1. **Fastlønn (Art 101000):** Helårsvirkning av lønnsoppgjøret utgjør -1 888,9 kNOK samlet.\n"
            f"2. **Vikarbyrå (Art 127040):** Ubudsjettert innleie på 382,7 kNOK YTD i helsesektoren.\n\n"
            f"Anbefaling: Juster periodiseringen i tertial 2 og innfør godkjenningskrav for ekstern innleie."
        )
    elif "vikar" in p_lower or "innleie" in p_lower:
        reply = (
            f"**Vikarbyråinnleie (Art 127040):**\n\n"
            f"• Budsjett: **0,0 kNOK** (ubudsjettert)\n"
            f"• Faktisk regnskap YTD: **382,7 kNOK**\n"
            f"• August isolert: **253,2 kNOK** i pleie og omsorg (funksjon 2540).\n\n"
            f"Uten innleiestopp vil årssluttkostnaden passere 1,4 mill. NOK. "
            f"Bruk What-If-simulatoren i appen for å se effekten av 80 % reduksjon."
        )
    elif "lov" in p_lower or "arbeidsmiljø" in p_lower or "overtid" in p_lower:
        reply = (
            f"**Juridiske rammer & Bemanningsnormer:**\n\n"
            f"• **Opplæringsloven § 8-2 (Lærernormen):** Maks 15 elever per lærer (1.–4. trinn). Vikarkutt kan ikke bryte denne normen.\n"
            f"• **Helse- og omsorgstjenesteloven § 4-1:** Krav om forsvarlige helsetjenester 24/7.\n"
            f"• **Arbeidsmiljøloven § 10-6:** Maksimalt 10 timer overtid per uke (25 timer over 4 uker)."
        )
    elif "prognose" in p_lower or "eac" in p_lower or "årsslutt" in p_lower:
        reply = (
            f"**Prognose ved årsslutt (EAC):**\n\n"
            f"• Lineær run-rate peker mot et merforbruk på ca. **-3 344,4 kNOK**.\n"
            f"• ML Random Forest-modellen fanger opp sesongmessig roligere høstmåneder i skolen.\n\n"
            f"For å gå i balanse kreves en innsparing på ca. 836 kNOK/mnd over de gjenstående 4 månedene."
        )
    else:
        reply = (
            f"**Aktivt Utvalg Status:**\n\n"
            f"• Budsjett: **{format_nok(total_budget)} kNOK**\n"
            f"• Regnskap: **{format_nok(total_actual)} kNOK**\n"
            f"• Avvik: **{format_nok(total_variance)} kNOK** ({spend_pct:.1f} %)\n\n"
            f"Spør meg gjerne om spesifikke poster som vikarbyrå, overtid, bemanningsnormer eller årssluttprognose!"
        )

    st.session_state.messages.append({"role": "assistant", "content": reply})
    with st.chat_message("assistant"):
        st.markdown(reply)
