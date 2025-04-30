import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { SvgIcon, Box } from "@mui/material";

const ErrorDisplay = (props) => {
  const { errorMessage, searchingMessage } = props;
  let icon;
  let msg;

  if (errorMessage) {
    icon = ReportProblemOutlinedIcon;
    msg = errorMessage;
  } else if (searchingMessage) {
    icon = SearchOffIcon;
    msg = searchingMessage;
  } else {
    icon = ReportProblemOutlinedIcon;
    msg = "Something unexpected happened."
  }

  return (
    <div>
      <Box display="flex" alignItems="center" sx={{ m: 3 }}>
        <SvgIcon component={icon} sx={{ m: 3 }} />
        <span>{msg}</span>
      </Box>
    </div>
  );
}

export default ErrorDisplay;