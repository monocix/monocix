import { z } from "zod";

export const editLabelSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio"),
	isActive: z.boolean(),
});

export type EditLabelFormValues = z.infer<typeof editLabelSchema>;
