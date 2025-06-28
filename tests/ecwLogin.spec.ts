import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('has title', async ({ page }) => {

  await page.goto('https://txclstf6p3vy7rz5judqcxapp.ecwcloud.com/mobiledoc/jsp/webemr/login/newLogin.jsp');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Web EMR Login Page/);
});

test('run script', async ({ page }) => {


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
  await expect(page.locator('#jellybean-panelLink4')).toBeVisible();

  await page.locator('#jellybean-panelLink4').click();

  await page.locator('#Practice_menu').getByText('Practice').click();

  await expect(page.locator('#RESOURCE_SCHEDULING_PRACTICE')).toBeVisible();

  await page.locator('#RESOURCE_SCHEDULING_PRACTICE').click();

  await expect(page.locator('#providerScroll')).toBeVisible();

  // ------------------------------------------------------------

    // If the alert is visible, click the close button
    if (await page.locator('#alert').getByText('×').isVisible()) {
      await page.locator('#alert').getByText('×').click();
    } else {
      console.log('No alert found');
    }
  

  // ITERATE THROUGH PROVIDERS
  const providers = await page.locator('#providerScroll .checkbox').count();

  for (let i = 0; i < providers; i++) {

    // Check on the checkbox
    await page.locator('#providerScroll .checkbox').nth(i).click();

    // Wait for the checkbox to be checked

    console.log('Checked provider ' + i);

    // // Uncheck the checkbox
    // await page.locator('#providerScroll .checkbox').nth(i).click();
  }



  // TODO: 
  // 1) Get correct date range
  // 2) Get correct dates and providers
  // 3) Go to the correct date and provider
  // 4) Click on every visit within range
  // 5) Turn each visit into non-billable visit
});
