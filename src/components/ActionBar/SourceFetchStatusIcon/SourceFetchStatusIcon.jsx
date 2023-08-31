import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CancelIcon from "@mui/icons-material/Cancel";
import { Tooltip } from "@mui/material";

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

export default SourceFetchStatusIcon;
