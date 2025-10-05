# Monday.com AI Assistant

An intelligent AI-powered chat assistant embedded in Monday.com boards. Parse documents, extract structured data, and automate board operations using Monday's hosted infrastructure.

## ✨ Features

- 🤖 **Multi-Model AI Support** - Choose from Claude-Sonnet-4.5, GPT-5, Gemini-2.5-Pro, and more
- 📄 **Intelligent Document Parsing** - Search documents for relevant terms before extraction
- 🎯 **Smart Data Extraction** - Automatically populate board items with parsed data
- ✅ **Validation & Confirmation** - Validates dropdown values and asks for confirmation
- 🕐 **Date/Time Conversion** - Automatically converts Pacific Time to UTC
- 📎 **File Attachments** - Upload files to board items automatically
- ⚙️ **Customizable** - Add custom instructions and knowledge files

## 🚀 Quick Start

### Prerequisites

- Monday.com account with developer access
- Node.js 18+ installed (required by Monday Code)
- Ability to run the Monday Apps CLI via `npx mapps`
- Poe API key ([get one here](https://poe.com/api_key))

### Installation & Local Development

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/monday-ai-assistant.git
   cd monday-ai-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **(Optional) Configure environment variables for local dev:**
   Create a `.env` file in the project root to override defaults (e.g. `PORT`, `LOG_LEVEL`).

4. **Authenticate the Monday Apps CLI:**
   ```bash
   npx mapps init --local
   ```
   This generates a local `.mappsrc` file linked to your monday.com API token so subsequent CLI commands can deploy the project.

5. **Start the client and backend locally:**
   ```bash
   npm run dev
   ```
   - React front-end runs on [http://localhost:3000](http://localhost:3000)
   - Node backend (via `@mondaycom/apps-sdk`) runs on [http://localhost:4000](http://localhost:4000)

6. **Expose the client to Monday (optional for in-account previews):**
   ```bash
   npm run tunnel
   ```
   Copy the generated tunnel URL into your board view configuration while testing locally. Run `mapps tunnel:create -p 4000` in a second terminal if you also need to expose the backend API.

## 🚢 Deployment

All hosting is handled by Monday Code. The repository already contains `app-manifest.yml`, `.mondaycoderc`, and `.mappsignore` so the CLI knows how to package the app.

1. **Build production assets:**
   ```bash
   npm run build
   ```
   This runs Vite and outputs static assets to `build/client` for CDN hosting.

2. **Deploy server code:**
   ```bash
   npm run deploy
   ```
   Select the target app + version when prompted. The command uploads the Node server bundle to Monday Code.

3. **Deploy the client bundle (CDN):**
   ```bash
   npm run deploy:cdn
   ```
   Run this after the build step to push the contents of `build/client` to Monday's CDN so board and dashboard features load the latest UI.

4. **Sync the manifest (if you change features or hosting paths):**
   ```bash
   npm run manifest:import
   ```

5. **Add to your board:**
   - Go to Monday.com
   - Open any board
   - Click "+ Add View"
   - Select "AI Assistant"

## 📖 Usage

### Chat with AI

1. Open the AI Assistant view on any board
2. Type your message or upload a file
3. The AI will respond and can perform actions like:
   - Creating board items
   - Updating existing items
   - Parsing documents
   - Searching for information

### Upload Documents

1. Click the 📎 button
2. Select a file (PDF, DOCX, Excel, etc.)
3. AI will intelligently search and extract data
4. Review the extracted information
5. Confirm to create/update board items

### Configure Settings

1. Click "⚙️ Settings"
2. **Choose AI Model** - Select from available models
3. **Add API Key** - Enter your Poe API key
4. **Custom Instructions** - Guide AI behavior
5. **Knowledge Files** - Upload reference files
6. Click "Save Settings"

## 🎨 Sample: Bid Management

Pre-configured for construction bid documents:

**Extracted Fields:**
- Project Name
- Client/Owner
- Solicitation Number
- Bid Due Date & Time
- Job Walk Details
- RFI Deadline
- Scope of Work
- Required Subcontractors
- Role (Prime/Sub)
- Submission Method
- Engineer's Estimate
- Bid Bond Requirements
- Contract Time
- Insurance Requirements
- Prevailing Wages
- Franchise Hauler

**Search Terms:**
The AI intelligently searches for keywords like:
- "bid due", "due date", "submission deadline"
- "pre-bid", "job walk", "mandatory meeting"
- "scope of work", "work to be performed"
- "subcontractors", "specialty contractors"

## 🔧 Configuration

### Available Models

|| Model | Provider | Best For |
||-------|----------|----------|
|| **Claude 3.5 Sonnet** ⭐ | Anthropic | Most capable model for complex reasoning and documents |
|| Claude 3.5 Haiku | Anthropic | Fast and efficient for quick responses |
|| Claude 3 Opus | Anthropic | Most powerful Claude for complex analysis |
|| GPT-4o | OpenAI | Latest GPT with multimodal capabilities |
|| GPT-4o Mini | OpenAI | Efficient variant optimized for speed and cost |
|| Gemini 1.5 Pro | Google | Google's most capable model for complex reasoning |
|| Gemini 1.5 Flash | Google | Fast Gemini optimized for speed |

### Custom Instructions Example

```
You are parsing construction bid documents for REI.

Focus on extracting:
- All dates and times (convert PT to UTC)
- Required subcontractors
- Mandatory requirements (job walks, bonds, etc.)
- Financial information

When extracting scope, categorize as:
- "Demo" for demolition only
- "Abate" for asbestos abatement
- "Demo + Abate" for both
```

## 🚀 Deploy to Monday Code

Deploy both client and server components to Monday Code hosting:

### Prerequisites

1. **Set Environment Secrets** in your Monday app version:
   - `POE_API_KEY` - Your Poe API key
   - `MONDAY_SIGNING_SECRET` - Monday signing secret (if using middleware)

2. **Install Monday Apps CLI** (if not already installed):
   ```bash
   npm install -g @mondaycom/apps-cli
   ```

3. **Authenticate the CLI**:
   ```bash
   npx mapps init --local
   ```

### Deployment Steps

1. **Build the client**:
   ```bash
   npm run build
   ```
   This creates optimized assets in `build/client/`

2. **Deploy the server** (must listen on port 8080):
   ```bash
   npx mapps code:push -i <versionId>
   ```
   Replace `<versionId>` with your Monday app version ID

3. **Deploy the client to CDN**:
   ```bash
   npx mapps code:push --client-side -a <appId> -i <versionId> -d ./build/client
   ```
   Replace `<appId>` and `<versionId>` with your Monday app and version IDs

4. **Sync the app manifest** (if changed):
   ```bash
   npx mapps manifest:import --manifestPath ./app-manifest.yml
   ```

### Verification

After deployment, verify everything works:

1. **Health check**: `GET https://<service-url>.monday.app/health`
   Should return: `{"status":"ok", "version":"1.1.0", ...}`

2. **Board view loads**: Add the AI Assistant view to a Monday board
   - No blank screen (if blank, check `base: ''` in vite.config.js)
   - Settings modal loads available models
   - Chat functionality works with proper API key

### Troubleshooting

- **Blank screen**: Ensure `base: ''` is set in `vite.config.js`
- **API errors**: Verify `POE_API_KEY` is set in Monday app version secrets
- **CORS issues**: Check server CORS configuration allows Monday.com origins
- **Build failures**: Ensure all environment variables are properly set

## 📚 API Reference

See [docs/api-reference.md](docs/api-reference.md) for detailed API documentation.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🆘 Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/monday-ai-assistant/issues)
- **Docs:** [Documentation](https://github.com/yourusername/monday-ai-assistant/wiki)
- **Email:** support@yourdomain.com

## 🙏 Acknowledgments

- Built with [monday-sdk-js](https://github.com/mondaycom/monday-sdk-js)
- Powered by [Poe API](https://poe.com/api)
- UI inspired by Monday.com design system
