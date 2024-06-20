import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { CardActions, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import configManager from '../../../configManager/configManager';
import IconProvider from '../../../IconProvider/IconProvider';

//import { QueryEngine } from "@comunica/query-sparql";
//const myEngine = new QueryEngine();

export default function CustomEditor(props) {

  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: '',
    queryString: '',
    comunicaContext: '',

    comunicaContextCheck: false,
    sourceIndexCheck: false,
    askQueryCheck: false,
    templatedQueryCheck: false,

  });

  const [showError, setShowError] = useState(false);

  const [parsingErrorComunica, setParsingErrorComunica] = useState(false);
  const [parsingErrorAsk, setParsingErrorAsk] = useState(false);
  const [parsingErrorTemplate, setParsingErrorTemplate] = useState(false);

  useEffect(() => {
    let searchParams
    if (props.newQuery) {
       searchParams = new URLSearchParams(location.search);
    } else{
      const edittingQuery = configManager.getQueryById(props.id);
      searchParams = edittingQuery.searchParams;
    }
      const obj = {}
      searchParams.forEach((value, key) => {
        obj[key] = value
      })
      setFormData(obj)
  }, [location.search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const jsonData = Object.fromEntries(formData.entries());

    const searchParams = new URLSearchParams(jsonData);
    jsonData.searchParams = searchParams;

    if (props.newQuery) {
      navigate({ search: searchParams.toString() });

      // TODO: NEED A CHECK HERE TO SEE IF WE MAY SUBMIT (correct query)
      // const data = await executeSPARQLQuery(jsonData.query, jsonData.source, setShowError);

      configManager.addNewQueryGroup('cstm', 'Custom queries', 'EditNoteIcon');
      addQuery(jsonData);
    }
    else {
      console.log(jsonData)
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

  const handleJSONparsing = (event, errorSetter) => {
    const { name, value } = event.target;
    errorSetter(false)

    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      errorSetter(true)
      parsedValue = value;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: parsedValue,
    }));
  };
  const ensureBoolean = (value) => value === 'on' || value === true;

  const parseAllObjectsToJSON = (dataWithStrings) => {

    const parsedObject = dataWithStrings;

    if (ensureBoolean(dataWithStrings.comunicaContextCheck)) {
      parsedObject.comunicaContext = JSON.parse(dataWithStrings.comunicaContext);

      if (!!dataWithStrings.source && dataWithStrings.source.trim() !== '')
        parsedObject.comunicaContext.sources = dataWithStrings.source.split(';').map(source => source.trim());

    } else if (!!dataWithStrings.source && dataWithStrings.source.trim() !== '') {
      parsedObject.comunicaContext = {
        sources: formData.source.split(';').map(source => source.trim())
      }
    }

    if (ensureBoolean(dataWithStrings.sourceIndexCheck)) {
      parsedObject.sourcesIndex = {
        url: parsedObject.indexSourceUrl,
        queryString: parsedObject.indexSourceQuery
      }
    }

    if (ensureBoolean(dataWithStrings.askQueryCheck)) {
      parsedObject.askQuery = JSON.parse(dataWithStrings.askQuery);
    }
    if (ensureBoolean(dataWithStrings.templatedQueryCheck)) {
      parsedObject.variables = JSON.parse(dataWithStrings.variables);
    }
    return parsedObject;
  }

  const addQuery = (formData) => {
    formData = parseAllObjectsToJSON(formData);
    configManager.addQuery({
      ...formData,
      id: Date.now().toString(),
      queryGroupId: "cstm",
      icon: "AutoAwesomeIcon",
    });
  };

  const updateQuery = (formData, customQuery) => {
    formData = parseAllObjectsToJSON(formData);
    configManager.updateQuery({
      ...customQuery,
      ...formData
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
          <Typography variant="h6">{props.newQuery ? 'Custom Query Editor' : 'Edit'}</Typography>
          {showError && (
            <Typography variant="body2" sx={{ color: 'red', mb: '10px' }}>
              Invalid Query. Check the URL and Query Syntax
            </Typography>
          )}
         
          <Card sx={{ px: '10px', my: 2 }}>
            <div>
              <TextField
                required
                fullWidth
                name="name"
                id="outlined-required"
                label="Query name"
                placeholder="Custom query name"
                helperText="Give this custom query a name"
                variant="outlined"
                value={!!formData.name ? formData.name : ''}
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
                value={!!formData.description ? formData.description : ''}
                onChange={handleChange}
                sx={{ marginBottom: '16px' }}
              />

              <TextField
                required  
                id="outlined-multiline-flexible"
                label="Custom Query"
                name="queryString"
                multiline
                fullWidth
                minRows={5}
                variant="outlined"
                helperText="Give the SPARQL query"
                placeholder={`SELECT ?s ?p ?o \nWHERE { \n\t?s ?p ?o \n}`}
                value={!!formData.queryString ? formData.queryString : ''}
                onChange={handleChange}
                sx={{ marginBottom: '16px' }}
              />
            </div>
          </Card>

          <Card sx={{ px: '10px', my: 2 }}>

            <Typography variant="h5" sx={{ mt: 2 }}> Comunica Context</Typography>
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='comunicaContextCheck'
                  checked={!!formData.comunicaContextCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'comunicaContextCheck': !formData.comunicaContextCheck,
                      }))
                    }
                  }

                />} label="Advanced Comunica Context Settings" />

            </div>
            <TextField
              required={!formData.sourceIndexCheck}
              fullWidth
              name="source"
              id="outlined-required"
              label="Data Source"
              placeholder="http://examplesource.org ; source2"
              helperText="Give the source Url(s) for the query. You can add more than one source separated with ' ; '"
              variant="outlined"
              value={!!formData.source ? formData.source : ''}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />


            {formData.comunicaContextCheck &&
              <div>
                <TextField
                  required={ensureBoolean(formData.comunicaContextCheck)}
                  id="outlined-multiline-flexible"
                  label="Comunica Context Configuration"
                  name="comunicaContext"
                  multiline
                  fullWidth
                  error={parsingErrorComunica}
                  minRows={5}
                  variant="outlined"
                  helperText={`Write the extra configurations in JSON-format  ${parsingErrorComunica ? ' (Invalid Syntax)' : ''}`}
                  value={!!formData.comunicaContext ? typeof formData.comunicaContext === 'object' ? JSON.stringify(formData.comunicaContext) : formData.comunicaContext : ''}
                  placeholder={`{\n\t"lenient" : true,\n\t"other" : "some other options"\n}`}
                  onChange={(e) => handleJSONparsing(e, setParsingErrorComunica)}
                  sx={{ marginBottom: '16px' }}
                />
              </div>
            }
          </Card>

          <Card sx={{ px: '10px', my: 2 }}>

            <div>
              <FormControlLabel
                control={<Checkbox
                  name='sourceIndexCheck'
                  checked={!!formData.sourceIndexCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'sourceIndexCheck': !formData.sourceIndexCheck,
                      }))
                    }
                  }
                />} label="Source from index file" />

              {formData.sourceIndexCheck &&
                <div>
                  <TextField
                    required={ensureBoolean(formData.sourceIndexCheck)}
                    fullWidth
                    name="indexSourceUrl"
                    id="outlined-required"
                    label="Index File url"
                    placeholder="http://examplesource.org ; source2"
                    helperText="Give the index file to use as IndexSource."
                    variant="outlined"
                    value={!!formData.indexSourceUrl ? formData.indexSourceUrl : ''}
                    onChange={handleChange}
                    sx={{ marginBottom: '16px' }}
                  />

                  <TextField
                    required={ensureBoolean(formData.sourceIndexCheck)}
                    id="outlined-multiline-flexible"
                    label="Query to get the source from index file"
                    name="indexSourceQuery"
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText="Give the SPARQL query to retrieve the sources"
                    placeholder={`SELECT ?s ?p ?o \nWHERE { \n\t?s ?p ?o \n}`}
                    value={!!formData.indexSourceQuery ? formData.indexSourceQuery : ''}
                    onChange={handleChange}
                    sx={{ marginBottom: '16px' }}
                  />
                </div>
              }

              <FormControlLabel
                control={<Checkbox
                  name='askQueryCheck'
                  checked={!!formData.askQueryCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'askQueryCheck': !formData.askQueryCheck,
                      }))
                    }
                  }
                />} label="add an askQuery" />

              {formData.askQueryCheck &&
                <div>
                  <TextField
                    id="outlined-multiline-flexible"
                    label="Creating an ask query"
                    name="askQuery"
                    error={parsingErrorAsk}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write contents of the askQuery in JSON-format ${parsingErrorAsk ? ' (Invalid Syntax)' : ''}`}
                    value={!!formData.askQuery ? typeof formData.askQuery === 'object' ? JSON.stringify(formData.askQuery) : formData.askQuery : `{\n\t"trueText" : " ",\n\t"falseText" : " " \n}`}
                    placeholder={`{\n\t"trueText" : "this displays when true.",\n\t"falseText" : "this displays when false." \n}`}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorAsk)}
                    sx={{ marginBottom: '16px' }}
                  />
                </div>
              }
              <FormControlLabel
                control={<Checkbox
                  name='templatedQueryCheck'
                  checked={!!formData.templatedQueryCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'templatedQueryCheck': !formData.templatedQueryCheck,
                      }))
                    }
                  }
                />} label="Templated Query" />

              {formData.templatedQueryCheck &&
                <div>
                  <TextField
                    id="outlined-multiline-flexible"
                    label="Variables for the templated query"
                    name="variables"
                    error={parsingErrorTemplate}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write the variables in JSON-format ${parsingErrorTemplate ? ' (Invalid Syntax)' : ''}`}
                    value={!!formData.variables ? typeof formData.variables === 'object' ? JSON.stringify(formData.variables) : formData.variables : ''}
                    placeholder={`{\n\tvariableOne : ["option1","option2","option3"],\n\tvariableTwo : ["option1","option2","option3"], \n\t...\n}`}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorTemplate)}
                    sx={{ marginBottom: '16px' }}
                  />
                </div>
              }
            </div>
          </Card>
        </CardContent>

        <CardActions>
          <Button variant="contained" type="submit" startIcon={props.newQuery ?<IconProvider.AddIcon/>: <IconProvider.SaveAsIcon/>}>{props.newQuery ? 'Create Query' : 'Save Changes'}</Button>
        </CardActions>
      </Card>

    </React.Fragment>
  )
}

// Temporary bindingstream this is if you want a check on the simple queries before submitting
/*
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

*/




