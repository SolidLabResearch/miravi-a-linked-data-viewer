
describe("Custom Query Editor tests", () => {

  it("Create a new query", () => {

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


    // Checking if the book query works
    cy.contains("Colleen Hoover").should('exist');
  });

  it("Create a new query, with multiple sources", () => {

    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("material query");
    cy.get('textarea[name="description"]').type("this query has 3 sources");

    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`# Query Texon's components
# Datasources: https://css5.onto-deside.ilabt.imec.be/texon/data/dt/out/components.ttl

PREFIX oo: <http://purl.org/openorg/>
PREFIX ao: <http://purl.org/ontology/ao/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX d: <https://www.example.com/data/>
PREFIX o: <https://www.example.com/ont/>

SELECT DISTINCT ?component ?componentName ?recycledContentPercentage
WHERE {
	?component
		a o:Component ;
		o:name ?componentName ;
	  o:recycled-content-percentage ?recycledContentPercentage ;
		.
}
ORDER BY ?componentName
`);
    cy.get('input[name="source"]').type("http://localhost:8080/verifiable-example/components-vc ; http://localhost:8080/verifiable-example/components-vc-incorrect-proof ; http://localhost:8080/example/components");
    cy.get('button[type="submit"]').click();

    // Checking if the query works
    cy.contains("https://www.example.com/data/component-c01").should('exist');
  });

  it("Check if all possible parameters are filled in with parameterized URL", () => {

    //templatedQueryCheck
    // Navigate to the URL of a saved query with completely filled-in form
    cy.visit("/#/customQuery?name=Query+Name&description=Query+Description&queryString=Sparql+query+text&comunicaContextCheck=on&source=The+Comunica+Source&comunicaContext=%7B%22Advanced+Comunica+Context%22%3Atrue%7D&sourceIndexCheck=on&indexSourceUrl=Index+Source&indexSourceQuery=Index+Query+&askQueryCheck=on&askQuery=%7B%22trueText%22%3A%22+filled+in%22%2C%22falseText%22%3A%22not+filled+in%22%7D&directVariablesCheck=on&variables=%7B%22firstvariables%22%3A%5B%22only+one%22%5D%7D")

    // Verify that every field is correctly filled-in
    cy.get('input[name="name"]').should('have.value', 'Query Name');
    cy.get('textarea[name="description"]').should('have.value', 'Query Description');
    cy.get('textarea[name="queryString"]').should('have.value', 'Sparql query text');

    cy.get('input[name="source"]').should('have.value', "The Comunica Source");
    cy.get('textarea[name="comunicaContext"]').should('have.value', `{"Advanced Comunica Context":true}`);

    cy.get('input[name="indexSourceUrl"]').should('have.value', "Index Source");
    cy.get('textarea[name="indexSourceQuery"]').should('have.value', "Index Query ");

    cy.get('textarea[name="askQuery"]').should('have.value', `{"trueText":" filled in","falseText":"not filled in"}`);

    cy.get('textarea[name="variables"]').should('have.value', `{"firstvariables":["only one"]}`);

  })

  it("Successfully edit a query to make it work", () => {

    cy.visit("/#/customQuery");

    // First create a wrong query
    cy.get('input[name="name"]').type("broken query");
    cy.get('textarea[name="description"]').type("just a description");

    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type("this is faultive querytext")

    cy.get('input[name="source"]').type("http://localhost:8080/example/wish-list");

    //Submit the faultive query
    cy.get('button[type="submit"]').click();

    cy.contains("Custom queries").click();
    cy.contains("broken query").click();

    // Verify that there are no results
    cy.contains("Something went wrong").should('exist');

    // Edit the query
    cy.get('button').contains("Edit Query").click();

    // Give the query a new name and a correct query text
    cy.get('input[name="name"]').clear();
    cy.get('input[name="name"]').type("Fixed query");

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

    // Submit the correct query
    cy.get('button[type="submit"]').click();

    // Now we should be on the page of the fixed query
    cy.contains("Fixed query").should('exist');

    // Check if the resulting list appears
    cy.contains("Colleen Hoover").should('exist');

  })

  it("Shares the correct URL", () => {

    cy.visit("/#/customQuery");

    // First create a simple query
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

    cy.get('button').contains("Share Query").click();

    cy.get('textarea[name="queryURL"]').invoke('val').then((val) => {
      expect(val).to.equal(Cypress.config('baseUrl') + '#/customQuery?name=new+query&description=new+description&queryString=PREFIX+schema%3A+%3Chttp%3A%2F%2Fschema.org%2F%3E+%0ASELECT+*+WHERE+%7B%0A++++%3Flist+schema%3Aname+%3FlistTitle%3B%0A++++++schema%3AitemListElement+%5B%0A++++++schema%3Aname+%3FbookTitle%3B%0A++++++schema%3Acreator+%5B%0A++++++++schema%3Aname+%3FauthorName%0A++++++%5D%0A++++%5D.%0A%7D&source=http%3A%2F%2Flocalhost%3A8080%2Fexample%2Fwish-list');
    });


  })

  it("Custom templated query", () => {

    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom template");
    cy.get('textarea[name="description"]').type("description for template");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
SELECT ?name ?sameAs_url WHERE {
  ?list schema:name ?listTitle;
    schema:name ?name;
    schema:genre $genre;
    schema:sameAs ?sameAs_url;
}`
    );

    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");
    cy.get('input[name="directVariablesCheck"]').click()

    cy.get('textarea[name="variables"]').clear()
    cy.get('textarea[name="variables"]').type(`{
        "genre": [
          "\\"Romantic\\"",
          "\\"Baroque\\"",
          "\\"Classical\\""
        ]
    }`)
    cy.get('button[type="submit"]').click();


    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    cy.get('.column-name').find('span').contains("Antonio Caldara").should('exist');
  })

  it("Custom Query With Index File", () => {

    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom with index file");
    cy.get('textarea[name="description"]').type("description for index");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`# Query Texon's components and their materials
# Datasources: https://css5.onto-deside.ilabt.imec.be/texon/data/dt/out/components.ttl https://css5.onto-deside.ilabt.imec.be/texon/data/dt/out/boms.ttl https://css5.onto-deside.ilabt.imec.be/texon/data/dt/out/materials.ttl

PREFIX oo: <http://purl.org/openorg/>
PREFIX ao: <http://purl.org/ontology/ao/core#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX d: <https://www.example.com/data/>
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
ORDER BY ?componentName`
    );

    // No Comunica Sources Required
    cy.get('input[name="sourceIndexCheck"]').click()
    cy.get('input[name="indexSourceUrl"]').type("http://localhost:8080/example/index-example-texon-only")

    cy.get('textarea[name="indexSourceQuery"]').clear();
    cy.get('textarea[name="indexSourceQuery"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX example: <http://localhost:8080/example/index-example-texon-only#>

SELECT ?object
WHERE {
  example:index-example rdfs:seeAlso ?object .
}`
    )
    cy.get('button[type="submit"]').click();

    cy.contains("https://www.example.com/data/component-c01").should('exist');

  })



  it("Make a templated query, then edit it to make it a normal query", () => {

    // First create the query
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom template");
    cy.get('textarea[name="description"]').type("description for template");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
      SELECT ?name ?sameAs_url WHERE {
        ?list schema:name ?listTitle;
          schema:name ?name;
          schema:genre $genre;
          schema:sameAs ?sameAs_url;
      }`
    );

    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");
    cy.get('input[name="directVariablesCheck"]').click()

    cy.get('textarea[name="variables"]').clear()
    cy.get('textarea[name="variables"]').type(`{
          "genre": [
            "\\"Romantic\\"",
            "\\"Baroque\\"",
            "\\"Classical\\""
          ]
      }`)
    cy.get('button[type="submit"]').click();


    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    cy.get('.column-name').find('span').contains("Antonio Caldara").should('exist');

    // Now that this templated one works, lets edit it to make a normal query from it
    cy.get('button').contains("Edit Query").click();

    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
  SELECT ?name ?genre ?sameAs_url WHERE {
    ?list schema:name ?listTitle;
      schema:name ?name;
      schema:genre ?genre;
      schema:sameAs ?sameAs_url;
  }`
    );

    // Remove the templated options
    cy.get('input[name="directVariablesCheck"]').click()

    cy.get('button[type="submit"]').click();

    cy.get('form').should('not.exist')

    cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should('exist');
  })

  // Reverse logic

  it("Make a normal query, then edit it to make it a templated query", () => {

    // First create the query
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom template");
    cy.get('textarea[name="description"]').type("description for template");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
      SELECT ?name ?genre ?sameAs_url WHERE {
        ?list schema:name ?listTitle;
          schema:name ?name;
          schema:genre ?genre;
          schema:sameAs ?sameAs_url;
      }`
    );

    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");

    cy.get('button[type="submit"]').click();

    cy.get('form').should('not.exist')

    cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should('exist');




    // Now that this normal one works, lets edit it to make a templated query from it
    cy.get('button').contains("Edit Query").click();

    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
  SELECT ?name ?sameAs_url WHERE {
    ?list schema:name ?listTitle;
      schema:name ?name;
      schema:genre $genre;
      schema:sameAs ?sameAs_url;
  }`
    );

    cy.get('input[name="directVariablesCheck"]').click()

    cy.get('textarea[name="variables"]').clear()
    cy.get('textarea[name="variables"]').type(`{
          "genre": [
            "\\"Romantic\\"",
            "\\"Baroque\\"",
            "\\"Classical\\""
          ]
      }`)

    cy.get('button[type="submit"]').click();


    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    cy.get('.column-name').find('span').contains("Antonio Caldara").should('exist');
  })

  it("Custom templated query with 1 indirect variable", () => {

    // Create the indirect variable
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom indirect template");
    cy.get('textarea[name="description"]').type("description for an indirect templated query");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
SELECT ?name ?sameAs_url WHERE {
?list schema:name ?listTitle;
schema:name ?name;
schema:genre $genre;
schema:sameAs ?sameAs_url;
}`
    );

    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");
    cy.get('input[name="indirectVariablesCheck"]').click()

    cy.get('textarea[name="indirectQuery1"]').clear()
    cy.get('textarea[name="indirectQuery1"]').type("PREFIX schema: <http://schema.org/> SELECT DISTINCT ?genre WHERE { ?list schema:genre ?genre; }", { parseSpecialCharSequences: false })
    cy.get('button[type="submit"]').click();


    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    // Comfirm query
    cy.get('button[type="submit"]').click();

    cy.get('.column-name').find('span').contains("Antonio Caldara").should('exist');
    cy.get('.column-name').find('span').contains("Pietro Locatelli").should('exist');

    cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");
    cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("not.exist");


  });

  it("Custom templated query with 2 indirect variables", () => {

    // Create the indirect variable
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom indirect template 2");
    cy.get('textarea[name="description"]').type("description for an indirect templated query 2");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
SELECT ?name WHERE {
?list schema:name ?listTitle;
schema:name ?name;
schema:genre $genre;
schema:sameAs $sameAsUrl;
}`
    );

    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");
    cy.get('input[name="indirectVariablesCheck"]').click()

    cy.get('textarea[name="indirectQuery1"]').clear()
    cy.get('textarea[name="indirectQuery1"]').type("PREFIX schema: <http://schema.org/> SELECT DISTINCT ?genre WHERE { ?list schema:genre ?genre; }", { parseSpecialCharSequences: false })
    cy.get('button').contains("Add another query").click();
    cy.get('textarea[name="indirectQuery2"]').clear()
    cy.get('textarea[name="indirectQuery2"]').type("PREFIX schema: <http://schema.org/> SELECT DISTINCT ?sameAsUrl WHERE { ?list schema:sameAs ?sameAsUrl; }", { parseSpecialCharSequences: false })

    cy.get('button[type="submit"]').click();
    // Run some testcases now


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
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("exist");

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

  it("Make a custom templated query with 1 indirect variable and edit into a query with 2 indirect variables", () => {


    // Create a custom query with one variable
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom indirect template");
    cy.get('textarea[name="description"]').type("description for an indirect templated query");
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
SELECT ?name ?sameAs_url WHERE {
?list schema:name ?listTitle;
schema:name ?name;
schema:genre $genre;
schema:sameAs ?sameAs_url;
}`);
    cy.get('input[name="source"]').type("http://localhost:8080/example/favourite-musicians");
    cy.get('input[name="indirectVariablesCheck"]').click()

    cy.get('textarea[name="indirectQuery1"]').clear()
    cy.get('textarea[name="indirectQuery1"]').type("PREFIX schema: <http://schema.org/> SELECT DISTINCT ?genre WHERE { ?list schema:genre ?genre; }", { parseSpecialCharSequences: false })
    cy.get('button[type="submit"]').click();


    // Check if the query works
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Baroque').click();

    cy.get('button[type="submit"]').click();

    cy.get('.column-name').find('span').contains("Antonio Caldara").should('exist');
    cy.get('.column-name').find('span').contains("Franz Schubert").should("not.exist");


    // Now edit the query into one with 2 variables

    cy.get('button').contains("Edit Query").click();

    // Check if the values are correctly filled in
    cy.get('input[name="name"]').should('have.value', 'custom indirect template');

    // Now change the query
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX schema: <http://schema.org/>
SELECT ?name WHERE {
?list schema:name ?listTitle;
schema:name ?name;
schema:genre $genre;
schema:sameAs $sameAsUrl;
}`
    );
    // add source for the second variable
    cy.get('button').contains("Add another query").click();
    cy.get('textarea[name="indirectQuery2"]').clear()
    cy.get('textarea[name="indirectQuery2"]').type("PREFIX schema: <http://schema.org/> SELECT DISTINCT ?sameAsUrl WHERE { ?list schema:sameAs ?sameAsUrl; }", { parseSpecialCharSequences: false })


    // The changes are done, now submit it
    cy.get('button[type="submit"]').click();

    // Try an existing combination
    cy.get('form').within(() => {
      cy.get('#genre').click();
    });
    cy.get('li').contains('Classical').click();

    cy.get('form').within(() => {
      cy.get('#sameAsUrl').click();
    });
    cy.get('li').contains('Beethoven').click();

    cy.get('button[type="submit"]').click();

    cy.contains("Finished in:");
    cy.get('.column-name').find('span').contains("Ludwig van Beethoven").should("exist");
    cy.get('.column-name').find('span').contains("Wolfgang Amadeus Mozart").should("not.exist");

  });

  it("Custom templated query with 1 indirect variable and sources from an index file", () => {

    // Create the indirect variable
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom indirect template with index");
    cy.get('textarea[name="description"]').type("description for an indirect templated query and index sources");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT ?componentName ?materialName ?percentage ?component  ?material
WHERE {
  {
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
    ?material o:name ?materialName
  }
  FILTER(?componentName = $componentName)
}
ORDER BY ?componentName`);


    cy.get('input[name="sourceIndexCheck"]').click()
    cy.get('input[name="indexSourceUrl"]').type("http://localhost:8080/example/index-example-texon-only")

    cy.get('textarea[name="indexSourceQuery"]').clear();
    cy.get('textarea[name="indexSourceQuery"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX example: <http://localhost:8080/example/index-example-texon-only#>

SELECT ?object
WHERE {
  example:index-example rdfs:seeAlso ?object .
}`);



    cy.get('input[name="indirectVariablesCheck"]').click()

    cy.get('textarea[name="indirectQuery1"]').clear()
    cy.get('textarea[name="indirectQuery1"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT DISTINCT ?componentName
WHERE {
  ?component
    o:name ?componentName ;
	o:has-component-bom ?bom
}
ORDER BY ?componentName`)


    cy.get('button[type="submit"]').click();

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

  it("Custom templated query with 2 indirect variables and sources from an index file", () => {

    // Create the indirect variable
    cy.visit("/#/customQuery");

    cy.get('input[name="name"]').type("custom indirect template with index");
    cy.get('textarea[name="description"]').type("description for an indirect templated query and index sources");

    // Query handling a variable
    cy.get('textarea[name="queryString"]').clear();
    cy.get('textarea[name="queryString"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT ?component ?componentName ?material ?materialName ?percentage
WHERE {
  {
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
    ?material o:name ?materialName
  }
  FILTER(?componentName = $componentName && ?materialName = $materialName)
}
ORDER BY ?componentName
`);


    cy.get('input[name="sourceIndexCheck"]').click()
    cy.get('input[name="indexSourceUrl"]').type("http://localhost:8080/example/index-example-texon-only")

    cy.get('textarea[name="indexSourceQuery"]').clear();
    cy.get('textarea[name="indexSourceQuery"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX example: <http://localhost:8080/example/index-example-texon-only#>

SELECT ?object
WHERE {
  example:index-example rdfs:seeAlso ?object .
}`);



    cy.get('input[name="indirectVariablesCheck"]').click()

    cy.get('textarea[name="indirectQuery1"]').clear()
    cy.get('textarea[name="indirectQuery1"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT DISTINCT ?componentName
WHERE {
  ?component
    o:name ?componentName ;
	o:has-component-bom ?bom
}
ORDER BY ?componentName`)

    cy.get('button').contains("Add another query").click();

    cy.get('textarea[name="indirectQuery2"]').clear()
    cy.get('textarea[name="indirectQuery2"]').type(`PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX o: <https://www.example.com/ont/>

SELECT DISTINCT ?materialName
WHERE {
  ?componentMaterialAssoc o:has-material [
    o:name ?materialName
  ]
}
ORDER BY ?materialName`)


    cy.get('button[type="submit"]').click();

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

})