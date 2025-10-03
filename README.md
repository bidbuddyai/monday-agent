# Monday.com AI Assistant

An intelligent AI-powered chat assistant embedded in Monday.com boards. Parse documents, extract structured data, and automate board operations using Poe's OpenAI-compatible API.

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
- Poe API key ([get one here](https://poe.com/api_key))
- Node.js 16+ installed

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/yourusername/monday-ai-assistant.git
   cd monday-ai-assistant
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install Monday CLI:**
   ```bash
   npm install -g monday-apps-cli
   ```

5. **Login to Monday:**
   ```bash
   monday-code login
   ```

6. **Start development server:**
   ```bash
   npm start
   ```

### Deployment

1. **Build for production:**
   ```bash
   npm run build
   ```

2. **Deploy to Monday:**
   ```bash
   npm run deploy
   ```

3. **Add to your board:**
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
| **Claude-Sonnet-4.5** ⭐ | Anthropic | Document parsing & extraction |
| GPT-5 | OpenAI | Advanced reasoning |
| GPT-5-Mini | OpenAI | Fast responses |
| Gemini-2.5-Pro | Google | Multimodal analysis |
| Claude-Opus-4 | Anthropic | Complex reasoning |
| Llama-3.3-70B | Meta | Open-source |

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
