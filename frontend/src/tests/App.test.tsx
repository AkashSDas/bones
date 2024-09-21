import { render, screen } from "@testing-library/react";

import App from "@/App";

describe("App", () => {
    it("should display the application name", () => {
        render(<App />);
        const el = screen.getByRole("main");
        expect(el).toHaveTextContent("Bones");
    });
});
