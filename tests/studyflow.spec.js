import { expect, test } from '@playwright/test';

test('crea un plan con FastAPI, lo guarda y persiste checklist', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.removeItem('studyflow-theme');
    localStorage.removeItem('studyflow-plans');
    localStorage.removeItem('studyflow-active-plan-id');
  });

  const requests = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/study-plans')) {
      requests.push(request);
    }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'StudyFlow' })).toBeVisible();
  await page.getByRole('button', { name: 'Noche' }).click();
  await expect(page.getByRole('button', { name: 'Dia' })).toBeVisible();

  await page.getByLabel('Materia').fill('Programacion');
  await page.getByLabel('Temas pendientes').fill('Funciones, Arrays, APIs');

  await page.locator('.plannerPanel').getByRole('button', { name: 'Crear plan' }).click();

  await expect(page.getByText('Plan creado con FastAPI')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu ruta para Programacion' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Funciones' })).toBeVisible();
  expect(requests.length).toBeGreaterThan(0);

  await expect(page.getByText('Planes guardados en este navegador')).toBeVisible();
  await expect(page.locator('.savedPlan').filter({ hasText: 'Programacion' })).toBeVisible();

  await page.locator('.routeCard').filter({ hasText: 'Funciones' }).getByRole('checkbox').first().check();
  await expect(page.getByText('1 de 9 tareas completadas')).toBeVisible();

  await page.reload();

  await expect(page.getByRole('button', { name: 'Dia' })).toBeVisible();
  await expect(page.locator('.savedPlan').filter({ hasText: 'Programacion' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tu ruta para Programacion' })).toBeVisible();
  await expect(page.getByText('1 de 9 tareas completadas')).toBeVisible();
  await expect(page.locator('.routeCard').filter({ hasText: 'Funciones' }).getByRole('checkbox').first()).toBeChecked();
});
