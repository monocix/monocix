import {
	API_PREFIX,
	getApiBaseUrl,
} from "../../../tenant/infrastructure/config";
import type { Label } from "../../domain/label";
import type { LabelRepository } from "../../ports/label-repository";
import type { CreateLabelInput, UpdateLabelInput } from "../../domain/label";

type LabelApiResponse = {
	id: string;
	name: string;
	is_active: boolean;
};

export class HttpLabelRepository implements LabelRepository {
	private readonly baseUrl: string;

	constructor(baseUrl: string = getApiBaseUrl()) {
		this.baseUrl = baseUrl.replace(/\/$/, "");
	}

	async findAll(tenantId: string): Promise<Label[]> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/labels`, {
			headers: { tenantId },
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`label lookup failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as LabelApiResponse[];
		return data.map((item) => ({
			id: item.id,
			name: item.name,
			isActive: item.is_active,
		}));
	}

	async create(input: CreateLabelInput): Promise<Label> {
		const res = await fetch(`${this.baseUrl}${API_PREFIX}/labels`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				tenantId: input.tenantId,
			},
			body: JSON.stringify({
				id: crypto.randomUUID(),
				name: input.name,
				tenant_id: input.tenantId,
				is_active: true,
			}),
			cache: "no-store",
		});

		if (!res.ok) {
			throw new Error(`label creation failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as LabelApiResponse;
		return {
			id: data.id,
			name: data.name,
			isActive: data.is_active,
		};
	}

	async update(
		id: string,
		tenantId: string,
		input: UpdateLabelInput,
	): Promise<Label> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/labels/${encodeURIComponent(id)}`,
			{
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					tenantId,
				},
				body: JSON.stringify({
					name: input.name,
					tenant_id: tenantId,
					is_active: input.isActive,
				}),
				cache: "no-store",
			},
		);

		if (!res.ok) {
			throw new Error(`label update failed: ${res.status} ${res.statusText}`);
		}

		const data = (await res.json()) as LabelApiResponse;
		return {
			id: data.id,
			name: data.name,
			isActive: data.is_active,
		};
	}

	async remove(id: string, tenantId: string): Promise<void> {
		const res = await fetch(
			`${this.baseUrl}${API_PREFIX}/labels/${encodeURIComponent(id)}`,
			{
				method: "DELETE",
				headers: {
					tenantId,
				},
				cache: "no-store",
			},
		);

		if (!res.ok) {
			throw new Error(`label deletion failed: ${res.status} ${res.statusText}`);
		}
	}
}
