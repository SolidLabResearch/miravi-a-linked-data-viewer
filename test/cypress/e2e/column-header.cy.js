describe("Column header", () => {
  it("Variables link to ontology", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.get('a[href="http://schema.org/name"]');
  })
});
