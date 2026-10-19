"use server";

import {
	createChartOfAccountSchema,
	type CreateChartOfAccountFormValues,
} from "@/lib/references/chart-of-account/domain/chart-of-account-schema";
import { createChartOfAccount as createChartOfAccountUseCase } from "@/lib/references/chart-of-account/application/create-chart-of-account";
import { createChartOfAccountRepository } from "@/lib/references/chart-of-account/container";

export async function createChartOfAccount(
	tenantId: string,
	input: CreateChartOfAccountFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = createChartOfAccountSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createChartOfAccountRepository();
	try {
		await createChartOfAccountUseCase(repository, {
			tenantId,
			name: parsed.data.name,
			labelId: parsed.data.labelId,
		});
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo crear el concepto" };
	}
}
