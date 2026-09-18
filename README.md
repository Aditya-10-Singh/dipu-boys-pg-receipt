# DIPU BOYS PG - Payment Receipt Generator

A simple, professional, mobile-responsive **Payment Receipt Generator & Manager** website built for **DIPU BOYS PG** (*Near Assam down town University Gate, Guwahati - 781026*).

This web application visually reproduces the original PG payment receipt design while providing real-time receipt previews, device memory for payment details, 1-click PDF export, and standard A4 printing.

---

## 🎨 Features & Highlights

- **Visual Reference Accuracy**: Matches the original receipt layout, dark navy color palette (`#16324f`), house branding logo, decorative wave accents, and handwritten cursive script notes (*"Home Away From Home"* and *"Thank You! For staying with us"*).
- **Editable Receipt Fields**:
  - **Date**: Editable field (auto-defaults to today's date).
  - **Period**: Editable duration (e.g., `01/09/2026 to 30/09/2026`).
  - **Resident Name**: Editable resident name.
  - **Particulars**: Multi-line item breakdown (Room Rent, Mess Charges, Maintenance) with dynamic add/remove line items.
  - **Total Paid**: Bold numerical amount display.
  - **Payment Details**: Editable `Payment To`, `UPI ID`, optional `Transaction ID`, and optional `Payment Mode`.
- **Auto Indian Currency Number-to-Words**: Automatically converts numerical amounts (e.g. `6500`) into Indian Rupee words (*"Six Thousand Five Hundred Rupees Only"*) with manual edit override.
- **Device LocalStorage Memory**: Save owner payment details (`Payment To`, `UPI ID`) to the browser local storage so they auto-fill on every launch without re-typing.
- **High-Quality PDF Download**: Export crisp 300 DPI A4 landscape PDFs using `html2pdf.js`.
- **Clean A4 Printing**: Optimized `@media print` CSS rules for printing directly without cut-off margins or unwanted UI headers.
- **Mobile & Desktop Responsive**: Side-by-side layout for laptops/desktops and easy tabbed view (*1. Enter Details* / *2. View Receipt*) for mobile phones.

---

## 🏢 Business Details

- **Business Name**: DIPU BOYS PG
- **Address**: Near Assam down town University Gate, Guwahati - 781026
- **Tagline**: SAFE STAY • BETTER TOMORROW
- **Default UPI ID**: `dipuboyspg01@cnrb`

---

## 💻 Local Quick Start

### Method 1: Open Directly in Browser
Simply double-click `index.html` in your file browser to open the app directly in Google Chrome, Microsoft Edge, or any browser.

### Method 2: Node.js Local Server
```bash
# Clone or navigate to the repository folder
cd dipu-boys-pg-receipt-generator

# Start local server
node server.js
```
Open **`http://localhost:3000`** in your web browser.

---

## 📁 File Structure

```text
dipu-boys-pg-receipt-generator/
├── index.html        # Main application UI and printable receipt canvas
├── css/
│   └── styles.css    # Custom CSS styles, typography, wave vectors & print rules
├── js/
│   └── app.js        # Real-time binding, number-to-words, LocalStorage & PDF logic
├── server.js         # Lightweight Node.js HTTP server for local testing
├── .gitignore        # Git ignore rules
└── README.md         # Project documentation
```

---

## 📜 License
This project is created for **DIPU BOYS PG**. Free to customize and distribute.
