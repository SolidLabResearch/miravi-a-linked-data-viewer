describe("CONSTRUCT queries", () => {
  it("Should give the expected number of results", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A graph of artists influenced by Picasso").click();
    cy.contains("Finished in:");
    cy.contains(new RegExp('\\d+-\\d+ of 60'));
  });
});
