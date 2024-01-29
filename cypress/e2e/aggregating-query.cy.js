describe("Aggregating query", () => {
  it("AVG() function", () => {
    cy.visit("/");

    cy.contains("Average value").click();
    cy.contains("Finished in:");
    cy.get('.column-average').find('span').contains("75");
  });
});
