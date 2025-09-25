import { QueryEngine } from "@comunica/query-sparql";
import { QueryEngine as QueryEngineLinkTraversal } from "query-sparql-link-traversal-solid-no-default-predicates";
import {
  getDefaultSession,
  fetch as authFetch,
} from "@inrupt/solid-client-authn-browser";
import { translateUrlToProxiedUrl } from '../lib/utils';

// LOG let wrappedFetchFunctionCounter = 0;

/**
 * A class wrapping the Comunica engines we need, used for all but login actions.
 */
class ComunicaEngineWrapper {

  _engine;
  _engineLinkTraversal;
  _fetchSuccess;
  _fetchStatusNumber;
  _underlyingFetchFunction;

  constructor() {
    this._engine = new QueryEngine();
    this._engineLinkTraversal = new QueryEngineLinkTraversal();
    this._fetchSuccess = {};
    this._fetchStatusNumber = {};
    this._underlyingFetchFunction = undefined;
  }

  /**
   * Resets the engines and all we maintained here about executed queries
   */
  async reset() {
    await this._engine.invalidateHttpCache();
    await this._engineLinkTraversal.invalidateHttpCache();
    this._fetchSuccess = {};
    this._fetchStatusNumber = {};
    this._underlyingFetchFunction = undefined;
    // LOG console.log(`Comunica engines reset`);
  }

  getFetchSuccess(arg) {
    return this._fetchSuccess[arg];
  }

  getFetchStatusNumber(arg) {
    return this._fetchStatusNumber[arg];
  }

  getUnderlyingFetchFunction() {
    return this._underlyingFetchFunction;
  }

  /**
  * Executes one generic SPARQL query with the default Comunica engine
  * 
  * Supports the following callback functions. Forward only the ones you need.
  * - "variables": will be called once with an array of variable names, in case of a SELECT query
  * - "bindings": will be called for every bindings combo, in case of a SELECT query
  * - "quads": will be called for every quad, in case of a CONSTRUCT query
  * - "boolean": will be called for the resulting boolean, in case of an ASK query
  * 
  * @param {string} queryText - the SPARQL query text
  * @param {object} context - the context to provide to the Comunica engine
  * @param {array} httpProxies - array of httpProxy definitions
  * @param {object} callbacks - an object containing the callback functions you specify
  * @returns {void} when the query has finished
  */
  async query(queryText, context, httpProxies, callbacks) {
    try {
      this._prepareQuery(context, httpProxies);
      let result = await this._engine.query(queryText, context);
      switch (result.resultType) {
        case 'bindings':
          const metadata = await result.metadata();
          const variables = metadata.variables.map((val) => {
            return val.value;
          });
          if (callbacks["variables"]) {
            callbacks["variables"](variables);
          }
          const bindingsStream = await result.execute();
          if (!bindingsStream.done) {
            await new Promise((resolve, reject) => {
              if (callbacks["bindings"]) {
                bindingsStream.on('data', (bindings) => {
                  // see https://comunica.dev/docs/query/advanced/bindings/
                  // LOG console.log(`query bindings: ${bindings.toString()}`);
                  callbacks["bindings"](bindings);
                });
              }
              bindingsStream.on('end', resolve);
              bindingsStream.on('error', reject);
            });
          }
          break;
        case 'quads':
          const quadStream = await result.execute();
          if (!quadStream.done) {
            await new Promise((resolve, reject) => {
              if (callbacks["quads"]) {
                quadStream.on('data', (quad) => {
                  // LOG console.log(`query quad: ${JSON.stringify(quad, null, 2)}`);
                  callbacks["quads"](quad);
                });
              }
              quadStream.on('end', resolve);
              quadStream.on('error', reject);
            });
          }
          break;
        case 'boolean':
          const answer = await result.execute();
          if (callbacks["boolean"]) {
            // LOG console.log(`query answer: ${answer}`);
            callbacks["boolean"](answer);
          }
          break;
        default:
          break;
      }
    } catch (error) {
      await this.reset();
      throw error;
    }
  }

  /**
  * Executes one SPARQL SELECT query with a Comunica engine
  * 
  * Supports the following options.
  * - engine: 
  *   - "default": use the default Comunica engine (this is the default anyway)
  *   - "link-traversal": use a Comunica query engine configured to discover datasources recursively
  * 
  * @param {string} queryText - the SPARQL SELECT query text
  * @param {object} context - the context to provide to the Comunica engine
  * @param {array} httpProxies - array of httpProxy definitions
  * @param {string} options.engine - "default": use the default Comunica engine (this is the default anyway)
  *                                - "link-traversal": use a Comunica query engine with link-traversal feature
  * @returns {Promise <BindingsStream>} Promise to the bindings stream
  */
  async queryBindings(queryText, context, httpProxies, options = {}) {
    let engine;
    switch (options.engine) {
      case "default":
      case undefined:  
        engine = this._engine;
        break;
      case "link-traversal":
        engine = this._engineLinkTraversal;
        break;
      default:
        throw new Error("Unsupported engine requested");
    }
    try {
      this._prepareQuery(context, httpProxies);
      return engine.queryBindings(queryText, context);
    } catch (error) {
      await this.reset();
      throw error;
    }
  }

  /**
   * Prepares a call to any engine's query function
   *
   * @param {object} context - the context that will be used
   * @param {array} httpProxies - array of httpProxy definitions
   */
  _prepareQuery(context, httpProxies) {
    // note: there is no need to preset this._fetchSuccess[source] here;
    // if Comunica caches, we still have the previous value
    if (getDefaultSession().info.isLoggedIn) {
      this._underlyingFetchFunction = authFetch;
      // LOG console.log(`Using authFetch as underlying fetch function`);
    } else {
      this._underlyingFetchFunction = fetch;
      // LOG console.log(`Using fetch as underlying fetch function`);
    }
    context.fetch = ComunicaEngineWrapper._getWrappedFetchFunction(this._underlyingFetchFunction, httpProxies, this);
  }

  /**
   * Returns a function that wraps the underlying fetch function and sets the fetch success information in member variables of _this.
   * 
   * @param underlyingFetchFunction - the underlying fetch function
   * @param {array} httpProxies - array of httpProxy definitions
   * @param {ComunicaEngineWrapper} _this - the calling ComunicaEngineWrapper object
   * @returns {Function} that function.
   */
  static _getWrappedFetchFunction(underlyingFetchFunction, httpProxies, _this) {
    const wrappedFetchFunction = async (arg) => {
      try {
        let actualUrl = translateUrlToProxiedUrl(arg, httpProxies);
        const response = await underlyingFetchFunction(actualUrl, {
          headers: {
            Accept: "application/n-quads,application/trig;q=0.9,text/turtle;q=0.8,application/n-triples;q=0.7,*/*;q=0.1"
          }
        });
        _this._fetchSuccess[arg] = response.ok;
        _this._fetchStatusNumber[arg] = response.status;
        // LOG console.log(`--- wrappedFetchFunction #${++wrappedFetchFunctionCounter}`);
        // LOG console.log(`arg: ${arg}`);
        // LOG console.log(`actualUrl: ${actualUrl}`);
        // LOG console.log(`response status: ${response.status}`);
        return response;
      }
      catch (error) {
        // LOG console.log(`--- wrappedFetchFunction #${++wrappedFetchFunctionCounter}`);
        // LOG console.log(error);
        _this._fetchSuccess[arg] = false;
        throw error;
      }
    }

    return wrappedFetchFunction;
  }
}

const comunicaEngineWrapper = new ComunicaEngineWrapper();
export default comunicaEngineWrapper;
