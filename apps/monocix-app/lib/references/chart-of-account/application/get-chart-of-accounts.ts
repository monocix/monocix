import type { ChartOfAccount } from "../domain/chart-of-account";
import type { ChartOfAccountRepository } from "../ports/chart-of-account-repository";

export async function getChartOfAccounts(
	repository: ChartOfAccountRepository,
	tenantId: string,
): Promise<ChartOfAccount[]> {
	return repository.findAll(tenantId);
}
