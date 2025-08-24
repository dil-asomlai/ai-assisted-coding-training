## Objective and Non-goals

**Objective**: Add optional due date support to todos. Users can set, view, edit, and clear a due date via a date picker. Show the formatted date in the list and subtly indicate overdue items. Maintain backward compatibility with existing data.

**Non-goals**:

- Backend/API persistence or integrations
- Reminder notifications, calendar sync, automatic sorting
- Complex timezone handling beyond client-local display
- Broad data persistence implementation (unless already present in the app)

## Architecture / Design Overview

The app is a React 19 + TypeScript SPA using MUI. Todo state lives in `TodoContext`. We’ll extend the `Todo` type with an optional `dueDate?: string` (ISO 8601). UI changes:

- `TodoModal` gains a `DatePicker` for create/edit
- `TodoItem` renders a formatted due date and highlights overdue items

If date pickers are used, wrap the app in `LocalizationProvider` with `AdapterDateFns`. Display uses `date-fns` `format(date, 'PP')`.

## Detailed Steps (file-by-file)

1. Dependencies

- Install date picker and date utilities:
  - `@mui/x-date-pickers`
  - `date-fns`

2. Provide date localization context

- If not present, wrap the app with MUI `LocalizationProvider` and `AdapterDateFns`.
- Preferred location: inside `App.tsx`, wrapping the tree that already includes `AtlasThemeProvider` and `TodoProvider`.

3. Data model update

- File: `src/types/Todo.ts`
- Edit: add `dueDate?: string` to `Todo` interface

4. Context API updates

- Files: `src/contexts/TodoContextType.ts`, `src/contexts/TodoContext.tsx`
- Update `addTodo(title: string, description: string, dueDate?: string | null)`
- `editTodo(id: string, updates: Partial<Todo>)` already supports `dueDate` via `updates`
- Ensure new todos include `dueDate` when provided; default `undefined` when omitted or cleared

5. Modal (create/edit) UX updates

- File: `src/components/TodoModal/TodoModal.tsx`
- Add local state `dueDate: Date | null`
- In edit mode, initialize from `initialValues?.dueDate`
- Render MUI `DatePicker` with the ability to clear the value (set `null`)
- On submit:
  - For create: call `addTodo(title, description, dueDate ? dueDate.toISOString() : undefined)`
  - For edit: include `dueDate: dueDate ? dueDate.toISOString() : undefined` in the `updates`
- Validation: keep title required; do not block past dates; guard against impossible dates via `DatePicker` validation (no custom complex validation needed)

6. List item display

- File: `src/components/TodoList/TodoItem.tsx`
- If `todo.dueDate` exists, parse as `new Date(todo.dueDate)` and render `format(date, 'PP')` beneath the description
- Style overdue (date < today, ignoring time) using theme `error.main` for the date text

7. Optional persistence

- Current app has no storage. If persistence is added later, include `dueDate` in serialization/parsing and treat malformed values as `undefined`

## Data / Schema Changes

- `Todo` interface adds `dueDate?: string`
- No database migrations (client-only app)

## API Contracts / External Integrations

- None. All client-side

## Feature Flags / Config

- None required

## Tests

- Update/extend tests in `src/__tests__/`:
  - Adjust any `Todo` test fixtures to allow optional `dueDate`
  - Add tests for:
    - `TodoModal` rendering the `DatePicker` and saving/clearing due dates
    - `TodoItem` showing formatted date and overdue styling
  - Ensure existing tests pass without requiring a due date

Suggested test data:

```ts
const todoWithDue: Todo = {
  id: '1',
  title: 'With due date',
  description: 'Has a due date',
  completed: false,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  dueDate: '2025-02-15T00:00:00.000Z',
};
```

## Telemetry / Monitoring

- Not applicable. Ensure no console errors

## Risks, Edge Cases, Rollback

- Risks: timezone differences when interpreting ISO strings client-side; addressed by formatting in local time only
- Edge cases:
  - Malformed `dueDate` → treat as `undefined`
  - Past dates allowed; overdue indicator is purely visual
- Rollback: revert code changes and dependency additions; existing data remains compatible since `dueDate` is optional

## Acceptance Criteria Mapping

- Optional due date on create: `TodoModal` DatePicker + `addTodo` accepts `dueDate`
- Existing todos unaffected: optional field; defaults to `undefined`
- Edit with view/change/remove: `TodoModal` preloads date and allows clearing
- Display in list: `TodoItem` shows formatted `PP` date when present
- Validation: rely on `DatePicker` to prevent impossible values; allow past dates
- Tests pass at or above baseline

---

## Execution Guide (step-by-step for an AI agent)

1. Install deps

```bash
npm install @mui/x-date-pickers date-fns
```

2. Wrap app with LocalizationProvider

- Edit `src/App.tsx`:
  - Import `LocalizationProvider` from `@mui/x-date-pickers`
  - Import `AdapterDateFns` from `@mui/x-date-pickers/AdapterDateFns`
  - Wrap the existing `AtlasThemeProvider`/`TodoProvider` tree

3. Update `Todo` interface

- Edit `src/types/Todo.ts` to include `dueDate?: string`

4. Update context API and implementation

- Edit `src/contexts/TodoContextType.ts` to add `dueDate?: string | null` param to `addTodo`
- Edit `src/contexts/TodoContext.tsx` to store `dueDate` on create and accept updates for edit

5. Update modal UI and logic

- Edit `src/components/TodoModal/TodoModal.tsx`:
  - Add `DatePicker` with clear option
  - Maintain `dueDate: Date | null` state; initialize in `useEffect`
  - Convert to ISO string on save

6. Update list item rendering

- Edit `src/components/TodoList/TodoItem.tsx` to display formatted due date; red text if overdue

7. Tests

- Update/add tests in `src/__tests__/` to cover due date behavior

8. Build and test

```bash
npm run build && npm test
```

9. Done when all ACs are met and tests pass
