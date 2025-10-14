import { CircularProgress, Tooltip, IconButton } from "@mui/material";
import { Component, useState } from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import PropTypes from "prop-types";
import GppGoodIcon from '@mui/icons-material/GppGood';
import GppBadIcon from '@mui/icons-material/GppBad';
import GppMaybeIcon from '@mui/icons-material/GppMaybe';
import { SolidApi } from '../../../vendor/vc-prototyping-library/solid/bundle/api';
import comunicaEngineWrapper from '../../../comunicaEngineWrapper/comunicaEngineWrapper';
import { translateUrlToProxiedUrl } from '../../../lib/utils';

const VERIFICATION_STATES = {
  VERIFIED: 'VERIFIED',
  NOT_VERIFIED: 'NOT_VERIFIED',
  INVALID_SOURCE: 'INVALID_SOURCE',
  ERROR: 'ERROR'
}

let vcApi;
let vcPublicKey;

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
      const txt = await response.text();

      if (!vcApi) {
        vcApi = new SolidApi({
          // For verify-only application, next fields are not used, so set them to "N/A"
          email: "N/A", password: "N/A", css: "N/A", webId: "N/A",
          contentsToPreload: [
            {
              url: "https://www.w3.org/2018/credentials/v1",
              type: "context",
              document: { "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "VerifiableCredential": { "@id": "https://www.w3.org/2018/credentials#VerifiableCredential", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "cred": "https://www.w3.org/2018/credentials#", "sec": "https://w3id.org/security#", "xsd": "http://www.w3.org/2001/XMLSchema#", "credentialSchema": { "@id": "cred:credentialSchema", "@type": "@id", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "cred": "https://www.w3.org/2018/credentials#", "JsonSchemaValidator2018": "cred:JsonSchemaValidator2018" } }, "credentialStatus": { "@id": "cred:credentialStatus", "@type": "@id" }, "credentialSubject": { "@id": "cred:credentialSubject", "@type": "@id" }, "evidence": { "@id": "cred:evidence", "@type": "@id" }, "expirationDate": { "@id": "cred:expirationDate", "@type": "xsd:dateTime" }, "holder": { "@id": "cred:holder", "@type": "@id" }, "issued": { "@id": "cred:issued", "@type": "xsd:dateTime" }, "issuer": { "@id": "cred:issuer", "@type": "@id" }, "issuanceDate": { "@id": "cred:issuanceDate", "@type": "xsd:dateTime" }, "proof": { "@id": "sec:proof", "@type": "@id", "@container": "@graph" }, "refreshService": { "@id": "cred:refreshService", "@type": "@id", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "cred": "https://www.w3.org/2018/credentials#", "ManualRefreshService2018": "cred:ManualRefreshService2018" } }, "termsOfUse": { "@id": "cred:termsOfUse", "@type": "@id" }, "validFrom": { "@id": "cred:validFrom", "@type": "xsd:dateTime" }, "validUntil": { "@id": "cred:validUntil", "@type": "xsd:dateTime" } } }, "VerifiablePresentation": { "@id": "https://www.w3.org/2018/credentials#VerifiablePresentation", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "cred": "https://www.w3.org/2018/credentials#", "sec": "https://w3id.org/security#", "holder": { "@id": "cred:holder", "@type": "@id" }, "proof": { "@id": "sec:proof", "@type": "@id", "@container": "@graph" }, "verifiableCredential": { "@id": "cred:verifiableCredential", "@type": "@id", "@container": "@graph" } } }, "EcdsaSecp256k1Signature2019": { "@id": "https://w3id.org/security#EcdsaSecp256k1Signature2019", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "xsd": "http://www.w3.org/2001/XMLSchema#", "challenge": "sec:challenge", "created": { "@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime" }, "domain": "sec:domain", "expires": { "@id": "sec:expiration", "@type": "xsd:dateTime" }, "jws": "sec:jws", "nonce": "sec:nonce", "proofPurpose": { "@id": "sec:proofPurpose", "@type": "@vocab", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "assertionMethod": { "@id": "sec:assertionMethod", "@type": "@id", "@container": "@set" }, "authentication": { "@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set" } } }, "proofValue": "sec:proofValue", "verificationMethod": { "@id": "sec:verificationMethod", "@type": "@id" } } }, "EcdsaSecp256r1Signature2019": { "@id": "https://w3id.org/security#EcdsaSecp256r1Signature2019", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "xsd": "http://www.w3.org/2001/XMLSchema#", "challenge": "sec:challenge", "created": { "@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime" }, "domain": "sec:domain", "expires": { "@id": "sec:expiration", "@type": "xsd:dateTime" }, "jws": "sec:jws", "nonce": "sec:nonce", "proofPurpose": { "@id": "sec:proofPurpose", "@type": "@vocab", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "assertionMethod": { "@id": "sec:assertionMethod", "@type": "@id", "@container": "@set" }, "authentication": { "@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set" } } }, "proofValue": "sec:proofValue", "verificationMethod": { "@id": "sec:verificationMethod", "@type": "@id" } } }, "Ed25519Signature2018": { "@id": "https://w3id.org/security#Ed25519Signature2018", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "xsd": "http://www.w3.org/2001/XMLSchema#", "challenge": "sec:challenge", "created": { "@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime" }, "domain": "sec:domain", "expires": { "@id": "sec:expiration", "@type": "xsd:dateTime" }, "jws": "sec:jws", "nonce": "sec:nonce", "proofPurpose": { "@id": "sec:proofPurpose", "@type": "@vocab", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "assertionMethod": { "@id": "sec:assertionMethod", "@type": "@id", "@container": "@set" }, "authentication": { "@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set" } } }, "proofValue": "sec:proofValue", "verificationMethod": { "@id": "sec:verificationMethod", "@type": "@id" } } }, "RsaSignature2018": { "@id": "https://w3id.org/security#RsaSignature2018", "@context": { "@version": 1.1, "@protected": true, "challenge": "sec:challenge", "created": { "@id": "http://purl.org/dc/terms/created", "@type": "xsd:dateTime" }, "domain": "sec:domain", "expires": { "@id": "sec:expiration", "@type": "xsd:dateTime" }, "jws": "sec:jws", "nonce": "sec:nonce", "proofPurpose": { "@id": "sec:proofPurpose", "@type": "@vocab", "@context": { "@version": 1.1, "@protected": true, "id": "@id", "type": "@type", "sec": "https://w3id.org/security#", "assertionMethod": { "@id": "sec:assertionMethod", "@type": "@id", "@container": "@set" }, "authentication": { "@id": "sec:authenticationMethod", "@type": "@id", "@container": "@set" } } }, "proofValue": "sec:proofValue", "verificationMethod": { "@id": "sec:verificationMethod", "@type": "@id" } } }, "proof": { "@id": "https://w3id.org/security#proof", "@type": "@id", "@container": "@graph" } } }
            },
            {
              url: "https://w3id.org/security/data-integrity/v2",
              type: "context",
              document: { "@context": { "id": "@id", "type": "@type", "@protected": true, "proof": { "@id": "https://w3id.org/security#proof", "@type": "@id", "@container": "@graph" }, "DataIntegrityProof": { "@id": "https://w3id.org/security#DataIntegrityProof", "@context": { "@protected": true, "id": "@id", "type": "@type", "challenge": "https://w3id.org/security#challenge", "created": { "@id": "http://purl.org/dc/terms/created", "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }, "domain": "https://w3id.org/security#domain", "expires": { "@id": "https://w3id.org/security#expiration", "@type": "http://www.w3.org/2001/XMLSchema#dateTime" }, "nonce": "https://w3id.org/security#nonce", "previousProof": { "@id": "https://w3id.org/security#previousProof", "@type": "@id" }, "proofPurpose": { "@id": "https://w3id.org/security#proofPurpose", "@type": "@vocab", "@context": { "@protected": true, "id": "@id", "type": "@type", "assertionMethod": { "@id": "https://w3id.org/security#assertionMethod", "@type": "@id", "@container": "@set" }, "authentication": { "@id": "https://w3id.org/security#authenticationMethod", "@type": "@id", "@container": "@set" }, "capabilityInvocation": { "@id": "https://w3id.org/security#capabilityInvocationMethod", "@type": "@id", "@container": "@set" }, "capabilityDelegation": { "@id": "https://w3id.org/security#capabilityDelegationMethod", "@type": "@id", "@container": "@set" }, "keyAgreement": { "@id": "https://w3id.org/security#keyAgreementMethod", "@type": "@id", "@container": "@set" } } }, "cryptosuite": { "@id": "https://w3id.org/security#cryptosuite", "@type": "https://w3id.org/security#cryptosuiteString" }, "proofValue": { "@id": "https://w3id.org/security#proofValue", "@type": "https://w3id.org/security#multibase" }, "verificationMethod": { "@id": "https://w3id.org/security#verificationMethod", "@type": "@id" } } } } }
            }
          ]
        });
        vcPublicKey = await vcApi.retrievePublicKey();
      }
      
      const verificationResult = await vcApi.verify({ contentType: 'application/ld+json', content: txt }, vcPublicKey);
      switch (verificationResult) {
        case 'pass':
          return VERIFICATION_STATES.VERIFIED;
        case 'fail':
          return VERIFICATION_STATES.NOT_VERIFIED;
        case 'not signed':
          return VERIFICATION_STATES.INVALID_SOURCE;
        default:
          return VERIFICATION_STATES.ERROR;
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