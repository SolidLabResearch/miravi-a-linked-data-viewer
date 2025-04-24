import { Component } from "react";
import { Layout } from "react-admin";
import NavigationBar from "./NavigationBar/NavigationBar";
import SelectionMenu from "./SelectionMenu/SelectionMenu";

// LOG let interactionLayoutCounter = 0;

/**
 *
 * @param {object} props - the props passed down to the component
 * @returns {Component} custom Layout as defined by react-admin
 */
function InteractionLayout(props) {
  // LOG console.log(`--- InteractionLayout #${++interactionLayoutCounter}`);
  
  return <Layout {...props} appBar={NavigationBar} menu={SelectionMenu} />;
}

export default InteractionLayout;
