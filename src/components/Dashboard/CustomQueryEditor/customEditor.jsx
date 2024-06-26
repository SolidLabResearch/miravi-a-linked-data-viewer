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
    } else {
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

    if (!parsingErrorComunica && !parsingErrorAsk && !parsingErrorTemplate) {
      setShowError(false)
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
        const customQuery = configManager.getQueryById(props.id);
        updateQuery(jsonData, customQuery);
      }
    }else{
      setShowError(true)
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
    const creationID = Date.now().toString();
    formData = parseAllObjectsToJSON(formData);
    configManager.addQuery({
      ...formData,
      id: creationID,
      queryGroupId: "cstm",
      icon: "AutoAwesomeIcon",
    });
    navigate(`/${creationID}`)
  };

  const updateQuery = (formData, customQuery) => {
    formData = parseAllObjectsToJSON(formData);
    configManager.updateQuery({
      ...customQuery,
      ...formData
    });

    navigate(`/${customQuery.id}`)
  };

  const defaultSparqlQuery = `SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}`;
  const defaultSparqlQueryIndexSources = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT ?object
WHERE {
  ?s rdfs:seeAlso ?object
}`;
  const defaultExtraComunicaContext = JSON.stringify({ "lenient": true }, null, 2);
  const defaultAskQueryDetails = JSON.stringify({"trueText": "this displays when true.", "falseText": "this displays when false."}, null, 2);

  return (
    <React.Fragment>
      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{ padding: '16px', marginTop: '16px', width: '100%' }}
      >
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{props.newQuery ? 'Custom Query Editor' : 'Edit'}</Typography>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Basic Information</Typography>
            <div>
              <TextField
                required
                fullWidth
                name="name"
                id="outlined-required"
                label="Query name"
                placeholder="Custom query name"
                helperText="Give this custom query a name."
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
                helperText="Give a description for the query."
                placeholder="This is a custom query."
                value={!!formData.description ? formData.description : ''}
                onChange={handleChange}
                sx={{ marginBottom: '16px' }}
              />

              <TextField
                required
                id="outlined-multiline-flexible"
                label="SPARQL query"
                name="queryString"
                multiline
                fullWidth
                minRows={5}
                variant="outlined"
                helperText="Enter your SPARQL query here."
                placeholder={defaultSparqlQuery}
                value={!!formData.queryString ? formData.queryString : formData.queryString === '' ? '' : defaultSparqlQuery}
                onChange={handleChange}
                sx={{ marginBottom: '16px' }}
              />
            </div>
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>

            <Typography variant="h5" sx={{ mt: 2 }}> Comunica Context</Typography>
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='comunicaContextCheck'
                  checked={!!formData.comunicaContextCheck}
                  onChange={
                    () => {
                      setParsingErrorComunica(false);
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
              label="Data source(s)"
              placeholder="http://example.com/source1; http://example.com/source2"
              helperText="Give the source URL(s) for the query. Separate URLs with with '; '."
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
                  label="Comunica context configuration"
                  name="comunicaContext"
                  multiline
                  fullWidth
                  error={parsingErrorComunica}
                  minRows={5}
                  variant="outlined"
                  helperText={`Write the extra configurations in JSON-format${parsingErrorComunica ? ' (Invalid Syntax)' : '.'}`}
                  value={!!formData.comunicaContext ? typeof formData.comunicaContext === 'object' ? JSON.stringify(formData.comunicaContext, null, 2) : formData.comunicaContext : formData.comunicaContext === '' ? '' : defaultExtraComunicaContext}
                  placeholder={defaultExtraComunicaContext}
                  onClick={(e) => handleJSONparsing(e, setParsingErrorComunica)}
                  onChange={(e) => handleJSONparsing(e, setParsingErrorComunica)}
                  sx={{ marginBottom: '16px' }}
                />
              </div>
            }
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Extra Options</Typography>
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
                />} label="Sources from index file" />

              {formData.sourceIndexCheck &&
                <div>
                  <TextField
                    required={ensureBoolean(formData.sourceIndexCheck)}
                    fullWidth
                    name="indexSourceUrl"
                    id="outlined-required"
                    label="Index file URL"
                    placeholder="http://example.com/index"
                    helperText="Give the URL of the index file."
                    variant="outlined"
                    value={!!formData.indexSourceUrl ? formData.indexSourceUrl : ''}
                    onChange={handleChange}
                    sx={{ marginBottom: '16px' }}
                  />

                  <TextField
                    required={ensureBoolean(formData.sourceIndexCheck)}
                    id="outlined-multiline-flexible"
                    label="SPARQL query"
                    name="indexSourceQuery"
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText="Give the SPARQL query to get the sources from the index file."
                    placeholder={defaultSparqlQueryIndexSources}
                    value={!!formData.indexSourceQuery ? formData.indexSourceQuery : formData.indexSourceQuery === '' ? '' : defaultSparqlQueryIndexSources}
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
                      setParsingErrorAsk(false);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'askQueryCheck': !formData.askQueryCheck,
                      }))
                    }
                  }
                />} label="ASK query" />

              {formData.askQueryCheck &&
                <div>
                  <TextField
                    required={ensureBoolean(formData.askQueryCheck)}
                    id="outlined-multiline-flexible"
                    label="Creating an ask query"
                    name="askQuery"
                    error={parsingErrorAsk}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write askQuery details in JSON-format${parsingErrorAsk ? ' (Invalid Syntax)' : '.'}`}
                    value={!!formData.askQuery ? typeof formData.askQuery === 'object' ? JSON.stringify(formData.askQuery, null, 2) : formData.askQuery : formData.askQuery === '' ? '' : defaultAskQueryDetails}
                    placeholder={defaultAskQueryDetails}
                    onClick={(e) => handleJSONparsing(e, setParsingErrorAsk)}
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
                      setParsingErrorTemplate(false);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'templatedQueryCheck': !formData.templatedQueryCheck,
                      }))
                    }
                  }
                />} label="Templated query" />

              {formData.templatedQueryCheck &&
                <div>
                  <TextField
                    required={ensureBoolean(formData.templatedQueryCheck)}
                    id="outlined-multiline-flexible"
                    label="Variables specification"
                    name="variables"
                    error={parsingErrorTemplate}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write the variables specification in JSON-format${parsingErrorTemplate ? ' (Invalid Syntax)' : '.'}`}
                    value={!!formData.variables ? typeof formData.variables === 'object' ? JSON.stringify(formData.variables,null,2) : formData.variables : formData.variables === '' ? '' : `{\n\t"variableOne" : ["option1", "option2", "option3"],\n\t"variableTwo" : ["option1", "option2", "option3"]\n}`}
                    placeholder={`{\n\tvariableOne : ["option1","option2","option3"],\n\tvariableTwo : ["option1","option2","option3"], \n\t...\n}`}
                    onClick={(e) => handleJSONparsing(e, setParsingErrorTemplate)}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorTemplate)}
                    sx={{ marginBottom: '16px' }}
                  />
                </div>
              }
            </div>
          </Card>
        </CardContent>
        {showError && (
            <Typography variant="body2" sx={{ color: 'red', mb: '10px' }}>
              Invalid Query. Check the JSON-Syntax
            </Typography>
          )}
        <CardActions>
          <Button variant="contained" type="submit" startIcon={props.newQuery ? <IconProvider.AddIcon /> : <IconProvider.SaveAsIcon />}>{props.newQuery ? 'Create Query' : 'Save Changes'}</Button>
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




