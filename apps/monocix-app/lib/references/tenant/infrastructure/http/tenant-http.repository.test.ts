import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../../../../test/msw-server";
import { HttpTenantRepository } from "./tenant-http.repository";

const BASE = "http://localhost:8080/api/v1";

describe("HttpTenantRepository", () => {
	it("findBySlug maps API response", async () => {
		server.use(
			http.get(`${BASE}/tenants/slug/:slug`, () =>
				HttpResponse.json({
					id: "1",
					name: "Demo",
					slug: "demo",
					is_active: true,
				}),
			),
		);

		const repo = new HttpTenantRepository();
		const tenant = await repo.findBySlug("demo");

		expect(tenant).toEqual({
			id: "1",
			name: "Demo",
			slug: "demo",
			isActive: true,
		});
	});

	it("findBySlug returns null on 404", async () => {
		server.use(
			http.get(
				`${BASE}/tenants/slug/:slug`,
				() => new HttpResponse(null, { status: 404 }),
			),
		);

		const repo = new HttpTenantRepository();
		await expect(repo.findBySlug("missing")).resolves.toBeNull();
	});

	it("findBySlug throws on other errors", async () => {
		server.use(
			http.get(
				`${BASE}/tenants/slug/:slug`,
				() =>
					new HttpResponse(null, { status: 500, statusText: "Server Error" }),
			),
		);

		const repo = new HttpTenantRepository();
		await expect(repo.findBySlug("demo")).rejects.toThrow(
			/tenant lookup failed: 500/,
		);
	});
});
