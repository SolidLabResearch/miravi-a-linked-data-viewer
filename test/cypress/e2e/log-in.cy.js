describe("Log in", () => {
  it("Log in with WebID with no OIDC issuer", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]')
      .clear();
    cy.get('input[name="idp"]')
      .type("http://localhost:8080/example2/profile/card#me");
    cy.contains("Login").click();

    cy.contains("Login failed");
  });

  it("Log in with invalid WebID document", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]')
      .clear();
    cy.get('input[name="idp"]')
      .type("http://localhost:8080/invalidWebId/profile/card#me");
    cy.contains("Login").click();

    cy.contains("Login failed");
  });

  it("Log in with WebID with OIDC issuer", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]')
      .clear();
    cy.get('input[name="idp"]')
      .type("http://localhost:8080/example/profile/card#me");
    cy.contains("Login").click();

    cy.origin('http://localhost:8080', () => {
      cy.get("input#email").type("hello@example.com");
      cy.get("input#password").type("abc123");
      cy.contains("button", "Log in").click();
      cy.contains("button", "Authorize").click();
    });

    cy.url().should("eq", Cypress.config('baseUrl'));
  });

  it("Log in with an invalid IDP issuer", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]')
      .clear();
    cy.get('input[name="idp"]')
      .type("https://facebook.com");
    cy.contains("Login").click();

    cy.contains("Login failed");
  });

  it("Log in with a valid IDP issuer and execute query on private data, then log out", () => {
    cy.visit("/");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Login").click();

    cy.get('input[name="idp"]').clear();
    cy.get('input[name="idp"]').type("http://localhost:8080");
    cy.contains("Login").click();

    cy.origin('http://localhost:8080', () => {
      cy.get("input#email").type("hello@example.com");
      cy.get("input#password").type("abc123");
      cy.contains("button", "Log in").click();
      cy.contains("button", "Authorize").click();
    });
    
    cy.url().should("eq", Cypress.config('baseUrl'));

    cy.contains("General examples").click();
    cy.contains("A secret list of my favorite books").click();
    cy.contains("It Ends With Us");

    cy.get('[aria-label="Profile"]').click();
    cy.contains('[role="menuitem"]', "Logout").click();

    cy.contains("It Ends With Us").should("not.exist");
  });

  it("Do not log in and query on private data unauthenticated", () => {
    cy.visit("/");
    cy.contains("General examples").click();
    cy.contains("A secret list of my favorite books").click();
    cy.contains("It Ends With Us").should("not.exist");
  });

  it("Do not log in and query public data", () => {
    cy.visit("/");
    cy.contains("General examples").click();
    cy.contains("A public list of books I'd love to own").click();
    cy.contains("Too Late");
  });
});
