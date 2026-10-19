import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../../../../test/msw-server";
import { HttpChartOfAccountRepository } from "./chart-of-account-http.repository";

const BASE = "http://localhost:8080/api/v1";

describe("HttpChartOfAccountRepository", () => {
	it("findAll maps API response", async () => {
		server.use(
			http.get(`${BASE}/chart-of-accounts`, () =>
				HttpResponse.json([
					{
						id: "1",
						name: "Caja",
						is_active: true,
						label_id: "l1",
					},
				]),
			),
		);

		const result = await new HttpChartOfAccountRepository().findAll("t1");

		expect(result).toEqual([
			{
				id: "1",
				name: "Caja",
				tenantId: "t1",
				labelId: "l1",
				isActive: true,
			},
		]);
	});

	it("create sends label_id and maps response", async () => {
		server.use(
			http.post(`${BASE}/chart-of-accounts`, async ({ request }) => {
				const body = (await request.json()) as Record<string, unknown>;
				expect(body.tenant_id).toBe("t1");
				expect(body.label_id).toBe("l1");
				return HttpResponse.json({
					id: "abc",
					name: "Caja",
					is_active: true,
					label_id: "l1",
				});
			}),
		);

		const result = await new HttpChartOfAccountRepository().create({
			tenantId: "t1",
			name: "Caja",
			labelId: "l1",
		});

		expect(result).toEqual({
			id: "abc",
			name: "Caja",
			tenantId: "t1",
			labelId: "l1",
			isActive: true,
		});
	});

	it("remove sends DELETE and resolves", async () => {
		server.use(
			http.delete(
				`${BASE}/chart-of-accounts/:id`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);

		await expect(
			new HttpChartOfAccountRepository().remove("1", "t1"),
		).resolves.toBeUndefined();
	});
});
