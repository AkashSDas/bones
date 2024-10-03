import { serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";

/**
 * Utility functions for creating column definitions in DrizzleORM.
 */
export const orm = {
    pk: function (columnName: string = "id") {
        return serial(columnName).notNull().primaryKey();
    },
    uuid: function (columnName: string) {
        return uuid(columnName)
            .$defaultFn(() => uuid7())
            .notNull();
    },
    timestamp: function (columnName: string) {
        return timestamp(columnName, {
            withTimezone: true, // convert and stored as UTC
            mode: "string", // return string instead of Date
        });
    },
};
