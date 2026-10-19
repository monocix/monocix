import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LabelsContainer } from "./labels-container";

const { mockRefresh } = vi.hoisted(() => ({ mockRefresh: vi.fn() }));

vi.mock("next/navigation", () => ({
	useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("sonner", () => ({
	toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("../actions/create-label", () => ({
	createLabel: vi.fn(),
}));

vi.mock("../actions/delete-label", () => ({
	deleteLabel: vi.fn(),
}));

vi.mock("../actions/update-label", () => ({
	updateLabel: vi.fn(),
}));

describe("LabelsContainer", () => {
	it("renders labels when there is no load error", () => {
		render(
			<LabelsContainer
				tenantId="t1"
				labels={[{ id: "1", name: "Bug", isActive: true }]}
				loadError={null}
			/>,
		);
		expect(screen.getByText("Bug")).toBeInTheDocument();
		expect(screen.getByText("Etiquetas")).toBeInTheDocument();
	});

	it("shows load error message when loadError is provided", () => {
		render(
			<LabelsContainer tenantId="t1" labels={[]} loadError="No disponible" />,
		);
		expect(screen.getByText("No disponible")).toBeInTheDocument();
		expect(screen.queryByText("No hay etiquetas aún.")).not.toBeInTheDocument();
	});

	it("opens edit dialog with selected label", async () => {
		const user = userEvent.setup();
		render(
			<LabelsContainer
				tenantId="t1"
				labels={[{ id: "1", name: "Bug", isActive: true }]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar etiqueta"));

		expect(await screen.findByDisplayValue("Bug")).toBeInTheDocument();
	});

	it("confirms and deletes a label", async () => {
		const user = userEvent.setup();
		const { deleteLabel } = await import("../actions/delete-label");
		vi.mocked(deleteLabel).mockResolvedValue({ ok: true });
		const { toast } = await import("sonner");
		mockRefresh.mockClear();

		render(
			<LabelsContainer
				tenantId="t1"
				labels={[{ id: "1", name: "Bug", isActive: true }]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar etiqueta"));
		expect(
			await screen.findByText(/eliminar la etiqueta/i),
		).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() => expect(deleteLabel).toHaveBeenCalledWith("t1", "1"));
		expect(toast.success).toHaveBeenCalledWith(
			"Etiqueta eliminada correctamente",
		);
	});

	it("shows error toast when delete fails", async () => {
		const user = userEvent.setup();
		const { deleteLabel } = await import("../actions/delete-label");
		vi.mocked(deleteLabel).mockResolvedValue({
			ok: false,
			error: "No se pudo",
		});
		const { toast } = await import("sonner");

		render(
			<LabelsContainer
				tenantId="t1"
				labels={[{ id: "1", name: "Bug", isActive: true }]}
				loadError={null}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Eliminar etiqueta"));
		await user.click(screen.getByRole("button", { name: /^eliminar$/i }));

		await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No se pudo"));
	});
});
