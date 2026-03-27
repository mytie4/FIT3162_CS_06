# FIT3162 CS-06 Project

Full-stack application with React frontend, Express backend, and PostgreSQL database.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — for PostgreSQL and pgAdmin
- [Node.js 20+](https://nodejs.org/)

## Quick Start

### 1. Copy environment files

```bash
cp .env.example .env
cp back-end/.env.example back-end/.env
```

### 2. Start the database (Docker)

```bash
docker-compose up -d
```

This starts:

| Service    | URL                   | Description              |
| ---------- | --------------------- | ------------------------ |
| PostgreSQL | localhost:5432        | Database                 |
| pgAdmin    | http://localhost:5050 | PostgreSQL web interface |

### 3. Install dependencies

```bash
npm run install:all
```

### 4. Run the app

```bash
# Terminal 1 – Backend (http://localhost:5000)
npm run dev:backend

# Terminal 2 – Frontend (http://localhost:5173)
npm run dev:frontend
```

## pgAdmin Setup

1. Open http://localhost:5050
2. Login: `admin@admin.com` / `admin`
3. Add a new server:
   - **Host**: `postgres` ← use the container name, not localhost
   - **Port**: `5432`
   - **Username**: `postgres`
   - **Password**: `postgres`

## Docker Commands

```bash
npm run docker:up       # Start PostgreSQL + pgAdmin
npm run docker:down     # Stop containers
npm run docker:logs     # View container logs
npm run docker:clean    # Stop and remove volumes
```

## Dev Container

A fully configured dev container is included for a one-click setup experience.

1. Install the [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension
2. Open the command palette (**Ctrl+Shift+P**) → **Dev Containers: Reopen in Container**
3. The container will automatically:
   - Start PostgreSQL and pgAdmin
   - Install all dependencies (frontend + backend)
   - Set database environment variables

## VS Code Status Bar Buttons

The workspace includes pre-configured status bar buttons (via the **Action Buttons** extension):

| Button | Description |
| ------ | ----------- |
| ▶ Run All | Starts both frontend and backend dev servers |
| ▶ Frontend | Runs Vite dev server (`localhost:5173`) |
| ▶ Backend | Runs Express dev server (`localhost:5000`) |
| 📦 Build All | Builds both projects for production |

You can also use **Ctrl+Shift+D** to access the Run & Debug panel with the same configurations.

## Project Structure

```
├── .devcontainer/      # Dev container configuration
│   ├── devcontainer.json
│   ├── docker-compose.yml
│   ├── Dockerfile
│   └── post-create.sh
├── .vscode/            # VS Code workspace config
│   ├── launch.json     # Run & Debug configurations
│   ├── settings.json   # Status bar buttons
│   └── tasks.json      # Build & run tasks
├── back-end/           # Express.js + TypeScript API
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── db/         # PostgreSQL connection
│   │   └── routes/
│   └── package.json
├── front-end/          # React + Vite frontend
│   ├── src/
│   └── package.json
├── docker-compose.yml  # PostgreSQL + pgAdmin only
└── package.json        # Root convenience scripts
```

## Environment Variables

### Root `.env`

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=fit3162_db
PGADMIN_EMAIL=admin@admin.com
PGADMIN_PASSWORD=admin
```

### `back-end/.env`

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/fit3162_db
```
