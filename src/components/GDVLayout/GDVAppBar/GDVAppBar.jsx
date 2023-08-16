import { AppBar, TitlePortal } from "react-admin";
import config from "../../../config";
import "./GDVAppBar.css";
import GDVUserMenu from "../GDVUserMenu/GDVUserMenu";
import { Component } from "react";

/**
 * 
 * @param {object} props the props passed down to the component 
 * @returns {Component} custom AppBar as defined by react-admin
 */
function GDVAppBar(props) {
  return (
    <AppBar {...props} userMenu={<GDVUserMenu />}>
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
