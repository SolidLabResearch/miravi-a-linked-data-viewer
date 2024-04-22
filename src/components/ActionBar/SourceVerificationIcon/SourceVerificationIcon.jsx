import { CircularProgress, Tooltip } from "@mui/material";
import { Component, useState } from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import { Button } from "react-admin";
import CancelIcon from "@mui/icons-material/Cancel";
import PropTypes from "prop-types";
import GppBadIcon from '@mui/icons-material/GppBad'; // FAILED
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // NOT VERIFIABLE
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip'; // SUCCESS
import WarningIcon from '@mui/icons-material/Warning'; // ERROR
import myVerify from '../../../../src/vendor/verify';

const VERIFICATION_STATES = {
  NOT_VERIFIED: 'NOT_VERIFIED',
  VERIFIED: 'VERIFIED',
  INVALID_SOURCE: 'INVALID_SOURCE',
  ERROR: 'ERROR'
}

/**
 * @param {object} props - the props passed to the component
 * @param {object} props.context - the query context
 * @param {string} props.source - the source to check
 * @param {string} props.proxyUrl - the proxy url to use if the resource is accessed through a proxy
 * @returns {Component} an icon indicating whether the source was verified or not
 */
function SourceVerificationIcon({ context, source, proxyUrl }) {
  let sourceUrl = source;
  if (context.useProxy) {
    sourceUrl = `${proxyUrl}${source}`;
  }

  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
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
      const { validationResult, verificationResult } = await myVerify(verifiableCredential);
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
    verifyFunction(sourceUrl, context.underlyingFetchFunction).then((result) => {
      setIsVerified(result);
      setIsLoading(false);
    })
  }

  if (needsVerification) {
    if (isLoading) {
      return <CircularProgress size={20} />;
    } else {
      switch (isVerified) {
        case VERIFICATION_STATES.VERIFIED:
          return (
            <Tooltip title="Verification succeeded">
              <VerifiedUserIcon size="small" />
            </Tooltip>
          );
          break;
        case VERIFICATION_STATES.INVALID_SOURCE:
          return (
            <Tooltip title="No credential found to verify">
              <PrivacyTipIcon size="small" />
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
        case VERIFICATION_STATES.ERROR:
          return (
            <Tooltip title="Error">
              <WarningIcon size="small" />
            </Tooltip>
          );
          break;
      }
    }
  } else {
    return (
      <Tooltip title="Verify source">
        <Button onClick={verify}>
          <QuestionMarkIcon size="small" />
        </Button>
      </Tooltip>
    );
  }
}

SourceVerificationIcon.propTypes = {
  context: PropTypes.object.isRequired,
  source: PropTypes.string.isRequired,
  proxyUrl: PropTypes.string.isRequired,
}

export default SourceVerificationIcon;