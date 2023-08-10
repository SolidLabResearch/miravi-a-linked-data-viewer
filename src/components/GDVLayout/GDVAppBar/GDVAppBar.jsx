import { AppBar, TitlePortal } from "react-admin";
import config from "../../../config";
import "./GDVAppBar.css";
import GDVToolbar from "./GDVToolbar/GDVToolbar";
import GDVUserMenu from "../GDVUserMenu/GDVUserMenu";

function GDVAppBar(props) {
  return (
    <AppBar {...props} toolbar={<GDVToolbar />} userMenu={<GDVUserMenu />}>
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
