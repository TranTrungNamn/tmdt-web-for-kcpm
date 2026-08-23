/// <reference types="cypress" />

// Custom command to login via UI
Cypress.Commands.add("loginViaUI", (email: string, password: string) => {
  cy.visit("/auth");
  cy.get('input[type="email"], input[name="email"]').first().clear().type(email);
  cy.get('input[type="password"], input[name="password"]').first().clear().type(password);
  cy.get('button[type="submit"]').contains(/Đăng nhập|Login/i).click();
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginViaUI(email: string, password: string): Chainable<void>;
    }
  }
}
