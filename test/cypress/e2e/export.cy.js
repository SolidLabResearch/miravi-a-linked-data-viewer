describe("Export", () => {
  it("Export of a list containing a Literal and a NamedNode should return the expected results", () => {
    const downloadsFolder = Cypress.config('downloadsFolder');
    cy.task('clearFolder', downloadsFolder);
    cy.visit("/");
    cy.contains("Example queries").click();
    cy.contains("Some images").click();
    cy.contains("Finished in:");
    cy.get('.action-box').contains('Export').click();

    cy.task('findYoungestFileWithExtension', { folder: downloadsFolder, extension: '.csv' }).then((filename) => {
      cy.assertCsvRow(`${downloadsFolder}/${filename}`, {
        'name.termType': 'Literal',
        'name.value': 'Felix',
        'name.language': '',
        'name.datatype.value': 'http://www.w3.org/2001/XMLSchema#string',
        'image_img.termType': 'NamedNode',
        'image_img.value': 'http://localhost:8080/example/images/felix.jfif',
      });
      cy.assertCsvRow(`${downloadsFolder}/${filename}`, {
        'name.termType': 'Literal',
        'name.value': 'Garfield',
        'name.language': '',
        'name.datatype.value': 'http://www.w3.org/2001/XMLSchema#string',
        'image_img.termType': 'NamedNode',
        'image_img.value': 'http://localhost:8080/example/images/cat.jfif',
      });
    });    
  });
});
