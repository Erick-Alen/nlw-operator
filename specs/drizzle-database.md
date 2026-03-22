# Drizzle ORM — Database Specification

> Database schema, enums, and implementation plan for **devroast**.

---

## Overview

This spec defines the PostgreSQL database schema for devroast using [Drizzle ORM](https://orm.drizzle.team).
The database runs in a containerized PostgreSQL instance via Docker Compose.

The data model is derived from 4 design screens:

| Screen | Key data |
|--------|----------|
| **Code Input** (Screen 1) | Code text, language, roast mode toggle, leaderboard preview (rank, score, code, language) |
| **Roast Results** (Screen 2) | Score (0-10), verdict label, roast quote, analysis issues (critical/warning/good), suggested diff |
| **Shame Leaderboard** (Screen 3) | Ranked submissions with score, language, line count, code preview |
| **OG Image** (Screen 4) | Score, verdict, language, line count, roast quote |

---

## Enums

```ts
// src/db/schema/enums.ts

import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Roast mode selected by the user when submitting code.
 * - honest: straightforward code review
 * - roast: maximum sarcasm mode
 */
export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);

/**
 * Severity level of each analysis issue card.
 * Maps to the badge colors in the design:
 * - critical → red (#EF4444)
 * - warning  → amber (#F59E0B)
 * - good     → green (#10B981)
 */
export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

/**
 * Overall verdict for a roast, displayed in the score hero
 * and OG image. Derived from the score range.
 *
 * Score mapping (suggested):
 *   0.0 – 2.0  → mass_disaster
 *   2.1 – 4.0  → needs_serious_help
 *   4.1 – 6.0  → barely_acceptable
 *   6.1 – 8.0  → decent_enough
 *   8.1 – 9.5  → actually_good
 *   9.6 – 10.0 → mass_respect
 */
export const verdictEnum = pgEnum("verdict", [
  "mass_disaster",
  "needs_serious_help",
  "barely_acceptable",
  "decent_enough",
  "actually_good",
  "mass_respect",
]);

/**
 * Type of a diff line in the suggested fix.
 * - added   → green background (#10B98115)
 * - removed → red background (#EF444415)
 * - context → no background highlight
 */
export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "added",
  "removed",
  "context",
]);
```

---

## Tables

### `submissions`

The central fact table. One row per code submission + its roast result.

```ts
// src/db/schema/submissions.ts

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull(),
  language: text("language").notNull(),
  lineCount: integer("line_count").notNull(),
  roastMode: roastModeEnum("roast_mode").notNull().default("roast"),
  score: numeric("score", { precision: 3, scale: 1 }).notNull(),
  verdict: verdictEnum("verdict").notNull(),
  roastQuote: text("roast_quote").notNull(),
  shareToken: text("share_token"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

**Indexes:**

| Index | Columns | Purpose |
|-------|---------|---------|
| `idx_submissions_score` | `score ASC` | Leaderboard sorting (lowest = worst = top) |
| `idx_submissions_created_at` | `created_at DESC` | Recent submissions feed |
| `idx_submissions_share_token` | `share_token` (unique) | Fast lookup for shared roast links |
| `idx_submissions_language` | `language` | Filter leaderboard by language |

---

### `issues`

Analysis issue cards shown in the "detailed_analysis" section. Each submission has multiple issues.

```ts
// src/db/schema/issues.ts

export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  severity: issueSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

### `suggested_fixes` + `diff_lines`

The diff block shown in the "suggested_fix" section. One fix per submission, composed of multiple diff lines.

```ts
// src/db/schema/suggested-fixes.ts

export const suggestedFixes = pgTable("suggested_fixes", {
  id: uuid("id").defaultRandom().primaryKey(),
  submissionId: uuid("submission_id").notNull().references(() => submissions.id, { onDelete: "cascade" }),
  headerLabel: text("header_label").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const diffLines = pgTable("diff_lines", {
  id: uuid("id").defaultRandom().primaryKey(),
  suggestedFixId: uuid("suggested_fix_id").notNull().references(() => suggestedFixes.id, { onDelete: "cascade" }),
  type: diffLineTypeEnum("type").notNull(),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
```

---

## Entity Relationship Diagram

```
submissions (1) ──── (*) issues
     │
     └──── (1) suggested_fixes (1) ──── (*) diff_lines
```

- A **submission** has many **issues** (the analysis cards).
- A **submission** has one **suggested_fix**, which has many **diff_lines**.

---

## Docker Compose

```yaml
# docker-compose.yml

services:
  postgres:
    image: postgres:17-alpine
    container_name: devroast-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: devroast
      POSTGRES_PASSWORD: devroast
      POSTGRES_DB: devroast
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Connection string** (for `.env`):

```
DATABASE_URL=postgresql://devroast:devroast@localhost:5432/devroast
```

---

## File Structure

```
src/db/
├── index.ts              # Drizzle client export (db instance)
├── seed.ts               # Seed script for dev data
├── schema/
│   ├── index.ts          # Re-exports all schema + relations
│   ├── enums.ts          # pgEnum definitions
│   ├── submissions.ts    # submissions table
│   ├── issues.ts         # issues table
│   ├── suggested-fixes.ts # suggested_fixes + diff_lines tables
│   └── relations.ts      # Drizzle relation definitions
drizzle/                   # Generated migration files
drizzle.config.ts          # Drizzle Kit config (project root)
docker-compose.yml         # PostgreSQL container (project root)
```

---

## Query Examples

### Leaderboard (top N worst code)

```ts
const leaderboard = await db.query.submissions.findMany({
  orderBy: (s, { asc }) => [asc(s.score)],
  limit: 20,
  columns: {
    id: true,
    code: true,
    language: true,
    lineCount: true,
    score: true,
    verdict: true,
    createdAt: true,
  },
});
```

### Full roast result (with issues + suggested fix)

```ts
const roast = await db.query.submissions.findFirst({
  where: (s, { eq }) => eq(s.id, submissionId),
  with: {
    issues: {
      orderBy: (i, { asc }) => [asc(i.sortOrder)],
    },
    suggestedFix: {
      with: {
        lines: {
          orderBy: (l, { asc }) => [asc(l.sortOrder)],
        },
      },
    },
  },
});
```

### Global stats

```ts
import { count, avg } from "drizzle-orm";

const [stats] = await db
  .select({
    totalSubmissions: count(submissions.id),
    avgScore: avg(submissions.score),
  })
  .from(submissions);
```

### Lookup by share token (OG image / share page)

```ts
const shared = await db.query.submissions.findFirst({
  where: (s, { eq }) => eq(s.shareToken, token),
  with: { issues: true },
});
```
