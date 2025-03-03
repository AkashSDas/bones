/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import { faker } from "@faker-js/faker";
import { HttpResponse, delay, http } from "msw";

import type {
    GetApiV1IamAccountActivateActivationToken200,
    GetApiV1IamAccountExists200,
    PostApiV1IamAccount201,
    PostApiV1IamAccountLogin200,
    PostApiV1IamAccountResetPassword200,
    PostApiV1IamAccountResetPasswordResetToken200,
} from "../../schemas";

export const getPostApiV1IamAccountResponseMock = (
    overrideResponse: Partial<PostApiV1IamAccount201> = {},
): PostApiV1IamAccount201 => ({
    accessToken: faker.word.sample(),
    message: faker.word.sample(),
    ...overrideResponse,
});

export const getGetApiV1IamAccountActivateActivationTokenResponseMock = (
    overrideResponse: Partial<GetApiV1IamAccountActivateActivationToken200> = {},
): GetApiV1IamAccountActivateActivationToken200 => ({
    message: faker.word.sample(),
    ...overrideResponse,
});

export const getGetApiV1IamAccountExistsResponseMock = (
    overrideResponse: Partial<GetApiV1IamAccountExists200> = {},
): GetApiV1IamAccountExists200 => ({
    exists: faker.datatype.boolean(),
    ...overrideResponse,
});

export const getPostApiV1IamAccountLoginResponseMock = (
    overrideResponse: Partial<PostApiV1IamAccountLogin200> = {},
): PostApiV1IamAccountLogin200 => ({
    accessToken: faker.word.sample(),
    ...overrideResponse,
});

export const getPostApiV1IamAccountResetPasswordResponseMock = (
    overrideResponse: Partial<PostApiV1IamAccountResetPassword200> = {},
): PostApiV1IamAccountResetPassword200 => ({
    message: faker.word.sample(),
    ...overrideResponse,
});

export const getPostApiV1IamAccountResetPasswordResetTokenResponseMock = (
    overrideResponse: Partial<PostApiV1IamAccountResetPasswordResetToken200> = {},
): PostApiV1IamAccountResetPasswordResetToken200 => ({
    message: faker.word.sample(),
    ...overrideResponse,
});

export const getPostApiV1IamAccountMockHandler = (
    overrideResponse?:
        | PostApiV1IamAccount201
        | ((
              info: Parameters<Parameters<typeof http.post>[1]>[0],
          ) => Promise<PostApiV1IamAccount201> | PostApiV1IamAccount201),
) => {
    return http.post("*/api/v1/iam/account", async (info) => {
        await delay(1000);

        return new HttpResponse(
            JSON.stringify(
                overrideResponse !== undefined
                    ? typeof overrideResponse === "function"
                        ? await overrideResponse(info)
                        : overrideResponse
                    : getPostApiV1IamAccountResponseMock(),
            ),
            { status: 201, headers: { "Content-Type": "application/json" } },
        );
    });
};

export const getGetApiV1IamAccountActivateActivationTokenMockHandler = (
    overrideResponse?:
        | GetApiV1IamAccountActivateActivationToken200
        | ((
              info: Parameters<Parameters<typeof http.get>[1]>[0],
          ) =>
              | Promise<GetApiV1IamAccountActivateActivationToken200>
              | GetApiV1IamAccountActivateActivationToken200),
) => {
    return http.get("*/api/v1/iam/account/activate/:activationToken", async (info) => {
        await delay(1000);

        return new HttpResponse(
            JSON.stringify(
                overrideResponse !== undefined
                    ? typeof overrideResponse === "function"
                        ? await overrideResponse(info)
                        : overrideResponse
                    : getGetApiV1IamAccountActivateActivationTokenResponseMock(),
            ),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    });
};

export const getGetApiV1IamAccountExistsMockHandler = (
    overrideResponse?:
        | GetApiV1IamAccountExists200
        | ((
              info: Parameters<Parameters<typeof http.get>[1]>[0],
          ) => Promise<GetApiV1IamAccountExists200> | GetApiV1IamAccountExists200),
) => {
    return http.get("*/api/v1/iam/account/exists", async (info) => {
        await delay(1000);

        return new HttpResponse(
            JSON.stringify(
                overrideResponse !== undefined
                    ? typeof overrideResponse === "function"
                        ? await overrideResponse(info)
                        : overrideResponse
                    : getGetApiV1IamAccountExistsResponseMock(),
            ),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    });
};

export const getPostApiV1IamAccountLoginMockHandler = (
    overrideResponse?:
        | PostApiV1IamAccountLogin200
        | ((
              info: Parameters<Parameters<typeof http.post>[1]>[0],
          ) => Promise<PostApiV1IamAccountLogin200> | PostApiV1IamAccountLogin200),
) => {
    return http.post("*/api/v1/iam/account/login", async (info) => {
        await delay(1000);

        return new HttpResponse(
            JSON.stringify(
                overrideResponse !== undefined
                    ? typeof overrideResponse === "function"
                        ? await overrideResponse(info)
                        : overrideResponse
                    : getPostApiV1IamAccountLoginResponseMock(),
            ),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    });
};

export const getPostApiV1IamAccountResetPasswordMockHandler = (
    overrideResponse?:
        | PostApiV1IamAccountResetPassword200
        | ((
              info: Parameters<Parameters<typeof http.post>[1]>[0],
          ) =>
              | Promise<PostApiV1IamAccountResetPassword200>
              | PostApiV1IamAccountResetPassword200),
) => {
    return http.post("*/api/v1/iam/account/reset-password", async (info) => {
        await delay(1000);

        return new HttpResponse(
            JSON.stringify(
                overrideResponse !== undefined
                    ? typeof overrideResponse === "function"
                        ? await overrideResponse(info)
                        : overrideResponse
                    : getPostApiV1IamAccountResetPasswordResponseMock(),
            ),
            { status: 200, headers: { "Content-Type": "application/json" } },
        );
    });
};

export const getPostApiV1IamAccountResetPasswordResetTokenMockHandler = (
    overrideResponse?:
        | PostApiV1IamAccountResetPasswordResetToken200
        | ((
              info: Parameters<Parameters<typeof http.post>[1]>[0],
          ) =>
              | Promise<PostApiV1IamAccountResetPasswordResetToken200>
              | PostApiV1IamAccountResetPasswordResetToken200),
) => {
    return http.post(
        "*/api/v1/iam/account/reset-password/:resetToken",
        async (info) => {
            await delay(1000);

            return new HttpResponse(
                JSON.stringify(
                    overrideResponse !== undefined
                        ? typeof overrideResponse === "function"
                            ? await overrideResponse(info)
                            : overrideResponse
                        : getPostApiV1IamAccountResetPasswordResetTokenResponseMock(),
                ),
                { status: 200, headers: { "Content-Type": "application/json" } },
            );
        },
    );
};
export const getIamAccountMock = () => [
    getPostApiV1IamAccountMockHandler(),
    getGetApiV1IamAccountActivateActivationTokenMockHandler(),
    getGetApiV1IamAccountExistsMockHandler(),
    getPostApiV1IamAccountLoginMockHandler(),
    getPostApiV1IamAccountResetPasswordMockHandler(),
    getPostApiV1IamAccountResetPasswordResetTokenMockHandler(),
];
