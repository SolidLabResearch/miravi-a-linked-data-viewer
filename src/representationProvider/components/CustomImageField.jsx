import { getRawData } from "./processFunction";
import { ImageField } from "react-admin";
import PropTypes from "prop-types";
import { Component } from "react";
import { Term } from "sparqljs";

/**
 * @param {object} props - the props passed down to the component
 * @param {Term} props.record - the object containing the data
 * @param {string} props.source - the key of the data to be displayed in this field
 * @returns {Component} a component that displays the image behind the url of the given RDF/JS term
 */
function CustomImageField({ source, record }) {
  record[source] = getRawData(record, source);

  return <ImageField record={record} source={source} />;
}

CustomImageField.propTypes = {
  source: PropTypes.string,
  record: PropTypes.object,
};

export default CustomImageField;
