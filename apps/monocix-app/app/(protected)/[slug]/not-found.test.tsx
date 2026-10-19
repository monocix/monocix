import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import NotFound from "./not-found";

describe("NotFound (slug)", () => {
	it("renders 404 with logo and message", () => {
		render(<NotFound />);
		expect(screen.getByText("404")).toBeInTheDocument();
		expect(screen.getByAltText("Monocix")).toBeInTheDocument();
		expect(
			screen.getByText(/no existe o no está disponible/i),
		).toBeInTheDocument();
	});
});
