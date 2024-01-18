import {useState} from 'react';
import ListResultTable from "./ListResultTable.jsx";
import {SelectInput, SimpleForm, useResourceContext, required} from "react-admin";
import {useLocation, useNavigate} from 'react-router-dom';
import {Component} from "react";

import config from "../../config";

/**
 * A custom form to set/choose values for variables for a templated query before that query is executed
 * @param {object} props - the props passed down to the component
 * @returns {Component} the templated query form component
 */
const TemplatedQueryForm = (props) => {
  const resource = useResourceContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [variables, setVariables] = useState({});

  const query = config.queries.filter(
    (query) => query.id === resource
  )[0];
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
    // Update query parameters from the form fields
    const queryParams = new URLSearchParams(location.search);
    for (const [variableName, variableValue] of Object.entries(formVariables)) {
      if (variableValue) {
        queryParams.set(variableName, variableValue);
      }
    }
    const queryString= queryParams.toString();
    if (queryString.length > 0) {
      navigate(`?${queryString}`);
    }
  }

  return (
    <>
      {isTemplatedQuery && !tableEnabled && (
        <SimpleForm onSubmit={onSubmit}>
          {Object.entries(query.variables).map(([name, options]) => (
            <SelectInput key={name} source={name} name={name} label={name} validate={required()} choices={
              options.map((option) => ({
                id: option,
                name: option
              }))
            }/>
          ))}
        </SimpleForm>
      )}
      {tableEnabled && (
        <ListResultTable {...props} variables={variables}/>
      )}
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
export default TemplatedQueryForm;
