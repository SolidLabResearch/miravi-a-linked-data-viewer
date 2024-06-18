import "./App.css";
import { Admin, Resource, CustomRoutes } from "react-admin";
import SparqlDataProvider from "./dataProvider/SparqlDataProvider";
import { Component, useEffect, useState } from "react";
import {
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import IconProvider from "./IconProvider/IconProvider";
import authenticationProvider from "./authenticationProvider/authenticationProvider";
import SolidLoginForm from "./components/LoginPage/LoginPage";
import { QueryClient } from "react-query";
import Dashboard from "./components/Dashboard/Dashboard";
import InteractionLayout from "./components/InteractionLayout/InteractionLayout";
import TemplatedListResultTable from "./components/ListResultTable/TemplatedListResultTable.jsx";

import { Route } from "react-router-dom";
import CustomEditor from "./components/Dashboard/CustomQueryEditor/customEditor.jsx";

import configManager from "./configManager/configManager.js";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * @returns {Component} the main component of the application
 */
function App() {
  const session = getDefaultSession();
  const [loggedIn, setLoggedIn] = useState();
  const [config, setConfig] = useState(configManager.getConfig());
  const [configChangeTrigger, setConfigChangeTrigger] = useState(config.queries.length)

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--text-color", config.textColor);
  }, []);

  useEffect(() => {
    const handleConfigChange = (newConfig) => {
      setConfig(newConfig);
      setConfigChangeTrigger(Date.now().toString())
    };

    // Listen for config changes
    configManager.on('configChanged', handleConfigChange);

    // Clean up the event listener on component unmount
    return () => {
      configManager.off('configChanged', handleConfigChange);
    };
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
    <Admin
      queryClient={queryClient}
      dataProvider={SparqlDataProvider}
      layout={InteractionLayout}
      authProvider={authenticationProvider}
      loginPage={SolidLoginForm}
      requireAuth={false}
      dashboard={Dashboard}
    >
      {configChangeTrigger && config.queries.map((query) => {
        return (
          <Resource
            key={query.id}
            name={query.id}
            options={{ label: query.name, descr: query.description, queryGroupId: query.queryGroupId }}
            icon={IconProvider[query.icon]}
            list={TemplatedListResultTable}
          />
        );
      })}
      <CustomRoutes>
        <Route key="customQuery" path="/customQuery" element={<CustomEditor newQuery={true} />} />
        {config.queries.map((query) => {
          if (query.queryGroupId === 'cstm') {
            return (
              <Route key={`edit${query.id}`} path={`/${query.id}/editCustom`} element={<CustomEditor newQuery={false} id={query.id} />} />
            );
          }
        })}
      </CustomRoutes>
    </Admin>
  );
}

export default App;
