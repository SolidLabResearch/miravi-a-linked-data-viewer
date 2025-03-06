describe("Indirect variable query", () => {

    it("Indirect with 1 variable", () => {

        cy.visit("/");
        cy.contains("Example queries").click();
        cy.contains("A templated query about musicians (indirect variables)").click();

        // Fill in the form
        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
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
        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Classical').click();

        cy.get('form').within(() => {
            cy.get('#sameAsUrl').click();
        });
        cy.get('li').contains('Mozart').click();

        cy.get('button').contains('Query').click();

        // Check that it is correctly loaded with and only the correct data appears
        cy.contains("Finished in:");
        cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

        cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
        cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("not.exist");
        cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("not.exist");

        // Run some testcases now

        cy.get('button').contains("Change Variables").should("exist");
        cy.get('button').contains("Change Variables").click();

        // Existing combination (only Mozart)
        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Classical').click();

        cy.get('form').within(() => {
            cy.get('#sameAsUrl').click();
        });
        cy.get('li').contains('Mozart').click();

        cy.get('button[type="submit"]').click();


        cy.contains("Finished in:");
        cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");;

        cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
        cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("not.exist");
        cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("not.exist");

        // Change variables and make an unexisting combination
        cy.get('button').contains("Change Variables").should("exist");
        cy.get('button').contains("Change Variables").click();

        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Baroque').click();

        cy.get('form').within(() => {
            cy.get('#sameAsUrl').click();
        });
        cy.get('li').contains('Beethoven').click();

        cy.get('button[type="submit"]').click();

        cy.get('span').contains("The result list is empty.").should("exist");



        // Change variables and make another existing combination

        cy.get('button').contains("Change Variables").should("exist");
        cy.get('button').contains("Change Variables").click();

        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Romantic').click();

        cy.get('form').within(() => {
            cy.get('#sameAsUrl').click();
        });
        cy.get('li').contains('Schubert').click();

        cy.get('button[type="submit"]').click();

        cy.get('span').contains("The result list is empty.").should("not.exist");
        cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("not.exist");
        cy.get('.column-name').find('span').contains("Johann Sebastian Bach").should("not.exist");
        cy.get('.column-name').find('span').contains("Antonio Vivaldi").should("not.exist");
        cy.get('.column-name').find('span').contains("Franz Schubert").should("exist");

    });


    it("Indirect with 1 variable and sources from indexfile", () => {

        cy.visit("/");
        cy.contains("For testing only").click();
        cy.contains("Component and materials - 1 variable (indirect source & indirect variables)").click();

        // Fill in the form
        cy.get('form').within(() => {
            cy.get('#componentName').click();
        });
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
        cy.get('form').within(() => {
            cy.get('#componentName').click();
        });
        cy.get('li').contains('Component 1').click();

        cy.get('form').within(() => {
            cy.get('#materialName').click();
        });
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

});



