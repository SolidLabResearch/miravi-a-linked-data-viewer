Cypress.on('uncaught:exception', (err, runnable) => {
  // this error may appear in tests that try to access resources that need authentication
  if (err.message.includes('UnauthorizedHttpError')) {
    return false;
  }
  
  // this harmless error suddenly appears with versions "@mui/icons-material": "5.16.7", "@mui/material": "5.16.7"
  if (err.message.includes('ResizeObserver loop completed with undelivered notifications.')) {
    return false;
  }

  // other uncaught exceptions cause test to fail
  return true;
});

