import type { Tenant } from "../domain/tenant";
import type { TenantRepository } from "../ports/tenant-repository";
import { TenantNotFoundError } from "../domain/tenant";

export async function getTenantBySlug(
	repository: TenantRepository,
	slug: string,
): Promise<Tenant> {
	const tenant = await repository.findBySlug(slug);
	if (!tenant) {
		throw new TenantNotFoundError(slug);
	}
	return tenant;
}
