describe("Column header", () => {
  it("Variables link to ontology", () => {
    cy.visit("/");

    cy.contains("My favourite musicians").click();
    cy.contains("Finished in:");
    cy.get('a[href="http://schema.org/name"]');
  })
});
