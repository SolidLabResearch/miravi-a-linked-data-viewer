import { useState, useEffect, Component } from 'react';
import { useResourceContext, Loading, useDataProvider, useResourceDefinition } from "react-admin";
import { useLocation, useNavigate } from 'react-router-dom';
import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import QueryResultList from "./QueryResultList/QueryResultList";
import ErrorDisplay from "../../components/ErrorDisplay/ErrorDisplay";

import configManager from '../../configManager/configManager.js';
import comunicaEngineWrapper from '../../comunicaEngineWrapper/comunicaEngineWrapper.js';

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
  const [updateTimestamp, setUpdateTimestamp] = useState(0);
  const [askingForVariableOptions, setAskingForVariableOptions] = useState(false);
  const [waitingForVariableOptions, setWaitingForVariableOptions] = useState(false);
  const [variableOptionsError, setVariableOptionsError] = useState("");
  const [variableOptions, setVariableOptions] = useState({});
  const [variableValues, setVariableValues] = useState({});
  const [variablesSubmitted, setVariablesSubmitted] = useState(false);
  const isTemplatedQuery = !!(query.variables || query.indirectVariables);
  const templatedQueryFormEnabled = isTemplatedQuery && !variablesSubmitted;

  // LOG console.log(`--- TemplatedListResultTable #${++templatedListResultTableCounter}`);
  // LOG console.log(`props: ${JSON.stringify(props, null, 2)}`);
  // LOG console.log(`resource: ${resource}`);
  // LOG console.log(`updateTimestamp: ${updateTimestamp}`);
  // LOG console.log(`askingForVariableOptions: ${askingForVariableOptions}`);
  // LOG console.log(`waitingForVariableOptions: ${waitingForVariableOptions}`);
  // LOG console.log(`variableOptionsError: ${variableOptionsError}`);
  // LOG console.log(`variableOptions: ${JSON.stringify(variableOptions, null, 2)}`);
  // LOG console.log(`variableValues: ${JSON.stringify(variableValues, null, 2)}`);
  // LOG console.log(`variablesSubmitted: ${variablesSubmitted}`);
  // LOG console.log(`isTemplatedQuery: ${isTemplatedQuery}`);
  // LOG console.log(`templatedQueryFormEnabled: ${templatedQueryFormEnabled}`);

  useEffect(() => {
    const t = location.state?.updateTimestamp;
    if (t && t != updateTimestamp) {
      setUpdateTimestamp(location.state.updateTimestamp);
      // LOG console.log(`New updateTimestamp: ${t}`);
      setAskingForVariableOptions(false);
      setWaitingForVariableOptions(false);
      setVariableOptionsError("");
      setVariableOptions({});
      setVariableValues({});
      setVariablesSubmitted(false);
      // we need next because comunica would use its cache even if some of its context parameters have changed
      comunicaEngineWrapper.reset();
    }
  }, [location.state]);

  useEffect(() => {
    (async () => {
      if (askingForVariableOptions) {
        setAskingForVariableOptions(false);
        try {
          // LOG console.log('Start waiting for variable options');
          setWaitingForVariableOptions(true);
          // LOG const t1 = Date.now();
          setVariableOptions(await dataProvider.getVariableOptions(query));
          // LOG const t2 = Date.now();
          // LOG console.log(`Done waiting for variable options after ${t2-t1} ms`);
          setWaitingForVariableOptions(false);
        } catch (error) {
          // LOG console.log(`Error getting variable options: ${error.message}`);
          setVariableOptionsError(error.message);
        }
      }
    })();
  }, [askingForVariableOptions]);

  // Cover a transient state after creation of a new custom query. EventEmitter's event processing may still be in progress.
  if (!resourceDef.options) {
    // LOG console.log('TemplatedListResultTable waiting for custom query creation to complete.');
    return false;
  }

  if (variableOptionsError) {
    // LOG console.log(`TemplatedListResultTable variable options error: ${variableOptionsError}`);
    return <ErrorDisplay errorMessage={variableOptionsError} />;
  }

  if (isTemplatedQuery) {
    if (!Object.keys(variableOptions).length) {
      // Check for initial visit with url search parameters
      if (!askingForVariableOptions && !waitingForVariableOptions && !variablesSubmitted) {
        const vv = initialVariableValuesFromUrlSearchParams(new URLSearchParams(location.search));
        if (Object.keys(vv).length) {
          // LOG console.log("Accepting initial variable values from url search parameters.");
          setVariableValues(vv);
          setVariablesSubmitted(true);
          return false;
        }
        // LOG console.log("Trigger the search for variable options in body.");
        setAskingForVariableOptions(true);
        return false;
      }
    } else {
      // Check for next visit with url search parameters
      const vv = newVariableValuesFromUrlSearchParams(new URLSearchParams(location.search), variableValues);
      if (vv && Object.keys(variableValues).some((v) => variableValues[v] != vv[v])) {
        // LOG console.log("Accepting new variable values from url search parameters.");
        setVariableValues(vv);
        setVariablesSubmitted(true);
        return false;
      }
    }
  }

  if (waitingForVariableOptions) {
    // LOG console.log('TemplatedListResultTable waiting for variable options.');
    return <Loading sx={{ height: "auto" }} loadingSecondary={"The options for the variables in this query are loading. Just a moment please."} />;
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
    if (!Object.keys(variableOptions).length) {
      if (!askingForVariableOptions) {
        // LOG console.log("Trigger the search for variable options in changeVariables.");
        setAskingForVariableOptions(true);
      }
    }
    // revisit with same search parameters
    navigate(location.search);
  }

  return (
    templatedQueryFormEnabled
    ? <TemplatedQueryForm variableOptions={variableOptions} defaultFormVariables={variableValues} onSubmit={submitVariables} />
    : <QueryResultList updateTimestamp={updateTimestamp}{...props} resource={resource} variableValues={variableValues} changeVariables={changeVariables} submitted={variablesSubmitted} />
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
 * Make initial variableValues from urlSearchParams
 * @param {URLSearchParams} urlSearchParams 
 * @returns {Object} variableValues
 */
function initialVariableValuesFromUrlSearchParams(urlSearchParams) {
  const variableValues = {};
  for (const [key, value] of urlSearchParams.entries()) {
    variableValues[key] = value;
  }
  return variableValues;
}

/**
 * Make new variableValues from urlSearchParams
 * @param {URLSearchParams} urlSearchParams the input
 * @param {Object} variableValues the current variableValues
 * @returns {Object} new variableValues or undefined, if not all variable keys in the input
 */
function newVariableValuesFromUrlSearchParams(urlSearchParams, variableValues) {
  const newVariableValues = {};
  for (const variableName of Object.keys(variableValues)) {
    if (urlSearchParams.has(variableName)) {
      newVariableValues[variableName] = urlSearchParams.get(variableName);
    }
  }
  if (Object.keys(newVariableValues).length == Object.keys(variableValues).length) {
    return newVariableValues;
  }
  return undefined;
}

export default TemplatedListResultTable;
