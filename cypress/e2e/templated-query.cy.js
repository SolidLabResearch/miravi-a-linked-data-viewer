
describe("Templated query", () => {

  // Test to check if the query filters correctly 
  // and test that we can navigate through pages in the result table without having to fill in the query again
  it("With 1 variable", () => {

    cy.visit("/");
    cy.contains("General examples").click();
    cy.contains("A templated query about musicians").click();

    // Fill in the query, select Baroque (7 existant artists -> perfect for this test)
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button').contains('Query').click();

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach");
    cy.get('.column-name').find('span').contains("Marc-Antoine Charpentier");
    // Check that we don't see artists that don't belong here
    cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("not.exist");

    // Set the Rows per page to 5 so that we can go to the next page
    cy.get('.MuiInputBase-root').click();
    cy.get('li').contains('5').click();
    
    // Navigate to page 2, and see if it contains the 6th artist
    cy.get('button').contains('2').click();
    cy.get('.column-name').find('span').contains("Antonio Caldara");

    // To be sure that the form is not appearing we test that the form submit button doesn't exist
    cy.get('form').should("not.exist");
          // cy.get('button').contains('Query').should("not.exist");  -> useless if we add a 'new query' button
  });

  it("With 2 variables", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians, two variables").click();

    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Classical').click();
    cy.get('form').within(() => {
      cy.get('#sameAsUrl').click();
    });
    cy.get('li').contains('Mozart').click();

    cy.get('button').contains('Query').click();
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart");
  });

  it("Able to change variables after making a templated query", () => {
    cy.visit("/");
    cy.contains("General examples").click();
    cy.contains("A templated query about musicians").click();

    // Fill in the query
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button').contains('Query').click();

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach");

    // Check if the button to make a new query exists and use it
    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    // Making sure we get the form to enter new variables
    cy.get('form').within(() => {
      cy.get('#genre').should("exist");
    });
  });

  it("Correct message displayed when no resulting data", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians, two variables").click();

    // Chose a genre
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Classical').click();

     // Pick the wrong url so we force an empty result
    cy.get('form').within(() => {
      cy.get('#sameAsUrl').click();
    });
    cy.get('li').contains('Bach').click();

    // Confirm this query
    cy.get('button').contains('Query').click();

    // Check that we see the correct message
    cy.get('span').contains("The result list is empty.").should("exist");
  });

  it("Able to change variables after having no results", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians, two variables").click();

    // Chose a genre
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Classical').click();

     // Pick the wrong url so we force an empty result
    cy.get('form').within(() => {
      cy.get('#sameAsUrl').click();
    });
    cy.get('li').contains('Bach').click();

    // Confirm this query
    cy.get('button').contains('Query').click();

    // Check that we see the correct message
    cy.get('span').contains("The result list is empty.").should("exist");

    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    // Making sure we get the form to enter new variables
    cy.get('form').within(() => {
      cy.get('#genre').should("exist");
    });

  });

});
