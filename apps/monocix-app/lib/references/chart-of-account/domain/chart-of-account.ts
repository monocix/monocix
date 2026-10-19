export type ChartOfAccount = {
	id: string;
	name: string;
	tenantId: string;
	labelId: string;
	labelName?: string;
	isActive: boolean;
};

export type CreateChartOfAccountInput = {
	tenantId: string;
	name: string;
	labelId: string;
};

export type UpdateChartOfAccountInput = {
	name: string;
	labelId: string;
	isActive: boolean;
};

export class ChartOfAccountNotFoundError extends Error {
	constructor(id: string) {
		super(`chart of account not found: ${id}`);
		this.name = "ChartOfAccountNotFoundError";
	}
}
