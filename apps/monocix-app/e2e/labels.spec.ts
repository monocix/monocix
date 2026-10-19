import { expect, test } from "@playwright/test";

test.describe("Labels page", () => {
	test("creates and deletes a label", async ({ page }) => {
		await page.goto("/demo/labels");

		// Create
		await page.getByRole("button", { name: /nueva etiqueta/i }).click();
		await page.getByPlaceholder("Nombre de etiqueta").fill(`E2E ${Date.now()}`);
		await page.getByRole("button", { name: /^crear$/i }).click();

		await expect(
			page.getByText(/etiqueta creada correctamente/i),
		).toBeVisible();

		const row = page.getByRole("row").filter({ hasText: "E2E" }).first();
		await expect(row).toBeVisible();

		// Delete via dropdown + alert dialog
		await row.getByRole("button", { name: /abrir acciones/i }).click();
		await page.getByText("Eliminar etiqueta").click();
		await page.getByRole("button", { name: /^eliminar$/i }).click();

		await expect(
			page.getByText(/etiqueta eliminada correctamente/i),
		).toBeVisible();
		await expect(row).not.toBeVisible();
	});
});
