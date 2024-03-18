import {useState} from 'react';
import {useResourceContext} from "react-admin";
import {useLocation, useNavigate} from 'react-router-dom';
import {Component} from "react";

import TemplatedQueryForm from "./TemplatedQueryForm.jsx";
import ListResultTable from "./ListResultTable.jsx";
import config from "../../config";

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

  const query = config.queries.filter(
    (query) => query.id === resource
  )[0];
  const isTemplatedQuery = query.variables !== undefined;
  let tableEnabled = !isTemplatedQuery;
  
  const [submitted, setSubmitted] = useState(false);
  const [searchPar, setSearchPar] = useState({});

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

    // if (submitted) {
    //   console.log("submitted");
    //  // const queryParams = new URLSearchParams(location.search);
    //   console.log(searchPar);
    // }
  }

  const onSubmit = (formVariables) => {
    console.log('hieronder de formVariables');
    console.log(formVariables);
    
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

    if (submitted){
      //console.log("second time");
      //console.log(searchPar);
      navigate(`?${queryString}`);
    }
    if (queryString.length > 0) {
      navigate(`?${queryString}`);
      setSubmitted(true);
    }
  }

  return (
    <>
      {isTemplatedQuery && !tableEnabled && <TemplatedQueryForm variableOptions={query.variables} onSubmit={onSubmit} submitted={submitted} searchPar={searchPar} />}
      {tableEnabled && <ListResultTable {...props} variables={variables}/>}
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
