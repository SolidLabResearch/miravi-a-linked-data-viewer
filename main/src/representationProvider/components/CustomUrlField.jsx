import { getRawData } from "./processFunction";
import { UrlField } from "react-admin";
import PropTypes from "prop-types";
import { Component } from "react";
import { Term } from "sparqljs";

/**
 * @param {object} props - the props passed down to the component
 * @param {Term} props.record - an object of RDF/JS Term
 * @param {string} props.source - the key of the object to be processed
 * @returns {Component} a component that displays the url of the given RDF/JS Term
 */
function CustomURLField({ source, record }) {
  record[source] = getRawData(record, source);

  return <UrlField record={record} source={source} target="_blank" rel="noopener noreferrer"/>;
}

CustomURLField.propTypes = {
  source: PropTypes.string,
  record: PropTypes.object,
};

export default CustomURLField;