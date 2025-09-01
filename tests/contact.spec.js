import { test } from '@playwright/test';
import { ContactPage } from '../objects/contact.po.js';
import { LoginPage } from '../objects/login.po.js';
import { authenticateUser, createEntity, getEntity } from '../helpers/helper.spec.js';
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

  test('Edit contact', async ({ page }) => {
    const contactPage = new ContactPage(page);
    await contactPage.navigateToContacts();
    
    // First create a contact to edit
    await contactPage.addNewContact(contactTestData.newContact);
    await contactPage.verifyContactAdded(contactTestData.newContact.name);
    
    // Edit the contact
    await contactPage.editContact(
      contactTestData.newContact.name,
      contactTestData.updateContact
    );
    
    // Verify the contact was updated
    await contactPage.verifyContactAdded(contactTestData.updateContact.name);
    
    // Clean up - delete the contact
    await contactPage.deleteContact(contactTestData.updateContact.name);
    await contactPage.verifyContactDeleted(contactTestData.updateContact.name);
  });

  test.only('Contact Delete test', async ({ page, request }) => {
    const Data = {
      "firstName": "John",
      "lastName": "Doe",
      "birthdate": "1990-06-30",
      "email": "johndoe@gmail.com",
      "phone": "9898989898",
      "street1": "Address1",
      "city": "City1",
      "stateProvince": "State1",
      "postalCode": "12345",
      "country": "Nepal"
    };

    // Get access token for API operations
    accessToken = await authenticateUser(testData.validUser.username, testData.validUser.password, { request });
    
    // Create contact via API
    const createdContact = await createEntity(Data, accessToken, '/contacts', { request });
    
    // Navigate to contacts page in the browser
    const contact = new ContactPage(page);
    await contact.navigateToContacts();
    
    // Verify the contact appears in the UI
    await contact.verifyContactAdded(`${Data.firstName} ${Data.lastName}`);
    
    // Get all contacts to verify creation
    const contacts = await getEntity(accessToken, '/contacts', 200, { request });
    console.log('Created contact:', createdContact);
    console.log('All contacts:', contacts);
  });
});
