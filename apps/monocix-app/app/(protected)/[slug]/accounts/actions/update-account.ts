"use server";

import {
	editAccountSchema,
	type EditAccountFormValues,
} from "@/lib/references/account/domain/edit-account-schema";
import { updateAccount as updateAccountUseCase } from "@/lib/references/account/application/update-account";
import { createAccountRepository } from "@/lib/references/account/container";

export async function updateAccount(
	tenantId: string,
	id: string,
	input: EditAccountFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = editAccountSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createAccountRepository();
	try {
		await updateAccountUseCase(repository, id, tenantId, parsed.data);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo actualizar la cuenta" };
	}
}
