import { API_PREFIX, getApiBaseUrl } from "../config";
import type { Tenant } from "../../domain/tenant";
import type { TenantRepository } from "../../ports/tenant-repository";

type TenantApiResponse = {
	id: string;
	name: string;
	slug: string;
	is_active: boolean;
};

export class HttpTenantRepository implements TenantRepository {
	private readonly baseUrl: string;

	constructor(baseUrl: string = getApiBaseUrl()) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async findBySlug(slug: string): Promise<Tenant | null> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/tenants/slug/${encodeURIComponent(slug)}`,
			{ cache: "no-store" },
		);

		if (res.status === 404) return null;

		if (!res.ok) {
			throw new Error(`tenant lookup failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as TenantApiResponse;
		return {
			id: data.id,
			name: data.name,
			slug: data.slug,
			isActive: data.is_active,
		};
	}
}
