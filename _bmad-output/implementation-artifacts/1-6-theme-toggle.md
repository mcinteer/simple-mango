# Story 1.6: Theme Toggle (Light/Dark Mode)

Status: ready-for-dev

## Story

As a user,
I want to switch between light and dark themes,
so that I can use the app comfortably in different lighting conditions.

## Acceptance Criteria

1. **Given** the user is on any page, **When** they click the theme toggle, **Then** the UI switches between light and dark mode immediately.
2. **Given** the user selects a theme, **When** they close and reopen the app, **Then** their preference is persisted (localStorage).
3. **Given** no preference is saved, **When** the app loads, **Then** it defaults to dark mode ("Tuxedo" theme).
4. **Given** dark mode is active, **When** viewing any page, **Then** the UI uses the "Tuxedo" aesthetic (dark background, gold accents).
5. **Given** light mode is active, **When** viewing any page, **Then** the UI uses a complementary light theme (light background, appropriate contrast).
6. **Given** the theme toggle, **When** rendered, **Then** it is accessible (keyboard navigable, proper ARIA labels).

## Tasks / Subtasks

- [ ] **Task 1: Tailwind Dark Mode Configuration** (AC: #1, #4, #5)
  - [ ] Update `/src/app/globals.css` to use Tailwind's `class` strategy for dark mode
  - [ ] Define CSS custom properties for theme colors (light and dark variants)
  - [ ] Ensure existing dark mode classes work with the new strategy

- [ ] **Task 2: Theme Context Provider** (AC: #1, #2, #3)
  - [ ] Create `/src/components/providers/theme-provider.tsx`
  - [ ] Implement `ThemeContext` with `theme`, `setTheme`, `toggleTheme`
  - [ ] Read initial theme from localStorage on mount (default: 'dark')
  - [ ] Persist theme changes to localStorage
  - [ ] Apply `dark` class to `<html>` element when dark mode active
  - [ ] Handle SSR hydration (avoid flash of wrong theme)
  - [ ] Create `/src/components/providers/theme-provider.test.tsx`

- [ ] **Task 3: Theme Toggle Component** (AC: #1, #6)
  - [ ] Create `/src/components/ui/theme-toggle.tsx`
  - [ ] Sun icon for light mode, Moon icon for dark mode
  - [ ] Accessible: `aria-label`, keyboard support
  - [ ] Smooth transition animation
  - [ ] Create `/src/components/ui/theme-toggle.test.tsx`

- [ ] **Task 4: useTheme Hook** (AC: #1, #2)
  - [ ] Create `/src/hooks/use-theme.ts`
  - [ ] Export convenience hook to access theme context
  - [ ] Create `/src/hooks/use-theme.test.ts`

- [ ] **Task 5: Layout Integration** (AC: #1, #4, #5)
  - [ ] Update `/src/app/layout.tsx` to wrap app in `ThemeProvider`
  - [ ] Add `ThemeToggle` to header/navigation area
  - [ ] Ensure `<html>` element receives `dark` class correctly

- [ ] **Task 6: Light Theme Design Tokens** (AC: #5)
  - [ ] Define light mode color palette (complementary to Tuxedo)
  - [ ] Background: Light gray/white (`bg-zinc-50`, `bg-white`)
  - [ ] Text: Dark gray/black (`text-zinc-900`, `text-zinc-700`)
  - [ ] Accents: Gold/amber maintained for brand consistency
  - [ ] Cards: White with subtle shadows
  - [ ] Update any hardcoded dark mode classes to be theme-aware

- [ ] **Task 7: Update Existing Components** (AC: #4, #5)
  - [ ] Audit existing components for hardcoded dark colors
  - [ ] Update to use `dark:` prefix pattern where needed
  - [ ] Components to check:
    - [ ] `/src/components/ui/button.tsx`
    - [ ] `/src/components/ui/card.tsx`
    - [ ] `/src/components/ui/input.tsx`
    - [ ] `/src/components/features/auth/*.tsx`
    - [ ] `/src/app/(auth)/dashboard/page.tsx`
    - [ ] `/src/app/page.tsx` (landing)
    - [ ] `/src/app/login/page.tsx`
    - [ ] `/src/app/register/page.tsx`

## Dev Notes

### Tailwind Dark Mode Strategy

Tailwind v4 uses CSS-based configuration. For manual dark mode control:

```css
/* src/app/globals.css */
@import "tailwindcss";

/* Enable class-based dark mode */
@custom-variant dark (&:where(.dark, .dark *));
```

Then in components:
```tsx
<div className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white">
```

### Theme Provider Pattern

```tsx
// src/components/providers/theme-provider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setTheme(stored);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Apply class to html element
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <div className="dark">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Hydration Flash Prevention

To avoid a flash of wrong theme on page load, add a blocking script to `layout.tsx`:

```tsx
// In <head> or before body content
<script dangerouslySetInnerHTML={{
  __html: `
    (function() {
      const theme = localStorage.getItem('theme') || 'dark';
      document.documentElement.classList.add(theme);
    })();
  `
}} />
```

### Theme Toggle Component

```tsx
// src/components/ui/theme-toggle.tsx
'use client';

import { useTheme } from '@/hooks/use-theme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-5 w-5 text-amber-500" />
      ) : (
        <MoonIcon className="h-5 w-5 text-zinc-700" />
      )}
    </button>
  );
}
```

For icons, either:
- Use inline SVGs (zero dependencies)
- Or install `lucide-react` (lightweight icon library)

### Color Palette Reference

| Element | Dark (Tuxedo) | Light |
|---------|---------------|-------|
| Background | `bg-zinc-900` / `bg-neutral-950` | `bg-zinc-50` / `bg-white` |
| Card | `bg-zinc-800/50` | `bg-white` with shadow |
| Text Primary | `text-white` | `text-zinc-900` |
| Text Secondary | `text-zinc-400` | `text-zinc-600` |
| Accent | `text-amber-500` | `text-amber-600` |
| Border | `border-zinc-700` | `border-zinc-200` |
| Hover | `hover:border-amber-500` | `hover:border-amber-500` |

### File Structure

```
src/
├── app/
│   ├── globals.css              # UPDATE: dark mode variant
│   └── layout.tsx               # UPDATE: add ThemeProvider, toggle
├── components/
│   ├── providers/
│   │   ├── session-provider.tsx # EXISTS
│   │   └── theme-provider.tsx   # NEW
│   └── ui/
│       ├── theme-toggle.tsx     # NEW
│       └── theme-toggle.test.tsx # NEW
└── hooks/
    ├── use-theme.ts             # NEW (or export from provider)
    └── use-theme.test.ts        # NEW
```

### Critical Patterns

**localStorage Key:** `theme` (simple, standard)

**Default Theme:** `dark` (Tuxedo is the brand identity)

**Class Strategy:** Apply `dark` class to `<html>` element, not `<body>`

**SSR Safety:** Always check `typeof window !== 'undefined'` or use `useEffect` for localStorage access

### Anti-Patterns to Avoid

- ❌ Do NOT use Tailwind's `media` strategy — we need manual user control
- ❌ Do NOT store theme in React state only — must persist to localStorage
- ❌ Do NOT access localStorage during SSR — causes hydration errors
- ❌ Do NOT forget to handle the initial render flash
- ❌ Do NOT use `window.matchMedia` as the sole source — user preference overrides system
- ❌ Do NOT create a new CSS file for themes — use Tailwind's `dark:` variant

### Testing Approach

- **ThemeProvider**: Test context values, localStorage read/write, class application
- **ThemeToggle**: Test click toggles theme, correct icon displayed, accessibility
- **useTheme**: Test hook returns correct values, throws outside provider

### Dependencies

No new npm packages required. Icons can be inline SVGs.

If you prefer an icon library:
```bash
npm install lucide-react
```

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/prd.md — "Tuxedo UI" theme reference]
- [Source: Tailwind CSS v4 Dark Mode — https://tailwindcss.com/docs/dark-mode]
- [Source: project-context.md — Quality Gate, Testing Standards]

## Dev Agent Record

### Agent Model Used


### Debug Log References


### Completion Notes List


### Change Log


### File List

