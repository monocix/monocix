import type { Account } from "../domain/account";

export interface AccountRepository {
	findAll(tenantId: string): Promise<Account[]>;
	create(input: {
		tenantId: string;
		name: string;
		description?: string;
	}): Promise<Account>;
	update(
		id: string,
		tenantId: string,
		input: { name: string; description: string; isActive: boolean },
	): Promise<Account>;
	remove(id: string, tenantId: string): Promise<void>;
}
