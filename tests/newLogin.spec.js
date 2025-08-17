import {test} from '@playwright/test';
import  {LoginPage} from '../objects/login.po';
const testdata = require('../fixtures/loginFixture.json');

test.beforeEach(async ({page}) => {
    await page.goto('/');
}   )

test.describe('Valid Login Tests', () => {    
    test('Login using Valid username and password', async ({page}) => {
        const login= new LoginPage(page);
        await login.login(testdata.validUser.username, testdata.validUser.password);
        await login.verifyValidLogin();
    }
    );
})

test.describe('Invalid Login Tests', () => {    
    test('Login using Invalid username and password', async ({page}) => {
        const login= new LoginPage(page);
        await login.login(testdata.invalidUser.username,testdata.invalidUser.password);
        await login.verifyInvalidLogin();
    }
    );
})