import CheckIcon from "@mui/icons-material/Check";
import {CircularProgress, Tooltip} from "@mui/material";
import {useState} from "react";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import {Button} from "react-admin";
import CancelIcon from "@mui/icons-material/Cancel";

/**
 * @param {object} props - the props passed to the component
 * @param {object} props.context - the query context
 * @param {string} props.source - the source to check
 * @param {string} props.proxyUrl - the proxy url to use if the resource is accessed through a proxy
 * @returns {Component} an icon indicating whether the source was verified or not
 */
function SourceVerificationIcon({context, source, proxyUrl}) {
    let sourceUrl = source;
    if (context.useProxy) {
        sourceUrl = `${proxyUrl}${source}`;
    }

    const [isLoading, setIsLoading] = useState(true);
    const [isVerified, setIsVerified] = useState(false);
    const [needsVerification, setNeedsVerification] = useState(false);

    // This function should be replaced by the actual verification function
    const verifyFunction = async (source, fetchFunction) => {
        try {
            const response = await fetchFunction(source);
            return response.status === 200;
        } catch (error) {
            return false
        }
    };

    function verify() {
        setNeedsVerification(true);
        verifyFunction(sourceUrl, context.fetch).then((result) => {
            setIsVerified(result)
            setIsLoading(false)
        })
    }

    if (needsVerification) {
        if (isLoading) {
            return <CircularProgress size={20}/>;
        } else {
            if (isVerified) {
                return (
                    <Tooltip title="Verification succeeded">
                        <CheckIcon size="small"/>
                    </Tooltip>
                )
            } else {
                return (
                    <Tooltip title="Verification failed">
                        <CancelIcon size="small"/>
                    </Tooltip>
                )
            }
        }
    } else {
        return (
            <Tooltip title="Verify source">
                <Button onClick={verify}>
                    <QuestionMarkIcon size="small"/>
                </Button>
            </Tooltip>
        )
    }
}

export default SourceVerificationIcon;