export type Label = {
	id: string;
	name: string;
	isActive: boolean;
};

export type CreateLabelInput = {
	tenantId: string;
	name: string;
};

export type UpdateLabelInput = {
	name: string;
	isActive: boolean;
};

export class LabelNotFoundError extends Error {
	constructor(id: string) {
		super(`label not found: ${id}`);
		this.name = "LabelNotFoundError";
	}
}
