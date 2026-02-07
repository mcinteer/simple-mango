# Project Context — Simple Mango

## Quality Gate

All stories MUST pass the quality gate before any task can be marked `[x]`:

```bash
npm run check
```

This runs: `tsc --noEmit && eslint && vitest run`

**No exceptions.** If `npm run check` fails, the task is not done.

## Testing Standards

- **Framework:** Vitest (`vitest.config.ts` at repo root)
- **Test location:** Co-located with source files (`*.test.ts` next to `*.ts`)
- **TDD required:** Write failing tests FIRST, then implement, then refactor
- **Mocking:** Use `vi.mock()` for external dependencies (DB, APIs)
- **Every task** must have corresponding test coverage before being marked complete
- **Run `npm run check`** after each task — not just at the end

## Test Categories

| Layer | What to test | What to mock |
|-------|-------------|--------------|
| Utils/helpers | Input → output, edge cases | Nothing |
| DB operations | Query logic, TTL checks, upsert behaviour | `getDb()` |
| API clients | Headers, error handling, response mapping | `fetch` |
| Cache/orchestration | Flow logic, fallback behaviour | DB + API client |
| API routes | Auth, response shape, status codes | All dependencies |

## Coding Standards

- **Naming:** Files kebab-case, functions camelCase, types PascalCase, DB collections camelCase
- **Dates:** ISO 8601 strings everywhere
- **API responses:** `{ data: T, meta?: {} }` success, `{ error: { code, message } }` error
- **MongoDB:** Native driver only (`mongodb@7`), reuse `getDb()` singleton
- **No `any`:** Use `unknown` or `Record<string, unknown>` instead
