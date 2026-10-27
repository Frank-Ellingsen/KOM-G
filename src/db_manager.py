"""
db_manager.py - DuckDB & Data Layer Manager for Antigravity KOSTRA AI Workbench
================================================================================
Handles automated ingestion of KOSTRA CSV datasets into a high-performance local DuckDB 
database (kostra.duckdb), creates analytical views for variance analysis, and exports 
structured data for Python in Excel ML modeling.

Usage:
    python db_manager.py --build
    python db_manager.py --export
"""

import os
import sys
import argparse
import duckdb
import pandas as pd

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass


def get_db_connection(db_path="data/database/kostra.duckdb"):
    """Returns a DuckDB connection instance."""
    os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
    return duckdb.connect(db_path)


def build_duckdb(db_path="data/database/kostra.duckdb", base_dir="powerbi_kostra_datamodell"):
    """
    Reads all KOSTRA CSV files from powerbi_kostra_datamodell and populates DuckDB tables.
    """
    print(f"🔄 Building DuckDB database at '{db_path}'...")
    con = get_db_connection(db_path)

    dim_dir = os.path.join(base_dir, "dimensjoner")
    fact_dir = os.path.join(base_dir, "faktatabeller")

    # 1. Load Dimensions
    dim_files = {
        "dim_kostra_kontoplan": os.path.join(dim_dir, "dim_kostra_kontoplan.csv"),
        "dim_kostra_funksjon": os.path.join(dim_dir, "dim_kostra_funksjon.csv"),
        "dim_ansvar": os.path.join(dim_dir, "dim_ansvar.csv"),
        "dim_date": os.path.join(dim_dir, "dim_date.csv")
    }

    for table_name, file_path in dim_files.items():
        if os.path.exists(file_path):
            safe_path = file_path.replace("\\", "/")
            con.execute(f"CREATE OR REPLACE TABLE {table_name} AS SELECT * FROM read_csv_auto('{safe_path}', ignore_errors=true)")
            count = con.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
            print(f"  ✓ Created dimension '{table_name}' ({count} rows)")
        else:
            print(f"  ⚠ Dimension file not found: {file_path}")

    # 2. Load Fact Tables
    if os.path.exists(fact_dir):
        safe_fact_dir = fact_dir.replace("\\", "/")
        con.execute(f"""
            CREATE OR REPLACE TABLE fact_data AS 
            SELECT * FROM read_csv_auto('{safe_fact_dir}/*.csv', ignore_errors=true)
        """)
        count_all = con.execute("SELECT COUNT(*) FROM fact_data").fetchone()[0]
        print(f"  ✓ Created consolidated fact table 'fact_data' ({count_all} rows)")

        con.execute(f"""
            CREATE OR REPLACE TABLE fact_komskole AS 
            SELECT * FROM read_csv_auto('{safe_fact_dir}/*_fact_komskole.csv', ignore_errors=true)
        """)
        count_skole = con.execute("SELECT COUNT(*) FROM fact_komskole").fetchone()[0]
        print(f"  ✓ Created fact table 'fact_komskole' ({count_skole} rows)")

        con.execute(f"""
            CREATE OR REPLACE TABLE fact_bomiljo AS 
            SELECT * FROM read_csv_auto('{safe_fact_dir}/*_fact_bomiljo.csv', ignore_errors=true)
        """)
        count_bomiljo = con.execute("SELECT COUNT(*) FROM fact_bomiljo").fetchone()[0]
        print(f"  ✓ Created fact table 'fact_bomiljo' ({count_bomiljo} rows)")

    # 3. Build Analytical View for Variance & Early Warnings
    view_sql = """
    CREATE OR REPLACE VIEW vw_avvik_summary AS
    SELECT 
        f.Dato AS Registrert_Dato,
        f.Sektor,
        f.KOSTRA_Funksjonsgruppe_Kode AS Funksjon_Kode,
        fn.KOSTRA_Funksjonsgruppe_Navn AS Funksjon_Navn,
        f.Kontokode_6Siffer AS Konto_Kode,
        kp.Kontonavn,
        kp.KOSTRA_Art_Navn,
        f.Ansvar_Kode,
        ans.Ansvar_Navn,
        ans.Omrade_Navn,
        SUM(f.Budsjett) AS Sum_Budsjett,
        SUM(f.Regnskap) AS Sum_Regnskap,
        SUM(f.Budsjett - f.Regnskap) AS Avvik_Kr,
        ROUND(SUM(f.Regnskap) * 100.0 / NULLIF(SUM(f.Budsjett), 0), 1) AS Forbruk_Pct,
        CASE 
            WHEN SUM(f.Budsjett - f.Regnskap) < -100000 THEN '🔴 KRITISK'
            WHEN SUM(f.Budsjett - f.Regnskap) < 0 THEN '🟡 MERFORBRUK'
            ELSE '🟢 I RUTE'
        END AS Status_Indikator
    FROM fact_data f
    LEFT JOIN dim_kostra_kontoplan kp ON CAST(f.Kontokode_6Siffer AS VARCHAR) = CAST(kp.Kontokode_6Siffer AS VARCHAR)
    LEFT JOIN dim_kostra_funksjon fn ON CAST(f.KOSTRA_Funksjonsgruppe_Kode AS VARCHAR) = CAST(fn.KOSTRA_Funksjonsgruppe_Kode AS VARCHAR)
    LEFT JOIN dim_ansvar ans ON CAST(f.Ansvar_Kode AS VARCHAR) = CAST(ans.Ansvar_Kode AS VARCHAR)
    GROUP BY f.Dato, f.Sektor, f.KOSTRA_Funksjonsgruppe_Kode, fn.KOSTRA_Funksjonsgruppe_Navn, 
             f.Kontokode_6Siffer, kp.Kontonavn, kp.KOSTRA_Art_Navn, f.Ansvar_Kode, ans.Ansvar_Navn, ans.Omrade_Navn;
    """
    con.execute(view_sql)
    print("  ✓ Created analytical view 'vw_avvik_summary'")
    con.close()
    print("✅ DuckDB database build complete!")


def get_top_avvik_df(db_path="data/database/kostra.duckdb", limit=10):
    """Returns top negative variances for AI Agent / Streamlit consumption."""
    con = get_db_connection(db_path)
    query = f"""
        SELECT 
            Registrert_Dato,
            Sektor,
            Funksjon_Kode,
            Funksjon_Navn,
            Konto_Kode,
            Kontonavn,
            Ansvar_Navn,
            Sum_Budsjett,
            Sum_Regnskap,
            Avvik_Kr,
            Forbruk_Pct,
            Status_Indikator
        FROM vw_avvik_summary
        WHERE Avvik_Kr < 0
        ORDER BY Avvik_Kr ASC
        LIMIT {limit};
    """
    df = con.query(query).df()
    con.close()
    return df


def export_for_excel(db_path="data/database/kostra.duckdb", output_file="data/excel_ml_input.xlsx"):
    """Exports key datasets into a formatted Excel workbook for ML modeling in Excel."""
    print(f"📊 Exporting datasets to Excel workbook: '{output_file}'...")
    con = get_db_connection(db_path)
    
    os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
    with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
        # Sheet 1: Top Variances
        df_avvik = con.query("SELECT * FROM vw_avvik_summary ORDER BY Avvik_Kr ASC").df()
        df_avvik.to_excel(writer, sheet_name="KOSTRA_Avvik", index=False)
        
        # Sheet 2: Ledger
        df_fact = con.query("SELECT * FROM fact_data").df()
        df_fact.to_excel(writer, sheet_name="Hovedbok_Total", index=False)
        
        # Sheet 3: Account Dimension
        df_konto = con.query("SELECT * FROM dim_kostra_kontoplan").df()
        df_konto.to_excel(writer, sheet_name="Kontoplan", index=False)
        
    con.close()
    print("✅ Excel export complete!")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Antigravity KOSTRA DuckDB Manager")
    parser.add_argument("--build", action="store_true", help="Build DuckDB database from CSV files")
    parser.add_argument("--export", action="store_true", help="Export analytical data to Excel")
    args = parser.parse_args()

    if args.export:
        export_for_excel()
    else:
        build_duckdb()

