"""report.html -> report.pdf with headless Chrome. Backgrounds print because the page CSS
sets print-color-adjust: exact and an @page background; the per-page label and footer
come from CSS page margin boxes (Chrome 131+)."""

import os
import shutil
import subprocess
import tempfile
from pathlib import Path

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "google-chrome",
    "chromium",
    "chromium-browser",
]


class PdfError(RuntimeError):
    pass


def find_chrome(explicit=None):
    for candidate in ([explicit] if explicit else []) + CHROME_CANDIDATES:
        if not candidate:
            continue
        if Path(candidate).is_file():
            return str(Path(candidate))
        found = shutil.which(candidate)
        if found:
            return found
    return None


def html_to_pdf(html_path, pdf_path, chrome=None, timeout=180):
    exe = find_chrome(chrome)
    if not exe:
        raise PdfError("Chrome was not found; pass --chrome with the path to chrome.exe")
    html_path, pdf_path = Path(html_path).resolve(), Path(pdf_path).resolve()
    if pdf_path.exists():
        pdf_path.unlink()
    # A throwaway profile keeps this away from the user's own Chrome session.
    with tempfile.TemporaryDirectory(prefix="avs-chrome-", ignore_cleanup_errors=True) as profile:
        cmd = [
            exe, "--headless=new", "--disable-gpu", "--no-first-run", "--no-default-browser-check",
            "--disable-extensions", "--disable-sync", f"--user-data-dir={profile}", "--no-pdf-header-footer",
            "--run-all-compositor-stages-before-draw", "--virtual-time-budget=20000",
            f"--print-to-pdf={pdf_path}", html_path.as_uri(),
        ]
        try:
            proc = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        except subprocess.TimeoutExpired:
            raise PdfError("Chrome timed out while printing the PDF") from None
    if not pdf_path.is_file() or pdf_path.stat().st_size < 1000 or pdf_path.read_bytes()[:5] != b"%PDF-":
        raise PdfError(f"Chrome did not produce a PDF (exit code {proc.returncode})")
    return pdf_path
