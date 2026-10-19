import { z } from "zod";

export const editChartOfAccountSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
	labelId: z.string().uuid("Selecciona una etiqueta"),
	isActive: z.boolean(),
});

export type EditChartOfAccountFormValues = z.infer<
	typeof editChartOfAccountSchema
>;
