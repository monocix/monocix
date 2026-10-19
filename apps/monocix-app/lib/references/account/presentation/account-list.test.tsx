import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountList } from "./account-list";

describe("AccountList", () => {
	it("shows empty state when there are no accounts", () => {
		render(<AccountList accounts={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
		expect(screen.getByText("No hay cuentas aún.")).toBeInTheDocument();
	});

	it("renders account names, descriptions and status", () => {
		render(
			<AccountList
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
					{
						id: "2",
						name: "Ahorro",
						description: "",
						tenantId: "t1",
						isActive: false,
					},
				]}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("Caja")).toBeInTheDocument();
		expect(screen.getByText("Principal")).toBeInTheDocument();
		expect(screen.getByText("Activa")).toBeInTheDocument();
		expect(screen.getByText("Ahorro")).toBeInTheDocument();
		expect(screen.getByText("Inactiva")).toBeInTheDocument();
	});

	it("calls onEdit when edit action is selected", async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(
			<AccountList
				accounts={[
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						tenantId: "t1",
						isActive: true,
					},
				]}
				onEdit={onEdit}
				onDelete={vi.fn()}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar cuenta"));
		expect(onEdit).toHaveBeenCalledWith(
			expect.objectContaining({ id: "1", name: "Caja" }),
		);
	});
});
