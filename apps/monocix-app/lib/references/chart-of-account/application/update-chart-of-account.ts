import type { ChartOfAccount } from "../domain/chart-of-account";
import type { ChartOfAccountRepository } from "../ports/chart-of-account-repository";
import type { UpdateChartOfAccountInput } from "../domain/chart-of-account";

export async function updateChartOfAccount(
	repository: ChartOfAccountRepository,
	id: string,
	tenantId: string,
	input: UpdateChartOfAccountInput,
): Promise<ChartOfAccount> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.update(id, tenantId, {
		name,
		labelId: input.labelId,
		isActive: input.isActive,
	});
}
