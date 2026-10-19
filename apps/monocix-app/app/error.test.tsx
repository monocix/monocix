import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ErrorBoundary from "./error";

describe("Error (root segment)", () => {
	it("renders logo and retry button", () => {
		render(
			<ErrorBoundary error={new globalThis.Error("boom")} reset={vi.fn()} />,
		);
		expect(screen.getByAltText("Monocix")).toBeInTheDocument();
		expect(screen.getByText("Algo salió mal")).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /reintentar/i }),
		).toBeInTheDocument();
	});

	it("calls reset when retry is clicked", async () => {
		const user = userEvent.setup();
		const reset = vi.fn();
		render(
			<ErrorBoundary error={new globalThis.Error("boom")} reset={reset} />,
		);
		await user.click(screen.getByRole("button", { name: /reintentar/i }));
		expect(reset).toHaveBeenCalled();
	});
});
