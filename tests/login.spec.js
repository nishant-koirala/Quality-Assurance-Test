import { test, expect } from '@playwright/test';
import { LoginPage } from '../objects/login.po.js';
import testData from '../fixtures/loginFixture.json' assert { type: 'json' };

test('Tc100 - valid login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login(testData.validUser.username, testData.validUser.password);
  await loginPage.verifyValidLogin();
});

test('Tc1002 - invalid username/password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login(testData.invalidUser.username, testData.invalidUser.password);
  await loginPage.verifyInvalidLogin();
});

test('Tc1003 - valid username, invalid password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login(testData.validUser.username, 'wrongpassword');
  await loginPage.verifyInvalidLogin();
});

test('Tc1004 - no credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login('', '');
  await loginPage.verifyInvalidLogin();
});

test('Tc1005 - empty username', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login('', 'test123');
  await loginPage.verifyInvalidLogin();
});

test('Tc1006 - empty password', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login('testuser@example.com', '');
  await loginPage.verifyInvalidLogin();
});

test('Tc1007 - special characters only', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await page.goto('/');
  await loginPage.login('!@#$%^&*()', '!@#$%^&*()');
  await loginPage.verifyInvalidLogin();
});
