import configFile from "../config.json";
import { EventEmitter } from 'events';

/**
 * A class maintaining a configuration object, initially read from the configuration file.
 * In addition, working copies of query objects are maintained as well.
 * These working copies are meant for usage by clients that may extend those query objects,
 * but shouldn't change the configuration object.
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

    this.queryWorkingCopies = {};
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
    this.queryWorkingCopies = {};
    this.emit('configChanged', this.config);
  }

  /**
   * Changes the configuration
   * 
   * @param {object} changes - an object with overrides and/or additions to the configuration
   */
  changeConfig(changes) {
    this.config = { ...this.config, ...changes };
    this.queryWorkingCopies = {};
    this.emit('configChanged', this.config);
  }

  addNewQueryGroup(id, name, icon = null) {

    const groupExists = this.config.queryGroups.find(group => group.id === id);

    if (groupExists === undefined) {
      const newGroup = { id, name };
      if (icon) {
        newGroup.icon = icon;
      }
      this.config.queryGroups = [...this.config.queryGroups, newGroup];
      this.emit('configChanged', this.config);
    }
  }

  /**
   * Adds a query element to the config.queries array in the configuration
   * 
   * @param {object} newQuery - the query element to be added
   */
  addQuery(newQuery) {
    this.config.queries = [...this.config.queries, newQuery];
    this.emit('configChanged', this.config);
  }

  /**
  * Gets the query with the given id in the config.queries array in the configuration
  * @param {string} id - id property a query
  * @returns {object} the query
  */
  getQueryById(id) {
    return this.config.queries.find((query) => query.id === id);
  }

  /**
  * Gets a working copy of the query with the given id (make a working copy first if needed)
  * @param {string} id - id property a query
  * @returns {object} the query
  */
  getQueryWorkingCopyById(id) {
    let workingCopy = this.queryWorkingCopies[id];
    if (!workingCopy) {
      workingCopy = JSON.parse(JSON.stringify(this.getQueryById(id)));
      this.queryWorkingCopies[id] = workingCopy;
    }
    return workingCopy;
  }

  /**
   * Gets the query text from a query
   * @param {object} query - the input query
   * @returns {string} the query text
   */
  async getQueryText(query) {

    if (query.queryLocation) {
      const fetchResult = await fetch(`${this.config.queryFolder}${query.queryLocation}`);
      return await fetchResult.text();
    }
    return query.queryString;
  }


  /**
   * Updates a query element to the config.queries array in the configuration
   * @param {Object} updatedQuery - the updated query element to replace
   */
  updateQuery(updatedQuery) {
    let index = this.config.queries.findIndex(query => query.id === updatedQuery.id);
    if (index !== -1) {
      this.config.queries[index] = updatedQuery;
    }
    this.queryWorkingCopies = {};
    this.emit('configChanged', this.config);
  }

  /**
 * Deletes the query with the given id in the config.queries array in the configuration
 * @param {string} id - id property of the query to delete
 */
  deleteQueryById(id) {
    let index = this.config.queries.findIndex(query => query.id === id);
    if (index !== -1) {
      this.config.queries.splice(index, 1);
    }
    this.queryWorkingCopies = {};
    this.emit('configChanged', this.config);
  }


  /**
  * Gets the query with the given id in the config.queries array in the configuration
  * @param {string} id - id property a query
  * @returns {object} the query
  */
  getQueryById(id) {
    return this.config.queries.find((query) => query.id === id);
  }

  /**
   * Gets the query text from a query
   * @param {object} query - the input query
   * @returns {string} the query text
   */
  async getQueryText(query) {

    if (query.queryLocation) {
      const fetchResult = await fetch(`${this.config.queryFolder}${query.queryLocation}`);
      return await fetchResult.text();
    }
    return query.queryString;
  }

}

const configManager = new ConfigManager();
export default configManager;
