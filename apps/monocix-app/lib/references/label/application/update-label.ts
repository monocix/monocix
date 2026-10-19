import type { Label } from "../domain/label";
import type { LabelRepository } from "../ports/label-repository";
import type { UpdateLabelInput } from "../domain/label";

export async function updateLabel(
	repository: LabelRepository,
	id: string,
	tenantId: string,
	input: UpdateLabelInput,
): Promise<Label> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.update(id, tenantId, {
		name,
		isActive: input.isActive,
	});
}
