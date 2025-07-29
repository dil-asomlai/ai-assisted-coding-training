# Todo App with Atlas UI

![CI Status](https://github.com/dil-asomlai/ai-assisted-coding-training/actions/workflows/ci.yml/badge.svg)

A React-based Todo application built with TypeScript, Material UI, and Atlas UI components. This project demonstrates modern React development practices with proper state management, component architecture, and comprehensive testing.

## Features

- ✅ Create, read, update, and delete todo items
- ✅ Mark todos as completed
- ✅ Session persistence (survives page refresh)
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

## Session Persistence

The app automatically saves your todo list to the browser's session storage, ensuring your tasks persist through page refreshes within the same browser session. The persistence system includes:

- **Automatic saving**: Changes are saved immediately when you add, edit, or delete todos
- **Error handling**: Gracefully handles storage quota errors with user-friendly notifications
- **Data validation**: Validates stored data on load and clears corrupted entries
- **Session scope**: Data persists only within the current browser session (cleared when browser/tab is closed)

If you encounter storage quota issues, a notification will appear, but the app will continue to function normally using in-memory state.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production-ready app
- `npm run lint` - Run ESLint to fix code issues
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run preview` - Preview production build locally

## Project Structure

The project follows a feature-based organization:

```
src/
├── __tests__/                   # Test files
├── assets/                      # Media assets
├── components/                  # React components
│   ├── Toast/                   # Toast notification components
│   └── ...
├── contexts/                    # React contexts
├── hooks/                       # Custom React hooks
├── providers/                   # React providers
├── types/                       # TypeScript type definitions
├── utils/                       # Helper utilities (sessionStorage, etc.)
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
