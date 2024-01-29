describe("Sources info", () => {
  it("Fetch status on query failed", () => {
    cy.visit("/");

    cy.contains("My favourite musicians").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Query failed"]').should("exist");
  });

  it("Fetch status on query success", () => {
    cy.visit("/");

    cy.contains("My wish list").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Query was succesful"]').should("exist");
  });

  it("Authentication needed for query on public data", () => {
    cy.visit("/");

    cy.contains("My wish list").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="No authentication required"]').should("exist");
  });

  it("Authentication needed for query on private data", () => {
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
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Authentication required"]').should("exist");
  });

  it("Authentication needed for query on failing query", () => {
    cy.visit("/");

    cy.contains("My favourite musicians").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Uncertain if authentication is required"]').should("exist");
  });
});
