describe("query location tests", () => {

    // Errors with the correct message should be thrown
    it("queryLocation that does not end on rq", () => {
        cy.visit("/");
        cy.contains("For testing only").click();
        cy.contains("Average value - queryLocation without rq").click();

        cy.contains("Invalid query location.").should("exist");
      });

      it("wrong queryLocation that does not exist, correct file ending", () => {
        cy.visit("/");
        cy.contains("For testing only").click();
        cy.contains("Average value - unexisting queryLocation (ends in .rq)").click();

        cy.contains("Empty query text. Check your query and location.").should("exist");
      });
  });
  