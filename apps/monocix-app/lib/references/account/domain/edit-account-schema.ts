import { z } from "zod";

export const editAccountSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
	description: z.string().trim().max(2000),
	isActive: z.boolean(),
});

export type EditAccountFormValues = z.infer<typeof editAccountSchema>;
