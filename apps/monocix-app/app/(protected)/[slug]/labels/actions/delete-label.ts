"use server";

import { createLabelRepository } from "@/lib/references/label/container";
import { deleteLabel as deleteLabelUseCase } from "@/lib/references/label/application/delete-label";

export async function deleteLabel(
	tenantId: string,
	id: string,
): Promise<{ ok: boolean; error?: string }> {
	const repository = createLabelRepository();
	try {
		await deleteLabelUseCase(repository, id, tenantId);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo eliminar la etiqueta" };
	}
}
