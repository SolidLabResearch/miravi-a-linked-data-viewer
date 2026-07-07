import { CircularProgress, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PropTypes from "prop-types";
import { Component } from "react";
import { getDefaultAuth } from "trustflows-client";

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
      method: "GET",
      headers: {
        Accept: "application/n-quads,application/trig;q=0.9,text/turtle;q=0.8,application/n-triples;q=0.7,*/*;q=0.1",
      },
    });
    return response.status === 401 || response.status === 403;
  } catch (error) {
    // If plain fetch fails due CORS or network constraints, retry with authenticated fetch
    // to infer whether authentication might be required for this source.
    try {
      const auth = getDefaultAuth();
      const authFetch = auth.createAuthFetch();
      const response = await authFetch(source, {
        method: "GET",
        headers: {
          Accept: "application/n-quads,application/trig;q=0.9,text/turtle;q=0.8,application/n-triples;q=0.7,*/*;q=0.1",
        },
      });
      return response.status === 401 || response.status === 403;
    } catch (fallbackError) {
      return undefined;
    }
  }
}

export default SourceAuthenticationIcon;
