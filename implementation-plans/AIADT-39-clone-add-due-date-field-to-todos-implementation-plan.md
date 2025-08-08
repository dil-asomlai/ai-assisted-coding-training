Your task is to implement AIADT-39: Add Due Date field to todos, including persistence and UI updates. Follow this step-by-step plan.

## Objective and Non-goals

- Objective: Introduce an optional Due Date to the Todo model, allow users to set/edit/clear it in the modal, display it in the list, and persist the data in `sessionStorage` with validation and graceful handling of legacy/malformed data. Ensure all tests pass and coverage is at least current baseline.
- Non-goals: Notifications/reminders, calendar sync, automatic sorting by due date, backend/API persistence.

## Architecture / Design Overview

- Data model: Extend `Todo` with `dueDate?: string` holding an ISO 8601 string; keep `createdAt: Date` in memory. Persist to `sessionStorage` by serializing `createdAt` to ISO string and storing `dueDate` as-is (string | undefined). Parse on load.
- State management: Continue using `TodoProvider` state. Add load on mount and save on changes via storage utils.
- UI: Add MUI X `DatePicker` to `TodoModal`. Display formatted due date under description in `TodoItem`. Overdue styling: show due date in `error.main` when overdue and not completed (date-only comparison).
- i18n/formatting: Use `date-fns` `format(date, 'PP')` for locale-friendly rendering.
- Providers: Wrap app in `LocalizationProvider` with `AdapterDateFns`.

## Detailed Steps (file-by-file)

1. Dependencies

- Install MUI X Date Pickers and date-fns:
  - `npm i @mui/x-date-pickers date-fns`
  - Ensure `@mui/material` is already present (it is).

2. Type changes

- Edit `src/types/Todo.ts`:
  - Add optional field: `dueDate?: string` (ISO 8601). Keep existing fields.

3. Storage utilities (new)

- Create `src/utils/sessionStorage.ts` with:
  - `const STORAGE_KEY = 'todos'`
  - `interface StoredTodo` where `createdAt` and `dueDate` are `string | undefined`.
  - `serializeTodos(todos: Todo[]): StoredTodo[]` converting `createdAt` to ISO via `toISOString()` and leaving `dueDate` as is.
  - `parseStoredTodos(items: StoredTodo[]): Todo[]` parsing `createdAt` back to `Date` and validating `dueDate`:
    - If `Number.isNaN(Date.parse(stored.dueDate))`, treat as `undefined`.
  - `loadTodosFromStorage(): Todo[]` with try/catch; on error return `[]`.
  - `saveTodosToStorage(todos: Todo[]): boolean` with try/catch; log `console.warn` on quota or other errors, return `false` if failed.
  - Compare dates by date-only using helper `toStartOfDay(date: Date): number` for overdue logic (export if needed by components).

4. Context updates

- Edit `src/contexts/TodoContextType.ts`:
  - Update `addTodo` signature to `addTodo: (title: string, description: string, dueDate?: string) => void`.
  - `editTodo` remains `Partial<Todo>`; will accept `dueDate` updates.

- Edit `src/contexts/TodoContext.tsx`:
  - Initialize state from storage: `const [todos, setTodos] = useState<Todo[]>(() => loadTodosFromStorage());`
  - `useEffect` to save on changes: `useEffect(() => { saveTodosToStorage(todos); }, [todos]);`
  - Update `addTodo(title, description, dueDate)` to set `dueDate` on the new todo and `createdAt: new Date()`.
  - Keep `editTodo` merging updates including `dueDate`.

5. App provider setup

- Edit `src/App.tsx`:
  - Import and wrap tree with `LocalizationProvider` from `@mui/x-date-pickers` and `AdapterDateFns` from `@mui/x-date-pickers/AdapterDateFns`.
  - Place `LocalizationProvider` outside `TodoProvider` (either is fine) so `DatePicker` works anywhere.

6. Modal UI and validation

- Edit `src/components/TodoModal/TodoModal.tsx`:
  - Expand `initialValues` to optionally include `dueDate?: string`.
  - Add local state `dueDate: Date | null`.
  - On open, initialize `dueDate` from `initialValues?.dueDate` (parse) or `null`.
  - Add MUI X `DatePicker` field with clearable behavior; when cleared, set `dueDate` to `null`.
  - On submit:
    - In create: call `addTodo(title.trim(), description.trim(), dueDate ? dueDate.toISOString() : undefined)`.
    - In edit: call `editTodo(id, { title, description, completed, dueDate: dueDate ? dueDate.toISOString() : undefined })`.
  - Basic validation: rely on `DatePicker` built-in validation. If it reports an error state, block submit (track an `isDateInvalid` flag from `onError`).

7. List item UI

- Edit `src/components/TodoList/TodoItem.tsx`:
  - Import `format` from `date-fns`.
  - Compute `isOverdue` by comparing date-only today vs dueDate.
  - Render secondary as a two-line block: description first; due date second when present using `format(new Date(todo.dueDate), 'PP')` with `sx` color `error.main` if overdue and not completed; otherwise `text.secondary`.

8. Tests

- Add a simple test utility wrapper for date pickers within affected tests or locally inline:
  - In tests rendering `TodoModal`, wrap with `LocalizationProvider` and `AdapterDateFns`.

- Update `src/__tests__/TodoModal.test.tsx`:
  - Wrap renders with `LocalizationProvider`.
  - Add a test to set a date in create mode, submit, and verify `addTodo` received ISO string for `dueDate`.
  - Add a test in edit mode to clear the date (if present) and verify `dueDate` becomes `undefined` in payload.

- Update/add `src/__tests__/TodoItem.test.tsx`:
  - Add a case where `dueDate` exists (future date) and assert formatted string is shown.
  - Add a case where `dueDate` is yesterday and `completed` is false; assert the date text is rendered (styling assertions can be minimal—presence is sufficient).

- Add `src/__tests__/sessionStorage.test.ts`:
  - Verify `save` stores ISO strings for `createdAt`/`dueDate`.
  - Verify `load` parses back to `Date` and treats malformed `dueDate` as `undefined`.
  - Verify legacy objects without `dueDate` are accepted.

- Update `src/__tests__/TodoContext.test.tsx` as needed:
  - Since `addTodo` now accepts an optional third param, existing calls continue to work.
  - Consider mocking storage utils to avoid flakiness and to assert `save` is called on mutating actions.

## Data / Schema Changes and Migrations

- In-memory `Todo` gains `dueDate?: string`.
- Storage schema: Persisted `Todo` items include `createdAt: string` (ISO) and optional `dueDate: string`.
- Migration: Loader treats missing/invalid `dueDate` as `undefined` and parses `createdAt` back to `Date`.

## API Contracts and External Integrations

- External libs: `@mui/x-date-pickers`, `date-fns`.
- No backend/API changes.

## Feature Flags / Config

- None required. Overdue styling always enabled. If needed later, gate by an env var like `VITE_TODO_OVERDUE_BADGE=true`.

## Telemetry / Monitoring

- Log `console.warn` on storage save failures (e.g., quota exceeded). Keep UI silent per scope; use existing Alerts only where already present.

## Risks, Edge Cases, Rollback

- Risks:
  - Date parsing/format mismatch across locales—mitigated by storing ISO and using `date-fns` local formatting.
  - Storage quota: ensure failures do not break UI; state remains in memory for the session.
  - Tests may fail if `LocalizationProvider` is missing—wrap accordingly.
- Edge Cases:
  - Malformed `dueDate` strings from storage; treat as `undefined`.
  - Time-zone: Compare using start-of-day for overdue logic.
  - Clearing the date should set `dueDate` to `undefined`.
- Rollback:
  - Revert code changes; loader tolerates records with/without `dueDate`. Old stored data remains valid.

## Acceptance Criteria Mapping

- User can optionally pick a due date when creating a todo → DatePicker in create mode; save ISO string.
- Existing todos without due date remain unaffected → Optional field and tolerant loader.
- Editing a todo shows current due date and allows change/removal → Initialize from `initialValues`; clear sets `undefined`.
- Due date shows in list in locale format → `format(..., 'PP')` in `TodoItem`.
- Validation prevents submission of invalid dates → Rely on DatePicker and block submit on error.
- Data persists and legacy data loads → Session storage utils with tolerant parsing.
- All unit tests pass and coverage ≥ baseline → Updated and new tests as above.

## Step-by-step Edit Checklist (copy/paste ready)

1. Install deps

```bash
npm i @mui/x-date-pickers date-fns
```

2. Update types

- Edit `src/types/Todo.ts` to add `dueDate?: string`.

3. Add storage utils

- Create `src/utils/sessionStorage.ts` with `loadTodosFromStorage`, `saveTodosToStorage`, and helpers described above.

4. Wire persistence

- Edit `src/contexts/TodoContext.tsx` to load on init and save on `todos` change.
- Update `addTodo` signature and usage to accept optional `dueDate`.

5. Wrap provider

- Edit `src/App.tsx` to wrap app with `LocalizationProvider`/`AdapterDateFns`.

6. Update modal

- Edit `src/components/TodoModal/TodoModal.tsx` to add `DatePicker`, manage `dueDate`, and send ISO string on submit.

7. Update list item

- Edit `src/components/TodoList/TodoItem.tsx` to render formatted due date and overdue styling.

8. Tests

- Update and add tests as specified (including a new `sessionStorage.test.ts`).

## Notes

- Follow project coding standards in `AI.md` and keep code clear and typed. Prefer explicit, readable code over cleverness.
