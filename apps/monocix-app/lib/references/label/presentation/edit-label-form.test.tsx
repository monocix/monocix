import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditLabelForm } from "./edit-label-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const label = { id: "1", name: "Bug", isActive: true };

describe("EditLabelForm", () => {
	it("renders initial values from label", () => {
		render(
			<EditLabelForm label={label} tenantId="t1" updateAction={vi.fn()} />,
		);
		expect(screen.getByDisplayValue("Bug")).toBeInTheDocument();
		expect(screen.getByText("Activa")).toBeInTheDocument();
	});

	it("resets form when label changes", () => {
		const { rerender } = render(
			<EditLabelForm label={label} tenantId="t1" updateAction={vi.fn()} />,
		);
		rerender(
			<EditLabelForm
				label={{ id: "2", name: "Feature", isActive: false }}
				tenantId="t1"
				updateAction={vi.fn()}
			/>,
		);
		expect(screen.getByDisplayValue("Feature")).toBeInTheDocument();
		expect(screen.getByText("Inactiva")).toBeInTheDocument();
	});

	it("calls updateAction on valid submit", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn().mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");

		render(
			<EditLabelForm label={label} tenantId="t1" updateAction={updateAction} />,
		);

		const input = screen.getByDisplayValue("Bug");
		await user.clear(input);
		await user.type(input, "Bugfix");
		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		await waitFor(() =>
			expect(updateAction).toHaveBeenCalledWith("t1", "1", {
				name: "Bugfix",
				isActive: true,
			}),
		);
		expect(toast.success).toHaveBeenCalledWith(
			"Etiqueta actualizada correctamente",
		);
	});

	it("shows server error when updateAction fails", async () => {
		const user = userEvent.setup();
		const updateAction = vi
			.fn()
			.mockResolvedValue({ ok: false, error: "Conflicto" });

		render(
			<EditLabelForm label={label} tenantId="t1" updateAction={updateAction} />,
		);

		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(await screen.findByText("Conflicto")).toBeInTheDocument();
	});

	it("shows error when no label selected", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn();

		render(<EditLabelForm tenantId="t1" updateAction={updateAction} />);

		await user.type(screen.getByPlaceholderText("Nombre de etiqueta"), "Algo");
		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(
			await screen.findByText("No hay etiqueta seleccionada"),
		).toBeInTheDocument();
		expect(updateAction).not.toHaveBeenCalled();
	});
});
