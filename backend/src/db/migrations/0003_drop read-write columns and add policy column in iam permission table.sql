DROP INDEX IF EXISTS "iam_permission_read";--> statement-breakpoint
DROP INDEX IF EXISTS "iam_permission_write";--> statement-breakpoint
ALTER TABLE "iam_permissions" ADD COLUMN "policy" jsonb;--> statement-breakpoint
ALTER TABLE "iam_permissions" DROP COLUMN IF EXISTS "read";--> statement-breakpoint
ALTER TABLE "iam_permissions" DROP COLUMN IF EXISTS "write";