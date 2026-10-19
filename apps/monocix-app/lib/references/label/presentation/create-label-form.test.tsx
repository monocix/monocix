import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateLabelForm } from "./create-label-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

describe("CreateLabelForm", () => {
	it("shows validation error when submitting empty name", async () => {
		const user = userEvent.setup();
		const createAction = vi.fn();
		render(<CreateLabelForm tenantId="t1" createAction={createAction} />);

		await user.click(screen.getByRole("button", { name: /nueva etiqueta/i }));
		await user.click(screen.getByRole("button", { name: /^crear$/i }));

		expect(
			await screen.findByText("El nombre es obligatorio"),
		).toBeInTheDocument();
		expect(createAction).not.toHaveBeenCalled();
	});

	it("calls createAction and shows success on valid submit", async () => {
		const user = userEvent.setup();
		const createAction = vi.fn().mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");

		render(<CreateLabelForm tenantId="t1" createAction={createAction} />);

		await user.click(screen.getByRole("button", { name: /nueva etiqueta/i }));
		await user.type(screen.getByPlaceholderText("Nombre de etiqueta"), "Nueva");
		await user.click(screen.getByRole("button", { name: /^crear$/i }));

		await waitFor(() =>
			expect(createAction).toHaveBeenCalledWith("t1", {
				name: "Nueva",
			}),
		);
		expect(toast.success).toHaveBeenCalledWith("Etiqueta creada correctamente");
	});

	it("shows server error when createAction fails", async () => {
		const user = userEvent.setup();
		const createAction = vi
			.fn()
			.mockResolvedValue({ ok: false, error: "Conflicto" });
		const { toast } = await import("sonner");

		render(<CreateLabelForm tenantId="t1" createAction={createAction} />);

		await user.click(screen.getByRole("button", { name: /nueva etiqueta/i }));
		await user.type(screen.getByPlaceholderText("Nombre de etiqueta"), "Nueva");
		await user.click(screen.getByRole("button", { name: /^crear$/i }));

		expect(await screen.findByText("Conflicto")).toBeInTheDocument();
		expect(toast.error).toHaveBeenCalledWith("Conflicto");
	});
});
