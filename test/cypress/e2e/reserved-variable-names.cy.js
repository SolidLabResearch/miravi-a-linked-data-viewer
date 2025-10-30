describe("Reserved variable names", () => {
  it("Must report an error if a reserved variable name is used", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("Reserved variable name test").click();
    cy.contains("Something went wrong...");
    cy.contains('Variable "id" is not allowed in Miravi queries. Please rename this variable.');
  });
});
