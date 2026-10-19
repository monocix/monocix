export type Account = {
	id: string;
	name: string;
	description: string;
	tenantId: string;
	isActive: boolean;
};

export type CreateAccountInput = {
	tenantId: string;
	name: string;
	description?: string;
};

export type UpdateAccountInput = {
	name: string;
	description: string;
	isActive: boolean;
};

export class AccountNotFoundError extends Error {
	constructor(id: string) {
		super(`account not found: ${id}`);
		this.name = "AccountNotFoundError";
	}
}
