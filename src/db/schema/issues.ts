import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { issueSeverityEnum } from "./enums";
import { submissions } from "./submissions";

export const issues = pgTable("issues", {
  id: uuid("id").defaultRandom().primaryKey(),

  submissionId: uuid("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),

  severity: issueSeverityEnum("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
