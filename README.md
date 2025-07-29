# Todo App with Atlas UI

![CI Status](https://github.com/dil-asomlai/ai-assisted-coding-training/actions/workflows/ci.yml/badge.svg)

A React-based Todo application built with TypeScript, Material UI, and Atlas UI components. This project demonstrates modern React development practices with proper state management, component architecture, and comprehensive testing.

## Features

- ✅ Create, read, update, and delete todo items
- ✅ Mark todos as completed
- ✅ Session persistence - todos survive page refreshes
- ✅ Responsive design with Material UI
- ✅ TypeScript for type safety
- ✅ React Context for state management
- ✅ Comprehensive test coverage
- ✅ Prettier and ESLint for code quality
- ✅ Husky pre-commit hooks
- ✅ GitHub Actions CI/CD workflow

## Session Persistence

The Todo app automatically saves your todos to your browser's session storage, ensuring your tasks persist during your browser session:

### How It Works

- **Automatic Saving**: Every time you add, edit, complete, or delete a todo, the app automatically saves all todos to `sessionStorage`
- **Page Refresh**: Your todos will survive page refreshes as long as you stay in the same browser tab/window
- **New Session**: When you close the browser or open a new tab, you'll start with a fresh empty list
- **Error Handling**: If storage quota is exceeded or other errors occur, the app will show a notification but continue working normally

### Limitations

- **Session-only**: Data is only preserved within the same browser session, not across different tabs or browser restarts
- **Storage Quota**: Large numbers of todos may eventually hit browser storage limits (rare in practice)
- **Browser-specific**: Data is stored per browser and won't sync across different browsers or devices

### Data Safety

The app includes robust error handling:

- Corrupted or invalid data is automatically cleared without crashing the app
- Storage quota errors are handled gracefully with user notifications
- All data validation ensures only valid todo items are stored and loaded

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
