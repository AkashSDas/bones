-- Manually adding enum since drizzle kit is not being able to detect enums
-- https://github.com/drizzle-team/drizzle-orm/issues/2389
CREATE TYPE account_status AS ENUM ('uninitialized', 'active', 'suspended', 'deactive');
CREATE TYPE iam_permission_service_type AS ENUM ('iam', 'workspace');
CREATE TYPE iam_permission_access_type AS ENUM ('read', 'write');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"account_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"account_name" varchar(255) NOT NULL,
	"status" "account_status" DEFAULT 'uninitialized' NOT NULL,
	"change_status_token" varchar(255),
	"change_status_token_age" timestamp with time zone,
	"password_hash" varchar(255) NOT NULL,
	"password_age" timestamp with time zone NOT NULL,
	"forgot_password_token" varchar(255),
	"forgot_password_token_age" timestamp with time zone,
	"is_verified" boolean DEFAULT false NOT NULL,
	"verification_token" varchar(255),
	"verification_token_age" timestamp with time zone,
	"last_verified_at" timestamp with time zone,
	"last_logged_in_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "accounts_account_id_unique" UNIQUE("account_id"),
	CONSTRAINT "accounts_email_unique" UNIQUE("email"),
	CONSTRAINT "accounts_account_name_unique" UNIQUE("account_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_permissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"permission_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"service_type" "iam_permission_service_type" NOT NULL,
	"is_service_wide" boolean DEFAULT false NOT NULL,
	"read_all" boolean DEFAULT false NOT NULL,
	"write_all" boolean DEFAULT false NOT NULL,
	"workspace_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "iam_permissions_permission_id_unique" UNIQUE("permission_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "iam_permission_users" (
	"id" serial PRIMARY KEY NOT NULL,
	"permission_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"access_type" "iam_permission_access_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"username" varchar(255) NOT NULL,
	"is_blocked" boolean DEFAULT false NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"password_age" timestamp with time zone NOT NULL,
	"last_logged_in_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"account_id" integer NOT NULL,
	CONSTRAINT "users_user_id_unique" UNIQUE("user_id")
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
 ALTER TABLE "iam_permission_users" ADD CONSTRAINT "iam_permission_users_permission_id_iam_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."iam_permissions"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "iam_permission_users" ADD CONSTRAINT "iam_permission_users_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
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
 ALTER TABLE "workspaces" ADD CONSTRAINT "workspaces_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE restrict ON UPDATE no action;
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
CREATE INDEX IF NOT EXISTS "account_id" ON "accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_email" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_name" ON "accounts" USING btree ("account_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_id" ON "iam_permissions" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_service_type" ON "iam_permissions" USING btree ("service_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_workspace_id" ON "iam_permissions" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_name_search_index" ON "iam_permissions" USING gin (to_tsvector('english', "name"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_user_permission_id" ON "iam_permission_users" USING btree ("permission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "iam_permission_user_user_id" ON "iam_permission_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id" ON "users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_account_id" ON "users" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_account_id_unique_index" ON "users" USING btree ("username","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_search_index" ON "users" USING gin (to_tsvector('english', "username"));--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_id" ON "workspaces" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_account_id" ON "workspaces" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_created_by_user_id" ON "workspaces" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "workspace_name_search_index" ON "workspaces" USING gin (to_tsvector('english', "name"));