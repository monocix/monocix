"use server";

import {
	editLabelSchema,
	type EditLabelFormValues,
} from "@/lib/references/label/domain/edit-label-schema";
import { updateLabel as updateLabelUseCase } from "@/lib/references/label/application/update-label";
import { createLabelRepository } from "@/lib/references/label/container";

export async function updateLabel(
	tenantId: string,
	id: string,
	input: EditLabelFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = editLabelSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createLabelRepository();
	try {
		await updateLabelUseCase(repository, id, tenantId, parsed.data);
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo actualizar la etiqueta" };
	}
}
