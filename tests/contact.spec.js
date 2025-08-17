import { test } from '@playwright/test';
import { ContactPage } from '../objects/contact.po.js';
import { LoginPage } from '../objects/login.po.js';
import testData from '../fixtures/loginFixture.json' assert { type: 'json' };
import contactTestData from '../fixtures/contactFixture.json' assert { type: 'json' };

let accessToken;

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await page.goto('/');
  await login.login(testData.validUser.username, testData.validUser.password);
  await login.verifyValidLogin();
});

test.describe('Contact testcases', () => {
  test('Add new contact', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.navigateToContacts();
    await contactPage.addNewContact(contactTestData.newContact);
    await contactPage.verifyContactAdded(contactTestData.newContact.name);
  });

  test('Delete contact', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.navigateToContacts();
    
    // First create the contact to delete
    await contactPage.addNewContact(contactTestData.contactToDelete);
    await contactPage.verifyContactAdded(contactTestData.contactToDelete.name);
    
    // Then delete it
    await contactPage.deleteContact(contactTestData.contactToDelete.name);
    await contactPage.verifyContactDeleted(contactTestData.contactToDelete.name);
  });
});
