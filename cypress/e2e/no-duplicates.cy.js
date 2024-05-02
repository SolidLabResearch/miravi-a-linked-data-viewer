describe("No duplicates", () => {
  it("When sources contain identical triples, duplicates should not be counted in a SELECT DISTINCT query", () => {
    cy.visit("/");

    cy.contains("A test on DISTINCT LIMIT OFFSET").click();
    cy.contains("1-10 of 36");
    cy.contains("http://www.example.com/data#s00").should("not.exist");

    cy.get('.MuiPagination-ul > :nth-child(5)').click();
    cy.contains("31-36 of 36");
    cy.contains("http://www.example.com/data#s19").should("not.exist");
  });
});
