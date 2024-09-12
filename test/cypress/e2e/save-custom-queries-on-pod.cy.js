describe("Saving custom queries on pods - logged out", () => {

    it("Interaction with pods should be disabled when logged out", () => {
        cy.visit("/#");

        cy.get('button').contains("Load All").should('be.disabled');
        cy.get('button').contains("Save All").should('be.disabled');

        cy.get('input[name="loadFrom"]').should('be.disabled');
        cy.get('input[name="saveTo"]').should('be.disabled');
    })
})

describe("Saving custom queries on pods - logged in", () => {

    beforeEach(() => {
        // Log in before each individual test
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

        cy.url().should("eq", "http://localhost:5173/");

        cy.visit("/#");
    });

    it("Trying to save with no queries gives the right remark", () => {

        // You have no custom queries.
        cy.get('button').contains("Save All").click();
        cy.contains("You have no custom queries.").should("exist");

    })

    it("Make a custom query and upload it", () => {

        //make a new query
        cy.visit("/#/customQuery");

        cy.get('input[name="name"]').type("new query");
        cy.get('textarea[name="description"]').type("new description");
    
        cy.get('textarea[name="queryString"]').clear();
        cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/> 
    
    SELECT * WHERE {
        ?list schema:name ?listTitle;
          schema:itemListElement [
          schema:name ?bookTitle;
          schema:creator [
            schema:name ?authorName
          ]
        ].
    }`);
        cy.get('input[name="source"]').type("http://localhost:8080/example/wish-list");
        cy.get('button[type="submit"]').click();

        cy.visit("/#");

        cy.contains("new query").should("exist");

        cy.get('input[name="saveTo"]').clear();
        cy.get('input[name="saveTo"]').type('http://localhost:8080/example/testFolder/customQueriesTest/myQueriesTests.json');

        // You have no custom queries.
        cy.get('button').contains("Save All").click();
        cy.contains("Successfully saved you queries on the pod!").should("exist");

    })

    it("Load the previously made query from the pod", () => {

        cy.contains("new query").should("not.exist");

        cy.get('input[name="loadFrom"]').clear();
        cy.get('input[name="loadFrom"]').type('http://localhost:8080/example/testFolder/customQueriesTest/myQueriesTests.json');


        cy.get('button').contains("Load All").click();
        cy.get('button[type="submit"]').contains("Load queries").click();

        cy.contains("new query").should("exist");
        cy.contains("new query").click();

        //check if the query works
        cy.contains("Colleen Hoover").should('exist');

    })

})