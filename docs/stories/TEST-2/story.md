# TEST-2: Add build and test checks

## Goal

Give Forgeline a `.forgeline/checks.json` on the base branch so every story must install, build, and test the parts of this repo that can do so without secrets or a running database, before the story reaches QC. Document how each part is installed, built, and tested in root `AGENTS.md`, including which parts have no check and why.

Today there is no `.forgeline/checks.json`, so Forgeline sends every story to QC without building or testing.

## Product as it is

This repository is a four-part Shopback audience app (Express + two Create React App clients + MySQL image):

| Part | Location of app code | Install | Build | Test | Needs DB / secrets for check? |
|------|----------------------|---------|-------|------|-------------------------------|
| Admin | `admin/src/` (`package.json`, CRA / `react-scripts`) | `npm ci` (or `npm install`) in `admin/src` | `npm run build` | `npm test` (default `App` smoke test under `admin/src/src/`) | No |
| Audience | `audience/src/` (same CRA layout) | `npm ci` in `audience/src` | `npm run build` | `npm test` | No |
| Backend | `backend/src/` (Express, Sequelize, Mocha) | `npm ci` in `backend/src` | None (plain Node; no compile/`build` script) | `npm test` runs unit + integration Mocha suites | **Yes** — `config/config.js` `test` dialect is MySQL; suites call `sequelize.sync()` against that DB |
| Database | `database-service/` | N/A | N/A | N/A | Image-only: `Dockerfile` based on `mysql:latest` with env for DB name/users. No package manifest, no scripts |

Docker Compose (`docker-compose.yml`) wires `backend`, `db` (from `database-service`), `audience` (port 3000), and `admin` (port 3001). Local README samples use hardcoded demo credentials; checks must not depend on Compose, MySQL, or secrets.

Forgeline runs each check with `CI=1`, so CRA’s interactive `npm test` exits after one run.

## User stories

- As an operator, I want Forgeline to refuse a story that breaks install/build/test on the parts that can run offline, so QC does not review broken packages.
- As a repository owner, I want one named check per eligible part in `.forgeline/checks.json`, each with an explicit `timeoutMinutes`, so failures show which part broke.
- As a future agent, I want root `AGENTS.md` to say how to install, build, and test each part, and why backend and database-service are not gated by a check today.

## Acceptance criteria

QC can verify these on the story branch end to end (against `master` / the base branch after merge of this work). No product UI to click.

- [ ] `.forgeline/checks.json` exists at the repo root and is valid Forgeline shape: a non-empty `"checks"` array; each item has `name`, `run`, and integer `timeoutMinutes` from 1 to 60; at most 10 checks.
- [ ] There is **one check per repository part that can be installed, built, and tested without secrets or a running database**. From the code as it is today, the eligible parts are **`admin/`** and **`audience/`** (work in their `src/` package directories). Do not invent checks for other trees.
- [ ] **`backend/` has no check** unless the check’s `run` truly needs no database and no secrets. As written, `npm test` needs MySQL, so leave backend out.
- [ ] **`database-service/` has no check** (Dockerfile-only MySQL image; nothing to install, build, or test in-process).
- [ ] Each listed check’s `run` installs dependencies, builds the CRA app, and runs its tests from the correct directory (e.g. `cd admin/src && …` and `cd audience/src && …`). Prefer lockfile-faithful install (`npm ci`) when `package-lock.json` is present.
- [ ] Every check listed in `.forgeline/checks.json` **passes on `master` as it is today** (same commands, no app-code fixes). If a candidate part fails install, build, or test on current `master`, **omit that part** from `checks.json` and document the omission in `AGENTS.md`.
- [ ] Root **`AGENTS.md`** describes, for each of `admin/`, `audience/`, `backend/`, and `database-service/`:
  - how to install, build (if any), and test; and
  - whether it has a Forgeline check, and if not, why (backend: tests need a running MySQL; database-service: no Node/app build or test surface; or “omitted because it does not pass on master today” if that applies).
- [ ] `AGENTS.md` notes that Forgeline reads `.forgeline/checks.json` from the **base branch**, and that agents must not delete, skip, or loosen checks/tests to force a pass.
- [ ] No application source under `admin/`, `audience/`, `backend/`, or `database-service/` is changed for this story. No dependency upgrades. No new tests.

### Suggested check commands (dev must confirm on master)

Use only if they pass unchanged on current `master`; adjust timeouts if needed (keep ≤ 60):

```json
{
  "checks": [
    {
      "name": "admin",
      "run": "cd admin/src && npm ci && npm run build && npm test",
      "timeoutMinutes": 20
    },
    {
      "name": "audience",
      "run": "cd audience/src && npm ci && npm run build && npm test",
      "timeoutMinutes": 20
    }
  ]
}
```

If `npm ci` fails on master because the lockfile is inconsistent, try `npm install` in the check only if that still reflects “as it is today” without upgrading for its own sake; otherwise omit that part and explain in `AGENTS.md`.

## Out of scope

- Changing application code under `admin/`, `audience/`, `backend/`, or `database-service/`
- Upgrading Node, npm, or package dependencies to make a failing part pass
- Writing new tests or rewriting existing Mocha/CRA tests
- Standing up MySQL, Docker Compose, or secrets so backend can be gated
- Adding a check that starts or depends on `database-service` / MySQL
- GitHub Actions / CODEOWNERS / other CI wiring beyond `.forgeline/checks.json` and `AGENTS.md`
- Any user-facing screen or design (this story does not change what a user sees)

## Design

None. No screens change.
