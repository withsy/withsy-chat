# Development Setup

This project uses **Dev Containers** for local development.

---

## 1. Open the project in Dev Container

In VS Code:

1. Open this Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`)
2. Choose:
   **"Dev Containers: Open Folder in Container..."**
3. Select this project folder

This will build the container and set up everything automatically.

### `.devcontainer/` includes:

- `Dockerfile` - defines the development environment
- `compose.yaml` - sets up services like PostgreSQL
- `devcontainer.json` - VS Code settings and extensions
- `post_create.sh` - runs setup scripts after the container is created

---

## 2. Install dependencies

Inside the container, run:

```bash
npm i
```

---

## 3. Create a `.env` file

Copy the example file:

```bash
cp .env.example .env
```

Update values if needed.

---

## 4. Run database migrations

This will create tables in the local PostgreSQL database:

```bash
npm run migrate
```

---

✅ Done! You’re ready to start developing.
Happy coding! 🚀
