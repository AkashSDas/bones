DROP INDEX IF EXISTS "accounts_account_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "accounts_email_index";--> statement-breakpoint
DROP INDEX IF EXISTS "accounts_account_name_index";--> statement-breakpoint
DROP INDEX IF EXISTS "users_user_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_index";--> statement-breakpoint
DROP INDEX IF EXISTS "users_account_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "users_username_account_id_index";--> statement-breakpoint
DROP INDEX IF EXISTS "username_search_index";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_id" ON "accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_email" ON "accounts" USING btree ("email");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_name" ON "accounts" USING btree ("account_name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id" ON "users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_account_id" ON "users" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "user_username_account_id_unique_index" ON "users" USING btree ("username","account_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_username_search_index" ON "users" USING gin (to_tsvector('english', "username"));