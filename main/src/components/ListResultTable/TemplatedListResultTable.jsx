import React, { useState, useEffect } from 'react';
import { useResourceContext, Loading, useDataProvider, useResourceDefinition } from "react-admin";
import { useLocation, useNavigate } from 'react-router-dom';
import { Component } from "react";
import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import ListResultTable from "./ListResultTable.jsx";

import configManager from '../../configManager/configManager.js';

/* LOG */ let templatedListResultTableCounter = 0;

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
  const [waitingForVariableOptions, setWaitingForVariableOptions] = useState(!!(query.variables || query.indirectVariables));
  const [variableOptions, setVariableOptions] = useState(query.variables);
  const [variablesSubmitted, setVariablesSubmitted] = useState(false);
  const [acceptImposedVariables, setAcceptImposedVariables] = useState(true);
  const isTemplatedQuery = !!(query.variables || query.indirectVariables);
  const templatedQueryFormEnabled = isTemplatedQuery && !variablesSubmitted;

  /* LOG */ console.log(`--- TemplatedListResultTable #${++templatedListResultTableCounter}`);
  /* LOG */ console.log(`props: ${JSON.stringify(props, null, 2)}`);
  /* LOG */ console.log(`resource: ${resource}`);
  /* LOG */ console.log(`waitingForVariableOptions: ${waitingForVariableOptions}`);
  /* LOG */ console.log(`variableOptions: ${JSON.stringify(variableOptions, null, 2)}`);
  /* LOG */ console.log(`variablesSubmitted: ${variablesSubmitted}`);
  /* LOG */ console.log(`acceptImposedVariables: ${acceptImposedVariables}`);
  /* LOG */ console.log(`isTemplatedQuery: ${isTemplatedQuery}`);
  /* LOG */ console.log(`templatedQueryFormEnabled: ${templatedQueryFormEnabled}`);

  useEffect(() => {

    const fetchQueryVariableOptions = async () => {

      if (query.variables || query.indirectVariables){
        // Handles the query variables (defined and indirect ones)
        // TODO modify getIndirectVariables so that it doesn't handle fixed variables; we already have these in query.variables
        const vars = await dataProvider.getIndirectVariables(query);
        setVariableOptions(vars);
        setWaitingForVariableOptions(false);
      }
    };

    fetchQueryVariableOptions();
  }, [resource]);


  // Cover a transient state after creation of a new custom query. EventEmitter's event processing may still be in progress.
  if (!resourceDef.options) {
    /* LOG */ console.log(`TemplatedListResultTable waiting for custom query creation to complete`);
    return false;
  }

  if (waitingForVariableOptions) {
    return <Loading loadingSecondary={"Loading variables. Just a moment please."} />;
  }

  const variableValues = {};
  if (isTemplatedQuery) {
    // Update variable values from url search parameters
    const urlSearchParams = new URLSearchParams(location.search);
    for (const variableName of Object.keys(variableOptions)) {
      if (urlSearchParams.has(variableName)) {
        variableValues[variableName] = urlSearchParams.get(variableName);
      }
    }
    if (acceptImposedVariables) {
      if (Object.keys(variableValues).length == Object.keys(variableOptions).length) {
        /* LOG */ console.log("handling visit with variable values imposed by the user; rerender pending");
        setVariablesSubmitted(true);
        setAcceptImposedVariables(false);
        return false;
      }
    }
  }

  /* LOG */ console.log(`variableValues: ${JSON.stringify(variableValues, null, 2)}`);

  const submitVariables = (formVariables) => {
    // Update url search parameters from new variable values received from the TemplatedQueryForm fields
    const urlSearchParams = new URLSearchParams(location.search);
    for (const [variableName, variableValue] of Object.entries(formVariables)) {
      if (variableValue) {
        urlSearchParams.set(variableName, variableValue);
      }
    }
    setVariablesSubmitted(true);
    setAcceptImposedVariables(false);
    // revisit with new search parameters
    navigate(`?${urlSearchParams.toString()}`);
  }

  const changeVariables = () => {
    setVariablesSubmitted(false);
    // revisit with same search parameters
    navigate(location.search);
  }

  return (
    <>
      {templatedQueryFormEnabled
       ? <TemplatedQueryForm variableOptions={variableOptions} defaultFormVariables={variableValues} onSubmit={submitVariables} />
       : <ListResultTable {...props} resource={resource} variables={variableValues} changeVariables={changeVariables} submitted={variablesSubmitted} />
      }
    </>
  )
}

export default TemplatedListResultTable;
