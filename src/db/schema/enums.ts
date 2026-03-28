import { pgEnum } from "drizzle-orm/pg-core";

export const roastModeEnum = pgEnum("roast_mode", ["honest", "roast"]);

export const issueSeverityEnum = pgEnum("issue_severity", [
  "critical",
  "warning",
  "good",
]);

export const verdictEnum = pgEnum("verdict", [
  "mass_disaster",
  "needs_serious_help",
  "barely_acceptable",
  "decent_enough",
  "actually_good",
  "mass_respect",
]);

export const diffLineTypeEnum = pgEnum("diff_line_type", [
  "added",
  "removed",
  "context",
]);

export const submissionStatusEnum = pgEnum("submission_status", [
  "pending",
  "done",
  "failed",
]);
