describe("Templated query", () => {
  it("With 2 variables", () => {
    cy.visit("/");

    cy.contains("Templated query #2 about my favourite musicians").click();

    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Classical').click();
    cy.get('form').within(() => {
      cy.get('#sameAsUrl').click();
    });
    cy.get('li').contains('Mozart').click();

    cy.get('button').contains('Query').click();
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart");
  });
});
