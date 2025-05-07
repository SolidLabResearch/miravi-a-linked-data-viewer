
describe("Templated query", () => {

  // Test to check if the query filters correctly 
  // and test that we can navigate through pages in the result table without having to fill in the query again
  it("With 1 variable", () => {

    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A templated query about musicians").click();

    // Fill in the query, select Baroque (7 existing artists -> perfect for this test)
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button').contains('Query').click();

    // Check the display of the variable(s) and their value
    cy.contains("genre: \"Baroque\"");

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.contains("of 7");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("not.exist");

    // check if the url is reflecting the new variable value
    cy.url().should("have.string", "genre=%22Baroque%22");

    // Set the Rows per page to 5 so that we can go to the next page
    cy.get('.MuiInputBase-root').click();
    cy.get('li').contains('5').click();
    
    // Navigate to page 2, and see if it contains the 6th artist
    cy.get('button').contains('2').click();
    cy.contains("6-7 of 7");
    cy.get('.column-name').find('span').contains("Antonio Caldara");

    // To be sure that the form is not appearing we test that the form submit button doesn't exist
    cy.get('form').should("not.exist");
  });

  it("With 1 variable, double expansion", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians (double results)").click();

    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Romantic').click();

    cy.get('button').contains('Query').click();
    cy.contains("Finished in:");
    cy.contains("1-2 of 2");
    cy.get('.column-name').find('span').should("have.length", 2);
  });

  it("With 2 variables; change variables", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A templated query about musicians (two variables)").click();

    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Classical').click();
    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Mozart').click();

    cy.get('button').contains('Query').click();

    // Check the display of the variable(s) and their value
    cy.contains("genre: \"Classical\"");
    cy.contains("sameAsUrl: <https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart>");

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

    // check if the url is reflecting the variable values
    cy.url().should("have.string", "genre=%22Classical%22");
    cy.url().should("have.string", "sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FWolfgang_Amadeus_Mozart%3E");

    // Check if the button to make a new query exists and use it
    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    // Making sure we get the form to enter new variables
    // and that the previously selected value(s) are still there
    cy.get('.ra-input-genre').find('input').should('have.value', '"Classical"');
    cy.get('.ra-input-sameAsUrl').find('input').should('have.value', '<https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart>');

    // Previously selected variables are still there; submit the same combination again
    cy.get('button[type="submit"]').click();

    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

    // check if the url is reflecting the variable values
    cy.url().should("have.string", "genre=%22Classical%22");
    cy.url().should("have.string", "sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FWolfgang_Amadeus_Mozart%3E");

    // Change variables and make a nonexisting combination
    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Baroque').click();

    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Beethoven').click();

    cy.get('button[type="submit"]').click();

    cy.get('span').contains("The result list is empty.").should("exist");

    // check if the url is reflecting the new variable values
    cy.url().should("have.string", "genre=%22Baroque%22");
    cy.url().should("have.string", "sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FLudwig_van_Beethoven%3E");

    // Change variables and make another existing combination
    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Romantic').click();

    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Schubert').click();

    cy.get('button[type="submit"]').click();

    cy.get('span').contains("The result list is empty.").should("not.exist");
    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Franz Schubert").should("exist");

    // check if the url is reflecting the new variable values
    cy.url().should("have.string", "genre=%22Romantic%22");
    cy.url().should("have.string", "sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FFranz_Schubert%3E");

  });

  it("Correct message displayed when no resulting data", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A templated query about musicians (two variables)").click();

    // Chose a genre
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Classical').click();

     // Pick the wrong url so we force an empty result
    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Bach').click();

    // Confirm this query
    cy.get('button').contains('Query').click();

    // Check that we see the correct message
    cy.get('span').contains("The result list is empty.").should("exist");
  });

  it("Able to change variables after having no results", () => {
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A templated query about musicians (two variables)").click();

    // Chose a genre
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Classical').click();

     // Pick the wrong url so we force an empty result
    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Bach').click();

    // Confirm this query
    cy.get('button').contains('Query').click();

    // Check that we see the correct message
    cy.get('span').contains("The result list is empty.").should("exist");

    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    // Making sure we get the form to enter new variables
    // and that the previously selected value(s) are still there
    cy.get('.ra-input-genre').find('input').should('have.value', '"Classical"');
    cy.get('.ra-input-sameAsUrl').find('input').should('have.value', '<https://en.wikipedia.org/wiki/Johann_Sebastian_Bach>');

  });

  it("Indirect with 1 variable", () => {

    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("A templated query about musicians (indirect variables)").click();

    // Fill in the form
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button').contains('Query').click();

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("exist");;
    cy.get('.column-name').find('span').contains("Marc-Antoine Charpentier").should("exist");;
    // Check that we don't see artists that don't belong here
    cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("not.exist");

  });

  it("Indirect with 2 variables", () => {

    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians, two variables (indirect variables)").click();

    // Fill in the form
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Classical').click();

    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Mozart').click();

    cy.get('button').contains('Query').click();

    // Check that it is correctly loaded with and only the correct data appears
    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

    cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("not.exist");
    cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("not.exist");

  });


  it("Indirect with 1 variable and sources from indexfile", () => {

    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("Component and materials - 1 variable (indirect source & indirect variables)").click();

    // Fill in the form
    cy.get('.ra-input-componentName').click();
    cy.get('li').contains('Component 1').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    // Check that it is correctly loaded with and only the correct data appears
    cy.contains("Finished in:");

    cy.get('.column-componentName').find('span').contains("Component 1").should("exist");
    cy.get('.column-materialName').find('span').contains("Material 2").should("exist");
    cy.get('.column-materialName').find('span').contains("Material 1").should("exist");

    cy.get('.column-componentName').find('span').contains("Component 2").should("not.exist");
    cy.get('.column-componentName').find('span').contains("Component 3").should("not.exist");
    cy.get('.column-materialName').find('span').contains("Material 6").should("not.exist");

  });

  it("Indirect with 2 variables and sources from indexfile", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("Component and materials - 2 variables (indirect source & indirect variables)").click();

    // Fill in the form
    cy.get('.ra-input-componentName').click();
    cy.get('li').contains('Component 1').click();

    cy.get('.ra-input-materialName').click();
    cy.get('li').contains('Material 2').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    // Check that it is correctly loaded with and only the correct data appears
    cy.contains("Finished in:");

    cy.get('.column-componentName').find('span').contains("Component 1").should("exist");
    cy.get('.column-materialName').find('span').contains("Material 2").should("exist");

    cy.get('.column-materialName').find('span').contains("Material 1").should("not.exist");
    cy.get('.column-componentName').find('span').contains("Component 2").should("not.exist");
    cy.get('.column-componentName').find('span').contains("Component 3").should("not.exist");
    cy.get('.column-materialName').find('span').contains("Material 6").should("not.exist");

  });

  it("Indirect with 1 variable but no sources available to get variables from", () => {

    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A templated query about musicians (indirect variables) - no sources").click();

    cy.contains("Error getting variable options...").should("exist");;
  });

  it("Indirect with 2 variables - variable values from url search parameters", () => {

    // a first url
    cy.visit("/#/9040?genre=%22Classical%22&sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FWolfgang_Amadeus_Mozart%3E");

    // Check the display of the variable(s) and their value
    cy.contains("genre: \"Classical\"");
    cy.contains("sameAsUrl: <https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart>");

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

    // Check if the button to make a new query exists and use it
    cy.get('button').contains("Change Variables").should("exist");
    cy.get('button').contains("Change Variables").click();

    // Making sure we get the form to enter new variables
    // and that the previously selected value(s) are still there
    cy.get('.ra-input-genre').find('input').should('have.value', '"Classical"');
    cy.get('.ra-input-sameAsUrl').find('input').should('have.value', '<https://en.wikipedia.org/wiki/Wolfgang_Amadeus_Mozart>');

    // Change variables and make another existing combination
    cy.get('.ra-input-genre').click();
    cy.get('li').contains('Baroque').click();

    cy.get('.ra-input-sameAsUrl').click();
    cy.get('li').contains('Bach').click();

    cy.get('button[type="submit"]').click();

    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("exist");

    // check if the url is reflecting the new variable values
    cy.url().should("have.string", "genre=%22Baroque%22");
    cy.url().should("have.string", "sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FJohann_Sebastian_Bach%3E");

    // a second url
    cy.visit("/#/9040?genre=%22Romantic%22&sameAsUrl=%3Chttps%3A%2F%2Fen.wikipedia.org%2Fwiki%2FFranz_Schubert%3E");

    // Check the display of the variable(s) and their value
    cy.contains("genre: \"Romantic\"");
    cy.contains("sameAsUrl: <https://en.wikipedia.org/wiki/Franz_Schubert>");

    // Check that the page loaded and that we can see the correct data
    cy.contains("Finished in:");
    cy.contains("1-1 of 1");
    cy.get('.column-name').find('span').contains("Franz Schubert").should("exist");;

  });

});
