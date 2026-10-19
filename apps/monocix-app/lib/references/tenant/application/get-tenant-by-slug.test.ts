import { describe, expect, it, vi } from "vitest";

import { getTenantBySlug } from "./get-tenant-by-slug";
import { TenantNotFoundError } from "../domain/tenant";
import type { TenantRepository } from "../ports/tenant-repository";

const tenant = {
	id: "1",
	name: "Demo",
	slug: "demo",
	isActive: true,
};

describe("getTenantBySlug", () => {
	it("returns the tenant when found", async () => {
		const repository: TenantRepository = {
			findBySlug: vi.fn().mockResolvedValue(tenant),
		};

		await expect(getTenantBySlug(repository, "demo")).resolves.toEqual(tenant);
		expect(repository.findBySlug).toHaveBeenCalledWith("demo");
	});

	it("throws TenantNotFoundError when not found", async () => {
		const repository: TenantRepository = {
			findBySlug: vi.fn().mockResolvedValue(null),
		};

		await expect(getTenantBySlug(repository, "missing")).rejects.toBeInstanceOf(
			TenantNotFoundError,
		);
	});
});
