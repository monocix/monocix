import { z } from "zod";

export const createLabelSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio"),
});

export type CreateLabelFormValues = z.infer<typeof createLabelSchema>;
