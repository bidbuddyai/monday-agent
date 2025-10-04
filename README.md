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

| Model | Provider | Best For |
|-------|----------|----------|
| **Claude-Sonnet-4.5** ⭐ | Anthropic | Balanced default for documents |
| Claude-Opus-4.1 | Anthropic | Highest quality Claude responses |
| Claude-Sonnet-3.5 | Anthropic | Reliable general-purpose chats |
| Claude-Haiku-3.5 | Anthropic | Rapid lightweight replies |
| Claude-Opus-4-Reasoning | Anthropic | Extended reasoning chains |
| Claude-Sonnet-4-Reasoning | Anthropic | Reasoning-focused Sonnet |
| GPT-5 | OpenAI | Advanced reasoning |
| GPT-5-Mini | OpenAI | Fast responses |
| GPT-5-Nano | OpenAI | Cost-efficient automation |
| GPT-G-Codex | OpenAI | Code and technical tasks |
| Gemini-2.5-Pro | Google | Multimodal analysis |
| Gemini-2.5-Flash | Google | Low-latency production flows |
| Gemini-2.5-Flash-Lite | Google | Budget-friendly latency |

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
