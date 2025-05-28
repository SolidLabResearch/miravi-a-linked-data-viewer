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
  const [indirectVariablesQueryList, setIndirectVariablesQueryList] = useState([defaultSparqlQueryIndirectVariables]);

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
      if (obj.indirectQueries) {
        setIndirectVariablesQueryList(JSON.parse(obj.indirectQueries));
      }
      setFormData(obj);
    } catch (error) {
      setErrorWhileLoading("Apologies, something went wrong with the loading of your custom query...");
    }
  }, [location.search]);

  useEffect(() => {
    let newErrorMessage = "";
    // only one error message is set, so the first one that occurs is the one that is shown
    if (validFlags['queryString'] === false) {
      newErrorMessage = "Invalid SPARQL query.";
    }
    if (!newErrorMessage && isChecked(formData.comunicaContextCheck)) {
      if (validFlags['comunicaContext'] === false) {
        newErrorMessage = "Invalid Comunica context configuration.";
      }
    }
    if (!newErrorMessage && isChecked(formData.sourceIndexCheck)) {
      if (validFlags['indexSourceQuery'] === false) {
        newErrorMessage = "Invalid indirect sources SPARQL query.";
      }
    }
    if (!newErrorMessage && isChecked(formData.directVariablesCheck)) {
      if (validFlags['variables'] === false) {
        newErrorMessage = "Invalid fixed templated variables specification.";
      }
    }
    if (!newErrorMessage && isChecked(formData.indirectVariablesCheck)) {
      for (const [key, value] of Object.entries(validFlags)) {
        if (key.startsWith('indirectVariablesQuery-') && value === false) {
          newErrorMessage = `Invalid SPARQL query to retrieve variable(s) from source(s).`;
          break;
        }
      }
    }
    if (!newErrorMessage && isChecked(formData.askQueryCheck)) {
      if (validFlags['askQuery'] === false) {
        newErrorMessage = "Invalid ASK query specification.";
      }
    }
    if (!newErrorMessage && isChecked(formData.httpProxiesCheck)) {
      if (validFlags['httpProxies'] === false) {
        newErrorMessage = "Invalid HTTP proxies specification.";
      }
    }
    setParsingError(newErrorMessage);
  }, [formData, validFlags]);

  const isChecked = (value) => value === 'on' || value === true;

  const parseAllObjectsToJSON = (dataWithStrings) => {
    const parsedObject = dataWithStrings;

    if (isChecked(dataWithStrings.comunicaContextCheck)) {
      parsedObject.comunicaContext = JSON.parse(dataWithStrings.comunicaContext);

      if (!!dataWithStrings.source && dataWithStrings.source.trim() !== '')
        parsedObject.comunicaContext.sources = dataWithStrings.source.split(';').map(source => source.trim());

    } else if (!!dataWithStrings.source && dataWithStrings.source.trim() !== '') {
      parsedObject.comunicaContext = {
        sources: formData.source.split(';').map(source => source.trim())
      }
    }

    if (isChecked(dataWithStrings.sourceIndexCheck)) {
      parsedObject.sourcesIndex = {
        url: parsedObject.indexSourceUrl,
        queryString: parsedObject.indexSourceQuery
      }
    }

    if (isChecked(dataWithStrings.askQueryCheck)) {
      parsedObject.askQuery = JSON.parse(dataWithStrings.askQuery);
    }

    if (isChecked(dataWithStrings.httpProxiesCheck)) {
      parsedObject.httpProxies = JSON.parse(dataWithStrings.httpProxies);
    }

    if (isChecked(dataWithStrings.directVariablesCheck)) {
      parsedObject.variables = JSON.parse(dataWithStrings.variables);
    }

    if (isChecked(dataWithStrings.indirectVariablesCheck)) {
      parsedObject.indirectVariables = { queryStrings: JSON.parse(dataWithStrings.indirectQueries) };
    }

    return parsedObject;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    // LOG console.log("----- customEditor.handleSubmit");

    if (parsingError) {
      // LOG console.log(`not submitting, parsingError: ${parsingError}`);
      return;
    }

    const htmlFormData = new FormData(event.currentTarget);
    let collectedData = Object.fromEntries(htmlFormData.entries());
    // LOG console.log(`collectedData (from HTML form data):\n${JSON.stringify(collectedData, null, 2)}`);
    // LOG console.log(`formData (from state):\n${JSON.stringify(formData, null, 2)}`);

    collectedData.queryString = formData.queryString;
    if (isChecked(collectedData.sourceIndexCheck)) {
      collectedData.indexSourceQuery = formData.indexSourceQuery;
    }
    if (isChecked(collectedData.comunicaContextCheck)) {
      collectedData.comunicaContext = formData.comunicaContext;
    }
    if (isChecked(collectedData.sourceIndexCheck)) {
      collectedData.indexSourceQuery = formData.indexSourceQuery;
    }
    if (isChecked(collectedData.directVariablesCheck)) {
      collectedData.variables = formData.variables;
    }
    if (isChecked(collectedData.indirectVariablesCheck)) {
      collectedData.indirectQueries = JSON.stringify(indirectVariablesQueryList);
    }
    if (isChecked(collectedData.askQueryCheck)) {
      collectedData.askQuery = formData.askQuery;
    }
    if (isChecked(collectedData.httpProxiesCheck)) {
      collectedData.httpProxies = formData.httpProxies;
    }

    // LOG console.log(`collectedData (finally):\n${JSON.stringify(collectedData, null, 2)}`);

    const searchParams = new URLSearchParams(collectedData);
    collectedData.searchParams = searchParams;

    if (props.newQuery) {
      configManager.addNewQueryGroup('cstm', 'Custom queries', 'EditNoteIcon');
      
      const creationID = Date.now().toString();
      const jsonData = parseAllObjectsToJSON(collectedData);
      configManager.addQuery({
        ...jsonData,
        id: creationID,
        queryGroupId: "cstm",
        icon: "AutoAwesomeIcon",
      });

      navigate(`/${creationID}`);
    } else {
      const customQuery = configManager.getQueryById(props.id);
      const jsonData = parseAllObjectsToJSON(collectedData);
      configManager.updateQuery({
        ...jsonData,
        id: customQuery.id,
        queryGroupId: customQuery.queryGroupId,
        icon: customQuery.icon
      });

      // force a re-render with the updateTimestamp
      navigate(`/${customQuery.id}`, {state: { updateTimestamp: Date.now() } });
    }
  };

  const handleChange = (event) => {
    const { name, value, validFlag } = event.target;
    const indirectVariablesQueryRegex = /indirectVariablesQuery-(\d)+/;
    const result = indirectVariablesQueryRegex.exec(name);
    if (result) {
      const index = result[1];
      setIndirectVariablesQueryList((prevList) => {
        const newList = [...prevList];
        newList[index] = value;
        return newList;
      });
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

  const handleAddIndirectVariablesQuery = () => {
    setIndirectVariablesQueryList([...indirectVariablesQueryList, ""]);
  }
  const handleRemoveIndirectVariablesQuery = (index) => {
    setIndirectVariablesQueryList((prevList) => {
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
                value={formData.queryString === '' ? '' : formData.queryString || defaultSparqlQuery}
                onChange={handleChange}
              />
            </div>
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>

            <Typography variant="h5" sx={{ mt: 2 }}> Comunica Context &amp; Sources </Typography>
            <TextField
              required={!isChecked(formData.sourceIndexCheck)}
              fullWidth
              name="source"
              label="Fixed data source(s)"
              placeholder="http://example.com/source1; http://example.com/source2"
              helperText="Give the source URL(s) for the query. Separate URLs with '; '.  (These are the Comunica context sources)"
              variant="outlined"
              value={!!formData.source ? formData.source : ''}
              onChange={handleChange}
              sx={{ marginBottom: '16px' }}
            />
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='comunicaContextCheck'
                  checked={isChecked(formData.comunicaContextCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'comunicaContextCheck': !isChecked(formData.comunicaContextCheck),
                      }));
                    }
                  }

                />} label="Advanced Comunica Context Settings" />
            </div>
            {isChecked(formData.comunicaContextCheck) &&
              <div>
                <JsonEditField
                  required
                  label="Comunica context configuration"
                  name="comunicaContext"
                  helperText="Enter your extra Comunica context in JSON-format."
                  value={formData.comunicaContext === '' ? '' : formData.comunicaContext || defaultExtraComunicaContext}
                  onChange={handleChange}
                />
              </div>
            }

            <div>
              <FormControlLabel
                control={<Checkbox
                  name='sourceIndexCheck'
                  checked={isChecked(formData.sourceIndexCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'sourceIndexCheck': !isChecked(formData.sourceIndexCheck),
                      }));
                    }
                  }
                />} label="Indirect sources" />
            </div>

            {isChecked(formData.sourceIndexCheck) &&
              <div>
                <TextField
                  required
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
                  required
                  label="Indirect sources SPARQL query"
                  name="indexSourceQuery"
                  helperText="Enter a SPARQL query to get the sources from the index file here."
                  value={formData.indexSourceQuery === '' ? '' : formData.indexSourceQuery || defaultSparqlQueryIndexSources}
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
                  checked={isChecked(formData.directVariablesCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'directVariablesCheck': !isChecked(formData.directVariablesCheck),
                      }));
                    }
                  }
                />} label="Fixed Variables" />
            </div>

            {isChecked(formData.directVariablesCheck) &&
              <div>
                <Typography variant="base" sx={{ mt: 2, color: 'darkgrey' }}> Give the variable names and options for this templated query.</Typography>
                <JsonEditField
                  required
                  label="Fixed templated query variables"
                  name="variables"
                  helperText="Enter your fixed templated variables specification in JSON-format."
                  value={formData.variables === '' ? '' : formData.variables || defaultTemplateOptions}
                  onChange={handleChange}
                />
              </div>
            }

            <div>
              <FormControlLabel
                control={<Checkbox
                  name='indirectVariablesCheck'
                  checked={isChecked(formData.indirectVariablesCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'indirectVariablesCheck': !isChecked(formData.indirectVariablesCheck),
                      }));
                    }
                  }
                />} label="Indirect Variables" />
            </div>

            {isChecked(formData.indirectVariablesCheck) &&
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <Typography variant="base" sx={{ color: '#777' }}> Give one or more SPARQL queries to retrieve variable(s) from source(s).</Typography>
                </div>
                {
                  indirectVariablesQueryList.map((ivQuery, index) => (
                    <div key={index} style={{ position: 'relative' }}>
                      <SparqlEditField
                        required
                        label={`SPARQL query ${index + 1} for indirect variable(s)`}
                        name={`indirectVariablesQuery-${index}`}
                        helperText={`Enter a ${index === 0 ? "1st" : index === 1 ? "2nd" : index + 1 + "th"} SPARQL query to retrieve variables.`}
                        value={ivQuery}
                        onChange={handleChange}
                      />

                      <Button
                        variant="outlined"
                        color='error' onClick={() => handleRemoveIndirectVariablesQuery(index)}
                        type="button" disabled={indirectVariablesQueryList.length <= 1}
                        style={{ zIndex: '2', position: 'absolute', top: '30px', right: '17px', padding: '8px', minWidth: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <IconProvider.DeleteIcon />
                      </Button>
                    </div>
                  ))
                }
                <Button variant="outlined" onClick={handleAddIndirectVariablesQuery} type="button" startIcon={<IconProvider.AddIcon />}>
                  Add another query
                </Button>
              </div>
            }
          </Card>

          <Card sx={{ py: '10px', px: '20px', my: 2 }}>
            <Typography variant="h5" sx={{ mt: 2 }}> Extra Options</Typography>
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='askQueryCheck'
                  checked={isChecked(formData.askQueryCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'askQueryCheck': !isChecked(formData.askQueryCheck),
                      }));
                    }
                  }
                />} label="ASK query" />
            </div>
            {isChecked(formData.askQueryCheck) &&
              <div>
                <JsonEditField
                  required
                  label="Creating an ask query"
                  name="askQuery"
                  helperText="Enter your ASK query specification in JSON-format."
                  value={formData.askQuery === '' ? '' : formData.askQuery || defaultAskQueryDetails}
                  onChange={handleChange}
                />
              </div>
            }
            <div>
              <FormControlLabel
                control={<Checkbox
                  name='httpProxiesCheck'
                  checked={isChecked(formData.httpProxiesCheck)}
                  onChange={
                    () => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        'httpProxiesCheck': !isChecked(formData.httpProxiesCheck),
                      }));
                    }
                  }
                />} label="Http proxies" />
            </div>
            {isChecked(formData.httpProxiesCheck) &&
              <div>
                <JsonEditField
                  required
                  label="Specifying HTTP proxies"
                  name="httpProxies"
                  helperText="Enter your HTTP proxies specification JSON-format."
                  value={formData.httpProxies === '' ? '' : formData.httpProxies || defaultHttpProxiesDetails}
                  onChange={handleChange}
                />
              </div>
            }
          </Card>

        </CardContent>

        {parsingError && (
          <Typography variant="body2" sx={{ color: 'red', mb: '10px' }}>
            <span data-cy="parsingError">{parsingError}</span>
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





