# Monday Code Deployment Setup

## Problem
The existing app versions (v1 and v2) were not created with Monday Code hosting enabled, so `code:push` shows "No results".

## Solution

### Option 1: Create Monday Code-Enabled Version (RECOMMENDED)

1. **Go to Monday Developer Portal**
   - Visit: https://monday.com/developers/apps
   - Select: "Poe AI Assistant" (App ID: 10594531)

2. **Create New Version with Monday Code**
   - Click "App Versions" tab
   - Click "Create New Version"
   - Name: "v3" or "Monday Code Version"
   - ✅ **Enable "Monday Code Hosting"** checkbox
   - Click "Create"

3. **Deploy Code**
   ```powershell
   npx @mondaycom/apps-cli code:push
   ```
   - Select app: `10594531 | Poe AI Assistant`
   - Select version: v3 (newly created)

4. **Configure App Features**
   - In the Monday portal, configure your app's features to use the hosted endpoints
   - Set URLs to use your Monday Code domain

5. **Test Deployment**
   ```powershell
   # Check deployment status
   npx @mondaycom/apps-cli code:status
   
   # View logs
   npx @mondaycom/apps-cli code:logs
   ```

### Option 2: Migrate to Monday Code Project

If creating a new version doesn't work, you may need to:

1. Create a brand new app specifically for Monday Code
2. Use the Monday Code template when creating
3. Migrate your existing code

### Option 3: Use External Hosting

If Monday Code hosting is causing issues, you can:

1. Deploy server to a cloud provider (Heroku, Railway, Render, etc.)
2. Update app manifest with your hosted URL
3. Only use Monday for the client-side app

## Current App Structure

```
monday-agent/
├── src/
│   ├── client/          # React frontend
│   │   └── index.jsx
│   └── server/          # Express backend
│       ├── index.js     # Main entry point
│       ├── routes/
│       │   ├── poe.js   # Poe API routes
│       │   └── board.js # Monday board routes
│       └── services/
├── build/
│   └── client/          # Built client files
├── monday-code.json     # Monday Code config
└── package.json

```

## Files Configured

- ✅ `monday-code.json` - Monday Code configuration
- ✅ `package.json` - Added "main" entry point
- ✅ Server code ready in `src/server/`
- ✅ Client built to `build/client/`

## Next Steps

1. Try Option 1 (create Monday Code-enabled version)
2. If that works, your deployment should succeed
3. Test the `/api/poe/test` endpoint after deployment
4. Verify POE_API_KEY is loaded from Monday Secrets

## Testing After Deployment

```bash
# Get your Monday Code URL from the portal, then test:
curl https://YOUR_APP.monday.app/health
curl https://YOUR_APP.monday.app/api/poe/test
curl https://YOUR_APP.monday.app/api/poe/models
```

## Need Help?

Contact Monday support or check:
- Monday Code Docs: https://developer.monday.com/apps/docs/mondaycode
- Developer Forum: https://community.monday.com/c/developers/
