describe("Column header", () => {
  it("Variables link to ontology", () => {
    cy.visit("/");
    cy.contains("General examples").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.get('a[href="http://schema.org/name"]');
  })
});
