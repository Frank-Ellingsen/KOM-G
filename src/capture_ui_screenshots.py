"""
Capture high-DPI screenshots of KOM-G Cockpit UI components for user manual.
"""
import os
import time
from playwright.sync_api import sync_playwright

OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "assets", "ui_previews"))
os.makedirs(OUT_DIR, exist_ok=True)

HTML_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "index.html"))
FILE_URL = f"file:///{HTML_PATH.replace(os.sep, '/')}"

def capture_all():
    print(f"Opening {FILE_URL} in Playwright Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 2x device_scale_factor for crisp retina screenshots
        context = browser.new_context(viewport={"width": 1360, "height": 900}, device_scale_factor=2)
        page = context.new_page()
        page.goto(FILE_URL, wait_until="networkidle")
        
        # Wait for SVG chart to render
        page.wait_for_selector("#tufte-chart-container svg", timeout=10000)
        time.sleep(1)
        
        # 1. Top Navigation & Slicer Ribbon
        print("Capturing 01_top_nav_and_slicers.png...")
        page.locator("header.top-nav").screenshot(path=os.path.join(OUT_DIR, "01_top_nav.png"))
        page.locator("section.slicer-panel").screenshot(path=os.path.join(OUT_DIR, "01_slicers.png"))
        
        # 2. KPI Metrics Grid
        print("Capturing 02_kpi_grid.png...")
        page.locator("section.kpi-grid").screenshot(path=os.path.join(OUT_DIR, "02_kpi_grid.png"))
        
        # 3. Early Warning Risk Alerts
        print("Capturing 03_warning_panel.png...")
        page.locator("section.warning-panel").screenshot(path=os.path.join(OUT_DIR, "03_warning_panel.png"))
        
        # 4. Tufte Visualiseringsstudio & Controller Insight Panel
        print("Capturing 04_tufte_studio.png...")
        page.locator(".content-grid-2col").first.screenshot(path=os.path.join(OUT_DIR, "04_tufte_studio.png"))
        
        # 5. What-If Scenariosimulator
        print("Capturing 05_whatif_simulator.png...")
        # Get the second panel in content-grid-2col
        page.locator(".content-grid-2col .panel").nth(1).screenshot(path=os.path.join(OUT_DIR, "05_whatif_simulator.png"))
        
        # 6. AI Provider Configuration Modal
        print("Capturing 06_ai_modal.png...")
        page.click("#btn-open-ai-modal")
        page.wait_for_selector("#ai-settings-modal:not(.hidden)", timeout=5000)
        time.sleep(0.5)
        page.locator("#ai-settings-modal .ai-modal-card").screenshot(path=os.path.join(OUT_DIR, "06_ai_modal.png"))
        page.click("#btn-close-ai-modal")
        time.sleep(0.3)
        
        # 7. Floating AI Controller Chatbot Window
        print("Capturing 07_ai_chatbot.png...")
        page.click("#chatbot-toggle-btn")
        page.wait_for_selector("#chatbot-window:not(.hidden)", timeout=5000)
        # Also expand key drawer
        page.click("#chat-toggle-key-drawer")
        time.sleep(0.5)
        page.locator("#chatbot-window").screenshot(path=os.path.join(OUT_DIR, "07_ai_chatbot.png"))
        
        browser.close()
        print(f"All UI screenshots captured in {OUT_DIR}!")

if __name__ == "__main__":
    capture_all()
