"use server";

import { createLabelRepository } from "@/lib/references/label/container";
import { createLabel as createLabelUseCase } from "@/lib/references/label/application/create-label";

export async function createLabel(
	tenantId: string,
	formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
	const name = String(formData.get("name") ?? "").trim();

	const repository = createLabelRepository();
	try {
		await createLabelUseCase(repository, { tenantId, name });
		return { ok: true };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof Error ? error.message : "No se pudo crear la etiqueta",
		};
	}
}
