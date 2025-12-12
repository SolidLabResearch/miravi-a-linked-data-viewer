import {CircularProgress, IconButton, Tooltip} from "@mui/material";
import {Component, useState} from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PropTypes from "prop-types";
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import comunicaEngineWrapper from '../../../comunicaEngineWrapper/comunicaEngineWrapper';

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
function ChainVerificationIcon({ source }) {
  const sourceUrl = source;

  const [isLoading, setIsLoading] = useState(true);
  const [verificationState, setVerificationState] = useState(undefined);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [anchorState, setAnchorState] = useState(undefined);

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

      // Verify the anchored VC's on-chain hash using the verifier service
      const urlEndpoint = 'http://localhost:4444/verify'
      const verifyResponse = await (
        await fetch(urlEndpoint,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ verifiableCredential })
          }
        )
      ).json()

      const {verified, anchor} = verifyResponse;
      if(verified === true) {
        setAnchorState(anchor);
        return VERIFICATION_STATES.VERIFIED;
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
            <Tooltip title={`Verification succeeded. Chain hash: ${anchorState.vcHash}`}>
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

ChainVerificationIcon.propTypes = {
  source: PropTypes.string.isRequired,
}

export default ChainVerificationIcon;