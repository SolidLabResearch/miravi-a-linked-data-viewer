describe("Aggregating query", () => {
  it("AVG() function - see https://github.com/SolidLabResearch/generic-data-viewer-react-admin/issues/70", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("Average value").click();
    cy.contains("Finished in:");
    cy.get('.column-average').find('span').contains("75");
  });
});
