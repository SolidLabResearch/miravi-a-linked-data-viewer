describe("Aggregating query", () => {
  it("AVG() function - see https://github.com/SolidLabResearch/miravi-a-linked-data-viewer/issues/70", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("Average value").click();
    cy.contains("Finished in:");
    cy.get('.column-average').find('span').contains("75");
  });
});
