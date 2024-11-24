ALTER TABLE "iam_permissions" ADD COLUMN "is_service_wide" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "iam_permissions" ADD COLUMN "read_all" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "iam_permissions" ADD COLUMN "write_all" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "iam_permissions" DROP COLUMN IF EXISTS "policy";