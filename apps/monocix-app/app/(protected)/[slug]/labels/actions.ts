"use server";

import { getApiBaseUrl, API_PREFIX } from "@/lib/references/tenant/infrastructure/config";

export async function createLabel(
	tenantId: string,
	formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
	const name = String(formData.get("name") ?? "").trim();
	if (!name) {
		return { ok: false, error: "Name is required" };
	}

	const res = await fetch(`${getApiBaseUrl()}${API_PREFIX}/labels`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			tenantId,
		},
		body: JSON.stringify({
			id: crypto.randomUUID(),
			name,
			tenant_id: tenantId,
			is_active: true,
		}),
		cache: "no-store",
	});

	if (!res.ok) {
		return { ok: false, error: "Could not create label" };
	}

	return { ok: true };
}
