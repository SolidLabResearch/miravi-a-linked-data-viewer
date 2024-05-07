describe("Sources from index file", () => {

    it("Sources obtained only from sourcesIndex", () => {
        cy.visit("/");

        // Navigate to correct query
        cy.contains("General examples").click();
        cy.contains("Sources from an index file").click();

        // Check that it finished
        cy.contains("Finished in:");

        // Check that it indeed had 3 sources
        cy.get('.information-box').contains('Sources: 3');
      
        // Check if correct data is displayed
        cy.contains("http://www/example.com/data/component-c01");
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

        // Check that all 4 sources were used
        cy.get('.information-box').contains('Sources: 4');
      
        // Check if correct data is still displayed even if one source was unauthorized
        cy.contains("http://www/example.com/data/component-c01");
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

        // Check that the 4 sources were successfully merged
        cy.get('.information-box').contains('Sources: 4');
      
        // Check if correct data is still displayed even if one source was unauthorized and different sources were merged
        cy.contains("http://www/example.com/data/component-c01");
        cy.contains("Component 1");
        cy.contains("Material 1");
    });

});
