import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ChartOfAccountList } from "./chart-of-account-list";

const item = {
	id: "1",
	name: "Caja principal",
	tenantId: "t1",
	labelId: "l1",
	isActive: true,
};

describe("ChartOfAccountList", () => {
	it("shows empty state when there are no items", () => {
		render(
			<ChartOfAccountList
				chartOfAccounts={[]}
				labels={[]}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("No hay conceptos aún.")).toBeInTheDocument();
	});

	it("renders item name, resolved label and status", () => {
		render(
			<ChartOfAccountList
				chartOfAccounts={[item]}
				labels={[{ id: "l1", name: "Bug", isActive: true }]}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("Caja principal")).toBeInTheDocument();
		expect(screen.getByText("Bug")).toBeInTheDocument();
		expect(screen.getByText("Activa")).toBeInTheDocument();
	});

	it("calls onEdit when edit action is selected", async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(
			<ChartOfAccountList
				chartOfAccounts={[item]}
				labels={[{ id: "l1", name: "Bug", isActive: true }]}
				onEdit={onEdit}
				onDelete={vi.fn()}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar concepto"));
		expect(onEdit).toHaveBeenCalledWith(expect.objectContaining({ id: "1" }));
	});
});
