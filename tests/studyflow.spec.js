import { expect, test } from '@playwright/test';

test('muestra StudyFlow y actualiza el plan de estudio', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('studyflow-theme');
  });

  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/study-plans')) {
      requests.push(request);
    }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'StudyFlow' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Crear plan' })).toBeVisible();
  await page.getByRole('button', { name: 'Noche' }).click();
  await expect(page.getByRole('button', { name: 'Dia' })).toBeVisible();

  await page.getByLabel('Materia').fill('Programacion');
  await page.getByLabel('Temas pendientes').fill('Funciones, Arrays, APIs');

  await expect(page.getByRole('heading', { name: 'Tu ruta para Programacion' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Funciones' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Arrays' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Checklist para llegar con calma' })).toBeVisible();
  expect(requests.length).toBeGreaterThan(0);

  await page.waitForTimeout(500);
  const requestsBeforeInvalidInput = requests.length;
  await page.getByLabel('Horas por dia').fill('12');
  await expect(page.getByText('Ingresa entre 1 y 8 horas por dia.').first()).toBeVisible();
  await expect(page.getByText('No se pudo conectar con la API. Revisa que FastAPI este activo.')).toHaveCount(0);
  await page.waitForTimeout(500);
  expect(requests.length).toBe(requestsBeforeInvalidInput);

  await page.getByLabel('Horas por dia').fill('3');
  await expect(page.getByText('Ingresa entre 1 y 8 horas por dia.')).toHaveCount(0);
});
