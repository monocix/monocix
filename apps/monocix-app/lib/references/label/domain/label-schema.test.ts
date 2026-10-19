import { describe, expect, it } from "vitest";

import { createLabelSchema } from "./label-schema";

describe("createLabelSchema", () => {
	it("accepts a non-empty name", () => {
		expect(createLabelSchema.parse({ name: "Etiqueta" })).toEqual({
			name: "Etiqueta",
		});
	});

	it("trims whitespace", () => {
		expect(createLabelSchema.parse({ name: "  Etiqueta  " })).toEqual({
			name: "Etiqueta",
		});
	});

	it("rejects empty name", () => {
		const result = createLabelSchema.safeParse({ name: "" });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("El nombre es obligatorio");
		}
	});

	it("rejects whitespace-only name", () => {
		const result = createLabelSchema.safeParse({ name: "   " });
		expect(result.success).toBe(false);
	});
});
