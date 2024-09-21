import { HttpResponse, http } from "msw";

export const handlers = [
    http.get("/test", (ctx) => {
        return HttpResponse.json({ message: "Bones MSW" }, { status: 200 });
    }),
];
