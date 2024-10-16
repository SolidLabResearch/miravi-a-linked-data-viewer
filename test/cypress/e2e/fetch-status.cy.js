describe("Fetch Status", () => {

    it("Fetch data with no authenticated user", () => {

        cy.visit("/");
        
        // Go immediately to query
        cy.contains("For testing only").click();
        cy.contains("A query on a secret and a public list of books").click();  
        
        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();
        
        cy.contains("http://localhost:8080/example/favourite-books");
        cy.contains("http://localhost:8080/example/wish-list");

        // Check if the correct icons appear
        cy.get('[aria-label="Authentication required"]').should("exist");
        cy.get('[aria-label="Unauthorized"]').should("exist");

        cy.get('[aria-label="No authentication required"]').should("exist");
        cy.get('[aria-label="Fetch was successful"]').should("exist");
        

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

        cy.contains("http://localhost:8080/example/favourite-books");
        cy.contains("http://localhost:8080/example/wish-list");

        // Check if the correct icons appear
        cy.get('[aria-label="Authentication required"]').should("exist");
        cy.get('[aria-label="Fetch Failed"]').should("not.exist");
        cy.get('[aria-label="Unauthorized"]').should("not.exist");

        cy.get('[aria-label="No authentication required"]').should("exist");
        cy.get('[aria-label="Fetch was successful"]').should("exist");

        // Checking that you see authorized books
        cy.contains("It Ends With Us");
        cy.contains("Too Late");
    });

    it("Failed to fetch data", () => {

        cy.visit("/");

        // Go immediately to query
        cy.contains("General examples").click();
        cy.contains("A query about musicians").click();  
        
        // Check if the good and bad sources appear
        cy.get('[aria-label="Sources info"]').click();
        
        // First fetch should be a success
        cy.contains("http://localhost:8080/example/favourite-musicians");
        cy.get('[aria-label="No authentication required"]').should("exist");
        cy.get('[aria-label="Unauthorized"]').should("not.exist");
        cy.get('[aria-label="Fetch was successful"]').should("exist");

        // the bad source should fail to fetch
        cy.contains("http://www.example.com/fetch-failure-but-query-success");
        cy.get('[aria-label="Fetch failed"]').should("exist");

    });

})