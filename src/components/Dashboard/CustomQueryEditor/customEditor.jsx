import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

import { QueryEngine } from "@comunica/query-sparql";

const myEngine = new QueryEngine();
//import {SimpleForm, TextInput, required } from 'react-admin';


export default function CustomEditor() {

  const [openEditor, setOpenEditor] = useState(false);
  const [customQuery, setCustomQuery] = useState('')
  const [resultList, setResultList] = useState([])

  const closeEditor = () => {
    setOpenEditor(false)
  }

  const finalise = async () => {
    //setResultList(await ResultsFromQuery(customQuery.source, customQuery.query))
    console.log(resultList)
  }

  return (
    <React.Fragment>
      <Button variant="contained" onClick={
        () => { setOpenEditor(true) }}>
        Custom query
      </Button>

      <Button variant="contained" onClick={
        () => { console.log(resultList, customQuery)}}>
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
            
            setResultList(await ResultsFromQuery(jsonData.source , jsonData.query));

            closeEditor();
            
            finalise();
          },
        }}
      >
        <DialogTitle>Custom Query Editor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Get results from a custom query in SPARQL
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
            />/
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

async function ResultsFromQuery (source, query){

  // const a = `PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX example: <http://localhost:8080/example/index-example-texon-only#> SELECT ?object WHERE { example:index-example rdfs:seeAlso ?object . }`

  // const b = `http://localhost:8080/example/index-example-texon-only`

  console.log(source , query)

  const results = [];
try{
  const bindingsStream = await myEngine.queryBindings(query, {
    sources: [source],
  });

  await new Promise((resolve, reject) => {
    bindingsStream.on('data', (binding) => {
      const source = binding.get('object').value;
      console.log(binding)
      if (!results.includes(source)) {
        results.push(source);
      }
    });
    bindingsStream.on('end', resolve);
    bindingsStream.on('error', reject);
  });

  return results;

}catch(error){
  console.log('nahhh brooo:' , error)
}
}

