describe("Indirect variable query", () => {

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

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
                in: '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>',
                out: 'true'
            },
            {
                in: '"1"^^<http://www.w3.org/2001/XMLSchema#integer>',
                out: '1'
            },
            {
                in: '"1.3"^^<http://www.w3.org/2001/XMLSchema#decimal>',
                out: '1.3'
            },
            {
                in: '"1.5E6"^^<http://www.w3.org/2001/XMLSchema#double>',
                out: '1.5E6'
            },
            {
                in: '"This is a string containing some \\"double quotes\\""',
                out: 'This is a string containing some "double quotes"'
            }
        ];

        for (const t of testdata) {
            cy.visit("/");
            cy.contains("For testing only").click();
            cy.contains("Triples with object, objects of different types").click();

            // Fill in the form
            cy.get('.ra-input-object').click();
            // RegExp: to have an exact match - see https://stackoverflow.com/questions/56443963/click-an-exact-match-text-in-cypress
            cy.get('li').contains(new RegExp(`^${escapeRegex(t.in)}$`, "g")).click();

            // Comfirm query
            cy.get('button').contains('Query').click();

            // Check that the page loaded and that we can see the correct data
            cy.contains("Finished in:");
            cy.contains("1-1 of 1");
            cy.get('.column-object').find('span').contains(new RegExp("^" + t.out + "$", "g")).should("exist");;
        }
    });

});



