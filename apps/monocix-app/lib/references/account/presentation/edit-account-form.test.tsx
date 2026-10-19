import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { EditAccountForm } from "./edit-account-form";

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

const account = {
	id: "1",
	name: "Caja",
	description: "Principal",
	tenantId: "t1",
	isActive: true,
};

describe("EditAccountForm", () => {
	it("renders initial values from account", () => {
		render(
			<EditAccountForm
				account={account}
				tenantId="t1"
				updateAction={vi.fn()}
			/>,
		);
		expect(screen.getByDisplayValue("Caja")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Principal")).toBeInTheDocument();
		expect(screen.getByText("Activa")).toBeInTheDocument();
	});

	it("resets form when account changes", () => {
		const { rerender } = render(
			<EditAccountForm
				account={account}
				tenantId="t1"
				updateAction={vi.fn()}
			/>,
		);
		rerender(
			<EditAccountForm
				account={{
					id: "2",
					name: "Ahorro",
					description: "Secundaria",
					tenantId: "t1",
					isActive: false,
				}}
				tenantId="t1"
				updateAction={vi.fn()}
			/>,
		);
		expect(screen.getByDisplayValue("Ahorro")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Secundaria")).toBeInTheDocument();
		expect(screen.getByText("Inactiva")).toBeInTheDocument();
	});

	it("calls updateAction on valid submit", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn().mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");

		render(
			<EditAccountForm
				account={account}
				tenantId="t1"
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
				description: "Principal",
				isActive: true,
			}),
		);
		expect(toast.success).toHaveBeenCalledWith(
			"Cuenta actualizada correctamente",
		);
	});

	it("shows server error when updateAction fails", async () => {
		const user = userEvent.setup();
		const updateAction = vi
			.fn()
			.mockResolvedValue({ ok: false, error: "Conflicto" });

		render(
			<EditAccountForm
				account={account}
				tenantId="t1"
				updateAction={updateAction}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(await screen.findByText("Conflicto")).toBeInTheDocument();
	});

	it("shows error when no account selected", async () => {
		const user = userEvent.setup();
		const updateAction = vi.fn();

		render(<EditAccountForm tenantId="t1" updateAction={updateAction} />);

		await user.type(screen.getByPlaceholderText("Nombre de la cuenta"), "Algo");
		await user.click(screen.getByRole("button", { name: /^guardar$/i }));

		expect(
			await screen.findByText("No hay cuenta seleccionada"),
		).toBeInTheDocument();
		expect(updateAction).not.toHaveBeenCalled();
	});
});
