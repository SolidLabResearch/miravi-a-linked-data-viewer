import PropTypes from "prop-types";
import { Component } from "react";

/**
 * @param {object} props - the props passed down to the component
 * @param {object} props.record - the object containing the data
 * @param {string} props.source - the key of the data to be displayed in this field
 * @returns {Component} a custom text field that displays the value of the data in case there is no typeMapper defined for the type of the source
 */
function CustomTextField({ record, source }) {
  const value = record[source];
  let text = value ? value : "";
  if (value) {
    text = value.value ? value.value : value.id;
  }
  return <span>{text}</span>;
}

CustomTextField.propTypes = {
  record: PropTypes.object,
  source: PropTypes.string,
};

export default CustomTextField;