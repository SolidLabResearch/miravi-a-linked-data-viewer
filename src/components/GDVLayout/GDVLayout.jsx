import { Layout } from "react-admin";
import GDVAppBar from "./GDVAppBar/GDVAppBar";
import { Component } from "react";

/**
 * 
 * @param {object} props the props passed down to the component 
 * @returns {Component} custom Layout as defined by react-admin
 */
function GDVLayout(props) {
  return <Layout {...props} appBar={GDVAppBar} />;
}

export default GDVLayout;
