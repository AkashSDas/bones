import { z } from "zod";

const UserPublicFacingId = z.string().uuid();

/** This is overall IAM service IAM permission policy for an account */
const IAMService = z
    .object({
        /** All the user can read */
        readAll: z.boolean(),

        /** All the user can write */
        writeAll: z.boolean(),

        /** Following users along with admin can view. List of user public facing IDs */
        readForUsers: z.array(UserPublicFacingId),

        /** Following users along with admin can write. List of user public facing IDs */
        writeForUsers: z.array(UserPublicFacingId),
    })
    .transform(function validateConflicts(v) {
        const conflictingRead = v.readAll && v.readForUsers.length > 0;
        const conflictingWrite = v.writeAll && v.writeForUsers.length > 0;

        if (conflictingRead) {
            throw new Error(
                "Only one value is allowed to be added: 'readAll' or 'readForUsers'",
            );
        }

        if (conflictingWrite) {
            throw new Error(
                "Only one value is allowed to be added: 'writeAll' or 'writeForUsers'",
            );
        }

        return v;
    });

// ====================================
// Exports
// ====================================

export const IAMPolicies = {
    IAMService,
};
