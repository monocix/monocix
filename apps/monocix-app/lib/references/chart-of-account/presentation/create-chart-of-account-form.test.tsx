import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CreateChartOfAccountForm } from "./create-chart-of-account-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const VALID_LABEL_ID = "550e8400-e29b-41d4-a716-446655440000";
const labels = [{ id: VALID_LABEL_ID, name: "Bug", isActive: true }];

describe("CreateChartOfAccountForm", () => {
	it("shows validation error when submitting empty name", async () => {
		const user = userEvent.setup();
		const createAction = vi.fn();
		render(
			<CreateChartOfAccountForm
				tenantId="t1"
				labels={labels}
				createAction={createAction}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /nuevo concepto/i }));
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

		render(
			<CreateChartOfAccountForm
				tenantId="t1"
				labels={labels}
				createAction={createAction}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /nuevo concepto/i }));
		await user.type(screen.getByPlaceholderText("Nombre del concepto"), "Caja");
		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "Bug" }));
		await user.click(screen.getByRole("button", { name: /^crear$/i }));

		await waitFor(() =>
			expect(createAction).toHaveBeenCalledWith("t1", {
				name: "Caja",
				labelId: VALID_LABEL_ID,
			}),
		);
		expect(toast.success).toHaveBeenCalledWith("Concepto creado correctamente");
	});

	it("shows server error when createAction fails", async () => {
		const user = userEvent.setup();
		const createAction = vi
			.fn()
			.mockResolvedValue({ ok: false, error: "Conflicto" });
		const { toast } = await import("sonner");

		render(
			<CreateChartOfAccountForm
				tenantId="t1"
				labels={labels}
				createAction={createAction}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /nuevo concepto/i }));
		await user.type(screen.getByPlaceholderText("Nombre del concepto"), "Caja");
		await user.click(screen.getByRole("combobox"));
		await user.click(screen.getByRole("option", { name: "Bug" }));
		await user.click(screen.getByRole("button", { name: /^crear$/i }));

		expect(await screen.findByText("Conflicto")).toBeInTheDocument();
		expect(toast.error).toHaveBeenCalledWith("Conflicto");
	});
});
