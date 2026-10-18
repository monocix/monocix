import type { Label } from "../domain/label";
import type { LabelRepository } from "../ports/label-repository";

export async function createLabel(
	repository: LabelRepository,
	input: { tenantId: string; name: string },
): Promise<Label> {
	const name = input.name.trim();
	if (!name) {
		throw new Error("El nombre es obligatorio");
	}
	return repository.create({ tenantId: input.tenantId, name });
}
