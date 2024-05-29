describe("Total items", () => {
  it("The total number of results must be correct, even if not all SPARQL query variables used in the WHERE clause are selected for display in the SELECT clause", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A test on counting the total number results").click();
    cy.contains("1-10 of 20");
  });
});
