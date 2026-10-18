import type { Tenant } from "../domain/tenant";

export interface TenantRepository {
	findBySlug(slug: string): Promise<Tenant | null>;
}
