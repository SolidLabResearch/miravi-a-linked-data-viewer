describe("Verify source", () => {
  it("Verification button exists and returns correct result", () => {
    cy.visit("/");

    cy.contains("My favourite musicians").click();

    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Verify source"]').each(($button) => {
      cy.wrap($button).click();
    });

    cy.get('[aria-label="Verification succeeded"]').should("exist");
    cy.get('[aria-label="Verification failed"]').should("exist")
  });
});