import { AppBar, TitlePortal, useRefresh } from "react-admin";
import config from "../../../config";
import "./NavigationBar.css";
import AuthenticationMenu from "../AuthenticationMenu/AuthenticationMenu";
import { Component } from "react";
import SparqlDataProvider from "./../../../dataProvider/SparqlDataProvider";
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material';


function InvalidateButton() {
  const refresh = useRefresh();
  const handleClick = () => {
    SparqlDataProvider.queryEngine.invalidateHttpCache();
    setTimeout(refresh, 2000);
  }
  return (
    <Tooltip title="Clean Query Cache">
      <IconButton color="inherit" onClick={handleClick}>
        <CleaningServicesIcon />
      </IconButton>
    </Tooltip>
  )  
}

/**
 * 
 * @param {object} props - the props passed down to the component 
 * @returns {Component} custom AppBar as defined by react-admin
 */
function NavigationBar(props) {
  return (
    <AppBar {...props} userMenu={<AuthenticationMenu />}>
      <img
        id="app-logo"
        src={config.logoLocation}
        alt="Web application logo"
      ></img>
      <TitlePortal/>
      <InvalidateButton/>
    </AppBar>
  );
}

export default NavigationBar;
