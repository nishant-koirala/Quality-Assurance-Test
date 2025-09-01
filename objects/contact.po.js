const { expect } = require('@playwright/test');

exports.ContactPage = class ContactPage {
  constructor(page) {
    this.page = page;
    // Contacts list UI lives at root '/'. Navigating to '/contacts' hits the API and returns JSON.
    this.contactsPath = '/';
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

  async ensureListView() {
    // If we're on a detail form, there should be a Return button with id 'return'
    const addBtn = this.page.locator('#add-contact');
    const returnBtn = this.page.locator('#return');
    const logoutBtn = this.page.locator('#logout');
    if ((await addBtn.count()) === 0) {
      if (await returnBtn.isVisible().catch(() => false)) {
        await returnBtn.click();
        await this.page.waitForLoadState('networkidle');
        return;
      }
      // If we are logged in but not on the list, navigate directly to contacts
      if (await logoutBtn.isVisible().catch(() => false)) {
        await this.page.goto(this.contactsPath);
        await this.page.waitForLoadState('networkidle');
      }
    }
  }

  async navigateToContacts() {
    // Go to contacts page deterministically
    await this.page.goto(this.contactsPath);
    await this.page.waitForLoadState('networkidle');
    
    // Wait longer for page elements to load
    await this.page.waitForTimeout(3000);
    
    // Wait for list indicators: Add button or helper text
    const addBtn = this.page.locator('#add-contact');
    const helperText = this.page.locator('text=Click on any contact to view the Contact Details');
    const logoutBtn = this.page.locator('#logout');
    
    // Ensure we're logged in and on the right page
    await Promise.race([
      addBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      helperText.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {}),
      logoutBtn.waitFor({ state: 'visible', timeout: 15000 }).catch(() => {})
    ]);
  }

  async addNewContact(contact) {
    await this.ensureListView();
    
    // Wait for page to be ready
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(2000);
    
    // Try multiple selector strategies with better error handling
    const selectors = [
      '#add-contact',
      'button[id="add-contact"]',
      'button:has-text("Add a New Contact")',
      'button:has-text("Add Contact")',
      '[role="button"]:has-text("Add")',
      'input[type="submit"][value*="Add"]'
    ];
    
    let addButton = null;
    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.count() > 0) {
        addButton = element;
        break;
      }
    }
    
    if (!addButton) {
      throw new Error('Add Contact button not found with any selector');
    }
    
    await addButton.waitFor({ state: 'visible', timeout: 20000 });
    await addButton.click();
    await this.page.locator(this.firstName).waitFor({ state: 'visible' });
    await this.page.fill(this.firstName, contact.firstName);
    await this.page.fill(this.lastName, contact.lastName);
    await this.page.fill(this.dob, contact.dob);
    // Ensure unique email per run to avoid duplicate constraint failures
    const uniqueEmail = contact.email && contact.email.includes('@')
      ? contact.email.replace('@', `+${Date.now()}@`)
      : contact.email;
    await this.page.fill(this.email, uniqueEmail);
    await this.page.fill(this.phone, contact.phone);
    await this.page.fill(this.address, contact.address);
    await this.page.fill(this.city, contact.city);
    await this.page.fill(this.state, contact.state);
    await this.page.fill(this.postal, contact.postal);
    await this.page.click(this.saveButton);
    // Wait for details view to appear which shows a Return button
    const returnBtn = this.page.locator('#return');
    const errorMsg = this.page.locator('#error');
    try {
      await Promise.race([
        returnBtn.waitFor({ state: 'visible', timeout: 15000 }),
        errorMsg.waitFor({ state: 'visible', timeout: 15000 })
      ]);
      if (await errorMsg.isVisible().catch(() => false)) {
        const errText = (await errorMsg.textContent()) || 'Unknown error saving contact';
        throw new Error(`Failed to save contact: ${errText.trim()}`);
      }
      await returnBtn.click();
      await this.page.waitForLoadState('networkidle');
    } catch (e) {
      // If details didn't appear, navigate back to contacts list as a fallback
      await this.page.goto(this.contactsPath);
      await this.page.waitForLoadState('networkidle');
    }
  }

  async verifyContactAdded(expectedName) {
    // Go to contacts list view and wait for the table
    await this.page.goto(this.contactsPath);
    await this.page.waitForLoadState('networkidle');
    const nameParts = (expectedName || '').split(/\s+/).filter(Boolean);
    let row = this.page.locator('tbody tr');
    for (const part of nameParts) {
      row = row.filter({ has: this.page.getByText(new RegExp(part, 'i')) });
    }
    const fallbackRow = this.page.locator('tr');
    for (const part of nameParts) {
      fallbackRow = fallbackRow.filter({ has: this.page.getByText(new RegExp(part, 'i')) });
    }
    // Wait for either primary or fallback row
    await this.page.waitForTimeout(500);
    const found = await row.first().isVisible().catch(() => false)
      ? row.first()
      : fallbackRow.first();
    await found.waitFor({ state: 'visible', timeout: 15000 });
    await expect(found).toBeVisible();
  }

  async deleteContact(name) {
    // Ensure we are on the list page and click on the contact row to select it
    await this.ensureListView();
    await this.page.waitForLoadState('networkidle');
    // Match on both first and last name tokens for robustness
    const tokens = (name || '').split(/\s+/).filter(Boolean);
    let contactRow = this.page.locator('tr');
    for (const t of tokens) {
      contactRow = contactRow.filter({ has: this.page.getByText(new RegExp(t, 'i')) });
    }
    await contactRow.click();
    
    // Wait for contact details to load
    await this.page.waitForTimeout(2000);
    
    // Click the delete button with id 'delete'
    const deleteButton = this.page.locator('#delete');
    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();
    
    // Wait for deletion to complete
    await this.page.waitForTimeout(1000);
    await this.ensureListView();
  }

  async verifyContactDeleted(name) {
    // Wait for the page to update after deletion
    await this.page.waitForTimeout(2000);
    // Navigate back to contact list if we're in details view
    await this.ensureListView();
    // Verify the specific contact is no longer present
    const contactCount = await this.page.locator(`tr:has-text("${name}")`).count();
    expect(contactCount).toBe(0);
  }

  async editContact(originalName, updatedContact) {
    // Ensure we are on the list page, then click on the contact row to select it
    await this.ensureListView();
    await this.page.waitForLoadState('networkidle');
    const tokens = (originalName || '').split(/\s+/).filter(Boolean);
    let contactRow = this.page.locator('tr');
    for (const t of tokens) {
      contactRow = contactRow.filter({ has: this.page.getByText(new RegExp(t, 'i')) });
    }
    await contactRow.click();
    
    // Wait for contact details to load
    await this.page.waitForTimeout(2000);
    
    // Click the edit button
    const editButton = this.page.locator('#edit');
    await editButton.waitFor({ state: 'visible' });
    await editButton.click();
    
    // Wait for the form to be ready
    await this.page.locator(this.firstName).waitFor({ state: 'visible' });
    
    // Update the contact details
    await this.page.fill(this.firstName, updatedContact.firstName);
    await this.page.fill(this.lastName, updatedContact.lastName);
    await this.page.fill(this.dob, updatedContact.dob);
    await this.page.fill(this.email, updatedContact.email);
    await this.page.fill(this.phone, updatedContact.phone);
    await this.page.fill(this.address, updatedContact.address);
    await this.page.fill(this.city, updatedContact.city);
    await this.page.fill(this.state, updatedContact.state);
    await this.page.fill(this.postal, updatedContact.postal);
    
    // Save the changes
    await this.page.click(this.saveButton);
    
    // Wait for the save to complete
    await this.page.waitForTimeout(2000);
    // Navigate back to the list to verify changes in subsequent steps
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  async viewContact() {
    // Navigate to contacts list and wait for it to load
    await this.navigateToContacts();
    await this.page.waitForLoadState('networkidle');
    
    // Wait for contacts table to be visible
    const contactsTable = this.page.locator('table');
    await contactsTable.waitFor({ state: 'visible', timeout: 10000 });
  }
};
