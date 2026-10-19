import type {
	Label,
	CreateLabelInput,
	UpdateLabelInput,
} from "../domain/label";

export interface LabelRepository {
	findAll(tenantId: string): Promise<Label[]>;
	create(input: CreateLabelInput): Promise<Label>;
	remove(id: string, tenantId: string): Promise<void>;
	update(id: string, tenantId: string, input: UpdateLabelInput): Promise<Label>;
}
