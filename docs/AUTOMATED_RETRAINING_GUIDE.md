# Månedlig Automatisk Om-trening & ML-Overvåking 🔄🤖

Denne guiden beskriver hvordan du setter opp den automatiske månedlige om-treningspipelinen (`retrain_pipeline.py`) for KOSTRA regnskapsprognoser, samt hvordan du overvåker **Model Drift** med **MLflow**.

---

## 🏗️ Hvorfor Månedlig Om-trening?

Kommunale KOSTRA-regnskap oppdateres hver måned. En stillestående statisk prognosemodell vil raskt miste presisjonen dersom:
1. **Sesongmønstre endrer seg** (f.eks. uforutsett høy vikarbruk i mai/desember).
2. **Nye budsjettvedtak eller rammekutt** blir innført midt i budsjettåret.
3. **Model Drift oppstår**: Modellens prediksjonsfeil (MAE/RMSE) avviker vesentlig fra historisk baseline.

Ved å automatisk om-trene ML-modellen hver gang nye KOSTRA-tall importeres, opprettholder du en treffsikker EOY-prognose.

---

## ⚙️ Slik fungerer `retrain_pipeline.py`

Pipelinen utfører følgende trinn helt automatisk:

```text
[ Ny KOSTRA data (DuckDB / CSV) ]
               │
               ▼
[ Preprocessing & Feature Engineering ] (Måned, Kvartal, Funksjon, Kontokode, Budsjett)
               │
               ▼
[ Model Trening & Evaluering ] (Random Forest Regressor)
               │
               ▼
[ Model Drift Sjekk ] ──► Dersom feil øker > 20% ──► ⚠️ Utløser Drift Alert i MLflow
               │
               ▼
[ Lagrer 'models/kostra_forecast_latest.pkl' & Logger til MLflow ]
```

---

## 💻 Kjøring og Kommandoer

### 1. Manuell Kjøring i Terminalen / VS Code
```powershell
# Alternativ A: Via felles PowerShell-styringsskript (anbefalt)
.\run.ps1 -Retrain

# Alternativ B: Direkte Python-kall mot DuckDB
python src/retrain_pipeline.py

# Kjøre med egendefinert drift-terskel (f.eks. 15%)
python src/retrain_pipeline.py --drift-threshold 15.0
```

### 2. Åpne MLflow Dashboard
For å sjekke historiske kjøringer, ML-parametere og modell-driftskurver visuelt:
```powershell
# Via run.ps1:
.\run.ps1 -Mlflow

# Eller direkte:
mlflow ui --backend-store-uri sqlite:///data/database/mlflow.db
```
Åpne nettleseren på `http://localhost:5000`.

---

## ⏰ Automatisk Kjøring (Scheduling)

### A. Windows Task Scheduler (Lokal PC)
1. Åpne **Task Scheduler** i Windows.
2. Opprett en ny oppgave: *"KOSTRA ML Monthly Retraining"*.
3. **Trigger:** Månedlig (f.eks. den 5. hver måned kl. 06:00, etter at KOSTRA-tallene er innlest).
4. **Action:** Start a program.
   * *Program:* `C:\path\to\antigravity-kostra\venv\Scripts\python.exe`
   * *Arguments:* `retrain_pipeline.py`
   * *Start in:* `C:\path\to\antigravity-kostra`

### B. Power Automate (Skyaustomatisering)
Når en ny `fact_komskole.csv` lastes opp i SharePoint/Teams, kan Power Automate utløse en **Local Gateway Execution** av `retrain_pipeline.py`.

---

## 🔗 Integrasjon med Streamlit & Power BI

Den om-trente modellen lagres automatisk til `models/kostra_forecast_latest.pkl`. 
* **Streamlit (`app.py`):** Laster automatisk opp den nyeste `.pkl`-modellen og viser de sesongjusterte ML-prognosene side om side med Power BI-måltallene.
* **Legal AI Agent (Gemini Flash):** Bruker de opdaterte ML-prognosene som grunnlag når den vurderer om et innkjøps- eller vikarkutt er juridisk gjennomførbart!
