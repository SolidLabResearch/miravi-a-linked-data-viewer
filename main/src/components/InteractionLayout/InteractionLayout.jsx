import { Layout } from "react-admin";
import NavigationBar from "./NavigationBar/NavigationBar";
import { Component } from "react";
import SelectionMenu from "./SelectionMenu/SelectionMenu";

/**
 *
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom Layout as defined by react-admin
 */
function InteractionLayout(props) {
  return <Layout {...props} appBar={NavigationBar} menu={SelectionMenu} />;
}

export default InteractionLayout;
