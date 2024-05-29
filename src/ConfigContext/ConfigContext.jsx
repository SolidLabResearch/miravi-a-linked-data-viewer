import React, { createContext, useState, useContext, useEffect } from 'react';
import configManager from './ConfigManager';

const ConfigContext = createContext();

// This context reads the config file and puts the content into the variable config.
// This variable is used throughout the rest of the application to ensure the config file is read only once here for good practice.
export const ConfigProvider = ({ children }) => {

    const [config, setConfig] = useState(configManager.getConfig());

    useEffect(() => {
        const handleConfigChange = (newConfig) => {
          setConfig(newConfig);
        };
        configManager.on('configChanged', handleConfigChange);
        return () => {
          configManager.off('configChanged', handleConfigChange);
        };
      }, []);

      const updateConfig = (newConfig) => {
        configManager.setConfig(newConfig);
      };

    console.log(config);
    return (
        <ConfigContext.Provider value={{ config , updateConfig }}>
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
