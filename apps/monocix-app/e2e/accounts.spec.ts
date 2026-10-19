import { expect, test } from "@playwright/test";

test.describe("Accounts page", () => {
	test("creates and deletes an account", async ({ page }) => {
		await page.goto("/demo/accounts");

		const name = `E2E ${Date.now()}`;

		// Create
		await page.getByRole("button", { name: /nueva cuenta/i }).click();
		await page.getByPlaceholder("Nombre de la cuenta").fill(name);
		await page.getByRole("button", { name: /^crear$/i }).click();

		await expect(page.getByText(/cuenta creada correctamente/i)).toBeVisible();

		const row = page.getByRole("row").filter({ hasText: "E2E" }).first();
		await expect(row).toBeVisible();

		// Delete via dropdown + alert dialog
		await row.getByRole("button", { name: /abrir acciones/i }).click();
		await page.getByText("Eliminar cuenta").click();
		await page.getByRole("button", { name: /^eliminar$/i }).click();

		await expect(
			page.getByText(/cuenta eliminada correctamente/i),
		).toBeVisible();
		await expect(row).not.toBeVisible();
	});
});
