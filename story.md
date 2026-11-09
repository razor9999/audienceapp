# TEST-1: Reverse engineering kiến trúc dự án

## Goal

Produce a durable, code-accurate map of this **Shopback audience Q&A** repository so development and QC share one picture of how the product is built and how data moves through it.

This app is a live event Q&A stack: admins create time-boxed events with join codes; audiences join by code over Socket.io, ask questions (named or anonymous), and like/dislike; admins approve, rate, and edit questions over JWT-protected REST.

This story documents the system **as it is today**. It does not change product behavior or UI.

## User stories

- As a **developer**, I can open this spec and see the multi-package layout, stack, and which tree owns admin UI, audience UI, API/realtime, and MySQL.
- As a **developer**, I understand the domain model (User, Event, Question) and how it maps to Sequelize models, migrations, and seeders under `backend/src`.
- As a **developer**, I can follow the runtime paths: admin JWT REST for login/events/questions, and audience Socket.io for join, ask, list, and vote.
- As a **runner / agent integrator**, I know where app code lives (`admin/src`, `audience/src`, `backend/src`), how Docker Compose wires services, and which ports each surface uses.
- As **QC**, I can verify every acceptance item against the live codebase and a local Docker/`npm` stack without guessing undocumented behavior.

## Architecture (as built)

### Packages and stack

| Piece | Location | Stack |
|---|---|---|
| Admin web | `admin/src` | Create React App (`react-scripts` 1.x) + React 16 + Redux + Ant Design 3; port **3001** |
| Audience web | `audience/src` | Create React App + React 16 + Ant Design 3 + `socket.io-client`; port **3000** |
| API + realtime | `backend/src` | Node (Docker image `node:6.10`) + Express 4 + Sequelize 3 + MySQL + Socket.io 2 + JWT (`express-jwt` / `jsonwebtoken`); port **6969** |
| Database image | `database-service` | `mysql:latest`; DB `shopback`, root password `123456` |
| Local orchestration | `docker-compose.yml` | Services `security` (backend), `db`, `audience`, `admin` |

There is no root workspace `package.json` and no shared library package. Each of `admin/src`, `audience/src`, and `backend/src` is its own npm package with its own lockfile. App code for the Node/React trees lives under each package’s `src/` directory (Docker `start.sh` scripts `cd` into `/app/admin`, `/app/audience`, `/app/backend` which are volume-mounted from those trees).

Default local URLs (from `README.md` and client config):

- Backend: `http://localhost:6969`
- Audience: `http://localhost:3000` (sample event code `123`)
- Admin: `http://localhost:3001` (seeded `admin` / `123456`)

Admin clients hardcode `SERVER_URL` as `http://localhost:6969` in `admin/src/src/_constants/config.constants.js`. Audience opens Socket.io to `http://localhost:6969/`.

### Layers

```
Admin UI (CRA / React+Redux+AntD :3001)
        │  HTTP REST + Bearer JWT
        ▼
Express API (backend/src) ──────► MySQL (Sequelize)
        │
        │  Socket.io (same HTTP server)
        ▼
Audience UI (CRA / React+AntD :3000)
```

Docker Compose (`docker-compose.yml`):

- `db` builds `./database-service`
- `security` builds `./backend`, depends on `db`, sets `DATABASE_HOST=db`, publishes `6969`
- `audience` builds `./audience`, publishes `3000`
- `admin` builds `./admin`, publishes `3001`

Backend container `start.sh` runs migrate undo/all, seed undo/all, `npm test`, then `npm start`. Admin/audience containers `npm install` then `npm start`.

### Domain (persisted)

Sequelize models in `backend/src/models/`; tables created by migrations under `backend/src/migrations/`.

- **User** (`Users`): `username`, `password` (plaintext compare on login). `hasMany` **Event**. Timestamps disabled on the model definition; migration still creates `createdAt`/`updatedAt`. Seeded demo: `admin` / `123456`.
- **Event** (`Events`): `title`, `code` (join key), `from`, `to` (date window). `belongsTo` **User** (`UserId`, required, cascade delete). `hasMany` **Question**. Paginated via `sequelize-simple-pagination`. Seeded demo: title `Test Event`, code `123`, owned by user id 1.
- **Question** (`Questions`): `content`, `liked`, `disliked`, `rating`, `status` (integer; **0** = waiting approval / hidden from general audience list except own, **1** = approved/visible), `createdBy` (display name string, often `Anonymous`). `belongsTo` **Event** (`EventId`, required, cascade delete). Paginated.

Config (`backend/src/config/config.js`): MySQL dialect for `development` / `test` / `production`; host from `DATABASE_HOST` or `127.0.0.1`; JWT secret `react`, expiry `1d`.

### HTTP API (admin / control)

Mounted in `backend/src/app.js`:

| Method | Path | Auth | Role |
|---|---|---|---|
| `GET` | `/` | none | Health-ish `{ status: 'ok' }` |
| `POST` | `/users/login` | none (Joi body) | Username/password → JWT + username |
| `GET` | `/events` | JWT | Paginated event list |
| `POST` | `/events/create` | JWT | Create event (unique `code`; `UserId` from token) |
| `GET` | `/questions` | JWT | Paginated questions; optional `code` filter (`$like` on event code) |
| `PUT` | `/questions/:question_id` | none in route | Update `content`, `rating`, `status` |
| `POST` | `/questions/create` | JWT | Present in routes; mirrors event-create shape (legacy/unused by current admin UI) |

CORS is enabled globally. Login validation: `backend/src/validations/login.js`.

### Realtime API (audience)

Socket.io attached to the same HTTP server in `backend/src/bin/www` (default port **6969**). Handlers in `backend/src/app.js`:

| Event (client → server) | Behavior | Success emit |
|---|---|---|
| `join` | Lookup event by `code`; require client date within `[from, to]` | `joinSuccess` (event) or `joinFail` (message) |
| `newQuestion` | `Question.create` with `status: 0`, `EventId`, `createdBy` | `newQuestionSuccess` |
| `showQuestion` | Paginate questions for event: approved (`status: 1`) **or** own pending ids in `myQuestion` | `showQuestionSuccess` |
| `likedAndDisliked` | Increment `liked` or `disliked` | `likedAndDislikedSuccess` |

Also tracks connected sockets in an in-memory `userOnline` list and emits `updateUesrList` on disconnect (typo preserved in code).

### Question / event lifecycle (as built)

1. Admin logs in → JWT stored in `localStorage` as `user`.
2. Admin creates an **Event** with `#code` and date range → stored under their `UserId`.
3. Audience enters code → `join` succeeds only if the event exists and “now” is inside `[from, to]`.
4. Audience submits a question → persisted with `status: 0` (waiting approval); id kept in browser `myQuestion` so the asker can still see it.
5. Admin **Question** session lists questions, edits content/rating, toggles **Approval** (`status` 0 ↔ 1).
6. Audience lists approved questions (plus own pending), sorts by likes or recency, and may like/dislike once per browser (localStorage gates duplicate votes).

There is no separate “story status” machine in this product; the only workflow flag is **Question.status**.

### Operator / user surfaces (unchanged by this story)

**Admin** (`admin/src`):

- `/login` — LoginPage
- `/` (PrivateRoute) — HomePage with sider sessions **Event** (EventPage: list + create) and **Question** (QuestionPage: list/search/edit/approve)

**Audience** (`audience/src`):

- Join screen (enter event code)
- In-event Q&A (sidebar event card, ask, sort, like/dislike, switch event)

No new screens are introduced by TEST-1.

## Acceptance criteria

QC verifies against this repository and a local Docker Compose or equivalent `npm` + MySQL setup. Each item is pass/fail with evidence (file path, API/socket observation, or UI observation).

- [ ] **AC1 — Map matches repo layout**  
  Spec lists `admin/`, `audience/`, `backend/`, `database-service/`, and `docker-compose.yml`; tech choices match package manifests (CRA/React 16 + Ant Design on both clients; Express + Sequelize + MySQL + Socket.io on backend; MySQL image for DB). Ports **3000** / **3001** / **6969** match README and scripts.

- [ ] **AC2 — Domain glossary is accurate**  
  User, Event, and Question are defined consistently with Sequelize models in `backend/src/models/` and migrations/seeders (including demo user `admin`/`123456` and event code `123`). Question `status` 0 = waiting approval, 1 = approved is stated.

- [ ] **AC3 — Control paths documented**  
  Spec documents JWT REST for admin login, event list/create, and question list/update; Socket.io events `join`, `newQuestion`, `showQuestion`, `likedAndDisliked` for audience; join requires code + active date window.

- [ ] **AC4 — Client vs server split**  
  Spec states admin owns authenticated operator UI (Redux services hitting `:6969`); audience owns join/Q&A UI over Socket.io to `:6969`; backend owns Express routes, Sequelize/MySQL persistence, JWT issuance, and Socket.io handlers; `database-service` is MySQL-only (no app code).

- [ ] **AC5 — Compose and start behavior named**  
  Spec notes Compose services `security`, `db`, `audience`, `admin`; backend `start.sh` migrates, seeds, tests, then starts; admin/audience `start.sh` install and `npm start`.

- [ ] **AC6 — Surfaces named**  
  Spec names Admin Login, Admin Home (Event / Question sessions), Audience join, and Audience in-event Q&A as current surfaces (no claim of new screens from this story).

- [ ] **AC7 — End-to-end smoke against the map**  
  With DB up (Compose or local MySQL matching `config.js`), migrate/seed, and clients/API running: admin sign-in works with seeded credentials; events and questions pages load; audience can attempt join with code `123` (success depends on seeded event date window vs “today”); observed behavior does not contradict this architecture doc.

- [ ] **AC8 — Deliverable location**  
  This document lives as `story.md` on the story branch. No product code changes are required for TEST-1. No `design/` screens are required (no UI change).

## Out of scope

- Changing admin, audience, backend, or database-service behavior, schemas, APIs, or UI.
- Adding `.forgeline/checks.json`, `AGENTS.md`, or CI wiring (covered by later stories such as TEST-2).
- Hardening security (plaintext passwords, hardcoded JWT secret, open `PUT /questions/:id`).
- Extending beyond existing MySQL + Express + two CRA clients (no new providers, auth systems, or packages).
- Fixing typos or dead routes (e.g. `updateUesrList`, unused `/questions/create`) unless a later story asks.
- New operator/audience screens or visual redesign (hence no `design/*.html`).
- Guaranteeing join success for seeded event `123` when today’s date is outside the seeded `from`/`to` window without reseeding.

## Design

None. No screens change.
