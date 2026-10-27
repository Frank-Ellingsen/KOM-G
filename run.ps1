<#
.SYNOPSIS
    Antigravity KOSTRA AI Workbench - Hovedstyringsskript for PowerShell.

.DESCRIPTION
    Samler alle prosjektkommandoer for DuckDB, ML-omtrening, Docker-orkestrering,
    Streamlit, MLflow, PDF-rapporter, eInnsyn/NOARK 5 forsendelse og Git.

.EXAMPLE
    .\run.ps1 -BuildDB
    .\run.ps1 -Reports
    .\run.ps1 -DispatchPDF
    .\run.ps1 -Up
    .\run.ps1 -Retrain
    .\run.ps1 -All
#>

param(
    [switch]$BuildDB,
    [switch]$ExportExcel,
    [switch]$Reports,
    [switch]$DispatchPDF,
    [switch]$SendEmail,
    [string]$Recipient = "postmottak@kristiansand.kommune.no",
    [switch]$Retrain,
    [switch]$Up,
    [switch]$Down,
    [switch]$Logs,
    [switch]$Mlflow,
    [switch]$Streamlit,
    [switch]$GitPush,
    [switch]$All,
    [string]$CommitMessage = "Update KOSTRA AI Workbench"
)

$ErrorActionPreference = "Stop"

function Write-Header ($text) {
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host " [>] $text" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
}

function Write-Success ($text) {
    Write-Host " [+] $text" -ForegroundColor Green
}

function Write-Info ($text) {
    Write-Host " [i] $text" -ForegroundColor Yellow
}

# Hjelpemeny dersom ingen parametere er oppgitt
if (-not ($BuildDB -or $ExportExcel -or $Reports -or $DispatchPDF -or $SendEmail -or $Retrain -or $Up -or $Down -or $Logs -or $Mlflow -or $Streamlit -or $GitPush -or $All)) {
    Write-Header "ANTIGRAVITY KOSTRA AI WORKBENCH - POWERSHELL MENY"
    Write-Host "Bruk: .\run.ps1 [parameter]" -ForegroundColor White
    Write-Host ""
    Write-Host "  -BuildDB       : Bygg DuckDB-databasen (data/database/kostra.duckdb) fra CSV-filer"
    Write-Host "  -ExportExcel   : Eksporter ferdige Excel-ark for ML-modellering"
    Write-Host "  -Reports       : Generer publiseringsklare executive PDF-månedsrapporter"
    Write-Host "  -DispatchPDF   : Klargjør seneste PDF-saksutredning med NOARK 5 metadata for eInnsyn"
    Write-Host "  -SendEmail     : Send PDF som saksnotat via e-post (Bruk -Recipient <adresse>)"
    Write-Host "  -Retrain       : Om-tren ML-prognosemodellen og sjekk Model Drift"
    Write-Host "  -Up            : Start hele Docker-stacken (Streamlit + MLflow)"
    Write-Host "  -Down          : Stopp Docker-stacken"
    Write-Host "  -Logs          : Vis levende logger fra Docker-containerne"
    Write-Host "  -Mlflow        : Start lokal MLflow UI (http://localhost:5000)"
    Write-Host "  -Streamlit     : Start lokal Streamlit UI (http://localhost:8501)"
    Write-Host "  -GitPush       : Commit og push endringer til GitHub"
    Write-Host "  -All           : Bygg database, generer rapporter, start Docker og åpne nettleser"
    Write-Host ""
    Exit
}

# Eksekvering basert på flagg
if ($BuildDB -or $All) {
    Write-Header "Bygger DuckDB Database..."
    python src/db_manager.py --build
    Write-Success "DuckDB database er bygd i data/database/kostra.duckdb!"
}

if ($ExportExcel) {
    Write-Header "Eksporterer data til Excel..."
    python src/db_manager.py --export
    Write-Success "Excel-fil generert i data/excel_ml_input.xlsx!"
}

if ($Reports -or $All) {
    Write-Header "Genererer Executive PDF-Månedsrapporter..."
    python src/generate_executive_reports.py
    Write-Success "Månedsrapporter generert i reports/!"
}

if ($DispatchPDF) {
    Write-Header "Eksporterer til eInnsyn Hotfolder med NOARK 5 metadata..."
    python src/dispatch_manager.py --hotfolder
    Write-Success "eInnsyn hotfolder-eksport fullført!"
}

if ($SendEmail) {
    Write-Header "Sender saksnotat via e-post til $Recipient..."
    python src/dispatch_manager.py --email "$Recipient"
    Write-Success "e-postoperasjon fullført!"
}

if ($Retrain) {
    Write-Header "Kjører ML Om-treningspipeline..."
    python src/retrain_pipeline.py
    Write-Success "ML-modell omtrent og logget til MLflow!"
}

if ($Up -or $All) {
    Write-Header "Starter Docker Stack (Streamlit + MLflow UI)..."
    docker compose up --build -d
    Write-Success "Docker-containere kjører i bakgrunnen!"
    Write-Info "Streamlit AI Workbench: http://localhost:8501"
    Write-Info "MLflow Tracking UI:     http://localhost:5000"
}

if ($Down) {
    Write-Header "Stopper Docker Stack..."
    docker compose down
    Write-Success "Docker-containere stoppet."
}

if ($Logs) {
    Write-Header "Henter Docker-logger (Ctrl+C for å avslutte)..."
    docker compose logs -f
}

if ($Mlflow) {
    Write-Header "Starter MLflow UI lokalt..."
    Write-Info "Åpner på http://localhost:5000..."
    mlflow ui --backend-store-uri sqlite:///data/database/mlflow.db
}

if ($Streamlit) {
    Write-Header "Starter Streamlit App lokalt..."
    Write-Info "Åpner på http://localhost:8501..."
    streamlit run src/app.py
}

if ($GitPush) {
    Write-Header "Kjører Git Commit og Push..."
    git add .
    git commit -m "$CommitMessage"
    git push origin main
    Write-Success "Endringer publisert til GitHub!"
}

if ($All) {
    Write-Header "Åpner nettleser..."
    Start-Process "http://localhost:8501"
    Start-Process "http://localhost:5000"
}
