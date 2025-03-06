describe("Verify source", () => {
  it("Verification button exists and returns correct result", () => {
    cy.visit("/");
    
    cy.contains("Example queries").click();
    cy.contains("Source verification").click();

    cy.get('[aria-label="Sources info"]').click();

    cy.contains("http://localhost:8080/verifiable-example/components-vc").parent('tr').within(() => {
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="Verification succeeded"]').should("exist");
    });

    cy.contains("http://localhost:8080/verifiable-example/components-vc-incorrect-proof").parent('tr').within(() => {
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="Verification failed"]').should("exist");
    });

    cy.contains("http://localhost:8080/example/components").parent('tr').within(() => {
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="No credential found to verify"]').should("exist");
    });

  });
});