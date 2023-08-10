import { AppBar, TitlePortal, Toolbar } from "react-admin";
import config from "../../../config";
import "./GDVAppBar.css";
import GDVToolbar from "./GDVToolbar/GDVToolbar";

function GDVAppBar(props) {
  return (
    <AppBar {...props} toolbar={<GDVToolbar />}>
      <img
        id="app-logo"
        src={config.logoLocation}
        alt="Web application logo"
      ></img>
      <TitlePortal style={{flex: "unset"}}/>
      <h3>{config.title}</h3>
    </AppBar>
  );
}

export default GDVAppBar;
