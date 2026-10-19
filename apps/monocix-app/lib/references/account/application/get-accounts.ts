import type { Account } from "../domain/account";
import type { AccountRepository } from "../ports/account-repository";

export async function getAccounts(
	repository: AccountRepository,
	tenantId: string,
): Promise<Account[]> {
	return repository.findAll(tenantId);
}
