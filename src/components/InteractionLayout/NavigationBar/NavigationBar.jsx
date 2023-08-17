import { AppBar, TitlePortal } from "react-admin";
import config from "../../../config";
import "./NavigationBar.css";
import AuthenticationMenu from "../AuthenticationMenu/AuthenticationMenu";
import { Component } from "react";

/**
 * 
 * @param {object} props the props passed down to the component 
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
    </AppBar>
  );
}

export default NavigationBar;
