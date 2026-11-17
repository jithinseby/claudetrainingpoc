# Ticketing POC

A small Support Tickets app: ASP.NET Core Web API (.NET 10) + EF Core + SQL Server, with an Angular (Bootstrap) front end.

## Prerequisites

- .NET SDK 10
- Node.js 22 and npm
- SQL Server reachable at `localhost` (the default connection uses Windows authentication)

## Run

Start the API and the web app in two terminals, from the repo root.

**1. API** (http://localhost:5112)

```powershell
dotnet run --project api
```

In Development the API creates the `Ticketing` database and applies migrations on startup. The connection string is in `api/appsettings.Development.json`.

**2. Web app** (http://localhost:4200)

```powershell
cd web
npm install --legacy-peer-deps
npm start
```

Use `--legacy-peer-deps` because a plain `npm install` fails on npm 10.9.4.

Then open http://localhost:4200. API endpoints are under http://localhost:5112/api/tickets.

## Tests

```powershell
dotnet test                              # API tests
cd web; npx ng test --watch=false        # web tests
```

## Database options

- **Local SQL Server (default):** nothing to set up beyond the service running.
- **Docker:** copy `db/.env.example` to `db/.env`, set `MSSQL_SA_PASSWORD`, then `docker compose -f db/docker-compose.yml up -d`. Port 1433 must be free, so stop a local SQL Server first or change the host port in `docker-compose.yml`. Then change the connection string in `api/appsettings.Development.json` to SQL authentication with that password. Docker Desktop also needs WSL 2.

## Contributing

Enable the repo's git hooks once per clone:

```powershell
git config core.hooksPath .githooks
```
