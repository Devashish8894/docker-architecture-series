# Docker Architecture Series - Episode 1: Microservices Communication & Networking

Welcome to **Episode 1** of the Docker Architecture Series. This repository contains the complete practical code and architecture setup covering container communication, network drivers, custom bridge isolation, and Docker's embedded DNS.

---

## ⏱️ Video Chapters & Timestamp Map

| Timestamp | Chapter Title | Covered in this Repository |
| :--- | :--- | :--- |
| **00:00** | Introduction & Problem Overview | Microservices communication fundamentals & challenges |
| **02:15** | The Microservices Communication Challenge | Host networking vs. container-to-container connectivity |
| **04:30** | Docker Networking Fundamentals | Default network drivers (`bridge`, `host`, `none`) |
| **06:45** | Docker Compose & Default Bridge Networks | Why default bridge lacks automatic DNS resolution |
| **09:00** | Custom Bridge Networks for Isolation | Multi-tier network isolation (`frontend-net`, `backend-net`) |
| **11:15** | Docker's Embedded DNS: Service Discovery | How Docker DNS (`127.0.0.11`) resolves `backend` and `db` |
| **13:30** | Practical Example: Frontend-Backend Communication | Live interactive REST calls across isolated network bridges |
| **15:45** | External Access & Port Mapping | Exposing frontend (`3000:80`) while keeping database unexposed |
| **18:00** | Advanced Considerations & Best Practices | Security segmentation, zero-trust networking, health checks |

---

## 🏛️ Architecture Overview

```
 [ HOST BROWSER ] 
       │ 
       │ Port Mapping: http://localhost:3000 -> 80
       ▼
 ┌─────────────────────────────────────────────────────────────┐
 │  [frontend-net] (Custom Bridge)                            │
 │                                                             │
 │   ┌───────────────────────┐         ┌───────────────────┐   │
 │   │  ep1-frontend (Nginx) │ ──────> │  ep1-backend      │   │
 │   │  Container: Port 80   │  HTTP   │  (Node.js/Express)│   │
 │   └───────────────────────┘         │  Container: 5000  │   │
 └─────────────────────────────────────┼───────────────────┼───┘
                                       │   (Dual-Homed)    │
 ┌─────────────────────────────────────┼───────────────────┼───┐
 │  [backend-net] (Isolated Bridge)    └───────────────────┘   │
 │                                               │             │
 │                                               │ PostgreSQL  │
 │                                               ▼             │
 │                                     ┌───────────────────┐   │
 │                                     │  ep1-db (Postgres)│   │
 │                                     │  Container: 5432  │   │
 │                                     └───────────────────┘   │
 └─────────────────────────────────────────────────────────────┘
```

### Key Architectural Concepts Demonstrated:
1. **Security Segmentation (Custom Bridges)**:
   - `ep1-frontend` can **only** talk to `ep1-backend`. It has **no access** to `ep1-db`.
   - `ep1-db` has **no published ports to the host machine**; it is entirely shielded from public exposure.
2. **Dual-Homed Gateway (`ep1-backend`)**:
   - Belongs to both `frontend-net` and `backend-net`, bridging the client layer and data persistence tier securely.
3. **Automatic Service Discovery (Embedded DNS)**:
   - Backend connects to PostgreSQL simply via `DB_HOST=db`.
   - Frontend proxies API traffic to `http://backend:5000/api/`.

---

## 🚀 Getting Started

### 1. Prerequisites
- Docker Engine installed (version 20.10+)
- Docker Compose installed (v2 recommended)

### 2. Start the Stack
Navigate to this folder (`EP1`) and run:

```bash
docker compose up -d --build
```

### 3. Verify Container Status
```bash
docker compose ps
```

All 3 containers (`ep1-frontend`, `ep1-backend`, `ep1-db`) will be up and running with database healthchecks passed.

---

## 🧪 Testing & Verifying Concepts

### 1. Test Web UI & Service Discovery
Open your browser and navigate to:
```
http://localhost:3000
```
- Click **"Execute API & DB Query"**: verifies Frontend -> Backend -> Database end-to-end communication across isolated bridges.
- Click **"Resolve DNS for 'db'"**: tests Docker's embedded DNS resolving container names into internal IPs.

### 2. Verify Network Isolation with Docker CLI
Inspect the custom networks created by Compose:

```bash
# View all networks
docker network ls

# Inspect frontend network
docker network inspect ep1-frontend-network

# Inspect backend network (Notice frontend is absent!)
docker network inspect ep1-backend-network
```

### 3. Test Network Segmentation (Ping Test)
Verify that `frontend` cannot reach `db` directly:
```bash
# This will fail (cannot resolve 'db' on frontend-net)
docker exec -it ep1-frontend ping -c 2 db

# But backend CAN reach db
docker exec -it ep1-backend ping -c 2 db
```

---

## 🧹 Teardown

To stop and remove containers, networks, and volumes:
```bash
docker compose down -v
```
