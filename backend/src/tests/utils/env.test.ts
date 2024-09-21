import { loadEnv } from "@/utils/env";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("loadEnv", () => {
    const originalEnv = process.env;
    const mockExit = vi.fn(); // Create a mock function for process.exit

    beforeEach(() => {
        process.env = { ...originalEnv }; // Reset environment variables
        vi.stubGlobal("process", { ...process, exit: mockExit }); // Mock process.exit globally
        vi.spyOn(console, "error").mockImplementation(() => {}); // Silence console.error
    });

    afterEach(() => {
        process.env = originalEnv; // Restore original environment variables
        vi.restoreAllMocks(); // Restore all mocks after each test
    });

    it("should parse valid PORT from environment variables", async () => {
        process.env.PORT = "3000";

        const parsedEnv = await loadEnv();
        expect(parsedEnv.port).toBe(3000);
    });

    it("should call process.exit with 1 for invalid PORT", async () => {
        process.env.PORT = "invalid-port";

        await loadEnv();
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it("should call process.exit with 1 for missing PORT", async () => {
        delete process.env.PORT;

        await loadEnv();
        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should parse "8a0b" as port 8', async () => {
        process.env.PORT = "8a0b";

        const parsedEnv = await loadEnv();
        expect(parsedEnv.port).toBe(8);
    });
});
