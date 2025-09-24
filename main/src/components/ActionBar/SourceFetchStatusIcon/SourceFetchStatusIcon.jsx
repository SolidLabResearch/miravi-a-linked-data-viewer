import PendingIcon from '@mui/icons-material/Pending';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from "@mui/icons-material/Cancel";
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { Component } from "react";
import comunicaEngineWrapper from '../../../comunicaEngineWrapper/comunicaEngineWrapper';

/**
 * @param {object} props - the props passed to the component
 * @param {string} props.source - the source to check
 * @returns {Component} an icon indicating whether the query was executed succesfully or not
 */
function SourceFetchStatusIcon({ source }) {
  const status = comunicaEngineWrapper.getFetchStatusNumber(source);

  if (comunicaEngineWrapper.getFetchSuccess(source) === undefined) {
    return (
      <Tooltip title="Not fetched">
        <PendingIcon size="small" />
      </Tooltip>
    );
  } else if (comunicaEngineWrapper.getFetchSuccess(source)) {
    return (
      <Tooltip title="Fetch was successful">
        <CheckIcon size="small" />
      </Tooltip>
    );
  }
  else if (status == 401 || status == 403){
    return (
      <Tooltip title="Unauthorized">
        <RemoveCircleOutlineIcon size="small" />
      </Tooltip>
    );
  }
  else {
    return (
      <Tooltip title="Fetch failed">
        <CancelIcon size="small" />
      </Tooltip>
    );
  }
}

SourceFetchStatusIcon.propTypes = {
  source: PropTypes.string.isRequired
};

export default SourceFetchStatusIcon;
