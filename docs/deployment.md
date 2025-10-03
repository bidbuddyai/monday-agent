# Deployment Guide

This guide describes how to build and deploy the Monday.com AI Assistant marketplace app using the officially supported Monday Apps CLI (`@mondaycom/apps-cli`). All infrastructure runs on Monday.com, so no external hosting or server provisioning is required.

## Prerequisites

- Monday.com developer account with permission to create marketplace apps
- Monday Apps CLI available via `npx mapps`
- Poe API key stored securely (set inside the app after deployment)
- Node.js 18 or later (required by Monday Code)

## 1. Install Dependencies

```bash
npm install
```

## 2. Authenticate with Monday

Log in with the CLI so that build and deploy operations can interact with your account.

```bash
npx mapps init --local
```

Follow the browser-based authentication flow. After login the CLI stores an authentication token locally in `.mappsrc`.

## 3. Configure Environment Variables

Create a `.env` file if you need to override local defaults.

Variables you may want for local development:

- `POE_API_KEY` – Optional for local testing. In production it is stored in Monday's secure storage.
- `PORT` – Port for the local development server (default `4000`).
- `LOG_LEVEL` – Adjust server logging verbosity (`info`, `debug`, etc.).

## 4. Start Local Development (Optional)

```bash
npm run dev
```

This runs Vite for the React UI on port 3000 and a local Node server on port 4000.

To preview the UI inside Monday while developing, expose the local port with the CLI tunnel:

```bash
npm run tunnel
```

Use the generated URL inside the board view configuration. Run `mapps tunnel:create -p 4000` in another terminal if you also need to expose the backend endpoints.

## 5. Build for Production

```bash
npm run build
```

This command runs Vite, producing optimized client assets in `build/client` which are uploaded to Monday's CDN.

## 6. Deploy to Monday Code

```bash
npm run deploy
npm run deploy:cdn
```

- `npm run deploy` uploads the Node backend to Monday Code.
- `npm run deploy:cdn` pushes the static client bundle to the Monday CDN.

If you change hosted paths or add/remove features, sync the manifest:

```bash
npm run manifest:import
```

## 7. Configure App Features

Inside the Monday developer console:

1. Navigate to **Apps** → **Your App**.
2. Ensure **Board View** and **Dashboard Widget** features are enabled and point to the CDN build (`/index.html`).
3. Assign necessary permissions (Boards read/write, Storage read/write, Account read).
4. Upload an app icon (512x512 PNG) from `assets/icon.png` if you have not already done so.

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

For future releases, repeat the build and deploy steps. Maintain release notes in `CHANGELOG.md` and increment the version in `package.json`, `monday-code.json`, and `app-manifest.yml` as appropriate.

## Troubleshooting

- **Authentication Issues:** Re-run `npx mapps init --local` or clear CLI credentials.
- **Deployment Errors:** Ensure `app-manifest.yml` paths are valid and the app builds without compilation errors.
- **Missing Poe API Key:** Users must input keys via the Settings tab; confirm storage permissions are granted.

With these steps, your AI Assistant app can be deployed entirely on Monday's infrastructure without external hosting.
