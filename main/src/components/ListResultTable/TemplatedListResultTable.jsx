import React, { useState, useEffect } from 'react';
import { useResourceContext, Loading, useDataProvider, useResourceDefinition } from "react-admin";
import { useLocation, useNavigate } from 'react-router-dom';
import { Component } from "react";
import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import ListResultTable from "./ListResultTable.jsx";

import configManager from '../../configManager/configManager.js';

// LOG let templatedListResultTableCounter = 0;

/**
 * A wrapper component around ListResultTable, to support templated queries
 * @param {object} props - the props passed down to the component
 * @returns {Component} the wrapper component
 */
const TemplatedListResultTable = (props) => {
  const resourceDef = useResourceDefinition();
  const dataProvider = useDataProvider();
  const resource = useResourceContext();
  const location = useLocation();
  const navigate = useNavigate();
  const query = configManager.getQueryWorkingCopyById(resource);
  const [queryVariables, setQueryVariables] = useState(query.variables);
  const [waitingForVariables, setWaitingForVariables] = useState(!!(query.variables || query.indirectVariables));
  const [activeVariables, setActiveVariables] = useState({});
  // TODO  check if this is not a derived state
  const [variablesSubmitted, setVariablesSubmitted] = useState(false);
  const [searchPar, setSearchPar] = useState({});

  useEffect(() => {

    const fetchQuery = async () => {

      if (query.variables || query.indirectVariables){
        // Handles the query variables (defined and indirect ones)
        // TODO modify getIndirectVariables so that it doesn't handle fixed variables; we already have these in query.variables
        const vars = await dataProvider.getIndirectVariables(query);
        setQueryVariables(vars);
        setWaitingForVariables(false);
      }
    };

    fetchQuery();
  }, [resource]);

  const isTemplatedQuery = queryVariables !== undefined;
  let tableEnabled = !isTemplatedQuery;

  // LOG console.log(`--- TemplatedListResultTable #${++templatedListResultTableCounter}`);
  // LOG console.log(`props: ${JSON.stringify(props, null, 2)}`);
  // LOG console.log(`resource: ${resource}`);
  // LOG console.log(`waitingForVariables: ${waitingForVariables}`);
  // LOG console.log(`isTemplatedQuery: ${isTemplatedQuery}`);
  // LOG console.log(`tableEnabled: ${tableEnabled}`);

  // Cover a transient state after creation of a new custom query. EventEmitter's event processing may still be in progress.
  if (!resourceDef.options) {
    // LOG console.log(`TemplatedListResultTable waiting for custom query creation to complete`);
    return false;
  }

  if (waitingForVariables) {
    // LOG console.log(`TemplatedListResultTable waiting for variables lists`);
    return <Loading loadingSecondary={"Loading variables. Just a moment please."} />;
  }

  if (isTemplatedQuery) {
    // Update active variables from url search parameters
    const urlSearchParams = new URLSearchParams(location.search);
    const urlVariables = {};
    for (const variableName of Object.keys(queryVariables)) {
      if (urlSearchParams.has(variableName)) {
        urlVariables[variableName] = urlSearchParams.get(variableName);
      }
    }
    if (!equalSimpleObjects(activeVariables, urlVariables)) {
      setActiveVariables(urlVariables);
    } else {
      tableEnabled = (Object.keys(activeVariables).length === Object.keys(queryVariables).length);
    }
  }

  const submitVariables = (formVariables) => {
    if (!variablesSubmitted) {
      setSearchPar(formVariables);
    }
    // Update url search parameters from the TemplatedQueryForm fields
    const urlSearchParams = new URLSearchParams(location.search);
    for (const [variableName, variableValue] of Object.entries(formVariables)) {
      if (variableValue) {
        urlSearchParams.set(variableName, variableValue);
      }
    }

    const urlSearchString = urlSearchParams.toString();
    if (urlSearchString.length > 0) {
      setVariablesSubmitted(true);
      navigate(`?${urlSearchString}`);
    }
  }

  const changeVariables = () => {
    setVariablesSubmitted(false);
    navigate();
  }

  return (
    <>
      {isTemplatedQuery && !tableEnabled &&
        <TemplatedQueryForm
          variableOptions={queryVariables}
          onSubmit={submitVariables}
          submitted={variablesSubmitted}
          searchPar={searchPar}
        />
      }
      {tableEnabled && <ListResultTable {...props} resource={resource} variables={activeVariables} changeVariables={changeVariables} submitted={variablesSubmitted} />}
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


export default TemplatedListResultTable;
