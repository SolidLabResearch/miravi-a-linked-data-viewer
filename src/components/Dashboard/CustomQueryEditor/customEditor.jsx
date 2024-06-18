import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import { QueryEngine } from "@comunica/query-sparql";
import { CardActions, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import configManager from '../../../configManager/configManager';



const myEngine = new QueryEngine();

export default function CustomEditor(props) {

  //console.log(props)


  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    source: '',
    query: ''
  });
  const [showError, setShowError] = useState(false);


  //delete tabledata when everything is finished

  useEffect(() => {
    if (props.newQuery) {
      const searchParams = new URLSearchParams(location.search);
      const title = searchParams.get('title') || '';
      const description = searchParams.get('description') || '';
      const source = searchParams.get('source') || '';
      const query = searchParams.get('query') || '';
      setFormData({ title, description, source, query });

    } else{
      const edittingQuery = configManager.getQueryById(props.id);
      setFormData({ 
        title: edittingQuery.name, 
        description: edittingQuery.description, 
        source:  edittingQuery.comunicaContext.sources.join(' ; '), 
        query: edittingQuery.queryString });
    }
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());
    if (props.newQuery) {
  
      const searchParams = new URLSearchParams(jsonData);
      navigate({ search: searchParams.toString() });

      // TODO: NEED A CHECK HERE TO SEE IF WE MAY SUBMIT (correct query)
      // const data = await executeSPARQLQuery(jsonData.query, jsonData.source, setShowError);
  
      configManager.addNewQueryGroup('cstm', 'Custom queries', 'EditNoteIcon');
      
      //const savedUrl = `http://localhost:5173/#${location.pathname}?${searchParams.toString()}`
      // jsonData.savedUrl = savedUrl;
      // console.log(jsonData);
      addQuery(jsonData);
    }
    else{
     
      const customQuery = configManager.getQueryById(props.id);
      updateQuery(jsonData, customQuery);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const addQuery = (formData) => {
    configManager.addQuery({
      id: Date.now().toString(),
      queryGroupId: "cstm",
      icon: "AutoAwesomeIcon",
      queryString: formData.query,
      name: formData.title,
      description: formData.description,
      comunicaContext: {
        sources: formData.source.split(';').map(source => source.trim())
      },
    });
  };
  
  const updateQuery = (formData, customQuery) => { 
    console.log(formData , customQuery)
    const { title, description, query, source } = formData;

    // NAAM EN BESCHRIJVING WILLEN visueel NIET MEE UPDATEIN IN DE RESOURCES 
    configManager.updateQuery({
        ...customQuery,
        name: title,
        description: description,
        queryString: query,
        comunicaContext: {
            sources: source.split(';').map(src => src.trim())
        },
       // queryLocation: "components.rq"  // Location for testing purposes, delete after it works with the querystring
    });
  
    navigate(`/${customQuery.id}`)
  };

  return (
    <React.Fragment>

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{ padding: '16px', marginTop: '16px', width: '100%' }}
      >
        <CardContent>
          <Typography variant="h6">{props.newQuery?'Custom Query Editor':'Edit'}</Typography>
          {showError && (
            <Typography variant="body2" sx={{ color: 'red', mb: '10px' }}>
              Invalid Query. Check the URL and Query Syntax
            </Typography>
          )}

          <div>
            <TextField
              required
              fullWidth
              name="title"
              id="outlined-required"
              label="Query title"
              placeholder="Custom query name"
              helperText="Give this custom query a name"
              variant="outlined"
              value={formData.title}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />

            <TextField
              required
              id="outlined-multiline-flexible"
              label="Description"
              name="description"
              multiline
              fullWidth
              minRows={2}
              variant="outlined"
              helperText="Give a description for the query"
              placeholder="This is a custom query."
              value={formData.description}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />
          </div>

          <div>
            <TextField
              required
              fullWidth
              name="source"
              id="outlined-required"
              label="Data Source"
              placeholder="http://examplesource.org ; source2"
              helperText="Give the source Url(s) for the query. You can add more than one source separated with ' ; '"
              variant="outlined"
              value={formData.source}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />
          </div>

          <div>
            <TextField
              required
              id="outlined-multiline-flexible"
              label="Custom Query"
              name="query"
              multiline
              fullWidth
              minRows={5}
              variant="outlined"
              helperText="Give the SPARQL query"
              placeholder={`SELECT ?s ?p ?o \nWHERE { \n\t?s ?p ?o \n}`}
              value={formData.query}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />
          </div>
        </CardContent>

        <CardActions>
          <Button variant="contained" type="submit">Submit Query</Button>
        </CardActions>
      </Card>
      {/* {showTable && <TableData data={customQueryData} title={customQueryJSON.title} />} */}

    </React.Fragment>
  )
}

// Temporary bindingstream
async function executeSPARQLQuery(query, dataSource, setShowError) {
  const resultingObjects = [];
  try {
    const bindingsStream = await myEngine.queryBindings(query, {
      sources: dataSource.split(';').map(source => source.trim())
    });

    bindingsStream.on('data', (binding) => {
      resultingObjects.push(JSON.parse(binding.toString()));
    });
  } catch (error) {
    setShowError(true);
    throw new Error(`Error executing SPARQL query: ${error.message}`);
  }
  return resultingObjects;
};




