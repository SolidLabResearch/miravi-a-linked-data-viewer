describe("Fetch Status", () => {

    it("Fetch data with no authenticated user", () => {

        cy.visit("/");

        // Go immediately to query
        cy.contains("A book query testing sources with and without authentication required").click();  
        
        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();
        
        cy.contains("http://localhost:8080/example/favourite-books");
        cy.contains("http://localhost:8080/example/wish-list");

        // Check if the correct icons appear
        cy.get('[aria-label="Authentication required"]').should("exist");
        cy.get('[aria-label="Fetch failed"]').should("exist");

        cy.get('[aria-label="No authentication required"]').should("exist");
        cy.get('[aria-label="Fetch was succesful"]').should("exist");
        

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

        cy.get("input#email").type("hello@example.com");
        cy.get("input#password").type("abc123");
        cy.contains("button", "Log in").click();
        cy.contains("button", "Authorize").click();

        cy.url().should("eq", "http://localhost:5173/");

        // Go to the mixed book query
        cy.contains("A book query testing sources with and without authentication required").click();

        // Check if the public and restricted sources appear
        cy.get('[aria-label="Sources info"]').click();

        cy.contains("http://localhost:8080/example/favourite-books");
        cy.contains("http://localhost:8080/example/wish-list");

        // Check if the correct icons appear
        cy.get('[aria-label="Authentication required"]').should("exist");
        cy.get('[aria-label="Fetch Failed"]').should("not.exist");

        cy.get('[aria-label="No authentication required"]').should("exist");
        cy.get('[aria-label="Fetch was succesful"]').should("exist");

        // Checking that you see authorized books
        cy.contains("It Ends With Us");
        cy.contains("Too Late");
    });

})