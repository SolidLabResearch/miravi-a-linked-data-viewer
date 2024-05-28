import React, { createContext, useState, useContext } from 'react';
import configFile from "../config.json";

const ConfigContext = createContext();

// This context reads the config file and puts the content into the variable config.
// This variable is used throughout the rest of the application to ensure the config file is read only once here for good practice.
export const ConfigProvider = ({ children }) => {

    const [config, setConfig] = useState(configFile);

    const addConfigElement = (key, value) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            [key]: value,
        }));
    };

    const addQuery = (newQuery) => {
        setConfig((prevConfig) => ({
            ...prevConfig,
            queries: [...prevConfig.queries, newQuery],
        }));
    };

    return (
        <ConfigContext.Provider value={{ config, addConfigElement, addQuery }}>
            {children}
        </ConfigContext.Provider>
    );
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (context === undefined) {
        throw new Error('useConfig must be used within a ConfigProvider');
    }
    return context;
};
