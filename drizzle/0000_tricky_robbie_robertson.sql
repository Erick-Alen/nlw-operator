CREATE TYPE "public"."diff_line_type" AS ENUM('added', 'removed', 'context');--> statement-breakpoint
CREATE TYPE "public"."issue_severity" AS ENUM('critical', 'warning', 'good');--> statement-breakpoint
CREATE TYPE "public"."roast_mode" AS ENUM('honest', 'roast');--> statement-breakpoint
CREATE TYPE "public"."verdict" AS ENUM('mass_disaster', 'needs_serious_help', 'barely_acceptable', 'decent_enough', 'actually_good', 'mass_respect');--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"language" text NOT NULL,
	"line_count" integer NOT NULL,
	"roast_mode" "roast_mode" DEFAULT 'roast' NOT NULL,
	"score" numeric(3, 1) NOT NULL,
	"verdict" "verdict" NOT NULL,
	"roast_quote" text NOT NULL,
	"share_token" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"severity" "issue_severity" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "diff_lines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggested_fix_id" uuid NOT NULL,
	"type" "diff_line_type" NOT NULL,
	"content" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "suggested_fixes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"header_label" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diff_lines" ADD CONSTRAINT "diff_lines_suggested_fix_id_suggested_fixes_id_fk" FOREIGN KEY ("suggested_fix_id") REFERENCES "public"."suggested_fixes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suggested_fixes" ADD CONSTRAINT "suggested_fixes_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_submissions_score" ON "submissions" USING btree ("score");--> statement-breakpoint
CREATE INDEX "idx_submissions_created_at" ON "submissions" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_submissions_share_token" ON "submissions" USING btree ("share_token");--> statement-breakpoint
CREATE INDEX "idx_submissions_language" ON "submissions" USING btree ("language");