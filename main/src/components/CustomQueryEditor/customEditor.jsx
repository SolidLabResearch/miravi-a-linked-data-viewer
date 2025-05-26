import React, { useState, useEffect } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { CardActions, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import configManager from '../../configManager/configManager';
import IconProvider from '../../IconProvider/IconProvider';

import { getDefaultSession } from "@inrupt/solid-client-authn-browser";

import { SparqlEditField } from "./sparqlEditField";

import { JsonEditField } from "./jsonEditField";

const defaultSparqlQuery = `SELECT ?s ?p ?o
WHERE {
  ?s ?p ?o
}`;
const defaultSparqlQueryIndexSources = `PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?source
WHERE {
  ?s rdfs:seeAlso ?source
}`;
const defaultSparqlQueryIndirectVariables = `PREFIX schema: <http://schema.org/>
  
SELECT DISTINCT ?genre
WHERE {
  ?list schema:genre ?genre
}
ORDER BY ?genre`;

const defaultExtraComunicaContext = JSON.stringify({ "lenient": true }, null, 2);
const defaultTemplateOptions = JSON.stringify(
  {
    "variableOne": [
      "option1",
      "(etc...)"
    ],
    "(etc...)": []
  }, null, 2);
const defaultAskQueryDetails = JSON.stringify({ "trueText": "this displays when true.", "falseText": "this displays when false." }, null, 2);
const defaultHttpProxiesDetails = JSON.stringify([{ "urlStart": "http://www.example.com/path-xyz", "httpProxy": "http://myproxy.org/" }], null, 2);
const allCheckboxNames = ['comunicaContextCheck', 'sourceIndexCheck', 'directVariablesCheck', 'indirectVariablesCheck', 'askQueryCheck', 'httpProxiesCheck'];

export default function CustomEditor(props) {
  const session = getDefaultSession();
  const loggedIn = session.info.isLoggedIn;

  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source: '',
    queryString: '',
    comunicaContextCheck: false,
    sourceIndexCheck: false,
    directVariablesCheck: false,
    indirectVariablesCheck: false,
    askQueryCheck: false,
    httpProxiesCheck: false,
  });
  const [validFlags, setValidFlags] = useState({});
  const [errorWhileLoading, setErrorWhileLoading] = useState("");
  const [parsingError, setParsingError] = useState("");
  const [indirectVariableSourceList, setIndirectVariableSourceList] = useState([defaultSparqlQueryIndirectVariables]);

  useEffect(() => {
    try {
      let searchParams;
      if (props.newQuery) {
        searchParams = new URLSearchParams(location.search);
      } else {
        const editingQuery = configManager.getQueryById(props.id);
        searchParams = editingQuery.searchParams;
      }
      const obj = {}
      searchParams.forEach((value, key) => {
        obj[key] = value;
      });
      normalizeCheckboxValues(obj, obj);
      if (obj.indirectQueries) {
        setIndirectVariableSourceList(JSON.parse(obj.indirectQueries));
      }
      setFormData(obj);
    } catch (error) {
      setErrorWhileLoading("Apologies, something went wrong with the loading of your custom query...");
    }
  }, [location.search]);

  // TODO: move into handleChange
  useEffect(() => {
    let newErrorMessage = "";
    // only one error message is set, so the first one that occurs is the one that is shown
    if (validFlags['queryString'] === false) {
      newErrorMessage = "Invalid SPARQL query.";
    }
    if (!newErrorMessage && formData.comunicaContextCheck) {
      if (validFlags['comunicaContext'] === false) {
        newErrorMessage = "Invalid Comunica context configuration.";
      }
    }
    if (!newErrorMessage && formData.sourceIndexCheck) {
      if (validFlags['indexSourceQuery'] === false) {
        newErrorMessage = "Invalid indirect sources SPARQL query.";
      }
    }
    if (!newErrorMessage && formData.directVariablesCheck) {
      if (validFlags['variables'] === false) {
        newErrorMessage = "Invalid fixed templated variables specification.";
      }
    }
    if (!newErrorMessage && formData.indirectVariablesCheck) {
      for (const [key, value] of Object.entries(validFlags)) {
        if (key.startsWith('indirectVariablesQuery-') && value === false) {
          newErrorMessage = `Invalid SPARQL query to retrieve variable(s) from source(s).`;
          break;
        }
      }
    }
    if (!newErrorMessage && formData.askQueryCheck) {
      if (validFlags['askQuery'] === false) {
        newErrorMessage = "Invalid ASK query specification.";
      }
    }
    if (!newErrorMessage && formData.httpProxiesCheck) {
      if (validFlags['httpProxies'] === false) {
        newErrorMessage = "Invalid HTTP proxies specification.";
      }
    }
    setParsingError(newErrorMessage);
  }, [formData, validFlags]);

  const normalizeCheckboxValues = (fromObject, toObject) => {
    for (const c of allCheckboxNames) {
      if (fromObject[c] === 'on' || fromObject[c] === true) {
        toObject[c] = true;
      } else if (fromObject[c] === 'off' || fromObject[c] === false) {
        toObject[c] = false;
      }
    }
  };

  // TODO avoid
  const ensureBoolean = (value) => value === 'on' || value === true;



  // This function handles the submission of the form. Both for editing as for creation. This distinction is made by the `props.newQuery`.
  const handleSubmit = async (event) => {
    event.preventDefault();

    /* LOG */ console.log("----- customEditor.handleSubmit");

    if (parsingError) {
      /* LOG */ console.log(`not submitting, parsingError: ${parsingError}`);
      return;
    }

    const htmlFormData = new FormData(event.currentTarget);
    let jsonData = Object.fromEntries(htmlFormData.entries());
    /* LOG */ console.log(`jsonData (from HTML form data):\n${JSON.stringify(jsonData, null, 2)}`);
    /* LOG */ console.log(`formData (from state):\n${JSON.stringify(formData, null, 2)}`);
    normalizeCheckboxValues(jsonData, jsonData);

    jsonData.queryString = formData.queryString;
    if (jsonData.sourceIndexCheck) {
      jsonData.indexSourceQuery = formData.indexSourceQuery;
    }
    if (jsonData.comunicaContextCheck) {
      jsonData.comunicaContext = formData.comunicaContext;
    }
    if (jsonData.sourceIndexCheck) {
      jsonData.indexSourceQuery = formData.indexSourceQuery;
    }
    if (jsonData.directVariablesCheck) {
      jsonData.variables = formData.variables;
    }
    if (jsonData.indirectVariablesCheck) {
      jsonData.indirectQueries = JSON.stringify(indirectVariableSourceList);
    }
    if (jsonData.askQueryCheck) {
      jsonData.askQuery = formData.askQuery;
    }
    if (jsonData.httpProxiesCheck) {
      jsonData.httpProxies = formData.httpProxies;
    }

    /* LOG */ console.log(`jsonData (finally):\n${JSON.stringify(jsonData, null, 2)}`);

    const searchParams = new URLSearchParams(jsonData);
    jsonData.searchParams = searchParams;

    if (props.newQuery) {
      navigate({ search: searchParams.toString() });

      configManager.addNewQueryGroup('cstm', 'Custom queries', 'EditNoteIcon');
      addQuery(jsonData);
    }
    else {
      const customQuery = configManager.getQueryById(props.id);
      updateQuery(jsonData, customQuery);
    }
  
  };

  // These functions handle the entry changes from the user's input in the form
  const handleChange = (event) => {
    const { name, value, validFlag } = event.target;
    const indirectVariablesQueryRegex = /indirectVariablesQuery-(\d)+/;
    const result = indirectVariablesQueryRegex.exec(name);
    if (result) {
      const index = result[1];
      handleIndirectVariablesChange(event, index);
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value
      }));
    }
    if (validFlag !== undefined) {
      setValidFlags((prevValidFlags) => ({
        ...prevValidFlags,
        [name]: validFlag
      }));
    }
  };

  const handleIndirectVariablesChange = (event, index) => {
    const newList = [...indirectVariableSourceList];
    newList[index] = event.target.value;
    setIndirectVariableSourceList(newList);
  }

  // These functions serve for a correct parsing of JSON objects, lists, etc. right before submitting
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

    if (ensureBoolean(dataWithStrings.httpProxiesCheck)) {
      parsedObject.httpProxies = JSON.parse(dataWithStrings.httpProxies);
    }

    if (ensureBoolean(dataWithStrings.directVariablesCheck)) {
      parsedObject.variables = JSON.parse(dataWithStrings.variables);
    }

    if (ensureBoolean(dataWithStrings.indirectVariablesCheck)) {
      parsedObject.indirectVariables = { queryStrings: JSON.parse(dataWithStrings.indirectQueries) };
    }

    return parsedObject;
  }

  // These are the functions for the addition and removal of indirect variable input fields
  const handleIndirectVariableSource = () => {
    setIndirectVariableSourceList([...indirectVariableSourceList, ""]);
  }
  const handleIndirectVariableSourceRemove = (index) => {
    setIndirectVariableSourceList((prevList) => {
      const newList = [...prevList];
      newList.splice(index, 1);
      return newList;
     });
    setValidFlags((prevValidFlags) => {
      const name = `indirectVariablesQuery-${index}`;
      const { [name]: _, ...rest } = prevValidFlags;
      return rest;
    });

  }

  // These Functions are the submit functions for whether the creation or edit of a custom query
  const addQuery = (formData) => {
    const creationID = Date.now().toString();
    formData = parseAllObjectsToJSON(formData);

    configManager.addQuery({
      ...formData,
      id: creationID,
      queryGroupId: "cstm",
      icon: "AutoAwesomeIcon",
    });
    navigate(`/${creationID}`);
  };

  const updateQuery = (formData, customQuery) => {
    formData = parseAllObjectsToJSON(formData);
    configManager.updateQuery({
      ...formData,
      id: customQuery.id,
      queryGroupId: customQuery.queryGroupId,
      icon: customQuery.icon
    });

    navigate(`/${customQuery.id}`);
  };

  return (
    <React.Fragment>
      {!loggedIn &&
        <Card sx={{ backgroundColor: "#edaa15", padding: '16px', width: '100%' }}>
          <b>Warning!</b>  You are not logged in, so custom queries cannot be saved to a pod.
          The SHARE QUERY button is a solution to save a custom query (as a link).
        </Card>
      }

      <Card
        component="form"
        onSubmit={handleSubmit}
        sx={{ padding: '16px', marginTop: '16px', width: '100%' }}
      >
        <CardContent>

          {errorWhileLoading ? <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'darkred' }}> {errorWhileLoading} </Typography> : null   /* This is a small work around an error that occurs with indirect variables. */}
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{props.newQuery ? 'Custom Query Editor' : 'Edit'}</Typography>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Basic Information</Typography>
            <div>
              <TextField
                required
                fullWidth
                name="name"
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

              <SparqlEditField
                required
                label="SPARQL query"
                name="queryString"
                helperText="Enter your SPARQL query here."
                value={!!formData.queryString ? formData.queryString : formData.queryString === '' ? '' : defaultSparqlQuery}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>

            <Typography variant="h5" sx={{ mt: 2 }}> Comunica Context &amp; Sources </Typography>
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
                      }));
                    }
                  }

                />} label="Advanced Comunica Context Settings" />

            </div>
            <TextField
              required={!formData.sourceIndexCheck}
              fullWidth
              name="source"
              label="Fixed data source(s)"
              placeholder="http://example.com/source1; http://example.com/source2"
              helperText="Give the source URL(s) for the query. Separate URLs with '; '.  (These are the comunica context sources)"
              variant="outlined"
              value={!!formData.source ? formData.source : ''}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />


            {formData.comunicaContextCheck &&
              <div>
                {/* <TextField
                  required={ensureBoolean(formData.comunicaContextCheck)}
                  label="Comunica context configuration"
                  name="comunicaContext"
                  multiline
                  fullWidth
                  error={parsingErrorComunica}
                  minRows={5}
                  variant="outlined"
                  helperText={`Write the extra configurations in JSON-format.${parsingErrorComunica && ' (Check syntax)'}`}
                  value={!!formData.comunicaContext ? typeof formData.comunicaContext === 'object' ? JSON.stringify(formData.comunicaContext, null, 2) : formData.comunicaContext : formData.comunicaContext === '' ? '' : defaultExtraComunicaContext}
                  placeholder={defaultExtraComunicaContext}
                  onClick={(e) => handleJSONparsing(e, setParsingErrorComunica)}
                  onChange={(e) => handleJSONparsing(e, setParsingErrorComunica)}
                  sx={{ marginBottom: '16px' }}
                /> */}
                <JsonEditField
                  required={ensureBoolean(formData.comunicaContextCheck)}
                  label="Comunica context configuration"
                  name="comunicaContext"
                  helperText="Enter your extra comunica context in JSON-format."
                  value={!!formData.comunicaContext ? typeof formData.comunicaContext === 'object' ? JSON.stringify(formData.comunicaContext, null, 2) : formData.comunicaContext : formData.comunicaContext === '' ? '' : defaultExtraComunicaContext}
                  onChange={handleChange}
                />
              </div>
            }

            <FormControlLabel
              control={<Checkbox
                name='sourceIndexCheck'
                checked={!!formData.sourceIndexCheck}
                onChange={
                  () => {
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      'sourceIndexCheck': !formData.sourceIndexCheck,
                    }));
                  }
                }
              />} label="Indirect sources" />

            {formData.sourceIndexCheck &&
              <div>
                <TextField
                  required={ensureBoolean(formData.sourceIndexCheck)}
                  fullWidth
                  name="indexSourceUrl"
                  label="Index file URL"
                  placeholder="http://example.com/index"
                  helperText="Give the URL of the index file."
                  variant="outlined"
                  value={!!formData.indexSourceUrl ? formData.indexSourceUrl : ''}
                  onChange={handleChange}
                  sx={{ marginBottom: '16px' }}
                />

                <SparqlEditField
                  required={ensureBoolean(formData.sourceIndexCheck)}
                  label="Indirect sources SPARQL query"
                  name="indexSourceQuery"
                  helperText="Enter a SPARQL query to get the sources from the index file here."
                  value={!!formData.indexSourceQuery ? formData.indexSourceQuery : formData.indexSourceQuery === '' ? '' : defaultSparqlQueryIndexSources}
                  onChange={handleChange}
                />
              </div>
            }

          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Templated Query</Typography>
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='directVariablesCheck'
                  checked={!!formData.directVariablesCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'directVariablesCheck': !formData.directVariablesCheck,
                      }));
                    }
                  }
                />} label="Fixed Variables" />

              {formData.directVariablesCheck &&
                <div>
                  <Typography variant="base" sx={{ mt: 2, color: 'darkgrey' }}> Give the variable names and options for this templated query.</Typography>
                  {/* <TextField
                    required={ensureBoolean(formData.directVariablesCheck)}
                    label="Templated query variables"
                    name="variables"
                    error={parsingErrorTemplate}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write the variables specification in JSON-format${parsingErrorTemplate ? ' (Check syntax)' : '.'}`}
                    value={!!formData.variables ? typeof formData.variables === 'object' ? JSON.stringify(formData.variables, null, 5) : formData.variables : formData.variables === '' ? '' : defaultTemplateOptions}
                    placeholder={defaultTemplateOptions}
                    onClick={(e) => handleJSONparsing(e, setParsingErrorTemplate)}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorTemplate)}
                    sx={{ marginBottom: '16px' }}
                  /> */}
                  <JsonEditField
                    required={ensureBoolean(formData.directVariablesCheck)}
                    label="Fixed templated query variables"
                    name="variables"
                    helperText="Enter your fixed templated variables specification in JSON-format."
                    value={!!formData.variables ? typeof formData.variables === 'object' ? JSON.stringify(formData.variables, null, 5) : formData.variables : formData.variables === '' ? '' : defaultTemplateOptions}
                    onChange={handleChange}
                  />
                </div>
              }

              <FormControlLabel
                control={<Checkbox
                  name='indirectVariablesCheck'
                  checked={!!formData.indirectVariablesCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'indirectVariablesCheck': !formData.indirectVariablesCheck,
                      }));
                    }
                  }
                />} label="Indirect Variables" />

              {formData.indirectVariablesCheck &&
                <div>
                  <div style={{ marginBottom: '20px' }}>
                    <Typography variant="base" sx={{ color: '#777' }}> Give one or more SPARQL queries to retrieve variable(s) from source(s).</Typography>
                  </div>
                  {
                    indirectVariableSourceList.map((sourceString, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <SparqlEditField
                          required={ensureBoolean(formData.indirectVariablesCheck)}
                          label={`SPARQL query ${index + 1} for indirect variable(s)`}
                          name={`indirectVariablesQuery-${index}`}
                          helperText={`Enter a ${index === 0 ? "1st" : index === 1 ? "2nd" : index + 1 + "th"} SPARQL query to retrieve variables.`}
                          value={sourceString}
                          onChange={handleChange}
                        />

                        <Button
                          variant="outlined"
                          color='error' onClick={() => handleIndirectVariableSourceRemove(index)}
                          type="button" disabled={indirectVariableSourceList.length <= 1}
                          style={{ zIndex: '2', position: 'absolute', top: '30px', right: '17px', padding: '8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <IconProvider.DeleteIcon />
                        </Button>
                      </div>
                    ))
                  }
                  <Button variant="outlined" onClick={handleIndirectVariableSource} type="button" startIcon={<IconProvider.AddIcon />}>
                    Add another query
                  </Button>
                </div>
              }
            </div>
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Extra Options</Typography>
            <div>

              <FormControlLabel
                control={<Checkbox
                  name='askQueryCheck'
                  checked={!!formData.askQueryCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'askQueryCheck': !formData.askQueryCheck,
                      }));
                    }
                  }
                />} label="ASK query" />

              {formData.askQueryCheck &&
                <div>
                  {/* <TextField
                    required={ensureBoolean(formData.askQueryCheck)}
                    label="Creating an ask query"
                    name="askQuery"
                    error={parsingErrorAsk}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write askQuery details in JSON-format${parsingErrorAsk ? ' (Check syntax)' : '.'}`}
                    value={!!formData.askQuery ? typeof formData.askQuery === 'object' ? JSON.stringify(formData.askQuery, null, 2) : formData.askQuery : formData.askQuery === '' ? '' : defaultAskQueryDetails}
                    placeholder={defaultAskQueryDetails}
                    onClick={(e) => handleJSONparsing(e, setParsingErrorAsk)}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorAsk)}
                    sx={{ marginBottom: '16px' }}
                  /> */}
                  <JsonEditField
                    required={ensureBoolean(formData.askQueryCheck)}
                    label="Creating an ask query"
                    name="askQuery"
                    helperText="Enter your ASK query specification in JSON-format."
                    value={!!formData.askQuery ? typeof formData.askQuery === 'object' ? JSON.stringify(formData.askQuery, null, 2) : formData.askQuery : formData.askQuery === '' ? '' : defaultAskQueryDetails}
                    onChange={handleChange}
                  />
                </div>
              }

              <FormControlLabel
                control={<Checkbox
                  name='httpProxiesCheck'
                  checked={!!formData.httpProxiesCheck}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'httpProxiesCheck': !formData.httpProxiesCheck,
                      }));
                    }
                  }
                />} label="Http proxies" />

              {formData.httpProxiesCheck &&
                <div>
                  {/* <TextField
                    required={ensureBoolean(formData.httpProxiesCheck)}
                    label="Specifying http proxies"
                    name="httpProxies"
                    error={parsingErrorHttpProxies}
                    multiline
                    fullWidth
                    minRows={5}
                    variant="outlined"
                    helperText={`Write http proxies in JSON-format${parsingErrorHttpProxies ? ' (Check syntax)' : '.'}`}
                    value={!!formData.httpProxies ? typeof formData.httpProxies === 'object' ? JSON.stringify(formData.httpProxies, null, 2) : formData.httpProxies : formData.httpProxies === '' ? '' : defaultHttpProxiesDetails}
                    placeholder={defaultHttpProxiesDetails}
                    onClick={(e) => handleJSONparsing(e, setParsingErrorHttpProxies)}
                    onChange={(e) => handleJSONparsing(e, setParsingErrorHttpProxies)}
                    sx={{ marginBottom: '16px' }}
                  /> */}
                  <JsonEditField
                    required={ensureBoolean(formData.httpProxiesCheck)}
                    label="Specifying HTTP proxies"
                    name="httpProxies"
                    helperText="Enter your HTTP proxies specification JSON-format."
                    value={!!formData.httpProxies ? typeof formData.httpProxies === 'object' ? JSON.stringify(formData.httpProxies, null, 2) : formData.httpProxies : formData.httpProxies === '' ? '' : defaultHttpProxiesDetails}
                    onChange={handleChange}
                  />
                </div>
              }

            </div>
          </Card>

        </CardContent>

        {parsingError && (
          <Typography variant="body2" sx={{ color: 'red', mb: '10px' }}>
            {parsingError}
          </Typography>
        )}

        <CardActions>
          <Box display="flex" justifyContent="space-between" width="100%" sx={{ marginX: '10px' }}>
            <Button variant="contained" type="submit" startIcon={props.newQuery ? <IconProvider.AddIcon /> : <IconProvider.SaveAsIcon />}>
              {props.newQuery ? 'Create Query' : 'Save Changes'}
            </Button>

            {
              props.newQuery ?

                <Button
                  variant="outlined"
                  onClick={() => { navigate(-1) }}
                  startIcon={<IconProvider.ChevronLeftIcon />}
                >
                  Go Back
                </Button>

                :

                <Button
                  variant="outlined"
                  color='error'
                  onClick={() => { navigate(`/${props.id}/`) }}
                  startIcon={<IconProvider.CloseIcon />}
                >
                  Cancel
                </Button>
            }

          </Box>
        </CardActions>

      </Card>

    </React.Fragment>
  )
}





