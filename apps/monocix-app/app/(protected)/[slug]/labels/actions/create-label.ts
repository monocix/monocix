"use server";

import {
	createLabelSchema,
	type CreateLabelFormValues,
} from "@/lib/references/label/domain/label-schema";
import { createLabel as createLabelUseCase } from "@/lib/references/label/application/create-label";
import { createLabelRepository } from "@/lib/references/label/container";

export async function createLabel(
	tenantId: string,
	input: CreateLabelFormValues,
): Promise<{ ok: boolean; error?: string }> {
	const parsed = createLabelSchema.safeParse(input);
	if (!parsed.success) {
		return { ok: false, error: "El nombre es obligatorio" };
	}

	const repository = createLabelRepository();
	try {
		await createLabelUseCase(repository, {
			tenantId,
			name: parsed.data.name,
		});
		return { ok: true };
	} catch {
		return { ok: false, error: "No se pudo crear la etiqueta" };
	}
}
