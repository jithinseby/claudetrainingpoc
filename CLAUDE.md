# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ticketing POC: a Support Tickets app. ASP.NET Core Web API (.NET 10, controllers) + EF Core + SQL Server in Docker + Angular (standalone components). Not a git repo.

## Layout and architecture

- `api/` .NET API (project `Api`), in `TicketingPoc.slnx` at the root.
  - `Models/Ticket.cs` is both the EF entity and the request/response body (no DTOs). Status and priority are enums, serialized as strings via `JsonStringEnumConverter` in `Program.cs`.
  - `Data/TicketingContext.cs` is the single DbContext. Connection string `Ticketing` lives in `appsettings.Development.json` and currently targets the machine's local SQL Server (`localhost`, Windows auth), not Docker.
  - `Controllers/TicketsController.cs` is CRUD at `/api/tickets`. It injects the DbContext directly (no service or repository layer).
  - `Migrations/` holds `InitialCreate`. In Development, `Program.cs` calls `Database.Migrate()` on startup.
  - CORS allows only `http://localhost:4200`.
- `api.Tests/` xUnit, controller tests against the EF InMemory provider (`Microsoft.EntityFrameworkCore.InMemory`). InMemory does not enforce relational behaviour or constraints.
- `web/` Angular 21 (CSS, routing, no SSR, Vitest) styled with Bootstrap 5.3 (CSS only, loaded via `angular.json` styles, no Bootstrap JS). Brand colours and small overrides are in `src/styles.css`; the logo is `public/logo.svg`. One feature in `src/app/tickets/`: `ticket.service.ts` (HttpClient, API URL hardcoded to `http://localhost:5112/api/tickets`) and `tickets.ts` (list, add, change status, delete; inline template). The root route `''` renders it.
- `db/` `docker-compose.yml` (SQL Server 2022), `init.sql`, `.env.example`. `docs/` run notes.

## Commands (PowerShell, from repo root)

- Build / test all: `dotnet build`, `dotnet test`
- Single .NET test: `dotnet test api.Tests --filter "FullyQualifiedName~TestName"`
- Run API: `dotnet run --project api` (http://localhost:5112)
- Web: `cd web; npm install --legacy-peer-deps; npm start` (:4200); `npx ng build`; `npx ng test --watch=false`
- Single web spec: `npx ng test --watch=false --include src/app/tickets/tickets.spec.ts`
- DB: copy `db/.env.example` to `db/.env`, set `MSSQL_SA_PASSWORD`, then `docker compose -f db/docker-compose.yml up -d`
- New migration: `dotnet tool restore` then `dotnet ef migrations add <Name> --project api`

## Gotchas

- A local SQL Server (`MSSQLSERVER`) already owns port 1433, so the Docker container in `db/` would clash with it. To use Docker instead, change its host port and the connection string (SQL auth, password must match `MSSQL_SA_PASSWORD` in `db/.env`).
- Pin EF Core packages and `dotnet-ef` to 10.x (currently 10.0.15). The latest NuGet release is 11.0.0 and does not support net10.0. Use `--version`, not the default.
- Plain `npm install` in `web/` crashes on npm 10.9.4 ("edgesOut" error). Use `--legacy-peer-deps`.
- `ng serve` doesn't reload `angular.json`. After changing its styles, scripts or budgets, restart `npm start`.
- Git hooks live in `.githooks/` and need `git config core.hooksPath .githooks` once per clone. The `commit-msg` hook rejects `Co-Authored-By: Claude` lines. The `pre-commit` hook rejects staged secrets, SSN, card numbers and PHI-style fields, plus `.env`, key and Production-config files. Rules are regexes in `.githooks/scan.sh`, shared with `.claude/hooks/guard.sh`, a PreToolUse hook that blocks Claude from writing such content. Mark a confirmed false positive with `scan:allow` on that line.
- `dotnet-tools.json` is at the repo root, not `.config/`.
- Docker Desktop needs WSL 2. If `docker compose` fails, check that `wsl --install` has been run in an elevated shell and the machine rebooted.
- `db/.env` holds the SA password and is gitignored. Don't commit it.
