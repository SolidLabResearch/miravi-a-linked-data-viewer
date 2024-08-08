describe("Customize existing query", () => {

    it("simple query", () => {
        cy.visit("/");
        cy.contains("General examples").click();
        cy.contains("A public list of books I'd love to own").click();

        cy.get('button').contains("Customize").click();

        cy.url().should('include', 'customQuery');


        cy.get('input[name="name"]').should('have.value', "(Derived from) A public list of books I'd love to own");

        cy.get('textarea[name="queryString"]').should('have.value', `PREFIX schema: <http://schema.org/> 

SELECT * WHERE {
    ?list schema:name ?listTitle;
      schema:itemListElement [
      schema:name ?bookTitle;
      schema:creator [
        schema:name ?authorName
      ]
    ].
}`);
        cy.get('input[name="source"]').should('have.value', "http://localhost:8080/example/wish-list");

    })

    it("templated query - fixed variables", () => {
        cy.visit("/");
        cy.contains("General examples").click();
        cy.contains("A templated query about musicians").click();

        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Baroque').click();

        cy.get('button[type="submit"]').click();

        cy.get('button').contains("Customize").click();
        cy.url().should('include', 'customQuery');

        cy.get('input[name="name"]').should('have.value', "(Derived from) A templated query about musicians");

        cy.get('textarea[name="queryString"]').should('have.value', `PREFIX schema: <http://schema.org/>

SELECT ?name ?sameAs_url WHERE {
  ?list schema:name ?listTitle;
    schema:name ?name;
    schema:genre $genre;
    schema:sameAs ?sameAs_url;
}`);

        cy.get('textarea[name="variables"]').should('have.value', `{"genre":["\\"Romantic\\"","\\"Baroque\\"","\\"Classical\\""]}`)





    })

    it("templated query - indirect variables", () => {

        cy.visit("/");
        cy.contains("For testing only").click();
        cy.contains("A templated query about musicians, two variables (indirect variables)").click();

        cy.get('form').within(() => {
            cy.get('#genre').click();
        });
        cy.get('li').contains('Baroque').click();

        cy.get('form').within(() => {
            cy.get('#sameAsUrl').click();
        });
        cy.get('li').contains('Vivaldi').click();

        cy.get('button[type="submit"]').click();

        cy.get('button').contains("Customize").click();
        cy.url().should('include', 'customQuery');

        cy.get('input[name="name"]').should('have.value', "(Derived from) A templated query about musicians, two variables (indirect variables)");

        cy.get('textarea[name="queryString"]').should('have.value', `PREFIX schema: <http://schema.org/>

SELECT ?name WHERE {
  ?list schema:name ?listTitle;
    schema:name ?name;
    schema:genre $genre;
    schema:sameAs $sameAsUrl;
}
`);

        cy.get('textarea[name="indirectQuery1"]').should('have.value', `PREFIX schema: <http://schema.org/> 

SELECT DISTINCT ?genre
WHERE {
  ?list schema:genre ?genre
}
ORDER BY ?genre
`);

        cy.get('textarea[name="indirectQuery2"]').should('have.value', `PREFIX schema: <http://schema.org/> 

SELECT DISTINCT ?sameAsUrl
WHERE { 
  ?list schema:sameAs ?sameAsUrl
}
ORDER BY ?sameAsUrl
`);




    })

    it("index file", () => {
        cy.visit("/");
        cy.contains("General examples").click();
        cy.contains("Sources from an index file").click();

        cy.get('button').contains("Customize").click({force:true}); // Button is out of FoV so we gotta force the click

        cy.url().should('include', 'customQuery');


        cy.get('input[name="name"]').should('have.value', "(Derived from) Sources from an index file");

        cy.get('textarea[name="queryString"]').should('have.value', `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT ?component ?componentName ?material ?materialName ?percentage
WHERE {
  ?component
    a o:Component ;
    o:name ?componentName ;
    o:has-component-bom [
      o:has-component-material-assoc [
        o:percentage ?percentage ;
        o:has-material ?material ;
      ];
    ];
  .
  ?material o:name ?materialName ;
}
ORDER BY ?componentName
`);

        cy.get('input[name="indexSourceUrl"]').should('have.value', `http://localhost:8080/example/index-example-texon-only`)
        cy.get('textarea[name="indexSourceQuery"]').should('have.value', `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX example: <http://localhost:8080/example/index-example-texon-only#>

SELECT ?object
WHERE {
  example:index-example rdfs:seeAlso ?object .
}
`)

    })


})