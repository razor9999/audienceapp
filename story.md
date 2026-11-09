# TEST-1: Reverse engineering kiến trúc dự án

## Goal

Produce a durable, code-accurate map of **Forgeline** so development and QC share one picture of how the product is built and how work moves through it.

Forgeline is an autonomous software delivery line for AI agents: a multi-tenant control plane that owns workspaces → projects → backlog stories → git repos, connects local machines running AI CLIs, and runs a PO → (optional debate) → Dev → QC loop on story branches `fl/<n>-<slug>` only—never on protected defaults.

This story documents the system **as it is today** (specs 001–024 done). It does not change product behavior or the operator UI.

## User stories

- As a **developer**, I can open this spec and see the monorepo layout, stack, and which app owns web UI, API, and local runner work.
- As a **developer**, I understand the domain model (tenant, project, story/task, agent, brief, run, environment, design, debate) and how it maps to Prisma and `@forgeline/shared`.
- As a **developer**, I can follow the story lifecycle from Spec through Ready, Building, PR Open, QA, and Shipped, including branch rules, PO spec/design commits, debate, promote, and deploy hooks.
- As a **runner / agent integrator**, I know job kinds (`story`, `spec`, `discuss`, `dev`, `qc`), safety rules (`isSafeBranch`, attempt caps), and where checkout lives (`~/.forgeline/work/<project>/…`).
- As **QC**, I can verify every acceptance item against the live codebase and running local stack without guessing undocumented behavior.

## Architecture (as built)

### Monorepo and stack

| Piece | Location | Stack |
|---|---|---|
| Operator web | `apps/web` | Vite + React 19 + TypeScript, vanilla CSS (forge theme) |
| Control plane API | `apps/server` | Node + Fastify 5 + Prisma 6 + PostgreSQL 16 |
| Local runner | `apps/runner` | Node CLI daemon; polls API; adapters for AI tools |
| Shared contract | `packages/shared` | Statuses, transitions, branch helpers, design/spec limits, debate rules, `RunnerJob` |
| Local data | `docker-compose.yml` | Postgres 16 |

Default ports: API `:3001`, web `:5173` (Vite proxies `/api`).

### Layers

```
Operator UI (React)
        │  HTTP /api + session cookie
Control plane (Fastify + Prisma → Postgres)
        │                    │
   Git providers        Runner poll / heartbeat / complete
 (GitHub/GitLab/Bitbucket)   │
                        Local daemon → AgentAdapter (Claude Code, Cursor, Codex, Kiro, Antigravity)
                        ~/.forgeline/work/<project>/…  checkout fl/… only
```

### Domain (persisted)

- **Tenant** (workspace) owns **Projects** and **Agents**; **User** ↔ **Membership** (owner/member).
- **Project**: backlog, repos, environments (dev/staging/prod), autopilot, connect codes, briefs.
- **Repo** via **ProviderConnection** (token encrypted at rest).
- **Task** (= Story): key, status, branch `fl/…`, linked repos, designs, PO/Dev/QC machine picks, debate fields. Runner job field still uses `task`.
- **Brief**: short ask; a story-role machine files stories (no branch).
- **Agent**: machine + tool + role `dev` \| `qc` \| `story` (UI: PO); scoped by **AgentProject**.
- **Run**: phases `preparing` \| `agent` \| `publishing`; log + heartbeat.
- **StoryDesign**: HTML under `design/` (≤10 files, ≤500 KB each).
- **StoryMessage** / debate: after PO spec; Dev → QC → PO; three AGREEs → Ready; nine turns without → capped + human alert.
- **StoryPull** / **Deployment**: staging/prod promote; optional webhook/workflow after merge.

### Story lifecycle (operator board labels)

| Status (DB) | Board column | Meaning |
|---|---|---|
| `spec` | Spec | PO writes `story.md` + `design/*.html` on `fl/…`; then optional debate |
| `backlog` | Ready | Spec accepted; waiting for Dev |
| `in_progress` | Building | Dev run |
| `in_review` | PR Open | After QC path toward staging PR |
| `qa` | QA | QC |
| `done` | Shipped | Done; promote/deploy as configured |

Step rail on the story page: Spec → Ready → Dev → QC → Staging PR → Done.

Hard safety: agents push only `fl/…` (`isSafeBranch`); max 3 PO spec attempts and max 3 Dev attempts before human intervention.

### Operator surfaces (unchanged by this story)

Login/register · Command Center · Backlog · Story detail · Agent Fleet · Repositories · modals (new story/project/workspace, People, story↔repos).

## Acceptance criteria

QC verifies against the Forgeline product repo and a local `pnpm` + Postgres setup. Each item is pass/fail with evidence (file path, API response, or UI observation).

- [ ] **AC1 — Map matches monorepo**  
  Spec lists `apps/web`, `apps/server`, `apps/runner`, `packages/shared`, and Postgres via Docker; tech choices match `constitution.md` / root `package.json` (pnpm, Vite/React, Fastify, Prisma).

- [ ] **AC2 — Domain glossary is accurate**  
  Tenant, Project, Repo, Story/Task, Agent (roles `dev`/`qc`/`story`), Brief, Run, Environment, Autopilot, Design, and Debate are defined consistently with `.specify/memory/constitution.md` and Prisma models in `apps/server/prisma/schema.prisma`.

- [ ] **AC3 — Lifecycle and transitions**  
  Spec documents statuses `spec → backlog → in_progress → in_review → qa → done` and allowed moves match `TASK_TRANSITIONS` in `@forgeline/shared`. Branch naming `fl/<number>-<slug>` and `isSafeBranch` are stated.

- [ ] **AC4 — Control-plane vs runner split**  
  Spec states the API owns auth, tenants, projects, tasks, briefs, git, promote/deploy, and runner job endpoints; the runner owns poll, checkout under `~/.forgeline/work/<project>`, agent invocation, commit of allowed paths, and push of `fl/…` only.

- [ ] **AC5 — Job kinds and caps**  
  Spec lists runner job kinds `story`, `spec`, `discuss`, `dev`, `qc`; documents PO spec attempt cap (`SPEC_ATTEMPTS` = 3), Dev attempt cap (`MAX_ATTEMPTS` = 3), design limits (`DESIGN_LIMIT` = 10, `DESIGN_FILE_MAX` = 500_000), and debate (`DEBATE_LIMIT` = 9, three AGREEs → Ready).

- [ ] **AC6 — Operator pages named**  
  Spec names Login, Command Center, Backlog, Story, Agent Fleet, and Repositories as the current operator surfaces (no claim of new screens from this story).

- [ ] **AC7 — End-to-end smoke against the map**  
  With DB up, migrate/seed, and `pnpm dev`: sign-in works; a seeded/demo project shows backlog columns; Agents page shows connect/install path; Repositories page shows provider/env structure. Observed behavior does not contradict this architecture doc.

- [ ] **AC8 — Deliverable location**  
  This document lives as `story.md` on the story branch. No product code changes are required for TEST-1. No `design/` screens are required (no UI change).

## Out of scope

- Implementing roadmap items **025+** (build/test report, QC evidence, auto-merge/staging acceptance).
- Billing, AWS/cloud hosting, or commercial packaging beyond current tenants.
- Changing web, server, or runner behavior, schemas, or APIs.
- Rewriting historical specs 001–024 or ADRs (this story summarizes; those remain source of truth for their features).
- New operator UI screens or visual redesign (hence no `design/*.html`).
- Provider-specific features beyond the existing GitHub/GitLab/Bitbucket adapters.
- Guaranteeing zero-human operation when caps or debate caps fire (humans remain in the loop by design).
