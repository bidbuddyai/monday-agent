---
title: "Interface Configuration"
sidebar_position: 3
description: |
  Step-by-step setup guides for using Poe API with popular AI coding tools like Cursor, Cline, and Roo Code
---

# Guide for Interface Configuration

This guide walks you through setting up Poe API with popular AI coding tools. With Poe's OpenAI-compatible API, you can access hundreds of AI models including GPT-4o, Claude Sonnet 4, Gemini 2.5 Pro, and more through your existing coding workflow.

## Prerequisites

Before setting up any interface, you'll need:

1. **Poe API Key**: Get your API key from [poe.com/api_key](https://poe.com/api_key)
2. **Poe Subscription**: An active Poe subscription to access the models
3. **Base URL**: `https://api.poe.com/v1/`

## Available Models

Popular models you can use include:
- `GPT-4o` - OpenAI's latest model
- `Claude-Sonnet-4` - Anthropic's most capable model  
- `Gemini-2.5-Pro` - Google's flagship model
- `Llama-3.1-405B` - Meta's largest open-source model
- `Grok-4` - xAI's latest model

For a complete list, visit the [models endpoint](https://api.poe.com/v1/models) or check available models in the Poe web interface.

---

## Cursor Setup

[Cursor](https://cursor.sh/) is an AI-powered code editor built for pair-programming with AI.

### Step-by-Step Configuration

1. **Open Cursor Settings**
   - Press `Cmd/Ctrl + ,` to open settings
   - Or go to **Cursor** → **Preferences** (Mac) / **File** → **Preferences** (Windows/Linux)

2. **Navigate to Models**
   - Click on **Models** in the left sidebar
   - Look for the **Chat** or **AI Models** section

3. **Add Custom Model Provider**
   - Click **Add Model** or **Configure Custom Provider**
   - Select **OpenAI Compatible** or **Custom OpenAI**

4. **Configure Poe API Settings**
   ```
   Provider Name: Poe
   Base URL: https://api.poe.com/v1/
   API Key: [Your Poe API Key from poe.com/api_key]
   ```

5. **Select a Model**
   - Choose from available models like:
     - `Claude-Sonnet-4`
     - `GPT-4o`
     - `Gemini-2.5-Pro`

6. **Test the Configuration**
   - Open a new chat with `Cmd/Ctrl + L`
   - Send a test message to verify the setup

### Usage Tips for Cursor
- Use `Cmd/Ctrl + K` for inline code generation
- Use `Cmd/Ctrl + L` for chat-based assistance
- The AI can see your entire codebase context automatically

---

## Cline Setup

[Cline](https://github.com/cline/cline) is an autonomous coding agent that works as a VS Code extension.

### Step-by-Step Configuration

1. **Install Cline Extension**
   - Open VS Code
   - Go to Extensions (`Cmd/Ctrl + Shift + X`)
   - Search for "Cline" and install it

2. **Open Cline Settings**
   - Click the Cline icon in the Activity Bar
   - Or press `Cmd/Ctrl + Shift + P` and search "Cline: Open"

3. **Configure API Settings**
   - In the Cline panel, click the ⚙️ icon (Settings)
   - Select **OpenAI Compatible** as the API Provider

4. **Enter Poe Configuration**
   ```
   API Provider: OpenAI Compatible
   Base URL: https://api.poe.com/v1/
   OpenAI Compatible API Key: [Your Poe API Key from poe.com/api_key]
   Model ID: Claude-Sonnet-4
   ```
   
   Recommended models:
   - Claude-Sonnet-4
   - Claude-Opus-4
   - Gemini-2.5-Pro

5. **Model Configuration**
   - Cline supports: images, browser use
   - Cline does not support prompt caching
   - Optional: You can use different models for Plan and Act modes

6. **Verify Setup**
   - Start a new conversation with Cline
   - Give it a simple coding task to test

### Usage Tips for Cline
- Cline uses complex prompts and works best with Claude models
- Cline can read, write, and execute code autonomously
- It works best with specific, well-defined tasks
- Always review code changes before accepting them

---

## Roo Code Setup

Roo Code is an AI coding assistant that integrates with various development environments.

### Step-by-Step Configuration

1. **Install Roo Code**
   - Install Roo Code for your preferred development environment

2. **Access Settings**
   - Click the Roo Code icon in your editor
   - Click the ⚙️ icon (Settings) to open the configuration panel
   - Navigate to the **Providers** section

3. **Configure API Provider**
   - Select **OpenAI Compatible** from the API Provider dropdown

4. **Enter Poe Configuration**
   ```
   Base URL: https://api.poe.com/v1/
   API Key: [Your Poe API Key from poe.com/api_key]
   Model: [Select a model like Claude-Sonnet-4]
   ```
   
   Recommended models:
   - Claude-Sonnet-4
   - Claude-Opus-4
   - Gemini-2.5-Pro

5. **Optional Settings**
   - Enable streaming for real-time responses
   - Include max output tokens if needed
   - Set Context Window Size (e.g., 128000)
   - Configure other settings based on your needs

6. **Test Connection**
   - Start a new conversation to confirm setup

### Usage Tips for Roo Code
- Roo Code works best with gpt-4o for general coding tasks
- Some models support images, check the "Image Support" indicator
- Note that Poe models may not support computer use or prompt caching
- Experiment with different models for different tasks

---

## LLM (Command Line Tool) Setup

[LLM](https://llm.datasette.io/en/stable/setup.html) is a command-line tool for working with Large Language Models. It provides a simple way to prompt various AI models directly from your terminal.

### Step-by-Step Configuration

1. **Install LLM**
   
   Choose one of the following installation methods:
   ```bash
   # Using pip
   pip install llm
   
   # Using pipx (recommended for CLI tools)
   pipx install llm
   
   # Using uv
   uv tool install llm
   
   # Using Homebrew (macOS/Linux)
   brew install llm
   ```

2. **Configure Poe API Key**
   
   Set your Poe API key using LLM's key management:
   ```bash
   llm keys set poe
   # Enter your Poe API key when prompted
   ```
   
   Alternatively, use an environment variable:
   ```bash
   export POE_API_KEY='your_poe_api_key_here'
   ```

3. **Test Basic Setup**
   
   Try a simple prompt to verify the setup:
   ```bash
   # Using stored key
   llm "Hello, world!" --key poe --api-base https://api.poe.com/v1
   
   # Using environment variable
   llm "Hello, world!" --key $POE_API_KEY --api-base https://api.poe.com/v1
   ```

4. **Create Model Aliases**
   
   For easier access, create aliases for your favorite Poe models:
   ```bash
   # Set Claude Sonnet 4 as default
   llm models default claude-sonnet-4 --api-base https://api.poe.com/v1 --key poe
   
   # Or create specific aliases
   llm alias claude "Claude-Sonnet-4" --api-base https://api.poe.com/v1 --key poe
   llm alias gpt4 "GPT-4o" --api-base https://api.poe.com/v1 --key poe
   ```

5. **Configuration File Setup**
   
   For persistent configuration, you can set up a configuration file. The config location varies by OS:
   - **macOS**: `~/Library/Application Support/io.datasette.llm/`
   - **Linux**: `~/.config/io.datasette.llm/`
   
   Create or edit the configuration to include Poe settings.

### Usage Examples

**Basic prompting:**
```bash
# Simple prompt with specific model
llm "Explain quantum computing" -m Claude-Sonnet-4 --api-base https://api.poe.com/v1 --key poe

# Using alias (if configured)
llm "Write a Python function to calculate fibonacci" -m claude
```

**Interactive chat:**
```bash
# Start an interactive session
llm chat -m GPT-4o --api-base https://api.poe.com/v1 --key poe
```

**File input:**
```bash
# Process a file
cat mycode.py | llm "Review this code for bugs" -m Claude-Sonnet-4 --api-base https://api.poe.com/v1 --key poe

# Save conversation to file
llm "Explain machine learning" -m Gemini-2.5-Pro --api-base https://api.poe.com/v1 --key poe > explanation.txt
```

**Using templates:**
```bash
# Create a template for code review
llm template code-review "Review this code and suggest improvements: {code}"

# Use the template
llm -t code-review -v code "$(cat script.py)" -m Claude-Sonnet-4 --api-base https://api.poe.com/v1 --key poe
```

### Environment Setup

For convenience, you can set these environment variables in your shell profile:

```bash
# Add to ~/.bashrc, ~/.zshrc, or equivalent
export POE_API_KEY='your_poe_api_key_here'
export LLM_API_BASE='https://api.poe.com/v1'

# Create aliases for common commands
alias llm-poe='llm --api-base $LLM_API_BASE --key $POE_API_KEY'
alias llm-claude='llm -m Claude-Sonnet-4 --api-base $LLM_API_BASE --key $POE_API_KEY'
alias llm-gpt='llm -m GPT-4o --api-base $LLM_API_BASE --key $POE_API_KEY'
```

### Usage Tips for LLM

- **Logging**: LLM automatically logs conversations to SQLite. Use `llm logs off` to disable or `llm logs on` to enable
- **Multiple Models**: Easily switch between Poe models using the `-m` flag
- **Streaming**: LLM supports streaming responses for real-time output
- **Plugins**: Extend functionality with LLM plugins for specialized tasks
- **Templates**: Create reusable prompt templates for common workflows
- **Pipes**: LLM works great with Unix pipes for processing files and command output

### Advanced Configuration

**Custom model configuration:**
```bash
# List available models from Poe
curl -H "Authorization: Bearer $POE_API_KEY" https://api.poe.com/v1/models

# Use any model from the list
llm "Your prompt here" -m "Llama-3.1-405B" --api-base https://api.poe.com/v1 --key poe
```

**Batch processing:**
```bash
# Process multiple prompts from a file
while IFS= read -r prompt; do
  echo "Prompt: $prompt"
  llm "$prompt" -m Claude-Sonnet-4 --api-base https://api.poe.com/v1 --key poe
  echo "---"
done < prompts.txt
```

---

## Troubleshooting

### Common Issues

**"Invalid API Key" Error**
- Verify your API key from [poe.com/api_key](https://poe.com/api_key)
- Ensure there are no extra spaces or characters
- Check that your Poe subscription is active

**"Model Not Found" Error**
- Verify the model name is spelled correctly
- Use exact model names like `Claude-Sonnet-4` (model names are case-insensitive, but avoid including space characters)
- Check if the model is available with your subscription

**Connection Timeout**
- Verify the base URL: `https://api.poe.com/v1`
- Check your internet connection
- Try a different model if one seems unresponsive

**Rate Limiting**
- Poe has a 500 requests per minute limit
- Wait a moment before retrying
- Consider upgrading your subscription for higher limits

### Getting Help

- **Poe API Documentation**: [OpenAI Compatible API docs](/docs/external-applications/openai-compatible-api)
- **Support**: Contact [developers@poe.com](mailto:developers@poe.com)
- **Community**: Join discussion on [discord](https://discord.com/invite/joinpoe)

---

## Benefits of Using Poe API

- **Single API Key**: Access hundreds of models with one key
- **Cost Effective**: Use existing Poe subscription points
- **Model Variety**: Switch between different providers and models
- **Up-to-date Models**: Access the latest models as they're released
- **Reliable Infrastructure**: Built for scale and performance
