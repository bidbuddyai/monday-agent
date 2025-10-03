# Configuration Guide

This document explains how to configure the Monday.com AI Assistant after deploying it to your account. Configuration happens entirely within the Monday board view UI and uses Monday's secure storage APIs.

## 1. Access the Settings Panel

1. Add the **AI Assistant** view to a board.
2. Open the view and click the **⚙️ Settings** tab in the header.

The settings panel is divided into multiple sections:

- AI Model Configuration
- Poe API Key
- Custom Instructions
- Knowledge Files
- Board Schema Reference

## 2. AI Model Configuration

Select which Poe model the assistant should use by default. The dropdown lists all supported models as of October 2025:

- `Claude-Sonnet-4.5` (default and recommended)
- `GPT-5`
- `GPT-5-Mini`
- `Gemini-2.5-Pro`
- `Claude-Opus-4`
- `Llama-3.3-70B`

The selection is stored in Monday storage under the `app_settings` key and used by both chat and file parsing endpoints.

## 3. Poe API Key

Enter a valid Poe API key in the **Poe API Key** field. When you click **Save Settings**, the key is stored securely using Monday's private storage (not shared across accounts). The assistant will refuse to make API calls until a key is present.

Security considerations:

- Keys are never logged to the console.
- Only the authenticated user who stored the key can read it back.
- Do not commit API keys to source control.

## 4. Custom Instructions

Use the **Custom Instructions** textarea to provide context-specific guidance to the AI. Examples include:

- Naming conventions for new board items
- Required validation steps
- Instructions on how to categorize scope or subcontractor lists

Custom instructions are appended to the system prompt for every conversation and file parsing request.

## 5. Knowledge Files

Upload plaintext, Markdown, or JSON files that contain reference data (e.g., vendor lists, term mappings). Knowledge files are stored in Monday storage alongside settings and included in the assistant context if needed. They can be removed individually from the list.

## 6. Board Schema Reference

The settings panel displays a read-only view of the board's columns, including IDs, types, and dropdown options. This helps administrators ensure dropdown values returned by the AI match existing labels. The schema is also shared with the server so that validation occurs before executing actions.

## 7. Saving and Applying Settings

Press **💾 Save Settings** to persist any changes. The UI shows a confirmation toast on success. Settings are instantly available to both the front-end chat component and serverless routes.

## 8. Troubleshooting

- **Missing API Key:** If the chat view reports "Poe API key not configured," revisit settings and re-enter the key.
- **Invalid Model Error:** Ensure the selected model matches one of the supported names exactly.
- **Permission Errors:** Confirm the app has storage read/write permissions in `monday-code.json`/`app-manifest.yml` and within the developer console.

By following these steps, you can tailor the AI assistant to specific boards and workflows while keeping secrets secure.
