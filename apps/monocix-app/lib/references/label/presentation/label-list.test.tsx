import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { LabelList } from "./label-list";

describe("LabelList", () => {
	it("shows empty state when there are no labels", () => {
		render(<LabelList labels={[]} onEdit={vi.fn()} onDelete={vi.fn()} />);
		expect(screen.getByText("No hay etiquetas aún.")).toBeInTheDocument();
	});

	it("renders label names and status", () => {
		render(
			<LabelList
				labels={[
					{ id: "1", name: "Bug", isActive: true },
					{ id: "2", name: "Feature", isActive: false },
				]}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		expect(screen.getByText("Bug")).toBeInTheDocument();
		expect(screen.getByText("Activo")).toBeInTheDocument();
		expect(screen.getByText("Feature")).toBeInTheDocument();
		expect(screen.getByText("Inactivo")).toBeInTheDocument();
	});

	it("calls onEdit when edit action is selected", async () => {
		const user = userEvent.setup();
		const onEdit = vi.fn();
		render(
			<LabelList
				labels={[{ id: "1", name: "Bug", isActive: true }]}
				onEdit={onEdit}
				onDelete={vi.fn()}
			/>,
		);
		await user.click(screen.getByRole("button", { name: /abrir acciones/i }));
		await user.click(screen.getByText("Editar etiqueta"));
		expect(onEdit).toHaveBeenCalledWith({
			id: "1",
			name: "Bug",
			isActive: true,
		});
	});
});
