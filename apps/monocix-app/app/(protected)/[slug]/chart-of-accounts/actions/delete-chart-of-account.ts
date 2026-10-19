"use server";

import { createChartOfAccountRepository } from "@/lib/references/chart-of-account/container";
import { deleteChartOfAccount as deleteChartOfAccountUseCase } from "@/lib/references/chart-of-account/application/delete-chart-of-account";

export async function deleteChartOfAccount(
	tenantId: string,
	id: string,
): Promise<{ ok: boolean; error?: string }> {
	const repository = createChartOfAccountRepository();
	try {
		await deleteChartOfAccountUseCase(repository, id, tenantId);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo eliminar el concepto" };
	}
}
