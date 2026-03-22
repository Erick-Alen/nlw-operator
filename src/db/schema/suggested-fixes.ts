import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { diffLineTypeEnum } from "./enums";
import { submissions } from "./submissions";

export const suggestedFixes = pgTable("suggested_fixes", {
  id: uuid("id").defaultRandom().primaryKey(),

  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),

  headerLabel: text("header_label").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const diffLines = pgTable("diff_lines", {
  id: uuid("id").defaultRandom().primaryKey(),

  suggestedFixId: uuid("suggested_fix_id")
    .notNull()
    .references(() => suggestedFixes.id, { onDelete: "cascade" }),

  type: diffLineTypeEnum("type").notNull(),
  content: text("content").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
