import {
	API_PREFIX,
	getApiBaseUrl,
} from "@/lib/references/tenant/infrastructure/config";
import type { ChartOfAccount } from "../../domain/chart-of-account";
import type { ChartOfAccountRepository } from "../../ports/chart-of-account-repository";

type ChartOfAccountApiResponse = {
	id: string;
	name: string;
	is_active: boolean;
	label_id: string;
};

export class HttpChartOfAccountRepository implements ChartOfAccountRepository {
	private readonly baseUrl: string;

	constructor(baseUrl: string = getApiBaseUrl()) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async findAll(tenantId: string): Promise<ChartOfAccount[]> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/chart-of-accounts`, {
			headers: { tenantId },
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(
				`chart of account lookup failed: ${res.status} ${res.statusText}`,
			);
		}

		const data = (await res.json()) as ChartOfAccountApiResponse[];
		return data.map((item) => ({
			id: item.id,
			name: item.name,
			tenantId,
			labelId: item.label_id,
			isActive: item.is_active,
		}));
	}

	async create(input: {
		tenantId: string;
		name: string;
		labelId: string;
	}): Promise<ChartOfAccount> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/chart-of-accounts`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				tenantId: input.tenantId,
			},
			body: JSON.stringify({
				id: crypto.randomUUID(),
				name: input.name,
				label_id: input.labelId,
				tenant_id: input.tenantId,
				is_active: true,
			}),
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(
				`chart of account creation failed: ${res.status} ${res.statusText}`,
			);
		}

		const data = (await res.json()) as ChartOfAccountApiResponse;
		return {
			id: data.id,
			name: data.name,
			tenantId: input.tenantId,
			labelId: data.label_id,
			isActive: data.is_active,
		};
	}

	async update(
		id: string,
		tenantId: string,
		input: { name: string; labelId: string; isActive: boolean },
	): Promise<ChartOfAccount> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/chart-of-accounts/${encodeURIComponent(id)}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					tenantId,
				},
				body: JSON.stringify({
					name: input.name,
					label_id: input.labelId,
					tenant_id: tenantId,
					is_active: input.isActive,
				}),
				cache: "no-store",
			},
		);

		if (!res.ok) {
			throw new Error(
				`chart of account update failed: ${res.status} ${res.statusText}`,
			);
		}

		const data = (await res.json()) as ChartOfAccountApiResponse;
		return {
			id: data.id,
			name: data.name,
			tenantId,
			labelId: data.label_id,
			isActive: data.is_active,
		};
	}

	async remove(id: string, tenantId: string): Promise<void> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/chart-of-accounts/${encodeURIComponent(id)}`,
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
				`chart of account deletion failed: ${res.status} ${res.statusText}`,
			);
		}
	}
}
