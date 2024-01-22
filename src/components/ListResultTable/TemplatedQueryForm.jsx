import {SelectInput, SimpleForm, required} from "react-admin";
import {Component} from "react";
import PropTypes from "prop-types";

/**
 * A custom form to set/choose values for variables for a templated query before that query is executed
 * @param {object} props - the props passed down to the component
 * @returns {Component} the templated query form component
 */
const TemplatedQueryForm = (props) => {
  const {
    variableOptions,
    onSubmit
  } = props;
  return (
    <SimpleForm onSubmit={onSubmit}>
      {Object.entries(variableOptions).map(([name, options]) => (
        <SelectInput key={name} source={name} name={name} label={name} validate={required()} choices={
          options.map((option) => ({
            id: option,
            name: option
          }))
        }/>
      ))}
    </SimpleForm>
  );
}

TemplatedQueryForm.propTypes = {
  variableOptions: PropTypes.object,
  onSubmit: PropTypes.func,
};

export default TemplatedQueryForm;
