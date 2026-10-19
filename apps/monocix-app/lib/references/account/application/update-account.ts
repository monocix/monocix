import type { Account } from "../domain/account";
import type { AccountRepository } from "../ports/account-repository";
import type { UpdateAccountInput } from "../domain/account";

export async function updateAccount(
	repository: AccountRepository,
	id: string,
	tenantId: string,
	input: UpdateAccountInput,
): Promise<Account> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.update(id, tenantId, {
		name,
		description: input.description.trim(),
		isActive: input.isActive,
	});
}
