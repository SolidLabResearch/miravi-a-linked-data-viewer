import "./App.css";
import { Admin, Resource } from "react-admin";
import dataProvider from "./dataProvider/GDVDataProvider.js";
import config from "./config";
import { Component, useEffect, useState } from "react";
import {
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import GDVResource from "./components/GDVResource/GDVResource";
import GDVLayout from "./components/GDVLayout/GDVLayout";
import authenticationProvider from "./authenticationProvider/authenticationProvider";
import SolidLoginForm from "./components/LoginPage/LoginPage";

/**
 * @returns {Component} the main component of the application
 */
function App() {
  const session = getDefaultSession();
  const [loggedIn, setLoggedIn] = useState();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--text-color", config.textColor);
  }, []);

  useEffect(() => {
    session.onLogin(() => setLoggedIn(true));
    session.onLogout(() => setLoggedIn(false));

    // In this function we don't use await because inside a React Effect it causes linting warnings and according to several sources on the Web it is not recommended.
    // https://ultimatecourses.com/blog/using-async-await-inside-react-use-effect-hook
    // https://www.thisdot.co/blog/async-code-in-useeffect-is-dangerous-how-do-we-deal-with-it/
    handleIncomingRedirect({ restorePreviousSession: true }).then((info) => {
      if (info) {
        const status = info.isLoggedIn;
        if (status !== loggedIn) {
          setLoggedIn(status);
        }
      }
    });
  });
  return (
    <Admin dataProvider={dataProvider} layout={GDVLayout} authProvider={authenticationProvider} loginPage={SolidLoginForm} requireAuth={false}>
      {config.queries.map((query) => {
        return (
          <Resource
            key={query.id}
            name={query.id}
            options={{ label: query.name }}
            list={GDVResource}
          />
        );
      })}
    </Admin>
  );
}

export default App;
