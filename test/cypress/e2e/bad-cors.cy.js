describe("Bad CORS", () => {
  it('Querying resource with "bad" cors header, though a proxy should work', () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("My idols").click();
    cy.get(".MuiSnackbarContent-message").should("not.exist");
  });
});
