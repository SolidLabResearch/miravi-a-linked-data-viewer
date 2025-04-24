describe("Sources info", () => {
  it("Fetch status on fetch failure", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Fetch failed"]').should("exist");
  });

  it("Fetch status on fetch success", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A public list of books I'd love to own").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Fetch was successful"]').should("exist");
  });

  it("Fetch status on cached source - see https://github.com/SolidLabResearch/generic-data-viewer-react-admin/issues/59", () => {
    cy.visit("/");
    cy.contains("Project related examples").click();
    cy.contains("Components").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Fetch was successful"]').should("exist");

    cy.contains("Components and their materials").click();
    cy.contains("Finished in:");
    cy.get('#main-content').within(() => {
      cy.contains("Components and their materials"); // wait for the next results!!!
    });
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Fetch was successful"]').should("exist");
    cy.get('[aria-label="Fetch failed"]').should("not.exist");
  });

  it("Authentication not required for query on public data", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A public list of books I'd love to own").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="No authentication required"]').should("exist");
  });

  it("Authentication required for query on private data", () => {
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

    cy.contains("Example queries").click();
    cy.contains("A secret list of my favorite books").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Authentication required"]').should("exist");
  });

  it("Authentication uncertain for query on not existing source", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A query about musicians").click();
    cy.contains("Finished in:");
    cy.get('[aria-label="Sources info"]').click();

    cy.get('[aria-label="Uncertain if authentication is required"]').should("exist");
  });
});
