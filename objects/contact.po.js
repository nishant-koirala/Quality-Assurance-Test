const { expect } = require('@playwright/test');

exports.ContactPage = class ContactPage {
  constructor(page) {
    this.page = page;
    this.addContact = '//button[@id="add-contact"]';
    this.firstName = '#firstName';
    this.lastName = '#lastName';
    this.dob = '//input[@placeholder="yyyy-MM-dd"]';
    this.email = '//input[@id="email"]';
    this.phone = '//input[@id="phone"]';
    this.address = '//input[@placeholder="Address 1"]';
    this.city = '//input[@placeholder="City"]';
    this.state = '//input[@placeholder="State or Province"]';
    this.postal = '//input[@placeholder="Postal Code"]';
    this.saveButton = '//button[@type="submit"]';
  }

  async navigateToContacts() {
    // After login, we're already on the contact list page
    // No navigation needed - just wait for the page to load
    await this.page.waitForLoadState('networkidle');
  }

  async addNewContact(contact) {
    await this.page.click(this.addContact);
    await this.page.fill(this.firstName, contact.firstName);
    await this.page.fill(this.lastName, contact.lastName);
    await this.page.fill(this.dob, contact.dob);
    await this.page.fill(this.email, contact.email);
    await this.page.fill(this.phone, contact.phone);
    await this.page.fill(this.address, contact.address);
    await this.page.fill(this.city, contact.city);
    await this.page.fill(this.state, contact.state);
    await this.page.fill(this.postal, contact.postal);
    await this.page.click(this.saveButton);
  }

  async verifyContactAdded(expectedName) {
    // Wait for the contact to appear in the contact list table
    // Count contacts before and after to verify addition
    await this.page.waitForTimeout(2000);
    const contactExists = await this.page.locator(`tr:has-text("${expectedName}")`).count();
    expect(contactExists).toBeGreaterThan(0);
  }

  async deleteContact(name) {
    // Click on the contact row to select it
    const contactRow = this.page.locator(`tr:has-text("${name}")`).first();
    await contactRow.click();
    
    // Wait for contact details to load
    await this.page.waitForTimeout(2000);
    
    // Click the delete button with id 'delete'
    const deleteButton = this.page.locator('#delete');
    await deleteButton.click();
    
    // Wait for deletion to complete
    await this.page.waitForTimeout(1000);
  }

  async verifyContactDeleted(name) {
    // Wait for the page to update after deletion
    await this.page.waitForTimeout(2000);
    // Navigate back to contact list if we're in details view
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
    // Verify the specific contact is no longer present
    const contactCount = await this.page.locator(`tr:has-text("${name}")`).count();
    expect(contactCount).toBe(0);
  }
};
