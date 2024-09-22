import "@testing-library/jest-dom";
import { toHaveNoViolations } from "jest-axe";

import { server } from "@/mocks/server";

expect.extend(toHaveNoViolations);

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});
