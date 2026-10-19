import { describe, expect, it, vi } from "vitest";

const { mockRepo, createChartOfAccountRepository } = vi.hoisted(() => {
	const mockRepo = {
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		findAll: vi.fn(),
	};
	return { mockRepo, createChartOfAccountRepository: vi.fn(() => mockRepo) };
});

vi.mock("@/lib/references/chart-of-account/container", () => ({
	createChartOfAccountRepository,
}));

import { createChartOfAccount } from "./create-chart-of-account";
import { updateChartOfAccount } from "./update-chart-of-account";
import { deleteChartOfAccount } from "./delete-chart-of-account";

describe("createChartOfAccount action", () => {
	it("returns validation error for blank input", async () => {
		const result = await createChartOfAccount("t1", {
			name: "   ",
			labelId: "not-a-uuid",
		});
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.create).not.toHaveBeenCalled();
	});

	it("creates and returns ok", async () => {
		mockRepo.create.mockResolvedValue({
			id: "1",
			name: "Caja",
			tenantId: "t1",
			labelId: "l1",
			isActive: true,
		});
		const result = await createChartOfAccount("t1", {
			name: "Caja",
			labelId: "550e8400-e29b-41d4-a716-446655440000",
		});
		expect(result).toEqual({ ok: true });
		expect(mockRepo.create).toHaveBeenCalled();
	});

	it("returns error when repository throws", async () => {
		mockRepo.create.mockRejectedValue(new Error("boom"));
		const result = await createChartOfAccount("t1", {
			name: "Caja",
			labelId: "550e8400-e29b-41d4-a716-446655440000",
		});
		expect(result).toEqual({
			ok: false,
			error: "No se pudo crear el concepto",
		});
	});
});

describe("updateChartOfAccount action", () => {
	it("returns validation error for blank input", async () => {
		const result = await updateChartOfAccount("t1", "1", {
			name: "   ",
			labelId: "550e8400-e29b-41d4-a716-446655440000",
			isActive: true,
		});
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.update).not.toHaveBeenCalled();
	});

	it("updates and returns ok", async () => {
		mockRepo.update.mockResolvedValue({
			id: "1",
			name: "Caja2",
			tenantId: "t1",
			labelId: "l1",
			isActive: false,
		});
		const result = await updateChartOfAccount("t1", "1", {
			name: "Caja2",
			labelId: "550e8400-e29b-41d4-a716-446655440000",
			isActive: false,
		});
		expect(result).toEqual({ ok: true });
		expect(mockRepo.update).toHaveBeenCalled();
	});

	it("returns error when repository throws", async () => {
		mockRepo.update.mockRejectedValue(new Error("boom"));
		const result = await updateChartOfAccount("t1", "1", {
			name: "Caja",
			labelId: "550e8400-e29b-41d4-a716-446655440000",
			isActive: true,
		});
		expect(result).toEqual({
			ok: false,
			error: "No se pudo actualizar el concepto",
		});
	});
});

describe("deleteChartOfAccount action", () => {
	it("deletes and returns ok", async () => {
		mockRepo.remove.mockResolvedValue(undefined);
		const result = await deleteChartOfAccount("t1", "1");
		expect(result).toEqual({ ok: true });
		expect(mockRepo.remove).toHaveBeenCalledWith("1", "t1");
	});

	it("returns error when repository throws", async () => {
		mockRepo.remove.mockRejectedValue(new Error("boom"));
		const result = await deleteChartOfAccount("t1", "1");
		expect(result).toEqual({
			ok: false,
			error: "No se pudo eliminar el concepto",
		});
	});
});
