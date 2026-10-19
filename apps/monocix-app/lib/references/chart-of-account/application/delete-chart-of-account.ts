import type { ChartOfAccountRepository } from "../ports/chart-of-account-repository";

export async function deleteChartOfAccount(
	repository: ChartOfAccountRepository,
	id: string,
	tenantId: string,
): Promise<void> {
	await repository.remove(id, tenantId);
}
