describe("Dashboard", () => {
  it("Successfully loads", () => {
    cy.visit("/");
  });

  it("Custom icon per query is displayed", () => {
    cy.visit("/");
    cy.contains("General examples").click();
    cy.get('[data-testid="PhotoIcon"]').should("exist");
    cy.get('[data-testid="BrushIcon"]').should("exist");
  })
});
