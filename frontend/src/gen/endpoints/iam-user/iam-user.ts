/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import { useMutation, useQuery } from "@tanstack/react-query";
import type {
    DefinedInitialDataOptions,
    DefinedUseQueryResult,
    MutationFunction,
    QueryFunction,
    QueryKey,
    UndefinedInitialDataOptions,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";

import type {
    DeleteApiV1IamUserUserId400,
    DeleteApiV1IamUserUserId401,
    DeleteApiV1IamUserUserId403,
    DeleteApiV1IamUserUserId404,
    DeleteApiV1IamUserUserId500,
    GetApiV1IamUser200,
    GetApiV1IamUser400,
    GetApiV1IamUser401,
    GetApiV1IamUser403,
    GetApiV1IamUser404,
    GetApiV1IamUser500,
    GetApiV1IamUserExists200,
    GetApiV1IamUserExists400,
    GetApiV1IamUserExists401,
    GetApiV1IamUserExists404,
    GetApiV1IamUserExists500,
    GetApiV1IamUserExistsParams,
    GetApiV1IamUserParams,
    PatchApiV1IamUserUserId200,
    PatchApiV1IamUserUserId400,
    PatchApiV1IamUserUserId401,
    PatchApiV1IamUserUserId403,
    PatchApiV1IamUserUserId404,
    PatchApiV1IamUserUserId500,
    PatchApiV1IamUserUserIdBody,
    PostApiV1IamUser201,
    PostApiV1IamUser400,
    PostApiV1IamUser401,
    PostApiV1IamUser403,
    PostApiV1IamUser404,
    PostApiV1IamUser500,
    PostApiV1IamUserBody,
    PostApiV1IamUserLogin200,
    PostApiV1IamUserLogin400,
    PostApiV1IamUserLogin404,
    PostApiV1IamUserLogin500,
    PostApiV1IamUserLoginBody,
} from "../../schemas";

export type postApiV1IamUserResponse = {
    data: PostApiV1IamUser201;
    status: number;
};

export const getPostApiV1IamUserUrl = () => {
    return `/api/v1/iam/user`;
};

export const postApiV1IamUser = async (
    postApiV1IamUserBody: PostApiV1IamUserBody,
    options?: RequestInit,
): Promise<postApiV1IamUserResponse> => {
    const res = await fetch(getPostApiV1IamUserUrl(), {
        ...options,
        method: "POST",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(postApiV1IamUserBody),
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getPostApiV1IamUserMutationOptions = <
    TError =
        | PostApiV1IamUser400
        | PostApiV1IamUser401
        | PostApiV1IamUser403
        | PostApiV1IamUser404
        | PostApiV1IamUser500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        TError,
        { data: PostApiV1IamUserBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1IamUser>>,
    TError,
    { data: PostApiV1IamUserBody },
    TContext
> => {
    const { mutation: mutationOptions, fetch: fetchOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        { data: PostApiV1IamUserBody }
    > = (props) => {
        const { data } = props ?? {};

        return postApiV1IamUser(data, fetchOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1IamUserMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1IamUser>>
>;
export type PostApiV1IamUserMutationBody = PostApiV1IamUserBody;
export type PostApiV1IamUserMutationError =
    | PostApiV1IamUser400
    | PostApiV1IamUser401
    | PostApiV1IamUser403
    | PostApiV1IamUser404
    | PostApiV1IamUser500;

export const usePostApiV1IamUser = <
    TError =
        | PostApiV1IamUser400
        | PostApiV1IamUser401
        | PostApiV1IamUser403
        | PostApiV1IamUser404
        | PostApiV1IamUser500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        TError,
        { data: PostApiV1IamUserBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1IamUser>>,
    TError,
    { data: PostApiV1IamUserBody },
    TContext
> => {
    const mutationOptions = getPostApiV1IamUserMutationOptions(options);

    return useMutation(mutationOptions);
};
export type getApiV1IamUserResponse = {
    data: GetApiV1IamUser200;
    status: number;
};

export const getGetApiV1IamUserUrl = (params?: GetApiV1IamUserParams) => {
    const normalizedParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });

    return normalizedParams.size
        ? `/api/v1/iam/user?${normalizedParams.toString()}`
        : `/api/v1/iam/user`;
};

export const getApiV1IamUser = async (
    params?: GetApiV1IamUserParams,
    options?: RequestInit,
): Promise<getApiV1IamUserResponse> => {
    const res = await fetch(getGetApiV1IamUserUrl(params), {
        ...options,
        method: "GET",
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getGetApiV1IamUserQueryKey = (params?: GetApiV1IamUserParams) => {
    return [`/api/v1/iam/user`, ...(params ? [params] : [])] as const;
};

export const getGetApiV1IamUserQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError =
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        fetch?: RequestInit;
    },
) => {
    const { query: queryOptions, fetch: fetchOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getGetApiV1IamUserQueryKey(params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1IamUser>>> = ({
        signal,
    }) => getApiV1IamUser(params, { signal, ...fetchOptions });

    return { queryKey, queryFn, staleTime: 10000, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1IamUser>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1IamUserQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1IamUser>>
>;
export type GetApiV1IamUserQueryError =
    | GetApiV1IamUser400
    | GetApiV1IamUser401
    | GetApiV1IamUser403
    | GetApiV1IamUser404
    | GetApiV1IamUser500;

export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError =
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500,
>(
    params: undefined | GetApiV1IamUserParams,
    options: {
        query: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        > &
            Pick<
                DefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1IamUser>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        fetch?: RequestInit;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError =
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        > &
            Pick<
                UndefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1IamUser>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError =
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError =
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1IamUserQueryOptions(params, options);

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}

export type patchApiV1IamUserUserIdResponse = {
    data: PatchApiV1IamUserUserId200;
    status: number;
};

export const getPatchApiV1IamUserUserIdUrl = (userId: string) => {
    return `/api/v1/iam/user/${userId}`;
};

export const patchApiV1IamUserUserId = async (
    userId: string,
    patchApiV1IamUserUserIdBody: PatchApiV1IamUserUserIdBody,
    options?: RequestInit,
): Promise<patchApiV1IamUserUserIdResponse> => {
    const res = await fetch(getPatchApiV1IamUserUserIdUrl(userId), {
        ...options,
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(patchApiV1IamUserUserIdBody),
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getPatchApiV1IamUserUserIdMutationOptions = <
    TError =
        | PatchApiV1IamUserUserId400
        | PatchApiV1IamUserUserId401
        | PatchApiV1IamUserUserId403
        | PatchApiV1IamUserUserId404
        | PatchApiV1IamUserUserId500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        TError,
        { userId: string; data: PatchApiV1IamUserUserIdBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationOptions<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
    TError,
    { userId: string; data: PatchApiV1IamUserUserIdBody },
    TContext
> => {
    const { mutation: mutationOptions, fetch: fetchOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        { userId: string; data: PatchApiV1IamUserUserIdBody }
    > = (props) => {
        const { userId, data } = props ?? {};

        return patchApiV1IamUserUserId(userId, data, fetchOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PatchApiV1IamUserUserIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>
>;
export type PatchApiV1IamUserUserIdMutationBody = PatchApiV1IamUserUserIdBody;
export type PatchApiV1IamUserUserIdMutationError =
    | PatchApiV1IamUserUserId400
    | PatchApiV1IamUserUserId401
    | PatchApiV1IamUserUserId403
    | PatchApiV1IamUserUserId404
    | PatchApiV1IamUserUserId500;

export const usePatchApiV1IamUserUserId = <
    TError =
        | PatchApiV1IamUserUserId400
        | PatchApiV1IamUserUserId401
        | PatchApiV1IamUserUserId403
        | PatchApiV1IamUserUserId404
        | PatchApiV1IamUserUserId500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        TError,
        { userId: string; data: PatchApiV1IamUserUserIdBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationResult<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
    TError,
    { userId: string; data: PatchApiV1IamUserUserIdBody },
    TContext
> => {
    const mutationOptions = getPatchApiV1IamUserUserIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export type deleteApiV1IamUserUserIdResponse = {
    data: void;
    status: number;
};

export const getDeleteApiV1IamUserUserIdUrl = (userId: string) => {
    return `/api/v1/iam/user/${userId}`;
};

export const deleteApiV1IamUserUserId = async (
    userId: string,
    options?: RequestInit,
): Promise<deleteApiV1IamUserUserIdResponse> => {
    const res = await fetch(getDeleteApiV1IamUserUserIdUrl(userId), {
        ...options,
        method: "DELETE",
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getDeleteApiV1IamUserUserIdMutationOptions = <
    TError =
        | DeleteApiV1IamUserUserId400
        | DeleteApiV1IamUserUserId401
        | DeleteApiV1IamUserUserId403
        | DeleteApiV1IamUserUserId404
        | DeleteApiV1IamUserUserId500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        TError,
        { userId: string },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
    TError,
    { userId: string },
    TContext
> => {
    const { mutation: mutationOptions, fetch: fetchOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        { userId: string }
    > = (props) => {
        const { userId } = props ?? {};

        return deleteApiV1IamUserUserId(userId, fetchOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type DeleteApiV1IamUserUserIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>
>;

export type DeleteApiV1IamUserUserIdMutationError =
    | DeleteApiV1IamUserUserId400
    | DeleteApiV1IamUserUserId401
    | DeleteApiV1IamUserUserId403
    | DeleteApiV1IamUserUserId404
    | DeleteApiV1IamUserUserId500;

export const useDeleteApiV1IamUserUserId = <
    TError =
        | DeleteApiV1IamUserUserId400
        | DeleteApiV1IamUserUserId401
        | DeleteApiV1IamUserUserId403
        | DeleteApiV1IamUserUserId404
        | DeleteApiV1IamUserUserId500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        TError,
        { userId: string },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
    TError,
    { userId: string },
    TContext
> => {
    const mutationOptions = getDeleteApiV1IamUserUserIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export type getApiV1IamUserExistsResponse = {
    data: GetApiV1IamUserExists200;
    status: number;
};

export const getGetApiV1IamUserExistsUrl = (params: GetApiV1IamUserExistsParams) => {
    const normalizedParams = new URLSearchParams();

    Object.entries(params || {}).forEach(([key, value]) => {
        if (value !== undefined) {
            normalizedParams.append(key, value === null ? "null" : value.toString());
        }
    });

    return normalizedParams.size
        ? `/api/v1/iam/user/exists?${normalizedParams.toString()}`
        : `/api/v1/iam/user/exists`;
};

export const getApiV1IamUserExists = async (
    params: GetApiV1IamUserExistsParams,
    options?: RequestInit,
): Promise<getApiV1IamUserExistsResponse> => {
    const res = await fetch(getGetApiV1IamUserExistsUrl(params), {
        ...options,
        method: "GET",
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getGetApiV1IamUserExistsQueryKey = (
    params: GetApiV1IamUserExistsParams,
) => {
    return [`/api/v1/iam/user/exists`, ...(params ? [params] : [])] as const;
};

export const getGetApiV1IamUserExistsQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError =
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500,
>(
    params: GetApiV1IamUserExistsParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                TError,
                TData
            >
        >;
        fetch?: RequestInit;
    },
) => {
    const { query: queryOptions, fetch: fetchOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getGetApiV1IamUserExistsQueryKey(params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1IamUserExists>>> = ({
        signal,
    }) => getApiV1IamUserExists(params, { signal, ...fetchOptions });

    return { queryKey, queryFn, staleTime: 10000, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1IamUserExists>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1IamUserExistsQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1IamUserExists>>
>;
export type GetApiV1IamUserExistsQueryError =
    | GetApiV1IamUserExists400
    | GetApiV1IamUserExists401
    | GetApiV1IamUserExists404
    | GetApiV1IamUserExists500;

export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError =
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500,
>(
    params: GetApiV1IamUserExistsParams,
    options: {
        query: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                TError,
                TData
            >
        > &
            Pick<
                DefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        fetch?: RequestInit;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError =
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500,
>(
    params: GetApiV1IamUserExistsParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                TError,
                TData
            >
        > &
            Pick<
                UndefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError =
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500,
>(
    params: GetApiV1IamUserExistsParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                TError,
                TData
            >
        >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError =
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500,
>(
    params: GetApiV1IamUserExistsParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1IamUserExists>>,
                TError,
                TData
            >
        >;
        fetch?: RequestInit;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1IamUserExistsQueryOptions(params, options);

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}

export type postApiV1IamUserLoginResponse = {
    data: PostApiV1IamUserLogin200;
    status: number;
};

export const getPostApiV1IamUserLoginUrl = () => {
    return `/api/v1/iam/user/login`;
};

export const postApiV1IamUserLogin = async (
    postApiV1IamUserLoginBody: PostApiV1IamUserLoginBody,
    options?: RequestInit,
): Promise<postApiV1IamUserLoginResponse> => {
    const res = await fetch(getPostApiV1IamUserLoginUrl(), {
        ...options,
        method: "POST",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(postApiV1IamUserLoginBody),
    });
    const data = await res.json();

    return { status: res.status, data };
};

export const getPostApiV1IamUserLoginMutationOptions = <
    TError =
        | PostApiV1IamUserLogin400
        | PostApiV1IamUserLogin404
        | PostApiV1IamUserLogin500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        TError,
        { data: PostApiV1IamUserLoginBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
    TError,
    { data: PostApiV1IamUserLoginBody },
    TContext
> => {
    const { mutation: mutationOptions, fetch: fetchOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        { data: PostApiV1IamUserLoginBody }
    > = (props) => {
        const { data } = props ?? {};

        return postApiV1IamUserLogin(data, fetchOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1IamUserLoginMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>
>;
export type PostApiV1IamUserLoginMutationBody = PostApiV1IamUserLoginBody;
export type PostApiV1IamUserLoginMutationError =
    | PostApiV1IamUserLogin400
    | PostApiV1IamUserLogin404
    | PostApiV1IamUserLogin500;

export const usePostApiV1IamUserLogin = <
    TError =
        | PostApiV1IamUserLogin400
        | PostApiV1IamUserLogin404
        | PostApiV1IamUserLogin500,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        TError,
        { data: PostApiV1IamUserLoginBody },
        TContext
    >;
    fetch?: RequestInit;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
    TError,
    { data: PostApiV1IamUserLoginBody },
    TContext
> => {
    const mutationOptions = getPostApiV1IamUserLoginMutationOptions(options);

    return useMutation(mutationOptions);
};
