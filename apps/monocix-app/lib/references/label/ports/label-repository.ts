import type { Label, CreateLabelInput } from "../domain/label";

export interface LabelRepository {
	findAll(tenantId: string): Promise<Label[]>;
	create(input: CreateLabelInput): Promise<Label>;
}
