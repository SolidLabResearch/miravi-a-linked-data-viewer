describe("Http proxies", () => {
  it("With indirect sources and with source verification", () => {
    cy.visit("/");
    
    cy.contains("For testing only").click();
    cy.contains("Http proxy test combined with indirect sources and source verification").click();

    cy.get('[aria-label="Sources info"]').click();

    cy.contains("1-3 of 3");

    cy.contains("http://localhost:8080/verifiable-example/components-vc").parent('tr').within(() => {
      cy.get('[aria-label="No authentication required"]').should("exist");
      cy.get('[aria-label="Fetch was successful"]').should("exist");
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="Verification succeeded"]').should("exist");
    });

    cy.contains("http://localhost:8080/verifiable-example/components-vc-incorrect-proof").parent('tr').within(() => {
      cy.get('[aria-label="No authentication required"]').should("exist");
      cy.get('[aria-label="Fetch was successful"]').should("exist");
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="Verification failed"]').should("exist");
    });

    cy.contains("http://localhost:8080/example/components").parent('tr').within(() => {
      cy.get('[aria-label="No authentication required"]').should("exist");
      cy.get('[aria-label="Fetch was successful"]').should("exist");
      cy.get('[aria-label="Verify source"]').click();
      cy.get('[aria-label="No credential found to verify"]').should("exist");
    });

  });
});