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
