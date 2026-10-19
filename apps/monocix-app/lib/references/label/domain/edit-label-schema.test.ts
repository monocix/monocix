import { describe, expect, it } from "vitest";

import { editLabelSchema } from "./edit-label-schema";

describe("editLabelSchema", () => {
	it("accepts a valid name and active flag", () => {
		expect(
			editLabelSchema.parse({ name: "  Etiqueta  ", isActive: false }),
		).toEqual({ name: "Etiqueta", isActive: false });
	});

	it("rejects blank names", () => {
		expect(
			editLabelSchema.safeParse({ name: "", isActive: true }).success,
		).toBe(false);
	});
});
