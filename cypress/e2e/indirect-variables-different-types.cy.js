describe("Indirect variable query", () => {

    it("Indirect with 1 variable (different types)", () => {

        const testdata = [
            {
                in: '<https://www.example.com/data/o1>',
                out: 'https://www.example.com/data/o1'
            },
            {
                in: '"Ceci est une chaîne de charactères en français"@fr',
                out: 'Ceci est une chaîne de charactères en français'
            },
            {
                in: '"This is a string in English"@en',
                out: 'This is a string in English'
            },
            {
                in: 'true',
                out: 'true'
            },
            {
                in: '1',
                out: '1'
            },
            {
                in: '1.3',
                out: '1.3'
            },
            {
                in: '1.5E6',
                out: '1.5E6'
            },
            {
                in: '"This is a string containing some \\\\"double quotes\\\\""',
                out: 'This is a string containing some "double quotes"'
            }
        ];

        for (const t of testdata) {
            cy.visit("/");
            cy.contains("For testing only").click();
            cy.contains("Triples with object, objects of different types").click();

            // Fill in the form
            cy.get('form').within(() => {
                cy.get('#object').click();
            });
            // RegExp: to have an exact match - see https://stackoverflow.com/questions/56443963/click-an-exact-match-text-in-cypress
            cy.get('li').contains(new RegExp("^" + t.in + "$", "g")).click();

            // Comfirm query
            cy.get('button').contains('Query').click();

            // Check that the page loaded and that we can see the correct data
            cy.contains("Finished in:");
            cy.contains("1-1 of 1");
            cy.get('.column-object').find('span').contains(new RegExp("^" + t.out + "$", "g")).should("exist");;
        }
    });

});



