# Todo App with Atlas UI

![CI Status](https://github.com/dil-asomlai/ai-assisted-coding-training/actions/workflows/ci.yml/badge.svg)

A React-based Todo application built with TypeScript, Material UI, and Atlas UI components. This project demonstrates modern React development practices with proper state management, component architecture, and comprehensive testing.

## Features

- ✅ Create, read, update, and delete todo items
- ✅ Mark todos as completed
- ✅ Responsive design with Material UI
- ✅ TypeScript for type safety
- ✅ React Context for state management
- ✅ Comprehensive test coverage
- ✅ Prettier and ESLint for code quality
- ✅ Husky pre-commit hooks
- ✅ GitHub Actions CI/CD workflow

## Quick Start

```bash
# Clone the repository
git clone https://github.com/dil-asomlai/ai-assisted-coding-training.git

# Navigate to project directory
cd ai-assisted-coding-training

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to view the app.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production-ready app
- `npm run lint` - Run ESLint to fix code issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run preview` - Preview production build locally

### Session persistence

Todos are persisted for the duration of a browser session using `window.sessionStorage` under the key `"todos"`.

- Data is serialized as JSON; `createdAt` is stored as an ISO string and revived to a `Date` on load.
- On corrupt or invalid data, the key is cleared and the app falls back to an empty list.
- Writes happen on every `todos` change. If a storage quota error occurs, a toast appears: "Storage quota exceeded – latest changes may not be saved." The app continues using in-memory state.

## Project Structure

The project follows a feature-based organization:

```
src/
├── __tests__/                   # Test files
├── assets/                      # Media assets
├── components/                  # React components
├── contexts/                    # React contexts
├── providers/                   # React providers
├── types/                       # TypeScript type definitions
└── ...
```

## AI Development Support

This project is set up to work seamlessly with various AI coding assistants:

- For comprehensive project documentation, see [AI.md](./AI.md)
- For GitHub Copilot, see [.github/copilot/suggestions.json](./.github/copilot/suggestions.json)
- For Cursor AI, see [.cursor](./.cursor)
- For Claude Code, see [CLAUDE.md](./CLAUDE.md)

These files contain helpful information for AI tools to understand the project's structure, patterns, and practices.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
