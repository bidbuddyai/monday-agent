# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Monday.com AI Assistant application built with React (client) and Express.js (server) using Monday Code hosting. The application provides an intelligent AI-powered chat interface embedded in Monday.com boards that can parse documents, extract structured data, and automate board operations.

### Core Architecture

**Frontend (React/Vite)**
- `src/client/` - React application built with Vite
- `src/client/App.jsx` - Main app component handling Monday SDK context and settings
- `src/client/components/` - UI components including ChatView, SettingsModal, FileUpload
- Built to `build/client/` for Monday Code CDN hosting

**Backend (Express.js)**
- `src/server/` - Node.js server using Monday Apps SDK
- `src/server/routes/poe.js` - AI chat and model management via Poe API
- `src/server/routes/board.js` - Monday.com board operations (CRUD items, schema)
- `src/server/services/` - Core business logic (fileParser, dateConverter, termSearch)

**Integration Points**
- Monday.com board context via `monday-sdk-js`
- AI models via Poe API (Claude, GPT, Gemini variants)
- File parsing with intelligent term search and data extraction
- Real-time validation against Monday board schemas

### Key Business Logic

The application specializes in construction bid document parsing with:
- Smart document search for relevant terms before extraction
- Automatic date/time conversion from Pacific to UTC
- Dropdown value validation against board schemas
- Multi-model AI support with configurable agents
- Confidence scoring for extracted data

## Common Development Commands

### Local Development
```bash
# Install dependencies
npm install

# Start both client and server in development mode
npm run dev
# This runs: concurrently "npm run dev:client" "npm run dev:server"
# - Client (React/Vite): http://localhost:3000
# - Server (Express): http://localhost:4000

# Start only client (React/Vite dev server)
npm run dev:client

# Start only server (nodemon for hot reloading)
npm run dev:server

# Expose client to Monday.com for testing
npm run tunnel
# Creates tunnel for port 3000 - copy URL to Monday board view config
```

### Monday Apps CLI
```bash
# Initialize Monday Apps CLI (generates .mappsrc)
npx mapps init --local

# Create tunnel for backend API (port 4000)
mapps tunnel:create -p 4000

# Deploy server code to Monday Code
npm run deploy
# Equivalent to: npm run build && mapps code:push

# Deploy client bundle to CDN
npm run deploy:cdn
# Equivalent to: mapps code:push --client-side

# Import/sync app manifest
npm run manifest:import

# Export current manifest
npm run manifest:export
```

### Testing and Quality
```bash
# Run tests
npm test

# Lint JavaScript files
npm run lint

# Build production assets
npm run build
```

### Running Single Tests
The project uses Jest for testing. To run specific tests:
```bash
# Run specific test file
npm test -- path/to/test.js

# Run tests matching pattern
npm test -- --testNamePattern="pattern"

# Run tests in watch mode
npm test -- --watch
```

## Architecture Details

### State Management
- Board-specific settings stored in memory (`SETTINGS_BY_BOARD` Map)
- Monday.com context managed via SDK listeners
- Agent configurations with customizable system prompts and temperatures

### AI Integration Flow
1. User input → `ChatView` component
2. Settings validation and API key check
3. Request to `/api/poe/chat` with agent context
4. AI response with optional board actions
5. File uploads processed through intelligent parsing pipeline

### File Processing Pipeline
1. File upload via `FileUpload` component
2. `fileParser.js` service handles multiple formats (PDF, DOCX, Excel, images)
3. Intelligent term search before data extraction
4. Schema validation against Monday board structure
5. Confidence scoring and user confirmation flow

### Monday.com Integration
- Board schema fetching and column type handling
- Item creation/updates with validation
- Dropdown value matching and error handling
- Group management and item organization

## Configuration Files

- `app-manifest.yml` - Monday Code app configuration
- `vite.config.js` - Frontend build configuration
- `nodemon.json` - Development server watch settings
- `.mondaycoderc` - Monday Code deployment settings
- `.mappsignore` - Files to exclude from deployment

## Environment Setup

Required environment variables:
- `POE_API_KEY` - Poe API key for AI models (can also be set in UI)
- `PORT` - Server port (defaults handled in code)
- `NODE_ENV` - Environment mode
- `LOG_LEVEL` - Logging verbosity

Development flow requires Monday.com account with developer access and Node.js 18+.

## Available AI Models

The application supports multiple AI models via Poe API:

**Anthropic Claude Models:**
- `Claude-Sonnet-4.5` (default) - Balanced for document parsing
- `Claude-Opus-4.5` - Highest reasoning capability
- `Claude-Flash-4` - Fast, low-latency responses

**OpenAI Models:**
- `GPT-5-Preview` - Latest with advanced reasoning
- `GPT-4.1` - General-purpose dependable chat
- `GPT-4.1-Mini` - Efficient throughput-optimized
- `GPT-o3-mini` - Reasoning-tuned for structured tasks
- `GPT-G-Codex` - Code-centric for automations

**Google Gemini Models:**
- `Gemini-2.5-Pro` - Multimodal enterprise workloads
- `Gemini-2.5-Flash` - Latency-optimized UI interactions

## Key Features

- **Document Parsing**: Intelligent extraction from PDF, DOCX, Excel, and image files
- **Schema Validation**: Real-time validation against Monday board column types
- **Date/Time Conversion**: Automatic PT/PST/PDT to UTC conversion
- **Confidence Scoring**: AI provides confidence scores for extracted data
- **Multi-Agent Support**: Configurable AI agents with custom instructions
- **Board Integration**: Direct creation/update of Monday board items
- **File Attachments**: Automatic file uploads to board items