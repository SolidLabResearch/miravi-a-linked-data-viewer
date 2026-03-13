import "./App.css";
import { Component, useEffect, useState, useContext } from "react";
import { AppContext, AppContextProvider } from "./AppContext.jsx";
import { Admin, Resource, CustomRoutes } from "react-admin";
import SparqlDataProvider from "./dataProvider/SparqlDataProvider";
import { getDefaultAuth } from "trustflows-client";
import IconProvider from "./IconProvider/IconProvider";
import authenticationProvider from "./authenticationProvider/authenticationProvider";
import SolidLoginForm from "./components/LoginPage/LoginPage";
import { QueryClient } from '@tanstack/react-query';
import Dashboard from "./components/Dashboard/Dashboard";
import InteractionLayout from "./components/InteractionLayout/InteractionLayout";
import TemplatedListResultTable from "./components/ListResultTable/TemplatedListResultTable.jsx";

import { Route, Navigate } from "react-router-dom";
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
  const auth = getDefaultAuth();
  const [loggedIn, setLoggedIn] = useState(false);
  const config = configManager.getConfig();
  const { configChangeTrigger } = useContext(AppContext);

  // LOG console.log(`--- InnerApp #${++innerAppCounter}`);
  // LOG console.log(`configChangeTrigger: ${configChangeTrigger}`);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await auth.handleIncomingRedirect();
      const status = await auth.isLoggedIn();
      if (!cancelled) setLoggedIn(status);
  
/*
      
        const authFetch = auth.createAuthFetch();

        console.log(`=== Fetching query results`);
        const resp = await authFetch(
          "http://aggregator.local:5000/services/02af826e-c368-486b-9570-e28eda9c4084/c19d4276-40f1-4506-bf14-f4ab3ac63bde"
        );
      if (!resp.ok) {
        const results = await resp.text();
        console.log("=== response text");
        console.log(results);
          throw new Error(
            `Failed to fetch service results: ${resp.status} ${results}`,
          );
        }
        const results = await resp.text();
        console.log("=== Query results");
        console.log(results);*/
      
    
    })();

    return () => {
      cancelled = true;
    };
  }, []);

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
