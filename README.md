# devroast

> Paste your code. Get roasted.

A code roasting app built during [Rocketseat](https://rocketseat.com.br) **NLW Operator**. Drop your code, toggle roast mode, and get a brutally honest (or sarcastic) review with a score.

## Features

- **Code editor** — paste or type code with live line numbers
- **Roast mode toggle** — switch between honest feedback and maximum sarcasm
- **Shame leaderboard** — the worst code on the internet, ranked by score
- **Syntax highlighting** — server-side rendering via Shiki

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)

### Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
pnpm build
pnpm start
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, CVA |
| UI Primitives | @base-ui/react |
| Syntax Highlighting | Shiki |
| Linting & Formatting | Biome |
| Git Hooks | Lefthook + lint-staged |

## Project Structure

```
src/app/
├── components/ui/   # Reusable UI components (composition + simple API patterns)
├── example/         # Component showcase (/example)
├── globals.css      # Design tokens
├── layout.tsx       # Root layout (Navbar, fonts)
├── page.tsx         # Homepage (code editor, leaderboard preview)
└── home-actions.tsx # Client-side editor + actions
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | Run Biome linter |
| `pnpm check` | Run Biome lint + format check |
| `pnpm fix` | Auto-fix lint + format issues |

## License

Built for educational purposes during Rocketseat NLW Operator.
