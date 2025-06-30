import { test, expect } from '@playwright/test';
import * as dotenv from 'dotenv';
dotenv.config();

test('eCW loads', async ({ page }) => {

  await page.goto('https://txclstf6p3vy7rz5judqcxapp.ecwcloud.com/mobiledoc/jsp/webemr/login/newLogin.jsp');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Web EMR Login Page/);
});

test('run script', async ({ page }) => {
  // Increase test timeout to handle many providers and dates
  test.setTimeout(0); // infinite timeout

  // LOG IN:
  await page.goto('https://txclstf6p3vy7rz5judqcxapp.ecwcloud.com/mobiledoc/jsp/webemr/login/newLogin.jsp');

  await expect(page.locator('#doctorID')).toBeVisible();
  await page.locator('#doctorID').fill(`${process.env.USERNAME}`);
  await page.keyboard.press('Enter');
  
  // Expects password field to be visible (ensures username is correct).
  await expect(page.locator('#passwordField')).toBeVisible();
  await page.locator('#passwordField').fill(`${process.env.PASSWORD}`);
  await page.keyboard.press('Enter');

  
  // NAVIGATE TO RESOURCE SCHEDULER
  await expect(page.locator('#jellybean-panelLink4')).toBeVisible();

  await page.locator('#jellybean-panelLink4').click();

  await page.locator('#Practice_menu').getByText('Practice').click();

  await expect(page.locator('#RESOURCE_SCHEDULING_PRACTICE')).toBeVisible();

  await page.locator('#RESOURCE_SCHEDULING_PRACTICE').click();

  await expect(page.locator('#providerScroll')).toBeVisible();

  // If the alert is visible, click the close button (Prepping for the next test)
  if (await page.locator('#alert').getByText('×').isVisible()) {
    await page.locator('#alert').getByText('×').click();
  } else {
    console.log('No alert found');
  }

  // ITERATE THROUGH DATES
  const startDate = new Date(2015, 0, 2); // January 1, 2015
  const endDate = new Date(2020, 31, 12 ); // December 31, 2020
  const currentDate = new Date(startDate);

  // For testing purposes, let's limit to just a few days to avoid timeouts
  const maxDays = 5; // Change this as needed
  let dayCount = 0;

  while (currentDate <= endDate && dayCount < maxDays) {
    // Set the month (0-based index, so 0 = January)
    await page.getByLabel('Select month').selectOption(currentDate.getMonth().toString());
    
    // Set the year
    await page.getByLabel('Select year').selectOption(currentDate.getFullYear().toString());
    
    // Click on the day
    await page.getByRole('link', { name: currentDate.getDate().toString(), exact: true }).click({ force: true });
    
    console.log(`Processing date: ${currentDate.toDateString()}`);

        // ITERATE THROUGH PROVIDERS for this date
 
    const providerList = await page.evaluate(() => {  
      const providers = document.querySelectorAll('#providerScroll .checkbox');
      return Array.from(providers).map((provider, index) => {
        const checkbox = provider.querySelector('input[type="checkbox"]');
        const label = provider.querySelector('label') || provider;
        
        return {
          index: index,
          userId: checkbox?.getAttribute('value') || checkbox?.getAttribute('id') || '',
          fullName: label.textContent?.trim() || '',
          innerHTML: provider.innerHTML,
          // Try to extract any data attributes
          dataAttributes: Object.fromEntries(
            Array.from(provider.attributes).filter(attr => attr.name.startsWith('data-'))
              .map(attr => [attr.name, attr.value])
          )
        };
      });
    });

    // Uncheck all provider checkboxes before starting new provider
    const allCheckboxes = page.locator('#providerScroll .checkbox input[type="checkbox"]');
    const checkboxCount = await allCheckboxes.count();

    for (let j = 0; j < checkboxCount; j++) {
      const checkbox = allCheckboxes.nth(j);
      if (await checkbox.isChecked()) {
        await checkbox.click({ force: true });
      }
    }
    
    // Brief pause to let UI update after unchecking
    await page.waitForTimeout(500);
    console.log(`=== UNCHECKED ALL PROVIDERS ===`);
    
    console.log(`Found ${providerList.length} providers:`, providerList);

    for (let i = 0; i < providerList.length; i++) {
      const provider = providerList[i];
      console.log(`\n=== PROCESSING PROVIDER ${i}: ${provider.fullName} (ID: ${provider.userId}) ===`);
      
      try {
        // Find checkbox by provider name or userId instead of position
        let checkbox;
        
        if (provider.userId) {
          // Try to find by userId/value first
          checkbox = page.locator(`#providerScroll .checkbox input[value="${provider.userId}"]`);
          if (await checkbox.count() === 0) {
            checkbox = page.locator(`#providerScroll .checkbox input[id="${provider.userId}"]`);
            console.log(`Found checkbox by id: ${checkbox}`);
          }
        }
        
        // Fallback to finding by text content
        if (!checkbox || await checkbox.count() === 0) {
          checkbox = page.locator('#providerScroll .checkbox').filter({ hasText: provider.fullName }).locator('input[type="checkbox"]');
          console.log(`Found checkbox by name: ${checkbox}`);
        }
        
        // Final fallback to position if name-based selection fails
        if (!checkbox || await checkbox.count() === 0) {
          console.log(`Warning: Could not find provider by name/ID, falling back to position ${i}`);
          checkbox = page.locator('#providerScroll .checkbox').nth(i).locator('input[type="checkbox"]');
        }
        
        // Check the checkbox
        await checkbox.click({ force: true });
        console.log(`✓ Checked provider: ${provider.fullName} (${provider.userId})`);

        // Wait for encounters to load after selecting provider
        // Give more time for the calendar/schedule view to update
        await page.waitForTimeout(2000);
        

        console.log(`=== FINDING ENCOUNTERS FOR: ${provider.fullName} ===`);
        
        // Try multiple selectors to find encounter elements
        let encElements;
        let encCount = 0;
        
        // Method 1: Direct ID selector with enc: prefix
        encElements = page.locator('[id^="enc:"]');
        encCount = await encElements.count();
        console.log(`Method 1 - Direct enc: selector found: ${encCount} elements`);
        
        if (encCount === 0) {
          // Method 2: Look in calendar container
          encElements = page.locator('.fc-content, .fc-event').filter({ has: page.locator('[id^="enc:"]') });
          encCount = await encElements.count();
          console.log(`Method 2 - Calendar container search found: ${encCount} elements`);
        }
        
        if (encCount === 0) {
          // Method 3: Search for any element with encounter class and enc ID
          encElements = page.locator('.encounter[id^="enc:"]');
          encCount = await encElements.count();
          console.log(`Method 3 - Encounter class with enc ID found: ${encCount} elements`);
        }
        
        if (encCount === 0) {
          // Method 4: Wait longer and try again
          console.log('No encounters found, waiting longer...');
          await page.waitForTimeout(3000);
          encElements = page.locator('[id^="enc:"]');
          encCount = await encElements.count();
          console.log(`Method 4 - After longer wait found: ${encCount} elements`);
        }
        
        if (encCount === 0) {
          // Method 5: Debug what's actually on the page
          const pageContent = await page.evaluate(() => {
            // Look for any elements with 'enc' in their ID
            const allElements = document.querySelectorAll('*[id*="enc"]');
            const results: Array<{id: string, tagName: string, className: string, visible: boolean}> = [];
            for (let el of allElements) {
              const htmlEl = el as HTMLElement;
              results.push({
                id: el.id,
                tagName: el.tagName,
                className: el.className,
                visible: htmlEl.offsetWidth > 0 && htmlEl.offsetHeight > 0
              });
            }
            return results.slice(0, 10); // Limit to first 10
          });
          console.log('Debug - Elements with "enc" in ID:', pageContent);
                   
          // Check if calendar is visible
          const calendarVisible = await page.locator('.fc-view').isVisible().catch(() => false);
          console.log(`Calendar view visible: ${calendarVisible}`);
        }
        
        // Process encounters if found
        for (let j = 0; j < encCount; j++) {
          try {
            const encElement = encElements.nth(j);
            const encId = await encElement.getAttribute('id');
            console.log(`Processing encounter ${j + 1}/${encCount}: ${encId}`);
            
            // Double-click the encounter
            await encElement.dblclick({ force: true });
            console.log(`Double-clicked encounter: ${encId}`);
            
            // Wait for encounter modal/form to fully load
            await page.waitForTimeout(3000);
            
            // Handle any initial loading screens or modals
            try {
              // Wait for any loading indicators to disappear
              await page.waitForSelector('.loading, .spinner', { state: 'detached', timeout: 10000 });
            } catch (error) {
              console.log(`No loading indicators found for ${encId}`);
            }
            
            // Try to close billing info page if it appears
            try {
              const cancelButton = page.getByRole('button', { name: 'Cancel' });
              if (await cancelButton.isVisible({ timeout: 5000 })) {
                await cancelButton.click();
                console.log(`Closed billing info page for ${encId}`);
                await page.waitForTimeout(2000);
              }
            } catch (error) {
              console.log(`No cancel button found for ${encId}`);
            }

            // Check and update non-billable visit status
            try {
              const nonBillableCheckbox = page.getByRole('checkbox', { name: 'Non-billable visit' });
              await nonBillableCheckbox.waitFor({ state: 'visible', timeout: 10000 });
              
              const isCurrentlyChecked = await nonBillableCheckbox.isChecked();
              if (!isCurrentlyChecked) {
                await nonBillableCheckbox.check();
                console.log(`✓ Turned visit with ID ${encId} into non-billable`);
              } else {
                console.log(`✓ Visit with ID ${encId} is already non-billable`);
              }
              
              // Handle confirmation modal
              try {
                const yesButton = page.getByRole('button', { name: 'Yes' });
                if (await yesButton.isVisible({ timeout: 5000 })) {
                  await yesButton.click({ force: true });
                  console.log(`Confirmed changes for ${encId}`);
                  await page.waitForTimeout(1000);
                }
              } catch (error) {
                console.log(`No Yes button found for ${encId}`);
              }
              
              // Handle OK button to save changes
              try {
                const okButton = page.getByRole('button', { name: 'OK', exact: true });
                if (await okButton.isVisible({ timeout: 5000 })) {
                  await okButton.click({ force: true });
                  console.log(`Saved changes for ${encId}`);
                  await page.waitForTimeout(2000);
                }
              } catch (error) {
                console.log(`No OK button found for ${encId}`);
              }
              
            } catch (error) {
              console.log(`Could not process non-billable checkbox for ${encId}: ${error.message}`);
            }
            
            // Ensure we're back to the calendar view before processing next encounter
            try {
              // Wait for calendar to be visible again
              await page.waitForSelector('.fc-view', { state: 'visible', timeout: 10000 });
              console.log(`Back to calendar view after processing ${encId}`);
            } catch (error) {
              console.log(`Warning: Could not confirm return to calendar view after ${encId}`);
            }
            
            // Add extra wait between encounters to prevent overlap
            await page.waitForTimeout(1000);
            
          } catch (error) {
            console.log(`Error processing encounter ${j}: ${error.message}`);
            continue;
          }
        }

        if (encCount === 0) {
          console.log(`No encounters found for provider: ${provider.fullName} on ${currentDate.toDateString()}`);
        } else {
          console.log(`✓ Processed ${encCount} encounters for provider: ${provider.fullName}`);
        }

        // Uncheck the checkbox (Prepping for the next provider)
        await checkbox.waitFor({ state: 'visible' });
        await checkbox.click({ force: true });
        console.log(`✓ Unchecked provider: ${provider.fullName}`);

      } catch (error) {
        console.log(`❌ Error with provider ${provider.fullName} (${provider.userId}): ${error.message}`);
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;
  }
});
