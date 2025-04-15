import { CircularProgress, Tooltip, IconButton } from "@mui/material";
import { Component, useState } from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PropTypes from "prop-types";
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { coreVerify } from '../../../vendor/vcCore';
import comunicaEngineWrapper from '../../../comunicaEngineWrapper/comunicaEngineWrapper';
import { translateUrlToProxiedUrl } from '../../../lib/utils';

const VERIFICATION_STATES = {
  VERIFIED: 'VERIFIED',
  NOT_VERIFIED: 'NOT_VERIFIED',
  INVALID_SOURCE: 'INVALID_SOURCE',
  ERROR: 'ERROR'
}

/**
 * @param {object} props - the props passed to the component
 * @param {string} props.source - the source to check
 * @param {array} props.httpProxies - array of httpProxy definitions
 * @returns {Component} an icon indicating whether the source was verified or not
 */
function SourceVerificationIcon({ source, httpProxies }) {
  let sourceUrl = translateUrlToProxiedUrl(source, httpProxies);

  const [isLoading, setIsLoading] = useState(true);
  const [verificationState, setVerificationState] = useState(undefined);
  const [needsVerification, setNeedsVerification] = useState(false);

  /**
   * The verifiable credentials verify function
   * @param {string} source - the source to check
   * @param {function} fetchFunction - the fetch function to use
   * @ returns {string} - one of the VERIFICATION_STATES
   */
  const verifyFunction = async (source, fetchFunction) => {
    try {
      const response = await fetchFunction(source);
      const verifiableCredential = await response.json();
      const { validationResult, verificationResult } = await coreVerify(verifiableCredential);
      if (validationResult.valid) {
        if (verificationResult.verified) {
          return VERIFICATION_STATES.VERIFIED;
        } else {
          return VERIFICATION_STATES.NOT_VERIFIED;
        }
      } else {
        return VERIFICATION_STATES.INVALID_SOURCE;
      }
    } catch (error) {
      return VERIFICATION_STATES.ERROR;
    }
  };

  /**
   * Handle the request for source verification
   */
  function verify() {
    setNeedsVerification(true);
    verifyFunction(sourceUrl, comunicaEngineWrapper.getUnderlyingFetchFunction()).then((result) => {
      setVerificationState(result);
      setIsLoading(false);
    })
  }

  if (needsVerification) {
    if (isLoading) {
      return <CircularProgress size={20} />;
    } else {
      switch (verificationState) {
        case VERIFICATION_STATES.VERIFIED:
          return (
            <Tooltip title="Verification succeeded">
              <GppGoodIcon size="small" />
            </Tooltip>
          );
          break;
        case VERIFICATION_STATES.NOT_VERIFIED:
          return (
            <Tooltip title="Verification failed">
              <GppBadIcon size="small" />
            </Tooltip>
          );
          break;
        default:
          return (
            <Tooltip title="No credential found to verify">
              <GppMaybeIcon size="small" />
            </Tooltip>
          );
          break;
      }
    }
  } else {
    return (
      <Tooltip title="Verify source">
        <IconButton sx={{ color: "#1976D2", padding: "0", marginLeft: "0" }} onClick={verify}>
          <QuestionMarkIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }
}

SourceVerificationIcon.propTypes = {
  source: PropTypes.string.isRequired,
  httpProxies: PropTypes.array.isRequired,
}

export default SourceVerificationIcon;