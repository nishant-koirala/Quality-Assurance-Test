import { test, expect } from '@playwright/test';
import { LoginPage } from '../objects/login.po.js';
import testData from '../fixtures/loginFixture.json' assert { type: 'json' };

test('Simple login test', async ({ page }) => {
  console.log('Starting test...');
  
  const loginPage = new LoginPage(page);
  await page.goto('/');
  console.log('Navigated to home page');
  
  // Take screenshot before login
  await page.screenshot({ path: 'before-login.png' });
  
  await loginPage.login(testData.validUser.username, testData.validUser.password);
  console.log('Login attempted');
  
  await page.waitForTimeout(3000);
  
  // Take screenshot after login
  await page.screenshot({ path: 'after-login.png' });
  
  // Check if we can see the logout button or contact list
  const logoutButton = page.locator('#logout');
  const isLoggedIn = await logoutButton.isVisible();
  console.log('Is logged in:', isLoggedIn);
  
  if (isLoggedIn) {
    console.log('Login successful - checking for add contact button');
    const addContactButton = page.locator('#add-contact');
    const canAddContact = await addContactButton.isVisible();
    console.log('Can add contact:', canAddContact);
  }
  
  // Basic assertion
  await expect(page).toHaveURL(/thinking-tester-contact-list/);
});
