# 📄 Free Resume Creator

**Free Resume Creator** is an enterprise-grade, full-stack platform designed for building ATS-optimised resumes, generating interactive cover letters, scoring resumes against Job Descriptions, and managing target job applications.

---

## ✨ Features Overview

### 📝 1. Live WYSIWYG Resume Editor & Multi-Template System
* **Real-time Viewport Pagination**: WYSIWYG live layout matching downloaded PDFs down to pixel coordinates.
* **Smart Page-Break Geometry**: Prevents orphan section headers and avoids splitting experience cards unnaturally across page boundaries.
* **Curated Templates**: Includes executive designs (*Executive Navy*, *Minimalist Accent*, *Elegant Diamond*) with customizable typography (*Inter*, *Merriweather Sans*, *Mantika Sans*, *Outfit*).
* **Viewport Controls**: Precision zoom slider (`50%` to `150%`), Fit Width (`↔`), and Fit Page (`↕`) controls.

### 📊 2. Standalone ATS Recruiter Decision Engine
* **Hierarchical Skill Taxonomy**: 500+ technology skill ontology spanning Languages, Frameworks, Cloud, Databases, CI/CD, Messaging, Security, and AI/ML.
* **Multi-Dimensional Scoring**: Evaluates Keyword Match, Technical Depth (Basic to Expert), Achievement Metrics (`%`, `$`, `x` multipliers), and Career Seniority Trajectory.
* **Contextual JD Scanner**: Paste any Job Description to analyze match score, missing critical keywords, and recruiter verdict explanations.

### ✉️ 3. Interactive Executive Cover Letter Generator
* **Live Target Application Bar**: Seamlessly set Role, Company Name, and Application Date with automatic profile contact details auto-sync.
* **Single-Page PDF Rendering**: Instant high-fidelity PDF export tailored to standard 1-page letter geometry.

### 📋 4. Career Hub Job Tracker
* Track target applications, application stages (*Applied, Interviewing, Offered, Rejected*), salary ranges, and interviewer notes in a clean workspace board.

### 🔐 5. Isolated SQL Data Seeding & Privacy Safeguards
* **Configurable Data Loading**: Startup data initialization controlled via `app.seed-data.enabled` in `application.yml`.
* **Private Seed Files**: Personal resume data scripts (`data/josephdata.sql`, `data/sweetydata.sql`) are isolated under `src/main/resources/data/` and excluded from git tracking via `.gitignore`.
* **Idempotent Storage**: Uses `DELETE` + `INSERT` / `WHERE NOT EXISTS` queries against embedded local H2 database (`~/.freeresumecreator/resumemaker`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Core** | React 18, Vite 6, React Router DOM 7 |
| **State Management** | Zustand 5 (with debounced undo/redo history) |
| **Styling & Fonts** | Vanilla CSS3, Google Fonts (*Inter, Merriweather Sans, Roboto, Lora, Outfit*) |
| **Backend Framework** | Java 21, Spring Boot 3.4+, Virtual Threads |
| **Database & ORM** | H2 Database, Spring Data JPA, Hibernate, Lombok |
| **PDF Rendering** | Flying Saucer PDF / OpenPDF server-side rendering & browser print engine |
| **Dev Automation** | PowerShell 7 (`start-dev.ps1`), Maven 3 |

---

## 📋 Prerequisites & System Requirements

Before running **Free Resume Creator**, ensure your system has the following installed:

1. **Java Development Kit (JDK 21+)**:
   - Verify with: `java -version`
2. **Node.js (v18.0.0 or higher) & npm**:
   - Verify with: `node -v` and `npm -v`
3. **PowerShell 5.1+ or PowerShell 7+** *(for Windows one-click startup)*.
4. *(Optional)* **Apache Maven** or **IntelliJ IDEA**:
   - `start-dev.ps1` automatically detects Maven on system `PATH` or IntelliJ bundled Maven at `C:\Program Files\JetBrains\IntelliJ IDEA...\plugins\maven-plugin\lib\maven3\bin\mvn.cmd`.

---

## 🏃 Getting Started

### 1️⃣ Option A: One-Click Startup (Recommended for Windows)

Open a PowerShell terminal in the project root directory and execute:

```powershell
.\start-dev.ps1
```

**What the script does automatically:**
1. Verifies frontend and backend directory paths.
2. Checks port availability (stops stale listeners on port `8080` or `5173`).
3. Auto-detects Maven executable.
4. Boots the Spring Boot backend on `http://localhost:8080`.
5. Waits for `http://localhost:8080/api/health` readiness.
6. Launches the Vite frontend dev server on `http://localhost:5173`.
7. Opens `http://localhost:5173` in your default browser.

---

### 2️⃣ Option B: Manual Step-by-Step Launch

If you prefer running frontend and backend in separate terminal windows:

#### **Step 1: Start Backend**
```powershell
cd backend
& 'C:\Program Files\JetBrains\IntelliJ IDEA 2026.2.1\plugins\maven-plugin\lib\maven3\bin\mvn.cmd' spring-boot:run "-Dspring-boot.run.jvmArguments=--add-opens java.base/java.lang=ALL-UNNAMED"
```
*(If standard `mvn` is installed on system PATH, simply run `mvn spring-boot:run`)*.

The backend will start at `http://localhost:8080`.

#### **Step 2: Start Frontend**
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

## 🔌 API Endpoints Reference

### Resumes API (`/api/v1/resumes`)
- `GET /api/v1/resumes`: List all saved resume summaries.
- `POST /api/v1/resumes`: Create a new blank resume.
- `GET /api/v1/resumes/{id}`: Fetch full resume details.
- `PUT /api/v1/resumes/{id}`: Update resume content & metadata.
- `DELETE /api/v1/resumes/{id}`: Delete resume.
- `POST /api/v1/resumes/{id}/export/pdf`: Stream rendered PDF document.

### Seed Template API
- `GET /api/v1/resumes/seed-templates`: List available `.sql` seed templates.
- `POST /api/v1/resumes/seed-templates/{templateName}`: Load seed template on demand into H2 DB.

---

## 🔒 Configuration & Data Seeding

### Seeding Control
In `backend/src/main/resources/application.yml`:
```yaml
app:
  seed-data:
    enabled: true  # Set to false to disable startup seed loading
    files:
      - data/josephdata.sql
      - data/sweetydata.sql
```

### Local Database Path
Embedded H2 database storage is maintained locally in your user home folder:
- **Windows**: `C:\Users\<Username>\.freeresumecreator\resumemaker.mv.db`
- **H2 Console**: Available at `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:~/.freeresumecreator/resumemaker`).

---

## 📦 Building for Production

To create a production-ready bundled deployment:

1. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   ```
2. **Copy Distribution Assets to Backend**:
   Copy all contents of `frontend/dist/*` into `backend/src/main/resources/static/`.
3. **Package Spring Boot JAR**:
   ```bash
   cd backend
   mvn clean package
   ```
4. **Run Production JAR**:
   ```bash
   java -jar target/freeresumecreator-1.0.0.jar
   ```

---

## 📄 License
Distributed under the MIT License.
