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
          // see https://comunica.dev/docs/query/advanced/bindings/
          for (const [variable, term] of bindings) {
            const name = variable.value;
            if (!variables[name]) {
              variables[name] = [];
            }
            let variableValue;
            switch (term.termType) {
              case "Literal":
                // escape double quotes
                // example: This is a string containing some \"double quotes\"
                variableValue = `${term.value.replace(/"/g, '\\"')}`;
                // test whether there is a type specifier ^^...
                // this code is hacky, because it depends on undocumented term.id - cover it with sufficient test cases!
                if (/\"\^\^/.test(term.id)) {
                  // do not surround with double quotes
                  // example: 1
                } else {
                  // surround with double quotes
                  // example: "This is a string containing some \"double quotes\""
                  variableValue = `"${variableValue}"`;
                }
                // test whether there is a language tag @...
                // this code is hacky, because it depends on undocumented term.id - cover it with sufficient test cases!
                const lt = /\@(.*)$/.exec(term.id);
                if (lt) {
                  // append language tag
                  // example: "This is a string in English"@en
                  variableValue = `${variableValue}@${lt[1]}`;
                }
                break;
              case "NamedNode":
                // surround with triangle brackets
                // example: <https://www.example.com/data/o1>
                variableValue = `<${term.value}>`;
                break;
              default:
                break;
            }
            if (variableValue && !variables[name].includes(variableValue)) {
              variables[name].push(variableValue);
            }
          }
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
