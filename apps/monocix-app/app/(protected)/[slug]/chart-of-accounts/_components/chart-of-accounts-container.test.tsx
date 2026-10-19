import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChartOfAccountsContainer } from "./chart-of-accounts-container";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../actions/create-chart-of-account", () => ({
	createChartOfAccount: vi.fn(),
}));

vi.mock("../actions/delete-chart-of-account", () => ({
	deleteChartOfAccount: vi.fn(),
}));

vi.mock("../actions/update-chart-of-account", () => ({
	updateChartOfAccount: vi.fn(),
}));

const labels = [{ id: "l1", name: "Bug", isActive: true }];

const item = {
	id: "1",
	name: "Caja",
	tenantId: "t1",
	labelId: "l1",
	isActive: true,
};

describe("ChartOfAccountsContainer", () => {
	it("renders items when there is no load error", () => {
		render(
			<ChartOfAccountsContainer
				tenantId="t1"
				chartOfAccounts={[item]}
				labels={labels}
				loadError={null}
			/>,
		);
		expect(screen.getByText("Caja")).toBeInTheDocument();
		expect(screen.getByText("Conceptos")).toBeInTheDocument();
	});

	it("shows load error message when loadError is provided", () => {
		render(
			<ChartOfAccountsContainer
				tenantId="t1"
				chartOfAccounts={[]}
				labels={labels}
				loadError="No disponible"
			/>,
		);
		expect(screen.getByText("No disponible")).toBeInTheDocument();
	});

	it("opens edit dialog with selected item", async () => {
		const user = userEvent.setup();
		render(
			<ChartOfAccountsContainer
				tenantId="t1"
				chartOfAccounts={[item]}
				labels={labels}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar concepto"));

		expect(await screen.findByDisplayValue("Caja")).toBeInTheDocument();
	});

	it("confirms and deletes an item", async () => {
		const user = userEvent.setup();
		const { deleteChartOfAccount } = await import(
			"../actions/delete-chart-of-account"
		);
		vi.mocked(deleteChartOfAccount).mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");
		mockRefresh.mockClear();

		render(
			<ChartOfAccountsContainer
				tenantId="t1"
				chartOfAccounts={[item]}
				labels={labels}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar concepto"));
		expect(
			await screen.findByText(/eliminar el concepto/i),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() =>
			expect(deleteChartOfAccount).toHaveBeenCalledWith("t1", "1"),
		);
		expect(toast.success).toHaveBeenCalledWith(
			"Concepto eliminado correctamente",
		);
	});

	it("shows error toast when delete fails", async () => {
		const user = userEvent.setup();
		const { deleteChartOfAccount } = await import(
			"../actions/delete-chart-of-account"
		);
		vi.mocked(deleteChartOfAccount).mockResolvedValue({
			ok: false,
			error: "No se pudo",
		});
		const { toast } = await import("sonner");

		render(
			<ChartOfAccountsContainer
				tenantId="t1"
				chartOfAccounts={[item]}
				labels={labels}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar concepto"));
		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No se pudo"));
	});
});
