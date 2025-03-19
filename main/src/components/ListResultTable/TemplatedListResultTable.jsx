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
  const query = configManager.getQueryWorkingCopyById(resource);

  const location = useLocation();
  const navigate = useNavigate();
  const [submittedVariables, setSubmittedVariables] = useState({});
  // TODO rename submitted to variablesSubmitted and check if this is not a derived state
  const [submitted, setSubmitted] = useState(false);
  const [searchPar, setSearchPar] = useState({});
  const [loading, setLoading] = useState(!!(query.variables || query.indirectVariables));
  const [queryVariables, setQueryVariables] = useState(query.variables);

  useEffect(() => {

    const fetchQuery = async () => {

      if (query.variables || query.indirectVariables){
        // Handles the query variables (defined and indirect ones)
        // TODO modify getIndirectVariables so that it doesn't handle fixed variables; we already have these in query.variables
        const vars = await dataProvider.getIndirectVariables(query);
        setQueryVariables(vars);
        setLoading(false);
      }
    };

    fetchQuery();
  }, [resource]);

  const areQueryVariablesLoaded = queryVariables !== undefined;
  let tableEnabled = !areQueryVariablesLoaded;

  // LOG console.log(`--- TemplatedListResultTable #${++templatedListResultTableCounter}`);
  // LOG console.log(`props: ${JSON.stringify(props, null, 2)}`);
  // LOG console.log(`resource: ${resource}`);
  // LOG console.log(`loading: ${loading}`);
  // LOG console.log(`areQueryVariablesLoaded: ${areQueryVariablesLoaded}`);
  // LOG console.log(`tableEnabled: ${tableEnabled}`);

  // Cover a transient state after creation of a new custom query. EventEmitter's event processing may still be in progress.
  if (!resourceDef.options) {
    // LOG console.log(`TemplatedListResultTable waiting for custom query creation to complete`);
    return false;
  }

  if (loading) {
    // LOG console.log(`TemplatedListResultTable waiting for indirect variables`);
    return <Loading loadingSecondary={"Loading indirect variables. Just a moment please."} />;
  }

  if (areQueryVariablesLoaded) {
    // Update variables from query parameters
    const queryParams = new URLSearchParams(location.search);
    const urlVariables = {};
    for (const variableName of Object.keys(queryVariables)) {
      if (queryParams.has(variableName)) {
        urlVariables[variableName] = queryParams.get(variableName);
      }
    }
    if (!equalSimpleObjects(submittedVariables, urlVariables)) {
      setSubmittedVariables(urlVariables);
    } else {
      tableEnabled = (Object.keys(submittedVariables).length === Object.keys(queryVariables).length);
    }
  }

  const onSubmit = (formVariables) => {

    if (!submitted) {
      setSearchPar(formVariables);
    }
    // Update query parameters from the TemplatedQueryForm fields
    const queryParams = new URLSearchParams(location.search);
    for (const [variableName, variableValue] of Object.entries(formVariables)) {
      if (variableValue) {
        queryParams.set(variableName, variableValue);
      }
    }

    const queryString = queryParams.toString();
    if (queryString.length > 0) {
      if (!submitted) setSubmitted(true);

      navigate(`?${queryString}`);
    }
  }

  const changeVariables = () => {
    setSubmitted(false);
    navigate();
  }

  return (
    <>
      {areQueryVariablesLoaded && !tableEnabled &&
        <TemplatedQueryForm
          variableOptions={queryVariables}
          onSubmit={onSubmit}
          submitted={submitted}
          searchPar={searchPar}
        />
      }
      {tableEnabled && <ListResultTable {...props} resource={resource} variables={submittedVariables} changeVariables={changeVariables} submitted={submitted} />}
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
