CREATE TYPE "public"."submission_status" AS ENUM('pending', 'done', 'failed');--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "score" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "verdict" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ALTER COLUMN "roast_quote" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "status" "submission_status" DEFAULT 'done' NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_submissions_status" ON "submissions" USING btree ("status");