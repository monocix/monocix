import type { Account } from "../domain/account";
import type { AccountRepository } from "../ports/account-repository";

export async function createAccount(
	repository: AccountRepository,
	input: { tenantId: string; name: string; description?: string },
): Promise<Account> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.create({
		tenantId: input.tenantId,
		name,
		description: input.description?.trim(),
	});
}
