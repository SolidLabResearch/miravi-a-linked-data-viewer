describe("No duplicates", () => {
  it("When sources contain identical triples, duplicates should not be counted in a SELECT DISTINCT query", () => {
    cy.visit("/");

    cy.contains("Components, with duplicates in different sources").click();
    cy.contains("1-3 of 3");
  });
});
