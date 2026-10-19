import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../../../../test/msw-server";
import { HttpLabelRepository } from "./label-http.repository";

const BASE = "http://localhost:8080/api/v1";

describe("HttpLabelRepository", () => {
	it("findAll maps API response to domain labels", async () => {
		server.use(
			http.get(`${BASE}/labels`, () =>
				HttpResponse.json([
					{ id: "1", name: "Bug", is_active: true },
					{ id: "2", name: "Feature", is_active: false },
				]),
			),
		);

		const labels = await new HttpLabelRepository().findAll("t1");

		expect(labels).toEqual([
			{ id: "1", name: "Bug", isActive: true },
			{ id: "2", name: "Feature", isActive: false },
		]);
	});

	it("create sends id and tenant_id and maps response", async () => {
		server.use(
			http.post(`${BASE}/labels`, async ({ request }) => {
				const body = (await request.json()) as Record<string, unknown>;
				expect(body.tenant_id).toBe("t1");
				expect(body.name).toBe("Bug");
				expect(typeof body.id).toBe("string");
				return HttpResponse.json({ id: "abc", name: "Bug", is_active: true });
			}),
		);

		const label = await new HttpLabelRepository().create({
			tenantId: "t1",
			name: "Bug",
		});

		expect(label).toEqual({ id: "abc", name: "Bug", isActive: true });
	});

	it("update sends PUT and maps response", async () => {
		server.use(
			http.put(`${BASE}/labels/:id`, async ({ params, request }) => {
				expect(params.id).toBe("1");
				const body = (await request.json()) as Record<string, unknown>;
				expect(body.name).toBe("Renamed");
				expect(body.is_active).toBe(false);
				return HttpResponse.json({
					id: "1",
					name: "Renamed",
					is_active: false,
				});
			}),
		);

		const label = await new HttpLabelRepository().update("1", "t1", {
			name: "Renamed",
			isActive: false,
		});

		expect(label).toEqual({ id: "1", name: "Renamed", isActive: false });
	});

	it("remove sends DELETE and resolves", async () => {
		server.use(
			http.delete(
				`${BASE}/labels/:id`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);

		await expect(
			new HttpLabelRepository().remove("1", "t1"),
		).resolves.toBeUndefined();
	});

	it("throws on a non-ok response", async () => {
		server.use(
			http.get(
				`${BASE}/labels`,
				() =>
					new HttpResponse(null, { status: 500, statusText: "Server Error" }),
			),
		);

		await expect(new HttpLabelRepository().findAll("t1")).rejects.toThrow(
			/label lookup failed: 500/,
		);
	});
});
