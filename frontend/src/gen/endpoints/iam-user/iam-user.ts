/**
 * Generated by orval v7.2.0 🍺
 * Do not edit manually.
 * Bones
 * OpenAPI spec version: 1.0.0
 */
import * as axios from "axios";
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
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

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

export const postApiV1IamUser = (
    postApiV1IamUserBody: PostApiV1IamUserBody,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostApiV1IamUser201>> => {
    return axios.default.post(
        `http://localhost:8000/api/v1/iam/user`,
        postApiV1IamUserBody,
        options,
    );
};

export const getPostApiV1IamUserMutationOptions = <
    TError = AxiosError<
        | PostApiV1IamUser400
        | PostApiV1IamUser401
        | PostApiV1IamUser403
        | PostApiV1IamUser404
        | PostApiV1IamUser500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        TError,
        { data: PostApiV1IamUserBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1IamUser>>,
    TError,
    { data: PostApiV1IamUserBody },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        { data: PostApiV1IamUserBody }
    > = (props) => {
        const { data } = props ?? {};

        return postApiV1IamUser(data, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1IamUserMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1IamUser>>
>;
export type PostApiV1IamUserMutationBody = PostApiV1IamUserBody;
export type PostApiV1IamUserMutationError = AxiosError<
    | PostApiV1IamUser400
    | PostApiV1IamUser401
    | PostApiV1IamUser403
    | PostApiV1IamUser404
    | PostApiV1IamUser500
>;

export const usePostApiV1IamUser = <
    TError = AxiosError<
        | PostApiV1IamUser400
        | PostApiV1IamUser401
        | PostApiV1IamUser403
        | PostApiV1IamUser404
        | PostApiV1IamUser500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUser>>,
        TError,
        { data: PostApiV1IamUserBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1IamUser>>,
    TError,
    { data: PostApiV1IamUserBody },
    TContext
> => {
    const mutationOptions = getPostApiV1IamUserMutationOptions(options);

    return useMutation(mutationOptions);
};
export const getApiV1IamUser = (
    params?: GetApiV1IamUserParams,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetApiV1IamUser200>> => {
    return axios.default.get(`http://localhost:8000/api/v1/iam/user`, {
        ...options,
        params: { ...params, ...options?.params },
    });
};

export const getGetApiV1IamUserQueryKey = (params?: GetApiV1IamUserParams) => {
    return [
        `http://localhost:8000/api/v1/iam/user`,
        ...(params ? [params] : []),
    ] as const;
};

export const getGetApiV1IamUserQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError = AxiosError<
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500
    >,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        axios?: AxiosRequestConfig;
    },
) => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getGetApiV1IamUserQueryKey(params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1IamUser>>> = ({
        signal,
    }) => getApiV1IamUser(params, { signal, ...axiosOptions });

    return { queryKey, queryFn, staleTime: 10000, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1IamUser>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1IamUserQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1IamUser>>
>;
export type GetApiV1IamUserQueryError = AxiosError<
    | GetApiV1IamUser400
    | GetApiV1IamUser401
    | GetApiV1IamUser403
    | GetApiV1IamUser404
    | GetApiV1IamUser500
>;

export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError = AxiosError<
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500
    >,
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
        axios?: AxiosRequestConfig;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError = AxiosError<
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500
    >,
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
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError = AxiosError<
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500
    >,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1IamUser<
    TData = Awaited<ReturnType<typeof getApiV1IamUser>>,
    TError = AxiosError<
        | GetApiV1IamUser400
        | GetApiV1IamUser401
        | GetApiV1IamUser403
        | GetApiV1IamUser404
        | GetApiV1IamUser500
    >,
>(
    params?: GetApiV1IamUserParams,
    options?: {
        query?: Partial<
            UseQueryOptions<Awaited<ReturnType<typeof getApiV1IamUser>>, TError, TData>
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1IamUserQueryOptions(params, options);

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}

export const patchApiV1IamUserUserId = (
    userId: string,
    patchApiV1IamUserUserIdBody: PatchApiV1IamUserUserIdBody,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<PatchApiV1IamUserUserId200>> => {
    return axios.default.patch(
        `http://localhost:8000/api/v1/iam/user/${userId}`,
        patchApiV1IamUserUserIdBody,
        options,
    );
};

export const getPatchApiV1IamUserUserIdMutationOptions = <
    TError = AxiosError<
        | PatchApiV1IamUserUserId400
        | PatchApiV1IamUserUserId401
        | PatchApiV1IamUserUserId403
        | PatchApiV1IamUserUserId404
        | PatchApiV1IamUserUserId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        TError,
        { userId: string; data: PatchApiV1IamUserUserIdBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
    TError,
    { userId: string; data: PatchApiV1IamUserUserIdBody },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        { userId: string; data: PatchApiV1IamUserUserIdBody }
    > = (props) => {
        const { userId, data } = props ?? {};

        return patchApiV1IamUserUserId(userId, data, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PatchApiV1IamUserUserIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>
>;
export type PatchApiV1IamUserUserIdMutationBody = PatchApiV1IamUserUserIdBody;
export type PatchApiV1IamUserUserIdMutationError = AxiosError<
    | PatchApiV1IamUserUserId400
    | PatchApiV1IamUserUserId401
    | PatchApiV1IamUserUserId403
    | PatchApiV1IamUserUserId404
    | PatchApiV1IamUserUserId500
>;

export const usePatchApiV1IamUserUserId = <
    TError = AxiosError<
        | PatchApiV1IamUserUserId400
        | PatchApiV1IamUserUserId401
        | PatchApiV1IamUserUserId403
        | PatchApiV1IamUserUserId404
        | PatchApiV1IamUserUserId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
        TError,
        { userId: string; data: PatchApiV1IamUserUserIdBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof patchApiV1IamUserUserId>>,
    TError,
    { userId: string; data: PatchApiV1IamUserUserIdBody },
    TContext
> => {
    const mutationOptions = getPatchApiV1IamUserUserIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export const deleteApiV1IamUserUserId = (
    userId: string,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.delete(
        `http://localhost:8000/api/v1/iam/user/${userId}`,
        options,
    );
};

export const getDeleteApiV1IamUserUserIdMutationOptions = <
    TError = AxiosError<
        | DeleteApiV1IamUserUserId400
        | DeleteApiV1IamUserUserId401
        | DeleteApiV1IamUserUserId403
        | DeleteApiV1IamUserUserId404
        | DeleteApiV1IamUserUserId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        TError,
        { userId: string },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
    TError,
    { userId: string },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        { userId: string }
    > = (props) => {
        const { userId } = props ?? {};

        return deleteApiV1IamUserUserId(userId, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type DeleteApiV1IamUserUserIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>
>;

export type DeleteApiV1IamUserUserIdMutationError = AxiosError<
    | DeleteApiV1IamUserUserId400
    | DeleteApiV1IamUserUserId401
    | DeleteApiV1IamUserUserId403
    | DeleteApiV1IamUserUserId404
    | DeleteApiV1IamUserUserId500
>;

export const useDeleteApiV1IamUserUserId = <
    TError = AxiosError<
        | DeleteApiV1IamUserUserId400
        | DeleteApiV1IamUserUserId401
        | DeleteApiV1IamUserUserId403
        | DeleteApiV1IamUserUserId404
        | DeleteApiV1IamUserUserId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
        TError,
        { userId: string },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteApiV1IamUserUserId>>,
    TError,
    { userId: string },
    TContext
> => {
    const mutationOptions = getDeleteApiV1IamUserUserIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export const getApiV1IamUserExists = (
    params: GetApiV1IamUserExistsParams,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<GetApiV1IamUserExists200>> => {
    return axios.default.get(`http://localhost:8000/api/v1/iam/user/exists`, {
        ...options,
        params: { ...params, ...options?.params },
    });
};

export const getGetApiV1IamUserExistsQueryKey = (
    params: GetApiV1IamUserExistsParams,
) => {
    return [
        `http://localhost:8000/api/v1/iam/user/exists`,
        ...(params ? [params] : []),
    ] as const;
};

export const getGetApiV1IamUserExistsQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError = AxiosError<
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500
    >,
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
        axios?: AxiosRequestConfig;
    },
) => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getGetApiV1IamUserExistsQueryKey(params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1IamUserExists>>> = ({
        signal,
    }) => getApiV1IamUserExists(params, { signal, ...axiosOptions });

    return { queryKey, queryFn, staleTime: 10000, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1IamUserExists>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1IamUserExistsQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1IamUserExists>>
>;
export type GetApiV1IamUserExistsQueryError = AxiosError<
    | GetApiV1IamUserExists400
    | GetApiV1IamUserExists401
    | GetApiV1IamUserExists404
    | GetApiV1IamUserExists500
>;

export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError = AxiosError<
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500
    >,
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
        axios?: AxiosRequestConfig;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError = AxiosError<
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500
    >,
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
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError = AxiosError<
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500
    >,
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
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1IamUserExists<
    TData = Awaited<ReturnType<typeof getApiV1IamUserExists>>,
    TError = AxiosError<
        | GetApiV1IamUserExists400
        | GetApiV1IamUserExists401
        | GetApiV1IamUserExists404
        | GetApiV1IamUserExists500
    >,
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
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1IamUserExistsQueryOptions(params, options);

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}

export const postApiV1IamUserLogin = (
    postApiV1IamUserLoginBody: PostApiV1IamUserLoginBody,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostApiV1IamUserLogin200>> => {
    return axios.default.post(
        `http://localhost:8000/api/v1/iam/user/login`,
        postApiV1IamUserLoginBody,
        options,
    );
};

export const getPostApiV1IamUserLoginMutationOptions = <
    TError = AxiosError<
        PostApiV1IamUserLogin400 | PostApiV1IamUserLogin404 | PostApiV1IamUserLogin500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        TError,
        { data: PostApiV1IamUserLoginBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
    TError,
    { data: PostApiV1IamUserLoginBody },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        { data: PostApiV1IamUserLoginBody }
    > = (props) => {
        const { data } = props ?? {};

        return postApiV1IamUserLogin(data, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1IamUserLoginMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>
>;
export type PostApiV1IamUserLoginMutationBody = PostApiV1IamUserLoginBody;
export type PostApiV1IamUserLoginMutationError = AxiosError<
    PostApiV1IamUserLogin400 | PostApiV1IamUserLogin404 | PostApiV1IamUserLogin500
>;

export const usePostApiV1IamUserLogin = <
    TError = AxiosError<
        PostApiV1IamUserLogin400 | PostApiV1IamUserLogin404 | PostApiV1IamUserLogin500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
        TError,
        { data: PostApiV1IamUserLoginBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1IamUserLogin>>,
    TError,
    { data: PostApiV1IamUserLoginBody },
    TContext
> => {
    const mutationOptions = getPostApiV1IamUserLoginMutationOptions(options);

    return useMutation(mutationOptions);
};
