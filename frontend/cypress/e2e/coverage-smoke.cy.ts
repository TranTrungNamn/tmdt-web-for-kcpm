describe('Frontend Coverage Smoke Test', () => {
  it('loads TechVie and exposes Istanbul coverage', () => {
    cy.visit('/');

    cy.window().then((win) => {
      expect(win).to.have.property('__coverage__');
    });
  });
});