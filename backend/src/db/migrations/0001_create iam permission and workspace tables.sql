CREATE TABLE IF NOT EXISTS "iam_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"permission_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"read" boolean DEFAULT false NOT NULL,
	"write" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "iam_permissions_permission_id_unique" UNIQUE("permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workspaces" (
	"id" serial PRIMARY KEY NOT NULL,
	"workspace_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"container_image" varchar(255) NOT NULL,
	"container_image_tag" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	"created_by_user_id" integer,
	CONSTRAINT "workspaces_workspace_id_unique" UNIQUE("workspace_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_permissions" ADD CONSTRAINT "iam_permissions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_created_by_user_id_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_id" ON "iam_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_read" ON "iam_permissions" USING btree ("read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_write" ON "iam_permissions" USING btree ("read");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_name_search_index" ON "iam_permissions" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_id" ON "workspaces" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_account_id" ON "workspaces" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_created_by_user_id" ON "workspaces" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_name_search_index" ON "workspaces" USING gin (to_tsvector('english', "name"));