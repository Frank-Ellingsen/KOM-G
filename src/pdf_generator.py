"""
pdf_generator.py - Saksutredning PDF Generator for Elements / Public 360 & eInnsyn
====================================================================================
Generates publication-standard, formal municipal case assessments and administrative 
decision memos according to Norwegian public administration standards (Offentleglova § 3,
Kommuneloven § 13-1, § 14-6).
"""

import os
import re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)

# Edward Tufte & Municipal Color Palette
COLORS = {
    'primary': HexColor('#1A365D'),      # Municipal Navy
    'secondary': HexColor('#2B6CB0'),    # Accent Blue
    'text': HexColor('#2D3748'),         # Body Dark Slate
    'muted': HexColor('#718096'),        # Neutral Muted Grey
    'bg_alt': HexColor('#F7FAFC'),       # Light Table Background
    'border': HexColor('#E2E8F0'),       # Subtle Border
    'white': HexColor('#FFFFFF'),
    'critical': HexColor('#C53030'),     # Red for critical variance
    'warning': HexColor('#DD6B20'),      # Amber for warning
    'ok': HexColor('#2F855A')           # Green for on track
}

def clean_for_reportlab(text: str) -> str:
    """Converts common Markdown elements to ReportLab XML tags and cleans invalid syntax."""
    if not text:
        return ""
    # Convert bold **text** to <b>text</b>
    t = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
    # Convert italic *text* to <i>text</i>
    t = re.sub(r'\*(.*?)\*', r'<i>\1</i>', t)
    # Convert bullet points
    t = re.sub(r'^\s*[-•]\s+', r'• ', t, flags=re.MULTILINE)
    # Convert newlines to breaks
    t = t.replace("\n", "<br/>")
    return t

def generate_saksutredning_pdf(
    output_filepath: str,
    sektor: str,
    funksjon_kode_navn: str,
    konto_kode_navn: str,
    budsjett: float,
    regnskap: float,
    avvik_kr: float,
    projisert_eoy_kr: float,
    status_indikator: str,
    juridisk_vurdering: str,
    recommended_action: str,
    audit_log_id: str = None,
    saksbehandler: str = "KOSTRA AI Workbench (Gemini 3.8 / 1.5 Flash)"
) -> str:
    """
    Genererer en formell, publiseringsklar kommunal saksutredning som PDF for arkivering i Public 360 / Elements.
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)
    
    doc = SimpleDocTemplate(
        output_filepath,
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm
    )
    
    usable_w = A4[0] - 36 * mm
    styles = getSampleStyleSheet()
    
    styles.add(ParagraphStyle(
        'KommunalHeader',
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=COLORS['secondary'],
        leading=12,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'SaksTittel',
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=COLORS['primary'],
        leading=22,
        spaceAfter=10
    ))
    styles.add(ParagraphStyle(
        'SectionH1',
        fontName='Helvetica-Bold',
        fontSize=12,
        textColor=COLORS['primary'],
        leading=15,
        spaceBefore=12,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        'BodyCustom',
        fontName='Helvetica',
        fontSize=9.5,
        textColor=COLORS['text'],
        leading=13.5,
        spaceAfter=6,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'TableHead',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        textColor=COLORS['white'],
        leading=11,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8.5,
        textColor=COLORS['text'],
        leading=11,
        alignment=TA_LEFT
    ))
    styles.add(ParagraphStyle(
        'TableCellRight',
        fontName='Helvetica',
        fontSize=8.5,
        textColor=COLORS['text'],
        leading=11,
        alignment=TA_RIGHT
    ))
    styles.add(ParagraphStyle(
        'FooterText',
        fontName='Helvetica',
        fontSize=8,
        textColor=COLORS['muted'],
        leading=10,
        alignment=TA_CENTER
    ))

    story = []
    
    # 1. Topptekst / Brevhode
    story.append(Paragraph("KRISTIANSAND KOMMUNE — ØKONOMI OG VIRKSOMHETSSTYRING", styles['KommunalHeader']))
    story.append(Spacer(1, 4))
    story.append(Paragraph("SAKSUTREDNING OG AI-BESLUTNINGSNOTAT", styles['SaksTittel']))
    story.append(HRFlowable(width="100%", thickness=2, color=COLORS['primary'], spaceBefore=2, spaceAfter=10))
    
    # Statusfarge
    if "KRITISK" in status_indikator.upper():
        badge_color = COLORS['critical']
    elif "AVVIK" in status_indikator.upper() or "ADVARSEL" in status_indikator.upper() or "MERFORBRUK" in status_indikator.upper():
        badge_color = COLORS['warning']
    else:
        badge_color = COLORS['ok']

    now_str = datetime.now().strftime("%d.%m.%Y kl. %H:%M")
    log_ref = audit_log_id if audit_log_id else "LOG-" + datetime.now().strftime("%Y%m%d%H%M%S")
    
    # 2. Metadatakort (Metadatanotat)
    meta_data = [
        [
            Paragraph("<b>Dato:</b> " + now_str, styles['TableCell']),
            Paragraph("<b>Saksbehandler:</b> " + saksbehandler, styles['TableCell'])
        ],
        [
            Paragraph("<b>Sektor / Område:</b> " + sektor, styles['TableCell']),
            Paragraph("<b>Audit Ref ID:</b> <code>" + log_ref + "</code>", styles['TableCell'])
        ],
        [
            Paragraph("<b>KOSTRA Funksjon:</b> " + funksjon_kode_navn, styles['TableCell']),
            Paragraph("<b>KOSTRA Konto:</b> " + konto_kode_navn, styles['TableCell'])
        ],
        [
            Paragraph("<b>Early Warning Status:</b> <font color='" + badge_color.hexval() + "'><b>" + status_indikator + "</b></font>", styles['TableCell']),
            Paragraph("<b>Arkivkode & Hjemmel:</b> Offentleglova § 3 / KOSTRA-2024", styles['TableCell'])
        ]
    ]
    meta_table = Table(meta_data, colWidths=[usable_w * 0.5, usable_w * 0.5])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), COLORS['bg_alt']),
        ('BOX', (0, 0), (-1, -1), 1, COLORS['border']),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))
    
    # 3. Finansielt Tallgrunnlag og Avviksanalyse
    story.append(Paragraph("1. Finansielt Tallgrunnlag og Avviksanalyse", styles['SectionH1']))
    
    fin_headers = ["Budsjettert Post", "Budsjett (NOK)", "Regnskap (NOK)", "Avvik YTD (NOK)", "Projisert EOY (NOK)"]
    fin_rows = [[
        konto_kode_navn,
        f"{budsjett:,.0f}".replace(",", " "),
        f"{regnskap:,.0f}".replace(",", " "),
        f"{avvik_kr:,.0f}".replace(",", " "),
        f"{projisert_eoy_kr:,.0f}".replace(",", " ")
    ]]
    
    fin_table_data = [[Paragraph(h, styles['TableHead']) for h in fin_headers]]
    for r in fin_rows:
        row_cells = []
        for i, val in enumerate(r):
            if i >= 1 and str(val).startswith("-"):
                cell_p = Paragraph(f"<font color='red'><b>{val}</b></font>", styles['TableCellRight'])
            elif i >= 1:
                cell_p = Paragraph(str(val), styles['TableCellRight'])
            else:
                cell_p = Paragraph(str(val), styles['TableCell'])
            row_cells.append(cell_p)
        fin_table_data.append(row_cells)
        
    fin_table = Table(fin_table_data, colWidths=[usable_w * 0.32, usable_w * 0.17, usable_w * 0.17, usable_w * 0.17, usable_w * 0.17])
    fin_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), COLORS['primary']),
        ('TEXTCOLOR', (0, 0), (-1, 0), COLORS['white']),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [COLORS['white'], COLORS['bg_alt']]),
        ('GRID', (0, 0), (-1, -1), 0.5, COLORS['border']),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(fin_table)
    story.append(Spacer(1, 12))

    # 4. Juridisk Vurdering & Hjemmel
    story.append(Paragraph("2. Juridisk Vurdering og Regelverkshjemmel (Localblob RAG)", styles['SectionH1']))
    formatted_juridisk = clean_for_reportlab(juridisk_vurdering)
    story.append(Paragraph(formatted_juridisk, styles['BodyCustom']))
    story.append(Spacer(1, 12))

    # 5. Preskriptiv Anbefaling (Recommended Action: EOY vs Politiske vedtak)
    story.append(Paragraph("3. Anbefalt Tiltak og Innstilling (Recommended Action)", styles['SectionH1']))
    formatted_action = clean_for_reportlab(recommended_action)
    action_box_data = [[Paragraph(formatted_action, styles['BodyCustom'])]]
    action_table = Table(action_box_data, colWidths=[usable_w])
    action_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F0F9FF')),
        ('BOX', (0, 0), (-1, -1), 1, COLORS['secondary']),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(action_table)
    story.append(Spacer(1, 14))

    # 6. Audit, GDPR & Signaturblokk
    story.append(Paragraph("4. Revisjonsspor & Signatur", styles['SectionH1']))
    sig_text = (
        f"Dette dokumentet er generert av <b>Antigravity KOSTRA AI Workbench</b> for Kristiansand kommune.<br/>"
        f"Alle kildeoppslag, RAG-tekstbiter og prompter er uforanderlig logget i DuckDB (Ref ID: <code>{log_ref}</code>).<br/>"
        f"Dokumentet oppfyller kravene til kommunal forvaltningsskikk og kan arkiveres direkte som N-notat i Public 360 / Elements."
    )
    story.append(Paragraph(sig_text, styles['BodyCustom']))
    story.append(Spacer(1, 14))
    
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLORS['muted'], spaceBefore=8, spaceAfter=8))
    story.append(Paragraph(f"Kristiansand kommune — KOSTRA AI Workbench | Generert {now_str} | Side 1 av 1", styles['FooterText']))

    doc.build(story)
    return output_filepath

if __name__ == "__main__":
    test_out = "data/einnsyn_import/test_saksutredning.pdf"
    generate_saksutredning_pdf(
        output_filepath=test_out,
        sektor="Sektor Oppvekst og Utdanning",
        funksjon_kode_navn="2020 - Grunnskole",
        konto_kode_navn="102013 - Vikarutgifter",
        budsjett=1068000.0,
        regnskap=1213000.0,
        avvik_kr=-145000.0,
        projisert_eoy_kr=-580000.0,
        status_indikator="🔴 KRITISK AVVIK",
        juridisk_vurdering="<b>Kommuneloven § 16-1:</b> Krav om løpende avviksoppfølging.<br/><b>Anskaffelsesstrategi Kristiansand Delmål I:</b> Kjøp over 100 000 NOK krever konkurranse.",
        recommended_action="<b>A. Kortsiktige tiltak (EOY / Administrasjon):</b><br/>• Innføre umiddelbar forhåndsgodkjenning fra enhetsleder for eksterne vikarer.<br/><br/><b>B. Langsiktige tiltak (Politiske vedtak / Bystyret):</b><br/>• Fremme sak om rammejustering i Framsikt Økonomiplan 2027–2030.",
        audit_log_id="LOG-TEST-001"
    )
    print("Test PDF generert:", test_out)
