import { test, expect } from '@playwright/test';
import testData from '../fixtures/loginFixture.json' assert { type: 'json' };

test('Debug UI elements', async ({ page }) => {
  await page.goto('/');
  
  // Login manually with correct selectors
  await page.fill('#email', testData.validUser.username);
  await page.fill("//input[@placeholder='Password']", testData.validUser.password);
  await page.click("//button[@id='submit']");
  await page.waitForTimeout(3000);
  
  // Print page content to understand structure
  const bodyText = await page.locator('body').textContent();
  console.log('Page content after login:', bodyText);
  
  // Check if we're on the contact list page
  const pageTitle = await page.title();
  console.log('Page title:', pageTitle);
  console.log('Current URL:', page.url());
  
  // Look for navigation elements
  const allText = await page.locator('*').allTextContents();
  console.log('All text elements:', allText.filter(text => text.trim().length > 0));
});
