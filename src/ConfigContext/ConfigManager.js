import configFile from "../config.json";
import { EventEmitter } from 'events';

class ConfigManager extends EventEmitter {
    constructor() {
      super();
      this.config = { ...configFile };
  
      if (!this.config.queryFolder) {
        this.config.queryFolder = "./";
      }
  
      if (this.config.queryFolder.substring(this.config.queryFolder.length - 1) !== "/") {
        this.config.queryFolder = `${this.config.queryFolder}/`;
      }
    }
  
    getConfig() {
      return this.config;
    }
  
    setConfig(newConfig) {
      this.config = { ...this.config, ...newConfig };
      this.emit('configChanged', this.config);
    }
  }
  
  const configManager = new ConfigManager();
  export default configManager;