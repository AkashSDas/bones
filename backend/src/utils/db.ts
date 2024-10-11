import { serial, timestamp, uuid } from "drizzle-orm/pg-core";
import { v7 as uuid7 } from "uuid";

/**
 * Utility class for creating column definitions in DrizzleORM.
 */
class ORM {
    pk(columnName: string = "id") {
        return serial(columnName).notNull().primaryKey();
    }

    uuid(columnName: string) {
        return uuid(columnName)
            .$defaultFn(() => uuid7())
            .notNull();
    }

    timestamp(columnName: string) {
        return timestamp(columnName, { mode: "string", withTimezone: true });
    }
}

export const orm = new ORM();
