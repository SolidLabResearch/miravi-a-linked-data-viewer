import { AppBar, TitlePortal } from "react-admin";
import "./NavigationBar.css";
import AuthenticationMenu from "../AuthenticationMenu/AuthenticationMenu";
import { Component, useState } from "react";
import { useNavigate } from 'react-router-dom';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import { IconButton } from '@mui/material';
import { Tooltip } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import AboutDialog from "./AboutDialog";

import configManager from "../../../configManager/configManager";
import comunicaEngineWrapper from "../../../comunicaEngineWrapper/comunicaEngineWrapper";
import SparqlDataProvider from "../../../dataProvider/SparqlDataProvider";

function AboutButton(props) {
  return (
    <Tooltip title="About">
      <IconButton color="inherit" onClick={props.click}>
        <HelpIcon />
      </IconButton>
    </Tooltip>
  )
}

function InvalidateButton() {
  const navigate = useNavigate();
  const handleClick = async () => {
    await comunicaEngineWrapper.reset();
    SparqlDataProvider.clearListCache();
    // navigate! (refresh is not enough to clear status in case of templated queries with indirect variables)
    navigate('/');
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
  const config = configManager.getConfig();

  const [aboutOpen, setAboutOpen] = useState(false);

  const handleAboutOpen = () => setAboutOpen(true);
  const handleAboutClose = () => setAboutOpen(false);

  return (
    <>
      <AppBar {...props} toolbar={<></>} userMenu={<AuthenticationMenu />}>
        <a href={config.logoRedirectURL} target="_blank"><img
            id="app-logo"
            src={config.logoLocation}
            alt="Web application logo">
          </img></a>
        <TitlePortal/>
        <AboutButton click={handleAboutOpen} />
        <InvalidateButton/>
      </AppBar>
      <AboutDialog open={aboutOpen} close={handleAboutClose} />
    </>
  );
}

export default NavigationBar;
