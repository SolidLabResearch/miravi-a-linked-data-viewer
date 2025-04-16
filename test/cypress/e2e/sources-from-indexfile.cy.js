describe("Sources from index file", () => {

    it("Sources obtained only from sourcesIndex", () => {
        cy.visit("/");

        // Navigate to correct query
        cy.contains("Example queries").click();
        cy.contains("Sources from an index file").click();

        // Check that it finished
        cy.contains("Finished in:");

        // Check that it has the expected number of sources
        cy.get('.information-box').contains('Sources: 4');

        // Check if correct data is displayed
        cy.contains("https://www.example.com/data/component-c01");
        cy.contains("Component 1");
        cy.contains("Material 1");
    });

    it("Sources obtained only from sourcesIndex with extra unauthorized source, comunicaContext with lenient true successfully created ", () => {
        cy.visit("/");

        // Navigate to correct query
        cy.contains("For testing only").click();
        cy.contains("Components and their materials, with sources from index file also containing an unauthorized source").click();

        // Check that the query finished
        cy.contains("Finished in:");

        // Check that it has the expected number of sources
        cy.get('.information-box').contains('Sources: 5');

        // Check if correct data is still displayed even if one source was unauthorized
        cy.contains("https://www.example.com/data/component-c01");
        cy.contains("Component 1");
        cy.contains("Material 1");
    });

    it("Sources mixed from sourcesIndex and comunicaContext containing an extra unauthorized source", () => {
        cy.visit("/");

        // Navigate to correct query
        cy.contains("For testing only").click();
        cy.contains("Components and their materials, with mixed sources from comunicaContext and index file").click();

        // Check that the query finished
        cy.contains("Finished in:");

        // Check that it has the expected number of sources
        cy.get('.information-box').contains('Sources: 5');

        // Check if correct data is still displayed even if one source was unauthorized and different sources were merged
        cy.contains("https://www.example.com/data/component-c01");
        cy.contains("Component 1");
        cy.contains("Material 1");
    });


    it("Sources from an unauthorized source. Before and after log in.", () => {

        cy.visit("/");

        cy.intercept('GET', 'http://localhost:8080/example/index-example-texon-only-lt-AUTH').as('getRequest');

        // Navigate to correct query
        cy.contains("For testing only").click();
        cy.contains("Sources from an index file (requiring authentication)").click();

        // Wait for the request and assert the response
        cy.wait('@getRequest').then((interception) => {
            expect(interception.response.statusCode).to.equal(401);
        });


        cy.contains("https://www.example.com/data/component-c01").should("not.exist");
        cy.contains("Component 1").should("not.exist");
        cy.contains("Material 1").should("not.exist");

        //log in
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

        //now try again
        cy.contains("For testing only").click();
        cy.contains("Sources from an index file (requiring authentication)").click();

        cy.contains("https://www.example.com/data/component-c01").should("not.exist");
        cy.contains("Component 1").should("exist");
        cy.contains("Material 1").should("exist");
    })

    it("Sources obtained only from sourcesIndex, but no sources found", () => {
        cy.visit("/");

        // Navigate to correct query
        cy.contains("For testing only").click();
        cy.contains("Sources from an index file - no sources").click();

        // Check for the expected message
        cy.get('span').contains("The result list is empty (no sources found).").should("exist");

    });

});
