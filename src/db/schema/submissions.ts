import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { roastModeEnum, verdictEnum } from "./enums";

export const submissions = pgTable(
  "submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    code: text("code").notNull(),
    language: text("language").notNull(),
    lineCount: integer("line_count").notNull(),

    roastMode: roastModeEnum("roast_mode").notNull().default("roast"),

    score: numeric("score", { precision: 3, scale: 1 }).notNull(),
    verdict: verdictEnum("verdict").notNull(),
    roastQuote: text("roast_quote").notNull(),

    shareToken: text("share_token"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("idx_submissions_score").on(table.score),
    index("idx_submissions_created_at").on(table.createdAt),
    uniqueIndex("idx_submissions_share_token").on(table.shareToken),
    index("idx_submissions_language").on(table.language),
  ]
);
