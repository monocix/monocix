import { describe, expect, it, vi } from "vitest";

const { mockRepo, createLabelRepository } = vi.hoisted(() => {
	const mockRepo = {
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		findAll: vi.fn(),
	};
	return { mockRepo, createLabelRepository: vi.fn(() => mockRepo) };
});

vi.mock("@/lib/references/label/container", () => ({
	createLabelRepository,
}));

import { createLabel } from "./create-label";
import { updateLabel } from "./update-label";
import { deleteLabel } from "./delete-label";

describe("createLabel action", () => {
	it("returns validation error for blank input", async () => {
		const result = await createLabel("t1", { name: "   " });
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.create).not.toHaveBeenCalled();
	});

	it("creates label and returns ok", async () => {
		mockRepo.create.mockResolvedValue({ id: "1", name: "Bug", isActive: true });
		const result = await createLabel("t1", { name: "Bug" });
		expect(result).toEqual({ ok: true });
		expect(mockRepo.create).toHaveBeenCalledWith({
			tenantId: "t1",
			name: "Bug",
		});
	});

	it("returns error when repository throws", async () => {
		mockRepo.create.mockRejectedValue(new Error("boom"));
		const result = await createLabel("t1", { name: "Bug" });
		expect(result).toEqual({
			ok: false,
			error: "No se pudo crear la etiqueta",
		});
	});
});

describe("updateLabel action", () => {
	it("returns validation error for blank input", async () => {
		const result = await updateLabel("t1", "1", {
			name: "   ",
			isActive: true,
		});
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.update).not.toHaveBeenCalled();
	});

	it("updates label and returns ok", async () => {
		mockRepo.update.mockResolvedValue({
			id: "1",
			name: "Renamed",
			isActive: false,
		});
		const result = await updateLabel("t1", "1", {
			name: "Renamed",
			isActive: false,
		});
		expect(result).toEqual({ ok: true });
		expect(mockRepo.update).toHaveBeenCalledWith("1", "t1", {
			name: "Renamed",
			isActive: false,
		});
	});

	it("returns error when repository throws", async () => {
		mockRepo.update.mockRejectedValue(new Error("boom"));
		const result = await updateLabel("t1", "1", {
			name: "Bug",
			isActive: true,
		});
		expect(result).toEqual({
			ok: false,
			error: "No se pudo actualizar la etiqueta",
		});
	});
});

describe("deleteLabel action", () => {
	it("deletes label and returns ok", async () => {
		mockRepo.remove.mockResolvedValue(undefined);
		const result = await deleteLabel("t1", "1");
		expect(result).toEqual({ ok: true });
		expect(mockRepo.remove).toHaveBeenCalledWith("1", "t1");
	});

	it("returns error when repository throws", async () => {
		mockRepo.remove.mockRejectedValue(new Error("boom"));
		const result = await deleteLabel("t1", "1");
		expect(result).toEqual({
			ok: false,
			error: "No se pudo eliminar la etiqueta",
		});
	});
});
