import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditChartOfAccountForm } from "./edit-chart-of-account-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const labels = [
	{ id: "550e8400-e29b-41d4-a716-446655440000", name: "Bug", isActive: true },
	{
		id: "550e8400-e29b-41d4-a716-446655440001",
		name: "Feature",
		isActive: true,
	},
];

const item = {
	id: "1",
	name: "Caja",
	tenantId: "t1",
	labelId: "550e8400-e29b-41d4-a716-446655440000",
	isActive: true,
};

describe("EditChartOfAccountForm", () => {
	it("renders initial values from item", () => {
		render(
			<EditChartOfAccountForm
				chartOfAccount={item}
				tenantId="t1"
				labels={labels}
				updateAction={vi.fn()}
			/>,
		);
		expect(screen.getByDisplayValue("Caja")).toBeInTheDocument();
		expect(screen.getByText("Bug")).toBeInTheDocument();
		expect(screen.getByText("Activa")).toBeInTheDocument();
	});

	it("resets form when item changes", () => {
		const { rerender } = render(
			<EditChartOfAccountForm
				chartOfAccount={item}
				tenantId="t1"
				labels={labels}
				updateAction={vi.fn()}
			/>,
		);
		rerender(
			<EditChartOfAccountForm
				chartOfAccount={{
					id: "2",
					name: "Ahorro",
					tenantId: "t1",
					labelId: "550e8400-e29b-41d4-a716-446655440001",
					isActive: false,
				}}
				tenantId="t1"
				labels={labels}
				updateAction={vi.fn()}
			/>,
		);
		expect(screen.getByDisplayValue("Ahorro")).toBeInTheDocument();
		expect(screen.getByText("Feature")).toBeInTheDocument();
		expect(screen.getByText("Inactiva")).toBeInTheDocument();
	});

	it("calls updateAction on valid submit", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn().mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");

		render(
			<EditChartOfAccountForm
				chartOfAccount={item}
				tenantId="t1"
				labels={labels}
				updateAction={updateAction}
			/>,
		);

		const input = screen.getByDisplayValue("Caja");
		await user.clear(input);
		await user.type(input, "Caja2");
		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		await waitFor(() =>
			expect(updateAction).toHaveBeenCalledWith("t1", "1", {
				name: "Caja2",
				labelId: "550e8400-e29b-41d4-a716-446655440000",
				isActive: true,
			}),
		);
		expect(toast.success).toHaveBeenCalledWith(
			"Concepto actualizado correctamente",
		);
	});

	it("shows server error when updateAction fails", async () => {
		const user = userEvent.setup();
		const updateAction = vi
			.fn()
			.mockResolvedValue({ ok: false, error: "Conflicto" });

		render(
			<EditChartOfAccountForm
				chartOfAccount={item}
				tenantId="t1"
				labels={labels}
				updateAction={updateAction}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(await screen.findByText("Conflicto")).toBeInTheDocument();
	});

	it("shows error when no item selected", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn();

		render(
			<EditChartOfAccountForm
				tenantId="t1"
				labels={labels}
				updateAction={updateAction}
			/>,
		);

		await user.type(screen.getByPlaceholderText("Nombre del concepto"), "Algo");
		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "Bug" }));
		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(
			await screen.findByText("No hay concepto seleccionado"),
		).toBeInTheDocument();
		expect(updateAction).not.toHaveBeenCalled();
	});
});
