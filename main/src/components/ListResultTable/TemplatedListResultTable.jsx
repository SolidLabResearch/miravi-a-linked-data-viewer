import React, { useState, useEffect, Component } from 'react';
import { useResourceContext, Loading, useDataProvider, useResourceDefinition } from "react-admin";
import { useLocation, useNavigate } from 'react-router-dom';
import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import QueryResultList from "./QueryResultList/QueryResultList";

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
  const [waitingForVariableOptions, setWaitingForVariableOptions] = useState(!!(query.variables || query.indirectVariables));
  const [variableOptions, setVariableOptions] = useState({});
  const [variableValues, setVariableValues] = useState({});
  const [variablesSubmitted, setVariablesSubmitted] = useState(false);
  const isTemplatedQuery = !!(query.variables || query.indirectVariables);
  const templatedQueryFormEnabled = isTemplatedQuery && !variablesSubmitted;

  // LOG console.log(`--- TemplatedListResultTable #${++templatedListResultTableCounter}`);
  // LOG console.log(`props: ${JSON.stringify(props, null, 2)}`);
  // LOG console.log(`resource: ${resource}`);
  // LOG console.log(`waitingForVariableOptions: ${waitingForVariableOptions}`);
  // LOG console.log(`variableOptions: ${JSON.stringify(variableOptions, null, 2)}`);
  // LOG console.log(`variableValues: ${JSON.stringify(variableValues, null, 2)}`);
  // LOG console.log(`variablesSubmitted: ${variablesSubmitted}`);
  // LOG console.log(`isTemplatedQuery: ${isTemplatedQuery}`);
  // LOG console.log(`templatedQueryFormEnabled: ${templatedQueryFormEnabled}`);

  useEffect(() => {
    (async () => {
      if (query.variables || query.indirectVariables) {
        // LOG console.log('start waiting for variable options');
        setVariableOptions(await dataProvider.getVariableOptions(query));
        // LOG console.log('done waiting for variable options');
        setWaitingForVariableOptions(false);
      }
    })();
  }, [resource]);


  // Cover a transient state after creation of a new custom query. EventEmitter's event processing may still be in progress.
  if (!resourceDef.options) {
    // LOG console.log('TemplatedListResultTable waiting for custom query creation to complete.');
    return false;
  }

  if (waitingForVariableOptions) {
    // LOG console.log('TemplatedListResultTable waiting for variable options.');
    return <Loading sx={{ height: "auto" }} loadingSecondary={"The options for the variables in this query are loading. Just a moment please."} />;
  }

  if (isTemplatedQuery) {
    // Check if an update of variable values is needed from user supplied url search parameters
    const possibleNewVariableValues = variableValuesFromUrlSearchParams(new URLSearchParams(location.search), variableOptions);
    // Protect against incomplete or omitted variable values, as is the case when changing pagination,
    // where List causes a revisit but does not include variable values in url search parameters
    if (Object.keys(possibleNewVariableValues).length == Object.keys(variableOptions).length) {
      if (Object.keys(variableOptions).some((v) => variableValues[v] != possibleNewVariableValues[v])) {
        // LOG console.log("Accepting new variable values from user supplied url search parameters.");
        setVariableValues(possibleNewVariableValues);
        setVariablesSubmitted(true);
        return false;
      }
    }
  }

  const submitVariables = (formVariables) => {
    // Create url search parameters from new variable values received from the TemplatedQueryForm fields
    // Note: possible previous url search parameters involving pagination are discarded here on purpose
    const urlSearchParams = urlSearchParamsFromVariableValues(formVariables);
    setVariableValues(formVariables);
    setVariablesSubmitted(true);
    // revisit with new search parameters
    navigate(`?${urlSearchParams.toString()}`);
  }

  const changeVariables = () => {
    setVariablesSubmitted(false);
    // revisit with same search parameters
    navigate(location.search);
  }

  return (
    templatedQueryFormEnabled
    ? <TemplatedQueryForm variableOptions={variableOptions} defaultFormVariables={variableValues} onSubmit={submitVariables} />
    : <QueryResultList {...props} resource={resource} variableValues={variableValues} changeVariables={changeVariables} submitted={variablesSubmitted} />
  )
}

/**
 * Make urlSearchParams from variableValues
 * @param {Object} variableValues 
 * @returns {UrlSearchParams} urlSearchParams
 */
function urlSearchParamsFromVariableValues(variableValues) {
  const urlSearchParams = new URLSearchParams();
  for (const [variableName, variableValue] of Object.entries(variableValues)) {
    if (variableValue) {
      urlSearchParams.set(variableName, variableValue);
    }
  }
  return urlSearchParams;
}

/**
 * Make variableValues from urlSearchParams
 * @param {URLSearchParams} urlSearchParams 
 * @param {Object} variableOptions used to filter
 * @returns {Object} variableValues
 */
function variableValuesFromUrlSearchParams(urlSearchParams, variableOptions) {
  const variableValues = {};
  for (const variableName of Object.keys(variableOptions)) {
    if (urlSearchParams.has(variableName)) {
      variableValues[variableName] = urlSearchParams.get(variableName);
    }
  }
  return variableValues;
}

export default TemplatedListResultTable;
