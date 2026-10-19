import type { Label } from "../domain/label";
import type { LabelRepository } from "../ports/label-repository";

export async function getLabels(
	repository: LabelRepository,
	tenantId: string,
): Promise<Label[]> {
	return repository.findAll(tenantId);
}
