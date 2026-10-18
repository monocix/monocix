export type Tenant = {
	id: string;
	name: string;
	slug: string;
	isActive: boolean;
};

export class TenantNotFoundError extends Error {
	constructor(slug: string) {
		super(`tenant not found: ${slug}`);
		this.name = "TenantNotFoundError";
	}
}
