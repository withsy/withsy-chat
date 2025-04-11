# Development Setup

This project uses **Dev Containers** for local development.

## Table of Contents

<!-- toc -->

- [Install Docker](#install-docker)
- [Open the project in Dev Container](#open-the-project-in-dev-container)
- [Install dependencies](#install-dependencies)
- [Create a `.env` file](#create-a-env-file)
- [Run database setup](#run-database-setup)
- [(Optional) Enable SQL linting with DB context](#optional-enable-sql-linting-with-db-context)

<!-- tocstop -->

## Install Docker

Please follow the official Docker documentation to install it.

## Open the project in Dev Container

In VS Code:

1. Open this Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Choose:
   **"Dev Containers: Open Folder in Container..."**
3. Select this project folder

This will build the container and set up everything automatically.

> `.devcontainer/` includes:
>
> - `Dockerfile` - defines the development environment
> - `compose.yaml` - sets up services like PostgreSQL
> - `devcontainer.json` - VS Code settings and extensions
> - `post_create.sh` - runs setup scripts after the container is created

## Install dependencies

Inside the container, run:

```bash
npm i
```

## Create a `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Update values if needed.

## Run database setup

This will **reset** the database (drop all tables), **run migrations**, and **seed** initial data:

```bash
npm run db:setup
```

> ⚠️ **Warning:** This will erase all existing data.

## (Optional) Enable SQL linting with DB context

To enable SQL linting in templates using your database schema, add the following to your `.vscode/settings.json`:

```json
{
  "eslint.options": {
    "overrideConfigFile": "eslint.sql.config.ts"
  }
}
```

✅ Done! You’re ready to start developing.
Happy coding! 🚀
