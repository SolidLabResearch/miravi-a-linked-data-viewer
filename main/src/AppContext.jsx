import { Component, createContext, useEffect, useState } from "react";
import configManager from "./configManager/configManager.js";

export const AppContext = createContext(null);

// LOG let appContextProviderCounter = 0;

/**
 * ContextProvider for the entire App
 *
 * @param {{ children: any; }} param0 
 * @param {*} param0.children 
 * @returns {Component} 
 */
export function AppContextProvider({ children }) {
  const [configChangeTrigger, setConfigChangeTrigger] = useState(0);
  const [openGroups, setOpenGroups] = useState({});

  // LOG console.log(`--- AppContextProvider #${++appContextProviderCounter}`);
  // LOG console.log(`configChangeTrigger: ${configChangeTrigger}`);

  useEffect(() => {
    const handleConfigChange = (newConfig) => {
      // Open the cstm group if it exists
      if (newConfig.queryGroups.find(group => group.id === 'cstm')) {
        setOpenGroups(prevOpenGroups => ({
          ...prevOpenGroups,
          cstm: true,
        }));
      }
      setConfigChangeTrigger(x => x + 1);
      // LOG console.log(`AppContextProvider: configuration change handled`);
    };

    // Listen for config changes
    configManager.on('configChanged', handleConfigChange);

    // Clean up the event listener on component unmount
    return () => {
      configManager.off('configChanged', handleConfigChange);
    };
  }, []);

  return (
    <AppContext.Provider value={{
      configChangeTrigger,
      openGroups,
      setOpenGroups
    }} >
      {children}
    </AppContext.Provider>
  );
}
