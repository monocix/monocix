"use server";

import {
	editChartOfAccountSchema,
	type EditChartOfAccountFormValues,
} from "@/lib/references/chart-of-account/domain/edit-chart-of-account-schema";
import { updateChartOfAccount as updateChartOfAccountUseCase } from "@/lib/references/chart-of-account/application/update-chart-of-account";
import { createChartOfAccountRepository } from "@/lib/references/chart-of-account/container";

export async function updateChartOfAccount(
	tenantId: string,
	id: string,
	input: EditChartOfAccountFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = editChartOfAccountSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createChartOfAccountRepository();
	try {
		await updateChartOfAccountUseCase(repository, id, tenantId, parsed.data);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo actualizar el concepto" };
	}
}
