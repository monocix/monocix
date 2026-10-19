import {
	API_PREFIX,
	getApiBaseUrl,
} from "@/lib/references/tenant/infrastructure/config";
import type { Account } from "../../domain/account";
import type { AccountRepository } from "../../ports/account-repository";

type AccountApiResponse = {
	id: string;
	name: string;
	description: string;
	is_active: boolean;
};

export class HttpAccountRepository implements AccountRepository {
	private readonly baseUrl: string;

	constructor(baseUrl: string = getApiBaseUrl()) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async findAll(tenantId: string): Promise<Account[]> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/accounts`, {
			headers: { tenantId },
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`account lookup failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as AccountApiResponse[];
		return data.map((item) => ({
			id: item.id,
			name: item.name,
			description: item.description ?? "",
			tenantId,
			isActive: item.is_active,
		}));
	}

	async create(input: {
		tenantId: string;
		name: string;
		description?: string;
	}): Promise<Account> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/accounts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				tenantId: input.tenantId,
			},
			body: JSON.stringify({
				id: crypto.randomUUID(),
				name: input.name,
				description: input.description ?? "",
				tenant_id: input.tenantId,
				is_active: true,
			}),
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(
				`account creation failed: ${res.status} ${res.statusText}`,
			);
		}

		const data = (await res.json()) as AccountApiResponse;
		return {
			id: data.id,
			name: data.name,
			description: data.description ?? "",
			tenantId: input.tenantId,
			isActive: data.is_active,
		};
	}

	async update(
		id: string,
		tenantId: string,
		input: { name: string; description: string; isActive: boolean },
	): Promise<Account> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/accounts/${encodeURIComponent(id)}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					tenantId,
				},
				body: JSON.stringify({
					name: input.name,
					description: input.description,
					tenant_id: tenantId,
					is_active: input.isActive,
				}),
				cache: "no-store",
			},
		);

		if (!res.ok) {
			throw new Error(`account update failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as AccountApiResponse;
		return {
			id: data.id,
			name: data.name,
			description: data.description ?? "",
			tenantId,
			isActive: data.is_active,
		};
	}

	async remove(id: string, tenantId: string): Promise<void> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/accounts/${encodeURIComponent(id)}`,
			{
				method: "DELETE",
				headers: {
					tenantId,
				},
				cache: "no-store",
			},
		);

		if (!res.ok) {
			throw new Error(
				`account deletion failed: ${res.status} ${res.statusText}`,
			);
		}
	}
}
