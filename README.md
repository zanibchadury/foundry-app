# Foundry

An idea board: submit project/startup ideas, filter by category, upvote the ones worth building. This is the **base application** for the Docker → GitHub Actions → GHCR → AWS EC2 deployment assignment.

## Stack

| Layer | Technology |
|---|---|
| App | Node.js, Express |
| DB driver | mysql2 |
| Database | MySQL 8 |
| Frontend | Static HTML/CSS/JS served by Express |
| Containerization | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (GHCR) |
| Hosting | AWS EC2 (Ubuntu) |

## Run it locally without Docker (for development)

```bash
npm install
cp .env.example .env      # fill in your local MySQL credentials
mysql -u root -p < db/init.sql
npm run dev
```

Visit `http://localhost:3000`.

## Run it with Docker Compose (this is what ships to EC2)

```bash
cp .env.compose.example .env
docker compose up --build
```

This starts two containers: `foundry-db` (MySQL, auto-seeded from `db/init.sql`) and `foundry-app` (the Express app on port 3000). Visit `http://localhost:3000`.

To stop:

```bash
docker compose down          # keeps data
docker compose down -v       # wipes the database volume too
```

## API

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/ideas` | List ideas (`?category=` and `?sort=top\|new`) |
| POST | `/api/ideas` | Submit an idea |
| GET | `/api/ideas/:id` | Get one idea |
| PUT | `/api/ideas/:id` | Update an idea |
| DELETE | `/api/ideas/:id` | Delete an idea |
| POST | `/api/ideas/:id/upvote` | Upvote an idea |
| GET | `/api/health` | Health check (used by Docker healthcheck) |

## What's already wired up for the next assignment

- `Dockerfile` — multi-stage, runs as non-root, has a `HEALTHCHECK`
- `docker-compose.yml` — app + MySQL, environment-driven, ready to swap the local `build:` for a pulled GHCR image
- `.github/workflows/ci-cd.yml` — builds the image, pushes to GHCR, then SSHes into EC2 to redeploy
- `src/server.js` — retries the DB connection on boot, since containers can start before MySQL is ready

See the accompanying deployment guide (PDF) for the full step-by-step: EC2 setup, GHCR auth, GitHub Actions secrets, and going live.
