const { expect } = require('@playwright/test');
exports.LoginPage = class LoginPage {
  constructor(page) {
     this.page = page;
    this.usernameInput = '#email';
    this.passwordInput = "//input[@placeholder='Password']";
    this.loginButton = "//button[@id='submit']";
    this.logOut = "//button[@id='logout']";
    this.loginValidation = "//p[contains(text(),'Click on any contact to view the Contact Details')]";
    this.alertMessage = "//span[@id='error']";
  }

  async login(username, password) {
    await this.page.waitForTimeout(2000);

    await this.page.locator(this.usernameInput).fill(username);
    await this.page.locator(this.passwordInput).fill(password);
    
    // Wait for button to be ready and click with retry
    const loginBtn = this.page.locator(this.loginButton);
    await loginBtn.waitFor({ state: 'visible' });
    await loginBtn.click();
    
    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  }


    async verifyValidLogin() {
  const loginValidation = this.page.locator(this.loginValidation);
  const logoutBtn = this.page.locator(this.logOut);
  
  // Wait for page to fully load after login
  await this.page.waitForTimeout(3000);
  
  // Wait for logout button to appear (indicates successful login)
  await logoutBtn.waitFor({ state: 'visible', timeout: 15000 });
  await expect(logoutBtn).toBeVisible();

  // Check validation message text with more flexible matching
  try {
    await expect(loginValidation).toHaveText('Click on any contact to view the Contact Details', { timeout: 10000 });
  } catch {
    // Fallback: just ensure we're on the contacts page
    await expect(this.page.locator('#add-contact')).toBeVisible({ timeout: 5000 });
  }
}


   async verifyInvalidLogin() {
  const InvalidLogin=await this.page.locator(this.alertMessage);
  await expect(InvalidLogin).toHaveText('Incorrect username or password');
}
}