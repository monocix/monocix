import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "../../../../../test/msw-server";
import { HttpAccountRepository } from "./account-http.repository";

const BASE = "http://localhost:8080/api/v1";

describe("HttpAccountRepository", () => {
	it("findAll maps API response to domain accounts", async () => {
		server.use(
			http.get(`${BASE}/accounts`, () =>
				HttpResponse.json([
					{
						id: "1",
						name: "Caja",
						description: "Principal",
						is_active: true,
					},
				]),
			),
		);

		const accounts = await new HttpAccountRepository().findAll("t1");

		expect(accounts).toEqual([
			{
				id: "1",
				name: "Caja",
				description: "Principal",
				tenantId: "t1",
				isActive: true,
			},
		]);
	});

	it("create sends tenant_id and maps response", async () => {
		server.use(
			http.post(`${BASE}/accounts`, async ({ request }) => {
				const body = (await request.json()) as Record<string, unknown>;
				expect(body.tenant_id).toBe("t1");
				expect(body.name).toBe("Caja");
				expect(typeof body.id).toBe("string");
				return HttpResponse.json({
					id: "abc",
					name: "Caja",
					description: "Principal",
					is_active: true,
				});
			}),
		);

		const account = await new HttpAccountRepository().create({
			tenantId: "t1",
			name: "Caja",
			description: "Principal",
		});

		expect(account).toEqual({
			id: "abc",
			name: "Caja",
			description: "Principal",
			tenantId: "t1",
			isActive: true,
		});
	});

	it("remove sends DELETE and resolves", async () => {
		server.use(
			http.delete(
				`${BASE}/accounts/:id`,
				() => new HttpResponse(null, { status: 204 }),
			),
		);

		await expect(
			new HttpAccountRepository().remove("1", "t1"),
		).resolves.toBeUndefined();
	});
});
