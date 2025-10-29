import Papa from 'papaparse';

Cypress.Commands.add('checkCodeMirrorValue', (parentElementSelector, expected) => {
  cy.get(`${parentElementSelector} .CodeMirror`).then((editor) => {
    const cm = editor[0].CodeMirror;
    expect(cm.getValue()).to.equal(expected);
  });
});

Cypress.Commands.add('setCodeMirrorValue', (parentElementSelector, value) => {
  cy.get(`${parentElementSelector} .CodeMirror`).click().then((editor) => {
    const cm = editor[0].CodeMirror;
    cm.setValue(value);
    cm.focus();
  });
});

Cypress.Commands.add('assertCsvRow', (filePath, expected) => {
  cy.readFile(filePath).then((content) => {
    const { data: rows, meta } = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
    });

    const csvColumns = meta.fields || [];
    const expectedColumns = Object.keys(expected);

    // required columns must exist
    const missingColumns = expectedColumns.filter(col => !csvColumns.includes(col));

    if (missingColumns.length > 0) {
      throw new Error(
        `CSV schema validation failed.\n` +
        `Missing column(s): ${missingColumns.join(', ')}\n` +
        `Available columns: ${csvColumns.join(', ')}`
      );
    }

    // check that a matching row exists
    const row = rows.find(r =>
      Object.entries(expected).every(([key, val]) => r[key] === val)
    );

    expect(
      row,
      `Expected CSV to contain a row matching ${JSON.stringify(expected)}`
    ).to.exist;
  });
});
