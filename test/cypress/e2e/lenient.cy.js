describe("Lenient mode", () => {
  it("When one source throws an error, the results of other sources are still shown", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.contains("Ludwig van Beethoven");
  });
});
