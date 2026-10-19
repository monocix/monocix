import { describe, expect, it } from "vitest";

import { createLabelSchema } from "./label-schema";

describe("createLabelSchema", () => {
	it("accepts and trims a non-empty name", () => {
		expect(createLabelSchema.parse({ name: "  Etiqueta  " })).toEqual({
			name: "Etiqueta",
		});
	});

	it("rejects blank names", () => {
		expect(createLabelSchema.safeParse({ name: "   " }).success).toBe(false);
	});
});
