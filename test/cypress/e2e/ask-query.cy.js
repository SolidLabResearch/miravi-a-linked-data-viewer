describe("ASK queries", () => {
  it("Should give the expected true answer", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("Is there an artist influenced by Picasso?").click();
    cy.contains("Finished in:");
    cy.contains("Yes, there is at least one artist influenced by Picasso!");
  });
  it("Should give the expected false answer", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("Is there an artist influenced by Picasso (forced negative answer)?").click();
    cy.contains("Finished in:");
    cy.contains("No, there is not a single artist influenced by Picasso (if you look at the wrong data).");
  });
});
