import React, { useState, useEffect } from 'react';
import {useResourceContext} from "react-admin";
import {useLocation, useNavigate} from 'react-router-dom';
import {Component} from "react";
import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import ListResultTable from "./ListResultTable.jsx";

import configManager from '../../configManager/configManager.js';
import comunicaEngineWrapper from '../../comunicaEngineWrapper/comunicaEngineWrapper.js';

/**
 * A wrapper component around ListResultTable, to support templated queries
 * @param {object} props - the props passed down to the component
 * @returns {Component} the wrapper component
 */
const TemplatedListResultTable = (props) => {
  
  const resource = useResourceContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [variables, setVariables] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [searchPar, setSearchPar] = useState({});
  const [query, setQuery] = useState(configManager.getQueryWorkingCopyById(resource));
 // const query = configManager.getQueryWorkingCopyById(resource);
  useEffect(() => {

    const fetchQuery = async () => {
     // const query = configManager.getQueryWorkingCopyById(resource);

      if (query.indirectVariables) {
        const vars = await getIndirectVariables(query);
      //  query.variables = vars;
        setQuery({...query, variables : vars });
      }
    };

    fetchQuery();
  }, [resource]);

  const isTemplatedQuery = query.variables !== undefined;
  let tableEnabled = !isTemplatedQuery;


  
  if (isTemplatedQuery) {
    // Update variables from query parameters
    const queryParams = new URLSearchParams(location.search);
    const queryVariables = {};
    for (const variableName of Object.keys(query.variables)) {
      if (queryParams.has(variableName)) {
        queryVariables[variableName] = queryParams.get(variableName);
      }
    }
    if (!equalSimpleObjects(variables, queryVariables)) {
      setVariables(queryVariables);
    } else {
      tableEnabled = (Object.keys(variables).length === Object.keys(query.variables).length);
    }
  }

  const onSubmit = (formVariables) => {  

    if (!submitted){
      setSearchPar(formVariables);
    }
    // Update query parameters from the TemplatedQueryForm fields
    const queryParams = new URLSearchParams(location.search);
    for (const [variableName, variableValue] of Object.entries(formVariables)) {
      if (variableValue) {
        queryParams.set(variableName, variableValue);
      }
    }

    const queryString= queryParams.toString();
    if (queryString.length > 0) {
      if(!submitted) setSubmitted(true);

      navigate(`?${queryString}`);
    }
  }

  const changeVariables = () => {
    setSubmitted(false);
    navigate();
  }

  return (
    <>
      {isTemplatedQuery && !tableEnabled && 
        <TemplatedQueryForm 
          variableOptions={query.variables} 
          onSubmit={onSubmit} 
          submitted={submitted} 
          searchPar={searchPar} 
        />
      }
      {tableEnabled && <ListResultTable {...props} resource={resource} variables={variables} changeVariables={changeVariables} submitted={submitted}/>}
    </>
  )
}

/**
 * Check if two objects have the same property values (of type a primitive value or a string)
 * @param {object} obj1 - the first object
 * @param {object} obj2 - the second object
 * @returns {boolean} true means equal
 */
function equalSimpleObjects(obj1, obj2) {
  if (Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  for (const key1 in obj1) {
    if (obj1[key1] !== obj2[key1]) {
      return false;
    }
  }
  return true;
}

async function getIndirectVariables(query) {
  const config = configManager.getConfig()
  let variables;
  let queryStingList = [];

  if (query.variables) {
    variables = query.variables
  } else {
    variables = {}
  }

  if (query.indirectVariables.queryLocations) {

    for (const location of query.indirectVariables.queryLocations) {
      // Checks for a valid queryLocation
      if (!location.endsWith('.rq')) {
        throw new Error("Wrong filetype for the indirectVariables query.")
      }
      const result = await fetch(`${config.queryFolder}${location}`);
      const queryStr = await result.text();

      if (queryStr === null || queryStr === '') {
        throw new Error("Empty variable query text. Check the query and locations for indirectVariables.")
      }
      queryStingList.push(queryStr);
    }
  }
  else if (query.indirectVariables.queryStrings) {
    queryStingList = query.indirectVariables.queryStrings
  }
  else {
    throw new Error("No indirectVariable queries were given...")
  }

  try {
    for (const queryString of queryStingList) {
      const bindingsStream = await comunicaEngineWrapper.queryBindings(queryString,
        { sources: query.comunicaContext.sources, httpProxyHandler: (query.comunicaContext.useProxy ? proxyHandler : undefined) });
      await new Promise((resolve, reject) => {

        bindingsStream.on('data', (bindings) => {
          bindings.forEach((value, key) => {
            if (!variables[key.value]) {
              variables[key.value] = [];
            }

            let termValue;
            let val = value.value

            if (val.includes('"')) {
              val = val.replace(/"/g, '\\"');
            }

            // If it's an url, it must be surrounded with <> , if its not then with " "
            try {
              new URL(val);
              termValue = `<${val}>`;
            } catch (e) {
              termValue = `"${val}"`;
            }

            if (!variables[key.value].includes(termValue)) {
              variables[key.value].push(termValue)
            }
          })
        });
        bindingsStream.on('end', resolve);
        bindingsStream.on('error', reject);
      });
    }
  }
  catch (error) {
    throw new Error(`Error adding indirect variables: ${error.message}`);
  }

  if (variables == {}) {
    throw new Error(`The variables are empty`);
  }
  return variables;
}


export default TemplatedListResultTable;
