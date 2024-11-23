ALTER TABLE "iam_permissions" DROP CONSTRAINT "iam_permissions_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_account_id_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "workspaces" DROP CONSTRAINT "workspaces_created_by_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "iam_permissions" ADD COLUMN "service_type" "iam_permission_service_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "iam_permissions" ADD COLUMN "workspace_id" integer;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_permissions" ADD CONSTRAINT "iam_permissions_workspace_id_workspaces_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."workspaces"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_permissions" ADD CONSTRAINT "iam_permissions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_service_type" ON "iam_permissions" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_workspace_id" ON "iam_permissions" USING btree ("workspace_id");