import { describe, expect, it, vi } from "vitest";

const { mockRepo, createAccountRepository } = vi.hoisted(() => {
	const mockRepo = {
		create: vi.fn(),
		update: vi.fn(),
		remove: vi.fn(),
		findAll: vi.fn(),
	};
	return { mockRepo, createAccountRepository: vi.fn(() => mockRepo) };
});

vi.mock("@/lib/references/account/container", () => ({
	createAccountRepository,
}));

import { createAccount } from "./create-account";
import { updateAccount } from "./update-account";
import { deleteAccount } from "./delete-account";

describe("createAccount action", () => {
	it("returns validation error for blank input", async () => {
		const result = await createAccount("t1", { name: "   ", description: "" });
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.create).not.toHaveBeenCalled();
	});

	it("creates account and returns ok", async () => {
		mockRepo.create.mockResolvedValue({
			id: "1",
			name: "Caja",
			description: "Principal",
			tenantId: "t1",
			isActive: true,
		});
		const result = await createAccount("t1", {
			name: "Caja",
			description: "Principal",
		});
		expect(result).toEqual({ ok: true });
		expect(mockRepo.create).toHaveBeenCalledWith({
			tenantId: "t1",
			name: "Caja",
			description: "Principal",
		});
	});

	it("returns error when repository throws", async () => {
		mockRepo.create.mockRejectedValue(new Error("boom"));
		const result = await createAccount("t1", { name: "Caja", description: "" });
		expect(result).toEqual({
			ok: false,
			error: "No se pudo crear la cuenta",
		});
	});
});

describe("updateAccount action", () => {
	it("returns validation error for blank input", async () => {
		const result = await updateAccount("t1", "1", {
			name: "   ",
			description: "",
			isActive: true,
		});
		expect(result).toEqual({ ok: false, error: "El nombre es obligatorio" });
		expect(mockRepo.update).not.toHaveBeenCalled();
	});

	it("updates account and returns ok", async () => {
		mockRepo.update.mockResolvedValue({
			id: "1",
			name: "Caja2",
			description: "Principal",
			tenantId: "t1",
			isActive: false,
		});
		const result = await updateAccount("t1", "1", {
			name: "Caja2",
			description: "Principal",
			isActive: false,
		});
		expect(result).toEqual({ ok: true });
		expect(mockRepo.update).toHaveBeenCalledWith("1", "t1", {
			name: "Caja2",
			description: "Principal",
			isActive: false,
		});
	});

	it("returns error when repository throws", async () => {
		mockRepo.update.mockRejectedValue(new Error("boom"));
		const result = await updateAccount("t1", "1", {
			name: "Caja",
			description: "",
			isActive: true,
		});
		expect(result).toEqual({
			ok: false,
			error: "No se pudo actualizar la cuenta",
		});
	});
});

describe("deleteAccount action", () => {
	it("deletes account and returns ok", async () => {
		mockRepo.remove.mockResolvedValue(undefined);
		const result = await deleteAccount("t1", "1");
		expect(result).toEqual({ ok: true });
		expect(mockRepo.remove).toHaveBeenCalledWith("1", "t1");
	});

	it("returns error when repository throws", async () => {
		mockRepo.remove.mockRejectedValue(new Error("boom"));
		const result = await deleteAccount("t1", "1");
		expect(result).toEqual({
			ok: false,
			error: "No se pudo eliminar la cuenta",
		});
	});
});
