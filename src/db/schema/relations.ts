import { relations } from "drizzle-orm";
import { issues } from "./issues";
import { submissions } from "./submissions";
import { diffLines, suggestedFixes } from "./suggested-fixes";

export const submissionsRelations = relations(submissions, ({ many, one }) => ({
  issues: many(issues),
  suggestedFix: one(suggestedFixes),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  submission: one(submissions, {
    fields: [issues.submissionId],
    references: [submissions.id],
  }),
}));

export const suggestedFixesRelations = relations(
  suggestedFixes,
  ({ one, many }) => ({
    submission: one(submissions, {
      fields: [suggestedFixes.submissionId],
      references: [submissions.id],
    }),
    lines: many(diffLines),
  })
);

export const diffLinesRelations = relations(diffLines, ({ one }) => ({
  suggestedFix: one(suggestedFixes, {
    fields: [diffLines.suggestedFixId],
    references: [suggestedFixes.id],
  }),
}));
