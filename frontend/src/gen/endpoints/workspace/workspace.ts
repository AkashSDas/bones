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
    DeleteApiV1WorkspaceDeinitialize400,
    DeleteApiV1WorkspaceDeinitialize401,
    DeleteApiV1WorkspaceDeinitialize403,
    DeleteApiV1WorkspaceDeinitialize500,
    DeleteApiV1WorkspaceWorkspaceId400,
    DeleteApiV1WorkspaceWorkspaceId401,
    DeleteApiV1WorkspaceWorkspaceId403,
    DeleteApiV1WorkspaceWorkspaceId500,
    GetApiV1Workspace400,
    GetApiV1Workspace401,
    GetApiV1Workspace403,
    GetApiV1Workspace500,
    GetApiV1WorkspaceParams,
    GetApiV1WorkspaceWorkspaceId400,
    GetApiV1WorkspaceWorkspaceId401,
    GetApiV1WorkspaceWorkspaceId403,
    GetApiV1WorkspaceWorkspaceId500,
    PatchApiV1WorkspaceWorkspaceId400,
    PatchApiV1WorkspaceWorkspaceId401,
    PatchApiV1WorkspaceWorkspaceId403,
    PatchApiV1WorkspaceWorkspaceId500,
    PatchApiV1WorkspaceWorkspaceIdBody,
    PostApiV1Workspace201,
    PostApiV1Workspace400,
    PostApiV1Workspace401,
    PostApiV1Workspace403,
    PostApiV1Workspace500,
    PostApiV1WorkspaceBody,
    PostApiV1WorkspaceInitialize200,
    PostApiV1WorkspaceInitialize400,
    PostApiV1WorkspaceInitialize401,
    PostApiV1WorkspaceInitialize403,
    PostApiV1WorkspaceInitialize500,
} from "../../schemas";

export const postApiV1WorkspaceInitialize = (
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostApiV1WorkspaceInitialize200>> => {
    return axios.default.post(
        `http://localhost:5050/api/v1/workspace/initialize`,
        undefined,
        options,
    );
};

export const getPostApiV1WorkspaceInitializeMutationOptions = <
    TError = AxiosError<
        | PostApiV1WorkspaceInitialize400
        | PostApiV1WorkspaceInitialize401
        | PostApiV1WorkspaceInitialize403
        | PostApiV1WorkspaceInitialize500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>,
        TError,
        void,
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>,
    TError,
    void,
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>,
        void
    > = () => {
        return postApiV1WorkspaceInitialize(axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1WorkspaceInitializeMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>
>;

export type PostApiV1WorkspaceInitializeMutationError = AxiosError<
    | PostApiV1WorkspaceInitialize400
    | PostApiV1WorkspaceInitialize401
    | PostApiV1WorkspaceInitialize403
    | PostApiV1WorkspaceInitialize500
>;

export const usePostApiV1WorkspaceInitialize = <
    TError = AxiosError<
        | PostApiV1WorkspaceInitialize400
        | PostApiV1WorkspaceInitialize401
        | PostApiV1WorkspaceInitialize403
        | PostApiV1WorkspaceInitialize500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>,
        TError,
        void,
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1WorkspaceInitialize>>,
    TError,
    void,
    TContext
> => {
    const mutationOptions = getPostApiV1WorkspaceInitializeMutationOptions(options);

    return useMutation(mutationOptions);
};
export const deleteApiV1WorkspaceDeinitialize = (
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.delete(
        `http://localhost:5050/api/v1/workspace/deinitialize`,
        options,
    );
};

export const getDeleteApiV1WorkspaceDeinitializeMutationOptions = <
    TError = AxiosError<
        | DeleteApiV1WorkspaceDeinitialize400
        | DeleteApiV1WorkspaceDeinitialize401
        | DeleteApiV1WorkspaceDeinitialize403
        | DeleteApiV1WorkspaceDeinitialize500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>,
        TError,
        void,
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>,
    TError,
    void,
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>,
        void
    > = () => {
        return deleteApiV1WorkspaceDeinitialize(axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type DeleteApiV1WorkspaceDeinitializeMutationResult = NonNullable<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>
>;

export type DeleteApiV1WorkspaceDeinitializeMutationError = AxiosError<
    | DeleteApiV1WorkspaceDeinitialize400
    | DeleteApiV1WorkspaceDeinitialize401
    | DeleteApiV1WorkspaceDeinitialize403
    | DeleteApiV1WorkspaceDeinitialize500
>;

export const useDeleteApiV1WorkspaceDeinitialize = <
    TError = AxiosError<
        | DeleteApiV1WorkspaceDeinitialize400
        | DeleteApiV1WorkspaceDeinitialize401
        | DeleteApiV1WorkspaceDeinitialize403
        | DeleteApiV1WorkspaceDeinitialize500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>,
        TError,
        void,
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceDeinitialize>>,
    TError,
    void,
    TContext
> => {
    const mutationOptions = getDeleteApiV1WorkspaceDeinitializeMutationOptions(options);

    return useMutation(mutationOptions);
};
export const postApiV1Workspace = (
    postApiV1WorkspaceBody: PostApiV1WorkspaceBody,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<PostApiV1Workspace201>> => {
    return axios.default.post(
        `http://localhost:5050/api/v1/workspace`,
        postApiV1WorkspaceBody,
        options,
    );
};

export const getPostApiV1WorkspaceMutationOptions = <
    TError = AxiosError<
        | PostApiV1Workspace400
        | PostApiV1Workspace401
        | PostApiV1Workspace403
        | PostApiV1Workspace500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1Workspace>>,
        TError,
        { data: PostApiV1WorkspaceBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof postApiV1Workspace>>,
    TError,
    { data: PostApiV1WorkspaceBody },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof postApiV1Workspace>>,
        { data: PostApiV1WorkspaceBody }
    > = (props) => {
        const { data } = props ?? {};

        return postApiV1Workspace(data, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PostApiV1WorkspaceMutationResult = NonNullable<
    Awaited<ReturnType<typeof postApiV1Workspace>>
>;
export type PostApiV1WorkspaceMutationBody = PostApiV1WorkspaceBody;
export type PostApiV1WorkspaceMutationError = AxiosError<
    | PostApiV1Workspace400
    | PostApiV1Workspace401
    | PostApiV1Workspace403
    | PostApiV1Workspace500
>;

export const usePostApiV1Workspace = <
    TError = AxiosError<
        | PostApiV1Workspace400
        | PostApiV1Workspace401
        | PostApiV1Workspace403
        | PostApiV1Workspace500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof postApiV1Workspace>>,
        TError,
        { data: PostApiV1WorkspaceBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof postApiV1Workspace>>,
    TError,
    { data: PostApiV1WorkspaceBody },
    TContext
> => {
    const mutationOptions = getPostApiV1WorkspaceMutationOptions(options);

    return useMutation(mutationOptions);
};
export const getApiV1Workspace = (
    params?: GetApiV1WorkspaceParams,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.get(`http://localhost:5050/api/v1/workspace`, {
        ...options,
        params: { ...params, ...options?.params },
    });
};

export const getGetApiV1WorkspaceQueryKey = (params?: GetApiV1WorkspaceParams) => {
    return [
        `http://localhost:5050/api/v1/workspace`,
        ...(params ? [params] : []),
    ] as const;
};

export const getGetApiV1WorkspaceQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1Workspace>>,
    TError = AxiosError<
        | GetApiV1Workspace400
        | GetApiV1Workspace401
        | GetApiV1Workspace403
        | GetApiV1Workspace500
    >,
>(
    params?: GetApiV1WorkspaceParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1Workspace>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
) => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey = queryOptions?.queryKey ?? getGetApiV1WorkspaceQueryKey(params);

    const queryFn: QueryFunction<Awaited<ReturnType<typeof getApiV1Workspace>>> = ({
        signal,
    }) => getApiV1Workspace(params, { signal, ...axiosOptions });

    return { queryKey, queryFn, staleTime: 600000, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1Workspace>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1WorkspaceQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1Workspace>>
>;
export type GetApiV1WorkspaceQueryError = AxiosError<
    | GetApiV1Workspace400
    | GetApiV1Workspace401
    | GetApiV1Workspace403
    | GetApiV1Workspace500
>;

export function useGetApiV1Workspace<
    TData = Awaited<ReturnType<typeof getApiV1Workspace>>,
    TError = AxiosError<
        | GetApiV1Workspace400
        | GetApiV1Workspace401
        | GetApiV1Workspace403
        | GetApiV1Workspace500
    >,
>(
    params: undefined | GetApiV1WorkspaceParams,
    options: {
        query: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1Workspace>>,
                TError,
                TData
            >
        > &
            Pick<
                DefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1Workspace>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        axios?: AxiosRequestConfig;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1Workspace<
    TData = Awaited<ReturnType<typeof getApiV1Workspace>>,
    TError = AxiosError<
        | GetApiV1Workspace400
        | GetApiV1Workspace401
        | GetApiV1Workspace403
        | GetApiV1Workspace500
    >,
>(
    params?: GetApiV1WorkspaceParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1Workspace>>,
                TError,
                TData
            >
        > &
            Pick<
                UndefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1Workspace>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1Workspace<
    TData = Awaited<ReturnType<typeof getApiV1Workspace>>,
    TError = AxiosError<
        | GetApiV1Workspace400
        | GetApiV1Workspace401
        | GetApiV1Workspace403
        | GetApiV1Workspace500
    >,
>(
    params?: GetApiV1WorkspaceParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1Workspace>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1Workspace<
    TData = Awaited<ReturnType<typeof getApiV1Workspace>>,
    TError = AxiosError<
        | GetApiV1Workspace400
        | GetApiV1Workspace401
        | GetApiV1Workspace403
        | GetApiV1Workspace500
    >,
>(
    params?: GetApiV1WorkspaceParams,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1Workspace>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1WorkspaceQueryOptions(params, options);

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}

export const deleteApiV1WorkspaceWorkspaceId = (
    workspaceId: string,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.delete(
        `http://localhost:5050/api/v1/workspace/${workspaceId}`,
        options,
    );
};

export const getDeleteApiV1WorkspaceWorkspaceIdMutationOptions = <
    TError = AxiosError<
        | DeleteApiV1WorkspaceWorkspaceId400
        | DeleteApiV1WorkspaceWorkspaceId401
        | DeleteApiV1WorkspaceWorkspaceId403
        | DeleteApiV1WorkspaceWorkspaceId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>,
        TError,
        { workspaceId: string },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>,
    TError,
    { workspaceId: string },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>,
        { workspaceId: string }
    > = (props) => {
        const { workspaceId } = props ?? {};

        return deleteApiV1WorkspaceWorkspaceId(workspaceId, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type DeleteApiV1WorkspaceWorkspaceIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>
>;

export type DeleteApiV1WorkspaceWorkspaceIdMutationError = AxiosError<
    | DeleteApiV1WorkspaceWorkspaceId400
    | DeleteApiV1WorkspaceWorkspaceId401
    | DeleteApiV1WorkspaceWorkspaceId403
    | DeleteApiV1WorkspaceWorkspaceId500
>;

export const useDeleteApiV1WorkspaceWorkspaceId = <
    TError = AxiosError<
        | DeleteApiV1WorkspaceWorkspaceId400
        | DeleteApiV1WorkspaceWorkspaceId401
        | DeleteApiV1WorkspaceWorkspaceId403
        | DeleteApiV1WorkspaceWorkspaceId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>,
        TError,
        { workspaceId: string },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteApiV1WorkspaceWorkspaceId>>,
    TError,
    { workspaceId: string },
    TContext
> => {
    const mutationOptions = getDeleteApiV1WorkspaceWorkspaceIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export const patchApiV1WorkspaceWorkspaceId = (
    workspaceId: string,
    patchApiV1WorkspaceWorkspaceIdBody: PatchApiV1WorkspaceWorkspaceIdBody,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.patch(
        `http://localhost:5050/api/v1/workspace/${workspaceId}`,
        patchApiV1WorkspaceWorkspaceIdBody,
        options,
    );
};

export const getPatchApiV1WorkspaceWorkspaceIdMutationOptions = <
    TError = AxiosError<
        | PatchApiV1WorkspaceWorkspaceId400
        | PatchApiV1WorkspaceWorkspaceId401
        | PatchApiV1WorkspaceWorkspaceId403
        | PatchApiV1WorkspaceWorkspaceId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>,
        TError,
        { workspaceId: string; data: PatchApiV1WorkspaceWorkspaceIdBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationOptions<
    Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>,
    TError,
    { workspaceId: string; data: PatchApiV1WorkspaceWorkspaceIdBody },
    TContext
> => {
    const { mutation: mutationOptions, axios: axiosOptions } = options ?? {};

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>,
        { workspaceId: string; data: PatchApiV1WorkspaceWorkspaceIdBody }
    > = (props) => {
        const { workspaceId, data } = props ?? {};

        return patchApiV1WorkspaceWorkspaceId(workspaceId, data, axiosOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export type PatchApiV1WorkspaceWorkspaceIdMutationResult = NonNullable<
    Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>
>;
export type PatchApiV1WorkspaceWorkspaceIdMutationBody =
    PatchApiV1WorkspaceWorkspaceIdBody;
export type PatchApiV1WorkspaceWorkspaceIdMutationError = AxiosError<
    | PatchApiV1WorkspaceWorkspaceId400
    | PatchApiV1WorkspaceWorkspaceId401
    | PatchApiV1WorkspaceWorkspaceId403
    | PatchApiV1WorkspaceWorkspaceId500
>;

export const usePatchApiV1WorkspaceWorkspaceId = <
    TError = AxiosError<
        | PatchApiV1WorkspaceWorkspaceId400
        | PatchApiV1WorkspaceWorkspaceId401
        | PatchApiV1WorkspaceWorkspaceId403
        | PatchApiV1WorkspaceWorkspaceId500
    >,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>,
        TError,
        { workspaceId: string; data: PatchApiV1WorkspaceWorkspaceIdBody },
        TContext
    >;
    axios?: AxiosRequestConfig;
}): UseMutationResult<
    Awaited<ReturnType<typeof patchApiV1WorkspaceWorkspaceId>>,
    TError,
    { workspaceId: string; data: PatchApiV1WorkspaceWorkspaceIdBody },
    TContext
> => {
    const mutationOptions = getPatchApiV1WorkspaceWorkspaceIdMutationOptions(options);

    return useMutation(mutationOptions);
};
export const getApiV1WorkspaceWorkspaceId = (
    workspaceId: string,
    options?: AxiosRequestConfig,
): Promise<AxiosResponse<void>> => {
    return axios.default.get(
        `http://localhost:5050/api/v1/workspace/${workspaceId}`,
        options,
    );
};

export const getGetApiV1WorkspaceWorkspaceIdQueryKey = (workspaceId: string) => {
    return [`http://localhost:5050/api/v1/workspace/${workspaceId}`] as const;
};

export const getGetApiV1WorkspaceWorkspaceIdQueryOptions = <
    TData = Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
    TError = AxiosError<
        | GetApiV1WorkspaceWorkspaceId400
        | GetApiV1WorkspaceWorkspaceId401
        | GetApiV1WorkspaceWorkspaceId403
        | GetApiV1WorkspaceWorkspaceId500
    >,
>(
    workspaceId: string,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
) => {
    const { query: queryOptions, axios: axiosOptions } = options ?? {};

    const queryKey =
        queryOptions?.queryKey ?? getGetApiV1WorkspaceWorkspaceIdQueryKey(workspaceId);

    const queryFn: QueryFunction<
        Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>
    > = ({ signal }) =>
        getApiV1WorkspaceWorkspaceId(workspaceId, { signal, ...axiosOptions });

    return {
        queryKey,
        queryFn,
        enabled: !!workspaceId,
        staleTime: 600000,
        ...queryOptions,
    } as UseQueryOptions<
        Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export type GetApiV1WorkspaceWorkspaceIdQueryResult = NonNullable<
    Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>
>;
export type GetApiV1WorkspaceWorkspaceIdQueryError = AxiosError<
    | GetApiV1WorkspaceWorkspaceId400
    | GetApiV1WorkspaceWorkspaceId401
    | GetApiV1WorkspaceWorkspaceId403
    | GetApiV1WorkspaceWorkspaceId500
>;

export function useGetApiV1WorkspaceWorkspaceId<
    TData = Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
    TError = AxiosError<
        | GetApiV1WorkspaceWorkspaceId400
        | GetApiV1WorkspaceWorkspaceId401
        | GetApiV1WorkspaceWorkspaceId403
        | GetApiV1WorkspaceWorkspaceId500
    >,
>(
    workspaceId: string,
    options: {
        query: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                TError,
                TData
            >
        > &
            Pick<
                DefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        axios?: AxiosRequestConfig;
    },
): DefinedUseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1WorkspaceWorkspaceId<
    TData = Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
    TError = AxiosError<
        | GetApiV1WorkspaceWorkspaceId400
        | GetApiV1WorkspaceWorkspaceId401
        | GetApiV1WorkspaceWorkspaceId403
        | GetApiV1WorkspaceWorkspaceId500
    >,
>(
    workspaceId: string,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                TError,
                TData
            >
        > &
            Pick<
                UndefinedInitialDataOptions<
                    Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                    TError,
                    TData
                >,
                "initialData"
            >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };
export function useGetApiV1WorkspaceWorkspaceId<
    TData = Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
    TError = AxiosError<
        | GetApiV1WorkspaceWorkspaceId400
        | GetApiV1WorkspaceWorkspaceId401
        | GetApiV1WorkspaceWorkspaceId403
        | GetApiV1WorkspaceWorkspaceId500
    >,
>(
    workspaceId: string,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey };

export function useGetApiV1WorkspaceWorkspaceId<
    TData = Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
    TError = AxiosError<
        | GetApiV1WorkspaceWorkspaceId400
        | GetApiV1WorkspaceWorkspaceId401
        | GetApiV1WorkspaceWorkspaceId403
        | GetApiV1WorkspaceWorkspaceId500
    >,
>(
    workspaceId: string,
    options?: {
        query?: Partial<
            UseQueryOptions<
                Awaited<ReturnType<typeof getApiV1WorkspaceWorkspaceId>>,
                TError,
                TData
            >
        >;
        axios?: AxiosRequestConfig;
    },
): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetApiV1WorkspaceWorkspaceIdQueryOptions(
        workspaceId,
        options,
    );

    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };

    query.queryKey = queryOptions.queryKey;

    return query;
}