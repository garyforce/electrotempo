describe('Signup Form Validation', () => {
  it('Visits the signup page and checks for the presence of form elements', () => {
    const host = Cypress.env('host');
    cy.visit(`${host}/seco-signup`);

    // Check if all the form elements are present
    cy.get("#location-select").should("exist");
    cy.get("#outlined-adornment-password").should("exist");
  });
});
