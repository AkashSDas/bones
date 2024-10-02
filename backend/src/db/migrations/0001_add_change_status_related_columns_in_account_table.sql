ALTER TABLE "accounts" ADD COLUMN "change_status_token" varchar(255);--> statement-breakpoint
ALTER TABLE "accounts" ADD COLUMN "change_status_token_age" timestamp with time zone;