# Deployment Guide

This guide describes how to build and deploy the Monday.com AI Assistant marketplace app using the Monday Apps CLI. All infrastructure runs on Monday.com, so no external hosting or server provisioning is required.

## Prerequisites

- Monday.com developer account with permission to create marketplace apps
- Monday Apps CLI (`monday-apps-cli`) installed globally
- Poe API key stored securely (you will set this inside the app after deployment)
- Node.js 16 or later

## 1. Install Dependencies

```bash
npm install
```

## 2. Authenticate with Monday

Log in using the CLI so that build and deploy operations can interact with your account.

```bash
monday-code login
```

Follow the browser-based authentication flow. After login the CLI stores an authentication token locally.

## 3. Configure Environment Variables

Copy `.env.example` to `.env` and provide local development values. For deployment, Monday manages secrets, but having `.env` configured ensures the dev server runs correctly.

```bash
cp .env.example .env
```

Update the following variables if you plan to run the dev server locally:

- `POE_API_KEY` – Optional for local testing. In production it is stored in Monday's secure storage.
- `PORT` – Port for the local development server (default `8080`).
- `LOG_LEVEL` – Adjust server logging verbosity (`info`, `debug`, etc.).

## 4. Start Local Development (Optional)

```bash
npm start
```

This runs `monday-code dev`, bundling both the client React app and serverless functions. Use Monday's local tunneling instructions to preview the app inside a board view.

## 5. Build for Production

```bash
npm run build
```

This command runs `monday-code build`, producing optimized client assets and server bundles according to `monday-code.json`.

## 6. Deploy to Monday

```bash
npm run deploy
```

The CLI uploads both client and server bundles to Monday's infrastructure. After the command finishes you will receive an application URL.

## 7. Configure App Features

Inside the Monday developer console:

1. Navigate to **Apps** → **Your App**.
2. Ensure **Board View** and **Dashboard Widget** features are enabled and point to `/client/index.html`.
3. Assign necessary permissions (Boards read/write, Storage read/write, Account read).
4. Add an app icon (512x512 PNG) at `assets/icon.png` if you have not already done so.

## 8. Test in Monday Sandbox

Add the app to a test board:

1. Open any board.
2. Click **+ Add View** → **Apps** → select **AI Assistant**.
3. Configure settings (Poe API key, default model, etc.).
4. Upload documents and confirm AI-driven item creation flows.

## 9. Publish to Marketplace (Optional)

If you plan to publish:

1. Complete marketplace listing details (description, pricing, support info).
2. Provide screenshots located in `assets/screenshots/`.
3. Submit for Monday review.

## 10. Manage Updates

For future releases, repeat the build and deploy steps. Maintain release notes in `CHANGELOG.md` and increment the version in `package.json` and `monday-code.json` as appropriate.

## Troubleshooting

- **Authentication Issues:** Re-run `monday-code login` or clear CLI credentials.
- **Deployment Errors:** Ensure your `monday-code.json` paths are valid and the app builds without compilation errors.
- **Missing Poe API Key:** Users must input keys via the Settings tab; confirm storage permissions are granted.

With these steps, your AI Assistant app can be deployed entirely on Monday's infrastructure without external hosting.
