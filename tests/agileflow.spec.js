import { expect, test } from '@playwright/test';

test('muestra la landing y filtra tareas del sprint', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'AgileFlow DevOps' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver demo' })).toBeVisible();

  await page.getByRole('button', { name: 'Revision' }).click();

  await expect(page.getByText('Workflow GitHub Actions')).toBeVisible();
  await expect(page.locator('.taskCard')).toHaveCount(1);
});
