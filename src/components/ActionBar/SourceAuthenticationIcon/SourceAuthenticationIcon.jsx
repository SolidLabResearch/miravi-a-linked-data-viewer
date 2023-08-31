import { CircularProgress, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PropTypes from "prop-types";
import { Component } from "react";

/**
 * 
 * @param {object} props - the props passed to the component
 * @param {string} props.source - the source to check 
 * @returns {Component} an icon indicating whether the source requires authentication or not (or if it is uncertain due to an error fetching the source)
 */
function SourceAuthenticationIcon({ source }) {
  const [isFetched, setIsFetched] = useState(false);
  const [isAuthenticationRequired, setAuthenticationRequired] = useState(false);

  useEffect(() => {
    authenticationRequired(source).then((required) => {
      setAuthenticationRequired(required);
      setIsFetched(true);
    });
  }, [source]);

  if (isFetched) {
    if (isAuthenticationRequired === undefined) {
      return (
        <Tooltip title="Uncertain if authentication is required">
          <QuestionMarkIcon size="small" />
        </Tooltip>
      );
    } else if (isAuthenticationRequired) {
      return (
        <Tooltip title="Authentication required">
          <LockIcon size="small" />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip title="No authentication required">
          <LockOpenIcon size="small" />
        </Tooltip>
      );
    }
  } else {
    return <CircularProgress size={20} />;
  }
}

SourceAuthenticationIcon.propTypes = {
  source: PropTypes.string.isRequired,
};

/**
 * Given a source, check if it requires authentication or not
 * @param {string} source - the source to check
 * @returns {?boolean} whether the source requires authentication or not, or undefined if it is uncertain
 */
async function authenticationRequired(source) {
  try {
    const response = await fetch(source, {
      method: "HEAD",
    });
    return response.status === 401 || response.status === 403;
  } catch (error) {
    return undefined;
  }
}

export default SourceAuthenticationIcon;
