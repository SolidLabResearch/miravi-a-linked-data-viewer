describe("Column header", () => {
  it("One link to ontology", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A query that looks for names that are the object of predicate schema:name").click();
    cy.contains("Finished in:");
    cy.get('th').contains("name").parent().within(() => {
      cy.get('a[href="http://schema.org/name"]');
    });
  });

  it("Two links to ontology", () => {
    cy.visit("/");
    cy.contains("For testing only").click();
    cy.contains("A query that looks for names that are both the objects of predicates schema:name and rdfs:label").click();
    cy.contains("Finished in:");
    cy.get('th').contains("name").parent().within(() => {
      cy.get('a[href="http://schema.org/name"]');
      cy.get('a[href="http://www.w3.org/2000/01/rdf-schema#label"]');
    });
  });

});
