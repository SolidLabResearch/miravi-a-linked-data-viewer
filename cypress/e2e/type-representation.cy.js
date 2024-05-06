describe("Type representation", () => {
  it("Querying variable ending on _img should return an image as result", () => {
    cy.visit("/");

    cy.contains("Some images").click();
    cy.contains("Finished in:");
    cy.get("td").find("img");
  });
});
