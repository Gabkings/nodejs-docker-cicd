# nodejs-docker-cicd

A production-ready Node.js REST API containerized with Docker and deployed automatically via GitHub Actions.
---

## What's in this repo

A task management REST API built with **Express.js** and **PostgreSQL**, demonstrating:

- Multi-stage Dockerfile that produces a lean, secure production image (~150MB)
- Non-root user, health check, and `.dockerignore` best practices
- Docker Compose for local development with PostgreSQL
- GitHub Actions workflow that builds and pushes to Docker Hub on every merge to `main`
- SHA-tagged images for reliable rollbacks

---

## Tech Stack

- **Runtime:** Node.js 18
- **Framework:** Express.js
- **Database:** PostgreSQL 15
- **Containerization:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Registry:** Docker Hub

---

## Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Docker Desktop](https://docs.docker.com/get-docker/)
- A [Docker Hub](https://hub.docker.com) account (for pushing images)

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/gabkings/nodejs-docker-cicd.git
cd nodejs-docker-cicd
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials if running without Docker.

### 3. Run with Docker Compose (recommended)

```bash
docker compose up --build
```

This starts both the Node.js app and a PostgreSQL instance. The app will be available at `http://localhost:3000`.

### 4. Run locally without Docker

```bash
npm install
# Make sure PostgreSQL is running and .env is configured
npm run dev
```

---

## API Endpoints

| Method | Endpoint      | Description         |
|--------|---------------|---------------------|
| GET    | `/health`     | Health check        |
| GET    | `/tasks`      | List all tasks      |
| POST   | `/tasks`      | Create a task       |
| PATCH  | `/tasks/:id`  | Update task status  |

### Example requests

```bash
# Create a task
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn Docker"}'

# List tasks
curl http://localhost:3000/tasks

# Mark as complete
curl -X PATCH http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'

# Health check
curl http://localhost:3000/health
```

---

## Docker

### Build the image manually

```bash
docker build -t nodejs-docker-cicd:latest .
```

### Run the container

```bash
docker run -d -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e DB_NAME=tasksdb \
  -e DB_USER=postgres \
  -e DB_PASSWORD=yourpassword \
  nodejs-docker-cicd:latest
```

---

## CI/CD with GitHub Actions

The workflow at `.github/workflows/docker-publish.yml` runs on every push to `main`:

1. Builds the Docker image using the `production` stage
2. Pushes two tags to Docker Hub:
   - `latest` — always points to the most recent build
   - `sha-xxxxxxx` — pinned to the exact commit for rollbacks
3. Uses GitHub Actions cache to skip rebuilding unchanged layers

**On pull requests:** the image is built and validated but not pushed.

### Set up your own pipeline

Add these secrets to your GitHub repository (**Settings → Secrets → Actions**):

| Secret | Value |
|--------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username |
| `DOCKERHUB_TOKEN` | Docker Hub access token (not your password) |

---

## Project Structure

```
nodejs-docker-cicd/
├── src/
│   └── index.js                        # Express app
├── .github/
│   └── workflows/
│       └── docker-publish.yml          # GitHub Actions workflow
├── Dockerfile                          # Multi-stage production Dockerfile
├── docker-compose.yml                  # Local development setup
├── .dockerignore
├── .env.example
└── package.json
```

---

## Developed By

**Gabriel Gitonga** — Full Stack Developer, Sweden  
