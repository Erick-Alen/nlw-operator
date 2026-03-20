# Project: nlw-operator (devroast)

## Commit Messages

This project does **not** use the `AUD-` ticket prefix convention. Use standard conventional commits:

```
type(scope)?: description
```

Types: `feat`, `fix`, `hotfix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Examples:
- `feat: add button component with cva variants`
- `refactor(ui): add composition pattern to components`
- `chore: update dependencies`

## Commit Strategy

Split changes into **separate commits grouped by concern**, not one large commit:

1. **Dependencies + config** — `package.json`, lock files, `globals.css` token changes
2. **Core implementation** — component files, utilities
3. **Pages / consumers** — pages that use the components
4. **Documentation** — `AGENTS.md`, `README.md`, etc.

This keeps the git history navigable and each commit self-contained.
