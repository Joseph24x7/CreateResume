# MyNovoResume

MyNovoResume is a premium, paid-tier-grade resume builder featuring a state-of-the-art WYSIWYG document editor and high-fidelity PDF export. It includes the executive **Elegant Diamond** template, fully designed for visual hierarchy, contrast harmony, and ATS compliance.

---

## 🚀 Key Features

### 1. High-End Typography & Premium Palette
* **Color Harmony:** A curated palette featuring Dark Charcoal (`#2B2B2B`) for body readability, Slate Indigo (`#304D89`) for bullet accents, and soft Blue-Gray (`#C8D3E6`) dividers.
* **Serif Headings:** Beautifully styled with Google Fonts Lora (`800` weight for candidate names, `700` weight for section titles, and `italicized` muted subtitles).
* **Grid Spacing:** Formatted using an exact `8px` baseline rhythm grid, ensuring balanced spacing between separate experiences, skills, and margins.

### 2. Layout Engine & Atomic Keep-Together Rules
* **No Logical splits:** The pagination engine groups experience cards and section titles. A job card (header + achievements bullets) is never split across pages unless it is taller than a single page (in which case it splits cleanly after the first bullet).
* **Section Title Protection:** Section headers are automatically bound to their first entry. You will never see an orphan section title at the bottom of a page.
* **WYSIWYG Parity:** Live viewport pagination matching the downloaded PDF precisely.

### 3. Dynamic Page Geometry
* **Top-Aligned First Page:** Removed the top margin on Page 1 to let executive header bands and candidate names align directly against the top edge of the document.
* **Subsequent Page Margins:** Page 2+ retains a professional `36px` top margin to protect content from the top edge.
* **Variable Bounds:** Page 1 content height is `1087px`, and subsequent pages have `1051px` height. Both the editor and PDF generator dynamically adjust.

### 4. Interactive Editor Controls
* **Precision Zoom Slider:** Custom slider to scale the preview layout dynamically between `50%` and `150%`.
* **Instant Presets:** Width Fit (`↔ Width`) and Page Height Fit (`↕ Page`) to resize the viewport instantly.
* **Live Features:** Interactive checkbox toggles (like `◈ Monogram` badge option) and edit panels that remain sticky while the document scrolls.

---

## 🛠️ Technology Stack

* **Frontend:** React, Vite, Vanilla CSS3, jsPDF, html2canvas
* **Backend:** Spring Boot, Java, Maven

---

## 🏃 Getting Started

To run the application locally, open a PowerShell terminal in the project root and execute the startup script:

```powershell
.\start-dev.ps1
```

The script will automatically:
1. Boot the Maven backend server at `http://localhost:8080`.
2. Wait for the backend to become active.
3. Launch the Vite frontend dev server at `http://localhost:5173`.
4. Open the application in your default web browser.

---

## 📦 Building for Production

To compile and bundle the application assets for deployment:

1. **Build Frontend:**
   ```bash
   cd frontend
   npm run build
   ```
2. **Copy Static Assets:**
   Clear out old static assets in `backend/src/main/resources/static/assets` and copy the contents of `frontend/dist/*` into `backend/src/main/resources/static`.
3. **Run Spring Boot:**
   Compile the Spring Boot application using Maven:
   ```bash
   cd backend
   mvn clean package
   ```
