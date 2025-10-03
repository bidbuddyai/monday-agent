# Contributing Guide

Thanks for your interest in contributing to the Monday.com AI Assistant! This guide explains how to set up your environment, propose changes, and submit high-quality pull requests.

## 🛠️ Development Workflow

1. **Fork & Clone**
   - Fork the repository on GitHub and clone your fork locally.
   - Set up the upstream remote: `git remote add upstream https://github.com/yourusername/monday-ai-assistant.git`

2. **Create a Branch**
   - Use descriptive branch names, e.g., `feature/add-rfi-support` or `fix/timezone-bug`.
   - Keep changes focused on a single feature or fix.

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Environment Setup**
   - Copy `.env.example` to `.env` and fill in required values.
   - Run `npm start` to launch the Monday development server.

5. **Coding Standards**
   - Use ESLint to ensure code style: `npm run lint`.
   - Prefer functional React components with hooks.
   - Keep server-side modules focused and well-documented.
   - Write descriptive comments for complex logic (e.g., parsing heuristics).

6. **Testing**
   - Add unit tests with Jest for utilities and services when possible.
   - Manually verify chat workflows within Monday sandbox environments.

7. **Commit Messages**
   - Use the imperative mood: `Add document parser fallback`.
   - Reference related issues when applicable: `Fix #123`.

8. **Pull Requests**
   - Provide a clear summary of changes.
  - Include screenshots or recordings for UI updates.
   - Note any follow-up tasks or known limitations.

## 🧪 Quality Checklist

Before opening a PR, ensure:

- [ ] Tests pass (`npm test`)
- [ ] Lint checks pass (`npm run lint`)
- [ ] Documentation updated (README/docs) if behavior changes
- [ ] UI changes include screenshots
- [ ] No secrets committed

## 🗣️ Community Guidelines

- Be respectful and constructive in all communications.
- Prioritize user privacy and data security.
- Follow Monday.com marketplace policies.

Thanks again for helping build a powerful AI assistant experience! 🚀
