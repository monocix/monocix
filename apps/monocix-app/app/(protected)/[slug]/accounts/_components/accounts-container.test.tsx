import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountsContainer } from "./accounts-container";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../actions/create-account", () => ({
	createAccount: vi.fn(),
}));

vi.mock("../actions/delete-account", () => ({
	deleteAccount: vi.fn(),
}));

vi.mock("../actions/update-account", () => ({
	updateAccount: vi.fn(),
}));

describe("AccountsContainer", () => {
	it("renders accounts when there is no load error", () => {
		render(
			<AccountsContainer
				tenantId="t1"
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
				]}
				loadError={null}
			/>,
		);
		expect(screen.getByText("Caja")).toBeInTheDocument();
		expect(screen.getByText("Cuentas")).toBeInTheDocument();
	});

	it("shows load error message when loadError is provided", () => {
		render(
			<AccountsContainer
				tenantId="t1"
				accounts={[]}
				loadError="No disponible"
			/>,
		);
		expect(screen.getByText("No disponible")).toBeInTheDocument();
	});

	it("opens edit dialog with selected account", async () => {
		const user = userEvent.setup();
		render(
			<AccountsContainer
				tenantId="t1"
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
				]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar cuenta"));

		expect(await screen.findByDisplayValue("Caja")).toBeInTheDocument();
	});

	it("confirms and deletes an account", async () => {
		const user = userEvent.setup();
		const { deleteAccount } = await import("../actions/delete-account");
		vi.mocked(deleteAccount).mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");
		mockRefresh.mockClear();

		render(
			<AccountsContainer
				tenantId="t1"
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
				]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar cuenta"));
		expect(await screen.findByText(/eliminar la cuenta/i)).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith("t1", "1"));
		expect(toast.success).toHaveBeenCalledWith(
			"Cuenta eliminada correctamente",
		);
	});

	it("shows error toast when delete fails", async () => {
		const user = userEvent.setup();
		const { deleteAccount } = await import("../actions/delete-account");
		vi.mocked(deleteAccount).mockResolvedValue({
			ok: false,
			error: "No se pudo",
		});
		const { toast } = await import("sonner");

		render(
			<AccountsContainer
				tenantId="t1"
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
				]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar cuenta"));
		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No se pudo"));
	});
});
