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
    comunicaContext: '',
    comunicaContextCheck: false,
    sourceIndexCheck: false,
    askQueryCheck: false,
    httpProxiesCheck: false,
    directVariablesCheck: false,
    indirectVariablesCheck: false,
  });
  const [validFlags, setValidFlags] = useState({});

  const [errorWhileLoading, setErrorWhileLoading] = useState("");
  const [parsingError, setParsingError] = useState("");
  const [parsingErrorComunica, setParsingErrorComunica] = useState(false);
  const [parsingErrorAsk, setParsingErrorAsk] = useState(false);
  const [parsingErrorHttpProxies, setParsingErrorHttpProxies] = useState(false);
  const [parsingErrorTemplate, setParsingErrorTemplate] = useState(false);

  // Default placeholders for the forms
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
  const [indirectVariableSourceList, setIndirectVariableSourceList] = useState([defaultSparqlQueryIndirectVariables]);

  const defaultExtraComunicaContext = JSON.stringify({ "lenient": true }, null, 2);
  const defaultAskQueryDetails = JSON.stringify({ "trueText": "this displays when true.", "falseText": "this displays when false." }, null, 2);
  const defaultHttpProxiesDetails = JSON.stringify([{ "urlStart": "http://www.example.com/path-xyz", "httpProxy": "http://myproxy.org/" }], null, 2);
  const defaultTemplateOptions = JSON.stringify(
    {
      "variableOne": [
        "option1",
        "(etc...)"
      ],
      "(etc...)": []
    }, null, 5);


  useEffect(() => {
    try {
      let searchParams;
      if (props.newQuery) {
        searchParams = new URLSearchParams(location.search);
    } else {
        const edittingQuery = configManager.getQueryById(props.id);
        searchParams = edittingQuery.searchParams;
      }
      const obj = {}
      searchParams.forEach((value, key) => {
        obj[key] = value;
      })

      if (obj.indirectQueries) {
        setIndirectVariableSourceList(JSON.parse(obj.indirectQueries));
      }
      setFormData(obj);

    } catch (error) {
      setErrorWhileLoading("Apologies, something went wrong with the loading of your custom query...");
    }
  }, [location.search]);


  // This function handles the submission of the form. Both for editting as for creation. This distinction is made by the `props.newQuery`.
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (Object.values(validFlags).some((x) => x === false)) {
      setParsingError("Invalid query. Check the SPARQL fields.");
    } else if (parsingErrorComunica || parsingErrorAsk || parsingErrorHttpProxies || parsingErrorTemplate) {
      setParsingError("Invalid query. Check the JSON fields.");
    } else {
      setParsingError("");
      const htmlFormData = new FormData(event.currentTarget);
      let jsonData = Object.fromEntries(htmlFormData.entries());
      // LOG console.log(`----- jsonData (from HTML form data):\n${JSON.stringify(jsonData, null, 2)}`);
      // LOG console.log(`----- formData (from state):\n${JSON.stringify(formData, null, 2)}`);

      // not all required properties are in jsonDataFromHtml; add them here from formData
      const additionalProperties = ["queryString", "indexSourceQuery"];
      for (const p of additionalProperties) {
        if (formData.hasOwnProperty(p)) {
          jsonData[p] = formData[p];
        }
      }

      if (jsonData.indirectVariablesCheck) {
        jsonData.indirectQueries = JSON.stringify(indirectVariableSourceList);
      }
      // LOG console.log(`----- jsonData (finally):\n${JSON.stringify(jsonData, null, 2)}`);

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
    setParsingError("");
  };

  const handleIndirectVariablesChange = (event, index) => {
    const newList = [...indirectVariableSourceList];
    newList[index] = event.target.value;
    setIndirectVariableSourceList(newList);
  }

  const handleJSONparsing = (event, errorSetter) => {
    const { name, value } = event.target;
    errorSetter(false);

    let parsedValue;
    try {
      parsedValue = JSON.parse(value);
    } catch (error) {
      errorSetter(true);
      parsedValue = value;
    }

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: parsedValue,
    }));
  };

  // These functions serve for a correct parsing of JSON objects, lists, etc. right before submitting
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
                      setParsingErrorComunica(false);
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
                <TextField
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
                  label="SPARQL query"
                  name="indexSourceQuery"
                  helperText="Enter a SPARQL query to get the sources from the index file."
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
                      setParsingErrorTemplate(false);
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
                  <TextField
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
                  />
                </div>
              }

              <FormControlLabel
                control={<Checkbox
                  name='indirectVariablesCheck'
                  checked={!!formData.indirectVariablesCheck}
                  onChange={
                    () => {
                      setParsingErrorTemplate(false);
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
                    <Typography variant="base" sx={{ color: '#777' }}> Give one or more queries to retrieve the variable(s) from the source(s).</Typography>
                  </div>
                  {
                    indirectVariableSourceList.map((sourceString, index) => (
                      <div key={index} style={{ position: 'relative' }}>
                        <SparqlEditField
                          required={ensureBoolean(formData.indirectVariablesCheck)}
                          label={`Query ${index + 1} for indirect variable(s)`}
                          name={`indirectVariablesQuery-${index}`}
                          helperText={`Enter a ${index === 0 ? "1st" : index === 1 ? "2nd" : index + 1 + "th"} SPARQL query to retrieve the variables.`}
                          value={sourceString}
                          // onChange={(e) => handleIndirectVariablesChange(e, index)}
                          onChange={handleChange}
                        />

                        <Button
                          variant="outlined"
                          color='error' onClick={() => handleIndirectVariableSourceRemove(index)}
                          type="button" disabled={indirectVariableSourceList.length <= 1}
                          style={{ zIndex: '2', position: 'absolute', top: '15px', right: '8px', padding: '8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
                      setParsingErrorAsk(false);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'askQueryCheck': !formData.askQueryCheck,
                      }));
                    }
                  }
                />} label="ASK query" />

              {formData.askQueryCheck &&
                <div>
                  <TextField
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
                  />
                </div>
              }

              <FormControlLabel
                control={<Checkbox
                  name='httpProxiesCheck'
                  checked={!!formData.httpProxiesCheck}
                  onChange={
                    () => {
                      setParsingErrorHttpProxies(false);
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'httpProxiesCheck': !formData.httpProxiesCheck,
                      }));
                    }
                  }
                />} label="Http proxies" />

              {formData.httpProxiesCheck &&
                <div>
                  <TextField
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





