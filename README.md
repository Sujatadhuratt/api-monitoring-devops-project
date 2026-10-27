# API Monitoring & Microservices Health Dashboard

A beginner-friendly DevOps portfolio project for Windows 10/11. It combines React, Node.js/Express, MongoDB, Docker Compose, Prometheus, Grafana, Nodemailer, and GitHub Actions.

## Architecture

- React + Vite: browser dashboard
- Node.js + Express: REST API and Prometheus metrics endpoint
- MongoDB: stores service status history when available
- Prometheus: scrapes `/metrics`
- Grafana: dashboard and Prometheus data source
- Nodemailer: optional email alerts (SMTP settings required)
- Docker Compose: runs the local stack
- GitHub Actions: tests backend and builds Docker images on push/pull request

> This is a learning/demo project, not a production monitoring platform. The example services are simulated. Secure credentials, TLS, persistent storage, authentication, alert deduplication, and deployment hardening before exposing it publicly.

## Prerequisites (Windows)

1. Install Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Install Git: https://git-scm.com/downloads
3. Install VS Code: https://code.visualstudio.com/
4. Create/sign in to GitHub: https://github.com/
5. Start Docker Desktop and wait until it says the engine is running.

Check in PowerShell:
```powershell
docker --version
docker compose version
git --version
```

## Run the full project with Docker Compose

1. Extract this ZIP.
2. Open VS Code → File → Open Folder → select `api-monitoring-devops-project`.
3. Open Terminal → New Terminal.
4. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```
5. Start the stack:
   ```powershell
   docker compose up --build -d
   ```
6. Check containers:
   ```powershell
   docker compose ps
   docker compose logs -f backend
   ```
7. Open these URLs:
   - Dashboard: http://localhost:8081
   - Backend health: http://localhost:5000/health
   - API service list: http://localhost:5000/api/services
   - Prometheus metrics: http://localhost:5000/metrics
   - Prometheus UI: http://localhost:9090
   - Grafana: http://localhost:3001 (default demo login: `admin` / `admin`; change it for any non-local use)

To stop:
```powershell
docker compose down
```
To stop and also delete MongoDB's stored volume data:
```powershell
docker compose down -v
```
Warning: `-v` deletes the database volume.

## Test the API

PowerShell:
```powershell
Invoke-RestMethod http://localhost:5000/health
Invoke-RestMethod http://localhost:5000/api/services
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/demo/failure -ContentType "application/json" -Body '{"service":"Payment Service"}'
Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/demo/recover -ContentType "application/json" -Body '{"service":"Payment Service"}'
```

The failure/recover endpoints simulate a service incident for learning. Do not expose them in a public deployment.

## Email alerts (optional)

Email is disabled unless SMTP values are provided. For Gmail, create an app password (do not use your normal account password) and set the values in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ALERT_TO=recipient@example.com
ALERT_FROM=your-email@gmail.com
```
Restart after editing:
```powershell
docker compose up --build -d backend
docker compose logs -f backend
```
Never commit `.env` or real credentials. `.env` is ignored by Git.

## Run backend tests locally (optional)

Install Node.js LTS from https://nodejs.org/. Then:
```powershell
cd backend
npm install
npm test
npm start
```
Backend runs on port 5000. MongoDB is optional for local tests; without MongoDB the API uses in-memory status history.

## GitHub and CI

Create an empty GitHub repository. From the project root:
```powershell
git init
git add .
git commit -m "Initial API monitoring dashboard"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/api-monitoring-devops-project.git
git push -u origin main
```
Replace `YOUR_USERNAME` with your GitHub username. GitHub Actions runs backend tests and builds the backend and frontend Docker images. No cloud deployment or image publishing is configured yet.

## Folder structure

```text
api-monitoring-devops-project/
├── frontend/                    # React dashboard
├── backend/                     # Express API, metrics, alerts, tests
├── monitoring/prometheus.yml     # Prometheus scrape config
├── monitoring/grafana/           # Provisioned datasource/dashboard
├── .github/workflows/ci.yml      # CI pipeline
├── compose.yaml
├── .env.example
└── README.md
```

## Suggested portfolio upgrades

1. Add authentication and role-based access.
2. Replace simulated service data with real health checks against services you own.
3. Add service latency/error charts and Prometheus alert rules.
4. Add Loki for logs and Tempo/OpenTelemetry for traces.
5. Add deployment to a cloud VM, then Kubernetes.
6. Use Terraform for repeatable infrastructure.
7. Add screenshots, architecture diagram, tests, and a short demo video to your GitHub README.
