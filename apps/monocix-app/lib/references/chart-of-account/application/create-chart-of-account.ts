import type { ChartOfAccount } from "../domain/chart-of-account";
import type { ChartOfAccountRepository } from "../ports/chart-of-account-repository";

export async function createChartOfAccount(
	repository: ChartOfAccountRepository,
	input: { tenantId: string; name: string; labelId: string },
): Promise<ChartOfAccount> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.create({
		tenantId: input.tenantId,
		name,
		labelId: input.labelId,
	});
}
