"""
dispatch_manager.py - eInnsyn & NOARK 5 Hotfolder Dispatcher for Public 360 / Elements
========================================================================================
Handles automated packaging of PDF saksutredninger and generation of NOARK 5 metadata
sidecar JSON files for municipal archive ingestion (Public 360, Elements, ACOS Websak),
as well as optional SMTP email dispatch to department heads or postmottak.
"""

import os
import json
import shutil
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from datetime import datetime

def export_to_einnsyn_hotfolder(
    pdf_path: str,
    output_dir: str = "data/einnsyn_import",
    sektor: str = "Sektor Oppvekst og Utdanning",
    funksjon: str = "2020 Grunnskole",
    audit_id: str = "LOG-UNKNOWN"
) -> dict:
    """
    Kopierer PDF til eInnsyn/Public 360 hotfolder og genererer en NOARK 5-kompatibel metadata-JSON.
    """
    os.makedirs(output_dir, exist_ok=True)
    
    filename = os.path.basename(pdf_path)
    base_name = os.path.splitext(filename)[0]
    
    target_pdf = os.path.join(output_dir, filename)
    if os.path.abspath(pdf_path) != os.path.abspath(target_pdf):
        shutil.copy(pdf_path, target_pdf)
    
    now_iso = datetime.now().isoformat()
    
    # NOARK 5 / eInnsyn Metadata Format
    metadata = {
        "noark_version": "5.0",
        "system_id": "KOM-G-KOSTRA-AI-WORKBENCH",
        "journalpost": {
            "tittel": f"Saksutredning KOSTRA Avvik - {sektor} ({funksjon})",
            "journaldato": datetime.now().strftime("%Y-%m-%d"),
            "dokumenttype": "N - Internt notat med oppfølging",
            "tilgangsrestriksjon": "Offentlig (Offentleglova § 3)",
            "saksbehandler": "KOSTRA AI Workbench / Gemini 3.8 Flash",
            "sektor": sektor,
            "funksjon": funksjon,
            "audit_ref_id": audit_id,
            "opprettet_tidspunkt": now_iso
        },
        "filer": [
            {
                "filnavn": filename,
                "format": "PDF/A-1b",
                "mime_type": "application/pdf"
            }
        ]
    }
    
    meta_json_path = os.path.join(output_dir, f"{base_name}_noark5_metadata.json")
    with open(meta_json_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
        
    return {
        "pdf_target": target_pdf,
        "metadata_target": meta_json_path
    }

def send_pdf_email(
    pdf_path: str,
    recipient_email: str,
    subject: str = "KOSTRA AI Saksutredning - Kristiansand Kommune",
    smtp_server: str = None,
    smtp_port: int = 587,
    smtp_user: str = None,
    smtp_pass: str = None
) -> bool:
    """
    Sender PDF-saksutredning som e-postvedlegg via SMTP eller simulerer dersom SMTP ikke er konfigurert.
    """
    if not os.path.exists(pdf_path):
        print(f"❌ Fant ikke PDF-filen: {pdf_path}")
        return False

    smtp_server = smtp_server or os.getenv("SMTP_SERVER", "")
    smtp_user = smtp_user or os.getenv("SMTP_USER", "")
    smtp_pass = smtp_pass or os.getenv("SMTP_PASS", "")

    filename = os.path.basename(pdf_path)

    if not smtp_server:
        print(f"ℹ️ [SIMULERING] SMTP-server ikke konfigurert i .env. PDF '{filename}' klargjort for {recipient_email}.")
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = recipient_email
        msg['Subject'] = subject

        body = (
            "Hei,\n\n"
            "Vedlagt oversendes automatisk generert saksutredning og AI-beslutningsnotat fra KOM-G KOSTRA AI Workbench.\n\n"
            "Dokumentet er klargjort med NOARK 5 metadata for direkte journalføring i kommunens saksarkiv (Public 360 / Elements).\n\n"
            "Med vennlig hilsen,\n"
            "Kristiansand Kommune — KOSTRA AI Workbench"
        )
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        with open(pdf_path, "rb") as f:
            part = MIMEApplication(f.read(), Name=filename)
            part['Content-Disposition'] = f'attachment; filename="{filename}"'
            msg.attach(part)

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        server.send_message(msg)
        server.quit()

        print(f"✅ E-post med {filename} ble sendt til {recipient_email}.")
        return True
    except Exception as e:
        print(f"❌ Feil ved sending av e-post: {e}")
        return False

if __name__ == "__main__":
    import argparse
    import glob

    parser = argparse.ArgumentParser(description="eInnsyn & NOARK 5 Dispatch Manager")
    parser.add_argument("--hotfolder", action="store_true", help="Dispatch latest PDF to eInnsyn hotfolder")
    parser.add_argument("--email", type=str, help="Recipient email address")
    parser.add_argument("--pdf", type=str, default="", help="Specific PDF path to dispatch")
    args = parser.parse_args()

    # Find target PDF
    target_pdf = args.pdf
    if not target_pdf:
        pdfs = glob.glob("data/einnsyn_import/*.pdf") + glob.glob("reports/*.pdf")
        if pdfs:
            target_pdf = max(pdfs, key=os.path.getmtime)

    if args.hotfolder:
        if target_pdf and os.path.exists(target_pdf):
            res = export_to_einnsyn_hotfolder(target_pdf)
            print(f"Pakke klargjort for Public 360 / Elements:\n  PDF: {res['pdf_target']}\n  Metadata: {res['metadata_target']}")
        else:
            print("Fant ingen PDF å eksportere.")

    elif args.email:
        if target_pdf and os.path.exists(target_pdf):
            send_pdf_email(target_pdf, args.email)
        else:
            print("Fant ingen PDF å sende.")
    else:
        # Default test
        print("Testing dispatch manager...")
        test_pdf = "data/einnsyn_import/test_saksutredning.pdf"
        if os.path.exists(test_pdf):
            res = export_to_einnsyn_hotfolder(test_pdf, audit_id="LOG-TEST-001")
            print("Result:", res)

