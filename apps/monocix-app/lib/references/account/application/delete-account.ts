import type { AccountRepository } from "../ports/account-repository";

export async function deleteAccount(
	repository: AccountRepository,
	id: string,
	tenantId: string,
): Promise<void> {
	await repository.remove(id, tenantId);
}
