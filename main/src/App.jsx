import "./App.css";
import { Component, useEffect, useState, useContext } from "react";
import { AppContext, AppContextProvider } from "./AppContext.jsx";
import { Admin, Resource, CustomRoutes } from "react-admin";
import SparqlDataProvider from "./dataProvider/SparqlDataProvider";
import {
  getDefaultSession,
  handleIncomingRedirect,
} from "@inrupt/solid-client-authn-browser";
import IconProvider from "./IconProvider/IconProvider";
import authenticationProvider from "./authenticationProvider/authenticationProvider";
import SolidLoginForm from "./components/LoginPage/LoginPage";
import { QueryClient } from '@tanstack/react-query';
import Dashboard from "./components/Dashboard/Dashboard";
import InteractionLayout from "./components/InteractionLayout/InteractionLayout";
import TemplatedListResultTable from "./components/ListResultTable/TemplatedListResultTable.jsx";

import { Route } from "react-router-dom";
import CustomEditor from "./components/CustomQueryEditor/customEditor.jsx";

import configManager from "./configManager/configManager.js";

// LOG let innerAppCounter = 0;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

/**
 * @returns {Component} the (inner, wrapped below) app component
 */
function InnerApp() {
  const session = getDefaultSession();
  const [loggedIn, setLoggedIn] = useState();
  const config = configManager.getConfig();
  const { configChangeTrigger } = useContext(AppContext);

  // LOG console.log(`--- InnerApp #${++innerAppCounter}`);
  // LOG console.log(`configChangeTrigger: ${configChangeTrigger}`);

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
      // a changing key property is needed as of react-admin v5; the changing key trick is known for react
      // (see for example https://coreui.io/blog/how-to-force-a-react-component-to-re-render/#2-changing-the-key-prop)
      // here we need it to force a complete rerender of <Admin>
      key={configChangeTrigger}
      queryClient={queryClient}
      dataProvider={SparqlDataProvider}
      layout={InteractionLayout}
      authProvider={authenticationProvider}
      loginPage={SolidLoginForm}
      requireAuth={false}
      dashboard={Dashboard}
      // see https://marmelab.com/react-admin/AppTheme.html: always use light theme; never use dark theme
      defaultTheme="light"
    >
      {config.queries.map((query) => {
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

// LOG let appCounter = 0;

/**
 * @returns {Component} the outer app component
 */
function App() {

  // LOG console.log(`--- App #${++appCounter}`);

  return (
    <AppContextProvider>
      <InnerApp></InnerApp>
    </AppContextProvider>
  );
}

export default App;
