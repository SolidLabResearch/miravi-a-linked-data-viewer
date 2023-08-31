import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import { Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { Component } from "react";

/**
 * @param {object} props the props passed to the component
 * @param {object} props.context the query context
 * @param {string} props.source the source to check
 * @param {string} props.proxyUrl the proxy url to use if querying is used for sources
 * @returns {Component} an icon indicating whether the query was executed succesfully or not
 */
function SourceFetchStatusIcon({ context, source, proxyUrl }) {
  let actualSource = source;
  if (context.useProxy) {
    actualSource = `${proxyUrl}${source}`;
  }
  const status = context.fetchSuccess[actualSource];
  if (status) {
    return (
      <Tooltip title="Query was succesfull">
        <CheckBoxIcon size="small" />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title="Query failed">
        <CancelIcon size="small" />;
      </Tooltip>
    );
  }
}

SourceFetchStatusIcon.propTypes = {
  context: PropTypes.object.isRequired,
  source: PropTypes.string.isRequired,
  proxyUrl: PropTypes.string.isRequired,
};

export default SourceFetchStatusIcon;
