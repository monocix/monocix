import type { LabelRepository } from "../ports/label-repository";

export async function deleteLabel(
	repository: LabelRepository,
	id: string,
	tenantId: string,
): Promise<void> {
	await repository.remove(id, tenantId);
}
