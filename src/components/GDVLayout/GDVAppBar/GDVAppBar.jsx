import { AppBar, TitlePortal } from "react-admin";
import config from "../../../config";
import "./GDVAppBar.css";
import GDVToolbar from "./GDVToolbar/GDVToolbar";

function GDVAppBar(props) {
  return (
    <AppBar {...props} >
      <img
        id="app-logo"
        src={config.logoLocation}
        alt="Web application logo"
      ></img>
      <TitlePortal/>
    </AppBar>
  );
}

export default GDVAppBar;
