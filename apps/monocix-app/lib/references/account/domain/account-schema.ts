import { z } from "zod";

export const createAccountSchema = z.object({
	name: z.string().trim().min(1, "El nombre es obligatorio").max(255),
	description: z.string().trim().max(2000),
});

export type CreateAccountFormValues = z.infer<typeof createAccountSchema>;
