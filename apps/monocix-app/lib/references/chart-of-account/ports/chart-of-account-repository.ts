import type { ChartOfAccount } from "../domain/chart-of-account";

export interface ChartOfAccountRepository {
	findAll(tenantId: string): Promise<ChartOfAccount[]>;
	create(input: {
		tenantId: string;
		name: string;
		labelId: string;
	}): Promise<ChartOfAccount>;
	update(
		id: string,
		tenantId: string,
		input: { name: string; labelId: string; isActive: boolean },
	): Promise<ChartOfAccount>;
	remove(id: string, tenantId: string): Promise<void>;
}
