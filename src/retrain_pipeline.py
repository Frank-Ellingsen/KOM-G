import os
import sys
import argparse
import datetime
import pandas as pd
import numpy as np

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import duckdb
except ImportError:
    duckdb = None

try:
    import mlflow
    import mlflow.sklearn
    HAS_MLFLOW = True
except ImportError:
    HAS_MLFLOW = False

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

def load_data(db_path="data/database/kostra.duckdb", csv_path="powerbi_kostra_datamodell/faktatabeller/2024_01_fact_komskole.csv"):
    """Laster inn KOSTRA-data enten fra DuckDB eller direkte fra CSV."""
    if duckdb and os.path.exists(db_path):
        print(f"📊 Laster data fra DuckDB: {db_path}")
        con = duckdb.connect(db_path, read_only=True)
        # Bruk konsolidert fact_data dersom den finnes, ellers fact_komskole
        tables = [t[0] for t in con.execute("SHOW TABLES").fetchall()]
        table_to_use = "fact_data" if "fact_data" in tables else "fact_komskole"
        df = con.query(f"SELECT * FROM {table_to_use}").df()
        con.close()
        print(f"  ✓ Hentet {len(df)} rader fra '{table_to_use}'")
    elif os.path.exists(csv_path):
        print(f"📄 Laster data fra CSV: {csv_path}")
        df = pd.read_csv(csv_path)
    else:
        print("⚠️ Ingen eksisterende database eller CSV funnet. Genererer testsett for verifisering...")
        dates = pd.date_range(start="2024-01-01", periods=12, freq="MS")
        data = []
        for d in dates:
            for func in [2020, 2040, 2150]:
                for account in [101000, 102013, 104000]:
                    bud = np.random.uniform(100, 500)
                    season = 1.3 if d.month in [5, 12] and account == 102013 else 1.0
                    reg = bud * np.random.uniform(0.95, 1.25) * season
                    data.append({
                        "date": d.strftime("%Y-%m-%d"),
                        "Funksjon": func,
                        "Kontokode_6Siffer": account,
                        "Budsjett": round(bud, 2),
                        "Regnskap": round(reg, 2)
                    })
        df = pd.DataFrame(data)
    return df

def preprocess_data(df):
    """Forbereder data og genererer sesong- og trend-features for ML-modellen."""
    df = df.copy()
    
    # Standardiser kolonnenavn på tvers av CSV og DuckDB
    if 'Dato' in df.columns and 'date' not in df.columns:
        df['date'] = pd.to_datetime(df['Dato'])
    elif 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])

    if 'KOSTRA_Funksjonsgruppe_Kode' in df.columns and 'Funksjon' not in df.columns:
        df['Funksjon'] = pd.to_numeric(df['KOSTRA_Funksjonsgruppe_Kode'], errors='coerce').fillna(0).astype(int)
    elif 'Funksjon' in df.columns:
        df['Funksjon'] = pd.to_numeric(df['Funksjon'], errors='coerce').fillna(0).astype(int)

    if 'date' in df.columns:
        df['Maned_Nummer'] = df['date'].dt.month
        df['Kvartal'] = df['date'].dt.quarter
    else:
        df['Maned_Nummer'] = 8
        df['Kvartal'] = 3

    df['Kontokode_6Siffer'] = pd.to_numeric(df['Kontokode_6Siffer'], errors='coerce').fillna(0).astype(int)
    df['Budsjett'] = pd.to_numeric(df['Budsjett'], errors='coerce').fillna(0)
    df['Regnskap'] = pd.to_numeric(df['Regnskap'], errors='coerce').fillna(0)
    df['Avvik_Kr'] = df['Budsjett'] - df['Regnskap']
    
    # Lag-features dersom nok historikk finnes
    df['Budsjett_Regnskap_Ratio'] = np.where(df['Budsjett'] > 0, df['Regnskap'] / df['Budsjett'], 1.0)
    
    # Feature matrix (X) og Target (y)
    feature_cols = ['Maned_Nummer', 'Kvartal', 'Funksjon', 'Kontokode_6Siffer', 'Budsjett']
    X = df[feature_cols]
    y = df['Regnskap']
    
    return X, y, df

def train_and_evaluate(X, y, model_dir="models", drift_threshold_pct=20.0):
    """Trener ML-modellen, logger eksperimentet i MLflow og sjekker for Model Drift."""
    os.makedirs(model_dir, exist_ok=True)
    
    # Splitter data (siste 20% som test/siste måned)
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    # Modelltrening (Random Forest Regressor)
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluering
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    mae_train = mean_absolute_error(y_train, y_pred_train)
    mae_test = mean_absolute_error(y_test, y_pred_test)
    rmse_test = np.sqrt(mean_squared_error(y_test, y_pred_test))
    r2_test = r2_score(y_test, y_pred_test)
    
    # Model Drift sjekk: Dersom test-feilen er vesentlig høyere enn treningsfeilen
    drift_pct = ((mae_test - mae_train) / mae_train * 100) if mae_train > 0 else 0
    is_drift = drift_pct > drift_threshold_pct
    
    print("\n" + "="*50)
    print("📈 ML MODEL RETRAINING SUMMARY")
    print("="*50)
    print(f"• Train MAE : {mae_train:,.2f} NOK")
    print(f"• Test MAE  : {mae_test:,.2f} NOK")
    print(f"• Test RMSE : {rmse_test:,.2f} NOK")
    print(f"• Test R²   : {r2_test:.4f}")
    print(f"• Model Drift: {drift_pct:.1f}% endring vs baseline")
    
    if is_drift:
        print(f"⚠️ MODEL DRIFT DETEKTERT (> {drift_threshold_pct}%)! Anbefaler å sjekke nye regnskapstall for avvikende kostnadsdrev.")
    else:
        print("🟢 MODELL I RUTE: Ingen kritisk model drift detektert.")
    print("="*50)

    # MLflow Logging
    if HAS_MLFLOW:
        try:
            os.makedirs("data/database", exist_ok=True)
            mlflow.set_tracking_uri("sqlite:///data/database/mlflow.db")
            mlflow.set_experiment("KOSTRA_Monthly_Retraining")
            with mlflow.start_run(run_name=f"Retrain_{datetime.datetime.now().strftime('%Y%m%d_%H%M')}"):
                mlflow.log_params({
                    "n_estimators": 100,
                    "max_depth": 8,
                    "train_samples": len(X_train),
                    "test_samples": len(X_test)
                })
                mlflow.log_metrics({
                    "mae_train": mae_train,
                    "mae_test": mae_test,
                    "rmse_test": rmse_test,
                    "r2_test": r2_test,
                    "drift_pct": drift_pct
                })
                mlflow.sklearn.log_model(model, "kostra_rf_model")
                print("✓ Rekord og modell logget til MLflow (`sqlite:///data/database/mlflow.db`)")
        except Exception as e:
            print(f"ℹ️ Kunne ikke logge til MLflow: {e}")

    # Lagre den lokal produksjonsmodellen som PKL
    model_path = os.path.join(model_dir, "kostra_forecast_latest.pkl")
    joblib.dump(model, model_path)
    print(f"✓ Ny produksjonsmodell lagret til: {model_path}\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Automatisk om-trening av KOSTRA ML-prognosemodell.")
    parser.add_argument("--db-path", default="data/database/kostra.duckdb", help="Sti til DuckDB databasen")
    parser.add_argument("--drift-threshold", type=float, default=20.0, help="Terskel for Model Drift i prosent")
    args = parser.parse_args()

    df_data = load_data(db_path=args.db_path)
    X_matrix, y_target, _ = preprocess_data(df_data)
    train_and_evaluate(X_matrix, y_target, drift_threshold_pct=args.drift_threshold)
