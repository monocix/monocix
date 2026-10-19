import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import GlobalError from "./global-error";

describe("GlobalError", () => {
	it("renders logo, heading and retry button", () => {
		render(<GlobalError error={new Error("boom")} reset={vi.fn()} />);
		expect(screen.getByAltText("Monocix")).toBeInTheDocument();
		expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reintentar/i }),
		).toBeInTheDocument();
		expect(screen.getByText(/volver al inicio/i)).toBeInTheDocument();
	});
});
