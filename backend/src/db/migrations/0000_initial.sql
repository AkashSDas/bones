-- Manually adding enum since drizzle kit is not being able to detect enums
-- https://github.com/drizzle-team/drizzle-orm/issues/2389
CREATE TYPE account_status AS ENUM ('uninitialized', 'active', 'suspended', 'deactive')
--> statement-breakpointCREATE TABLE IF NOT EXISTS "accounts" (
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
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_account_id_index" ON "accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_email_index" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "accounts_account_name_index" ON "accounts" USING btree ("account_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_user_id_index" ON "users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_username_index" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "users_account_id_index" ON "users" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_account_id_index" ON "users" USING btree ("username","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "username_search_index" ON "users" USING gin (to_tsvector('english', "username"));