import App from "@/App";
import { render, screen } from "@testing-library/react";

describe("App", () => {
    it("should display the application name", () => {
        render(<App />);
        const el = screen.getByRole("main");
        expect(el).toHaveTextContent("Bones");
    });
});
