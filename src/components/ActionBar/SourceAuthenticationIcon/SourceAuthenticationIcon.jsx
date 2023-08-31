import { CircularProgress, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";

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
    if (isAuthenticationRequired) {
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

async function authenticationRequired(source) {
  const response = await fetch(source, {
    method: "HEAD",
  });
  return response.status === 401 || response.status === 403;
}

export default SourceAuthenticationIcon;
