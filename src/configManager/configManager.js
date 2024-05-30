import configFile from "../config.json";
import { EventEmitter } from 'events';

/**
 * A class maintaining a configuration object, initially read from the configuration file
 */
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

  /**
   * Gets the configuration
   * 
   * @returns {object} the current configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Sets a new configuration
   * 
   * @param {object} newConfig - the new configuration
   */
  setConfig(newConfig) {
    this.config = { ...newConfig };
    this.emit('configChanged', this.config);
  }

  /**
   * Changes the configuration
   * 
   * @param {object} changes - an object with overrides and/or additions to the configuration
   */
  changeConfig(changes) {
    this.config = { ...this.config, ...changes };
    this.emit('configChanged', this.config);
  }

  /**
   * Adds as query element to the config.queries array in the configuration
   * 
   * @param {object} newQuery - the query element to be added
   */
  addQuery(newQuery) {
    this.config.queries = [...this.config.queries, newQuery];
    this.emit('configChanged', this.config);
  }
}

const configManager = new ConfigManager();
export default configManager;
