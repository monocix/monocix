import { describe, expect, it } from "vitest";

import { editLabelSchema } from "./edit-label-schema";

describe("editLabelSchema", () => {
	it("accepts valid name and active flag", () => {
		expect(editLabelSchema.parse({ name: "Etiqueta", isActive: true })).toEqual(
			{ name: "Etiqueta", isActive: true },
		);
	});

	it("trims name", () => {
		expect(
			editLabelSchema.parse({ name: "  Etiqueta  ", isActive: false }),
		).toEqual({ name: "Etiqueta", isActive: false });
	});

	it("rejects empty name", () => {
		const result = editLabelSchema.safeParse({ name: "", isActive: true });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0]?.message).toBe("El nombre es obligatorio");
		}
	});

	it("requires isActive boolean", () => {
		const result = editLabelSchema.safeParse({ name: "Etiqueta" });
		expect(result.success).toBe(false);
	});
});
