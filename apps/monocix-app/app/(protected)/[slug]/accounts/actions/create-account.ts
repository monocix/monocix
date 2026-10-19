"use server";

import {
	createAccountSchema,
	type CreateAccountFormValues,
} from "@/lib/references/account/domain/account-schema";
import { createAccount as createAccountUseCase } from "@/lib/references/account/application/create-account";
import { createAccountRepository } from "@/lib/references/account/container";

export async function createAccount(
	tenantId: string,
	input: CreateAccountFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = createAccountSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createAccountRepository();
	try {
		await createAccountUseCase(repository, {
			tenantId,
			name: parsed.data.name,
			description: parsed.data.description,
		});
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo crear la cuenta" };
	}
}
