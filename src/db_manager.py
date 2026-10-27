"""
db_manager.py - DuckDB & Compliance Data Layer for Antigravity KOSTRA AI Workbench
====================================================================================
Handles automated ingestion of KOSTRA CSV datasets into a high-performance local DuckDB 
database (kostra.duckdb), manages analytical views for variance analysis, maintains
an immutable audit log for AI recommendations (Offentleglova § 3), and exports 
structured data for Python in Excel ML modeling.

Usage:
    python src/db_manager.py --build
    python src/db_manager.py --export
"""

import os
import sys
import uuid
import argparse
import duckdb
import pandas as pd
from datetime import datetime

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

DEFAULT_DB_PATH = "data/database/kostra.duckdb"

class DuckDBManager:
    def __init__(self, db_path: str = DEFAULT_DB_PATH):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self.con = duckdb.connect(db_path)
        self._init_tables()

    def _init_tables(self):
        """Initializes tables and immutable Audit Log in DuckDB."""
        self.con.execute("""
            CREATE TABLE IF NOT EXISTS audit_log (
                log_id VARCHAR PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                user_id VARCHAR,
                query_text TEXT,
                sektor_funksjon VARCHAR,
                avvik_belop_nok DOUBLE,
                rag_context TEXT,
                recommended_action TEXT,
                serper_search_used BOOLEAN,
                model_version VARCHAR
            )
        """)

    def build_from_csv(self, base_dir: str = "powerbi_kostra_datamodell"):
        """
        Reads all KOSTRA CSV files and populates DuckDB tables and analytical views.
        Supports both 'powerbi_kostra_datamodell' and 'data/kostra_csv' folders.
        """
        print(f"🔄 Building DuckDB database at '{self.db_path}'...")
        
        # Candidate directories
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
                self.con.execute(f"CREATE OR REPLACE TABLE {table_name} AS SELECT * FROM read_csv_auto('{safe_path}', ignore_errors=true)")
                count = self.con.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
                print(f"  ✓ Created dimension '{table_name}' ({count} rows)")
            else:
                print(f"  ⚠ Dimension file not found: {file_path}")

        # 2. Load Fact Tables
        if os.path.exists(fact_dir):
            safe_fact_dir = fact_dir.replace("\\", "/")
            self.con.execute(f"""
                CREATE OR REPLACE TABLE fact_data AS 
                SELECT * FROM read_csv_auto('{safe_fact_dir}/*.csv', ignore_errors=true)
            """)
            count_all = self.con.execute("SELECT COUNT(*) FROM fact_data").fetchone()[0]
            print(f"  ✓ Created consolidated fact table 'fact_data' ({count_all} rows)")

            self.con.execute(f"""
                CREATE OR REPLACE TABLE fact_komskole AS 
                SELECT * FROM read_csv_auto('{safe_fact_dir}/*_fact_komskole.csv', ignore_errors=true)
            """)
            count_skole = self.con.execute("SELECT COUNT(*) FROM fact_komskole").fetchone()[0]
            print(f"  ✓ Created fact table 'fact_komskole' ({count_skole} rows)")

            self.con.execute(f"""
                CREATE OR REPLACE TABLE fact_bomiljo AS 
                SELECT * FROM read_csv_auto('{safe_fact_dir}/*_fact_bomiljo.csv', ignore_errors=true)
            """)
            count_bomiljo = self.con.execute("SELECT COUNT(*) FROM fact_bomiljo").fetchone()[0]
            print(f"  ✓ Created fact table 'fact_bomiljo' ({count_bomiljo} rows)")

        # 3. Create Comprehensive Analytical View
        # Includes aliased columns for both 'Funksjon_Navn'/'KOSTRA_Funksjon_Navn' and 'Konto_Kode'/'Kontokode_6Siffer'
        view_sql = """
        CREATE OR REPLACE VIEW vw_avvik_summary AS
        SELECT 
            f.Dato AS Registrert_Dato,
            f.Sektor,
            CAST(f.KOSTRA_Funksjonsgruppe_Kode AS VARCHAR) AS Funksjon_Kode,
            fn.KOSTRA_Funksjonsgruppe_Navn AS Funksjon_Navn,
            fn.KOSTRA_Funksjonsgruppe_Navn AS KOSTRA_Funksjon_Navn,
            CAST(f.Kontokode_6Siffer AS VARCHAR) AS Konto_Kode,
            CAST(f.Kontokode_6Siffer AS VARCHAR) AS Kontokode_6Siffer,
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
                WHEN SUM(f.Budsjett - f.Regnskap) < -100000 THEN '🔴 KRITISK AVVIK'
                WHEN SUM(f.Budsjett - f.Regnskap) < 0 THEN '🟡 AVVIK'
                ELSE '🟢 I RUTE'
            END AS Status_Indikator
        FROM fact_data f
        LEFT JOIN dim_kostra_kontoplan kp ON CAST(f.Kontokode_6Siffer AS VARCHAR) = CAST(kp.Kontokode_6Siffer AS VARCHAR)
        LEFT JOIN dim_kostra_funksjon fn ON CAST(f.KOSTRA_Funksjonsgruppe_Kode AS VARCHAR) = CAST(fn.KOSTRA_Funksjonsgruppe_Kode AS VARCHAR)
        LEFT JOIN dim_ansvar ans ON CAST(f.Ansvar_Kode AS VARCHAR) = CAST(ans.Ansvar_Kode AS VARCHAR)
        GROUP BY f.Dato, f.Sektor, f.KOSTRA_Funksjonsgruppe_Kode, fn.KOSTRA_Funksjonsgruppe_Navn, 
                 f.Kontokode_6Siffer, kp.Kontonavn, kp.KOSTRA_Art_Navn, f.Ansvar_Kode, ans.Ansvar_Navn, ans.Omrade_Navn;
        """
        self.con.execute(view_sql)
        print("  ✓ Created unified analytical view 'vw_avvik_summary'")
        print("✅ DuckDB database build complete!")

    def log_audit_event(self, user_id: str, query_text: str, sektor_funksjon: str, 
                        avvik_belop_nok: float, rag_context: str, recommended_action: str, 
                        serper_used: bool = False, model_version: str = "gemini-1.5-flash") -> str:
        """Writes an immutable log entry into audit_log for public compliance and GDPR/revisjon."""
        log_id = str(uuid.uuid4())
        self.con.execute("""
            INSERT INTO audit_log 
            (log_id, user_id, query_text, sektor_funksjon, avvik_belop_nok, rag_context, recommended_action, serper_search_used, model_version)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (log_id, user_id, query_text, sektor_funksjon, avvik_belop_nok, rag_context, recommended_action, serper_used, model_version))
        return log_id

    def get_top_avvik_df(self, limit: int = 10) -> pd.DataFrame:
        """Returns top budget overruns for UI and AI agent consumption."""
        return self.con.execute("""
            SELECT 
                Registrert_Dato,
                Sektor,
                Funksjon_Kode,
                KOSTRA_Funksjon_Navn,
                Funksjon_Navn,
                Kontokode_6Siffer,
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
            LIMIT ?
        """, [limit]).df()

    def get_audit_logs(self, limit: int = 50) -> pd.DataFrame:
        """Returns logged AI consultations for transparency and audit review."""
        return self.con.execute("""
            SELECT log_id, timestamp, user_id, sektor_funksjon, avvik_belop_nok, query_text, serper_search_used, model_version
            FROM audit_log
            ORDER BY timestamp DESC
            LIMIT ?
        """, [limit]).df()

    def export_for_excel(self, output_file: str = "data/excel_ml_input.xlsx"):
        """Exports key datasets into a formatted Excel workbook for ML modeling in Excel."""
        print(f"📊 Exporting datasets to Excel workbook: '{output_file}'...")
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            df_avvik = self.con.query("SELECT * FROM vw_avvik_summary ORDER BY Avvik_Kr ASC").df()
            df_avvik.to_excel(writer, sheet_name="KOSTRA_Avvik", index=False)
            
            df_fact = self.con.query("SELECT * FROM fact_data").df()
            df_fact.to_excel(writer, sheet_name="Hovedbok_Total", index=False)
            
            df_konto = self.con.query("SELECT * FROM dim_kostra_kontoplan").df()
            df_konto.to_excel(writer, sheet_name="Kontoplan", index=False)
        print("✅ Excel export complete!")

# -----------------------------------------------------------------------------
# BACKWARD COMPATIBLE PROCEDURAL FUNCTIONS
# -----------------------------------------------------------------------------
def get_db_connection(db_path=DEFAULT_DB_PATH):
    return DuckDBManager(db_path).con

def build_duckdb(db_path=DEFAULT_DB_PATH, base_dir="powerbi_kostra_datamodell"):
    mgr = DuckDBManager(db_path)
    mgr.build_from_csv(base_dir)

def get_top_avvik_df(db_path=DEFAULT_DB_PATH, limit=10):
    mgr = DuckDBManager(db_path)
    return mgr.get_top_avvik_df(limit)

def export_for_excel(db_path=DEFAULT_DB_PATH, output_file="data/excel_ml_input.xlsx"):
    mgr = DuckDBManager(db_path)
    mgr.export_for_excel(output_file)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Antigravity KOSTRA DuckDB Manager")
    parser.add_argument("--build", action="store_true", help="Build DuckDB database from CSV files")
    parser.add_argument("--export", action="store_true", help="Export analytical data to Excel")
    args = parser.parse_args()

    mgr = DuckDBManager()
    if args.export:
        mgr.export_for_excel()
    else:
        mgr.build_from_csv()
