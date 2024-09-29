import { serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { ulid } from "ulid";

/**
 * Utility functions for creating column definitions in DrizzleORM.
 */
export const orm = {
    pk: function (columnName: string = "id") {
        return serial(columnName).notNull().primaryKey();
    },
    ulid: function (columnName: string) {
        return uuid(columnName)
            .$defaultFn(() => ulid()) // create ULID
            .notNull();
    },
    timestamp: function (columnName: string) {
        return timestamp(columnName, {
            withTimezone: true, // convert and stored as UTC
            mode: "string", // return string instead of Date
        });
    },
};
