import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { QueryEngine } from "@comunica/query-sparql";
import QueryResultList from "../../ListResultTable/QueryResultList/QueryResultList"
import ListResultTable from '../../ListResultTable/ListResultTable';

const myEngine = new QueryEngine();

export default function CustomEditor() {

  const [openEditor, setOpenEditor] = useState(false);
  const [customQueryData, setCustomQueryData] = useState(null)
  const [showError, setShowError] = useState(false)
  

  const closeEditor = () => {
    setOpenEditor(false);
    setShowError(false);
  }

  return (
    <React.Fragment>
      <Button variant="contained" onClick={
        () => { setOpenEditor(true) }}
        sx={{ margin: '10px' }}>
        Custom query
      </Button>

      <Button variant="contained" onClick={
        () => { console.log(customQueryData) }}>
        Show data
      </Button>

      <Dialog
        open={openEditor}
        onClose={closeEditor}
        maxWidth={'md'}
        fullWidth
        PaperProps={{
          component: 'form',
          onSubmit: async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            const jsonData = Object.fromEntries(formData.entries());
          
            setCustomQueryData(await executeSPARQLQuery(jsonData.query, jsonData.source, setShowError));
            closeEditor();
          },
        }}
      >
        <DialogTitle>Custom Query Editor</DialogTitle>


        <DialogContent>
          <DialogContentText sx={{ color: 'red', mb: '10px' }}>
            {showError ? 'Invalid Query. Check the URL and Query Syntax' : ''}
          </DialogContentText>

          <div>
            <TextField
              required
              fullWidth
              name='source'
              id="outlined-required"
              label="Data Source "
              placeholder="http://examplesource.org"
              helperText="Give the source Url for the query"
              variant='outlined'
            />
          </div>

          <div>
            <TextField
              required
              id="outlined-multiline-flexible"
              label="Custom Query"
              name='query'
              multiline
              fullWidth
              minRows={5}
              variant='outlined'
              helperText="Give the SPARQL query"
              placeholder={`SELECT ?s ?p ?o \nWHERE { \n\t?s ?p ?o \n}`}
            />
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={closeEditor}>Cancel</Button>
          <Button variant="contained" type="submit">Submit Query</Button>
        </DialogActions>
      </Dialog>

    </React.Fragment>
  )

}

async function executeSPARQLQuery(query, dataSource, setShowError) {
  const resultingObjects = [];
  try {
    const bindingsStream = await myEngine.queryBindings(query, {
      sources: [dataSource]
    });

    bindingsStream.on('data', (binding) => {
      resultingObjects.push(JSON.parse(binding.toString()));
    });
  } catch (error) {
    setShowError(true);
    throw new Error(`Error executing SPARQL query: ${error.message}`);
  }
  return resultingObjects;
}


