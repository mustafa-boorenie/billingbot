import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('has title', async ({ page }) => {

  await page.goto('https://txclstf6p3vy7rz5judqcxapp.ecwcloud.com/mobiledoc/jsp/webemr/login/newLogin.jsp');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Web EMR Login Page/);
});

test('input username', async ({ page }) => {


  // LOG IN METHODS:
  await page.goto('https://txclstf6p3vy7rz5judqcxapp.ecwcloud.com/mobiledoc/jsp/webemr/login/newLogin.jsp');

  // Expects page to have a heading with the name of Installation.
  await expect(page.locator('#doctorID')).toBeVisible();

  // Click the get started link.
  await page.locator('#doctorID').fill(`${process.env.USERNAME}`);

  await page.keyboard.press('Enter');
  
  // Expects password field to be visible (ensures username is correct).
  await expect(page.locator('#passwordField')).toBeVisible();

  await page.locator('#passwordField').fill(`${process.env.PASSWORD}`);

  await page.keyboard.press('Enter');

  // ------------------------------------------------------------

  // NAVIGATE TO RESOURCE SCHEDULER

  // TODO: 
  // 1) Get account not requiring 2FA
  // 2) Navigate to resource scheduler
  // 3) Find correct date and provider
  // 4) Find correct visit
  // 5) Turn into non-billable visit
});
