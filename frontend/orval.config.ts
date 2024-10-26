import { defineConfig } from "orval";

export default defineConfig({
    "bones-backend": {
        input: {
            target: "./swagger.json",
        },
        output: {
            mode: "tags-split",
            target: "./src/gen/endpoints",
            schemas: "./src/gen/schemas",
            // fileExtension: ".gen.ts", // TODO: issue with this is that the imports in each are file have extension .ts and not .gen.ts
            baseUrl: "http://localhost:8000",
            mock: true,
            client: "react-query",
            // httpClient: "fetch",
            // Using axios instead of fetch because if a request is above 200 (error status)
            // then fetch is considering it as success and even though types are generated for
            // react query's error but the values of these errors are received in success data
            httpClient: "axios",
            override: {
                query: {
                    useQuery: true,

                    // TODO: Adding this helps to generate infinite queries with offset
                    // but the issue they cause is it's added to all of the GET endpoints
                    // even for onces that don't have it. That's why explicitly create
                    // these rather than having Orval create it
                    // useInfinite: true,
                    // useInfiniteQueryParam: "offset",

                    options: {
                        staleTime: 10 * 1000,
                    },
                },
            },
        },
        hooks: {
            afterAllFilesWrite: [
                // "pnpm lint",
                "prettier --write './src/gen/**/*.{gen.ts,ts}'",
            ],
        },
    },
});
