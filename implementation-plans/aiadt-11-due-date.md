# Implementation Plan – AIADT-11 Add Due Date Field to Todos

## Objective

Add optional `dueDate` support to every todo so users can set, view, and update task deadlines. Persist the value in `sessionStorage`, surface it throughout the UI, and maintain backward-compatibility for previously stored data.

## Prerequisites

1. Install UI and date dependencies:
   ```bash
   npm install @mui/x-date-pickers @mui/material @emotion/react @emotion/styled date-fns
   ```
2. Ensure TypeScript is up-to-date and project builds without errors.

## Step-by-Step Tasks

| #   | Task                                       | Files / Modules                                     | Notes                                                                                                    |
| --- | ------------------------------------------ | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| 1   | Extend `Todo` type with `dueDate?: string` | `src/types/Todo.ts`                                 | ISO 8601 string (no time component needed).                                                              |
| 2   | Update context state & helpers             | `src/contexts/TodoContext.tsx`, `hooks/useTodo.tsx` | • Add `dueDate` param to `addTodo`, `editTodo`.<br/>• Default to `undefined` when omitted.               |
| 3   | Persist & restore `dueDate`                | `src/utils/sessionStorage.ts`                       | • Include `dueDate` in serialisation.<br/>• Gracefully ignore missing / malformed dates for legacy data. |
| 4   | Wrap app with `LocalizationProvider`       | `src/main.tsx`                                      | ```tsx                                                                                                   |

<LocalizationProvider dateAdapter={AdapterDateFns}>
  <App />
</LocalizationProvider>
```|
|5|Add DatePicker to create / edit flow|`src/components/TodoModal/TodoModal.tsx`|• Import `DatePicker`.<br/>• Local state: `dueDate: Date | null`.<br/>• Convert to ISO on save.<br/>• Allow clearing date (set to `null`).|
|6|Display formatted due date|`src/components/TodoList/TodoItem.tsx`|• If `dueDate` present, show `format(new Date(dueDate), 'PP')`.<br/>• If overdue (`isBefore(new Date(dueDate), today)`), render in `error.main` color.|
|7|Visual tweak for overdue items|`src/components/TodoList/TodoItem.tsx`, CSS|Use MUI palette `error.main` or add a small “Overdue” badge.|
|8|Validation logic|`TodoModal.tsx`|• Reject clearly invalid dates before submit.<br/>• Explicitly allow past dates (per ticket).|
|9|Unit tests|`src/__tests__/*`|• Adjust existing mocks for new property.<br/>• Add tests for: saving/loading `dueDate`, picker renders, overdue styling.|
|10|Docs & cleanup|`README.md`|Brief note on due-date feature & dependencies.|

## Edge Cases & Error Handling

- `dueDate` undefined → treated as “no deadline”.
- Malformed `dueDate` string on load → drop value & log warning via existing toast.
- `sessionStorage` quota exceeded → follow existing toast pattern.

## Acceptance Criteria Mapping

- Creating, editing, and displaying due date aligns with AC.
- Existing todos load unchanged.
- Locale-specific formatting (`PP`).
- Validation prevents impossible dates.
- All unit tests green; coverage ≥ previous baseline.

## Rollback Plan

Revert commit, remove dependency packages, and drop `dueDate` key—legacy data remains compatible.

## Timeline

Ideal effort: 0.5–1 day dev + 0.5 day QA.

---

_Generated automatically — review before execution._
