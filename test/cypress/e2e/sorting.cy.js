describe("Table sorting", () => {
  it("Should respond to sorting", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.get(':nth-child(1) > .column-name > span').contains("Antonio Caldara").should("not.exist");
    cy.contains("name").click();
    cy.get(':nth-child(1) > .column-name > span').contains("Antonio Caldara");
    cy.contains("name").click();
    cy.get(':nth-child(1) > .column-name > span').contains("Wolfgang Amadeus Mozart");
  });

  it("Should show that sorting is disabled on queries with an ORDER clause", () => {
    cy.visit("/");
    cy.contains("Project related examples").click();
    cy.contains("Components").click();
    cy.contains("Finished in:");
    cy.contains(/^component$/).click();
    cy.contains("Custom sorting is disabled for queries containing an ORDER clause.").should('exist');
  });
});
