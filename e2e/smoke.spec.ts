import { test, expect } from "@playwright/test";

test.describe("clinicOS · smoke", () => {
  test("ruta protegida redirige a /login (proxy/auth)", async ({ page }) => {
    await page.goto("/ajustes");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login renderiza con marca y formulario", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: /Ingresá a tu cuenta/i }),
    ).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Ingresar/i }),
    ).toBeVisible();
  });

  test("estilos cargados (no HTML crudo)", async ({ page }) => {
    await page.goto("/login");
    // El botón primario debe tener fondo aplicado por Tailwind/tokens.
    const bg = await page
      .getByRole("button", { name: /Ingresar/i })
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).not.toBe("rgba(0, 0, 0, 0)");
    expect(bg).not.toBe("transparent");
  });

  test("ruta inexistente muestra 404", async ({ page }) => {
    await page.goto("/no-existe-xyz");
    await expect(page.getByText(/Página no encontrada/i)).toBeVisible();
  });

  test("webhook Meta sin token → 403", async ({ request }) => {
    const res = await request.get("/api/webhooks/meta");
    expect(res.status()).toBe(403);
  });

  test("ingesta de leads sin secret → 401", async ({ request }) => {
    const res = await request.post("/api/webhooks/leads", {
      data: { tenant: "x", source: "facebook" },
    });
    expect(res.status()).toBe(401);
  });
});
