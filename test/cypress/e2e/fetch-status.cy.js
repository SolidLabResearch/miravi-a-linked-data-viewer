describe("Fetch Status", () => {

    it("Fetch data with no authenticated user", () => {

        cy.visit("/");
        
        // Go immediately to query
        cy.contains("For testing only").click();
        cy.contains("A query on a secret and a public list of books").click();  
        
        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();
        
        // Check if the correct icons appear
        cy.contains("http://localhost:8080/example/wish-list").parent().within(() => {
            cy.get('[aria-label="No authentication required"]').should("exist");
            cy.get('[aria-label="Fetch was successful"]').should("exist");
        });
        cy.contains("http://localhost:8080/example/favourite-books").parent().within(() => {
            cy.get('[aria-label="Authentication required"]').should("exist");
            cy.get('[aria-label="Unauthorized"]').should("exist");
        });
        cy.get('[aria-label="Not fetched"]').should("not.exist");

        // Checking that a non-authorized book is not appearing 
        cy.contains("It Ends With Us").should("not.exist");

        // Checking that a book that we may see appears
        cy.contains("Too Late");

    });

    it("Fetch data with authenticated user", () => {

        cy.visit("/");

        // Login as user 'example'
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

        // Go to the mixed book query
        cy.contains("For testing only").click();
        cy.contains("A query on a secret and a public list of books").click();

        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();

        // Check if the correct icons appear
        cy.contains("http://localhost:8080/example/wish-list").parent().within(() => {
            cy.get('[aria-label="No authentication required"]').should("exist");
            cy.get('[aria-label="Fetch was successful"]').should("exist");
        });
        cy.contains("http://localhost:8080/example/favourite-books").parent().within(() => {
            cy.get('[aria-label="Authentication required"]').should("exist");
            cy.get('[aria-label="Fetch was successful"]').should("exist");
        });
        cy.get('[aria-label="Not fetched"]').should("not.exist");

        // Checking that you see authorized books
        cy.contains("It Ends With Us");
        cy.contains("Too Late");
    });

    it("Failed to fetch data", () => {

        cy.visit("/");

        // Go immediately to query
        cy.contains("Example queries").click();
        cy.contains("A query about musicians").click();  
        
        // Check if the good and bad sources appear
        cy.get('[aria-label="Sources info"]').click();
        
        // Check if the correct icons appear
        cy.contains("http://localhost:8080/example/favourite-musicians").parent().within(() => {
            cy.get('[aria-label="No authentication required"]').should("exist");
            cy.get('[aria-label="Fetch was successful"]').should("exist");
        });
        cy.contains("http://www.example.com/fetch-failure-but-query-success").parent().within(() => {
            cy.get('[aria-label="Uncertain if authentication is required"]').should("exist");
            cy.get('[aria-label="Fetch failed"]').should("exist");
        });
        cy.get('[aria-label="Not fetched"]').should("not.exist");

    });

    it("Fetch data with no authenticated user, indirect source & indirect variables and one unauthorized source", () => {

        cy.visit("/");
        cy.contains("For testing only").click();
        cy.contains("Component and materials - 1 variable (indirect source & indirect variables; one unauthorized source)").click();

        // Fill in the form
        cy.get('.ra-input-componentName').click();
        cy.get('li').contains('Component 1').click();

        // Comfirm query
        cy.get('button[type="submit"]').click();

        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();

        // Check if the correct icons appear
        cy.contains("http://localhost:8080/example/boms").parent().within(() => {
            cy.get('[aria-label="No authentication required"]').should("exist");
            cy.get('[aria-label="Fetch was successful"]').should("exist");
        });
        cy.contains("http://localhost:8080/example/favourite-books").parent().within(() => {
            cy.get('[aria-label="Authentication required"]').should("exist");
            cy.get('[aria-label="Unauthorized"]').should("exist");
        });
        cy.get('[aria-label="Not fetched"]').should("not.exist");

    });

})