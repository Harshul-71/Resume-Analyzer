# Resume-Analyzer
AI Resume Analyzer & ATS Platform 🚀
A modern full-stack web application designed for HR professionals, recruiters, and candidates to analyze resumes, score ATS compatibility, track application pipelines, generate downloadable PDF reports, and visualize real-time recruitment analytics using Chart.js.
---
🌟 Key Features
📄 Automated Resume Parsing: Parses PDF and Word (`.docx`) documents to extract candidate contact details, skills, experience, and education history.
⚡ AI ATS Scoring & Breakdown: Evaluates candidate resumes against job descriptions to produce ATS match percentage, overall match ratings, skill matching breakdown, and gap identification.
📊 Analytics Dashboard: Interactive Chart.js data visualizations for:
Application Status Breakdown (Shortlisted, Rejected, Pending)
ATS Score Distribution (Histogram frequency ranges)
Skills Frequency Distribution (Top candidate skills)
Experience & Education Alignment
Top Skills Leaderboard
Top Candidates Leaderboard with direct report access
📑 PDF Report Generator: Generates professional PDF analysis reports using ReportLab featuring candidate details, score breakdown tables, AI summary, skills comparison, and recommendations.
⏬ React PDF Download Component: Seamless client-side PDF download with loading state, token authentication, and blob handling.
🔐 Multi-Role Authentication: JWT-based authentication supporting Admin, HR Manager, and Candidate user roles.
📱 Responsive UI: Built with React 19, React-Bootstrap, dynamic CSS animations, and modern card components.
---
🛠️ Technology Stack
Backend
Framework: Django 5.x & Django REST Framework (DRF)
Authentication: JWT (JSON Web Tokens via `rest\_framework\_simplejwt`)
PDF Generation: ReportLab
Resume Parsing: `pdfplumber`, `python-docx`
Database: SQLite (default / development)
Frontend
Framework: React 19, React Router v7, Vite 8
Charts: Chart.js & `react-chartjs-2`
Styling: Bootstrap 5, React-Bootstrap, Vanilla CSS with custom animations
HTTP Client: Axios with JWT interceptors
---
📂 Project Structure
```
Resume/
├── backend/
│   ├── analysis/          # AI Resume Analysis engine \& models
│   ├── analytics/         # Real-time analytics REST APIs
│   ├── applications/      # Job Application management
│   ├── authentication/   # User Registration \& JWT Authentication
│   ├── config/            # Django Settings \& root URL Routing
│   ├── jobs/              # Job Posting management
│   ├── notifications/     # Notification service
│   ├── reports/           # PDF Report Generation \& Serializers
│   ├── resume/            # Resume File Upload \& Parsing logic
│   ├── users/             # User Profiles \& Role permissions
│   ├── manage.py          # Django Management script
│   └── requirements.txt   # Python Dependencies
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable React UI \& Layout Components
│   │   ├── context/       # Auth Context \& State Management
│   │   ├── pages/         # Dashboard, Analytics \& Feature Pages
│   │   ├── services/      # Axios API Client
│   │   ├── App.jsx        # Routing Configuration
│   │   └── main.jsx       # Entry Point
│   ├── package.json       # Node.js Dependencies \& Scripts
│   └── vite.config.js     # Vite Config
└── README.md              # Project Documentation \& Installation Guide
```
---
💻 Installation & Setup Guide
Prerequisites
Python: 3.10+
Node.js: 18+
npm: 9+
---
1. Backend Setup
Navigate to the backend directory:
```bash
   cd backend
   ```
Create and activate a Python virtual environment:
Windows:
```bash
     python -m venv venv
     venv\\Scripts\\activate
     ```

   * **macOS/Linux**:

```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. **Install backend dependencies**:

```bash
   pip install -r requirements.txt
   ```
Apply database migrations:
```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
Create a Superuser (Optional for Admin Portal):
```bash
   python manage.py createsuperuser
   ```
Start the Django Backend Development Server:
```bash
   python manage.py runserver
   ```
The backend REST API will be running at `http://localhost:8000/`.
---
2. Frontend Setup
Navigate to the frontend directory:
```bash
   cd ../frontend
   ```
Install Node.js dependencies:
```bash
   npm install
   ```
Start the Vite Development Server:
```bash
   npm run dev
   ```
The React application will be accessible at `http://localhost:5173/` (or port indicated by Vite).
---
🧪 Testing
Running Backend Unit Tests
Execute the Django test suite to verify reports, analytics, user authentication, and application logic:
```bash
cd backend
python manage.py test
```
Building Frontend Production Bundle
Verify that the React frontend compiles cleanly:
```bash
cd frontend
npm run build
```
---
🔗 Key REST API Endpoints
Method	Endpoint	Description	Permission
`POST`	`/api/auth/login/`	Obtain JWT Access and Refresh tokens	Public
`POST`	`/api/auth/register/`	Register candidate account	Public
`GET`	`/api/jobs/hr/`	List HR's posted jobs	HR
`GET`	`/api/applications/my-applications/`	List candidate's applications	Candidate
`POST`	`/api/analysis/run/<app\_id>/`	Run AI Analysis on an application	HR / Admin
`GET`	`/api/reports/<app\_id>/`	Fetch JSON analysis report	HR / Candidate / Admin
`GET`	`/api/reports/<app\_id>/download/`	Stream PDF report download	HR / Candidate / Admin
`GET`	`/api/analytics/dashboard/`	Real-time Analytics Dashboard metrics	Authenticated
---
📄 License
This project is licensed under the MIT License.
