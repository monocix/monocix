"use server";

import { createAccountRepository } from "@/lib/references/account/container";
import { deleteAccount as deleteAccountUseCase } from "@/lib/references/account/application/delete-account";

export async function deleteAccount(
	tenantId: string,
	id: string,
): Promise<{ ok: boolean; error?: string }> {
	const repository = createAccountRepository();
	try {
		await deleteAccountUseCase(repository, id, tenantId);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo eliminar la cuenta" };
	}
}
