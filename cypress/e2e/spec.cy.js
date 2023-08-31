describe("Web app", () => {
  it("Successfully loads.", () => {
    cy.visit("/");
  });

  it("When one source throws an error, the results of other sources are still shown", () => {
    cy.visit("/");

    cy.contains("My favourite musicians").click();
    cy.contains("Finished in:");
    cy.contains("Ludwig van Beethoven");
  })

  it("Log in and execute query on private data", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]').clear();
    cy.get('input[name="idp"]').type("http://localhost:8080");
    cy.contains("Login").click();

    cy.get("input#email").type("hello@example.com");
    cy.get("input#password").type("abc123");
    cy.contains("button", "Log in").click();
    cy.contains("button", "Authorize").click();

    cy.url().should("eq", "http://localhost:5173/");

    cy.contains("A list of my favorite books").click();
    cy.contains('It Ends With Us');
  });

  it("Query on private data unauthenticated", () => {
    cy.visit("/");

    cy.contains("A list of my favorite books").click();
    cy.get("div").should("have.class", "MuiSnackbarContent-message")
  });

  it('Querying resource with "bad" cors header, though a proxy should work', () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]').clear();
    cy.get('input[name="idp"]').type("http://localhost:8080");
    cy.contains("Login").click();

    cy.get("input#email").type("hello@example.com");
    cy.get("input#password").type("abc123");
    cy.contains("button", "Log in").click();
    cy.contains("button", "Authorize").click();

    cy.url().should("eq", "http://localhost:5173/");

    cy.contains("My idols").click();
    cy.get(".MuiSnackbarContent-message").should("not.exist");
  });

  it("Query public data", () => {
    cy.visit("/");

    cy.contains("My wish list").click();
    cy.contains("Too Late");
  });

  it("Querying variable ending on _img should return an image as result", () => {
    cy.visit("/");

    cy.contains("A Test For Images").click();
    cy.contains("Finished in:");
    cy.get("td").find("img");
  });
});
